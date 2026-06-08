import { setState, getState } from './store.js';
import { createId } from '../utils/id.js';
import { generateRecommendations, generateCareerPathSteps } from '../features/recommendation-engine.js';
import { computeGoalProgress } from './selectors.js';
import { isAuthenticated, getCurrentUser } from './auth-state.js';
import { isSupabaseConfigured } from '../services/auth.js';
import * as data from '../services/data.js';

function useCloud() {
  return isSupabaseConfigured && isAuthenticated();
}

export async function addSkill({ name, category, level = 1, status = 'active' }) {
  if (useCloud()) {
    const user = getCurrentUser();
    const goalId = getState().careerGoal?.id;
    const skill = await data.createSkillDb(user.id, {
      name: name.trim(),
      category,
      level,
      status,
      goalId,
    });
    setState((s) => ({ ...s, skills: [...s.skills, skill] }));
    return skill;
  }

  const skill = {
    id: createId('skill'),
    name: name.trim(),
    category,
    level: Number(level),
    status,
  };

  setState((s) => ({ ...s, skills: [...s.skills, skill] }));
  return skill;
}

export async function updateSkill(id, updates) {
  if (useCloud()) {
    const skill = await data.updateSkillDb(id, {
      ...updates,
      level: updates.level !== undefined ? Number(updates.level) : undefined,
    });
    setState((s) => ({
      ...s,
      skills: s.skills.map((item) => (item.id === id ? skill : item)),
    }));
    return;
  }

  setState((s) => ({
    ...s,
    skills: s.skills.map((skill) =>
      skill.id === id ? { ...skill, ...updates, level: Number(updates.level ?? skill.level) } : skill
    ),
  }));
}

export async function deleteSkill(id) {
  if (useCloud()) {
    await data.deleteSkillDb(id);
  }

  setState((s) => ({
    ...s,
    skills: s.skills.filter((skill) => skill.id !== id),
    sessions: s.sessions.filter((session) => session.skillId !== id),
  }));
}

export async function addSession({ skillId, sessionDate, durationMinutes, notes }) {
  const skill = getState().skills.find((s) => s.id === skillId);
  if (!skill) return null;

  if (useCloud()) {
    const user = getCurrentUser();
    const session = await data.createSessionDb(user.id, {
      skillId,
      sessionDate,
      durationMinutes,
      notes,
    });
    setState((s) => ({ ...s, sessions: [session, ...s.sessions] }));
    return session;
  }

  const session = {
    id: createId('ses'),
    skillId,
    skillName: skill.name,
    durationMinutes: Number(durationMinutes),
    notes: notes.trim(),
    sessionDate,
  };

  setState((s) => ({ ...s, sessions: [session, ...s.sessions] }));
  return session;
}

export async function deleteSession(id) {
  if (useCloud()) {
    await data.deleteSessionDb(id);
  }

  setState((s) => ({
    ...s,
    sessions: s.sessions.filter((session) => session.id !== id),
  }));
}

export async function updateProfile(updates) {
  if (useCloud()) {
    const user = getCurrentUser();
    await data.updateProfileDb(user.id, updates);
  }

  setState((s) => ({
    ...s,
    profile: { ...s.profile, ...updates },
  }));
}

export async function updateCareerGoal(updates) {
  if (useCloud()) {
    const goalId = getState().careerGoal.id;
    await data.updateCareerGoalDb(goalId, updates);
  }

  setState((s) => {
    const careerGoal = { ...s.careerGoal, ...updates };
    careerGoal.progressPercent = computeGoalProgress(careerGoal.milestones);
    return { ...s, careerGoal };
  });
}

export async function runRecommendationEngine() {
  const { skills, sessions, careerGoal } = getState();
  const generated = generateRecommendations(skills, sessions, careerGoal);
  const careerPathSteps = generateCareerPathSteps(generated);

  if (useCloud()) {
    const user = getCurrentUser();
    const recommendations = await data.replaceRecommendationsDb(user.id, generated);
    setState((s) => ({ ...s, recommendations, careerPathSteps }));
    return recommendations;
  }

  setState((s) => ({
    ...s,
    recommendations: generated,
    careerPathSteps,
  }));

  return generated;
}
