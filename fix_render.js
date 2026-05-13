const fs = require('fs');
let content = fs.readFileSync('app.js', 'utf8');

// Inject renderList
if (!content.includes('function renderList(')) {
  content = content.replace('function initApp() {', `// ── DOM Batching Helper ──
function renderList(containerId, items, templateFn, emptyHtml = "") {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!items || items.length === 0) {
    container.innerHTML = emptyHtml;
    return;
  }
  container.innerHTML = items.map(templateFn).join("");
}

function initApp() {`);
}

// Refactor renderTasks
const oldRenderTasks = /function renderTasks\(\) \{[\s\S]*?list\.innerHTML \+= html;\n    \}\);\n  \}\n\}/;
const newRenderTasks = `function renderTasks() {
  const tasks = getAllTasks();
  const filter = document.querySelector(".task-filter.active")?.dataset.filter || "all";
  const today = todayKey();

  let filtered = tasks;
  if (filter === "today") {
    filtered = tasks.filter((t) => t.deadline === today || (!t.completed && t.createdDate === today));
  } else if (filter === "completed") {
    filtered = tasks.filter((t) => t.completed);
  } else if (filter === "overdue") {
    filtered = tasks.filter((t) => !t.completed && t.deadline < today && t.deadline !== "");
  }
  
  filtered.sort((a, b) => {
    if (a.completed === b.completed) return new Date(b.createdDate) - new Date(a.createdDate);
    return a.completed ? 1 : -1;
  });

  const emptyState = \`<div class="empty-state">
    <div class="empty-icon">📝</div>
    <p>Belum ada task.</p>
  </div>\`;

  renderList("task-list", filtered, (t) => {
    const isOverdue = !t.completed && t.deadline < today && t.deadline !== "";
    const isToday = !t.completed && t.deadline === today;
    let badge = "";
    if (t.completed) badge = '<span style="font-size:0.7rem;color:var(--mint);border:1px solid var(--mint);border-radius:100px;padding:2px 8px;">Selesai</span>';
    else if (isOverdue) badge = '<span style="font-size:0.7rem;color:var(--coral);border:1px solid var(--coral);border-radius:100px;padding:2px 8px;">Terlewat</span>';
    else if (isToday) badge = '<span style="font-size:0.7rem;color:var(--pink-deep);border:1px solid var(--pink-deep);border-radius:100px;padding:2px 8px;">Hari ini</span>';

    return \`
    <div class="task-item \${t.completed ? 'completed' : ''}">
      <input type="checkbox" \${t.completed ? "checked" : ""} onchange="toggleTask('\${t.id}')">
      <div class="task-content">
        <span class="task-title">\${escHtml(t.text)}</span>
        <div style="display:flex;gap:6px;margin-top:4px;align-items:center;">
          \${badge}
          \${t.deadline ? \`<span style="font-size:0.7rem;color:var(--text-light)">📅 \${t.deadline}</span>\` : ''}
        </div>
      </div>
      <button class="journal-del-btn" onclick="deleteTask('\${t.id}')">✕</button>
    </div>\`;
  }, emptyState);

  updateNotifBtnState();
}`;
content = content.replace(oldRenderTasks, newRenderTasks);

// Refactor renderMovies
const oldRenderMovies = /function renderMovies\(\) \{[\s\S]*?grid\.innerHTML \+= html;\n    \}\);\n  \}\n\}/;
const newRenderMovies = `function renderMovies() {
  const movies = loadData("dc_movies", []);
  document.getElementById("watch-count").textContent = \`\${movies.length} films\`;

  renderList("watch-grid", movies, (m) => \`
  <div class="watch-card">
    <h3 class="watch-title">\${escHtml(m.title)}</h3>
    <div class="watch-meta">
      <span>📅 \${escHtml(m.date)}</span>
      \${m.location ? \`<span>📍 \${escHtml(m.location)}</span>\` : ""}
      \${m.companion ? \`<span>👥 \${escHtml(m.companion)}</span>\` : ""}
    </div>
    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px;">
      <div class="watch-rating">\${"★".repeat(m.rating)}\${"☆".repeat(5 - m.rating)}</div>
      <button class="btn btn-outline" style="padding:4px 8px;font-size:0.8rem;border-color:var(--coral-light);color:var(--coral)" onclick="deleteMovie('\${m.id}')">Hapus</button>
    </div>
  </div>\`, "");
}`;
content = content.replace(oldRenderMovies, newRenderMovies);

fs.writeFileSync('app.js', content, 'utf8');
console.log('Successfully refactored render loops');
