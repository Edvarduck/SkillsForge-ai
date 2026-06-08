import { setState, getState } from './store.js';
import { createId } from '../utils/id.js';
import { runPathEngine } from '../features/path-engine.js';
import { computeGoalProgress } from './selectors.js';
import { isAuthenticated, getCurrentUser } from './auth-state.js';
import { isSupabaseConfigured } from '../services/auth.js';
import * as data from '../services/data.js';
import { fetchGithubProfile } from '../services/github.js';
import { isGithubCacheFresh } from '../utils/github-helpers.js';

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

export async function syncGithub({ force = false } = {}) {
  const { profile, githubSnapshot } = getState();
  const username = profile.githubUsername?.trim();

  if (!username) {
    throw new Error('Įvesk GitHub vartotojo vardą profilyje');
  }

  if (!force && isGithubCacheFresh(githubSnapshot?.fetchedAt)) {
    throw new Error('GitHub duomenys atnaujinti prieš mažiau nei 1 val. – bandyk vėliau');
  }

  const githubData = await fetchGithubProfile(username);
  let snapshot = {
    reposCount: githubData.reposCount,
    fetchedReposCount: githubData.fetchedReposCount,
    languages: githubData.languages,
    topRepos: githubData.topRepos,
    fetchedAt: new Date().toISOString(),
  };

  if (useCloud()) {
    const user = getCurrentUser();
    snapshot = await data.saveGithubSnapshotDb(user.id, snapshot);
  }

  if (githubData.username && githubData.username !== profile.githubUsername) {
    await updateProfile({ githubUsername: githubData.username });
  }

  setState((s) => ({ ...s, githubSnapshot: snapshot }));
  return snapshot;
}

export async function runPathEngineAction() {
  const { skills, sessions, careerGoal, githubSnapshot, profile } = getState();

  const result = runPathEngine({
    careerGoal,
    skills,
    sessions,
    githubSnapshot,
    weeklyHoursGoal: profile.weeklyHoursGoal ?? 10,
  });

  const { recommendations, careerPathSteps, weeklyPlan, analysisSteps } = result;

  if (useCloud()) {
    const user = getCurrentUser();
    const saved = await data.replaceRecommendationsDb(user.id, recommendations);
    setState((s) => ({
      ...s,
      recommendations: saved,
      careerPathSteps,
      weeklyPlan,
      pathAnalysis: analysisSteps,
    }));
    return result;
  }

  setState((s) => ({
    ...s,
    recommendations,
    careerPathSteps,
    weeklyPlan,
    pathAnalysis: analysisSteps,
  }));

  return result;
}

/** Alias suderinamumui */
export const runRecommendationEngine = runPathEngineAction;
