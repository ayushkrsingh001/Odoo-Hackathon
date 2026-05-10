import { auth } from '../firebase/config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js';
import { listenToTrips, deleteTrip } from '../firebase/firestore.js';
import { initSidebar } from '../components/sidebar.js';
import { protectRoute } from '../utils/guards.js';

document.addEventListener('DOMContentLoaded', async () => {
    initSidebar();
    const user = await protectRoute();
    
    const tripsGrid = document.getElementById('trips-grid');
    const filterTabs = document.querySelectorAll('.filter-tab');
    let allTrips = [];
    let currentFilter = 'All'; // Default to All to see everything first

    const urlParams = new URLSearchParams(window.location.search);
    const redirectParam = urlParams.get('redirect');
    const redirectMap = {
        'itinerary': 'itinerary.html',
        'budget': 'budget.html',
        'currency': 'currency-converter.html',
        'packing': 'packing.html',
        'smart-packing': 'smart-packing.html',
        'notes': 'notes.html'
    };

    if (user) {
        console.log('Listening for trips for user:', user.uid);
        listenToTrips(user.uid, (trips) => {
            console.log('Trips loaded from Firestore:', trips.length);
            allTrips = trips;
            renderTrips();
            if (window.initScrollAnimations) window.initScrollAnimations();
        }, (error) => {
            console.error("Trips page error:", error);
            tripsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align:center; padding:64px; background:#fef2f2; border-radius:16px; color:#991b1b;">
                    <span class="material-symbols-outlined" style="font-size:64px; color:var(--color-outline); margin-bottom:16px;">error</span>
                    <h3 class="text-headline-md">Unable to load trips</h3>
                    <p class="text-body-md" style="margin-bottom:24px;">${error.message}</p>
                    <button onclick="window.location.reload()" class="btn btn-primary">Retry</button>
                </div>
            `;
        });
    }

    filterTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.textContent.trim();
            renderTrips();
        });
    });

    function renderTrips() {
        if (!tripsGrid) return;
        tripsGrid.innerHTML = '';

        const now = new Date();
        const filteredTrips = allTrips.filter(trip => {
            const normalizedFilter = currentFilter.trim().toLowerCase();
            if (normalizedFilter === 'all') return true;
            
            if (!trip.startDate || !trip.endDate) return normalizedFilter === 'drafts';
            
            // Normalize dates to start of day for accurate filtering
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const startDate = new Date(trip.startDate);
            startDate.setHours(0, 0, 0, 0);
            
            const endDate = new Date(trip.endDate);
            endDate.setHours(23, 59, 59, 999);
            
            if (normalizedFilter === 'upcoming') return startDate >= today;
            if (normalizedFilter === 'past') return endDate < today;
            return false;
        });

        if (filteredTrips.length === 0) {
            renderEmptyState();
        } else {
            filteredTrips.forEach(trip => {
                const card = createTripCard(trip);
                tripsGrid.appendChild(card);
            });
            // Append CTA card at the end
            tripsGrid.appendChild(createCTACard());
        }
    }

    function renderEmptyState() {
        tripsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding:64px; background:var(--color-surface-container-low); border-radius:16px;">
                <span class="material-symbols-outlined" style="font-size:64px; color:var(--color-outline); margin-bottom:16px;">map</span>
                <h3 class="text-headline-md">No ${currentFilter.toLowerCase()} trips found</h3>
                <p class="text-body-md" style="color:var(--color-on-surface-variant); margin-bottom:24px;">Start by creating a new adventure!</p>
                <a href="create-trip.html" class="btn btn-primary" style="padding:12px 24px;">Plan a New Trip</a>
            </div>
        `;
    }

    function createCTACard() {
        const article = document.createElement('article');
        article.className = 'trip-cta-card';
        article.style.cssText = 'border: 2px dashed var(--color-outline-variant); background: none; box-shadow: none;';
        article.innerHTML = `
            <div style="width:64px;height:64px;border-radius:50%;background:var(--color-primary-container);display:flex;align-items:center;justify-content:center;color:var(--color-on-primary-container);margin-bottom:16px;">
              <span class="material-symbols-outlined" style="font-size:32px;">add</span>
            </div>
            <h3 class="text-headline-md" style="margin-bottom:8px;">New Adventure</h3>
            <p class="text-body-sm" style="color:var(--color-on-surface-variant);margin-bottom:24px;max-width:200px;text-align:center;">Add another destination to your bucket list.</p>
            <a href="create-trip.html" class="btn btn-surface" style="padding:8px 24px;">Create Trip</a>
        `;
        return article;
    }

    function createTripCard(trip) {
        const article = document.createElement('article');
        article.className = 'trip-card card-enter';
        article.style.cursor = 'pointer';
        article.setAttribute('data-trip-id', trip.id);
        
        const startDate = new Date(trip.startDate);
        const endDate = new Date(trip.endDate);
        const durationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) || 0;

        const targetPage = (redirectParam && redirectMap[redirectParam]) ? redirectMap[redirectParam] : 'trip-details.html';
        const finalUrl = `${targetPage}?tripId=${trip.id}`;

        article.innerHTML = `
            <div class="trip-card-image">
                <img alt="${trip.name}" src="${trip.coverImage || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800'}" loading="lazy">
                <div class="trip-card-duration">
                    <span class="material-symbols-outlined" style="font-size:16px;">calendar_month</span>
                    ${durationDays} Days
                </div>
            </div>
            <div class="trip-card-body">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
                    <h3 class="text-headline-md">${trip.name}</h3>
                    <div class="dropdown">
                        <button class="dropdown-btn" style="color:var(--color-on-surface-variant);padding:4px; background:none; border:none; cursor:pointer;">
                            <span class="material-symbols-outlined">more_vert</span>
                        </button>
                        <div class="dropdown-content" style="display:none; position:absolute; right:0; background:white; box-shadow:var(--shadow-md); border-radius:8px; z-index:100; min-width:120px;">
                            <button class="edit-trip-btn" style="display:block; width:100%; text-align:left; padding:8px 16px; border:none; background:none; cursor:pointer;">Edit</button>
                            <button class="delete-trip-btn" style="display:block; width:100%; text-align:left; padding:8px 16px; border:none; background:none; cursor:pointer; color:var(--color-error);">Delete</button>
                        </div>
                    </div>
                </div>
                <p class="text-body-sm" style="color:var(--color-on-surface-variant);margin-bottom:16px; line-clamp: 2; -webkit-line-clamp: 2; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden;">${trip.description || 'Plan your activities, budget, and more.'}</p>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px;">
                    <span class="chip chip-surface">${trip.stops ? trip.stops.length : 0} Destinations</span>
                </div>
                <div style="margin-top:auto;">
                    <a href="${finalUrl}" class="btn btn-primary view-details-btn" style="width:100%; text-align:center;">
                        ${redirectParam ? 'Select Trip' : 'View Details'}
                    </a>
                </div>
            </div>
        `;

        const dropdownBtn = article.querySelector('.dropdown-btn');
        const dropdownContent = article.querySelector('.dropdown-content');
        dropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdownContent.style.display === 'block';
            document.querySelectorAll('.dropdown-content').forEach(d => d.style.display = 'none');
            dropdownContent.style.display = isOpen ? 'none' : 'block';
        });

        article.addEventListener('click', (e) => {
            // Don't navigate if clicking the dropdown or its children
            if (e.target.closest('.dropdown')) return;
            window.location.href = finalUrl;
        });

        article.querySelector('.delete-trip-btn').addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm(`Are you sure you want to delete "${trip.name}"?`)) {
                await deleteTrip(trip.id);
            }
        });

        article.querySelector('.edit-trip-btn').addEventListener('click', () => {
            window.location.href = `create-trip.html?edit=${trip.id}`;
        });

        return article;
    }

    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-content').forEach(d => d.style.display = 'none');
    });
});
