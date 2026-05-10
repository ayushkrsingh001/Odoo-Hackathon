import { auth } from '../firebase/config.js';
import { createTrip } from '../firebase/firestore.js';
import { initSidebar } from '../components/sidebar.js';
import { protectRoute } from '../utils/guards.js';

// ═══════════════════════════════════════════════
// CURATED TRIP DATABASE
// ═══════════════════════════════════════════════
const CURATED_TRIPS = [
    // ── INDIA ──
    {
        id: 'goa-beach', title: 'Goa Beach Escape', country: 'India', region: 'india',
        destinations: 'North Goa, South Goa, Panjim',
        days: 4, budget: 15000, budgetLabel: '₹15K',
        category: ['budget', 'solo'], bestSeason: 'Oct – Mar',
        rating: 4.8, copiedCount: 1247,
        description: 'Sun-kissed beaches, vibrant nightlife, and Portuguese architecture. Perfect for a quick coastal getaway.',
        coverImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&w=500&q=80'
    },
    {
        id: 'manali-kasol', title: 'Manali & Kasol Adventure', country: 'India', region: 'india',
        destinations: 'Manali, Kasol, Kheerganga, Tosh',
        days: 6, budget: 12000, budgetLabel: '₹12K',
        category: ['adventure', 'budget', 'solo'], bestSeason: 'Mar – Jun',
        rating: 4.9, copiedCount: 2103,
        description: 'Trek through the Parvati Valley, camp under the stars at Kheerganga, and explore the hippie vibes of Kasol.',
        coverImage: 'https://images.unsplash.com/photo-1455156218388-5e61b526818b?auto=format&w=500&q=80'
    },
    {
        id: 'leh-ladakh', title: 'Leh-Ladakh Road Trip', country: 'India', region: 'india',
        destinations: 'Leh, Pangong Lake, Nubra Valley, Khardung La',
        days: 8, budget: 25000, budgetLabel: '₹25K',
        category: ['adventure', 'solo'], bestSeason: 'Jun – Sep',
        rating: 4.9, copiedCount: 3452,
        description: 'The ultimate road trip through the highest motorable passes, pristine lakes, and ancient Buddhist monasteries.',
        coverImage: 'https://images.unsplash.com/photo-1609766856923-7e0a1f8d8b1d?auto=format&w=500&q=80'
    },
    {
        id: 'rajasthan-royal', title: 'Rajasthan Royal Tour', country: 'India', region: 'india',
        destinations: 'Jaipur, Udaipur, Jodhpur, Jaisalmer',
        days: 7, budget: 30000, budgetLabel: '₹30K',
        category: ['family', 'luxury'], bestSeason: 'Oct – Mar',
        rating: 4.7, copiedCount: 1890,
        description: 'Experience the grandeur of royal palaces, desert safaris, and the vibrant culture of Rajasthan.',
        coverImage: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&w=500&q=80'
    },
    {
        id: 'kerala-backwaters', title: 'Kerala Backwaters Retreat', country: 'India', region: 'india',
        destinations: 'Alleppey, Munnar, Kochi, Thekkady',
        days: 5, budget: 20000, budgetLabel: '₹20K',
        category: ['honeymoon', 'family'], bestSeason: 'Sep – Mar',
        rating: 4.8, copiedCount: 2567,
        description: 'Cruise through serene backwaters on a houseboat, explore tea plantations, and savor authentic Kerala cuisine.',
        coverImage: 'https://images.unsplash.com/photo-1593693411515-c20261bcad6e?auto=format&w=500&q=80'
    },
    {
        id: 'kashmir-paradise', title: 'Kashmir Paradise Tour', country: 'India', region: 'india',
        destinations: 'Srinagar, Gulmarg, Pahalgam, Sonmarg',
        days: 6, budget: 22000, budgetLabel: '₹22K',
        category: ['honeymoon', 'family'], bestSeason: 'Apr – Oct',
        rating: 4.9, copiedCount: 2890,
        description: 'Shikara rides on Dal Lake, skiing in Gulmarg, and meadows that look like paradise on earth.',
        coverImage: 'https://images.unsplash.com/photo-1597074866923-dc0589150a53?auto=format&w=500&q=80'
    },
    {
        id: 'andaman-island', title: 'Andaman Island Getaway', country: 'India', region: 'india',
        destinations: 'Port Blair, Havelock, Neil Island',
        days: 5, budget: 28000, budgetLabel: '₹28K',
        category: ['honeymoon', 'adventure'], bestSeason: 'Oct – May',
        rating: 4.7, copiedCount: 1456,
        description: 'Crystal-clear waters, pristine beaches, scuba diving, and the historic Cellular Jail.',
        coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&w=500&q=80'
    },
    {
        id: 'rishikesh-adventure', title: 'Rishikesh Adventure Camp', country: 'India', region: 'india',
        destinations: 'Rishikesh, Ram Jhula, Triveni Ghat',
        days: 3, budget: 8000, budgetLabel: '₹8K',
        category: ['adventure', 'budget', 'solo'], bestSeason: 'Sep – May',
        rating: 4.6, copiedCount: 987,
        description: 'White-water rafting, bungee jumping, cliff diving, and yoga by the Ganges.',
        coverImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&w=500&q=80'
    },
    {
        id: 'meghalaya-trail', title: 'Meghalaya Nature Trail', country: 'India', region: 'india',
        destinations: 'Shillong, Cherrapunji, Dawki, Living Root Bridges',
        days: 6, budget: 18000, budgetLabel: '₹18K',
        category: ['adventure', 'solo'], bestSeason: 'Oct – Apr',
        rating: 4.8, copiedCount: 1234,
        description: 'Living root bridges, the cleanest village in Asia, crystal-clear rivers, and cascading waterfalls.',
        coverImage: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&w=500&q=80'
    },
    {
        id: 'varanasi-spiritual', title: 'Varanasi Spiritual Journey', country: 'India', region: 'india',
        destinations: 'Varanasi, Sarnath, Dashashwamedh Ghat',
        days: 3, budget: 7000, budgetLabel: '₹7K',
        category: ['budget', 'solo'], bestSeason: 'Oct – Mar',
        rating: 4.5, copiedCount: 876,
        description: 'Witness the mesmerizing Ganga Aarti, explore ancient temples, and experience India\'s spiritual heart.',
        coverImage: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&w=500&q=80'
    },

    // ── INTERNATIONAL ──
    {
        id: 'dubai-luxury', title: 'Dubai Luxury Escape', country: 'UAE', region: 'international',
        destinations: 'Dubai Marina, Burj Khalifa, Palm Jumeirah, Desert Safari',
        days: 5, budget: 80000, budgetLabel: '₹80K',
        category: ['luxury', 'family'], bestSeason: 'Nov – Mar',
        rating: 4.8, copiedCount: 1678,
        description: 'Sky-high luxury, golden deserts, world-class shopping, and architectural marvels.',
        coverImage: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&w=500&q=80'
    },
    {
        id: 'bali-tropical', title: 'Bali Tropical Paradise', country: 'Indonesia', region: 'international',
        destinations: 'Ubud, Seminyak, Nusa Penida, Tegallalang',
        days: 6, budget: 55000, budgetLabel: '₹55K',
        category: ['honeymoon', 'solo'], bestSeason: 'Apr – Oct',
        rating: 4.9, copiedCount: 3201,
        description: 'Rice terraces, sacred temples, beach clubs, and the most Instagrammable spots in Southeast Asia.',
        coverImage: 'https://images.unsplash.com/photo-1573790387438-4da905039392?auto=format&w=500&q=80'
    },
    {
        id: 'thailand-islands', title: 'Thailand Island Hopper', country: 'Thailand', region: 'international',
        destinations: 'Bangkok, Phuket, Phi Phi Islands, Krabi',
        days: 7, budget: 45000, budgetLabel: '₹45K',
        category: ['budget', 'adventure', 'solo'], bestSeason: 'Nov – Apr',
        rating: 4.7, copiedCount: 2456,
        description: 'Island-hop through turquoise waters, enjoy street food, and experience the Land of Smiles.',
        coverImage: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&w=500&q=80'
    },
    {
        id: 'singapore-city', title: 'Singapore City Explorer', country: 'Singapore', region: 'international',
        destinations: 'Marina Bay, Sentosa, Gardens by the Bay, Chinatown',
        days: 4, budget: 60000, budgetLabel: '₹60K',
        category: ['family', 'luxury'], bestSeason: 'Feb – Apr',
        rating: 4.6, copiedCount: 1345,
        description: 'A futuristic city-state with world-class dining, theme parks, and the iconic Marina Bay Sands.',
        coverImage: 'https://images.unsplash.com/photo-1496939376851-89342e90adcd?auto=format&w=500&q=80'
    },
    {
        id: 'maldives-honeymoon', title: 'Maldives Honeymoon', country: 'Maldives', region: 'international',
        destinations: 'Malé, Overwater Villas, Snorkeling Reefs',
        days: 5, budget: 120000, budgetLabel: '₹1.2L',
        category: ['luxury', 'honeymoon'], bestSeason: 'Nov – Apr',
        rating: 4.9, copiedCount: 4102,
        description: 'Overwater bungalows, private beaches, bioluminescent waters, and the ultimate romantic escape.',
        coverImage: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&w=500&q=80'
    },
    {
        id: 'europe-highlights', title: 'Europe Highlights Tour', country: 'Multi-Country', region: 'international',
        destinations: 'Paris, Amsterdam, Zurich, Rome',
        days: 10, budget: 200000, budgetLabel: '₹2L',
        category: ['luxury', 'family'], bestSeason: 'May – Sep',
        rating: 4.8, copiedCount: 1987,
        description: 'The quintessential European adventure — from the Eiffel Tower to the Colosseum in one unforgettable trip.',
        coverImage: 'https://images.unsplash.com/photo-1491557345352-5929e343eb89?auto=format&w=500&q=80'
    },
    {
        id: 'japan-cherry', title: 'Japan Cherry Blossom Tour', country: 'Japan', region: 'international',
        destinations: 'Tokyo, Kyoto, Osaka, Mount Fuji',
        days: 8, budget: 150000, budgetLabel: '₹1.5L',
        category: ['family', 'solo'], bestSeason: 'Mar – Apr',
        rating: 4.9, copiedCount: 2678,
        description: 'Witness sakura season, explore ancient temples, ride the Shinkansen, and taste the world\'s best ramen.',
        coverImage: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&w=500&q=80'
    },
    {
        id: 'switzerland-scenic', title: 'Switzerland Scenic Journey', country: 'Switzerland', region: 'international',
        destinations: 'Zurich, Interlaken, Lucerne, Jungfraujoch',
        days: 7, budget: 180000, budgetLabel: '₹1.8L',
        category: ['luxury', 'honeymoon'], bestSeason: 'Jun – Sep',
        rating: 4.9, copiedCount: 2345,
        description: 'Snow-capped Alps, scenic train rides, chocolate factories, and picture-perfect lakeside towns.',
        coverImage: 'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&w=500&q=80'
    },
    {
        id: 'paris-rome', title: 'Paris & Rome Romantic Trip', country: 'France & Italy', region: 'international',
        destinations: 'Paris, Venice, Florence, Rome',
        days: 8, budget: 170000, budgetLabel: '₹1.7L',
        category: ['honeymoon', 'luxury'], bestSeason: 'Apr – Oct',
        rating: 4.8, copiedCount: 1876,
        description: 'From the City of Love to the Eternal City — wine, art, history, and romance at every turn.',
        coverImage: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&w=500&q=80'
    },
    {
        id: 'turkey-cultural', title: 'Turkey Cultural Adventure', country: 'Turkey', region: 'international',
        destinations: 'Istanbul, Cappadocia, Pamukkale, Ephesus',
        days: 6, budget: 70000, budgetLabel: '₹70K',
        category: ['adventure', 'family'], bestSeason: 'Apr – Jun, Sep – Nov',
        rating: 4.7, copiedCount: 1543,
        description: 'Hot air balloons over fairy chimneys, ancient ruins, bazaars, and the stunning Bosphorus.',
        coverImage: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&w=500&q=80'
    },
];

// ═══════════════════════════════════════════════
// MAIN APPLICATION
// ═══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async () => {
    initSidebar();
    const user = await protectRoute();
    if (!user) return;

    const grid = document.getElementById('st-grid');
    const searchInput = document.getElementById('st-search');
    const filtersContainer = document.getElementById('st-filters');
    const sortSelect = document.getElementById('st-sort');
    const countEl = document.getElementById('trip-count');

    let currentFilter = 'all';
    let currentSearch = '';
    let currentSort = 'popular';

    // Initial render
    renderTrips();

    // ── Search ──
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            currentSearch = e.target.value.toLowerCase().trim();
            renderTrips();
        }, 250);
    });

    // ── Filters ──
    filtersContainer.addEventListener('click', (e) => {
        const chip = e.target.closest('.st-chip');
        if (!chip) return;

        filtersContainer.querySelectorAll('.st-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentFilter = chip.dataset.filter;
        renderTrips();
    });

    // ── Sort ──
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderTrips();
    });

    // ═══════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════
    function renderTrips() {
        let trips = [...CURATED_TRIPS];

        // Filter by region/category
        if (currentFilter !== 'all') {
            trips = trips.filter(t => {
                if (currentFilter === 'india') return t.region === 'india';
                if (currentFilter === 'international') return t.region === 'international';
                return t.category.includes(currentFilter);
            });
        }

        // Search
        if (currentSearch) {
            trips = trips.filter(t =>
                t.title.toLowerCase().includes(currentSearch) ||
                t.country.toLowerCase().includes(currentSearch) ||
                t.destinations.toLowerCase().includes(currentSearch) ||
                t.description.toLowerCase().includes(currentSearch)
            );
        }

        // Sort
        switch (currentSort) {
            case 'popular': trips.sort((a, b) => b.copiedCount - a.copiedCount); break;
            case 'rating': trips.sort((a, b) => b.rating - a.rating); break;
            case 'budget-low': trips.sort((a, b) => a.budget - b.budget); break;
            case 'budget-high': trips.sort((a, b) => b.budget - a.budget); break;
            case 'days': trips.sort((a, b) => a.days - b.days); break;
        }

        countEl.textContent = trips.length;

        if (trips.length === 0) {
            grid.innerHTML = `
                <div class="st-empty">
                    <span class="material-symbols-outlined">travel_explore</span>
                    <h3>No trips found</h3>
                    <p>Try adjusting your search or filters to discover more adventures.</p>
                </div>`;
            return;
        }

        grid.innerHTML = '';
        trips.forEach(trip => {
            grid.appendChild(createTripCard(trip));
        });
    }

    function createTripCard(trip) {
        const card = document.createElement('div');
        card.className = 'st-card';

        const categoryLabels = {
            budget: '💰 Budget', luxury: '✨ Luxury', adventure: '🧗 Adventure',
            honeymoon: '💕 Honeymoon', family: '👨‍👩‍👧‍👦 Family', solo: '🎒 Solo'
        };
        const primaryCat = trip.category[0];
        const catLabel = categoryLabels[primaryCat] || primaryCat;

        const FALLBACK_IMG = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&w=500&q=80';

        card.innerHTML = `
            <div class="st-card-img-wrap">
                <img class="st-card-img" src="${trip.coverImage}" alt="${trip.title}" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK_IMG}';">
                <div class="st-card-badges">
                    <span class="st-badge st-badge-cat">${catLabel}</span>
                    <span class="st-badge st-badge-season">🌤️ ${trip.bestSeason}</span>
                </div>
                <div class="st-card-rating">⭐ ${trip.rating}</div>
            </div>
            <div class="st-card-body">
                <h3>${trip.title}</h3>
                <div class="st-card-dest">
                    <span class="material-symbols-outlined">location_on</span>
                    ${trip.destinations}
                </div>
                <p class="st-card-desc">${trip.description}</p>
                <div class="st-card-meta">
                    <span><span class="material-symbols-outlined">schedule</span>${trip.days} Days</span>
                    <span><span class="material-symbols-outlined">payments</span>${trip.budgetLabel}</span>
                    <span><span class="material-symbols-outlined">flag</span>${trip.country}</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <div class="st-copied-count">
                        <span class="material-symbols-outlined">content_copy</span>
                        ${trip.copiedCount.toLocaleString()} copied
                    </div>
                </div>
                <div class="st-card-actions">
                    <button class="st-btn-view" data-trip-id="${trip.id}">
                        <span class="material-symbols-outlined">visibility</span>
                        View
                    </button>
                    <button class="st-btn-copy" data-trip-id="${trip.id}">
                        <span class="material-symbols-outlined">content_copy</span>
                        Copy Trip
                    </button>
                </div>
            </div>
        `;

        // Copy Trip handler
        card.querySelector('.st-btn-copy').addEventListener('click', async (e) => {
            e.stopPropagation();
            const btn = e.currentTarget;
            btn.disabled = true;
            btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;">hourglass_empty</span> Copying...';

            try {
                const today = new Date();
                const startDate = new Date(today);
                startDate.setDate(today.getDate() + 14); // Start 2 weeks from now
                const endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + trip.days - 1);

                await createTrip(user.uid, {
                    name: trip.title,
                    description: trip.description,
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0],
                    budget: trip.budget,
                    coverImage: trip.coverImage,
                    destination: trip.country,
                    userId: user.uid,
                    authorName: user.displayName || 'Explorer',
                    authorEmail: user.email,
                    copiedFrom: trip.id,
                    isPublic: false,
                    stops: trip.destinations.split(',').map(d => d.trim()),
                });

                btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;">check</span> Copied!';
                btn.style.background = '#14b8a6';
                showToast(`"${trip.title}" added to your trips!`);

                setTimeout(() => {
                    btn.disabled = false;
                    btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;">content_copy</span> Copy Trip';
                    btn.style.background = '';
                }, 3000);
            } catch (error) {
                console.error('Error copying trip:', error);
                btn.disabled = false;
                btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;">content_copy</span> Copy Trip';
                showToast('Failed to copy trip. Please try again.');
            }
        });

        return card;
    }

    function showToast(msg) {
        const toast = document.getElementById('st-toast');
        const toastMsg = document.getElementById('st-toast-msg');
        toastMsg.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
});
