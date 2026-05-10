import { auth, db } from '../firebase/config.js';
import { getTrip } from '../firebase/firestore.js';
import { doc, getDoc, setDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js';
import { initSidebar } from '../components/sidebar.js';
import { protectRoute } from '../utils/guards.js';
import { initTripSelector } from '../utils/tripSelector.js';

document.addEventListener('DOMContentLoaded', async () => {
    initSidebar();
    const user = await protectRoute();
    if (!user) return;

    const workspace = document.getElementById('feature-workspace');
    const totalBudgetVal = document.getElementById('total-budget-val');
    const costPerDayVal = document.getElementById('cost-per-day-val');
    const convertedBudgetVal = document.getElementById('converted-budget-val');
    const currencySelect = document.getElementById('currency-select');
    const budgetForm = document.getElementById('budget-form');
    const selectedTripName = document.getElementById('selected-trip-name');
    const selectedTripDates = document.getElementById('selected-trip-dates');
    const budgetSummaryList = document.getElementById('budget-summary-list');

    let tripDays = 1;
    let currentBudget = 0;

    // Fixed exchange rates for demo purposes
    const exchangeRates = {
        USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.5, JPY: 153.2
    };

    const costInputs = {
        accommodation: document.getElementById('cost-accommodation'),
        transportation: document.getElementById('cost-transportation'),
        meals: document.getElementById('cost-meals'),
        activities: document.getElementById('cost-activities'),
        shopping: document.getElementById('cost-shopping'),
        misc: document.getElementById('cost-misc')
    };

    // Initial trip context
    let currentTripId = new URLSearchParams(window.location.search).get('tripId') || new URLSearchParams(window.location.search).get('id');

    // Initialize Trip Selector
    initTripSelector({
        containerId: 'trip-selector-section',
        title: 'Budget Planner',
        subtitle: 'Select a trip to manage your expenses and track spending.',
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

            if (selectedTripName) selectedTripName.textContent = `${trip.name} Budget`;
            if (selectedTripDates) {
                const start = new Date(trip.startDate);
                const end = new Date(trip.endDate);
                tripDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
                selectedTripDates.textContent = `${start.toLocaleDateString()} - ${end.toLocaleDateString()} (${tripDays} Days)`;
            }

            workspace.style.display = 'block';
            setupBudgetListener(tripId);
            
            initTripSelector({
                containerId: 'trip-selector-section',
                title: 'Budget Planner',
                subtitle: 'Select a trip to manage your expenses and track spending.',
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
            console.error("Error loading budget data:", error);
            if (workspace) workspace.innerHTML = `<div style="padding:48px; text-align:center; color:var(--color-error);"><span class="material-symbols-outlined" style="font-size:48px; margin-bottom:16px;">error</span><h3>Error Loading Budget</h3><p>${error.message}</p></div>`;
            if (workspace) workspace.style.display = 'block';
        }
    }

    function setupBudgetListener(tripId) {
        const budgetRef = doc(db, 'budgets', tripId);
        onSnapshot(budgetRef, (docSnap) => {
            const data = docSnap.exists() ? docSnap.data() : {};
            Object.keys(costInputs).forEach(key => {
                if (data[key] !== undefined) {
                    costInputs[key].value = data[key];
                }
            });
            updateCalculations(data);
            if (window.initScrollAnimations) window.initScrollAnimations();
        }, (error) => {
            console.error("Budget listener error:", error);
        });
    }

    function updateCalculations(data) {
        let total = 0;
        const categories = [];

        Object.keys(costInputs).forEach(key => {
            const val = parseFloat(data[key]) || 0;
            total += val;
            if (val > 0) {
                categories.push({ name: key.charAt(0).toUpperCase() + key.slice(1), value: val });
            }
        });

        currentBudget = total;
        if (totalBudgetVal) totalBudgetVal.textContent = `$${total.toLocaleString()}`;
        if (costPerDayVal) costPerDayVal.textContent = `$${Math.round(total / tripDays).toLocaleString()}`;

        updateCurrencyConversion();
        renderCharts(categories, total);
    }

    function updateCurrencyConversion() {
        const targetCurrency = currencySelect.value;
        const rate = exchangeRates[targetCurrency] || 1;
        const converted = Math.round(currentBudget * rate);

        let symbol = '$';
        if (targetCurrency === 'EUR') symbol = '€';
        if (targetCurrency === 'GBP') symbol = '£';
        if (targetCurrency === 'INR') symbol = '₹';
        if (targetCurrency === 'JPY') symbol = '¥';

        if (convertedBudgetVal) convertedBudgetVal.textContent = `${symbol}${converted.toLocaleString()}`;
    }

    function renderCharts(categories, total) {
        if (!budgetSummaryList) return;
        budgetSummaryList.innerHTML = '';

        if (total === 0 || categories.length === 0) {
            budgetSummaryList.innerHTML = '<p class="text-body-sm" style="color:var(--color-outline); text-align:center;">Enter values to see breakdown.</p>';
            return;
        }

        categories.sort((a, b) => b.value - a.value);

        categories.forEach(cat => {
            const percent = Math.round((cat.value / total) * 100);
            const bar = document.createElement('div');
            bar.style.marginBottom = '12px';
            bar.innerHTML = `
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span class="text-label-sm">${cat.name}</span>
                    <span class="text-label-sm" style="font-weight:700;">$${cat.value.toLocaleString()} (${percent}%)</span>
                </div>
                <div class="progress-track" style="height:8px; background:var(--color-surface-container-high);">
                    <div class="progress-fill progress-fill-primary" style="width:${percent}%; border-radius:4px; height: 100%;"></div>
                </div>
            `;
            budgetSummaryList.appendChild(bar);
        });
    }

    if (currencySelect) {
        currencySelect.addEventListener('change', updateCurrencyConversion);
    }

    if (budgetForm) {
        budgetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = budgetForm.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.textContent = 'Saving...';

            const budgetData = {};
            Object.keys(costInputs).forEach(key => {
                budgetData[key] = parseFloat(costInputs[key].value) || 0;
            });
            budgetData.updatedAt = new Date().toISOString();

            try {
                await setDoc(doc(db, 'budgets', currentTripId), budgetData, { merge: true });
                showToast("Budget saved successfully!");
            } catch (error) {
                console.error("Error saving budget:", error);
                showToast("Failed to save budget", "error");
            } finally {
                btn.disabled = false;
                btn.textContent = 'Save Budget';
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
