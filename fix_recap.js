const fs = require("fs");
let content = fs.readFileSync("app.js", "utf-8");

const oldTilawah = `
    // Render tilawah pixel grid
    const pixelGrid = document.getElementById("tilawah-pixel-grid");
    if (pixelGrid) {
      const daysHtml = recentDates
        .map((d) => {
          const key = localDateKey(d);
          const entry = tilawah.find((l) => l.date === key) || { pages: 0 };
          const level = Math.min(entry.pages, 5);
          const label = entry.pages ? \`\${entry.pages} lbr\` : "0";
          return \`<div class="pixel-cell tilawah-\${level}" title="\${key} — \${label}">
                    <div style="font-size: 0.65rem; margin-bottom: 2px; font-weight: normal; line-height: 1;">\${d.getDate()}</div>
                    <div style="font-weight: 700; font-size: 0.75rem;">\${entry.pages ? entry.pages : ""}</div>
                  </div>\`;
        })
        .join("");
      pixelGrid.innerHTML = emptyHtml + daysHtml;
    }
`;

const newTilawah = `
    // Render tilawah pixel grid
    const pixelGrid = document.getElementById("tilawah-pixel-grid");
    const tilawahLabels = document.getElementById("tilawah-day-labels");
    if (pixelGrid) {
      if (recapPeriod === "year") {
        if (tilawahLabels) tilawahLabels.style.display = "none";
        
        let html = '<div class="tilawah-year-grid">';
        const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
        
        for (let m = 0; m < 12; m++) {
          html += \`<div class="tilawah-year-month"><div class="tilawah-month-header">\${months[m]}</div>\`;
          for (let d = 1; d <= 31; d++) {
            // Check if this day exists in this month (year = current year in range)
            const yearNum = new Date(range.start).getFullYear();
            const dateObj = new Date(yearNum, m, d);
            
            if (dateObj.getMonth() !== m) {
              html += \`<div class="tilawah-year-cell empty"></div>\`;
            } else {
              const key = localDateKey(dateObj);
              const entry = tilawah.find((l) => l.date === key) || { pages: 0 };
              const level = Math.min(entry.pages, 5);
              
              if (dateObj > new Date() || dateObj < new Date(range.start)) {
                 html += \`<div class="tilawah-year-cell" style="opacity: 0.3; background: #fafafa;">\${d}</div>\`;
              } else {
                 if (level > 0) {
                     html += \`<div class="tilawah-year-cell tilawah-\${level}" title="\${key}: \${entry.pages} lbr">\${d}</div>\`;
                 } else {
                     html += \`<div class="tilawah-year-cell" title="\${key}: Belum ada">\${d}</div>\`;
                 }
              }
            }
          }
          html += \`</div>\`;
        }
        html += '</div>';
        pixelGrid.innerHTML = html;
        pixelGrid.style.display = "block"; // override generic grid
      } else {
        if (tilawahLabels) tilawahLabels.style.display = "grid";
        pixelGrid.style.display = "grid"; // reset to standard pixel-grid
        
        const daysHtml = recentDates
          .map((d) => {
            const key = localDateKey(d);
            const entry = tilawah.find((l) => l.date === key) || { pages: 0 };
            const level = Math.min(entry.pages, 5);
            const label = entry.pages ? \`\${entry.pages} lbr\` : "0";
            return \`<div class="pixel-cell tilawah-\${level}" title="\${key} — \${label}">
                      <div style="font-size: 0.65rem; margin-bottom: 2px; font-weight: normal; line-height: 1;">\${d.getDate()}</div>
                      <div style="font-weight: 700; font-size: 0.75rem;">\${entry.pages ? entry.pages : ""}</div>
                    </div>\`;
          })
          .join("");
        pixelGrid.innerHTML = emptyHtml + daysHtml;
      }
    }
`;

const oldHabit = `
    // Render habit grid
    const habitGrid = document.getElementById("habit-grid");
    if (habitGrid) {
      if (!habitDefs.length) {
        habitGrid.innerHTML = \`<div class="journal-empty">Belum ada habit. Tambahkan habit di halaman Productivity dulu.</div>\`;
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
                return \`<td class="habit-cell \${active ? "active" : ""}" title="\${date}\${active ? " ✔" : ""}"></td>\`;
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
          <table class="habit-table" style="border-collapse:separate;border-spacing:4px;">
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
`;

const newHabit = `
    // Render habit grid
    const habitGrid = document.getElementById("habit-grid");
    if (habitGrid) {
      if (!habitDefs.length) {
        habitGrid.innerHTML = \`<div class="journal-empty">Belum ada habit. Tambahkan habit di halaman Productivity dulu.</div>\`;
      } else {
        if (recapPeriod === "year") {
           // GitHub Style Contribution Graph
           let html = '';
           const yearNum = new Date(range.start).getFullYear();
           const startDate = new Date(yearNum, 0, 1);
           const firstDayOffset = (startDate.getDay() + 6) % 7; // Monday = 0
           
           habitDefs.forEach(def => {
              html += \`<div class="github-habit-row">
                 <div class="github-habit-label">\${escHtml(def.name)}</div>
                 <div class="github-graph">\`;
                 
              // Empty cells for first week alignment
              for (let i = 0; i < firstDayOffset; i++) {
                 html += \`<div class="github-cell empty"></div>\`;
              }
              
              // 365/366 days
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
           // Compact Table Style for Week/Month
           const dateKeys = recentDates.map((d) => localDateKey(d));
           const headerCells = dateKeys
             .map((d) => \`<th>\${parseInt(d.slice(8, 10))}</th>\`)
             .join("");
           const rows = habitDefs
             .map((def) => {
               const cells = dateKeys
                 .map((date) => {
                   const active = habitData[date]?.[def.id];
                   return \`<td class="habit-cell \${active ? "active" : ""}" title="\${date}\${active ? " ✔" : ""}"></td>\`;
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

// Simple string replacement ignoring exact whitespace since I'll use regex matching.
// Actually, it's safer to extract it based on surrounding code if exact match fails.
let finalContent = content.replace(oldTilawah.trim(), newTilawah.trim());
finalContent = finalContent.replace(oldHabit.trim(), newHabit.trim());

if (finalContent === content) {
    console.log("REPLACEMENT FAILED. Trying regex...");
    
    // regex for Tilawah
    finalContent = finalContent.replace(/\/\/ Render tilawah pixel grid[\s\S]*?pixelGrid\.innerHTML = emptyHtml \+ daysHtml;\s*\}/, newTilawah.trim());
    
    // regex for Habit
    finalContent = finalContent.replace(/\/\/ Render habit grid[\s\S]*?<\/table>\\n\s*`;\s*\}\s*\}/, newHabit.trim());
}

fs.writeFileSync("app.js", finalContent, "utf-8");
console.log("Replaced successfully!");
