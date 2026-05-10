const fs = require("fs");
let content = fs.readFileSync("login.html", "utf-8");

// We want to find the blocks starting with <div class="auth-input-group"> and ending with </div>
// But they contain nested divs!
// Let's use a simpler approach: 
// 1. Split by '<div class="auth-input-group">'
// 2. For each part, find where `<div class="field-feedback"` or `<div class="pw-strength"` starts.
// 3. Insert `<div style="position: relative;">` at the beginning, and `</div>` right before the feedback/strength div.

let parts = content.split('<div class="auth-input-group">');
let newContent = parts[0];

for (let i = 1; i < parts.length; i++) {
    let part = parts[i];
    // Find the split point
    let splitIdx = part.indexOf('<div class="field-feedback"');
    let strengthIdx = part.indexOf('<div class="pw-strength"');
    
    if (strengthIdx !== -1 && strengthIdx < splitIdx) {
        splitIdx = strengthIdx;
    }
    
    if (splitIdx !== -1) {
        let before = part.substring(0, splitIdx);
        let after = part.substring(splitIdx);
        
        // Wrap 'before'
        let wrapped = `\n        <div style="position: relative;">` + before.trimEnd() + `\n        </div>\n        `;
        newContent += '<div class="auth-input-group">' + wrapped + after;
    } else {
        newContent += '<div class="auth-input-group">' + part;
    }
}

// Now revert the CSS top: 24px to top: 50%
newContent = newContent.replace(/top: 24px;/g, "top: 50%;");

fs.writeFileSync("login.html", newContent, "utf-8");
console.log("Replaced successfully!");
