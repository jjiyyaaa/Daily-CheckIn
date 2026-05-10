// Firebase v9 compat configuration
const firebaseConfig = {
  apiKey: "AIzaSyD3iTmhNbohXi0N2zUIf5U1jhTAu9o3o_w",
  authDomain: "daily-checkin-9dd93.firebaseapp.com",
  projectId: "daily-checkin-9dd93",
  storageBucket: "daily-checkin-9dd93.firebasestorage.app",
  messagingSenderId: "402288069772",
  appId: "1:402288069772:web:5bf5e20121772d22cc3fa9",
  measurementId: "G-Z99ZGN2GYY"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();
