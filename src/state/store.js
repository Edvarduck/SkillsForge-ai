import { getInitialState } from './initial-state.js';

const STORAGE_KEY = 'skillforge-ai-state';

let state = loadFromStorage();
const listeners = new Set();
let useLocalPersistence = true;

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
  return getInitialState();
}

function notify() {
  listeners.forEach((fn) => fn(state));
}

function persist() {
  if (useLocalPersistence) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  notify();
}

export function setPersistenceMode(local) {
  useLocalPersistence = local;
}

export function getState() {
  return state;
}

export function setState(updater) {
  const next = typeof updater === 'function' ? updater(state) : updater;
  state = next;
  persist();
}

export function replaceState(newState) {
  state = newState;
  persist();
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function resetState() {
  state = getInitialState();
  persist();
}
