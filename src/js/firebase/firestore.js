import { db } from './config.js';
import { 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js';

// Trips
export const createTrip = async (userId, tripData) => {
  const tripWithUser = { ...tripData, userId, createdAt: new Date().toISOString() };
  const docRef = await addDoc(collection(db, 'trips'), tripWithUser);
  return docRef.id;
};

export const getTrips = async (userId) => {
  const q = query(collection(db, 'trips'), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getTrip = async (tripId) => {
  const docRef = doc(db, 'trips', tripId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const getSharedTrips = async () => {
  // Query trips where isPublic is true
  const q = query(collection(db, 'trips'), where("isPublic", "==", true), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getTripById = async (tripId) => {
  const docRef = doc(db, 'trips', tripId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    throw new Error("No such document!");
  }
};

export const updateTrip = async (tripId, tripData) => {
  const docRef = doc(db, 'trips', tripId);
  await updateDoc(docRef, tripData);
};

export const deleteTrip = async (tripId) => {
  await deleteDoc(doc(db, 'trips', tripId));
};

export const listenToTrips = (userId, callback, onError) => {
  if (!userId) {
    if (onError) onError(new Error("User ID is required for listening to trips."));
    return () => {};
  }
  const q = query(collection(db, 'trips'), where("userId", "==", userId));
  return onSnapshot(q, (querySnapshot) => {
    const trips = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    callback(trips);
  }, (error) => {
    console.error("Error listening to trips:", error);
    if (onError) onError(error);
  });
};

// Items (Generic collection operations)
export const addSubcollectionItem = async (tripId, collectionName, itemData) => {
  const docRef = await addDoc(collection(db, 'trips', tripId, collectionName), {
    ...itemData,
    createdAt: new Date().toISOString()
  });
  return docRef.id;
};

export const getSubcollectionItems = async (tripId, collectionName) => {
  const querySnapshot = await getDocs(collection(db, 'trips', tripId, collectionName));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateSubcollectionItem = async (tripId, collectionName, itemId, itemData) => {
  const docRef = doc(db, 'trips', tripId, collectionName, itemId);
  await updateDoc(docRef, itemData);
};

export const deleteSubcollectionItem = async (tripId, collectionName, itemId) => {
  await deleteDoc(doc(db, 'trips', tripId, collectionName, itemId));
};

export const listenToSubcollection = (tripId, collectionName, callback, onError) => {
  if (!tripId) {
    if (onError) onError(new Error("Trip ID is required for listening to subcollection."));
    return () => {};
  }
  const q = collection(db, 'trips', tripId, collectionName);
  return onSnapshot(q, (querySnapshot) => {
    const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(items);
  }, (error) => {
    console.error(`Error listening to ${collectionName}:`, error);
    if (onError) onError(error);
  });
};
