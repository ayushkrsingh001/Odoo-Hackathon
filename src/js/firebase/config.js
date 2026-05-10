import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js';

// Your web app's Firebase configuration
// Replace with your actual Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyD1JhjkyEPM9KLJpD_3l3PaX2rZH8M8xWM",
  authDomain: "odoo-hackathon-78c80.firebaseapp.com",
  projectId: "odoo-hackathon-78c80",
  storageBucket: "odoo-hackathon-78c80.firebasestorage.app",
  messagingSenderId: "382299891679",
  appId: "1:382299891679:web:183283914c623a43f7c66a",
  measurementId: "G-JY6FH779BH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
