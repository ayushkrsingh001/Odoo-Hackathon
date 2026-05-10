import { auth } from '../firebase/config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js';
import { createTrip, getTripById, updateTrip } from '../firebase/firestore.js';
import { getRandomTripImage } from '../utils/defaultTripImages.js';
import { initSidebar } from '../components/sidebar.js';

document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  let currentUser = null;
  let existingTripId = null;

  const urlParams = new URLSearchParams(window.location.search);
  existingTripId = urlParams.get('edit');
  let existingImageUrl = '';

  const form = document.getElementById('create-trip-form');
  const submitBtn = document.getElementById('submit-trip-btn');
  const pageTitle = document.querySelector('.text-headline-xl');
  const imagePreviewEl = document.getElementById('trip-image-preview');

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser = user;
      if (existingTripId) {
        await loadExistingTrip(existingTripId);
      } else {
        // Show a random preview image for new trips
        if (imagePreviewEl) {
          imagePreviewEl.src = getRandomTripImage();
        }
      }
    } else {
      window.location.href = 'login.html';
    }
  });

  async function loadExistingTrip(id) {
    try {
      const trip = await getTripById(id);
      if (trip) {
        document.getElementById('trip-name').value = trip.name;
        document.getElementById('trip-desc').value = trip.description || '';
        document.getElementById('start-date').value = trip.startDate;
        document.getElementById('end-date').value = trip.endDate;
        
        if (trip.coverImage) {
          existingImageUrl = trip.coverImage;
          if (imagePreviewEl) {
            imagePreviewEl.src = trip.coverImage;
          }
        }
        
        if (pageTitle) pageTitle.textContent = "Edit Trip";
        if (submitBtn) submitBtn.textContent = "Update Trip";
      }
    } catch (error) {
      console.error("Error loading trip:", error);
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const tripName = document.getElementById('trip-name').value;
    const tripDesc = document.getElementById('trip-desc').value;
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    try {
      submitBtn.innerHTML = '<span class="spinner" style="width:18px;height:18px;border-width:2px;display:inline-block;border-radius:50%;border-top-color:transparent;animation:spin 1s linear infinite;"></span> Processing...';
      submitBtn.disabled = true;

      // Automatically assign a random cover image (or keep existing one for edits)
      const coverImageUrl = existingImageUrl || getRandomTripImage();

      const tripData = {
        name: tripName,
        description: tripDesc,
        startDate,
        endDate,
        userId: currentUser.uid,
        authorName: currentUser.displayName || 'Explorer',
        authorEmail: currentUser.email,
        coverImage: coverImageUrl,
        updatedAt: new Date().toISOString()
      };

      console.log('Saving trip data:', tripData);

      if (existingTripId) {
        await updateTrip(existingTripId, tripData);
      } else {
        tripData.budget = 0;
        tripData.stops = [];
        tripData.isPublic = false;
        await createTrip(currentUser.uid, tripData);
      }
      
      // Small delay to ensure Firestore local cache is ready
      setTimeout(() => {
        window.location.href = 'my-trips.html';
      }, 500);
    } catch (error) {
      console.error("Error saving trip:", error);
      alert("Failed to save trip: " + error.message);
      submitBtn.disabled = false;
      submitBtn.textContent = existingTripId ? 'Update Trip' : 'Create Trip';
    }
  });
});
