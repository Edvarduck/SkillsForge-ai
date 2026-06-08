import {
  profile,
  careerGoal,
  skills,
  sessions,
  recommendations,
  careerPathSteps,
  badges,
} from '../data/mock-data.js';

export function getInitialState() {
  return {
    profile: { ...profile },
    careerGoal: {
      ...careerGoal,
      milestones: careerGoal.milestones.map((m) => ({ ...m })),
    },
    skills: skills.map((s) => ({
      ...s,
      status: s.status ?? 'active',
    })),
    sessions: sessions.map((s) => ({ ...s })),
    recommendations: recommendations.map((r) => ({ ...r })),
    careerPathSteps: careerPathSteps.map((s) => ({ ...s })),
    badges: badges.map((b) => ({ ...b })),
    githubSnapshot: null,
  };
}
