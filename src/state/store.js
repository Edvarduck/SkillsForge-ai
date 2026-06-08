import { getInitialState } from './initial-state.js';

const STORAGE_KEY = 'skillforge-ai-state';

let state = loadFromStorage();
const listeners = new Set();

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
  return getInitialState();
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  listeners.forEach((fn) => fn(state));
}

export function getState() {
  return state;
}

export function setState(updater) {
  const next = typeof updater === 'function' ? updater(state) : updater;
  state = next;
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
