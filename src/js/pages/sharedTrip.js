import { db } from '../firebase/config.js';
import { doc, getDoc, collection, getDocs } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const tripId = urlParams.get('id');

    if (!tripId) {
        alert("No trip ID provided.");
        return;
    }

    const tripNameEl = document.querySelector('.text-display-lg');
    const tripHeroImg = document.querySelector('.shared-hero img');
    const tripOverviewEl = document.querySelector('.shared-trip-grid p.text-body-md');
    const timelineContainer = document.querySelector('.timeline');
    const statsContainer = document.querySelector('.sticky-panel .card:first-child div[style*="flex-direction:column"]');

    try {
        const tripDoc = await getDoc(doc(db, 'trips', tripId));
        if (tripDoc.exists()) {
            const trip = tripDoc.data();
            renderTrip(trip);
            fetchAndRenderActivities(tripId);
        } else {
            alert("Trip not found.");
        }
    } catch (error) {
        console.error("Error fetching trip:", error);
    }

    function renderTrip(trip) {
        if (tripNameEl) tripNameEl.textContent = trip.name;
        if (tripHeroImg && trip.coverImage) tripHeroImg.src = trip.coverImage;
        if (tripOverviewEl) tripOverviewEl.textContent = trip.description || "No overview provided.";
        
        // Update hero stats
        const heroStats = document.querySelectorAll('.shared-hero-content span');
        if (heroStats.length >= 3) {
            heroStats[0].innerHTML = `<span class="material-symbols-outlined" style="font-size:18px;">calendar_month</span> ${new Date(trip.startDate).toLocaleDateString()} — ${new Date(trip.endDate).toLocaleDateString()}`;
            heroStats[1].innerHTML = `<span class="material-symbols-outlined" style="font-size:18px;">pin_drop</span> ${trip.stops ? trip.stops.join(', ') : 'Various'}`;
        }

        // Update stats panel
        const statsValues = document.querySelectorAll('.sticky-panel p.text-label-md');
        if (statsValues.length >= 3) {
            const start = new Date(trip.startDate);
            const end = new Date(trip.endDate);
            const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            statsValues[0].textContent = `${duration} Days`;
            statsValues[1].textContent = `${trip.stops ? trip.stops.length : 0} Cities`;
            statsValues[2].textContent = `$${(trip.totalBudget || 0).toLocaleString()}`;
        }
    }

    async function fetchAndRenderActivities(tripId) {
        if (!timelineContainer) return;
        timelineContainer.innerHTML = '';

        try {
            const activitiesSnap = await getDocs(collection(db, 'trips', tripId, 'activities'));
            const activities = activitiesSnap.docs.map(doc => doc.data());
            
            // Group by day? Or just show highlight items
            // For shared view, let's show a few highlights or all in order
            activities.sort((a, b) => {
                if (a.dayIndex !== b.dayIndex) return a.dayIndex - b.dayIndex;
                return a.time.localeCompare(b.time);
            }).forEach(activity => {
                const item = document.createElement('div');
                item.style.position = 'relative';
                item.innerHTML = `
                    <div class="timeline-dot" style="background:var(--color-primary);"></div>
                    <span class="text-label-sm" style="color:var(--color-primary);font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">Day ${parseInt(activity.dayIndex) + 1} · ${activity.time}</span>
                    <h3 class="text-headline-md" style="margin-top:8px;font-weight:700;">${activity.title}</h3>
                    <p class="text-body-sm" style="color:var(--color-on-surface-variant);margin-top:4px;">${activity.location || ''}</p>
                `;
                timelineContainer.appendChild(item);
            });

            const statsValues = document.querySelectorAll('.sticky-panel p.text-label-md');
            if (statsValues.length >= 4) {
                statsValues[3].textContent = `${activities.length} Planned`;
            }
        } catch (error) {
            console.error("Error fetching activities:", error);
        }
    }
});
