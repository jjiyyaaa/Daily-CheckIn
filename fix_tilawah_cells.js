const fs = require("fs");
let content = fs.readFileSync("app.js", "utf-8");

// We need to change:
/*
<div class="pixel-cell tilawah-${level}" title="${key} — ${label}">
  <div style="font-size: 0.65rem; margin-bottom: 2px; font-weight: normal; line-height: 1;">${d.getDate()}</div>
  <div style="font-weight: 700; font-size: 0.75rem;">${entry.pages ? entry.pages : ""}</div>
</div>
*/
// To:
/*
<div class="pixel-cell tilawah-${level}" title="${key} — ${label}" style="position: relative;">
  <span style="position: absolute; top: 3px; left: 4px; font-size: 0.5rem; line-height: 1; opacity: 0.7;">${d.getDate()}</span>
  ${entry.pages ? `<span style="font-weight: 700; font-size: 0.8rem;">${entry.pages}</span>` : ""}
</div>
*/

content = content.replace(/<div class="pixel-cell tilawah-\${level}" title="\${key} — \${label}">\s*<div style="font-size: 0\.65rem; margin-bottom: 2px; font-weight: normal; line-height: 1;">\${d\.getDate\(\)}<\/div>\s*<div style="font-weight: 700; font-size: 0\.75rem;">\${entry\.pages \? entry\.pages : ""}<\/div>\s*<\/div>/g, 
`<div class="pixel-cell tilawah-\${level}" title="\${key} — \${label}" style="position: relative; display: flex; align-items: center; justify-content: center;">
  <span style="position: absolute; top: 3px; left: 4px; font-size: 0.55rem; line-height: 1; opacity: 0.75;">\${d.getDate()}</span>
  \${entry.pages ? \`<span style="font-weight: 700; font-size: 0.85rem;">\${entry.pages}</span>\` : ""}
</div>`);

// Also change the year cell
/*
if (level > 0) {
    html += `<div class="tilawah-year-cell tilawah-${level}" title="${key}: ${entry.pages} lbr">${d}</div>`;
} else {
    html += `<div class="tilawah-year-cell" title="${key}: Belum ada">${d}</div>`;
}
*/
// To:
/*
if (level > 0) {
    html += `<div class="tilawah-year-cell tilawah-${level}" title="${key}: ${entry.pages} lbr" style="position:relative;">
               <span style="position:absolute; top:2px; left:3px; font-size:0.45rem; opacity:0.7;">${d}</span>
               <span style="font-weight:bold; font-size:0.65rem;">${entry.pages}</span>
             </div>`;
} else {
    html += `<div class="tilawah-year-cell" title="${key}: Belum ada" style="position:relative;">
               <span style="position:absolute; top:2px; left:3px; font-size:0.45rem; opacity:0.7;">${d}</span>
             </div>`;
}
*/
content = content.replace(/html \+= `(?:\\n\s*)?<div class="tilawah-year-cell tilawah-\${level}" title="\${key}: \${entry\.pages} lbr">\${d}<\/div>(?:\\n\s*)?`;/g, 
`html += \`<div class="tilawah-year-cell tilawah-\${level}" title="\${key}: \${entry.pages} lbr" style="position:relative;">
   <span style="position:absolute; top:2px; left:3px; font-size:0.45rem; opacity:0.7;">\${d}</span>
   <span style="font-weight:bold; font-size:0.65rem;">\${entry.pages}</span>
 </div>\`;`);

content = content.replace(/html \+= `(?:\\n\s*)?<div class="tilawah-year-cell" title="\${key}: Belum ada">\${d}<\/div>(?:\\n\s*)?`;/g, 
`html += \`<div class="tilawah-year-cell" title="\${key}: Belum ada" style="position:relative;">
   <span style="position:absolute; top:2px; left:3px; font-size:0.45rem; opacity:0.7;">\${d}</span>
 </div>\`;`);

fs.writeFileSync("app.js", content, "utf-8");
console.log("Done");
