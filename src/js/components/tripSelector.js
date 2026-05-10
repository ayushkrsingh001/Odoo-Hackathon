import { getTrips } from '../firebase/firestore.js';

/**
 * Shows a "Select a Trip" screen when a page requires a trip context
 * but no trip ID was provided in the URL.
 * 
 * @param {Object} user - The Firebase Auth user object
 * @param {HTMLElement} container - The main content container to inject into
 * @param {string} pageName - The current page filename (e.g., 'budget.html')
 * @returns {Promise<string|null>} The selected trip ID, or null if none chosen
 */
export async function showTripSelector(user, container, pageName) {
    if (!container) return null;

    container.innerHTML = `
        <div style="text-align:center; padding:48px 24px;">
            <span class="material-symbols-outlined" style="font-size:64px; color:var(--color-primary); margin-bottom:16px; display:block;">travel_explore</span>
            <h2 class="text-headline-lg" style="margin-bottom:8px;">Select a Trip</h2>
            <p class="text-body-md" style="color:var(--color-on-surface-variant); margin-bottom:32px;">Choose a trip to continue.</p>
            <div id="trip-selector-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:16px; text-align:left;">
                <div class="skeleton" style="height:120px; border-radius:12px;"></div>
                <div class="skeleton" style="height:120px; border-radius:12px;"></div>
            </div>
        </div>
    `;

    try {
        const trips = await getTrips(user.uid);
        const grid = document.getElementById('trip-selector-grid');

        if (!grid) return null;

        if (trips.length === 0) {
            grid.innerHTML = `
                <div style="grid-column:1/-1; text-align:center; padding:32px; border:2px dashed var(--color-outline-variant); border-radius:16px;">
                    <p class="text-body-md" style="color:var(--color-outline); margin-bottom:16px;">You don't have any trips yet.</p>
                    <a href="create-trip.html" class="btn btn-primary">Create Your First Trip</a>
                </div>
            `;
            return null;
        }

        grid.innerHTML = '';

        return new Promise((resolve) => {
            trips.forEach(trip => {
                const card = document.createElement('div');
                card.className = 'card card-bordered';
                card.style.cssText = 'cursor:pointer; padding:20px; transition:all 0.2s; border:2px solid transparent;';
                
                const startStr = trip.startDate ? new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
                const endStr = trip.endDate ? new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
                const dateRange = startStr && endStr ? `${startStr} — ${endStr}` : 'No dates set';

                card.innerHTML = `
                    <div style="display:flex; align-items:center; gap:16px;">
                        <div style="width:56px; height:56px; border-radius:12px; background:var(--color-primary-container); display:flex; align-items:center; justify-content:center; flex-shrink:0; overflow:hidden;">
                            ${trip.coverImage 
                                ? `<img src="${trip.coverImage}" style="width:100%; height:100%; object-fit:cover;" alt="">` 
                                : `<span class="material-symbols-outlined" style="color:var(--color-primary); font-size:28px;">flight_takeoff</span>`}
                        </div>
                        <div style="flex:1; min-width:0;">
                            <h3 class="text-label-lg" style="font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${trip.name}</h3>
                            <p class="text-body-sm" style="color:var(--color-on-surface-variant);">${dateRange}</p>
                        </div>
                        <span class="material-symbols-outlined" style="color:var(--color-outline);">chevron_right</span>
                    </div>
                `;

                card.addEventListener('mouseenter', () => {
                    card.style.borderColor = 'var(--color-primary)';
                    card.style.background = 'var(--color-primary-container)';
                });
                card.addEventListener('mouseleave', () => {
                    card.style.borderColor = 'transparent';
                    card.style.background = '';
                });

                card.addEventListener('click', () => {
                    // Navigate to the same page with the trip ID
                    window.location.href = `${pageName}?tripId=${trip.id}`;
                });

                grid.appendChild(card);
            });
        });
    } catch (error) {
        console.error('Error loading trips for selector:', error);
        return null;
    }
}
