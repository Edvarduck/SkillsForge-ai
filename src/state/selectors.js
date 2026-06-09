import { getState } from './store.js';
import { getWeekStart, isSameWeek, getWeekLabel, toLocalDateStr } from '../utils/date-helpers.js';

export function computeGoalProgress(milestones) {
  if (!milestones.length) return 0;
  const done = milestones.filter((m) => m.isCompleted).length;
  return Math.round((done / milestones.length) * 100);
}

export function getSkillsWithSessionCounts() {
  const { skills, sessions } = getState();

  return skills.map((skill) => ({
    ...skill,
    sessionsCount: sessions.filter((s) => s.skillId === skill.id).length,
  }));
}

export function getWeeklyHoursChartData() {
  const { sessions } = getState();
  const weekStart = getWeekStart();
  const labels = [];
  const data = [];

  for (let i = 7; i >= 0; i--) {
    const start = new Date(weekStart);
    start.setDate(start.getDate() - i * 7);
    const labelDate = new Date(start);
    labelDate.setDate(labelDate.getDate() + 3);
    labels.push(getWeekLabel(labelDate.toISOString()));

    const minutes = sessions
      .filter((s) => isSameWeek(s.sessionDate, start))
      .reduce((sum, s) => sum + s.durationMinutes, 0);

    data.push(Math.round((minutes / 60) * 10) / 10);
  }

  return { labels, data };
}

export function getCategoryDistribution() {
  const { skills, sessions } = getState();
  const totals = {};

  sessions.forEach((session) => {
    const skill = skills.find((s) => s.id === session.skillId);
    const category = skill?.category ?? 'Kita';
    totals[category] = (totals[category] ?? 0) + session.durationMinutes;
  });

  const labels = Object.keys(totals);
  const data = labels.map((label) => totals[label]);

  return { labels, data: data.length ? data : [1], empty: !data.length };
}

export function getSkillProgressChartData() {
  const skills = getSkillsWithSessionCounts();
  return {
    labels: skills.map((s) => s.name),
    levels: skills.map((s) => s.level),
    sessionCounts: skills.map((s) => s.sessionsCount),
  };
}

export function getDashboardSummary() {
  const { skills, sessions, profile } = getState();
  const weekStart = getWeekStart();

  const weeklyMinutes = sessions
    .filter((s) => isSameWeek(s.sessionDate, weekStart))
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  const activeSkills = skills.filter((s) => s.status === 'active').length;

  return {
    weeklyHours: Math.round((weeklyMinutes / 60) * 10) / 10,
    weeklyGoal: profile.weeklyHoursGoal,
    totalSessions: sessions.length,
    activeSkills,
    streakDays: computeStreak(sessions),
  };
}

function computeStreak(sessionList) {
  if (!sessionList.length) return 0;

  const sessionDates = new Set(sessionList.map((s) => s.sessionDate));
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  // Jei šiandien nėra sesijos – streak skaičiuojamas nuo vakar
  if (!sessionDates.has(toLocalDateStr(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!sessionDates.has(toLocalDateStr(cursor))) {
      return 0;
    }
  }

  let streak = 0;
  while (sessionDates.has(toLocalDateStr(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
