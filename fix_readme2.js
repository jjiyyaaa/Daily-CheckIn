const fs = require("fs");
let content = fs.readFileSync("README.md", "utf-8");

content = content.replace("- 🔒 **100% Offline & Private**: Powered entirely by the browser's `localStorage` API. There are no external databases—your data belongs to you and stays on your device.", "- ☁️ **Cloud Synced**: Data is securely synced to Firebase Cloud Firestore in real-time, meaning you can access your journal and habits from your phone, laptop, or tablet effortlessly.");

content = content.replace("Since this application is built entirely with Vanilla JS, HTML, and CSS without relying on a backend, getting it running is extremely simple:", "This application relies on Firebase for its backend infrastructure. To get it running locally, follow these steps:");

fs.writeFileSync("README.md", content, "utf-8");
console.log("README fully updated");
