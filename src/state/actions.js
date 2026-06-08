import { setState, getState } from './store.js';
import { createId } from '../utils/id.js';
import { generateRecommendations, generateCareerPathSteps } from '../features/recommendation-engine.js';
import { computeGoalProgress } from './selectors.js';

export function addSkill({ name, category, level = 1, status = 'active' }) {
  const skill = {
    id: createId('skill'),
    name: name.trim(),
    category,
    level: Number(level),
    status,
  };

  setState((s) => ({
    ...s,
    skills: [...s.skills, skill],
  }));

  return skill;
}

export function updateSkill(id, updates) {
  setState((s) => ({
    ...s,
    skills: s.skills.map((skill) =>
      skill.id === id ? { ...skill, ...updates, level: Number(updates.level ?? skill.level) } : skill
    ),
  }));
}

export function deleteSkill(id) {
  setState((s) => ({
    ...s,
    skills: s.skills.filter((skill) => skill.id !== id),
    sessions: s.sessions.filter((session) => session.skillId !== id),
  }));
}

export function addSession({ skillId, sessionDate, durationMinutes, notes }) {
  const skill = getState().skills.find((s) => s.id === skillId);
  if (!skill) return null;

  const session = {
    id: createId('ses'),
    skillId,
    skillName: skill.name,
    durationMinutes: Number(durationMinutes),
    notes: notes.trim(),
    sessionDate,
  };

  setState((s) => ({
    ...s,
    sessions: [session, ...s.sessions],
  }));

  return session;
}

export function deleteSession(id) {
  setState((s) => ({
    ...s,
    sessions: s.sessions.filter((session) => session.id !== id),
  }));
}

export function updateProfile(updates) {
  setState((s) => ({
    ...s,
    profile: { ...s.profile, ...updates },
  }));
}

export function updateCareerGoal(updates) {
  setState((s) => {
    const careerGoal = { ...s.careerGoal, ...updates };
    careerGoal.progressPercent = computeGoalProgress(careerGoal.milestones);
    return { ...s, careerGoal };
  });
}

export function runRecommendationEngine() {
  const { skills, sessions, careerGoal } = getState();
  const recommendations = generateRecommendations(skills, sessions, careerGoal);
  const careerPathSteps = generateCareerPathSteps(recommendations);

  setState((s) => ({
    ...s,
    recommendations,
    careerPathSteps,
  }));

  return recommendations;
}
