import { auth, db } from '../firebase/config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js';
import { getTrip, listenToSubcollection, addSubcollectionItem, updateSubcollectionItem, deleteSubcollectionItem } from '../firebase/firestore.js';
import { initSidebar } from '../components/sidebar.js';
import { protectRoute } from '../utils/guards.js';
import { initTripSelector } from '../utils/tripSelector.js';

document.addEventListener('DOMContentLoaded', async () => {
    initSidebar();
    const user = await protectRoute();
    if (!user) return;

    const workspace = document.getElementById('feature-workspace');
    const tripNameDisplay = document.getElementById('selected-trip-name');
    const selectedTripDates = document.getElementById('selected-trip-dates');
    const stopsContainer = document.getElementById('stops-container');
    const currentStopTitle = document.getElementById('current-stop-title');
    const currentStopDates = document.getElementById('current-stop-dates');
    const activitiesContainer = document.getElementById('activities-container');

    const stopModal = document.getElementById('stop-modal');
    const stopForm = document.getElementById('stop-form');
    const addStopBtn = document.getElementById('add-stop-btn');
    const closeStopModalBtn = document.getElementById('close-stop-modal');
    const stopIdInput = document.getElementById('stop-id');

    const activityModal = document.getElementById('activity-modal');
    const activityForm = document.getElementById('activity-form');
    const addActivityBtn = document.getElementById('add-activity-btn');
    const closeActivityModalBtn = document.getElementById('close-activity-modal');
    const activityIdInput = document.getElementById('activity-id');

    let currentTrip = null;
    let selectedStopId = null;
    let allStops = [];
    let allActivities = [];

    // Initial trip context
    let currentTripId = new URLSearchParams(window.location.search).get('tripId') || new URLSearchParams(window.location.search).get('id');

    // Initialize Trip Selector
    initTripSelector({
        containerId: 'trip-selector-section',
        title: 'Itinerary Builder',
        subtitle: 'Select a trip to organize your stops, activities, and daily schedule.',
        selectedTripId: currentTripId,
        userId: user.uid,
        onSelect: async (tripId) => {
            const newUrl = window.location.pathname + '?tripId=' + tripId;
            window.history.pushState({ path: newUrl }, '', newUrl);
            localStorage.setItem('lastViewedTripId', tripId);
            await loadTripWorkspace(tripId);
        }
    });

    if (currentTripId) {
        loadTripWorkspace(currentTripId);
    }

    async function loadTripWorkspace(tripId) {
        currentTripId = tripId;
        try {
            currentTrip = await getTrip(tripId);
            if (!currentTrip) {
                workspace.style.display = 'none';
                return;
            }

            if (tripNameDisplay) tripNameDisplay.textContent = `${currentTrip.name} Itinerary`;
            if (selectedTripDates) {
                const start = new Date(currentTrip.startDate);
                const end = new Date(currentTrip.endDate);
                const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
                selectedTripDates.textContent = `${start.toLocaleDateString()} - ${end.toLocaleDateString()} (${days} Days)`;
            }

            workspace.style.display = 'block';
            setupStopsListener(tripId);
            setupActivitiesListener(tripId);
            
            initTripSelector({
                containerId: 'trip-selector-section',
                title: 'Itinerary Builder',
                subtitle: 'Select a trip to organize your stops, activities, and daily schedule.',
                selectedTripId: tripId,
                userId: user.uid,
                onSelect: async (newId) => {
                    const newUrl = window.location.pathname + '?tripId=' + newId;
                    window.history.pushState({ path: newUrl }, '', newUrl);
                    localStorage.setItem('lastViewedTripId', newId);
                    await loadTripWorkspace(newId);
                }
            });

            if (window.initScrollAnimations) window.initScrollAnimations();
        } catch (error) {
            console.error("Error loading itinerary:", error);
        }
    }

    function setupStopsListener(tripId) {
        listenToSubcollection(tripId, 'tripStops', (stops) => {
            allStops = stops.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
            renderStops(tripId);

            if (allStops.length > 0 && !selectedStopId) {
                selectStop(allStops[0].id);
            } else if (allStops.length === 0) {
                selectedStopId = null;
                updateMainScheduleHeader();
                renderSelectedStopActivities(tripId);
            }
        });
    }

    function renderStops(tripId) {
        if (!stopsContainer) return;
        stopsContainer.innerHTML = '';
        if (allStops.length === 0) {
            stopsContainer.innerHTML = '<p class="text-body-sm" style="color:var(--color-outline);text-align:center;padding:20px;">No stops added yet.</p>';
            return;
        }

        allStops.forEach((stop) => {
            const startStr = new Date(stop.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const endStr = new Date(stop.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            const stopEl = document.createElement('div');
            stopEl.className = 'itinerary-day-item';
            stopEl.style.cssText = 'padding:16px;border-radius:var(--radius-md);cursor:pointer;transition:all 0.2s; border: 1px solid transparent; background:var(--color-surface); box-shadow:0 1px 3px rgba(0,0,0,0.05); position:relative;';

            if (stop.id === selectedStopId) {
                stopEl.style.background = 'var(--color-primary-container)';
                stopEl.style.borderColor = 'var(--color-primary)';
                stopEl.style.color = 'var(--color-on-primary-container)';
            }

            stopEl.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                  <div>
                    <h4 class="text-label-md" style="font-size:16px; margin-bottom:4px;">${stop.city}, ${stop.country}</h4>
                    <span class="text-label-sm" style="opacity:0.8;">${startStr} - ${endStr}</span>
                  </div>
                  <button class="btn-icon btn-icon-sm delete-stop-btn" data-id="${stop.id}" style="position:absolute; top:8px; right:8px; background:none; border:none;">
                    <span class="material-symbols-outlined" style="font-size:16px; color:var(--color-error);">delete</span>
                  </button>
                </div>
            `;

            stopEl.addEventListener('click', (e) => {
                if (e.target.closest('.delete-stop-btn')) return;
                selectStop(stop.id);
            });

            const delBtn = stopEl.querySelector('.delete-stop-btn');
            if (delBtn) {
                delBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    if (confirm(`Remove ${stop.city} from your trip?`)) {
                        try {
                            await deleteSubcollectionItem(tripId, 'tripStops', stop.id);
                            if (selectedStopId === stop.id) selectedStopId = null;
                            showToast("Stop removed");
                        } catch (err) {
                            showToast("Failed to remove stop", "error");
                        }
                    }
                });
            }
            stopsContainer.appendChild(stopEl);
        });
    }

    function selectStop(stopId) {
        selectedStopId = stopId;
        renderStops(currentTripId);
        updateMainScheduleHeader();
        renderSelectedStopActivities(currentTripId);
    }

    function updateMainScheduleHeader() {
        if (!currentStopTitle || !currentStopDates || !addActivityBtn) return;
        const stop = allStops.find(s => s.id === selectedStopId);
        if (stop) {
            currentStopTitle.textContent = `${stop.city}, ${stop.country}`;
            currentStopDates.textContent = `${new Date(stop.startDate).toLocaleDateString()} to ${new Date(stop.endDate).toLocaleDateString()}`;
            addActivityBtn.style.display = 'flex';
        } else {
            currentStopTitle.textContent = 'Select a stop';
            currentStopDates.textContent = '...';
            addActivityBtn.style.display = 'none';
        }
    }

    function setupActivitiesListener(tripId) {
        listenToSubcollection(tripId, 'activities', (activities) => {
            allActivities = activities;
            renderSelectedStopActivities(tripId);
        });
    }

    function renderSelectedStopActivities(tripId) {
        if (!activitiesContainer) return;
        activitiesContainer.innerHTML = '';
        if (!selectedStopId) {
            activitiesContainer.innerHTML = '<div style="text-align:center; padding:48px; color:var(--color-outline);">Select a stop from the left to view activities.</div>';
            return;
        }

        const stopActivities = allActivities
            .filter(a => a.stopId === selectedStopId)
            .sort((a, b) => a.time.localeCompare(b.time));

        if (stopActivities.length === 0) {
            activitiesContainer.innerHTML = `
                <div style="text-align:center; padding:48px; border: 2px dashed rgba(193,198,215,0.4); border-radius:var(--radius-lg); margin-top:20px;">
                    <span class="material-symbols-outlined" style="font-size:48px; color:var(--color-outline); margin-bottom:16px;">explore</span>
                    <h4 class="text-headline-sm" style="color:var(--color-on-surface-variant); margin-bottom:8px;">No activities yet</h4>
                    <p class="text-body-sm" style="color:var(--color-outline); max-width:280px; margin:0 auto;">Click "Add Activity" to start planning what you'll do here.</p>
                </div>
            `;
            return;
        }

        stopActivities.forEach(act => {
            const card = document.createElement('div');
            card.className = 'card card-bordered';
            card.style.cssText = 'padding:16px; display:flex; gap:16px; position:relative; align-items:flex-start;';
            let icon = 'place';
            if (act.category === 'Food') icon = 'restaurant';
            else if (act.category === 'Transport') icon = 'directions_bus';
            else if (act.category === 'Stay' || act.category === 'Accommodation') icon = 'hotel';

            card.innerHTML = `
                <div style="width:48px;height:48px;border-radius:12px;background:var(--color-primary-container);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    <span class="material-symbols-outlined" style="color:var(--color-primary);">${icon}</span>
                </div>
                <div style="flex:1;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                        <h4 class="text-label-lg" style="font-weight:700;">${act.name}</h4>
                        <span class="text-label-sm" style="font-weight:700;color:var(--color-primary);">${act.time}</span>
                    </div>
                    <p class="text-body-sm" style="color:var(--color-on-surface-variant);margin-bottom:8px;">${act.category} ${act.cost ? `• $${act.cost}` : ''}</p>
                    ${act.description ? `<p class="text-body-sm">${act.description}</p>` : ''}
                </div>
                <button class="btn-icon btn-icon-sm delete-act-btn" data-id="${act.id}" style="position:absolute; bottom:12px; right:12px; background:none; border:none;">
                    <span class="material-symbols-outlined" style="font-size:18px; color:var(--color-error);">delete</span>
                </button>
            `;

            const delBtn = card.querySelector('.delete-act-btn');
            if (delBtn) {
                delBtn.addEventListener('click', async () => {
                    if (confirm('Delete this activity?')) {
                        try {
                            await deleteSubcollectionItem(tripId, 'activities', act.id);
                            showToast("Activity deleted");
                        } catch (err) {
                            showToast("Failed to delete", "error");
                        }
                    }
                });
            }
            activitiesContainer.appendChild(card);
        });
    }

    if (addStopBtn) {
        addStopBtn.addEventListener('click', () => {
            stopForm.reset();
            stopIdInput.value = '';
            stopModal.style.display = 'flex';
        });
    }
    if (closeStopModalBtn) {
        closeStopModalBtn.addEventListener('click', () => {
            stopModal.style.display = 'none';
        });
    }
    if (stopForm) {
        stopForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = stopForm.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.textContent = 'Saving...';
            const stopData = {
                city: document.getElementById('stop-city').value,
                country: document.getElementById('stop-country').value,
                startDate: document.getElementById('stop-start').value,
                endDate: document.getElementById('stop-end').value,
                notes: document.getElementById('stop-notes').value,
                createdAt: new Date().toISOString()
            };
            try {
                if (stopIdInput.value) {
                    await updateSubcollectionItem(currentTripId, 'tripStops', stopIdInput.value, stopData);
                } else {
                    await addSubcollectionItem(currentTripId, 'tripStops', stopData);
                }
                stopModal.style.display = 'none';
                showToast("Stop saved successfully!");
            } catch (error) {
                console.error("Error saving stop:", error);
                showToast("Failed to save stop", "error");
            } finally {
                btn.disabled = false;
                btn.textContent = 'Save Stop';
            }
        });
    }

    if (addActivityBtn) {
        addActivityBtn.addEventListener('click', () => {
            if (!selectedStopId) {
                showToast("Please select a stop first", "error");
                return;
            }
            activityForm.reset();
            activityIdInput.value = '';
            activityModal.style.display = 'flex';
        });
    }
    if (closeActivityModalBtn) {
        closeActivityModalBtn.addEventListener('click', () => {
            activityModal.style.display = 'none';
        });
    }
    if (activityForm) {
        activityForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!selectedStopId) return;
            const btn = activityForm.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.textContent = 'Saving...';
            const activityData = {
                stopId: selectedStopId,
                name: document.getElementById('activity-name').value,
                time: document.getElementById('activity-time').value,
                category: document.getElementById('activity-category').value,
                cost: parseFloat(document.getElementById('activity-cost').value) || 0,
                description: document.getElementById('activity-desc').value,
                createdAt: new Date().toISOString()
            };
            try {
                await addSubcollectionItem(currentTripId, 'activities', activityData);
                activityModal.style.display = 'none';
                showToast("Activity saved successfully!");
            } catch (error) {
                console.error("Error saving activity:", error);
                showToast("Failed to save activity", "error");
            } finally {
                btn.disabled = false;
                btn.textContent = 'Save Activity';
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
