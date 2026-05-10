import { auth, db } from '../firebase/config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js';
import { getTrips, listenToTrips, getSubcollectionItems } from '../firebase/firestore.js';
import { initSidebar } from '../components/sidebar.js';
import { protectRoute } from '../utils/guards.js';
import { getRandomTripImage } from '../utils/defaultTripImages.js';

document.addEventListener('DOMContentLoaded', async () => {
  initSidebar();
  const user = await protectRoute();

  if (!user) return;

  // ═══════════════════════════════════════════
  // 1. HERO SECTION
  // ═══════════════════════════════════════════
  const heroEl = document.getElementById('dash-hero');

  listenToTrips(user.uid, async (trips) => {
    renderHero(user, trips);
    renderKPIs(trips);
    renderUpcomingTrips(trips);
    await renderInsights(trips);
    if (window.initScrollAnimations) window.initScrollAnimations();
  }, (error) => {
    console.error("Dashboard error:", error);
    // Show error in hero area
    heroEl.innerHTML = `
      <div style="padding:48px; text-align:center; background:#fef2f2; border-radius:24px; color:#991b1b;">
        <span class="material-symbols-outlined" style="font-size:48px; margin-bottom:16px;">error</span>
        <h3>Something went wrong</h3>
        <p>${error.message}</p>
        <button onclick="window.location.reload()" class="btn btn-primary" style="margin-top:16px;">Try Again</button>
      </div>
    `;
  });

  function renderHero(user, trips) {
    const name = user.displayName || 'Explorer';
    const firstName = name.split(' ')[0];
    const upcomingCount = trips.filter(t => new Date(t.startDate) >= new Date()).length;

    let subtitle = '';
    if (upcomingCount > 0) {
      subtitle = `You have ${upcomingCount} upcoming adventure${upcomingCount > 1 ? 's' : ''} planned.`;
    } else if (trips.length > 0) {
      subtitle = `You've completed ${trips.length} trip${trips.length > 1 ? 's' : ''}. Ready for the next one?`;
    } else {
      subtitle = 'Ready to plan your next unforgettable journey?';
    }

    // Find the next upcoming trip's cover image
    const nextTrip = trips
      .filter(t => new Date(t.startDate) >= new Date())
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0];

    const heroImage = getRandomTripImage();

    heroEl.innerHTML = `
            <div class="dash-hero-greeting">
                <h1>Welcome back, ${firstName} 👋</h1>
                <p>${subtitle}</p>
                <div class="dash-hero-actions">
                    <a href="create-trip.html" class="btn btn-primary magnetic-lift" style="padding:12px 24px; font-size:15px; font-weight:600; border-radius:14px;">
                        <span class="material-symbols-outlined" style="font-size:20px;">add</span>
                        Create New Trip
                    </a>
                    <a href="shared-trips.html" class="btn btn-surface magnetic-lift" style="padding:12px 24px; font-size:15px; font-weight:600; border-radius:14px; border:1px solid rgba(0,0,0,0.1);">
                        <span class="material-symbols-outlined" style="font-size:20px;">explore</span>
                        Explore Destinations
                    </a>
                </div>
            </div>
            <div style="display:flex; justify-content:center;">
                <img class="dash-hero-img" src="${heroImage}" alt="Next adventure" loading="lazy">
            </div>
        `;
  }

  // ═══════════════════════════════════════════
  // 2. KPI STATISTICS
  // ═══════════════════════════════════════════
  function renderKPIs(trips) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const totalTrips = trips.length;
    const upcomingTrips = trips.filter(t => {
      const start = new Date(t.startDate);
      start.setHours(0, 0, 0, 0);
      return start >= now;
    }).length;

    // Calculate total budget from trip data
    let totalBudget = 0;
    trips.forEach(t => {
      totalBudget += (t.budget || 0);
    });

    // Count unique destinations/countries
    const destinations = new Set();
    trips.forEach(t => {
      if (t.destination) destinations.add(t.destination);
      if (t.name) {
        // Extract location hints from trip name
        const parts = t.name.split(/[–—-]/);
        if (parts.length > 1) destinations.add(parts[parts.length - 1].trim());
      }
    });
    const countriesCount = destinations.size || totalTrips;

    const kpiGrid = document.getElementById('kpi-grid');
    kpiGrid.innerHTML = `
            <div class="kpi-card hover-shine glass-hover">
                <div class="kpi-icon"><span class="material-symbols-outlined">flight_takeoff</span></div>
                <div class="kpi-number">${totalTrips}</div>
                <div class="kpi-label">Total Trips</div>
            </div>
            <div class="kpi-card hover-shine glass-hover">
                <div class="kpi-icon"><span class="material-symbols-outlined">calendar_month</span></div>
                <div class="kpi-number">${upcomingTrips}</div>
                <div class="kpi-label">Upcoming Trips</div>
            </div>
            <div class="kpi-card hover-shine glass-hover">
                <div class="kpi-icon"><span class="material-symbols-outlined">account_balance_wallet</span></div>
                <div class="kpi-number">₹${formatNumber(totalBudget)}</div>
                <div class="kpi-label">Estimated Budget</div>
            </div>
            <div class="kpi-card hover-shine glass-hover">
                <div class="kpi-icon"><span class="material-symbols-outlined">public</span></div>
                <div class="kpi-number">${countriesCount}</div>
                <div class="kpi-label">Destinations</div>
            </div>
        `;
  }

  // ═══════════════════════════════════════════
  // 3. UPCOMING TRIPS
  // ═══════════════════════════════════════════
  function renderUpcomingTrips(trips) {
    const container = document.getElementById('trips-container');
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const upcoming = trips
      .filter(t => {
        if (!t.startDate) return false;
        const start = new Date(t.startDate);
        start.setHours(0, 0, 0, 0);
        return start >= now;
      })
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .slice(0, 6);

    if (upcoming.length === 0) {
      // Show ALL trips if no upcoming, or empty state
      const recentTrips = trips.slice(0, 3);
      if (recentTrips.length === 0) {
        container.innerHTML = `
                    <div class="empty-state" style="grid-column:1/-1;">
                        <span class="material-symbols-outlined">flight_takeoff</span>
                        <h3>No trips yet</h3>
                        <p>Start planning your first adventure — it only takes a minute!</p>
                        <a href="create-trip.html" class="btn btn-primary" style="padding:12px 28px; border-radius:14px;">Create Your First Trip</a>
                    </div>
                `;
        return;
      }
      renderTripCards(container, recentTrips);
      return;
    }

    renderTripCards(container, upcoming);
  }

  function renderTripCards(container, trips) {
    container.innerHTML = '';
    const now = new Date();

    trips.forEach(trip => {
      const startDate = new Date(trip.startDate);
      const endDate = new Date(trip.endDate);
      const daysUntil = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
      const tripDuration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

      const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      const coverImg = trip.coverImage || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=200&fit=crop';

      let badgeText = '';
      if (daysUntil > 0) {
        badgeText = `✈️ ${daysUntil} day${daysUntil > 1 ? 's' : ''} to go`;
      } else if (daysUntil === 0) {
        badgeText = '🎉 Starts today!';
      } else {
        badgeText = '✅ Completed';
      }

      const card = document.createElement('div');
      card.className = 'dash-trip-card hover-shine';
      card.innerHTML = `
                <img class="dash-trip-card-img" src="${coverImg}" alt="${trip.name}" loading="lazy">
                <div class="dash-trip-card-body">
                    <h3>${trip.name}</h3>
                    <div class="dash-trip-meta">
                        <span><span class="material-symbols-outlined">calendar_today</span>${startStr} — ${endStr}</span>
                        <span><span class="material-symbols-outlined">schedule</span>${tripDuration} days</span>
                    </div>
                    ${trip.budget ? `<div class="dash-trip-meta" style="margin-top:8px;"><span><span class="material-symbols-outlined">payments</span>₹${formatNumber(trip.budget)}</span></div>` : ''}
                    <div class="dash-days-badge">${badgeText}</div>
                </div>
            `;

      card.addEventListener('click', () => {
        window.location.href = `trip-details.html?tripId=${trip.id}`;
      });

      container.appendChild(card);
    });
  }

  // ═══════════════════════════════════════════
  // 4. INSIGHTS (Budget, Packing, Activity)
  // ═══════════════════════════════════════════
  async function renderInsights(trips) {
    await renderBudgetInsight(trips);
    await renderPackingInsight(trips);
    renderActivityTimeline(trips);
  }

  async function renderBudgetInsight(trips) {
    const card = document.getElementById('budget-insight');
    if (!card) return;

    const headerHTML = '<h3><span class="material-symbols-outlined">payments</span> Budget Overview</h3>';

    if (trips.length === 0) {
      card.innerHTML = headerHTML + `
                <div style="text-align:center; padding:24px; color:#94a3b8;">
                    <span class="material-symbols-outlined" style="font-size:40px; margin-bottom:8px;">savings</span>
                    <p style="font-size:14px;">Add a budget to your trips to see insights here.</p>
                </div>`;
      return;
    }

    // Aggregate expenses from the first upcoming or most recent trip
    const targetTrip = trips.find(t => new Date(t.startDate) >= new Date()) || trips[0];
    let expenses = [];
    try {
      expenses = await getSubcollectionItems(targetTrip.id, 'expenses');
    } catch (e) { /* no expenses yet */ }

    const categories = {};
    let totalSpent = 0;
    expenses.forEach(exp => {
      const cat = exp.category || 'Other';
      categories[cat] = (categories[cat] || 0) + (exp.amount || 0);
      totalSpent += (exp.amount || 0);
    });

    const budget = targetTrip.budget || 0;
    const remaining = budget - totalSpent;
    const barColors = ['#2563eb', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    let barsHTML = '';
    if (Object.keys(categories).length > 0) {
      const maxVal = Math.max(...Object.values(categories));
      Object.entries(categories).forEach(([cat, val], i) => {
        const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
        barsHTML += `
                    <div class="budget-bar-row">
                        <span class="budget-bar-label">${cat}</span>
                        <div class="budget-bar-track">
                            <div class="budget-bar-fill" style="width:${pct}%; background:${barColors[i % barColors.length]};"></div>
                        </div>
                        <span class="budget-bar-val">₹${formatNumber(val)}</span>
                    </div>`;
      });
    } else {
      barsHTML = `<div style="text-align:center; padding:16px; color:#94a3b8; font-size:14px;">No expenses tracked yet for <strong>${targetTrip.name}</strong>.</div>`;
    }

    card.innerHTML = headerHTML + `
            <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
                <div>
                    <div style="font-size:12px; color:#64748b; font-weight:500;">Total Budget</div>
                    <div style="font-size:22px; font-weight:800; color:#0f172a;">₹${formatNumber(budget)}</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:12px; color:#64748b; font-weight:500;">Spent</div>
                    <div style="font-size:22px; font-weight:800; color:${remaining < 0 ? '#ef4444' : '#14b8a6'};">₹${formatNumber(totalSpent)}</div>
                </div>
            </div>
            ${barsHTML}
        `;
  }

  async function renderPackingInsight(trips) {
    const card = document.getElementById('packing-insight');
    if (!card) return;

    const headerHTML = '<h3><span class="material-symbols-outlined">inventory_2</span> Packing Progress</h3>';

    if (trips.length === 0) {
      card.innerHTML = headerHTML + `
                <div style="text-align:center; padding:24px; color:#94a3b8;">
                    <span class="material-symbols-outlined" style="font-size:40px; margin-bottom:8px;">luggage</span>
                    <p style="font-size:14px;">Create a trip first, then add packing items.</p>
                </div>`;
      return;
    }

    const targetTrip = trips.find(t => new Date(t.startDate) >= new Date()) || trips[0];
    let items = [];
    try {
      items = await getSubcollectionItems(targetTrip.id, 'packingItems');
    } catch (e) { /* no items */ }

    const total = items.length;
    const packed = items.filter(i => i.packed).length;
    const pct = total > 0 ? Math.round((packed / total) * 100) : 0;
    const circumference = 2 * Math.PI * 42;
    const offset = circumference - (pct / 100) * circumference;

    if (total === 0) {
      card.innerHTML = headerHTML + `
                <div style="text-align:center; padding:24px; color:#94a3b8;">
                    <span class="material-symbols-outlined" style="font-size:40px; margin-bottom:8px;">luggage</span>
                    <p style="font-size:14px;">No packing items for <strong>${targetTrip.name}</strong> yet.</p>
                    <a href="packing.html?id=${targetTrip.id}" class="btn btn-ghost btn-sm" style="margin-top:8px;">Add Items</a>
                </div>`;
      return;
    }

    card.innerHTML = headerHTML + `
            <div class="progress-ring-container">
                <div class="progress-ring">
                    <svg width="100" height="100" viewBox="0 0 100 100">
                        <circle class="progress-ring-bg" cx="50" cy="50" r="42"/>
                        <circle class="progress-ring-fill" cx="50" cy="50" r="42"
                            stroke-dasharray="${circumference}"
                            stroke-dashoffset="${offset}"/>
                    </svg>
                    <div class="progress-ring-text">${pct}%</div>
                </div>
                <div>
                    <div style="font-size:16px; font-weight:700; color:#0f172a; margin-bottom:4px;">${packed} of ${total} packed</div>
                    <div style="font-size:13px; color:#64748b; margin-bottom:12px;">${targetTrip.name}</div>
                    <a href="packing.html?id=${targetTrip.id}" style="font-size:13px; font-weight:600; color:#2563eb; text-decoration:none;">
                        Continue packing →
                    </a>
                </div>
            </div>
        `;
  }

  function renderActivityTimeline(trips) {
    const card = document.getElementById('activity-insight');
    if (!card) return;

    const headerHTML = '<h3><span class="material-symbols-outlined">timeline</span> Recent Activity</h3>';

    if (trips.length === 0) {
      card.innerHTML = headerHTML + `
                <div style="text-align:center; padding:24px; color:#94a3b8;">
                    <span class="material-symbols-outlined" style="font-size:40px; margin-bottom:8px;">history</span>
                    <p style="font-size:14px;">Your activity will appear here as you plan trips.</p>
                </div>`;
      return;
    }

    // Build timeline from trip creation dates
    const events = trips
      .filter(t => t.createdAt)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(trip => {
        const date = new Date(trip.createdAt);
        const timeAgo = getTimeAgo(date);
        return `
                    <div class="timeline-item">
                        <div class="timeline-dot" style="background:#2563eb;"></div>
                        <div class="timeline-text">Created trip <strong>${trip.name}</strong></div>
                        <div class="timeline-time">${timeAgo}</div>
                    </div>`;
      });

    card.innerHTML = headerHTML + (events.length > 0 ? events.join('') : `
            <div style="text-align:center; padding:24px; color:#94a3b8; font-size:14px;">No recent activity.</div>
        `);
  }

  // ═══════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════
  function formatNumber(num) {
    if (num >= 100000) return (num / 100000).toFixed(1) + 'L';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString('en-IN');
  }

  function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
});
