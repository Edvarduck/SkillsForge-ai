import { runPathEngine } from './path-engine.js';

/** @deprecated Naudok runPathEngine – palikta suderinamumui */
export function generateRecommendations(skills, sessions, careerGoal, githubSnapshot = null, weeklyHoursGoal = 10) {
  return runPathEngine({
    careerGoal,
    skills,
    sessions,
    githubSnapshot,
    weeklyHoursGoal,
  }).recommendations;
}

export function generateCareerPathSteps(recommendations) {
  return recommendations.slice(0, 5).map((rec, index) => ({
    order: index + 1,
    skill: rec.skillName,
    hours: Math.max(6, Math.round(rec.score / 5)),
    reason: rec.reason,
    score: rec.score,
    priority: rec.priority,
    status: index === 0 ? 'current' : 'upcoming',
  }));
}
