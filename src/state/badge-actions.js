import { getState, setState } from './store.js';
import { isAuthenticated, getCurrentUser } from './auth-state.js';
import { isSupabaseConfigured } from '../services/auth.js';
import * as data from '../services/data.js';
import {
  BADGE_CATALOG,
  evaluateBadgeEligibility,
  getNewBadges,
} from '../features/badge-engine.js';
import { showToast } from '../components/toast.js';
import { createId } from '../utils/id.js';

function useCloud() {
  return isSupabaseConfigured && isAuthenticated();
}

export async function checkAndAwardBadges({ silent = false } = {}) {
  const state = getState();
  const earnedSlugs = state.badges.map((b) => b.slug).filter(Boolean);
  const eligible = evaluateBadgeEligibility(state);
  const newOnes = getNewBadges(eligible, earnedSlugs);

  if (!newOnes.length) return [];

  const today = new Date().toISOString().slice(0, 10);

  if (useCloud()) {
    const user = getCurrentUser();
    const allBadges = await data.fetchAllBadges();
    const slugToId = Object.fromEntries(allBadges.map((b) => [b.slug, b.id]));
    const badgeIds = newOnes.map((n) => slugToId[n.slug]).filter(Boolean);

    if (!badgeIds.length) return [];

    const awarded = await data.awardBadgesDb(user.id, badgeIds);
    setState((s) => ({ ...s, badges: [...awarded, ...s.badges] }));
  } else {
    const newBadges = newOnes.map((n) => {
      const meta = BADGE_CATALOG[n.slug];
      return {
        id: createId('badge'),
        slug: n.slug,
        title: meta.title,
        icon: meta.icon,
        description: meta.description,
        earnedAt: today,
      };
    });
    setState((s) => ({ ...s, badges: [...newBadges, ...s.badges] }));
  }

  if (!silent) {
    newOnes.forEach((n) => {
      const meta = BADGE_CATALOG[n.slug];
      showToast(`🏅 Naujas ženklelis: ${meta.title}`);
    });
  }

  return newOnes;
}
