const fs = require("fs");
let content = fs.readFileSync("login.html", "utf-8");

content = content.replace(/<button type="button" class="pw-toggle"[^>]*>.*?<\/button>/g, "");

fs.writeFileSync("login.html", content, "utf-8");
console.log("Removed pw-toggle");
