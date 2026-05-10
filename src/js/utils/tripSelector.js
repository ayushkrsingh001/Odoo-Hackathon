import { listenToTrips } from '../firebase/firestore.js';

/**
 * Initializes a trip selector on the page
 * @param {Object} options 
 * @param {string} options.containerId - ID of the container to render the selector in
 * @param {string} options.title - Section title
 * @param {string} options.subtitle - Section subtitle
 * @param {string} options.selectedTripId - Currently selected trip ID
 * @param {Function} options.onSelect - Callback when a trip is selected
 */
export function initTripSelector(options) {
    const { containerId, title, subtitle, selectedTripId, onSelect, userId } = options;
    const container = document.getElementById(containerId);
    if (!container) return;

    // Create selector structure
    container.innerHTML = `
        <div class="trip-selector-header reveal" style="margin-bottom:32px;">
            <h1 class="text-headline-xl" style="font-weight:800; margin-bottom:8px;">${title}</h1>
            <p class="text-body-lg" style="color:var(--color-on-surface-variant);">${subtitle}</p>
        </div>
        
        <div id="trip-selector-grid" class="grid-responsive-3 stagger-children" style="margin-bottom:48px;">
            <!-- Loading Skeletons -->
            <div class="skeleton" style="height:120px; border-radius:16px;"></div>
            <div class="skeleton" style="height:120px; border-radius:16px;"></div>
            <div class="skeleton" style="height:120px; border-radius:16px;"></div>
        </div>
        
        <div id="no-trips-state" style="display:none; text-align:center; padding:64px 24px; background:var(--color-surface-container-low); border-radius:24px; border: 2px dashed var(--color-outline-variant);">
            <span class="material-symbols-outlined" style="font-size:64px; color:var(--color-outline); margin-bottom:16px;">flight_takeoff</span>
            <h3 class="text-headline-md">You haven't created any trips yet.</h3>
            <p class="text-body-md" style="color:var(--color-on-surface-variant); margin-bottom:24px;">Start by planning your first adventure!</p>
            <a href="create-trip.html" class="btn btn-primary" style="padding:12px 32px; border-radius:14px;">Create Your First Trip</a>
        </div>
    `;

    const grid = document.getElementById('trip-selector-grid');
    const emptyState = document.getElementById('no-trips-state');

    // Listen to trips
    listenToTrips(userId, (trips) => {
        if (trips.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        grid.style.display = 'grid';
        emptyState.style.display = 'none';
        grid.innerHTML = '';

        trips.forEach(trip => {
            const isSelected = trip.id === selectedTripId;
            const card = document.createElement('div');
            card.className = `trip-select-card ${isSelected ? 'selected' : ''}`;
            
            const startDate = new Date(trip.startDate);
            const endDate = new Date(trip.endDate);
            const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
            const dateStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + 
                          ' - ' + 
                          endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            card.innerHTML = `
                <img src="${trip.coverImage || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800'}" class="card-icon" alt="${trip.name}">
                <div class="card-content" style="flex:1; min-width:0;">
                    <h3 class="text-headline-sm" style="margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${trip.name}</h3>
                    <p class="text-body-sm" style="color:var(--color-on-surface-variant); display:flex; align-items:center; gap:4px; margin-bottom:4px;">
                        <span class="material-symbols-outlined" style="font-size:14px;">location_on</span>
                        ${trip.destination || trip.country || 'No destination'}
                    </p>
                    <p class="text-body-sm" style="color:var(--color-on-surface-variant); display:flex; align-items:center; gap:4px;">
                        <span class="material-symbols-outlined" style="font-size:14px;">calendar_today</span>
                        ${dateStr} (${duration} Days)
                    </p>
                </div>
                ${isSelected ? '<span class="material-symbols-outlined" style="color:var(--color-primary); font-size:24px;">check_circle</span>' : ''}
            `;

            card.addEventListener('click', () => {
                onSelect(trip.id);
            });

            grid.appendChild(card);
        });

        if (window.initScrollAnimations) window.initScrollAnimations();
    }, (error) => {
        grid.style.display = 'block';
        grid.innerHTML = `
            <div style="padding:24px; background:#fef2f2; border:1px solid #fee2e2; border-radius:16px; color:#991b1b;">
                <h4 style="font-weight:700; margin-bottom:8px; display:flex; align-items:center; gap:8px;">
                    <span class="material-symbols-outlined">error</span>
                    Unable to load trips
                </h4>
                <p style="font-size:14px; line-height:1.5;">${error.message || 'We encountered a problem while fetching your trips. Please check your connection or try signing out and back in.'}</p>
            </div>
        `;
    });

    if (window.initScrollAnimations) window.initScrollAnimations();
}
