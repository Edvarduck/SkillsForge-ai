import { setState, getState } from './store.js';
import { createId } from '../utils/id.js';
import { runPathEngine } from '../features/path-engine.js';
import { computeGoalProgress } from './selectors.js';
import { isAuthenticated, getCurrentUser } from './auth-state.js';
import { isSupabaseConfigured } from '../services/auth.js';
import * as data from '../services/data.js';
import { fetchGithubProfile } from '../services/github.js';
import { isGithubCacheFresh } from '../utils/github-helpers.js';
import { checkAndAwardBadges } from './badge-actions.js';

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
    await checkAndAwardBadges();
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
  await checkAndAwardBadges();
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

function setMilestonesState(milestones) {
  const progressPercent = computeGoalProgress(milestones);

  setState((s) => ({
    ...s,
    careerGoal: {
      ...s.careerGoal,
      milestones,
      progressPercent,
    },
  }));

  return progressPercent;
}

export async function toggleMilestone(id) {
  const { careerGoal } = getState();
  const milestone = careerGoal.milestones.find((m) => m.id === id);
  if (!milestone) return;

  const isCompleted = !milestone.isCompleted;

  if (useCloud()) {
    const updated = await data.updateMilestoneDb(id, { isCompleted });
    const milestones = careerGoal.milestones.map((m) => (m.id === id ? updated : m));
    const progressPercent = setMilestonesState(milestones);
    await data.updateCareerGoalDb(careerGoal.id, { progressPercent });
    return;
  }

  const milestones = careerGoal.milestones.map((m) =>
    m.id === id ? { ...m, isCompleted } : m
  );
  setMilestonesState(milestones);
}

export async function updateMilestone(id, { title }) {
  const trimmed = title.trim();
  if (!trimmed) throw new Error('Milestone pavadinimas negali būti tuščias');

  if (useCloud()) {
    const updated = await data.updateMilestoneDb(id, { title: trimmed });
    setState((s) => ({
      ...s,
      careerGoal: {
        ...s.careerGoal,
        milestones: s.careerGoal.milestones.map((m) => (m.id === id ? updated : m)),
      },
    }));
    return;
  }

  setState((s) => ({
    ...s,
    careerGoal: {
      ...s.careerGoal,
      milestones: s.careerGoal.milestones.map((m) =>
        m.id === id ? { ...m, title: trimmed } : m
      ),
    },
  }));
}

export async function addMilestone({ title }) {
  const trimmed = title.trim();
  if (!trimmed) throw new Error('Įvesk milestone pavadinimą');

  const { careerGoal } = getState();
  const orderIndex = careerGoal.milestones.length;

  if (useCloud()) {
    const created = await data.createMilestoneDb(careerGoal.id, {
      title: trimmed,
      orderIndex,
    });
    const milestones = [...careerGoal.milestones, created];
    const progressPercent = setMilestonesState(milestones);
    await data.updateCareerGoalDb(careerGoal.id, { progressPercent });
    return created;
  }

  const milestone = {
    id: createId('ms'),
    title: trimmed,
    isCompleted: false,
  };

  setMilestonesState([...careerGoal.milestones, milestone]);
  return milestone;
}

export async function deleteMilestone(id) {
  const { careerGoal } = getState();

  if (useCloud()) {
    await data.deleteMilestoneDb(id);
    const milestones = careerGoal.milestones.filter((m) => m.id !== id);
    const progressPercent = setMilestonesState(milestones);
    await data.updateCareerGoalDb(careerGoal.id, { progressPercent });
    return;
  }

  const milestones = careerGoal.milestones.filter((m) => m.id !== id);
  setMilestonesState(milestones);
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
    try {
      await data.savePathCacheDb(user.id, {
        weeklyPlan,
        pathAnalysis: analysisSteps,
        careerPathSteps,
      });
    } catch (err) {
      console.warn('Path cache nepavyko išsaugoti (ar paleistas 003_path_cache.sql?):', err);
    }
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
