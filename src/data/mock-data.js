export const profile = {
  displayName: 'Edvard G.',
  email: 'edvard@example.com',
  githubUsername: 'edvard-dev',
  weeklyHoursGoal: 10,
  memberSince: '2025-09-15',
};

export const careerGoal = {
  id: 'goal-1',
  title: 'Frontend Developer',
  targetDate: '2026-12-01',
  status: 'active',
  progressPercent: 42,
  milestones: [
    { id: 'm1', title: 'Išmokti HTML/CSS pagrindus', isCompleted: true },
    { id: 'm2', title: 'JavaScript fundamentai', isCompleted: true },
    { id: 'm3', title: 'React arba Vanilla JS projektas', isCompleted: false },
    { id: 'm4', title: 'Portfolio ir GitHub aktyvumas', isCompleted: false },
    { id: 'm5', title: 'Pirmas darbo pokalbis', isCompleted: false },
  ],
};

export const skills = [
  { id: 's1', name: 'JavaScript', category: 'Programavimas', level: 4, sessionsCount: 18 },
  { id: 's2', name: 'CSS', category: 'Dizainas', level: 3, sessionsCount: 12 },
  { id: 's3', name: 'HTML', category: 'Programavimas', level: 4, sessionsCount: 10 },
  { id: 's4', name: 'Git', category: 'Įrankiai', level: 3, sessionsCount: 8 },
  { id: 's5', name: 'TypeScript', category: 'Programavimas', level: 2, sessionsCount: 5 },
  { id: 's6', name: 'UI/UX', category: 'Dizainas', level: 2, sessionsCount: 4 },
];

export const sessions = [
  { id: 'ses1', skillId: 's1', skillName: 'JavaScript', durationMinutes: 90, notes: 'Async/await pratybės', sessionDate: '2026-06-07' },
  { id: 'ses2', skillId: 's2', skillName: 'CSS', durationMinutes: 60, notes: 'Flexbox layout', sessionDate: '2026-06-06' },
  { id: 'ses3', skillId: 's5', skillName: 'TypeScript', durationMinutes: 45, notes: 'Tipų apibrėžimai', sessionDate: '2026-06-05' },
  { id: 'ses4', skillId: 's1', skillName: 'JavaScript', durationMinutes: 120, notes: 'DOM manipuliacija', sessionDate: '2026-06-03' },
  { id: 'ses5', skillId: 's4', skillName: 'Git', durationMinutes: 30, notes: 'Branch strategijos', sessionDate: '2026-06-02' },
  { id: 'ses6', skillId: 's3', skillName: 'HTML', durationMinutes: 75, notes: 'Semantiniai elementai', sessionDate: '2026-06-01' },
  { id: 'ses7', skillId: 's2', skillName: 'CSS', durationMinutes: 50, notes: 'Grid sistema', sessionDate: '2026-05-30' },
  { id: 'ses8', skillId: 's6', skillName: 'UI/UX', durationMinutes: 40, notes: 'Spalvų teorija', sessionDate: '2026-05-28' },
];

export const recommendations = [
  { id: 'r1', skillName: 'TypeScript', reason: 'Frontend tikslui reikia stipresnio TS pagrindo', priority: 'Aukštas', score: 92 },
  { id: 'r2', skillName: 'React', reason: 'Dar nėra pridėtas – populiariausias frontend framework', priority: 'Aukštas', score: 88 },
  { id: 'r3', skillName: 'UI/UX', reason: 'Mažai sesijų – dizaino įgūdis atsilieka', priority: 'Vidutinis', score: 71 },
  { id: 'r4', skillName: 'Testing', reason: 'Nėra testavimo įgūdžių portfolyje', priority: 'Žemas', score: 55 },
];

export const badges = [
  { id: 'b1', title: 'Pirmoji sesija', icon: '🎯', earnedAt: '2025-09-20' },
  { id: 'b2', title: '10 valandų', icon: '⏱️', earnedAt: '2025-10-05' },
  { id: 'b3', title: 'Savaitės čempionas', icon: '🏆', earnedAt: '2026-05-15' },
  { id: 'b4', title: 'Git meistras', icon: '🔀', earnedAt: '2026-04-01' },
];

export const careerPathSteps = [
  { order: 1, skill: 'TypeScript', hours: 12, reason: 'Stiprinti tipų sistemą prieš framework', status: 'current' },
  { order: 2, skill: 'React', hours: 20, reason: 'Pagrindinis frontend įrankis rinkoje', status: 'upcoming' },
  { order: 3, skill: 'Testing (Jest)', hours: 8, reason: 'Profesionalus kodas reikalauja testų', status: 'upcoming' },
  { order: 4, skill: 'Portfolio projektas', hours: 15, reason: 'Pademonstruoti įgūdžius darbdaviui', status: 'upcoming' },
];

export const weeklyHoursByWeek = {
  labels: ['S17', 'S18', 'S19', 'S20', 'S21', 'S22', 'S23', 'S24'],
  data: [4.5, 6, 5.5, 8, 7, 9.5, 6.5, 8.5],
};

export const categoryDistribution = {
  labels: ['Programavimas', 'Dizainas', 'Įrankiai'],
  data: [62, 24, 14],
};

export const skillProgress = {
  labels: ['JavaScript', 'CSS', 'HTML', 'Git', 'TypeScript', 'UI/UX'],
  levels: [4, 3, 4, 3, 2, 2],
  sessionCounts: [18, 12, 10, 8, 5, 4],
};

export const dashboardSummary = {
  weeklyHours: 8.5,
  weeklyGoal: 10,
  totalSessions: 57,
  activeSkills: 6,
  streakDays: 5,
};
