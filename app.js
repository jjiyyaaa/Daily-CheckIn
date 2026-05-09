/* =============================================
   DAILY CHECK-IN — app.js
   All interactivity, LocalStorage, Fetch API
   ============================================= */

// ── TODAY'S KEY (local timezone, bukan UTC) ──
function localDateKey(date) {
  const d = date || new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
const todayKey = () => localDateKey(new Date());

// ── LOAD / SAVE DATA ──
function loadData(key, fallback = {}) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}
function saveData(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

// ── NAVIGATION ──
const navItems = document.querySelectorAll(".nav-item[data-page]");
function navigate(pageId) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  navItems.forEach((n) => n.classList.remove("active"));
  const page = document.getElementById("page-" + pageId);
  const nav = document.getElementById("nav-" + pageId);
  if (page) page.classList.add("active");
  if (nav) nav.classList.add("active");
  closeSidebar();
  if (pageId === "dashboard") refreshDashboard();
  if (pageId === "productivity")
    (renderTasks(), renderHabits(), renderStudyLog());
  if (pageId === "spiritual") renderTilawah();
  if (pageId === "entertainment") renderMovies();
  if (pageId === "recap") renderRecap();
  if (pageId === "journal") loadJournal();
}
navItems.forEach((btn) =>
  btn.addEventListener("click", () => navigate(btn.dataset.page)),
);

// ── SIDEBAR MOBILE ──
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("sidebar-overlay");
document.getElementById("menu-btn").addEventListener("click", () => {
  sidebar.classList.toggle("open");
  overlay.classList.toggle("visible");
});
overlay.addEventListener("click", closeSidebar);
function closeSidebar() {
  sidebar.classList.remove("open");
  overlay.classList.remove("visible");
}

// ── DATE / GREETING ──
function initDate() {
  const now = new Date();
  const h = now.getHours();
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const dayStr = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  const greeting =
    h < 11
      ? "Good morning ☀️"
      : h < 15
        ? "Good afternoon 🌤️"
        : h < 18
          ? "Good evening 🌅"
          : "Good night 🌙";

  const greetEl = document.getElementById("greeting-text");
  const dateEl = document.getElementById("today-full-date");
  const sideEl = document.getElementById("sidebar-date");
  if (greetEl) greetEl.textContent = greeting + " bestie!";
  if (dateEl) dateEl.textContent = dayStr;
  if (sideEl) sideEl.textContent = dayStr;

  // Set default date for watch form
  const wd = document.getElementById("watch-date");
  if (wd) wd.value = todayKey();

  // Study day badge
  const badge = document.getElementById("study-day-badge");
  const dayNum = now.getDay();
  if (badge) {
    if (dayNum === 0 || dayNum === 6) {
      badge.textContent = "🏖️ Weekend — Rest day!";
      badge.style.cssText = "background:var(--peach-light);color:#A06040;";
    } else {
      badge.textContent = "📅 Weekday — Let's study!";
      badge.style.cssText = "background:var(--sky-light);color:#3A7A8A;";
    }
  }
}

// ── FETCH QUOTE (Fetch API — with AbortController & retry) ──
const FALLBACK_QUOTES = [
  { q: "Small steps every day lead to big changes. 🌸", a: "Daily Check-in" },
  { q: "You are doing better than you think. Keep going! 💕", a: "Daily Check-in" },
  { q: "Celebrate tiny wins — they add up to something great. ✨", a: "Daily Check-in" },
  { q: "Be gentle with yourself. Growth takes time. 🌱", a: "Daily Check-in" },
  { q: "Your only competition is who you were yesterday. 💫", a: "Daily Check-in" },
];

async function fetchWithTimeout(url, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

async function fetchQuote() {
  const qText = document.getElementById("quote-text");
  const qAuthor = document.getElementById("quote-author");
  const qCard = document.getElementById("quote-card");
  if (!qText) return;

  // Show shimmer loading state
  qText.innerHTML = `<span class="quote-loading">✨ Fetching your daily quote…</span>`;
  qAuthor.textContent = "";
  if (qCard) qCard.classList.add("quote-loading-state");

  // Try primary API
  try {
    const res = await fetchWithTimeout(
      "https://api.quotable.io/random?tags=inspirational|happiness|success&maxLength=120"
    );
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    qText.innerHTML = `"${data.content}"`;
    qAuthor.textContent = `— ${data.author}`;
    if (qCard) {
      qCard.classList.remove("quote-loading-state");
      qCard.classList.add("quote-loaded");
      // Cache today's quote
      saveData("dc_daily_quote_" + todayKey(), { content: data.content, author: data.author });
    }
    return;
  } catch { /* fall through to backup */ }

  // Try backup API
  try {
    const res = await fetchWithTimeout("https://dummyjson.com/quotes/random");
    if (!res.ok) throw new Error("Backup API error");
    const data = await res.json();
    qText.innerHTML = `"${data.quote}"`;
    qAuthor.textContent = `— ${data.author}`;
    if (qCard) qCard.classList.remove("quote-loading-state");
    return;
  } catch { /* fall through to cached or fallback */ }

  // Use cached today quote if available
  const cached = loadData("dc_daily_quote_" + todayKey(), null);
  if (cached && cached.content) {
    qText.innerHTML = `"${cached.content}"`;
    qAuthor.textContent = `— ${cached.author} (cached)`;
    if (qCard) qCard.classList.remove("quote-loading-state");
    return;
  }

  // Use local fallback
  const r = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
  qText.innerHTML = `"${r.q}"`;
  qAuthor.textContent = `— ${r.a}`;
  if (qCard) qCard.classList.remove("quote-loading-state");
}

// ── FETCH WEATHER/TIP WIDGET for Dashboard (Fetch API) ──
async function fetchDailyTip() {
  const tipEl = document.getElementById("dashboard-tip");
  if (!tipEl) return;
  try {
    const res = await fetchWithTimeout("https://api.adviceslip.com/advice");
    if (!res.ok) throw new Error();
    const data = await res.json();
    tipEl.innerHTML = `
      <div style="display:flex;align-items:flex-start;gap:12px;">
        <span style="font-size:1.4rem;flex-shrink:0;">💡</span>
        <div>
          <div style="font-size:0.75rem;font-weight:700;color:var(--text-light);letter-spacing:1px;margin-bottom:4px;">DAILY TIP</div>
          <p style="font-size:0.88rem;color:var(--text-mid);line-height:1.6;margin:0;font-style:italic;">"${data.slip.advice}"</p>
        </div>
      </div>`;
  } catch {
    tipEl.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;">
        <span>🌸</span>
        <p style="font-size:0.88rem;color:var(--text-mid);margin:0;font-style:italic;">"Take it one day at a time. You've got this!"</p>
      </div>`;
  }
}

// ── TOAST ──
function showToast(msg, type = "") {
  const icons = { success: "✅", error: "❌", "": "💕" };
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || "💕"}</span><span>${msg}</span>`;
  document.getElementById("toast-container").appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

// ══════════════════════════════════════════
// JOURNAL MODULE
// ══════════════════════════════════════════
let selectedMood = "";
let selectedVibe = "";

function selectMood(btn) {
  document
    .querySelectorAll(".mood-btn")
    .forEach((b) => b.classList.remove("selected"));
  btn.classList.add("selected");
  selectedMood = btn.dataset.mood;
  const label = document.getElementById("selected-mood-label");
  if (label) {
    label.textContent = btn.dataset.label;
    label.style.display = "inline-flex";
  }
  saveJournal();
  updateDashboardMood();
}

function selectVibe(btn) {
  document
    .querySelectorAll(".vibe-btn")
    .forEach((b) => b.classList.remove("selected"));
  btn.classList.add("selected");
  selectedVibe = btn.dataset.vibe;
  saveJournal();
}

function getJournalEntry() {
  const all = loadData("dc_journal", {});
  return all[todayKey()] || {};
}

function persistJournal(entry) {
  const all = loadData("dc_journal", {});
  all[todayKey()] = { ...entry, savedAt: new Date().toISOString() };
  saveData("dc_journal", all);
}

function saveJournal() {
  const today = getJournalEntry();
  persistJournal({
    ...today,
    mood: selectedMood,
    vibe: selectedVibe,
    lineNote: document.getElementById("aline-note-input")?.value || "",
    gratitude: document.getElementById("gratitude-input")?.value || "",
    brainDump: document.getElementById("braindump-input")?.value || "",
    affirmations: document.getElementById("affirmation-input")?.value || "",
    positiveActs: today.positiveActs || [],
    wishlist: today.wishlist || [],
    dailyTodo: today.dailyTodo || [],
  });
}

function loadJournal() {
  const today = getJournalEntry();
  selectedMood = "";
  selectedVibe = "";
  document
    .querySelectorAll(".mood-btn")
    .forEach((b) => b.classList.remove("selected"));
  document
    .querySelectorAll(".vibe-btn")
    .forEach((b) => b.classList.remove("selected"));
  if (today.mood) {
    const btn = document.querySelector(`.mood-btn[data-mood="${today.mood}"]`);
    if (btn) selectMood(btn);
  }
  if (today.vibe) {
    const btn = document.querySelector(`.vibe-btn[data-vibe="${today.vibe}"]`);
    if (btn) selectVibe(btn);
  }
  const g = document.getElementById("gratitude-input");
  const b = document.getElementById("braindump-input");
  if (g) g.value = today.gratitude || "";
  if (b) b.value = today.brainDump || "";
  const a = document.getElementById("affirmation-input");
  if (a) a.value = today.affirmations || "";
  const note = document.getElementById("aline-note-input");
  if (note) note.value = today.lineNote || "";
  renderJournalDailyTodo();
  renderJournalPositiveActs();
  renderJournalWishlist();
}

function renderJournalDailyTodo() {
  const list = document.getElementById("journal-todo-list");
  if (!list) return;
  const todos = getJournalEntry().dailyTodo || [];
  if (!todos.length) {
    list.innerHTML = `<div class="journal-empty">Belum ada tugas harian. Tambahkan tugas barumu di atas.</div>`;
    return;
  }
  list.innerHTML = todos
    .map(
      (item) => `
    <div class="journal-list-item">
      <button class="journal-item-check ${item.completed ? "checked" : ""}" onclick="toggleJournalTodo('${item.id}')">${item.completed ? "✓" : ""}</button>
      <span class="journal-item-text ${item.completed ? "completed" : ""}">${escHtml(item.text)}</span>
      <button class="journal-item-remove" onclick="event.stopPropagation(); deleteJournalTodo('${item.id}')">×</button>
    </div>
  `,
    )
    .join("");
}

function addJournalTodo() {
  const input = document.getElementById("journal-todo-input");
  const text = input.value.trim();
  if (!text) {
    showToast("Tulis dulu tugas harianmu! 😅", "error");
    return;
  }
  const today = getJournalEntry();
  const todos = today.dailyTodo || [];
  todos.unshift({ id: Date.now().toString(), text, completed: false });
  persistJournal({ ...today, dailyTodo: todos });
  input.value = "";
  renderJournalDailyTodo();
  showToast("Daily To-Do ditambahkan! ✅", "success");
}

function toggleJournalTodo(id) {
  const today = getJournalEntry();
  const todos = (today.dailyTodo || []).map((item) =>
    item.id === id ? { ...item, completed: !item.completed } : item,
  );
  persistJournal({ ...today, dailyTodo: todos });
  renderJournalDailyTodo();
}

function deleteJournalTodo(id) {
  const today = getJournalEntry();
  const todos = (today.dailyTodo || []).filter((item) => item.id !== id);
  persistJournal({ ...today, dailyTodo: todos });
  renderJournalDailyTodo();
}

function renderJournalPositiveActs() {
  const list = document.getElementById("positive-act-list");
  if (!list) return;
  const acts = getJournalEntry().positiveActs || [];
  if (!acts.length) {
    list.innerHTML = `<div class="journal-empty">Belum ada positive act hari ini.</div>`;
    return;
  }
  list.innerHTML = acts
    .map(
      (item) => `
    <div class="journal-list-item">
      <span class="journal-item-text">${escHtml(item.text)}</span>
      <button class="journal-item-remove" onclick="deletePositiveAct('${item.id}')">×</button>
    </div>
  `,
    )
    .join("");
}

function addPositiveAct() {
  const input = document.getElementById("positive-act-input");
  const text = input.value.trim();
  if (!text) {
    showToast("Tulis dulu Positive Act-nya! 😄", "error");
    return;
  }
  const today = getJournalEntry();
  const acts = today.positiveActs || [];
  acts.unshift({ id: Date.now().toString(), text });
  persistJournal({ ...today, positiveActs: acts });
  input.value = "";
  renderJournalPositiveActs();
  showToast("Positive Act dicatat! 🌟", "success");
}

function deletePositiveAct(id) {
  const today = getJournalEntry();
  const acts = (today.positiveActs || []).filter((item) => item.id !== id);
  persistJournal({ ...today, positiveActs: acts });
  renderJournalPositiveActs();
}

function renderJournalWishlist() {
  const list = document.getElementById("wishlist-list");
  if (!list) return;
  const items = getJournalEntry().wishlist || [];
  if (!items.length) {
    list.innerHTML = `<div class="journal-empty">Belum ada wishlist untuk hari ini.</div>`;
    return;
  }
  list.innerHTML = items
    .map(
      (item) => `
    <div class="journal-list-item">
      <button class="journal-item-check ${item.done ? "checked" : ""}" onclick="toggleWishlistItem('${item.id}')">${item.done ? "✓" : ""}</button>
      <span class="journal-item-text ${item.done ? "completed" : ""}">${escHtml(item.text)}</span>
      <button class="journal-item-remove" onclick="deleteWishlistItem('${item.id}')">×</button>
    </div>
  `,
    )
    .join("");
}

function addWishlistItem() {
  const input = document.getElementById("wishlist-input");
  const text = input.value.trim();
  if (!text) {
    showToast("Tulis dulu item wishlist-mu! 💫", "error");
    return;
  }
  const today = getJournalEntry();
  const items = today.wishlist || [];
  items.unshift({ id: Date.now().toString(), text, done: false });
  persistJournal({ ...today, wishlist: items });
  input.value = "";
  renderJournalWishlist();
  showToast("Wishlist ditambahkan! 🎁", "success");
}

function toggleWishlistItem(id) {
  const today = getJournalEntry();
  const items = (today.wishlist || []).map((item) =>
    item.id === id ? { ...item, done: !item.done } : item,
  );
  persistJournal({ ...today, wishlist: items });
  renderJournalWishlist();
}

function deleteWishlistItem(id) {
  const today = getJournalEntry();
  const items = (today.wishlist || []).filter((item) => item.id !== id);
  persistJournal({ ...today, wishlist: items });
  renderJournalWishlist();
}

// ══════════════════════════════════════════
// TASK TRACKER — Global store with deadline
// ══════════════════════════════════════════
function getAllTasks() {
  return loadData("dc_tasks", []);
}
function saveAllTasks(t) {
  saveData("dc_tasks", t);
}

// Helper: tasks to show = incomplete + completed today
function getVisibleTasks() {
  const all = getAllTasks();
  return all.filter((t) => !t.completed || t.completedDate === todayKey());
}

function addTask() {
  const input = document.getElementById("task-input");
  const text = input.value.trim();
  const deadline = document.getElementById("task-deadline")?.value || "";
  if (!text) {
    showToast("Tulis dulu tugasnya! 😅", "error");
    return;
  }
  const tasks = getAllTasks();
  tasks.unshift({
    id: Date.now().toString(),
    text,
    deadline,
    completed: false,
    createdDate: todayKey(),
  });
  saveAllTasks(tasks);
  input.value = "";
  if (document.getElementById("task-deadline"))
    document.getElementById("task-deadline").value = "";
  renderTasks();
  updateDashboardStats();
  showToast("Task ditambahkan! ✅", "success");
}

function toggleTask(id) {
  const tasks = getAllTasks();
  const t = tasks.find((t) => t.id === id);
  if (t) {
    t.completed = !t.completed;
    t.completedDate = t.completed ? todayKey() : "";
  }
  saveAllTasks(tasks);
  renderTasks();
  updateDashboardStats();
}

function deleteTask(id) {
  saveAllTasks(getAllTasks().filter((t) => t.id !== id));
  renderTasks();
  updateDashboardStats();
  showToast("Task dihapus 🗑️");
}

function getDeadlineBadge(deadline) {
  if (!deadline) return "";
  const now = new Date();
  const due = new Date(deadline); // datetime-local string
  const diffMs = due - now;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMs < 0) {
    const overMins = Math.abs(diffMins);
    const label =
      overMins < 60
        ? overMins + " mnt"
        : Math.abs(diffHrs) < 24
          ? Math.abs(diffHrs) + " jam"
          : Math.abs(diffDays) + " hari";
    return `<span class="task-deadline-badge deadline-overdue">⚠️ Terlambat ${label}</span>`;
  }
  if (diffMins < 60)
    return `<span class="task-deadline-badge deadline-today">⏰ ${diffMins} mnt lagi!</span>`;
  if (diffHrs < 24)
    return `<span class="task-deadline-badge deadline-today">⏰ ${diffHrs} jam lagi!</span>`;
  if (diffDays === 0)
    return `<span class="task-deadline-badge deadline-today">⏰ Hari Ini!</span>`;
  if (diffDays <= 2)
    return `<span class="task-deadline-badge deadline-soon">📅 ${diffDays} hari lagi</span>`;

  // Format display: "08 Mei 17:00"
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  const disp =
    due.getDate() +
    " " +
    months[due.getMonth()] +
    " " +
    String(due.getHours()).padStart(2, "0") +
    ":" +
    String(due.getMinutes()).padStart(2, "0");
  return `<span class="task-deadline-badge deadline-ok">📅 ${disp}</span>`;
}

function renderTasks() {
  const list = document.getElementById("task-list");
  if (!list) return;
  const tasks = getVisibleTasks();
  if (!tasks.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">✨</div><p>Belum ada tugas!<br/>Tambahkan tugas pertamamu.</p></div>`;
    return;
  }
  // Sort: incomplete first, then by deadline
  const sorted = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline);
    if (a.deadline) return -1;
    if (b.deadline) return 1;
    return 0;
  });
  list.innerHTML = sorted
    .map(
      (t) => `
    <div class="task-item ${t.completed ? "completed" : ""}" id="task-${t.id}">
      <button class="task-check ${t.completed ? "checked" : ""}" onclick="toggleTask('${t.id}')" title="Toggle selesai">
        ${t.completed ? "✓" : ""}
      </button>
      <span class="task-text">${escHtml(t.text)}</span>
      ${!t.completed ? getDeadlineBadge(t.deadline) : ""}
      <button class="task-del" onclick="deleteTask('${t.id}')" title="Hapus">🗑️</button>
    </div>`,
    )
    .join("");
}

// ══════════════════════════════════════════
// STUDY LOG
// ══════════════════════════════════════════
let studyType = "Hard Skill";
function selectStudyType(btn) {
  document
    .querySelectorAll(".type-pill")
    .forEach((p) => p.classList.remove("selected"));
  btn.classList.add("selected");
  studyType = btn.dataset.type;
}

function addStudyLog() {
  const subj = document.getElementById("study-subject")?.value.trim();
  const dur = parseInt(document.getElementById("study-duration")?.value || "0");
  if (!subj) {
    showToast("Isi dulu mata kuliah/skill-nya!", "error");
    return;
  }
  if (!dur) {
    showToast("Isi durasi belajarnya!", "error");
    return;
  }
  const logs = loadData("dc_study_" + todayKey(), []);
  logs.push({
    id: Date.now().toString(),
    subject: subj,
    type: studyType,
    duration: dur,
  });
  saveData("dc_study_" + todayKey(), logs);
  document.getElementById("study-subject").value = "";
  document.getElementById("study-duration").value = "";
  renderStudyLog();
  showToast(`${subj} (${dur} mnt) dicatat! 📚`, "success");
}

function deleteStudyLog(id) {
  const logs = loadData("dc_study_" + todayKey(), []).filter(
    (l) => l.id !== id,
  );
  saveData("dc_study_" + todayKey(), logs);
  renderStudyLog();
}

function renderStudyLog() {
  const list = document.getElementById("study-list");
  if (!list) return;
  const logs = loadData("dc_study_" + todayKey(), []);
  if (!logs.length) {
    list.innerHTML = `<div class="empty-state" style="padding:20px 0"><div class="empty-icon" style="font-size:2rem">📖</div><p>Belum ada log belajar hari ini.</p></div>`;
    return;
  }
  const typeColors = {
    "Hard Skill": "var(--coral-light)",
    "Soft Skill": "var(--mint-light)",
    Matkul: "var(--sky-light)",
  };
  list.innerHTML = logs
    .map(
      (l) => `
    <div class="study-item">
      <div class="study-item-info">
        <div class="study-item-name">${escHtml(l.subject)}</div>
        <div class="study-item-meta">
          <span style="background:${typeColors[l.type] || "var(--gray-100)"};padding:2px 8px;border-radius:100px;font-size:0.72rem;font-weight:600">${l.type}</span>
          &nbsp;· ${l.duration} menit
        </div>
      </div>
      <button class="study-del" onclick="deleteStudyLog('${l.id}')" title="Hapus">🗑️</button>
    </div>`,
    )
    .join("");
}

// ══════════════════════════════════════════
// HABIT TRACKER
// ══════════════════════════════════════════
function getHabitDefs() {
  return loadData("dc_habit_defs", []);
}
function getTodayHabits() {
  return loadData("dc_habits_" + todayKey(), {});
}

function addHabit() {
  const input = document.getElementById("habit-name-input");
  const name = input.value.trim();
  if (!name) {
    showToast("Tulis nama habit dulu!", "error");
    return;
  }
  const defs = getHabitDefs();
  if (defs.find((d) => d.name.toLowerCase() === name.toLowerCase())) {
    showToast("Habit sudah ada!", "error");
    return;
  }
  defs.push({ id: Date.now().toString(), name });
  saveData("dc_habit_defs", defs);
  input.value = "";
  renderHabits();
  showToast("Habit ditambahkan! 💪", "success");
}

function toggleHabit(id) {
  const habits = getTodayHabits();
  habits[id] = !habits[id];
  saveData("dc_habits_" + todayKey(), habits);
  renderHabits();
  renderDashboardHabits();
}

function deleteHabit(id) {
  const defs = getHabitDefs().filter((d) => d.id !== id);
  saveData("dc_habit_defs", defs);
  const habits = getTodayHabits();
  delete habits[id];
  saveData("dc_habits_" + todayKey(), habits);
  renderHabits();
  renderDashboardHabits();
  showToast("Habit dihapus 🗑️");
}

function renderHabits() {
  const list = document.getElementById("habit-list");
  if (!list) return;
  const defs = getHabitDefs();
  const habits = getTodayHabits();
  if (!defs.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">🌱</div><p>Belum ada habit. Tambahkan kebiasaan baik kamu!</p></div>`;
    return;
  }
  list.innerHTML = defs
    .map(
      (d) => `
    <div class="habit-item" onclick="toggleHabit('${d.id}')">
      <div class="habit-check ${habits[d.id] ? "checked" : ""}">${habits[d.id] ? "✓" : ""}</div>
      <span class="habit-name">${escHtml(d.name)}</span>
      <button class="habit-del" onclick="event.stopPropagation();deleteHabit('${d.id}')" title="Hapus">🗑️</button>
    </div>`,
    )
    .join("");
}

function renderDashboardHabits() {
  const el = document.getElementById("dashboard-habits");
  if (!el) return;
  const defs = getHabitDefs();
  const habits = getTodayHabits();
  if (!defs.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">🌱</div><p>No habits added yet. Go to Productivity!</p></div>`;
    return;
  }
  const done = defs.filter((d) => habits[d.id]).length;
  el.innerHTML = `
    <div class="flex-between mb-16">
      <span style="font-size:0.9rem;font-weight:600;color:var(--text-mid)">${done}/${defs.length} habits completed today</span>
      <span style="font-size:0.85rem;color:var(--text-light)">${Math.round((done / defs.length) * 100)}%</span>
    </div>
    <div class="progress-bar mb-16">
      <div class="progress-fill" style="width:${(done / defs.length) * 100}%;background:linear-gradient(90deg,var(--yellow),var(--peach))"></div>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:8px">
      ${defs.map((d) => `<span style="padding:5px 14px;border-radius:100px;font-size:0.8rem;font-weight:600;background:${habits[d.id] ? "var(--mint-light)" : "var(--gray-100)"};color:${habits[d.id] ? "#3A8A6A" : "var(--text-light)"}">${habits[d.id] ? "✓" : ""} ${escHtml(d.name)}</span>`).join("")}
    </div>`;
}

// ══════════════════════════════════════════
// SPIRITUAL — TILAWAH
// ══════════════════════════════════════════
function updateTilawahRing() {
  const pages = parseInt(
    document.getElementById("tilawah-pages")?.value || "0",
  );
  const target = 5;
  const pct = Math.min(pages / target, 1);
  const circ = 301.6;
  const fill = document.getElementById("ring-fill");
  const val = document.getElementById("ring-val");
  const status = document.getElementById("tilawah-status");
  if (!fill) return;
  fill.style.strokeDashoffset = circ - pct * circ;
  if (pages === 0) {
    fill.style.stroke = "#FFBCB0";
    if (status) {
      status.style.background = "var(--coral-light)";
      status.style.color = "#A05040";
      status.textContent = "✗ Belum tilawah hari ini";
    }
  } else if (pages >= target) {
    fill.style.stroke = "var(--mint)";
    if (status) {
      status.style.background = "var(--mint-light)";
      status.style.color = "#3A8A6A";
      status.textContent = `✓ Target tercapai! (${pages} lembar)`;
    }
  } else {
    fill.style.stroke = "var(--yellow)";
    if (status) {
      status.style.background = "var(--yellow-light)";
      status.style.color = "#A08040";
      status.textContent = `○ ${pages} lembar — belum target`;
    }
  }
  if (val) val.textContent = pages;
}

function saveTilawah() {
  const pages = parseInt(
    document.getElementById("tilawah-pages")?.value || "0",
  );
  if (!pages) {
    showToast("Isi dulu jumlah lembar!", "error");
    return;
  }
  const logs = loadData("dc_tilawah", []);
  logs.unshift({
    id: Date.now().toString(),
    date: todayKey(),
    pages,
    surah: document.getElementById("tilawah-surah")?.value || "",
    ayat: document.getElementById("tilawah-ayat")?.value || "",
    juz: document.getElementById("tilawah-juz")?.value || "",
    notes: document.getElementById("tilawah-notes")?.value || "",
  });
  saveData("dc_tilawah", logs.slice(0, 50));
  renderTilawah();
  updateDashboardStats();
  showToast(`Tilawah ${pages} lembar dicatat! 🌿`, "success");
}

function renderTilawah() {
  const list = document.getElementById("tilawah-log-list");
  if (!list) return;
  const logs = loadData("dc_tilawah", []);
  const today = loadData("dc_tilawah", []).find((l) => l.date === todayKey());
  if (today) {
    document.getElementById("tilawah-pages").value = today.pages;
    document.getElementById("tilawah-surah").value = today.surah;
    document.getElementById("tilawah-ayat").value = today.ayat;
    document.getElementById("tilawah-juz").value = today.juz;
    document.getElementById("tilawah-notes").value = today.notes;
    updateTilawahRing();
  }
  if (!logs.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">🌿</div><p>Belum ada catatan tilawah.</p></div>`;
    return;
  }
  list.innerHTML = logs
    .slice(0, 7)
    .map(
      (l) => `
    <div style="padding:12px 16px;background:var(--mint-light);border-radius:var(--radius-sm);margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
        <span style="font-weight:700;font-size:0.9rem">${l.surah || "Tilawah"} ${l.ayat ? "(" + l.ayat + ")" : ""}</span>
        <span style="font-size:0.75rem;background:${l.pages >= 5 ? "var(--mint)" : "var(--yellow)"};padding:2px 10px;border-radius:100px;font-weight:600">${l.pages} lbr</span>
      </div>
      <div style="font-size:0.78rem;color:var(--text-mid)">${l.date} · Juz ${l.juz || "?"}</div>
      ${l.notes ? `<div style="font-size:0.8rem;color:var(--text-mid);margin-top:6px;font-style:italic">"${escHtml(l.notes)}"</div>` : ""}
    </div>`,
    )
    .join("");
}

// ══════════════════════════════════════════
// ENTERTAINMENT — WATCH LIST
// ══════════════════════════════════════════
function addMovie() {
  const title = document.getElementById("watch-title")?.value.trim();
  const date = document.getElementById("watch-date")?.value;
  const location = document.getElementById("watch-location")?.value.trim();
  const companion = document.getElementById("watch-companion")?.value.trim();
  const rating =
    document.querySelector('input[name="rating"]:checked')?.value || "3";
  if (!title) {
    showToast("Isi judul filmnya!", "error");
    return;
  }
  const movies = loadData("dc_movies", []);
  movies.unshift({
    id: Date.now().toString(),
    title,
    date,
    location,
    companion,
    rating: parseInt(rating),
  });
  saveData("dc_movies", movies);
  document.getElementById("watch-title").value = "";
  document.getElementById("watch-location").value = "";
  document.getElementById("watch-companion").value = "";
  renderMovies();
  updateDashboardStats();
  showToast(`"${title}" ditambahkan! 🎬`, "success");
}

function deleteMovie(id) {
  saveData(
    "dc_movies",
    loadData("dc_movies", []).filter((m) => m.id !== id),
  );
  renderMovies();
  updateDashboardStats();
}

function renderMovies() {
  const grid = document.getElementById("watch-grid");
  const count = document.getElementById("watch-count");
  if (!grid) return;
  const movies = loadData("dc_movies", []);
  if (count)
    count.textContent =
      movies.length + " film" + (movies.length !== 1 ? "s" : "");
  if (!movies.length) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">🎥</div><p>Belum ada film yang dicatat!</p></div>`;
    return;
  }
  grid.innerHTML = movies
    .map(
      (m) => `
    <div class="watch-item">
      <button class="watch-del" onclick="deleteMovie('${m.id}')" title="Hapus">🗑️</button>
      <div class="watch-title">${escHtml(m.title)}</div>
      <div class="watch-stars">${"★".repeat(m.rating)}${"☆".repeat(5 - m.rating)}</div>
      <div class="watch-meta">
        📅 ${m.date || "—"}<br/>
        📍 ${m.location || "—"}<br/>
        👥 ${m.companion || "—"}
      </div>
    </div>`,
    )
    .join("");
}

// ══════════════════════════════════════════
// RECAP & ANALYTICS
// ══════════════════════════════════════════
let recapPeriod = "week";
function switchPeriod(btn) {
  document
    .querySelectorAll(".period-tab")
    .forEach((t) => t.classList.remove("active"));
  btn.classList.add("active");
  recapPeriod = btn.dataset.period;
  renderRecap();
}

function getDateRange(period) {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59);
  const start = new Date(now);
  if (period === "week") start.setDate(now.getDate() - 6);
  if (period === "month") start.setDate(now.getDate() - 29);
  if (period === "year") start.setFullYear(now.getFullYear() - 1);
  start.setHours(0, 0, 0);
  return { start, end };
}

function inRange(dateStr, range) {
  const d = new Date(dateStr);
  return d >= range.start && d <= range.end;
}

function renderRecap() {
  const range = getDateRange(recapPeriod);
  const journals = loadData("dc_journal", {});
  const movies = loadData("dc_movies", []);
  const tilawah = loadData("dc_tilawah", []);
  const habitDefs = getHabitDefs();

  // Tasks
  let totalTasks = 0,
    doneTasks = 0;
  Object.keys(localStorage)
    .filter((k) => k.startsWith("dc_tasks_"))
    .forEach((k) => {
      const date = k.replace("dc_tasks_", "");
      if (inRange(date, range)) {
        const tasks = loadData(k, []);
        totalTasks += tasks.length;
        doneTasks += tasks.filter((t) => t.completed).length;
      }
    });

  // Tilawah
  const tilawahInRange = tilawah.filter((l) => inRange(l.date, range));
  const totalTilawah = tilawahInRange.reduce((s, l) => s + l.pages, 0);

  // Movies
  const moviesInRange = movies.filter((m) =>
    inRange(m.date || todayKey(), range),
  ).length;

  // Study
  let totalStudy = 0;
  Object.keys(localStorage)
    .filter((k) => k.startsWith("dc_study_"))
    .forEach((k) => {
      const date = k.replace("dc_study_", "");
      if (inRange(date, range)) {
        loadData(k, []).forEach((l) => (totalStudy += l.duration));
      }
    });

  // Habits
  let habitChecks = 0,
    habitPossible = 0;
  const habitData = {};
  Object.keys(localStorage)
    .filter((k) => k.startsWith("dc_habits_"))
    .forEach((k) => {
      const date = k.replace("dc_habits_", "");
      if (inRange(date, range)) {
        const h = loadData(k, {});
        habitData[date] = h;
        habitDefs.forEach((d) => {
          habitPossible++;
          if (h[d.id]) habitChecks++;
        });
      }
    });
  const habitRate =
    habitPossible > 0 ? Math.round((habitChecks / habitPossible) * 100) : 0;

  // Mood counts
  const moodCounts = {};
  Object.entries(journals).forEach(([date, j]) => {
    if (inRange(date, range) && j.mood)
      moodCounts[j.mood] = (moodCounts[j.mood] || 0) + 1;
  });
  const moodEmojis = {
    happy: "😊",
    loved: "🥰",
    calm: "😌",
    anxious: "😰",
    sad: "😢",
    angry: "😤",
    tired: "😴",
    excited: "🤩",
    flat: "😐",
  };
  const dominantMood = Object.entries(moodCounts).sort(
    (a, b) => b[1] - a[1],
  )[0];
  const moodDisplay = dominantMood
    ? moodEmojis[dominantMood[0]] || dominantMood[0]
    : "—";

  // Update basic recap stats
  document.getElementById("recap-tasks").textContent =
    `${doneTasks}/${totalTasks}`;
  document.getElementById("recap-tilawah").textContent = totalTilawah + " lbr";
  document.getElementById("recap-movies").textContent = moviesInRange;
  document.getElementById("recap-study").textContent = totalStudy + " mnt";
  document.getElementById("recap-habits").textContent = habitRate + "%";
  document.getElementById("recap-mood").textContent = moodDisplay;

  const todayRangeDates = [];
  const cloneDate = new Date(range.start);
  while (cloneDate <= range.end) {
    todayRangeDates.push(new Date(cloneDate));
    cloneDate.setDate(cloneDate.getDate() + 1);
  }
  const recentDates = todayRangeDates.slice(-31);

  // Render mood wheel
  const colors = {
    happy: "#FFF4B8",
    loved: "#FFD6E0",
    calm: "#D4F5EB",
    anxious: "#FFE5D0",
    sad: "#D6F0F5",
    angry: "#FFD9D3",
    tired: "#E4DCFF",
    excited: "#FFE4A8",
    flat: "#F3E7FF",
  };
  const wheel = document.getElementById("mood-wheel");
  const legend = document.getElementById("mood-wheel-legend");
  if (wheel) {
    if (Object.keys(moodCounts).length) {
      let start = 0;
      const totalMood = Object.values(moodCounts).reduce(
        (sum, v) => sum + v,
        0,
      );
      const segments = Object.entries(moodCounts)
        .map(([mood, count]) => {
          const deg = Math.round((count / totalMood) * 360);
          const segment = `${colors[mood] || "#F3E7FF"} ${start}deg ${start + deg}deg`;
          start += deg;
          return segment;
        })
        .join(", ");
      wheel.style.background = `conic-gradient(${segments})`;
      document.getElementById("mood-wheel-count").textContent = totalMood;
    } else {
      wheel.style.background = "var(--soft-white)";
      document.getElementById("mood-wheel-count").textContent = "0";
    }
  }
  if (legend) {
    if (Object.keys(moodCounts).length) {
      legend.innerHTML = Object.entries(moodCounts)
        .map(
          ([mood, count]) => `
        <div class="mood-legend-item">
          <span class="mood-legend-dot" style="background:${colors[mood] || "#F3E7FF"}"></span>
          <span>${moodEmojis[mood] || mood} · ${count}</span>
        </div>
      `,
        )
        .join("");
    } else {
      legend.innerHTML =
        '<div class="mood-legend-item">Belum ada mood tercatat untuk periode ini.</div>';
    }
  }

  // Render tilawah pixel grid
  const pixelGrid = document.getElementById("tilawah-pixel-grid");
  if (pixelGrid) {
    pixelGrid.innerHTML = recentDates
      .map((d) => {
        const key = localDateKey(d);
        const entry = tilawah.find((l) => l.date === key) || { pages: 0 };
        const level = Math.min(entry.pages, 5);
        const label = entry.pages ? `${entry.pages} lbr` : "0";
        return `<div class="pixel-cell tilawah-${level}" title="${key} — ${label}">${entry.pages ? label : ""}</div>`;
      })
      .join("");
  }

  // Render habit grid
  const habitGrid = document.getElementById("habit-grid");
  if (habitGrid) {
    if (!habitDefs.length) {
      habitGrid.innerHTML = `<div class="journal-empty">Belum ada habit. Tambahkan habit di halaman Productivity dulu.</div>`;
    } else {
      const dateKeys = recentDates.map((d) => localDateKey(d));
      const headerCells = dateKeys
        .map((d) => `<th>${parseInt(d.slice(8, 10))}</th>`)
        .join("");
      const rows = habitDefs
        .map((def) => {
          const cells = dateKeys
            .map((date) => {
              const active = habitData[date]?.[def.id];
              return `<td class="habit-cell ${active ? "active" : ""}" title="${date}${active ? " ✓" : ""}"></td>`;
            })
            .join("");
          return `<tr><td>${escHtml(def.name)}</td>${cells}</tr>`;
        })
        .join("");
      habitGrid.innerHTML = `
        <table class="habit-table">
          <thead><tr><th>Habit</th>${headerCells}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      `;
    }
  }

  // ── GRATITUDE TIMELINE ──
  const gratitudeList = document.getElementById("recap-gratitude-list");
  const gratitudeBadge = document.getElementById("gratitude-count-badge");
  if (gratitudeList) {
    const entries = Object.entries(journals)
      .filter(([date, j]) => inRange(date, range) && j.gratitude && j.gratitude.trim())
      .sort((a, b) => b[0].localeCompare(a[0]));
    if (gratitudeBadge) gratitudeBadge.textContent = entries.length + " entri";
    if (!entries.length) {
      gratitudeList.innerHTML = `<div class="journal-empty">Belum ada gratitude yang tercatat dalam periode ini 🙏</div>`;
    } else {
      gratitudeList.innerHTML = entries.map(([date, j]) => `
        <div class="recap-gratitude-item">
          <div class="recap-gratitude-date">${formatDisplayDate(date)}</div>
          <div class="recap-gratitude-text">${escHtml(j.gratitude)}</div>
        </div>`).join("");
    }
  }

  // ── BRAIN DUMP STICKY WALL ──
  const dumpWall = document.getElementById("recap-braindump-wall");
  const dumpBadge = document.getElementById("braindump-count-badge");
  if (dumpWall) {
    const entries = Object.entries(journals)
      .filter(([date, j]) => inRange(date, range) && j.brainDump && j.brainDump.trim())
      .sort((a, b) => b[0].localeCompare(a[0]));
    if (dumpBadge) dumpBadge.textContent = entries.length + " ide";
    const rotations = [-2.5, 1.8, -1.2, 2.1, -0.8, 1.5, -2.0, 0.9];
    const colors = [0, 1, 2, 3, 4, 5];
    if (!entries.length) {
      dumpWall.innerHTML = `<div class="journal-empty">Belum ada Brain Dump tercatat dalam periode ini 🧠</div>`;
    } else {
      dumpWall.innerHTML = entries.map(([date, j], i) => {
        const rot = rotations[i % rotations.length];
        const color = colors[i % colors.length];
        return `<div class="recap-sticky-note sticky-color-${color}" style="--rot:${rot}deg">
          <div class="recap-sticky-date">${formatDisplayDate(date)}</div>
          ${escHtml(j.brainDump)}
        </div>`;
      }).join("");
    }
  }

  // ── POSITIVE ACTS BADGE TICKER ──
  const actsTicker = document.getElementById("recap-positive-acts");
  const actsBadge = document.getElementById("positive-count-badge");
  if (actsTicker) {
    const allActs = [];
    Object.entries(journals)
      .filter(([date, j]) => inRange(date, range) && Array.isArray(j.positiveActs) && j.positiveActs.length)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .forEach(([date, j]) => j.positiveActs.forEach(act => allActs.push({ text: act.text, date })));
    if (actsBadge) actsBadge.textContent = allActs.length + " aksi";
    if (!allActs.length) {
      actsTicker.innerHTML = `<div class="journal-empty">Belum ada Positive Act tercatat dalam periode ini 🌟</div>`;
    } else {
      actsTicker.innerHTML = allActs.map(act => `
        <div class="recap-act-badge">
          ⭐ ${escHtml(act.text)}
          <span class="recap-act-date">${act.date.slice(5)}</span>
        </div>`).join("");
    }
  }

  // ── WISHLIST PROGRESS GALLERY ──
  const wishGallery = document.getElementById("recap-wishlist-gallery");
  const wishBadge = document.getElementById("wishlist-count-badge");
  if (wishGallery) {
    const allWishes = [];
    Object.entries(journals)
      .filter(([date, j]) => inRange(date, range) && Array.isArray(j.wishlist) && j.wishlist.length)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .forEach(([date, j]) => j.wishlist.forEach(w => allWishes.push({ ...w, date })));
    if (wishBadge) wishBadge.textContent = allWishes.length + " item";
    if (!allWishes.length) {
      wishGallery.innerHTML = `<div class="journal-empty">Belum ada Wishlist tercatat dalam periode ini 🎁</div>`;
    } else {
      wishGallery.innerHTML = allWishes.map(w => `
        <div class="recap-wishlist-card ${w.done ? 'done-wish' : 'pending-wish'}">
          <div class="wish-status-badge ${w.done ? 'done' : 'pending'}">${w.done ? '✓ Tercapai' : '○ Belum'}</div>
          <div class="wish-item-text">${escHtml(w.text)}</div>
          <div class="wish-item-date">📅 ${w.date}</div>
        </div>`).join("");
    }
  }

  // ── AFFIRMATION ROTATOR ──
  const affEntries = Object.entries(journals)
    .filter(([date, j]) => inRange(date, range) && j.affirmations && j.affirmations.trim())
    .sort((a, b) => b[0].localeCompare(a[0]));
  affirmationPool = affEntries;
  affirmationIndex = 0;
  renderAffirmationSlide();

  // ── TO-DO DAILY SUMMARY ──
  const todoSummary = document.getElementById("recap-todo-summary");
  const todoBadge = document.getElementById("todo-count-badge");
  if (todoSummary) {
    const dayEntries = Object.entries(journals)
      .filter(([date, j]) => inRange(date, range) && Array.isArray(j.dailyTodo) && j.dailyTodo.length)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 14);
    if (todoBadge) todoBadge.textContent = dayEntries.length + " hari";
    if (!dayEntries.length) {
      todoSummary.innerHTML = `<div class="journal-empty">Belum ada Daily To-Do tercatat dalam periode ini 📋</div>`;
    } else {
      todoSummary.innerHTML = dayEntries.map(([date, j]) => {
        const total = j.dailyTodo.length;
        const done = j.dailyTodo.filter(t => t.completed).length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        const barColor = pct === 100 ? "linear-gradient(90deg,var(--mint),#5de0a8)"
          : pct >= 50 ? "linear-gradient(90deg,var(--yellow),var(--peach))"
            : "linear-gradient(90deg,var(--coral-light),var(--peach))";
        const chips = j.dailyTodo.slice(0, 6).map(t =>
          `<span class="recap-todo-chip ${t.completed ? 'chip-done' : 'chip-pending'}">${t.completed ? '✓' : '○'} ${escHtml(t.text)}</span>`
        ).join("") + (j.dailyTodo.length > 6 ? `<span class="recap-todo-chip chip-pending">+${j.dailyTodo.length - 6} lagi</span>` : "");
        return `
          <div class="recap-todo-day">
            <div class="recap-todo-date-col">${formatDisplayDate(date)}</div>
            <div class="recap-todo-bar-wrap"><div class="recap-todo-bar-fill" style="width:${pct}%;background:${barColor}"></div></div>
            <div class="recap-todo-stats-col">${done}/${total}</div>
            <div class="recap-todo-items-mini">${chips}</div>
          </div>`;
      }).join("");
    }
  }

  // Render A Line a Day recap
  const alineList = document.getElementById("aline-day-list");
  if (alineList) {
    const entries = Object.entries(journals)
      .filter(([date, j]) => inRange(date, range) && j.vibe)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 10);
    if (!entries.length) {
      alineList.innerHTML = `<div class="journal-empty">Belum ada A Line a Day yang tercatat dalam periode ini.</div>`;
    } else {
      alineList.innerHTML = entries
        .map(([date, j]) => {
          const vibeClass = `vibe-${j.vibe.replace(/\s+/g, "")}`;
          return `
          <div class="aline-card ${vibeClass}">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
              <strong>${j.vibe}</strong>
              <span style="font-size:0.78rem;color:var(--text-mid)">${date}</span>
            </div>
            <p style="margin:10px 0 0;color:var(--text-dark)">${escHtml(j.lineNote || "Tidak ada catatan.")}</p>
          </div>
        `;
        })
        .join("");
    }
  }

  // Load reflection
  const ref = loadData("dc_reflection_" + recapPeriod, { text: "" });
  document.getElementById("reflection-text").value = ref.text || "";
}

function saveReflection() {
  const text = document.getElementById("reflection-text")?.value || "";
  saveData("dc_reflection_" + recapPeriod, {
    text,
    savedAt: new Date().toISOString(),
  });
  showToast("Refleksi disimpan! 💌", "success");
}

// ── AFFIRMATION ROTATOR STATE & HELPERS ──
let affirmationPool = [];
let affirmationIndex = 0;

function renderAffirmationSlide() {
  const display = document.getElementById("recap-affirmation-display");
  const counter = document.getElementById("aff-counter");
  if (!display) return;
  if (!affirmationPool.length) {
    display.innerHTML = `<div class="recap-aff-empty">Belum ada Words of Affirmation tercatat dalam periode ini 💌</div>`;
    if (counter) counter.textContent = "0/0";
    return;
  }
  const [date, j] = affirmationPool[affirmationIndex];
  if (counter) counter.textContent = `${affirmationIndex + 1}/${affirmationPool.length}`;
  const dots = affirmationPool.map((_, i) =>
    `<div class="recap-aff-dot ${i === affirmationIndex ? 'active' : ''}" onclick="goAffirmation(${i})"></div>`
  ).join("");
  display.innerHTML = `
    <div class="recap-aff-quote-mark">"</div>
    <div class="recap-aff-text">${escHtml(j.affirmations)}</div>
    <div class="recap-aff-date">📅 ${formatDisplayDate(date)}</div>
    <div class="recap-aff-dots">${dots}</div>`;
}
function nextAffirmation() {
  if (!affirmationPool.length) return;
  affirmationIndex = (affirmationIndex + 1) % affirmationPool.length;
  renderAffirmationSlide();
}
function prevAffirmation() {
  if (!affirmationPool.length) return;
  affirmationIndex = (affirmationIndex - 1 + affirmationPool.length) % affirmationPool.length;
  renderAffirmationSlide();
}
function goAffirmation(i) {
  affirmationIndex = i;
  renderAffirmationSlide();
}
// ── HELPER: format date for display ──
function formatDisplayDate(dateStr) {
  const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const d = new Date(dateStr + "T00:00:00");
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
}

// ══════════════════════════════════════════
// BROWSER NOTIFICATIONS
// ══════════════════════════════════════════
function requestNotifPermission() {
  if (!("Notification" in window)) {
    showToast("Browser ini tidak mendukung notifikasi.", "error");
    return;
  }
  Notification.requestPermission().then((perm) => {
    const btn = document.getElementById("notif-btn");
    if (perm === "granted") {
      showToast("Notifikasi diaktifkan! 🔔", "success");
      if (btn) btn.textContent = "🔔 Aktif";
      if (btn) btn.style.color = "var(--mint)";
      checkDeadlineNotifications();
    } else {
      showToast("Notifikasi ditolak 😢", "error");
    }
  });
}

function checkDeadlineNotifications() {
  if (!("Notification" in window) || Notification.permission !== "granted")
    return;
  const tasks = getAllTasks();
  const today = todayKey();
  const dueTasks = tasks.filter((t) => !t.completed && t.deadline === today);
  if (!dueTasks.length) return;
  // Throttle: only notify once per day per task
  const notifKey = "dc_notified_" + today;
  const notified = loadData(notifKey, []);
  dueTasks.forEach((t) => {
    if (!notified.includes(t.id)) {
      new Notification("⏰ Tenggat Task Hari Ini!", {
        body: `"${t.text}" harus diselesaikan hari ini!`,
        tag: t.id,
      });
      notified.push(t.id);
    }
  });
  saveData(notifKey, notified);
}

function updateNotifBtnState() {
  const btn = document.getElementById("notif-btn");
  if (!btn) return;
  if (!("Notification" in window)) {
    btn.style.display = "none";
    return;
  }
  if (Notification.permission === "granted") {
    btn.textContent = "🔔 Aktif";
    btn.style.color = "var(--mint)";
  } else if (Notification.permission === "denied") {
    btn.textContent = "🔕 Ditolak";
    btn.style.opacity = "0.5";
  }
}

// ══════════════════════════════════════════
// DASHBOARD REFRESH
// ══════════════════════════════════════════
function updateDashboardStats() {
  const tasks = getVisibleTasks();
  const done = tasks.filter((t) => t.completed).length;
  const statTasks = document.getElementById("stat-tasks");
  if (statTasks) statTasks.textContent = `${done}/${tasks.length}`;

  const movies = loadData("dc_movies", []);
  const statMovies = document.getElementById("stat-movies");
  if (statMovies) statMovies.textContent = movies.length;

  const tilawah = loadData("dc_tilawah", []).find((l) => l.date === todayKey());
  const statTil = document.getElementById("stat-tilawah");
  if (statTil) statTil.textContent = (tilawah?.pages || 0) + " lbr";
}

function updateDashboardMood() {
  const moodEmojis = {
    happy: "😊",
    loved: "🥰",
    calm: "😌",
    anxious: "😰",
    sad: "😢",
    angry: "😤",
    tired: "😴",
    excited: "🤩",
  };
  const statMood = document.getElementById("stat-mood");
  if (statMood) statMood.textContent = moodEmojis[selectedMood] || "—";
}

function refreshDashboard() {
  updateDashboardStats();
  renderDashboardHabits();
  updateNotifBtnState();
  checkDeadlineNotifications();
  const journals = loadData("dc_journal", {});
  const today = journals[todayKey()];
  if (today?.mood) {
    const moodEmojis = {
      happy: "😊",
      loved: "🥰",
      calm: "😌",
      anxious: "😰",
      sad: "😢",
      angry: "😤",
      tired: "😴",
      excited: "🤩",
    };
    const statMood = document.getElementById("stat-mood");
    if (statMood) statMood.textContent = moodEmojis[today.mood] || "—";
    selectedMood = today.mood;
  }
}

// ── HELPER ──
function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ══════════════════════════════════════════
// INIT
// ══════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  initDate();
  fetchQuote();
  fetchDailyTip();
  refreshDashboard();
  initUserInfo();
});

// ══════════════════════════════════════════
// AUTH — Session & User
// ══════════════════════════════════════════
function getSession() {
  try {
    const s =
      sessionStorage.getItem("dc_session") ||
      localStorage.getItem("dc_session");
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

function handleLogout() {
  if (!confirm("Yakin mau logout? 👋")) return;
  sessionStorage.removeItem("dc_session");
  localStorage.removeItem("dc_session");
  window.location.replace("login.html");
}

function initUserInfo() {
  const session = getSession();
  if (!session) {
    window.location.replace("login.html");
    return;
  }
  const nameEl = document.getElementById("sidebar-user-name");
  if (nameEl) nameEl.textContent = session.name || session.username;
  // Personalize greeting
  const greetEl = document.getElementById("greeting-text");
  if (greetEl) {
    const h = new Date().getHours();
    const g =
      h < 11
        ? "Good morning"
        : h < 15
          ? "Good afternoon"
          : h < 18
            ? "Good evening"
            : "Good night";
    greetEl.textContent = `${g}, ${session.name || session.username}! ${h < 11 ? "☀️" : h < 18 ? "🌤️" : "🌙"}`;
  }
}

// ══════════════════════════════════════════
// PUASA TRACKER
// ══════════════════════════════════════════
let puasaStatus = ""; // 'ya' | 'tidak'
let puasaType = "Sunnah Senin-Kamis";

function setPuasaToggle(btn) {
  document
    .querySelectorAll(".puasa-yn-btn")
    .forEach((b) => b.classList.remove("selected-ya", "selected-tidak"));
  puasaStatus = btn.dataset.val;
  if (puasaStatus === "ya") {
    btn.classList.add("selected-ya");
    document.getElementById("puasa-form").classList.remove("hidden");
  } else {
    btn.classList.add("selected-tidak");
    document.getElementById("puasa-form").classList.add("hidden");
  }
}

function selectPuasaType(btn) {
  document
    .querySelectorAll("#puasa-type-pills .type-pill")
    .forEach((p) => p.classList.remove("selected"));
  btn.classList.add("selected");
  puasaType = btn.dataset.type;
}

function savePuasa() {
  if (!puasaStatus) {
    showToast("Pilih dulu: puasa atau tidak hari ini!", "error");
    return;
  }
  const logs = loadData("dc_puasa", []);
  // Remove existing entry for today
  const filtered = logs.filter((l) => l.date !== todayKey());

  const entry = {
    id: Date.now().toString(),
    date: todayKey(),
    status: puasaStatus,
    type: puasaStatus === "ya" ? puasaType : "",
    niat: document.getElementById("puasa-niat")?.value || "",
    buka: document.getElementById("puasa-buka")?.value || "",
    notes: document.getElementById("puasa-notes")?.value || "",
  };
  filtered.unshift(entry);
  saveData("dc_puasa", filtered.slice(0, 365));
  renderPuasa();
  showToast(
    puasaStatus === "ya"
      ? "Alhamdulillah, puasa dicatat! 🌙"
      : "Log hari ini disimpan.",
    "success",
  );
}

function deletePuasa(id) {
  saveData(
    "dc_puasa",
    loadData("dc_puasa", []).filter((l) => l.id !== id),
  );
  renderPuasa();
}

function renderPuasa() {
  const logs = loadData("dc_puasa", []);
  const today = logs.find((l) => l.date === todayKey());
  const badge = document.getElementById("puasa-today-badge");

  // Load today's data into form
  if (today) {
    puasaStatus = today.status;
    const yaBtn = document.getElementById("btn-puasa-ya");
    const tidakBtn = document.getElementById("btn-puasa-tidak");
    if (today.status === "ya") {
      yaBtn?.classList.add("selected-ya");
      tidakBtn?.classList.remove("selected-tidak");
      document.getElementById("puasa-form")?.classList.remove("hidden");
      if (document.getElementById("puasa-niat"))
        document.getElementById("puasa-niat").value = today.niat;
      if (document.getElementById("puasa-buka"))
        document.getElementById("puasa-buka").value = today.buka;
      if (document.getElementById("puasa-notes"))
        document.getElementById("puasa-notes").value = today.notes;
      // restore type pill
      document.querySelectorAll("#puasa-type-pills .type-pill").forEach((p) => {
        p.classList.toggle("selected", p.dataset.type === today.type);
      });
      puasaType = today.type || "Sunnah Senin-Kamis";
    } else {
      tidakBtn?.classList.add("selected-tidak");
      yaBtn?.classList.remove("selected-ya");
    }
    if (badge) {
      badge.textContent = today.status === "ya" ? "🌙 Puasa" : "○ Tidak Puasa";
      badge.style.background =
        today.status === "ya" ? "var(--mint-light)" : "var(--coral-light)";
      badge.style.color = today.status === "ya" ? "#3A8A6A" : "#A05040";
    }
  }

  // Stats
  const now = new Date();
  const thisMonth = now.toISOString().slice(0, 7);
  const puasaLogs = logs.filter((l) => l.status === "ya");
  const monthCount = puasaLogs.filter((l) =>
    l.date.startsWith(thisMonth),
  ).length;
  const el_streak = document.getElementById("puasa-streak");
  const el_month = document.getElementById("puasa-total-month");
  const el_all = document.getElementById("puasa-total-all");
  if (el_month) el_month.textContent = monthCount;
  if (el_all) el_all.textContent = puasaLogs.length;
  // Streak: count consecutive puasa days back from today
  if (el_streak) {
    let streak = 0,
      d = new Date();
    for (let i = 0; i < 365; i++) {
      const key = d.toISOString().slice(0, 10);
      const log = logs.find((l) => l.date === key);
      if (log && log.status === "ya") {
        streak++;
      } else if (i === 0) {
        /* skip today if not logged yet */
      } else break;
      d.setDate(d.getDate() - 1);
    }
    el_streak.textContent = streak;
  }

  // Calendar heatmap — start from May 1, 2026
  const calEl = document.getElementById("puasa-calendar");
  if (calEl) {
    const logMap = {};
    logs.forEach((l) => (logMap[l.date] = l.status));
    const startDate = new Date("2026-05-01");
    const todayDate = new Date(todayKey());
    let html = "";
    const d = new Date(startDate);
    while (d <= todayDate) {
      const key = d.toISOString().slice(0, 10);
      const day = d.getDate();
      const isToday = key === todayKey();
      const status = logMap[key];
      const cls =
        status === "ya" ? "puasa" : status === "tidak" ? "tidak" : "empty";
      const month = d.toLocaleString("id", { month: "short" });
      const title = `${day} ${month} — ${status === "ya" ? "Puasa" : status === "tidak" ? "Tidak puasa" : "Belum dicatat"}`;
      html += `<div class="puasa-day ${cls} ${isToday ? "today" : ""}" title="${title}">${day}</div>`;
      d.setDate(d.getDate() + 1);
    }
    calEl.innerHTML =
      html ||
      '<p style="color:var(--text-light);font-size:0.85rem">Belum ada data.</p>';
  }

  // Log list
  const listEl = document.getElementById("puasa-log-list");
  if (!listEl) return;
  if (!logs.length) {
    listEl.innerHTML = `<div class="empty-state"><div class="empty-icon">🌙</div><p>Belum ada catatan puasa.</p></div>`;
    return;
  }
  listEl.innerHTML = logs
    .slice(0, 10)
    .map(
      (l) => `
    <div class="puasa-log-item">
      <div class="puasa-log-icon">${l.status === "ya" ? "🌙" : "○"}</div>
      <div class="puasa-log-info">
        <div class="puasa-log-date">${l.date}</div>
        <div class="puasa-log-type">${l.status === "ya" ? l.type : "Tidak Puasa"}</div>
        ${l.niat ? `<div class="puasa-log-note">📝 ${escHtml(l.niat)}</div>` : ""}
        ${l.notes ? `<div class="puasa-log-note">💬 ${escHtml(l.notes)}</div>` : ""}
        ${l.buka ? `<div class="puasa-log-note">🕌 Buka: ${l.buka}</div>` : ""}
      </div>
      <button class="puasa-log-del" onclick="deletePuasa('${l.id}')" title="Hapus">🗑️</button>
    </div>`,
    )
    .join("");
}

// ── Override navigate() to handle puasa ──
const _origNavigate = navigate;
// patch navigate to also handle puasa page render
const _navOrig = navigate;
// Re-patch: just add puasa to navigate function inline via event
document.querySelectorAll(".nav-item[data-page]").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.dataset.page === "puasa") renderPuasa();
  });
});

// ── Override initDate to also init user info ──
const _origInitDate = initDate;
function initDate() {
  const now = new Date();
  const h = now.getHours();
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const dayStr = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  const dateEl = document.getElementById("today-full-date");
  const sideEl = document.getElementById("sidebar-date");
  if (dateEl) dateEl.textContent = dayStr;
  if (sideEl) sideEl.textContent = dayStr;
  const wd = document.getElementById("watch-date");
  if (wd) wd.value = todayKey();
  const badge = document.getElementById("study-day-badge");
  const dayNum = now.getDay();
  if (badge) {
    if (dayNum === 0 || dayNum === 6) {
      badge.textContent = "🏖️ Weekend — Rest day!";
      badge.style.cssText = "background:var(--peach-light);color:#A06040;";
    } else {
      badge.textContent = "📅 Weekday — Study time!";
      badge.style.cssText = "background:var(--sky-light);color:#3A7A8A;";
    }
  }
  initUserInfo();
}