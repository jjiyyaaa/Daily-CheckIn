// app.js
// Main entry point for the Daily Check-in App
// This file initializes all ViewModels and handles global UI like navigation and toasts.

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  // Initialize Core and Models
  initDate();
  initUserInfo();

  // Initialize ViewModels
  if (window.DashboardVM) DashboardVM.init();
  if (window.JournalVM) JournalVM.init();
  if (window.ProductivityVM) ProductivityVM.init();
  if (window.SpiritualVM) SpiritualVM.init();
  if (window.EntertainmentVM) EntertainmentVM.init();
  if (window.RecapVM) RecapVM.init();

  // Global events
  document.getElementById("btn-sync-firebase")?.addEventListener("click", () => {
    syncToFirebase();
    showToast("Memulai sinkronisasi...", "info");
  });
}

function initDate() {
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  const str = new Date().toLocaleDateString("id-ID", options);
  const el = document.getElementById("header-date");
  if (el) el.textContent = str;
}

function navigate(viewId, el) {
  // Hide all views
  document.querySelectorAll(".view-section").forEach((s) => s.classList.remove("active"));
  // Show target
  const target = document.getElementById(viewId);
  if (target) {
    target.classList.add("active");
    // Refresh specific view models if needed
    if (viewId === "view-dashboard" && window.DashboardVM) DashboardVM.init();
    if (viewId === "view-recap" && window.RecapVM) RecapVM.init();
  }
  
  // Update nav active states
  document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"));
  if (el) el.classList.add("active");
  
  // Close sidebar on mobile
  closeSidebar();
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function toggleSidebar() {
  document.getElementById("sidebar")?.classList.toggle("open");
  document.getElementById("sidebar-overlay")?.classList.toggle("open");
}

function closeSidebar() {
  document.getElementById("sidebar")?.classList.remove("open");
  document.getElementById("sidebar-overlay")?.classList.remove("open");
}

function showToast(msg, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  const icons = { success: "✅", error: "❌", info: "ℹ️" };
  toast.innerHTML = `<span>${icons[type] || "ℹ️"}</span><span>${Security.escHtml(msg)}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function initUserInfo() {
  const user = Storage.load("dc_user", null);
  if (user && document.getElementById("sidebar-user-name")) {
    document.getElementById("sidebar-user-name").textContent = user.name || "User";
  }
}

function handleLogout() {
  if (confirm("Yakin ingin logout? Pastikan data sudah ter-sinkronisasi!")) {
    if (typeof firebase !== 'undefined' && firebase.auth) {
      firebase.auth().signOut().then(() => {
        localStorage.clear();
        window.location.href = "login.html";
      });
    } else {
      localStorage.clear();
      window.location.href = "login.html";
    }
  }
}

// Global Firebase Sync Wrapper (to be overridden by firebase-setup.js if present)
window.syncToFirebase = function() {
  console.log("Local sync triggered. Implement Firebase sync logic here or ensure firebase-setup overrides this.");
};

// Global Exports
window.initApp = initApp;
window.navigate = navigate;
window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;
window.showToast = showToast;
window.handleLogout = handleLogout;
