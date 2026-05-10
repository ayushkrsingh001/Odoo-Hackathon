/* ============================================
   TRAVELOOP NAVIGATION COMPONENTS (JS)
   Generates reusable sidebar and bottom nav
   ============================================ */

/**
 * Renders the sidebar navigation for dashboard pages
 * @param {string} activePage - The current active page identifier
 */
function renderSidebar(activePage) {
  const navItems = [
    { id: 'dashboard', icon: 'dashboard', label: 'Dashboard', href: 'dashboard.html' },
    { id: 'my-trips', icon: 'map', label: 'My Trips', href: 'my-trips.html' },
    { id: 'create-trip', icon: 'add_circle', label: 'Create Trip', href: 'create-trip.html' },
    { id: 'ai-generator', icon: 'auto_awesome', label: 'AI Trip Generator', href: 'ai-trip-generator.html' },
    { id: 'itinerary', icon: 'timeline', label: 'Itinerary Builder', href: 'itinerary.html' },
    { id: 'budget', icon: 'payments', label: 'Budget', href: 'budget.html' },
    { id: 'currency', icon: 'currency_exchange', label: 'Currency Converter', href: 'currency-converter.html' },
    { id: 'packing', icon: 'inventory_2', label: 'Packing List', href: 'packing.html' },
    { id: 'smart-packing', icon: 'psychology', label: 'Smart Packing', href: 'smart-packing.html' },
    { id: 'notes', icon: 'notes', label: 'Notes', href: 'notes.html' },
    { id: 'shared', icon: 'group', label: 'Shared Trips', href: 'shared-trips.html' },
  ];

  const bottomItems = [
    { id: 'profile', icon: 'person', label: 'Profile', href: 'profile.html' },
    { id: 'settings', icon: 'settings', label: 'Settings', href: 'settings.html' },
  ];

  const urlParams = new URLSearchParams(window.location.search);
  let tripId = urlParams.get('tripId') || urlParams.get('id');
  if (!tripId) {
    tripId = localStorage.getItem('lastViewedTripId');
  } else {
    localStorage.setItem('lastViewedTripId', tripId);
  }

  const tripSpecificPages = ['itinerary', 'budget', 'packing', 'smart-packing', 'notes', 'currency'];
  
  const linksHTML = navItems.map(item => {
    let finalHref = item.href;
    const isTripSpecific = tripSpecificPages.includes(item.id);
    
    if (isTripSpecific && tripId) {
      finalHref += `?tripId=${tripId}`;
    }

    const isActive = item.id === activePage;
    return `<a class="sidebar-nav-item nav-item ${isActive ? 'active' : ''}" data-page="${item.id}" href="${finalHref}">
      <span class="material-symbols-outlined">${item.icon}</span>
      <span>${item.label}</span>
    </a>`;
  }).join('');

  const bottomLinksHTML = bottomItems.map(item => {
    const isActive = item.id === activePage;
    return `
    <a class="sidebar-nav-item nav-item ${isActive ? 'active' : ''}" data-page="${item.id}" href="${item.href}">
      <span class="material-symbols-outlined">${item.icon}</span>
      <span>${item.label}</span>
    </a>
  `;}).join('');

  const sidebarHTML = `
    <nav class="sidebar" id="sidebar">
      <div class="sidebar-content" style="padding: 24px; display: flex; flex-direction: column; height: 100%;">
        <a href="index.html" class="sidebar-brand">
          <img src="assets/logo/traveloop-icon.svg" alt="Traveloop" style="height:40px;width:40px;">
          <div class="sidebar-brand-text">
            <h1>Traveloop</h1>
            <p>Premium Planner</p>
          </div>
        </a>
        
        <a href="create-trip.html" id="newTripBtn" class="btn btn-primary" style="margin-bottom: 24px; width: 100%;">
          <span class="material-symbols-outlined">add</span>
          <span>New Trip</span>
        </a>

        <div class="sidebar-nav">
          ${linksHTML}
        </div>

        <div class="sidebar-footer-nav" style="margin-top: auto; padding-top: 24px;">
          <div class="sidebar-nav">
            ${bottomLinksHTML}
            <button class="sidebar-nav-item" id="logoutBtn" style="width: 100%; border: none; background: none; cursor: pointer; color: var(--color-error);">
              <span class="material-symbols-outlined">logout</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  `;

  document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
}

/**
 * Renders the top navigation bar for dashboard pages
 */
function renderTopNav(title = 'Traveloop') {
  const topnavHTML = `
    <header class="topnav" id="topnav">
      <div class="topnav-left" style="display: flex; align-items: center; gap: 16px;">
        <button class="mobile-menu-btn btn-icon" onclick="toggleMobileSidebar()" style="background: none; border: none; cursor: pointer;">
          <span class="material-symbols-outlined">menu</span>
        </button>
        <a href="dashboard.html" class="topnav-brand-mobile" style="text-decoration: none;">
          <span class="text-headline-md" style="font-weight: 700; color: var(--color-primary);">${title}</span>
        </a>
      </div>

      <div class="topnav-search desktop-only">
        <span class="material-symbols-outlined input-icon">search</span>
        <input type="text" class="search-input input-field" placeholder="Search trips..." style="padding-left: 44px;">
      </div>

      <div class="topnav-actions">
        <button class="btn-icon" style="color: var(--color-on-surface-variant); background: none; border: none; cursor: pointer;">
          <span class="material-symbols-outlined">notifications</span>
        </button>
        <div class="topnav-avatar-container" style="cursor: pointer; position: relative;" onclick="toggleProfileDropdown()">
          <div class="topnav-avatar">
            <img class="user-avatar-img" src="https://ui-avatars.com/api/?name=User" alt="User">
          </div>
          <div id="profile-dropdown" class="glass-panel" style="display: none; position: absolute; top: 56px; right: 0; width: 200px; padding: 8px; flex-direction: column; gap: 4px; z-index: 100;">
            <a href="profile.html" class="sidebar-nav-item" style="padding: 12px;">
              <span class="material-symbols-outlined">person</span> Profile
            </a>
            <a href="settings.html" class="sidebar-nav-item" style="padding: 12px;">
              <span class="material-symbols-outlined">settings</span> Settings
            </a>
            <button id="topnavLogoutBtn" class="sidebar-nav-item" style="width: 100%; border: none; background: none; text-align: left; color: var(--color-error); padding: 12px;">
              <span class="material-symbols-outlined">logout</span> Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  `;

  document.body.insertAdjacentHTML('afterbegin', topnavHTML);
}

/**
 * Renders the bottom navigation bar for mobile
 */
function renderBottomNav(activePage) {
  const items = [
    { id: 'dashboard', icon: 'home', label: 'Home', href: 'dashboard.html' },
    { id: 'my-trips', icon: 'map', label: 'Trips', href: 'my-trips.html' },
    { id: 'create-trip', icon: 'add_box', label: 'Create', href: 'create-trip.html' },
    { id: 'budget', icon: 'payments', label: 'Budget', href: 'budget.html' },
    { id: 'profile', icon: 'person', label: 'Profile', href: 'profile.html' },
  ];

  const navHTML = `
    <nav class="bottom-nav" id="bottom-nav">
      ${items.map(item => {
        const isActive = item.id === activePage;
        return `<a class="bottom-nav-item ${isActive ? 'active' : ''}" href="${item.href}">
          <span class="material-symbols-outlined">${item.icon}</span>
          <span>${item.label}</span>
        </a>`;
      }).join('')}
    </nav>
  `;

  document.body.insertAdjacentHTML('beforeend', navHTML);
}

/**
 * Mobile sidebar toggle
 */
function toggleMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  let overlay = document.getElementById('mobile-overlay');
  
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'mobile-overlay';
    overlay.className = 'mobile-menu-overlay';
    overlay.onclick = () => toggleMobileSidebar();
    document.body.appendChild(overlay);
  }

  sidebar.classList.toggle('active');
  overlay.classList.toggle('active');
  
  if (sidebar.classList.contains('active')) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}

function toggleProfileDropdown() {
  const dropdown = document.getElementById('profile-dropdown');
  if (dropdown) {
    dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
  }
}

window.addEventListener('resize', () => {
  if (window.innerWidth >= 1024) {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
});
