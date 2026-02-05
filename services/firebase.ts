
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBJqV-4GhBWiarZejASpIpRqbCeN-8kVok",
  authDomain: "gloire-pedagogical-assistant.firebaseapp.com",
  projectId: "gloire-pedagogical-assistant",
  storageBucket: "gloire-pedagogical-assistant.firebasestorage.app",
  messagingSenderId: "1005504642441",
  appId: "1:1005504642441:web:e01f701b0a53f234af3558",
  measurementId: "G-6N25L08S2Q"
};

// Initialize Firebase - Ensure singleton behavior
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Use initializeFirestore with explicit settings to fix "Could not reach backend" errors
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true, // More robust in restricted environments
});

export { auth, db };
