const fs = require("fs");
let content = fs.readFileSync("app.js", "utf-8");

const startIdx = content.indexOf("// Render habit grid");
const endStr = "  // ── GRATITUDE TIMELINE ──";
const endIdx = content.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
    const before = content.substring(0, startIdx);
    const after = content.substring(endIdx);
    
    const newHabit = `// Render habit grid
  const habitGrid = document.getElementById("habit-grid");
  if (habitGrid) {
    if (!habitDefs.length) {
      habitGrid.innerHTML = \`<div class="journal-empty">Belum ada habit. Tambahkan habit di halaman Productivity dulu.</div>\`;
    } else {
      if (recapPeriod === "year") {
         let html = '';
         const yearNum = new Date(range.start).getFullYear();
         const startDate = new Date(yearNum, 0, 1);
         const firstDayOffset = (startDate.getDay() + 6) % 7; // Monday = 0
         
         habitDefs.forEach(def => {
            html += \`<div class="github-habit-row">
               <div class="github-habit-label">\${escHtml(def.name)}</div>
               <div class="github-graph">\`;
               
            for (let i = 0; i < firstDayOffset; i++) {
               html += \`<div class="github-cell empty"></div>\`;
            }
            
            let d = new Date(startDate);
            while (d.getFullYear() === yearNum) {
               const key = localDateKey(d);
               const active = habitData[key]?.[def.id];
               if (d > new Date() || d < new Date(range.start)) {
                  html += \`<div class="github-cell" style="opacity:0.3; background:#fafafa;"></div>\`;
               } else {
                  html += \`<div class="github-cell \${active ? "active" : ""}" title="\${key}: \${active ? "Selesai" : "Bolong"}"></div>\`;
               }
               d.setDate(d.getDate() + 1);
            }
            html += \`</div></div>\`;
         });
         habitGrid.innerHTML = html;
      } else {
        const dateKeys = recentDates.map((d) => localDateKey(d));
        const headerCells = dateKeys
          .map((d) => \`<th>\${parseInt(d.slice(8, 10))}</th>\`)
          .join("");
        const rows = habitDefs
          .map((def) => {
            const cells = dateKeys
              .map((date) => {
                const active = habitData[date]?.[def.id];
                return \`<td class="habit-cell \${active ? "active" : ""}" title="\${date}\${active ? " Selesai" : ""}"></td>\`;
              })
              .join("");
            const emptyTds = Array(emptyCells).fill('<td style="border:none;background:transparent;"></td>').join("");
            return \`
              <tr>
                <td class="habit-label-cell" style="position:sticky;left:0;background:#fff;z-index:2;font-weight:600;min-width:120px;border-bottom:1px solid #f0f0f0;">\${escHtml(def.name)}</td>
                \${emptyTds}\${cells}
              </tr>
            \`;
          })
          .join("");
        habitGrid.innerHTML = \`
          <table class="habit-table compact" style="border-collapse:separate;border-spacing:2px;">
            <thead>
              <tr>
                <th style="position:sticky;left:0;background:#fff;z-index:2;min-width:120px;">Habit</th>
                \${emptyTdHtml}\${headerCells}
              </tr>
            </thead>
            <tbody>\${rows}</tbody>
          </table>
        \`;
      }
    }
  }

`;
    fs.writeFileSync("app.js", before + newHabit + after, "utf-8");
    console.log("Success");
} else {
    console.log("Could not find start or end index.");
}
