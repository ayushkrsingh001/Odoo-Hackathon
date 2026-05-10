import { auth, db } from '../firebase/config.js';
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js';
import { initSidebar } from '../components/sidebar.js';
import { protectRoute } from '../utils/guards.js';

document.addEventListener('DOMContentLoaded', async () => {
    initSidebar();
    const user = await protectRoute();
    if (!user) return;

    const settingsForm = document.getElementById('settings-form');
    const currencySelect = document.getElementById('pref-currency');
    const emailNotifCheckbox = document.getElementById('pref-email-notif');

    // Load preferences
    try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const data = userSnap.data();
            if (data.preferences) {
                if (data.preferences.currency) currencySelect.value = data.preferences.currency;
                if (data.preferences.emailNotif !== undefined) emailNotifCheckbox.checked = data.preferences.emailNotif;
            }
        }
    } catch (error) {
        console.error("Error loading preferences:", error);
    }

    // Save preferences
    if (settingsForm) {
        settingsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = settingsForm.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.textContent = 'Saving...';

            try {
                const userRef = doc(db, 'users', user.uid);
                await setDoc(userRef, {
                    preferences: {
                        currency: currencySelect.value,
                        emailNotif: emailNotifCheckbox.checked
                    }
                }, { merge: true });
                
                showToast("Preferences saved successfully!");
            } catch (error) {
                console.error("Error saving preferences:", error);
                showToast("Failed to save preferences", "error");
            } finally {
                btn.disabled = false;
                btn.textContent = 'Save Preferences';
            }
        });
    }

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = 'toast reveal';
        toast.style.cssText = `
            position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
            background: ${type === 'error' ? 'var(--color-error)' : 'var(--color-primary)'};
            color: #fff; padding: 12px 24px; border-radius: 999px; z-index: 9999;
            font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
});
