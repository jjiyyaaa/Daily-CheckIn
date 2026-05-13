function saveReflection() {
  const text = document.getElementById("reflection-text")?.value || "";
  saveData("dc_reflection_" + recapPeriod, {
    text,
    savedAt: new Date().toISOString(),
  });
  showToast("Refleksi disimpan! 💌", "success");
}
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
function formatDisplayDate(dateStr) {
  const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const d = new Date(dateStr + "T00:00:00");
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
}
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