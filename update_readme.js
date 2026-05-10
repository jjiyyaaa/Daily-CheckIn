const fs = require("fs");
let content = fs.readFileSync("README.md", "utf-8");

content = content.replace("All data is stored locally in your browser, ensuring 100% privacy and security! 🔒", "All data is now seamlessly synced across your devices using **Firebase Authentication & Firestore**, giving you a modern cloud-synced experience while keeping your data safe! ☁️🔒");

if(!content.includes("Firebase")) {
    console.log("Fallback replacement");
    content = content.replace(/All data is stored locally in your browser[^!]*! ./g, "All data is now seamlessly synced across your devices using **Firebase Authentication & Firestore**, giving you a modern cloud-synced experience while keeping your data safe! ☁️🔒");
}

fs.writeFileSync("README.md", content, "utf-8");
console.log("README updated");
