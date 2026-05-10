/* ============================================
   TRAVELOOP APPLICATION JAVASCRIPT
   Navigation, interactions, form validation,
   scroll animations, and page functionality
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollAnimations();
  initSmoothScrolling();
  initFormValidation();
  initMobileMenu();
  initTabSwitcher();
  initChecklistInteractivity();
  initLazyLoading();
  initProgressBars();
  initSearchFunctionality();
});

/* ── Navigation ── */
function initNavigation() {
  // Highlight active page in sidebar based on current URL
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const sidebarLinks = document.querySelectorAll('.sidebar-nav-item');
  
  sidebarLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.includes(currentPage.replace('.html', ''))) {
      link.classList.add('active');
    }
  });

  // Scroll-based navbar background opacity
  const topnav = document.querySelector('.topnav, .landing-nav');
  if (topnav) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        topnav.style.backgroundColor = 'rgba(250, 248, 255, 0.95)';
        topnav.style.boxShadow = '0px 2px 12px rgba(0, 0, 0, 0.08)';
      } else {
        topnav.style.backgroundColor = 'rgba(250, 248, 255, 0.8)';
        topnav.style.boxShadow = '0px 2px 8px rgba(0, 0, 0, 0.06)';
      }
    }, { passive: true });
  }
}

/* ── Scroll Reveal Animations ── */
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal:not(.observed)');
  
  if (revealElements.length === 0 && document.querySelectorAll('.stagger-children:not(.observed)').length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  revealElements.forEach(el => {
    el.classList.add('observed');
    observer.observe(el);
  });

  // Also handle stagger groups
  const staggerGroups = document.querySelectorAll('.stagger-children:not(.observed)');
  const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        staggerObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  staggerGroups.forEach(el => {
    el.classList.add('observed');
    staggerObserver.observe(el);
  });
}

// Make it globally accessible
window.initScrollAnimations = initScrollAnimations;

/* ── Smooth Scrolling for Anchor Links ── */
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

        // Close mobile menu if open
        closeMobileMenu();
      }
    });
  });
}

/* ── Form Validation ── */
function initFormValidation() {
  // Auth form validation
  const authForm = document.querySelector('#auth-form');
  if (authForm) {
    authForm.addEventListener('submit', function(e) {
      e.preventDefault();
      validateAuthForm(this);
    });

    // Login button (for non-submit buttons)
    const loginBtn = document.querySelector('#login-btn');
    if (loginBtn) {
      loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        validateAuthForm(authForm);
      });
    }
  }

  // Create trip form validation
  const tripForm = document.querySelector('#create-trip-form');
  if (tripForm) {
    tripForm.addEventListener('submit', function(e) {
      e.preventDefault();
      validateTripForm(this);
    });
  }

  // Password visibility toggle
  const togglePasswordBtns = document.querySelectorAll('.toggle-password');
  togglePasswordBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const input = this.closest('.input-group').querySelector('input');
      const icon = this.querySelector('.material-symbols-outlined');
      
      if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = 'visibility';
      } else {
        input.type = 'password';
        icon.textContent = 'visibility_off';
      }
    });
  });
}

function validateAuthForm(form) {
  const email = form.querySelector('#email');
  const password = form.querySelector('#password');
  let isValid = true;

  // Clear previous errors
  clearErrors(form);

  if (email && !isValidEmail(email.value)) {
    showError(email, 'Please enter a valid email address');
    isValid = false;
  }

  if (password && password.value.length < 6) {
    showError(password, 'Password must be at least 6 characters');
    isValid = false;
  }

  if (isValid) {
    // Simulate success
    const btn = form.querySelector('button[type="button"], button[type="submit"]');
    if (btn) {
      const originalText = btn.innerHTML;
      btn.innerHTML = '<span class="spinner" style="width:18px;height:18px;border-width:2px;"></span> Logging in...';
      btn.disabled = true;

      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        // Navigate to dashboard
        window.location.href = 'dashboard.html';
      }, 1500);
    }
  }
}

function validateTripForm(form) {
  const tripName = form.querySelector('#trip-name');
  const startDate = form.querySelector('#start-date');
  const endDate = form.querySelector('#end-date');
  let isValid = true;

  clearErrors(form);

  if (tripName && !tripName.value.trim()) {
    showError(tripName, 'Trip name is required');
    isValid = false;
  }

  if (startDate && !startDate.value) {
    showError(startDate, 'Start date is required');
    isValid = false;
  }

  if (endDate && !endDate.value) {
    showError(endDate, 'End date is required');
    isValid = false;
  }

  if (startDate && endDate && startDate.value && endDate.value) {
    if (new Date(endDate.value) <= new Date(startDate.value)) {
      showError(endDate, 'End date must be after start date');
      isValid = false;
    }
  }

  if (isValid) {
    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
      const originalText = btn.textContent;
      btn.innerHTML = '<span class="spinner" style="width:18px;height:18px;border-width:2px;"></span> Creating...';
      btn.disabled = true;

      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
        window.location.href = 'my-trips.html';
      }, 1500);
    }
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(input, message) {
  const wrapper = input.closest('.input-group') || input.parentElement;
  const errorEl = document.createElement('p');
  errorEl.className = 'input-error';
  errorEl.style.cssText = `
    color: var(--color-error);
    font-size: 12px;
    margin-top: 4px;
    font-weight: 500;
  `;
  errorEl.textContent = message;
  wrapper.appendChild(errorEl);
  input.style.borderColor = 'var(--color-error)';
}

function clearErrors(form) {
  form.querySelectorAll('.input-error').forEach(el => el.remove());
  form.querySelectorAll('input, textarea').forEach(input => {
    input.style.borderColor = '';
  });
}

/* ── Navigation ── */
function initNavigation() {
  // Navigation active state is now handled by navigation.js and sidebar.js
  // Scroll-based navbar background opacity
  const topnav = document.querySelector('.topnav, .landing-nav');
  if (topnav) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        topnav.classList.add('scrolled');
      } else {
        topnav.classList.remove('scrolled');
      }
    }, { passive: true });
  }
}

/* ── Mobile Menu (Handled by navigation.js) ── */
function initMobileMenu() {
  // Redundant logic removed. toggleMobileSidebar in navigation.js is used instead.
}

function closeMobileMenu() {
  const overlay = document.querySelector('.mobile-menu-overlay');
  const sidebar = document.querySelector('.mobile-sidebar');
  overlay?.classList.remove('active');
  sidebar?.classList.remove('active');
  document.body.style.overflow = '';
}

/* ── Tab Switcher ── */
function initTabSwitcher() {
  // Auth tabs (Login / Sign Up)
  const authTabs = document.querySelectorAll('.auth-tab');
  authTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      authTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Trip filter tabs (Upcoming / Past / Drafts)
  const filterTabs = document.querySelectorAll('.filter-tab');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      filterTabs.forEach(t => {
        t.classList.remove('active');
        t.style.backgroundColor = '';
        t.style.color = '';
        t.style.boxShadow = '';
      });
      this.classList.add('active');
      this.style.backgroundColor = 'var(--color-surface)';
      this.style.color = 'var(--color-primary)';
      this.style.boxShadow = 'var(--shadow-sm)';
    });
  });
}

/* ── Checklist Interactivity ── */
function initChecklistInteractivity() {
  // Toggle checked state and visual styling
  const checkboxes = document.querySelectorAll('.checklist-item input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const item = this.closest('.checklist-item');
      const text = item.querySelector('.checklist-text');
      
      if (this.checked) {
        item.classList.add('checked');
        if (text) {
          text.style.textDecoration = 'line-through';
          text.style.color = 'var(--color-outline)';
        }
      } else {
        item.classList.remove('checked');
        if (text) {
          text.style.textDecoration = 'none';
          text.style.color = 'var(--color-on-surface)';
        }
      }

      // Update progress
      updateChecklistProgress();
    });
  });

  // Add new item via input
  const addItemInputs = document.querySelectorAll('.add-item-input');
  addItemInputs.forEach(input => {
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && this.value.trim()) {
        addChecklistItem(this);
      }
    });
  });

  // Delete items
  document.querySelectorAll('.checklist-delete').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const item = this.closest('.checklist-item');
      item.style.opacity = '0';
      item.style.transform = 'translateX(-20px)';
      setTimeout(() => {
        item.remove();
        updateChecklistProgress();
      }, 200);
    });
  });
}

function addChecklistItem(input) {
  const container = input.closest('.checklist-category')?.querySelector('.checklist-items');
  if (!container) return;

  const item = document.createElement('label');
  item.className = 'checklist-item';
  item.innerHTML = `
    <input type="checkbox" class="checklist-checkbox">
    <span class="checklist-text" style="flex:1">${input.value}</span>
    <button class="checklist-delete">
      <span class="material-symbols-outlined" style="font-size:18px">delete</span>
    </button>
  `;

  container.appendChild(item);
  input.value = '';

  // Re-initialize events for new item
  const newCheckbox = item.querySelector('input[type="checkbox"]');
  newCheckbox.addEventListener('change', function() {
    const text = item.querySelector('.checklist-text');
    if (this.checked) {
      item.classList.add('checked');
      text.style.textDecoration = 'line-through';
      text.style.color = 'var(--color-outline)';
    } else {
      item.classList.remove('checked');
      text.style.textDecoration = 'none';
      text.style.color = 'var(--color-on-surface)';
    }
    updateChecklistProgress();
  });

  item.querySelector('.checklist-delete').addEventListener('click', function(e) {
    e.stopPropagation();
    item.style.opacity = '0';
    item.style.transform = 'translateX(-20px)';
    setTimeout(() => {
      item.remove();
      updateChecklistProgress();
    }, 200);
  });

  updateChecklistProgress();
}

function updateChecklistProgress() {
  const allCheckboxes = document.querySelectorAll('.checklist-item input[type="checkbox"]');
  const checkedCount = document.querySelectorAll('.checklist-item input[type="checkbox"]:checked').length;
  const total = allCheckboxes.length;
  const percentage = total > 0 ? Math.round((checkedCount / total) * 100) : 0;

  // Update global progress bar
  const progressFill = document.querySelector('.global-progress-fill');
  const progressText = document.querySelector('.global-progress-text');
  const progressCount = document.querySelector('.global-progress-count');

  if (progressFill) progressFill.style.width = `${percentage}%`;
  if (progressText) progressText.textContent = `${percentage}%`;
  if (progressCount) progressCount.textContent = `${checkedCount} of ${total} items packed`;

  // Update category counts
  document.querySelectorAll('.checklist-category').forEach(category => {
    const catCheckboxes = category.querySelectorAll('.checklist-item input[type="checkbox"]');
    const catChecked = category.querySelectorAll('.checklist-item input[type="checkbox"]:checked').length;
    const catTotal = catCheckboxes.length;
    const countEl = category.querySelector('.category-count');
    if (countEl) countEl.textContent = `${catChecked}/${catTotal} Packed`;
  });
}

/* ── Lazy Loading Images ── */
function initLazyLoading() {
  const images = document.querySelectorAll('img[data-src]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          img.classList.add('loaded');
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px'
    });

    images.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for older browsers
    images.forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }
}

/* ── Progress Bar Animation ── */
function initProgressBars() {
  const progressBars = document.querySelectorAll('.progress-fill');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const width = bar.dataset.width || bar.style.width;
        bar.style.width = '0%';
        requestAnimationFrame(() => {
          bar.style.transition = 'width 1s cubic-bezier(0.4, 0, 0.2, 1)';
          bar.style.width = width;
        });
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.5 });

  progressBars.forEach(bar => observer.observe(bar));
}

/* ── Search Functionality ── */
function initSearchFunctionality() {
  const searchInputs = document.querySelectorAll('.search-input');
  
  searchInputs.forEach(input => {
    let debounceTimer;
    
    input.addEventListener('input', function() {
      clearTimeout(debounceTimer);
      const query = this.value.toLowerCase().trim();
      
      debounceTimer = setTimeout(() => {
        // Search trip cards
        const cards = document.querySelectorAll('.trip-card, .searchable-item');
        cards.forEach(card => {
          const text = card.textContent.toLowerCase();
          if (query === '' || text.includes(query)) {
            card.style.display = '';
            card.style.opacity = '1';
          } else {
            card.style.opacity = '0';
            setTimeout(() => { card.style.display = 'none'; }, 200);
          }
        });
      }, 300);
    });
  });
}

/* ── Utility: Debounce ── */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
