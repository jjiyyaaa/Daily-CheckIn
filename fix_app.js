const fs = require('fs');

let content = fs.readFileSync('app.js', 'utf8');

// 1. Add escHtml
if (!content.includes('function escHtml')) {
  content = content.replace('function initApp() {', `function escHtml(str) {
  if (!str) return "";
  return String(str).replace(/[&<>"']/g, (m) => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return map[m];
  });
}

function initApp() {`);
}

// 2. Fix loadData
content = content.replace(/function loadData\(key, def\) \{[\s\S]*?return def;\s*\n\}/, `function loadData(key, def) {
  try {
    const val = localStorage.getItem(key);
    if (!val) return def;
    if (val.startsWith('{') || val.startsWith('[')) return JSON.parse(val);
    return JSON.parse(decodeURIComponent(atob(val)));
  } catch (e) {
    return def;
  }
}`);

// 3. Fix saveData
content = content.replace(/function saveData\(key, val\) \{[\s\S]*?localStorage\.setItem\(key, JSON\.stringify\(val\)\);\n\}/, `function saveData(key, val) {
  cloudData[key] = val;
  try {
    localStorage.setItem(key, btoa(encodeURIComponent(JSON.stringify(val))));
  } catch(e) {
    localStorage.setItem(key, JSON.stringify(val));
  }
}`);

// 4. Debounce saveJournal
content = content.replace(/function saveJournal\(\) \{[\s\S]*?dailyTodo: today\.dailyTodo \|\| \[\],\s*\}\);\s*\}/, `let journalTimeout;
function saveJournal() {
  clearTimeout(journalTimeout);
  journalTimeout = setTimeout(() => {
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
  }, 500);
}`);

// 5. XSS Replacements (only wrap if not already wrapped)
const xssPairs = [
  ['${t.text}', '${escHtml(t.text)}'],
  ['${l.subject}', '${escHtml(l.subject)}'],
  ['${m.title}', '${escHtml(m.title)}'],
  ['${m.location}', '${escHtml(m.location)}'],
  ['${m.companion}', '${escHtml(m.companion)}'],
  ['${d.name}', '${escHtml(d.name)}'],
  ['${l.type}', '${escHtml(l.type)}'],
  ['${td.text}', '${escHtml(td.text)}'],
  ['${act.text}', '${escHtml(act.text)}'],
  ['${item.text}', '${escHtml(item.text)}'],
  ['${j.gratitude}', '${escHtml(j.gratitude)}'],
  ['${j.braindump}', '${escHtml(j.braindump)}'],
  ['${j.lineNote}', '${escHtml(j.lineNote)}'],
  ['${j.vibe}', '${escHtml(j.vibe)}'],
  ['${j.affirmations}', '${escHtml(j.affirmations)}'],
];

xssPairs.forEach(([from, to]) => {
  // Use split and join to replace all occurrences
  content = content.split(from).join(to);
});

fs.writeFileSync('app.js', content, 'utf8');
console.log('Successfully refactored app.js');
