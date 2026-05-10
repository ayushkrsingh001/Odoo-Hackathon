import { auth } from '../firebase/config.js';
import { createTrip, addSubcollectionItem } from '../firebase/firestore.js';
import { initSidebar } from '../components/sidebar.js';
import { protectRoute } from '../utils/guards.js';

// ═══════════════════════════════════════════════
// DESTINATION KNOWLEDGE BASE
// ═══════════════════════════════════════════════
const DEST_DB = {
    goa: { country:'India', img:'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&w=600&q=80', bestTime:'Oct–Mar', currency:'₹',
        areas:['Baga Beach','Anjuna','Panaji','South Goa','Calangute'], transport:['Rent a scooter (₹300/day)','Auto-rickshaws','Local bus'],
        attractions:['Fort Aguada','Basilica of Bom Jesus','Dudhsagar Falls','Anjuna Flea Market','Chapora Fort','Palolem Beach','Spice plantations'],
        foods:['Goan fish curry','Prawn balchão','Bebinca','Feni tasting','Poi bread'], tips:['Carry sunscreen SPF 50+','Avoid monsoon season','Bargain at flea markets','Try a sunset cruise','Book water sports in advance'] },
    bali: { country:'Indonesia', img:'https://images.unsplash.com/photo-1573790387438-4da905039392?auto=format&w=600&q=80', bestTime:'Apr–Oct', currency:'IDR',
        areas:['Ubud','Seminyak','Canggu','Nusa Penida','Uluwatu'], transport:['Rent a scooter','Private driver (affordable)','Grab app'],
        attractions:['Tegallalang Rice Terraces','Tirta Empul Temple','Uluwatu Temple','Nusa Penida Kelingking Beach','Ubud Monkey Forest','Mount Batur sunrise trek','Tanah Lot Temple'],
        foods:['Nasi Goreng','Babi Guling','Satay Lilit','Smoothie bowls in Canggu','Jimbaran seafood BBQ'], tips:['Get an international driving permit','Respect temple dress codes','Carry cash for small warungs','Book Nusa Penida boat early','Stay hydrated'] },
    manali: { country:'India', img:'https://images.unsplash.com/photo-1455156218388-5e61b526818b?auto=format&w=600&q=80', bestTime:'Mar–Jun, Oct–Dec', currency:'₹',
        areas:['Old Manali','Mall Road','Solang Valley','Rohtang Pass','Kasol'], transport:['Local bus from Delhi','Rent a bike','Shared cabs'],
        attractions:['Solang Valley','Rohtang Pass','Hadimba Temple','Old Manali cafés','Jogini Waterfall','Vashisht Hot Springs','Kheerganga Trek'],
        foods:['Siddu','Thukpa','Momos','Trout fish','Café hopping in Old Manali'], tips:['Carry warm layers even in summer','Altitude sickness precautions','Book Rohtang permits online','Carry power bank','Trek to Kheerganga early morning'] },
    dubai: { country:'UAE', img:'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&w=600&q=80', bestTime:'Nov–Mar', currency:'AED',
        areas:['Downtown Dubai','Dubai Marina','Deira','Palm Jumeirah','JBR'], transport:['Metro (Red/Green lines)','Dubai Tram','Uber/Careem'],
        attractions:['Burj Khalifa','Dubai Mall','Desert Safari','Palm Jumeirah','Dubai Frame','Gold Souk','Miracle Garden','Global Village'],
        foods:['Shawarma','Al Machboos','Luqaimat','Friday brunch buffets','Karak chai'], tips:['Dress modestly outside beaches','Friday is the weekend','Metro Gold class is worth it','Book attractions online for discounts','Stay hydrated in heat'] },
    switzerland: { country:'Switzerland', img:'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&w=600&q=80', bestTime:'Jun–Sep', currency:'CHF',
        areas:['Zurich','Interlaken','Lucerne','Zermatt','Grindelwald'], transport:['Swiss Travel Pass','Scenic trains','Cable cars'],
        attractions:['Jungfraujoch','Lake Lucerne cruise','Matterhorn','Rhine Falls','Chapel Bridge','Lauterbrunnen Valley','Grindelwald First'],
        foods:['Fondue','Raclette','Rösti','Swiss chocolate','Rivella'], tips:['Get Swiss Travel Pass for unlimited trains','Book mountain excursions early','Carry layers for altitude','Tap water is drinkable everywhere','Sundays most shops are closed'] },
    japan: { country:'Japan', img:'https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&w=600&q=80', bestTime:'Mar–May, Oct–Nov', currency:'¥',
        areas:['Tokyo','Kyoto','Osaka','Hakone','Nara'], transport:['Japan Rail Pass (JR Pass)','Suica/Pasmo IC cards','Shinkansen'],
        attractions:['Fushimi Inari Shrine','Senso-ji Temple','Shibuya Crossing','Arashiyama Bamboo Grove','Mount Fuji','Osaka Castle','Dotonbori'],
        foods:['Ramen','Sushi at Tsukiji','Takoyaki','Matcha desserts','Okonomiyaki'], tips:['Get a JR Pass before arriving','Learn basic Japanese phrases','Carry cash — many places don\'t accept cards','Respect queue culture','Visit convenience stores (konbini) for great food'] },
    paris: { country:'France', img:'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&w=600&q=80', bestTime:'Apr–Oct', currency:'€',
        areas:['Le Marais','Montmartre','Saint-Germain','Champs-Élysées','Latin Quarter'], transport:['Metro (Navigo pass)','RER to Versailles','Walking'],
        attractions:['Eiffel Tower','Louvre Museum','Sacré-Cœur','Versailles','Notre-Dame','Arc de Triomphe','Musée d\'Orsay'],
        foods:['Croissants','Crêpes','Duck confit','Macarons from Ladurée','Wine & cheese'], tips:['Book Eiffel Tower tickets 2 months ahead','Get museum pass for savings','Metro is fastest transport','Tipping not mandatory but appreciated','Visit Louvre on Wednesday evening'] },
    ladakh: { country:'India', img:'https://images.unsplash.com/photo-1609766856923-7e0a1f8d8b1d?auto=format&w=600&q=80', bestTime:'Jun–Sep', currency:'₹',
        areas:['Leh','Pangong Lake','Nubra Valley','Tso Moriri','Hemis'], transport:['Flights to Leh','Royal Enfield rental','Shared taxis'],
        attractions:['Pangong Lake','Khardung La Pass','Nubra Valley sand dunes','Hemis Monastery','Magnetic Hill','Shanti Stupa','Zanskar Valley'],
        foods:['Thukpa','Momos','Butter tea','Skyu','Apricot jam'], tips:['Acclimatize for 2 days in Leh','Carry Diamox for altitude','Get Inner Line Permits online','Fuel up in Leh — no pumps ahead','Carry cash — limited ATMs'] },
    thailand: { country:'Thailand', img:'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&w=600&q=80', bestTime:'Nov–Apr', currency:'THB',
        areas:['Bangkok','Phuket','Krabi','Chiang Mai','Phi Phi Islands'], transport:['Tuk-tuks','Grab app','Ferries between islands','BTS Skytrain'],
        attractions:['Grand Palace','Phi Phi Islands','Wat Arun','Chiang Mai Night Bazaar','James Bond Island','Floating Markets','Full Moon Party'],
        foods:['Pad Thai','Tom Yum Goong','Mango sticky rice','Green curry','Street food on Khao San Road'], tips:['Respect the monarchy','Remove shoes in temples','Bargain at markets','Stay on islands for best experience','Try street food — it\'s safe and amazing'] },
    maldives: { country:'Maldives', img:'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&w=600&q=80', bestTime:'Nov–Apr', currency:'MVR',
        areas:['Malé','North Malé Atoll','South Ari Atoll','Baa Atoll','Addu Atoll'], transport:['Seaplane','Speedboat','Dhoni boats'],
        attractions:['Overwater villa experience','Snorkeling with manta rays','Underwater restaurant','Bioluminescent beach','Malé Fish Market','Island hopping','Sunset dolphin cruise'],
        foods:['Mas Huni','Garudhiya','Grilled reef fish','Tropical fruit platters','Resort fine dining'], tips:['Book all-inclusive resorts for best value','Bring reef-safe sunscreen','Best snorkeling is on house reef','Seaplane transfers need daylight','Alcohol only available in resorts'] },
};

// Generic fallback for unknown destinations
const GENERIC = { country:'Unknown', img:'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&w=600&q=80', bestTime:'Year-round', currency:'₹',
    areas:['City Center','Old Town','Waterfront','Cultural District','Nature Reserve'], transport:['Local taxi','Public bus','Walking tours'],
    attractions:['Main temple/church','Central market','Scenic viewpoint','Historical museum','Local park','Night market','Cultural show'],
    foods:['Local street food','Traditional dish','Fresh seafood','Regional dessert','Craft beverages'], tips:['Research local customs','Carry local currency','Stay hydrated','Book accommodation in advance','Learn a few local phrases'] };

// ═══════════════════════════════════════════════
// TIME SLOTS
// ═══════════════════════════════════════════════
const TIME_SLOTS = [
    { time:'7:00 AM', label:'Morning', type:'breakfast' },
    { time:'9:00 AM', label:'Mid-Morning', type:'activity' },
    { time:'12:00 PM', label:'Afternoon', type:'lunch' },
    { time:'2:00 PM', label:'Post-Lunch', type:'activity' },
    { time:'5:00 PM', label:'Evening', type:'activity' },
    { time:'7:30 PM', label:'Night', type:'dinner' },
];

document.addEventListener('DOMContentLoaded', async () => {
    initSidebar();
    const user = await protectRoute();
    if (!user) return;

    const generateBtn = document.getElementById('ai-generate-btn');
    const formSection = document.getElementById('ai-form-section');
    const loadingSection = document.getElementById('ai-loading');
    const resultSection = document.getElementById('ai-result');
    const interestTags = document.querySelectorAll('.ai-tag');

    // Interest tag toggle
    interestTags.forEach(tag => {
        tag.addEventListener('click', () => tag.classList.toggle('selected'));
    });

    // Generate
    generateBtn.addEventListener('click', async () => {
        const dest = document.getElementById('ai-dest').value.trim();
        const days = parseInt(document.getElementById('ai-days').value) || 5;
        const budget = parseInt(document.getElementById('ai-budget').value) || 0;
        const startCity = document.getElementById('ai-start').value.trim();
        const style = document.getElementById('ai-style').value;
        const tripType = document.getElementById('ai-type').value;
        const interests = [...document.querySelectorAll('.ai-tag.selected')].map(t => t.dataset.val);

        if (!dest) { alert('Please enter a destination.'); return; }

        // Show loading
        formSection.style.display = 'none';
        loadingSection.style.display = 'block';
        resultSection.classList.remove('show');

        const msgs = ['Researching destinations...','Building your day-by-day plan...','Calculating budget breakdown...','Adding local recommendations...','Finalizing your itinerary...'];
        const loadText = document.getElementById('ai-loading-text');
        let i = 0;
        const interval = setInterval(() => { i++; if (i < msgs.length) loadText.textContent = msgs[i]; }, 800);

        // Simulate AI thinking
        await new Promise(r => setTimeout(r, 4000));
        clearInterval(interval);

        // Generate itinerary
        const itinerary = generateItinerary(dest, days, budget, startCity, style, tripType, interests);

        // Render
        loadingSection.style.display = 'none';
        renderResult(itinerary, user);
        resultSection.classList.add('show');
    });

    function generateItinerary(dest, days, budget, startCity, style, tripType, interests) {
        const key = dest.toLowerCase().replace(/[\s-]+/g, '').replace('leh','ladakh').replace('kyoto','japan').replace('tokyo','japan').replace('phuket','thailand').replace('bangkok','thailand').replace('interlaken','switzerland').replace('zurich','switzerland');
        const db = DEST_DB[key] || DEST_DB[Object.keys(DEST_DB).find(k => key.includes(k))] || GENERIC;

        const dailyBudget = budget > 0 ? Math.round(budget / days) : (style === 'luxury' ? 15000 : style === 'comfort' ? 7000 : 3000);
        const totalBudget = budget > 0 ? budget : dailyBudget * days;
        const multiplier = style === 'luxury' ? 1.8 : style === 'budget' ? 0.6 : 1;

        const dayPlans = [];
        const usedAttractions = new Set();
        const usedFoods = new Set();

        for (let d = 1; d <= days; d++) {
            const activities = [];
            const dayTheme = d === 1 ? 'Arrival & Explore' : d === days ? 'Final Day & Departure' : `Day ${d} Adventure`;

            TIME_SLOTS.forEach(slot => {
                let name, desc, cost;
                if (slot.type === 'breakfast') {
                    const food = pickUnique(db.foods, usedFoods) || 'Local breakfast';
                    name = `Breakfast — ${food}`;
                    desc = `Start your day with ${food.toLowerCase()} at a popular local spot.`;
                    cost = Math.round(200 * multiplier);
                } else if (slot.type === 'lunch') {
                    const food = pickUnique(db.foods, usedFoods) || 'Local cuisine';
                    name = `Lunch — ${food}`;
                    desc = `Enjoy authentic ${food.toLowerCase()} at a recommended restaurant.`;
                    cost = Math.round(500 * multiplier);
                } else if (slot.type === 'dinner') {
                    name = d === 1 ? 'Welcome dinner' : `Dinner at ${db.areas[d % db.areas.length]}`;
                    desc = `Experience the evening dining scene. ${tripType === 'couple' ? 'Perfect for a romantic evening.' : ''}`;
                    cost = Math.round(800 * multiplier);
                } else {
                    const attr = pickUnique(db.attractions, usedAttractions) || `Explore ${db.areas[d % db.areas.length]}`;
                    name = attr;
                    desc = `Visit ${attr}. ${interests.includes('photography') ? 'Great photo opportunity!' : ''}`;
                    cost = Math.round((400 + Math.random() * 600) * multiplier);
                }
                activities.push({ time: slot.time, name, desc, cost: `₹${cost}` });
            });

            dayPlans.push({ day: d, theme: dayTheme, area: db.areas[(d - 1) % db.areas.length], activities });
        }

        return { dest, days, budget: totalBudget, dailyBudget, style, tripType, interests, startCity, country: db.country, img: db.img, bestTime: db.bestTime, areas: db.areas, transport: db.transport, tips: db.tips, dayPlans };
    }

    function pickUnique(arr, usedSet) {
        const available = arr.filter(a => !usedSet.has(a));
        if (available.length === 0) { usedSet.clear(); return arr[Math.floor(Math.random() * arr.length)]; }
        const pick = available[Math.floor(Math.random() * available.length)];
        usedSet.add(pick);
        return pick;
    }

    function renderResult(itin, user) {
        const styleLabel = { budget:'Budget Friendly 💰', comfort:'Comfortable 🛋️', luxury:'Premium Luxury ✨' };
        const typeLabel = { solo:'Solo 🎒', couple:'Couple 💕', family:'Family 👨‍👩‍👧‍👦', friends:'Friends 🎉' };

        resultSection.innerHTML = `
            <div class="ai-result-header">
                <h2>${itin.dest} — ${itin.days}-Day ${typeLabel[itin.tripType] || ''} Itinerary</h2>
                <div class="ai-result-actions">
                    <button class="ai-action-btn" id="ai-back-btn"><span class="material-symbols-outlined">arrow_back</span> Modify</button>
                    <button class="ai-action-btn primary" id="ai-save-btn"><span class="material-symbols-outlined">save</span> Save to My Trips</button>
                </div>
            </div>

            <div class="ai-summary-grid">
                <div class="ai-summary-card"><span class="material-symbols-outlined">location_on</span><div class="val">${itin.dest}</div><div class="lbl">${itin.country}</div></div>
                <div class="ai-summary-card"><span class="material-symbols-outlined">calendar_month</span><div class="val">${itin.days} Days</div><div class="lbl">${itin.bestTime}</div></div>
                <div class="ai-summary-card"><span class="material-symbols-outlined">payments</span><div class="val">₹${(itin.budget/1000).toFixed(0)}K</div><div class="lbl">${styleLabel[itin.style]}</div></div>
                <div class="ai-summary-card"><span class="material-symbols-outlined">directions_car</span><div class="val">Transport</div><div class="lbl">${itin.transport[0]}</div></div>
            </div>

            <div id="ai-days-container">
                ${itin.dayPlans.map(day => `
                    <div class="ai-day-card">
                        <div class="ai-day-badge">📅 Day ${day.day} — ${day.area}</div>
                        <h3>${day.theme}</h3>
                        ${day.activities.map(a => `
                            <div class="ai-activity">
                                <div class="ai-activity-time">${a.time}</div>
                                <div class="ai-activity-content"><h4>${a.name}</h4><p>${a.desc}</p></div>
                                <div class="ai-activity-cost">${a.cost}</div>
                            </div>`).join('')}
                    </div>`).join('')}
            </div>

            <div class="ai-tips">
                <h3>🧳 Travel Tips</h3>
                <ul>${itin.tips.map(t => `<li>${t}</li>`).join('')}</ul>
            </div>
        `;

        // Back button
        document.getElementById('ai-back-btn').addEventListener('click', () => {
            resultSection.classList.remove('show');
            formSection.style.display = 'block';
        });

        // Save button
        document.getElementById('ai-save-btn').addEventListener('click', async () => {
            const btn = document.getElementById('ai-save-btn');
            btn.disabled = true;
            btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;">hourglass_empty</span> Saving...';
            try {
                const today = new Date();
                const start = new Date(today); start.setDate(today.getDate() + 14);
                const end = new Date(start); end.setDate(start.getDate() + itin.days - 1);
                const tripId = await createTrip(user.uid, {
                    name: `${itin.dest} — ${itin.days} Day ${itin.style.charAt(0).toUpperCase()+itin.style.slice(1)} Trip`,
                    description: `AI-generated ${itin.tripType} itinerary for ${itin.dest}`,
                    startDate: start.toISOString().split('T')[0],
                    endDate: end.toISOString().split('T')[0],
                    budget: itin.budget,
                    coverImage: itin.img,
                    destination: itin.country,
                    userId: user.uid,
                    authorName: user.displayName || 'Explorer',
                    authorEmail: user.email,
                    isPublic: false,
                    generatedByAI: true,
                });
                btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;">check</span> Saved!';
                btn.style.background = '#059669';
                setTimeout(() => { window.location.href = `trip-details.html?tripId=${tripId}`; }, 1000);
            } catch (err) {
                console.error(err);
                btn.disabled = false;
                btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;">save</span> Save to My Trips';
                alert('Failed to save. Try again.');
            }
        });
    }
});
