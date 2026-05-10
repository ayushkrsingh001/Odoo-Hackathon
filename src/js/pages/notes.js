import { auth, db } from '../firebase/config.js';
import { getTrip, listenToSubcollection, addSubcollectionItem, updateSubcollectionItem, deleteSubcollectionItem } from '../firebase/firestore.js';
import { initSidebar } from '../components/sidebar.js';
import { protectRoute } from '../utils/guards.js';
import { initTripSelector } from '../utils/tripSelector.js';

document.addEventListener('DOMContentLoaded', async () => {
    initSidebar();
    const user = await protectRoute();
    if (!user) return;

    const workspace = document.getElementById('feature-workspace');
    const selectedTripName = document.getElementById('selected-trip-name');
    const selectedTripDates = document.getElementById('selected-trip-dates');
    const notesGrid = document.getElementById('notes-grid');

    const noteModal = document.getElementById('note-modal');
    const noteForm = document.getElementById('note-form');
    const addNoteBtn = document.getElementById('add-note-btn');
    const closeNoteModalBtn = document.getElementById('close-note-modal');

    let currentEditingNoteId = null;

    // Initial trip context
    const urlParams = new URLSearchParams(window.location.search);
    let currentTripId = urlParams.get('tripId') || urlParams.get('id');

    // Initialize Trip Selector
    initTripSelector({
        containerId: 'trip-selector-section',
        title: 'Trip Notes',
        subtitle: 'Select a trip to view and manage your travel notes and reminders.',
        selectedTripId: currentTripId,
        userId: user.uid,
        onSelect: async (tripId) => {
            const newUrl = window.location.pathname + '?tripId=' + tripId;
            window.history.pushState({ path: newUrl }, '', newUrl);
            localStorage.setItem('lastViewedTripId', tripId);
            await loadTripWorkspace(tripId);
        }
    });

    // If we have a tripId, load it immediately
    if (currentTripId) {
        loadTripWorkspace(currentTripId);
    } else {
        if (window.initScrollAnimations) window.initScrollAnimations();
    }

    async function loadTripWorkspace(tripId) {
        currentTripId = tripId;
        try {
            const trip = await getTrip(tripId);
            if (!trip) {
                workspace.style.display = 'none';
                return;
            }

            // Update Header
            if (selectedTripName) selectedTripName.textContent = `${trip.name} Notes`;
            if (selectedTripDates) {
                const start = new Date(trip.startDate);
                const end = new Date(trip.endDate);
                selectedTripDates.textContent = `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
            }

            // Show workspace
            workspace.style.display = 'block';

            // Setup listeners
            setupNotesListener(tripId);
            
            // Re-initialize selector
            initTripSelector({
                containerId: 'trip-selector-section',
                title: 'Trip Notes',
                subtitle: 'Select a trip to view and manage your travel notes and reminders.',
                selectedTripId: tripId,
                userId: user.uid,
                onSelect: async (newId) => {
                    const newUrl = window.location.pathname + '?tripId=' + newId;
                    window.history.pushState({ path: newUrl }, '', newUrl);
                    localStorage.setItem('lastViewedTripId', newId);
                    await loadTripWorkspace(newId);
                }
            });

            if (window.initScrollAnimations) window.initScrollAnimations();
        } catch (error) {
            console.error("Error loading notes data:", error);
            if (workspace) workspace.innerHTML = `<div style="padding:48px; text-align:center; color:var(--color-error);"><span class="material-symbols-outlined" style="font-size:48px; margin-bottom:16px;">error</span><h3>Error Loading Notes</h3><p>${error.message}</p></div>`;
            if (workspace) workspace.style.display = 'block';
        }
    }

    function setupNotesListener(tripId) {
        listenToSubcollection(tripId, 'notes', (notes) => {
            renderNotes(notes);
            if (window.initScrollAnimations) window.initScrollAnimations();
        }, (error) => {
            console.error("Notes listener error:", error);
        });
    }

    function renderNotes(notes) {
        if (!notesGrid) return;
        notesGrid.innerHTML = '';

        if (notes.length === 0) {
            notesGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align:center; padding:64px; border: 2px dashed rgba(193,198,215,0.4); border-radius:var(--radius-lg); margin-top:20px;">
                    <span class="material-symbols-outlined" style="font-size:48px; color:var(--color-outline); margin-bottom:16px;">edit_document</span>
                    <h4 class="text-headline-sm" style="color:var(--color-on-surface-variant); margin-bottom:8px;">No notes yet</h4>
                    <p class="text-body-sm" style="color:var(--color-outline); max-width:280px; margin:0 auto;">Click "New Note" to jot down your thoughts and ideas.</p>
                </div>
            `;
            return;
        }

        // Sort by newest first
        notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        notes.forEach(note => {
            const card = document.createElement('div');
            card.className = 'card card-bordered reveal';
            card.style.cssText = 'padding:24px; display:flex; flex-direction:column; justify-content:space-between; position:relative;';

            const dateStr = new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            // Format content to maintain line breaks
            const formattedContent = note.content ? note.content.replace(/\n/g, '<br>') : '';

            card.innerHTML = `
                <div>
                    <h3 class="text-headline-md" style="font-weight:700; margin-bottom:12px; padding-right:48px;">${note.title}</h3>
                    <div class="text-body-md" style="color:var(--color-on-surface); line-height:1.6; margin-bottom:24px;">${formattedContent}</div>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(193,198,215,0.3); padding-top:16px;">
                    <span class="text-label-sm" style="color:var(--color-outline);">${dateStr}</span>
                    <div style="display:flex; gap:8px;">
                        <button class="btn-icon btn-icon-sm edit-note-btn" data-id="${note.id}" style="background:none; border:none; color:var(--color-primary);">
                            <span class="material-symbols-outlined" style="font-size:18px;">edit</span>
                        </button>
                        <button class="btn-icon btn-icon-sm delete-note-btn" data-id="${note.id}" style="background:none; border:none; color:var(--color-error);">
                            <span class="material-symbols-outlined" style="font-size:18px;">delete</span>
                        </button>
                    </div>
                </div>
            `;

            const editBtn = card.querySelector('.edit-note-btn');
            if (editBtn) {
                editBtn.addEventListener('click', () => {
                    currentEditingNoteId = note.id;
                    document.getElementById('note-title').value = note.title;
                    document.getElementById('note-content').value = note.content;
                    const modalTitle = noteModal.querySelector('h3');
                    if (modalTitle) modalTitle.textContent = 'Edit Note';
                    noteModal.style.display = 'flex';
                });
            }

            const deleteBtn = card.querySelector('.delete-note-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', async () => {
                    if (confirm('Are you sure you want to delete this note?')) {
                        try {
                            await deleteSubcollectionItem(currentTripId, 'notes', note.id);
                            showToast("Note deleted");
                        } catch (error) {
                            console.error("Error deleting note:", error);
                            showToast("Failed to delete note", "error");
                        }
                    }
                });
            }

            notesGrid.appendChild(card);
        });
    }

    if (addNoteBtn) {
        addNoteBtn.addEventListener('click', () => {
            currentEditingNoteId = null;
            noteForm.reset();
            const modalTitle = noteModal.querySelector('h3');
            if (modalTitle) modalTitle.textContent = 'New Note';
            noteModal.style.display = 'flex';
        });
    }

    if (closeNoteModalBtn) {
        closeNoteModalBtn.addEventListener('click', () => {
            noteModal.style.display = 'none';
        });
    }

    if (noteForm) {
        noteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = noteForm.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.textContent = 'Saving...';

            const noteData = {
                title: document.getElementById('note-title').value,
                content: document.getElementById('note-content').value,
                createdAt: currentEditingNoteId ? undefined : new Date().toISOString()
            };

            // Remove undefined fields
            Object.keys(noteData).forEach(key => noteData[key] === undefined && delete noteData[key]);

            try {
                if (currentEditingNoteId) {
                    await updateSubcollectionItem(currentTripId, 'notes', currentEditingNoteId, noteData);
                } else {
                    await addSubcollectionItem(currentTripId, 'notes', noteData);
                }
                noteModal.style.display = 'none';
                showToast("Note saved successfully!");
            } catch (error) {
                console.error("Error saving note:", error);
                showToast("Failed to save note", "error");
            } finally {
                btn.disabled = false;
                btn.textContent = 'Save Note';
            }
        });
    }

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = 'toast reveal';
        toast.style.cssText = `
            position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
            background: ${type === 'error' ? 'var(--color-error)' : 'var(--color-primary)'};
            color: #fff; padding: 12px 24px; border-radius: 999px; z-index: 9999;
            font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
});
