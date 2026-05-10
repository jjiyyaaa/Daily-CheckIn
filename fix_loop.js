const fs = require("fs");
let content = fs.readFileSync("app.js", "utf-8");

// Remove initUserInfo entirely
content = content.replace(/function initUserInfo\(\) \{[\s\S]*?greetEl\.textContent = `\$\{g\}, \$\{session\.name \|\| session\.username\}! \$\{h < 11 \? "☀️" : h < 18 \? "🌤️" : "🌙"\}`;\\n\s*\}\\n\s*\}/g, "");

// Remove the second initDate completely
content = content.replace(/\/\/ ── Override initDate to also init user info ──[\s\S]*?function initDate\(\) \{[\s\S]*?initUserInfo\(\);\s*\}/g, "");

// Replace getSession to just return null or completely remove it
content = content.replace(/function getSession\(\) \{[\s\S]*?catch \{\s*return null;\s*\}\s*\}/g, "");

// Just to be safe, find any remaining `initUserInfo();` calls and remove them
content = content.replace(/initUserInfo\(\);/g, "");

fs.writeFileSync("app.js", content, "utf-8");
console.log("Cleaned up infinite loop culprits!");
