import { auth } from '../firebase/config.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js';

// IMPORTANT: This must match the ADMIN_EMAIL in admin.js
const ADMIN_EMAIL = 'admin@traveloop.com'; 

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('admin-login-form');
    const emailInput = document.getElementById('admin-email');
    const passInput = document.getElementById('admin-pass');
    const loginBtn = document.getElementById('admin-login-btn');
    const errorMsg = document.getElementById('admin-error');
    const successMsg = document.getElementById('admin-success');

    loginBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passInput.value;

        // Reset UI
        errorMsg.style.display = 'none';
        successMsg.style.display = 'none';
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<span class="material-symbols-outlined" style="animation: spin 1s linear infinite;">sync</span> Authenticating...';

        try {
            // Check hardcoded email check first
            if (email !== ADMIN_EMAIL) {
                throw new Error("Unauthorized Email Address.");
            }

            if (password !== 'admin123456') {
                 throw new Error("Incorrect password.");
            }

            let offlineBypass = false;

            // Attempt to Sign In
            try {
                await signInWithEmailAndPassword(auth, email, password);
            } catch (err) {
                // If user doesn't exist, try to create it automatically
                if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-login-credentials') {
                    try {
                        console.log("Admin account not found. Creating default admin account...");
                        await createUserWithEmailAndPassword(auth, email, password);
                    } catch(createErr) {
                         console.warn("Could not create Firebase account. Using bypass.", createErr);
                         offlineBypass = true;
                    }
                } else {
                    console.warn("Firebase Authentication failed. Using bypass.", err);
                    offlineBypass = true;
                }
            }

            if (offlineBypass) {
                localStorage.setItem('traveloop_admin_bypass', 'true');
            } else {
                localStorage.removeItem('traveloop_admin_bypass');
            }

            // Success! Redirect to the admin dashboard
            successMsg.textContent = offlineBypass ? "Offline Mode: Authentication successful. Redirecting..." : "Authentication successful. Redirecting...";
            successMsg.style.display = 'block';
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1000);

        } catch (error) {
            console.error("Admin Login Error:", error);
            
            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                errorMsg.textContent = "Incorrect password.";
            } else if (error.message === "Unauthorized Email Address.") {
                errorMsg.textContent = "Access Denied: You do not have administrator privileges.";
            } else {
                errorMsg.textContent = "Authentication failed. " + error.message;
            }
            
            errorMsg.style.display = 'block';
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<span class="material-symbols-outlined">login</span> Secure Login';
            
            // Show alert so it's impossible to miss
            alert("Login Failed: " + errorMsg.textContent);
            
            // Sign out just in case
            await signOut(auth);
        }
    });
});
