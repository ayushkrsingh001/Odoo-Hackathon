import { auth, db } from '../firebase/config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js';

// ═══════════════════════════════════════════════
// ADMIN CONFIGURATION
// ═══════════════════════════════════════════════
const ADMIN_EMAIL = 'admin@traveloop.com'; 

document.addEventListener('DOMContentLoaded', () => {
    const layout = document.getElementById('admin-layout');
    const unauthorized = document.getElementById('unauthorized');

    // ── AUTHENTICATION ──
    const isOfflineBypass = localStorage.getItem('traveloop_admin_bypass') === 'true';

    onAuthStateChanged(auth, async (user) => {
        if (!user && !isOfflineBypass) {
            window.location.href = 'admin-login.html';
            return;
        }

        if (user && user.email !== ADMIN_EMAIL) {
            unauthorized.style.display = 'flex';
            return;
        }

        // User is Admin (or Offline Bypass is active)
        layout.style.display = 'flex';
        document.getElementById('admin-avatar').textContent = user ? (user.displayName ? user.displayName.charAt(0).toUpperCase() : 'A') : 'O';
        document.getElementById('admin-name').textContent = user ? (user.displayName || 'Super Admin') : 'Offline Admin';

        await loadAdminData();
    });

    // ── NAVIGATION ──
    const navItems = document.querySelectorAll('.admin-nav-item[data-target]');
    const sections = document.querySelectorAll('.admin-section');
    const pageTitle = document.getElementById('page-title');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if(item.id === 'admin-logout') return;
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById('sec-' + item.dataset.target).classList.add('active');
            
            const titleMap = {
                'dash': 'Dashboard Overview',
                'users': 'User Management',
                'trips': 'All Platform Trips',
                'shared': 'Curated Shared Trips',
                'analytics': 'Platform Analytics'
            };
            pageTitle.textContent = titleMap[item.dataset.target] || item.textContent.trim();
        });
    });

    document.getElementById('admin-logout').addEventListener('click', async () => {
        localStorage.removeItem('traveloop_admin_bypass');
        await signOut(auth);
        window.location.href = 'admin-login.html';
    });

    // ── GLOBAL STATE ──
    let globalUsers = [];
    let globalTrips = [];
    let globalShared = [];

    // ── DATA LOADING ──
    async function loadAdminData() {
        try {
            // Fetch Users
            const usersSnapshot = await getDocs(collection(db, 'users'));
            globalUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Fetch Trips
            const tripsSnapshot = await getDocs(query(collection(db, 'trips'), orderBy('createdAt', 'desc')));
            globalTrips = tripsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Fetch Shared Trips
            const sharedSnapshot = await getDocs(collection(db, 'sharedTrips'));
            globalShared = sharedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            renderDashboard(globalUsers, globalTrips, globalShared);
            renderUsersTable(globalUsers, globalTrips);
            renderTripsTable(globalTrips);
            renderSharedTable(globalShared);
            renderAnalytics(globalUsers, globalTrips);

        } catch (error) {
            console.error("Error loading admin data: ", error);
            
            let errorTitle = "Database Error";
            let errorDesc = error.message;

            if (error.code === 'permission-denied') {
                errorTitle = "Permission Denied";
                errorDesc = "You are successfully logged in, but your LIVE Firebase database is blocking access. You need to update your Firestore Security Rules in the Firebase Console to allow the admin email to read all data.";
            } else if (!navigator.onLine || isOfflineBypass) {
                errorTitle = "Database Unreachable";
                errorDesc = "Because you are logged in as 'Offline Admin', Firebase is blocking access to the real data. Please ensure you are running on a local web server (http://localhost:5500) and not a file:// path.";
            }

            const errorHtml = `<tr><td colspan="7" style="text-align:center; padding:48px; color:#ef4444;">
                <span class="material-symbols-outlined" style="font-size:48px; margin-bottom:16px;">${error.code === 'permission-denied' ? 'gpp_bad' : 'wifi_off'}</span><br>
                <strong style="font-size:18px;">${errorTitle}</strong><br>
                <span style="color:#64748b;">${errorDesc}</span>
            </td></tr>`;

            document.querySelector('#users-table tbody').innerHTML = errorHtml;
            document.querySelector('#trips-table tbody').innerHTML = errorHtml;
            document.querySelector('#shared-table tbody').innerHTML = errorHtml;
        }
    }

    // ── KPI DASHBOARD ──
    function renderDashboard(users, trips, sharedTrips) {
        document.getElementById('kpi-users').textContent = users.length;
        document.getElementById('kpi-trips').textContent = trips.length;
        document.getElementById('kpi-shared').textContent = sharedTrips.length;

        const totalBudget = trips.reduce((sum, trip) => sum + (Number(trip.budget) || 0), 0);
        document.getElementById('kpi-budget').textContent = `₹${totalBudget.toLocaleString()}`;

        const upcoming = trips.filter(t => t.startDate && new Date(t.startDate) > new Date()).length;
        document.getElementById('kpi-upcoming-trips').textContent = upcoming;

        const uniqueCountries = new Set(trips.map(t => t.destination).filter(Boolean));
        document.getElementById('kpi-countries').textContent = uniqueCountries.size;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const activeUsers = users.filter(u => u.lastLogin && new Date(u.lastLogin) > thirtyDaysAgo).length;
        document.getElementById('kpi-active-users').textContent = activeUsers;

        const avgBudget = trips.length > 0 ? Math.round(totalBudget / trips.length) : 0;
        document.getElementById('kpi-avg-budget').textContent = `₹${avgBudget.toLocaleString()}`;
    }

    // ── USERS TABLE ──
    function renderUsersTable(users, allTrips) {
        const tbody = document.querySelector('#users-table tbody');
        if (users.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#64748b;">No users found.</td></tr>`;
            return;
        }

        window.openUserModal = function(userId) {
            const u = users.find(x => x.id === userId);
            if(!u) return;
            const uTrips = allTrips.filter(t => t.userId === u.id);
            document.getElementById('modal-user-name').textContent = u.displayName || 'Unknown User';
            document.getElementById('modal-user-content').innerHTML = `
                <div style="display:flex;gap:16px;margin-bottom:24px;">
                    <div style="width:64px;height:64px;border-radius:50%;background:#e2e8f0;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;">${(u.displayName||'U')[0]}</div>
                    <div>
                        <p style="font-weight:700;font-size:18px;">${u.email}</p>
                        <p style="color:#64748b;font-size:14px;">Joined: ${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</p>
                        <p style="color:#64748b;font-size:14px;">User ID: ${u.id}</p>
                    </div>
                </div>
                <h3>Trips (${uTrips.length})</h3>
                <ul style="list-style:none;padding:0;margin-top:12px;">
                    ${uTrips.map(t => `<li style="padding:12px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:8px;">
                        <strong>${t.name}</strong> to ${t.destination || 'Unknown'} <br>
                        <span style="font-size:12px;color:#64748b;">Budget: ₹${t.budget || 0} | Status: ${t.isPublic?'Public':'Private'}</span>
                    </li>`).join('') || '<p style="color:#64748b;">No trips created yet.</p>'}
                </ul>
            `;
            document.getElementById('user-modal').style.display = 'flex';
        };

        const renderRows = (data) => {
            tbody.innerHTML = data.map(u => {
                const userTrips = allTrips.filter(t => t.userId === u.id);
                const joinDate = u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A';
                const countries = new Set(userTrips.map(t => t.destination).filter(Boolean)).size;
                return `
                    <tr>
                        <td>
                            <div class="td-user">
                                <div class="td-avatar">${(u.displayName || 'U')[0].toUpperCase()}</div>
                                <span style="font-weight:600;">${u.displayName || 'Unknown User'}</span>
                            </div>
                        </td>
                        <td>${u.email}</td>
                        <td><span style="background:#f1f5f9;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:700;color:#475569;">${userTrips.length} Trips</span></td>
                        <td>${countries}</td>
                        <td>${joinDate}</td>
                        <td>
                            <button class="action-btn" onclick="openUserModal('${u.id}')" title="View Details"><span class="material-symbols-outlined">visibility</span></button>
                        </td>
                    </tr>
                `;
            }).join('');
        };
        renderRows(users);

        document.getElementById('search-users').addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            renderRows(users.filter(u => (u.displayName||'').toLowerCase().includes(term) || (u.email||'').toLowerCase().includes(term)));
        });

        document.getElementById('export-users').addEventListener('click', () => exportToCSV(users, 'traveloop_users.csv'));
    }

    // ── TRIPS TABLE ──
    function renderTripsTable(trips) {
        const tbody = document.querySelector('#trips-table tbody');
        if (trips.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#64748b;">No trips available.</td></tr>`;
            return;
        }
        
        window.deleteAdminTrip = async function(tripId) {
            if(confirm('Are you sure you want to delete this trip permanently?')) {
                await deleteDoc(doc(db, 'trips', tripId));
                loadAdminData(); 
            }
        };

        const renderRows = (data) => {
            tbody.innerHTML = data.map(t => {
                const isPublic = t.isPublic ? '<span style="color:#10b981;font-weight:700;">Public</span>' : '<span style="color:#64748b;">Private</span>';
                let days = 'N/A';
                if(t.startDate && t.endDate) {
                    const diff = Math.ceil((new Date(t.endDate) - new Date(t.startDate)) / (1000 * 60 * 60 * 24));
                    days = diff > 0 ? diff : 1;
                }
                return `
                    <tr>
                        <td style="font-weight:600;">${t.name}</td>
                        <td>${t.destination || 'N/A'}</td>
                        <td>${t.authorEmail || 'N/A'}</td>
                        <td>${days} Days</td>
                        <td>₹${(Number(t.budget) || 0).toLocaleString()}</td>
                        <td>${isPublic}</td>
                        <td>
                            <button class="action-btn danger" onclick="deleteAdminTrip('${t.id}')" title="Delete"><span class="material-symbols-outlined">delete</span></button>
                        </td>
                    </tr>
                `;
            }).join('');
        };
        renderRows(trips);

        document.getElementById('search-trips').addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            renderRows(trips.filter(t => (t.destination||'').toLowerCase().includes(term) || (t.name||'').toLowerCase().includes(term)));
        });

        document.getElementById('export-trips').addEventListener('click', () => exportToCSV(trips, 'traveloop_trips.csv'));
    }

    // ── SHARED TRIPS TABLE ──
    function renderSharedTable(shared) {
        const tbody = document.querySelector('#shared-table tbody');
        if (shared.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#64748b;">No shared itineraries yet.</td></tr>`;
            return;
        }
        const renderRows = (data) => {
            tbody.innerHTML = data.map(s => `
                <tr>
                    <td><img src="${s.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828'}" style="width:40px;height:40px;border-radius:8px;object-fit:cover;"></td>
                    <td style="font-weight:600;">${s.title}</td>
                    <td>${s.authorName || 'Unknown'}</td>
                    <td>⭐ ${s.rating || 5.0}</td>
                    <td>${s.copies || 0}</td>
                    <td>
                        <button class="action-btn" title="View"><span class="material-symbols-outlined">visibility</span></button>
                    </td>
                </tr>
            `).join('');
        };
        renderRows(shared);
        document.getElementById('search-shared').addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            renderRows(shared.filter(s => (s.title||'').toLowerCase().includes(term)));
        });
    }

    // ── ANALYTICS CHARTS ──
    function renderAnalytics(users, trips) {
        if(window.userChart && typeof window.userChart.destroy === 'function') window.userChart.destroy();
        if(window.tripChart && typeof window.tripChart.destroy === 'function') window.tripChart.destroy();
        if(window.destChart && typeof window.destChart.destroy === 'function') window.destChart.destroy();
        if(window.budgetChart && typeof window.budgetChart.destroy === 'function') window.budgetChart.destroy();

        // Safe mock data if collections are empty to prevent blank charts
        const uData = users.length ? [2, 5, 12, users.length] : [0,0,0,0];
        const tData = trips.length ? [1, 8, 15, trips.length] : [0,0,0,0];

        // 1. User Growth
        window.userChart = new Chart(document.getElementById('userGrowthChart').getContext('2d'), {
            type: 'line',
            data: { labels: ['Q1', 'Q2', 'Q3', 'Current'], datasets: [{ label: 'Users', data: uData, borderColor: '#3b82f6', tension: 0.4, fill: true, backgroundColor: 'rgba(59,130,246,0.1)' }] },
            options: { responsive: true, plugins: { legend: { display: false } } }
        });

        // 2. Trips Created
        window.tripChart = new Chart(document.getElementById('tripsChart').getContext('2d'), {
            type: 'bar',
            data: { labels: ['Q1', 'Q2', 'Q3', 'Current'], datasets: [{ label: 'Trips', data: tData, backgroundColor: '#10b981', borderRadius: 4 }] },
            options: { responsive: true, plugins: { legend: { display: false } } }
        });

        // Destination Processing
        const destStats = {};
        trips.forEach(t => { 
            if(t.destination) {
                if(!destStats[t.destination]) destStats[t.destination] = { count: 0, budgetSum: 0 };
                destStats[t.destination].count += 1;
                destStats[t.destination].budgetSum += (Number(t.budget) || 0);
            }
        });
        const sortedDests = Object.entries(destStats).sort((a,b)=>b[1].count-a[1].count).slice(0,5);

        // 3. Top Destinations (Doughnut)
        window.destChart = new Chart(document.getElementById('destChart').getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: sortedDests.length ? sortedDests.map(d=>d[0]) : ['None'],
                datasets: [{ data: sortedDests.length ? sortedDests.map(d=>d[1].count) : [1], backgroundColor: ['#3b82f6','#10b981','#f59e0b','#ec4899','#8b5cf6'], borderWidth: 0 }]
            },
            options: { responsive: true, cutout: '70%' }
        });

        // 4. Avg Budget (Bar)
        window.budgetChart = new Chart(document.getElementById('budgetChart').getContext('2d'), {
            type: 'bar',
            data: {
                labels: sortedDests.length ? sortedDests.map(d=>d[0]) : ['None'],
                datasets: [{ label: 'Avg Budget (₹)', data: sortedDests.length ? sortedDests.map(d=> Math.round(d[1].budgetSum / d[1].count)) : [0], backgroundColor: '#8b5cf6', borderRadius: 4 }]
            },
            options: { responsive: true, plugins: { legend: { display: false } } }
        });
    }

    // ── CSV EXPORT ──
    function exportToCSV(data, filename) {
        if (!data || !data.length) return alert("No data to export.");
        const keys = Object.keys(data[0]).filter(k => typeof data[0][k] !== 'object');
        let csvContent = "data:text/csv;charset=utf-8," + keys.join(",") + "\n";
        
        data.forEach(item => {
            const row = keys.map(k => `"${String(item[k] || '').replace(/"/g, '""')}"`).join(",");
            csvContent += row + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});
