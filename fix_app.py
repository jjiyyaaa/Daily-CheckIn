import sys

with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. replace updateTilawahRing() logic
old_update = '''function updateTilawahRing() {
  const pages = parseInt(
    document.getElementById("tilawah-pages")?.value || "0",
  );
  const target = 5;
  const pct = Math.min(pages / target, 1);
  const circ = 301.6;
  const fill = document.getElementById("ring-fill");'''

new_update = '''function updateTilawahRing() {
  const inputPages = parseInt(
    document.getElementById("tilawah-pages")?.value || "0",
  );
  const today = loadData("dc_tilawah", []).find((l) => l.date === todayKey());
  const existingPages = today ? today.pages : 0;
  const pages = existingPages + inputPages;
  const target = 5;
  const pct = Math.min(pages / target, 1);
  const circ = 301.6;
  const fill = document.getElementById("ring-fill");'''

content = content.replace(old_update, new_update)

# 2. replace saveTilawah() logic
old_save = '''function saveTilawah() {
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
}'''

new_save = '''function saveTilawah() {
  const inputPages = parseInt(
    document.getElementById("tilawah-pages")?.value || "0",
  );
  if (!inputPages || inputPages <= 0) {
    showToast("Isi dulu jumlah lembar (minimal 1)!", "error");
    return;
  }
  const logs = loadData("dc_tilawah", []);
  const today = logs.find((l) => l.date === todayKey());
  
  if (today) {
    today.pages += inputPages;
    if (document.getElementById("tilawah-surah")?.value) today.surah = document.getElementById("tilawah-surah").value;
    if (document.getElementById("tilawah-ayat")?.value) today.ayat = document.getElementById("tilawah-ayat").value;
    if (document.getElementById("tilawah-juz")?.value) today.juz = document.getElementById("tilawah-juz").value;
    if (document.getElementById("tilawah-notes")?.value) {
      if (today.notes) {
        today.notes += "\\n" + document.getElementById("tilawah-notes").value;
      } else {
        today.notes = document.getElementById("tilawah-notes").value;
      }
    }
  } else {
    logs.unshift({
      id: Date.now().toString(),
      date: todayKey(),
      pages: inputPages,
      surah: document.getElementById("tilawah-surah")?.value || "",
      ayat: document.getElementById("tilawah-ayat")?.value || "",
      juz: document.getElementById("tilawah-juz")?.value || "",
      notes: document.getElementById("tilawah-notes")?.value || "",
    });
  }
  saveData("dc_tilawah", logs.slice(0, 50));
  
  document.getElementById("tilawah-pages").value = "";
  document.getElementById("tilawah-notes").value = "";
  
  renderTilawah();
  updateDashboardStats();
  showToast(`Tilawah ditambah ${inputPages} lembar! 🌿`, "success");
}

function deleteTilawah(id) {
  if (!confirm("Hapus catatan tilawah ini?")) return;
  const logs = loadData("dc_tilawah", []).filter((l) => l.id !== id);
  saveData("dc_tilawah", logs);
  renderTilawah();
  updateDashboardStats();
  showToast("Catatan tilawah dihapus 🗑️");
}'''

content = content.replace(old_save, new_save)

# 3. replace renderTilawah() pre-fills and template
old_render = '''function renderTilawah() {
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
}'''

new_render = '''function renderTilawah() {
  const list = document.getElementById("tilawah-log-list");
  if (!list) return;
  const logs = loadData("dc_tilawah", []);
  const today = loadData("dc_tilawah", []).find((l) => l.date === todayKey());
  if (today) {
    document.getElementById("tilawah-surah").value = today.surah;
    document.getElementById("tilawah-ayat").value = today.ayat;
    document.getElementById("tilawah-juz").value = today.juz;
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
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:0.75rem;background:${l.pages >= 5 ? "var(--mint)" : "var(--yellow)"};padding:2px 10px;border-radius:100px;font-weight:600">${l.pages} lbr</span>
          <button onclick="deleteTilawah('${l.id}')" style="background:none;border:none;color:var(--coral);cursor:pointer;font-size:1.1rem;line-height:1;padding:0;" title="Hapus">🗑️</button>
        </div>
      </div>
      <div style="font-size:0.78rem;color:var(--text-mid)">${l.date} · Juz ${l.juz || "?"}</div>
      ${l.notes ? `<div style="font-size:0.8rem;color:var(--text-mid);margin-top:6px;font-style:italic;white-space:pre-wrap">"${escHtml(l.notes)}"</div>` : ""}
    </div>`,
    )
    .join("");
}'''

content = content.replace(old_render, new_render)

# 4. replace Task tracker recap logic
old_recap = '''  // Tasks
  let totalTasks = 0,
    doneTasks = 0;
  const allTasks = loadData("dc_tasks", []);
  allTasks.forEach((t) => {
    if (inRange(t.createdDate, range) || (t.completed && inRange(t.completedDate, range))) {
      totalTasks++;
      if (t.completed) doneTasks++;
    }
  });'''

new_recap = '''  // Tasks
  let totalTasks = 0,
    doneTasks = 0;
  const allTasks = loadData("dc_tasks", []);
  allTasks.forEach((t) => {
    const created = new Date(t.createdDate + "T00:00:00");
    const createdBeforeEnd = created <= range.end;
    let relevant = false;
    if (createdBeforeEnd) {
      if (!t.completed) {
        relevant = true;
      } else {
        const completed = new Date(t.completedDate + "T00:00:00");
        if (completed >= range.start) {
          relevant = true;
        }
      }
    }
    if (relevant) {
      totalTasks++;
      if (t.completed && inRange(t.completedDate, range)) doneTasks++;
    }
  });'''

content = content.replace(old_recap, new_recap)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('app.js modified successfully.')
