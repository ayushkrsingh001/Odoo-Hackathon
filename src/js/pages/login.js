import { loginUser, loginWithGoogle, registerUser } from '../firebase/auth.js';

document.addEventListener('DOMContentLoaded', () => {
  const authForm = document.getElementById('auth-form');
  const loginBtn = document.getElementById('login-btn');
  const googleBtn = document.querySelector('.auth-social-btn'); // Assuming first one is Google
  const authTabs = document.querySelectorAll('.auth-tab');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  
  let isLoginMode = true;

  // Tab switching
  authTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      authTabs.forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      isLoginMode = e.target.textContent.trim() === 'Log In';
      loginBtn.innerHTML = isLoginMode ? 'Log In <span class="material-symbols-outlined" style="font-size:20px;">arrow_forward</span>' : 'Sign Up <span class="material-symbols-outlined" style="font-size:20px;">arrow_forward</span>';
      
      // Optionally handle adding a name field for Sign Up
      let nameField = document.getElementById('name-container');
      if (!isLoginMode && !nameField) {
        const nameHtml = `
          <div id="name-container" class="auth-input-group">
            <label for="name">Full Name</label>
            <div class="auth-input-wrapper">
              <span class="material-symbols-outlined">person</span>
              <input class="auth-input" id="name" type="text" placeholder="John Doe">
            </div>
          </div>
        `;
        emailInput.closest('.auth-input-group').insertAdjacentHTML('beforebegin', nameHtml);
      } else if (isLoginMode && nameField) {
        nameField.remove();
      }
    });
  });

  // Handle email auth
  loginBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;
    
    try {
      const originalText = loginBtn.innerHTML;
      loginBtn.innerHTML = '<span class="spinner" style="width:18px;height:18px;border-width:2px;display:inline-block;border-radius:50%;border-top-color:transparent;animation:spin 1s linear infinite;"></span> Processing...';
      loginBtn.disabled = true;

      if (isLoginMode) {
        await loginUser(email, password);
      } else {
        const nameInput = document.getElementById('name');
        const name = nameInput ? nameInput.value : 'User';
        await registerUser(email, password, name);
      }
      
      // Redirect on success
      window.location.href = 'dashboard.html';
    } catch (error) {
      console.error("Auth error", error);
      alert(error.message); // In a real app, use toast
      loginBtn.disabled = false;
      loginBtn.innerHTML = isLoginMode ? 'Log In <span class="material-symbols-outlined" style="font-size:20px;">arrow_forward</span>' : 'Sign Up <span class="material-symbols-outlined" style="font-size:20px;">arrow_forward</span>';
    }
  });

  // Handle Google Login
  if (googleBtn) {
    googleBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await loginWithGoogle();
        window.location.href = 'dashboard.html';
      } catch (error) {
        console.error("Google Auth error", error);
        alert(error.message);
      }
    });
  }
});
