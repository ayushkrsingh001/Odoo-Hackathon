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
    const selectedTripName = document.getElementById('selected-trip-name');
    const selectedTripDates = document.getElementById('selected-trip-dates');
    const categoriesGrid = document.getElementById('packing-categories-grid');
    const progressCard = document.getElementById('packing-progress-card');
    const progressCountText = document.getElementById('progress-count-text');
    const progressPercentText = document.getElementById('progress-percent-text');
    const progressFill = document.getElementById('packing-progress-fill');

    const packingModal = document.getElementById('packing-modal');
    const packingForm = document.getElementById('packing-form');
    const addItemBtn = document.getElementById('add-item-btn');
    const closePackingModalBtn = document.getElementById('close-packing-modal');

    // Initial trip context
    let currentTripId = new URLSearchParams(window.location.search).get('tripId') || new URLSearchParams(window.location.search).get('id');

    // Initialize Trip Selector
    initTripSelector({
        containerId: 'trip-selector-section',
        title: 'Packing Checklist',
        subtitle: 'Select a trip to view and manage your essentials. Never forget an item again!',
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
    } else {
        if (window.initScrollAnimations) window.initScrollAnimations();
    }

    async function loadTripWorkspace(tripId) {
        currentTripId = tripId;
        try {
            const trip = await getTrip(tripId);
            if (!trip) {
                workspace.style.display = 'none';
                return;
            }

            if (selectedTripName) selectedTripName.textContent = `${trip.name} Packing List`;
            if (selectedTripDates) {
                const start = new Date(trip.startDate);
                const end = new Date(trip.endDate);
                selectedTripDates.textContent = `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
            }

            workspace.style.display = 'block';
            setupPackingListener(tripId);
            
            initTripSelector({
                containerId: 'trip-selector-section',
                title: 'Packing Checklist',
                subtitle: 'Select a trip to view and manage your essentials. Never forget an item again!',
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
            console.error("Error loading packing data:", error);
            if (workspace) workspace.innerHTML = `<div style="padding:48px; text-align:center; color:var(--color-error);"><span class="material-symbols-outlined" style="font-size:48px; margin-bottom:16px;">error</span><h3>Error Loading Packing List</h3><p>${error.message}</p></div>`;
            if (workspace) workspace.style.display = 'block';
        }
    }

    function setupPackingListener(tripId) {
        listenToSubcollection(tripId, 'packingItems', (items) => {
            renderPackingCategories(items, tripId);
            updatePackingProgress(items);
            if (window.initScrollAnimations) window.initScrollAnimations();
        }, (error) => {
            console.error("Packing listener error:", error);
        });
    }

    function updatePackingProgress(items) {
        if (!progressCard) return;
        if (items.length === 0) {
            progressCard.style.display = 'none';
            return;
        }
        progressCard.style.display = 'block';
        const packedCount = items.filter(i => i.packed).length;
        const totalCount = items.length;
        const percent = Math.round((packedCount / totalCount) * 100);

        if (progressCountText) progressCountText.textContent = `${packedCount} of ${totalCount} items packed`;
        if (progressPercentText) progressPercentText.textContent = `${percent}%`;
        if (progressFill) progressFill.style.width = `${percent}%`;
    }

    function renderPackingCategories(items, tripId) {
        if (!categoriesGrid) return;
        categoriesGrid.innerHTML = '';

        if (items.length === 0) {
            categoriesGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align:center; padding:64px; background:var(--color-surface-container-low); border-radius:16px;">
                    <span class="material-symbols-outlined" style="font-size:64px; color:var(--color-outline); margin-bottom:16px;">luggage</span>
                    <h3 class="text-headline-md">Your packing list is empty</h3>
                    <p class="text-body-md" style="color:var(--color-on-surface-variant);">Start adding items like "Passport" or "Charger".</p>
                </div>
            `;
            return;
        }

        const categories = {};
        items.forEach(item => {
            if (!categories[item.category]) categories[item.category] = [];
            categories[item.category].push(item);
        });

        Object.entries(categories).forEach(([category, catItems]) => {
            const card = document.createElement('div');
            card.className = 'card card-bordered checklist-category card-enter';
            const packedInCat = catItems.filter(i => i.packed).length;

            card.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                  <div style="display:flex;align-items:center;gap:12px;">
                    <div style="width:40px;height:40px;border-radius:50%;background:var(--color-primary-fixed);display:flex;align-items:center;justify-content:center;">
                      <span class="material-symbols-outlined" style="color:var(--color-primary);font-size:20px;">${getCategoryIcon(category)}</span>
                    </div>
                    <div>
                      <h3 class="text-headline-md" style="font-weight:700;">${category}</h3>
                      <span class="text-label-sm" style="color:var(--color-outline);">${packedInCat}/${catItems.length} Packed</span>
                    </div>
                  </div>
                </div>
                <div class="checklist-items" style="display:flex;flex-direction:column;gap:4px;"></div>
            `;

            const itemsList = card.querySelector('.checklist-items');
            catItems.forEach(item => {
                const label = document.createElement('label');
                label.className = `checklist-item ${item.packed ? 'checked' : ''}`;
                label.innerHTML = `
                    <input type="checkbox" ${item.packed ? 'checked' : ''}>
                    <span class="checklist-text" style="flex:1; ${item.packed ? 'text-decoration:line-through;color:var(--color-outline);' : ''}">${item.name}</span>
                    <button class="delete-item-btn" style="background:none; border:none; color:var(--color-outline); cursor:pointer;">
                        <span class="material-symbols-outlined" style="font-size:18px;">delete</span>
                    </button>
                `;

                label.querySelector('input').addEventListener('change', async (e) => {
                    await updateSubcollectionItem(tripId, 'packingItems', item.id, { packed: e.target.checked });
                });

                label.querySelector('.delete-item-btn').addEventListener('click', async (e) => {
                    e.preventDefault();
                    if (confirm("Delete this item?")) {
                        await deleteSubcollectionItem(tripId, 'packingItems', item.id);
                    }
                });
                itemsList.appendChild(label);
            });
            categoriesGrid.appendChild(card);
        });
    }

    function getCategoryIcon(cat) {
        const icons = { 'Clothing': 'checkroom', 'Electronics': 'devices', 'Toiletries': 'spa', 'Documents': 'description', 'Other': 'shopping_bag' };
        return icons[cat] || 'shopping_bag';
    }

    if (addItemBtn) addItemBtn.addEventListener('click', () => packingModal.style.display = 'flex');
    if (closePackingModalBtn) closePackingModalBtn.addEventListener('click', () => packingModal.style.display = 'none');

    if (packingForm) {
        packingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentTripId) return;
            const name = document.getElementById('pack-name').value;
            const category = document.getElementById('pack-category').value;
            try {
                await addSubcollectionItem(currentTripId, 'packingItems', { name, category, packed: false });
                packingModal.style.display = 'none';
                packingForm.reset();
            } catch (error) {
                console.error("Error adding packing item:", error);
            }
        });
    }
});
