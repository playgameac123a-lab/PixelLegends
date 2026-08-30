import { app } from './firebase-config.js';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);
export let currentUser = null;

export function isRemoteAuthSupported() {
  return location.protocol !== 'file:' && !!window.localStorage;
}

export function initAuth(onUserChange) {
  if (!isRemoteAuthSupported()) {
    if (typeof onUserChange === 'function') onUserChange(null, null);
    return;
  }

  onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    if (user) {
      const data = await loadCloudData(user.uid);
      onUserChange(user, data);
    } else {
      onUserChange(null, null);
    }
  });
}

export async function loginWithGoogle() {
  if (!isRemoteAuthSupported()) {
    console.warn('Firebase Auth requires an HTTP/HTTPS page. Please run via localhost or a hosted site.');
    return;
  }

  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Login failed:", error);
  }
}

export async function saveCloudData(saveData) {
  if (!currentUser || !isRemoteAuthSupported()) return;
  await setDoc(doc(db, "users", currentUser.uid), saveData, { merge: true });
}

async function loadCloudData(uid) {
  if (!isRemoteAuthSupported()) return null;
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}