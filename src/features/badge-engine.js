import { getWeekStart, isSameWeek } from '../utils/date-helpers.js';

export const BADGE_CATALOG = {
  'first-session': {
    slug: 'first-session',
    title: 'Pirmoji sesija',
    description: 'Užregistruota pirmoji mokymosi sesija',
    icon: '🎯',
  },
  'ten-hours': {
    slug: 'ten-hours',
    title: '10 valandų',
    description: 'Iš viso praleista 10 mokymosi valandų',
    icon: '⏱️',
  },
  'week-champion': {
    slug: 'week-champion',
    title: 'Savaitės čempionas',
    description: 'Pasiektas savaitės valandų tikslas',
    icon: '🏆',
  },
  'git-master': {
    slug: 'git-master',
    title: 'Git meistras',
    description: 'Aktyviai mokytasi Git įgūdžio (3+ sesijos)',
    icon: '🔀',
  },
};

const GIT_SESSION_THRESHOLD = 3;

function totalMinutes(sessions) {
  return sessions.reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0);
}

function weeklyMinutes(sessions, weekStart = getWeekStart()) {
  return sessions
    .filter((s) => isSameWeek(s.sessionDate, weekStart))
    .reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0);
}

function gitSessionCount(sessions, skills) {
  const gitSkill = skills.find((s) => s.name.trim().toLowerCase() === 'git');
  if (!gitSkill) return 0;
  return sessions.filter((s) => s.skillId === gitSkill.id).length;
}

export function evaluateBadgeEligibility({ sessions = [], skills = [], profile = {} }) {
  const eligible = [];
  const weeklyGoal = profile.weeklyHoursGoal ?? 10;

  if (sessions.length >= 1) {
    eligible.push({ slug: 'first-session' });
  }

  if (totalMinutes(sessions) >= 600) {
    eligible.push({ slug: 'ten-hours' });
  }

  if (weeklyMinutes(sessions) / 60 >= weeklyGoal) {
    eligible.push({ slug: 'week-champion' });
  }

  if (gitSessionCount(sessions, skills) >= GIT_SESSION_THRESHOLD) {
    eligible.push({ slug: 'git-master' });
  }

  return eligible;
}

export function getNewBadges(eligible, earnedSlugs = []) {
  const earned = new Set(earnedSlugs);
  return eligible.filter((badge) => !earned.has(badge.slug));
}
