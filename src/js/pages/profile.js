import { auth } from '../firebase/config.js';
import { onAuthStateChanged, updateProfile, signOut } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { initSidebar } from '../components/sidebar.js';
import { protectRoute } from '../utils/guards.js';

document.addEventListener('DOMContentLoaded', async () => {
    initSidebar();
    const user = await protectRoute();
    let currentUser = user;

    const displayNameInput = document.getElementById('display-name-input');
    const profileForm = document.getElementById('profile-form');
    const userDisplayNameEl = document.getElementById('user-display-name');
    const userEmailEl = document.getElementById('user-email');
    const profileImg = document.getElementById('profile-img');
    const avatarPlaceholder = document.getElementById('avatar-placeholder');
    const avatarInput = document.getElementById('avatar-input');

    if (user) {
        updateUI(user);
    }

    function updateUI(user) {
        if (userDisplayNameEl) userDisplayNameEl.textContent = user.displayName || 'Traveler';
        if (userEmailEl) userEmailEl.textContent = user.email;
        if (displayNameInput) displayNameInput.value = user.displayName || '';
        
        if (user.photoURL) {
            if (profileImg) {
                profileImg.src = user.photoURL;
                profileImg.style.display = 'block';
            }
            if (avatarPlaceholder) avatarPlaceholder.style.display = 'none';
        } else {
            if (avatarPlaceholder) {
                avatarPlaceholder.textContent = user.displayName ? user.displayName.charAt(0) : user.email.charAt(0);
                avatarPlaceholder.style.display = 'flex';
            }
            if (profileImg) profileImg.style.display = 'none';
        }
    }

    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newName = displayNameInput.value.trim();
            if (!newName) return;

            try {
                const btn = profileForm.querySelector('button');
                btn.disabled = true;
                btn.textContent = "Updating...";

                await updateProfile(auth.currentUser, {
                    displayName: newName
                });
                
                alert("Profile updated!");
                updateUI(auth.currentUser);
                btn.disabled = false;
                btn.textContent = "Save Changes";
            } catch (error) {
                console.error("Error updating profile:", error);
                alert("Failed to update profile.");
            }
        });
    }

    if (avatarInput) {
        avatarInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const photoURL = await uploadToCloudinary(file);
                await updateProfile(auth.currentUser, { photoURL });
                alert("Photo updated!");
                updateUI(auth.currentUser);
            } catch (error) {
                console.error("Error uploading avatar:", error);
                alert("Failed to upload photo.");
            }
        });
    }
});
