import { auth, db } from '../firebase/config.js';
import { getTrip, addSubcollectionItem, listenToSubcollection } from '../firebase/firestore.js';
import { initSidebar } from '../components/sidebar.js';
import { protectRoute } from '../utils/guards.js';
import { initTripSelector } from '../utils/tripSelector.js';

// Cache to store exchange rates to avoid hitting the API too often
const rateCache = {};
const CACHE_DURATION_MS = 1000 * 60 * 60; // 1 hour

document.addEventListener('DOMContentLoaded', async () => {
    initSidebar();
    const user = await protectRoute();
    if (!user) return;

    const workspace = document.getElementById('feature-workspace');
    const selectedTripNameHeader = document.getElementById('selected-trip-name');
    
    const amountInput = document.getElementById('from-amount');
    const fromSelect = document.getElementById('from-currency');
    const toSelect = document.getElementById('to-currency');
    const toAmountInput = document.getElementById('to-amount');
    const swapBtn = document.getElementById('swap-btn');
    const convertBtn = document.getElementById('curr-btn');
    const quickBtns = document.querySelectorAll('.curr-quick-btn');
    
    const resultBox = document.getElementById('curr-result');
    const resAmountFrom = document.getElementById('res-amount-from');
    const resAmountTo = document.getElementById('res-amount-to');
    const resRate = document.getElementById('res-rate');
    const resInsight = document.getElementById('res-insight');
    const resUpdated = document.getElementById('res-updated');
    const historyList = document.getElementById('curr-history-list');

    // Initial trip context
    let currentTripId = new URLSearchParams(window.location.search).get('tripId') || new URLSearchParams(window.location.search).get('id');

    // Initialize Trip Selector
    initTripSelector({
        containerId: 'trip-selector-section',
        title: 'Currency Converter',
        subtitle: 'Select a trip to get financial insights tailored to your destination.',
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
        try {
            const trip = await getTrip(tripId);
            if (trip && selectedTripNameHeader) {
                selectedTripNameHeader.textContent = `Currency Converter for ${trip.name}`;
            }
            if (window.initScrollAnimations) window.initScrollAnimations();
        } catch (error) {
            console.error("Error loading trip context:", error);
        }
    }

    async function getRates(baseCurrency) {
        const now = Date.now();
        if (rateCache[baseCurrency] && (now - rateCache[baseCurrency].timestamp < CACHE_DURATION_MS)) {
            return rateCache[baseCurrency].rates;
        }

        try {
            const response = await fetch(`https://open.er-api.com/v6/latest/${baseCurrency}`);
            if (!response.ok) throw new Error('API request failed');
            const data = await response.json();
            
            rateCache[baseCurrency] = {
                timestamp: now,
                rates: data.rates,
                lastUpdate: new Date(data.time_last_update_unix * 1000)
            };
            return data.rates;
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            return getOfflineFallbackRates(baseCurrency);
        }
    }

    function getOfflineFallbackRates(base) {
        const usdRates = { INR: 83.5, EUR: 0.92, GBP: 0.79, AED: 3.67, SGD: 1.35, THB: 36.5, JPY: 155.0, AUD: 1.52, CAD: 1.37, CHF: 0.91, USD: 1 };
        if (base === 'USD') return usdRates;
        const baseToUsd = 1 / (usdRates[base] || 1);
        const rates = {};
        for (const [curr, rate] of Object.entries(usdRates)) {
            rates[curr] = rate * baseToUsd;
        }
        return rates;
    }

    if (swapBtn) {
        swapBtn.addEventListener('click', () => {
            const temp = fromSelect.value;
            fromSelect.value = toSelect.value;
            toSelect.value = temp;
            if (resultBox && resultBox.classList.contains('show')) {
                convertBtn.click();
            }
        });
    }

    quickBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            fromSelect.value = btn.dataset.from;
            toSelect.value = btn.dataset.to;
            convertBtn.click();
        });
    });

    if (convertBtn) {
        convertBtn.addEventListener('click', async () => {
            const amount = parseFloat(amountInput.value);
            if (isNaN(amount) || amount <= 0) {
                amountInput.style.borderColor = '#ef4444';
                setTimeout(() => amountInput.style.borderColor = '', 2000);
                return;
            }

            const from = fromSelect.value;
            const to = toSelect.value;

            if (from === to) {
                alert('Please select different currencies.');
                return;
            }

            convertBtn.disabled = true;
            const originalText = convertBtn.innerHTML;
            convertBtn.innerHTML = '<span class="material-symbols-outlined" style="animation:spin 1s linear infinite;">sync</span> Converting...';

            try {
                const rates = await getRates(from);
                const rate = rates[to];
                const convertedAmount = amount * rate;

                if (toAmountInput) toAmountInput.value = convertedAmount.toFixed(2);
                if (resAmountFrom) resAmountFrom.textContent = `${amount.toLocaleString(undefined, {maximumFractionDigits:2})} ${from} =`;
                if (resAmountTo) resAmountTo.textContent = `${convertedAmount.toLocaleString(undefined, {maximumFractionDigits:2})} ${to}`;
                if (resRate) resRate.textContent = `1 ${from} = ${rate.toFixed(4)} ${to}`;
                
                const updateTime = rateCache[from]?.lastUpdate || new Date();
                if (resUpdated) resUpdated.textContent = `Last updated: ${updateTime.toLocaleString()}`;

                if (resInsight) resInsight.textContent = generateTravelInsight(amount, from, convertedAmount, to);

                if (resultBox) {
                    resultBox.classList.add('show');
                    if (window.initScrollAnimations) window.initScrollAnimations();
                }

                try {
                    await addSubcollectionItem(user.uid, 'currencyHistory', {
                        amount, fromCurrency: from, toCurrency: to, convertedAmount, rate, timestamp: Date.now()
                    });
                } catch (e) {
                    console.error("Failed to save history", e);
                }

            } catch (error) {
                console.error(error);
                alert('Failed to convert. Please check your connection.');
            } finally {
                convertBtn.disabled = false;
                convertBtn.innerHTML = originalText;
            }
        });
    }

    function generateTravelInsight(origAmt, from, convAmt, to) {
        let usdEquiv = convAmt;
        const usdApproxRates = { USD: 1, EUR: 1.08, GBP: 1.26, AED: 0.27, JPY: 0.0065, THB: 0.027, INR: 0.012, SGD: 0.74, AUD: 0.65, CAD: 0.73, CHF: 1.1 };
        
        if (to !== 'USD' && usdApproxRates[to]) {
            usdEquiv = convAmt * usdApproxRates[to];
        } else if (from !== 'USD' && usdApproxRates[from]) {
            usdEquiv = origAmt * usdApproxRates[from];
        }

        if (usdEquiv < 50) return `This is a very small amount. Good for a quick meal or a short taxi ride.`;
        if (usdEquiv < 200) return `Approximately $${Math.round(usdEquiv)} USD. Good for 1-2 days of budget travel.`;
        if (usdEquiv < 600) return `Approximately $${Math.round(usdEquiv)} USD. A solid budget for a short 3-4 day trip.`;
        if (usdEquiv < 1500) return `Approximately $${Math.round(usdEquiv)} USD. Good for a moderate 5-7 day trip.`;
        if (usdEquiv < 3000) return `Approximately $${Math.round(usdEquiv)} USD. Excellent for a 10-14 day vacation!`;
        return `Approximately $${Math.round(usdEquiv)} USD. You have a premium budget!`;
    }

    if (historyList) {
        listenToSubcollection(user.uid, 'currencyHistory', (historyItems) => {
            if (!historyItems || historyItems.length === 0) {
                historyList.innerHTML = '<div style="text-align:center; padding:20px; color:#94a3b8; font-size:13px;">No recent conversions.</div>';
                return;
            }

            historyItems.sort((a, b) => b.timestamp - a.timestamp);
            const topHistory = historyItems.slice(0, 5);

            historyList.innerHTML = topHistory.map(item => `
                <div class="curr-history-item">
                    <div>
                        <div class="curr-history-val">${item.amount.toLocaleString(undefined, {maximumFractionDigits:2})} ${item.fromCurrency} → ${item.convertedAmount.toLocaleString(undefined, {maximumFractionDigits:2})} ${item.toCurrency}</div>
                        <div class="curr-history-sub">${new Date(item.timestamp).toLocaleString()}</div>
                    </div>
                    <div class="curr-history-rate">${item.rate.toFixed(4)}</div>
                </div>
            `).join('');
            if (window.initScrollAnimations) window.initScrollAnimations();
        }, (error) => {
            console.error("Currency history listener error:", error);
        });
    }
});
