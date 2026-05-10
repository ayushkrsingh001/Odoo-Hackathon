import { storage } from './config.js';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js';

export const uploadImage = async (file, path) => {
  if (!file) return null;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

export const deleteImage = async (path) => {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
};
