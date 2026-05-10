import { auth } from '../firebase/config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js';

/**
 * Sidebar Navigation Component
 * Robust URL-based active state and logout handling.
 */
export function initSidebar() {
    const navItems = document.querySelectorAll('.nav-item');
    const logoutBtn = document.getElementById('logoutBtn');

    // 1. Precise Route Mapping
    const routeMap = {
        'dashboard.html': 'dashboard',
        'my-trips.html': 'my-trips',
        'create-trip.html': 'create-trip',
        'ai-trip-generator.html': 'ai-generator',
        'itinerary.html': 'itinerary',
        'budget.html': 'budget',
        'currency-converter.html': 'currency',
        'packing.html': 'packing',
        'smart-packing.html': 'smart-packing',
        'notes.html': 'notes',
        'shared-trips.html': 'shared',
        'profile.html': 'profile',
        'settings.html': 'settings'
    };

    // 2. Identify Current Active Page (handles query params automatically)
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const activePageId = routeMap[currentPath];

    // 2.5 Trip Context Preservation
    const tripSpecificPages = ['itinerary', 'budget', 'packing', 'smart-packing', 'notes', 'currency'];
    const urlParams = new URLSearchParams(window.location.search);
    const urlTripId = urlParams.get('tripId') || urlParams.get('id');

    if (urlTripId) {
        localStorage.setItem('lastViewedTripId', urlTripId);
    }

    // 3. Set Active State
    navItems.forEach(item => {
        const pageId = item.dataset.page;
        const icon = item.querySelector('.material-symbols-outlined');

        // Reset state
        item.classList.remove('active');
        if (icon) icon.style.fontVariationSettings = "'FILL' 0";

        // Apply active state if matched and not an action button
        if (pageId && pageId === activePageId && item.id !== 'logoutBtn') {
            item.classList.add('active');
            if (icon) icon.style.fontVariationSettings = "'FILL' 1";
        }

        // 3.5 Mobile Sidebar Auto-close
        item.addEventListener('click', () => {
            const overlay = document.querySelector('.mobile-menu-overlay');
            const mobileSidebar = document.querySelector('.mobile-sidebar');
            if (overlay && mobileSidebar) {
                overlay.classList.remove('active');
                mobileSidebar.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // 4. Robust Logout
    if (logoutBtn) {
        // Remove existing listeners to prevent duplicates
        const newLogoutBtn = logoutBtn.cloneNode(true);
        logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);

        const handleLogout = async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (confirm("Are you sure you want to log out?")) {
                try {
                    await signOut(auth);
                    window.location.href = 'login.html';
                } catch (error) {
                    console.error("Logout Error:", error);
                    alert("Logout failed. Please try again.");
                }
            }
        };

        newLogoutBtn.addEventListener('click', handleLogout);

        const topnavLogoutBtn = document.getElementById('topnavLogoutBtn');
        if (topnavLogoutBtn) {
            const newTopnavLogoutBtn = topnavLogoutBtn.cloneNode(true);
            topnavLogoutBtn.parentNode.replaceChild(newTopnavLogoutBtn, topnavLogoutBtn);
            newTopnavLogoutBtn.addEventListener('click', handleLogout);
        }
    }

    // 5. Auth Sync for Profile UI
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const userAvatars = document.querySelectorAll('.user-avatar-img');
            const userNames = document.querySelectorAll('.user-display-name');

            userAvatars.forEach(img => {
                img.src = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}&background=004ac6&color=fff`;
            });
            userNames.forEach(name => {
                name.textContent = user.displayName || 'Traveler';
            });
        }
    });
}
