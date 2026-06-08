import { getSession, onAuthStateChange, isSupabaseConfigured } from '../services/auth.js';
import { fetchUserData } from '../services/data.js';
import { replaceState, setPersistenceMode, resetState } from './store.js';
import { getInitialState } from './initial-state.js';

let currentUser = null;
let authReady = false;
let dataLoading = false;

export function getCurrentUser() {
  return currentUser;
}

export function isAuthenticated() {
  return Boolean(currentUser);
}

export function isAuthReady() {
  return authReady;
}

export function isDataLoading() {
  return dataLoading;
}

export function requiresAuth() {
  return isSupabaseConfigured;
}

async function loadUserData(user) {
  dataLoading = true;
  window.dispatchEvent(new CustomEvent('skillforge:auth-change'));

  try {
    const appData = await fetchUserData(user.id, user.email);
    setPersistenceMode(false);
    replaceState(appData);
  } catch (err) {
    console.error('Nepavyko įkelti duomenų:', err);
    throw err;
  } finally {
    dataLoading = false;
    window.dispatchEvent(new CustomEvent('skillforge:auth-change'));
  }
}

function resetToGuest() {
  currentUser = null;
  setPersistenceMode(true);
  resetState();
}

export async function initAuth() {
  if (!isSupabaseConfigured) {
    authReady = true;
    setPersistenceMode(true);
    return;
  }

  const { data } = await getSession();
  currentUser = data.session?.user ?? null;

  if (currentUser) {
    await loadUserData(currentUser);
  } else {
    setPersistenceMode(true);
    replaceState(getInitialState());
  }

  authReady = true;

  onAuthStateChange(async (event, session) => {
    const user = session?.user ?? null;

    if (event === 'SIGNED_IN' && user && user.id !== currentUser?.id) {
      currentUser = user;
      await loadUserData(user);
      window.dispatchEvent(new CustomEvent('skillforge:auth-change'));
      return;
    }

    if (event === 'SIGNED_OUT') {
      currentUser = null;
      resetToGuest();
      window.dispatchEvent(new CustomEvent('skillforge:auth-change'));
    }
  });
}

export async function handleSignedIn(user) {
  currentUser = user;
  await loadUserData(user);
  window.dispatchEvent(new CustomEvent('skillforge:auth-change'));
}

export function handleSignedOut() {
  currentUser = null;
  resetToGuest();
  window.dispatchEvent(new CustomEvent('skillforge:auth-change'));
}
