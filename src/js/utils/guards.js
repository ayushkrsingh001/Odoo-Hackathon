import { auth } from '../firebase/config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js';

/**
 * Protects a route by checking the authentication state.
 * Redirects to login.html if the user is not signed in.
 * @returns {Promise<Object>} - Resolves with the user object if authenticated.
 */
export function protectRoute() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            if (!user) {
                // Not authenticated, redirect to login
                console.warn("Unauthorized access, redirecting to login...");
                window.location.href = 'login.html';
            } else {
                resolve(user);
            }
        });
    });
}
