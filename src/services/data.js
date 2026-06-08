import { supabase } from './supabase.js';
import { getInitialState } from '../state/initial-state.js';
import { generateCareerPathSteps } from '../features/recommendation-engine.js';
import { computeGoalProgress } from '../state/selectors.js';

function assertClient() {
  if (!supabase) throw new Error('Supabase client nepasiekiamas');
}

function scoreToPriority(score) {
  if (score >= 80) return 'Aukštas';
  if (score >= 60) return 'Vidutinis';
  return 'Žemas';
}

function mapProfile(row, email) {
  return {
    displayName: row.display_name ?? '',
    email: email ?? '',
    githubUsername: row.github_username ?? '',
    weeklyHoursGoal: row.weekly_hours_goal ?? 10,
    memberSince: row.created_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
  };
}

function mapCareerGoal(goal, milestones) {
  return {
    id: goal.id,
    title: goal.title,
    targetDate: goal.target_date,
    status: goal.status,
    progressPercent: goal.progress_percent ?? computeGoalProgress(milestones),
    milestones: milestones
      .sort((a, b) => a.order_index - b.order_index)
      .map((m) => ({
        id: m.id,
        title: m.title,
        isCompleted: m.is_completed,
      })),
  };
}

function mapSkill(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    level: row.level,
    status: row.status,
    goalId: row.goal_id,
  };
}

function mapSession(row, skillName) {
  return {
    id: row.id,
    skillId: row.skill_id,
    skillName: skillName ?? '',
    durationMinutes: row.duration_minutes,
    notes: row.notes ?? '',
    sessionDate: row.session_date,
  };
}

function mapRecommendation(row) {
  return {
    id: row.id,
    skillName: row.skill_name,
    reason: row.reason ?? '',
    priority: scoreToPriority(row.priority_score),
    score: row.priority_score,
  };
}

function mapUserBadge(row) {
  const badge = row.badges;
  return {
    id: row.id,
    slug: badge?.slug ?? '',
    title: badge?.title ?? '',
    icon: badge?.icon ?? '🏅',
    description: badge?.description ?? '',
    earnedAt: row.earned_at?.slice(0, 10),
  };
}

function mapGithubSnapshot(row) {
  if (!row) return null;
  const topRepos = row.top_repos_json ?? [];
  return {
    id: row.id,
    reposCount: row.repos_count ?? 0,
    fetchedReposCount: topRepos.length,
    languages: row.languages_json ?? {},
    topRepos,
    fetchedAt: row.fetched_at,
  };
}

async function seedDefaultCareerGoal(userId) {
  const template = getInitialState().careerGoal;

  const { data: goal, error: goalError } = await supabase
    .from('career_goals')
    .insert({
      user_id: userId,
      title: template.title,
      target_date: template.targetDate,
      status: 'active',
      progress_percent: computeGoalProgress(template.milestones),
    })
    .select()
    .single();

  if (goalError) throw goalError;

  const milestoneRows = template.milestones.map((m, index) => ({
    goal_id: goal.id,
    title: m.title,
    is_completed: m.isCompleted,
    order_index: index,
  }));

  const { error: msError } = await supabase.from('milestones').insert(milestoneRows);
  if (msError) throw msError;

  return goal;
}

export async function fetchUserData(userId, email) {
  assertClient();

  const [
    profileRes,
    goalsRes,
    skillsRes,
    sessionsRes,
    userBadgesRes,
    recommendationsRes,
    githubRes,
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('career_goals').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
    supabase.from('skills').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
    supabase.from('learning_sessions').select('*').eq('user_id', userId).order('session_date', { ascending: false }),
    supabase.from('user_badges').select('*, badges(*)').eq('user_id', userId).order('earned_at', { ascending: false }),
    supabase.from('recommendations').select('*').eq('user_id', userId).eq('is_dismissed', false).order('priority_score', { ascending: false }),
    supabase.from('github_snapshots').select('*').eq('user_id', userId).order('fetched_at', { ascending: false }).limit(1).maybeSingle(),
  ]);

  if (profileRes.error) throw profileRes.error;
  if (goalsRes.error) throw goalsRes.error;
  if (skillsRes.error) throw skillsRes.error;
  if (sessionsRes.error) throw sessionsRes.error;
  if (userBadgesRes.error) throw userBadgesRes.error;
  if (recommendationsRes.error) throw recommendationsRes.error;

  let goals = goalsRes.data ?? [];
  if (!goals.length) {
    const seeded = await seedDefaultCareerGoal(userId);
    goals = [seeded];
  }

  const activeGoal = goals.find((g) => g.status === 'active') ?? goals[0];

  const { data: milestones, error: msError } = await supabase
    .from('milestones')
    .select('*')
    .eq('goal_id', activeGoal.id)
    .order('order_index', { ascending: true });

  if (msError) throw msError;

  const skills = (skillsRes.data ?? []).map(mapSkill);
  const skillMap = Object.fromEntries(skills.map((s) => [s.id, s.name]));

  const sessions = (sessionsRes.data ?? []).map((row) =>
    mapSession(row, skillMap[row.skill_id])
  );

  const recommendations = (recommendationsRes.data ?? []).map(mapRecommendation);
  const careerPathSteps = generateCareerPathSteps(recommendations);
  const badges = (userBadgesRes.data ?? []).map(mapUserBadge);

  return {
    profile: mapProfile(profileRes.data, email),
    careerGoal: mapCareerGoal(activeGoal, milestones ?? []),
    skills,
    sessions,
    recommendations,
    careerPathSteps,
    badges,
    githubSnapshot: mapGithubSnapshot(githubRes.data),
    weeklyPlan: [],
    pathAnalysis: null,
  };
}

export async function fetchAllBadges() {
  assertClient();

  const { data, error } = await supabase
    .from('badges')
    .select('id, slug, title, description, icon');

  if (error) throw error;
  return data ?? [];
}

export async function awardBadgesDb(userId, badgeIds) {
  assertClient();
  if (!badgeIds.length) return [];

  const rows = badgeIds.map((badge_id) => ({ user_id: userId, badge_id }));
  const { data, error } = await supabase
    .from('user_badges')
    .insert(rows)
    .select('*, badges(*)');

  if (error) throw error;
  return (data ?? []).map(mapUserBadge);
}

export async function saveGithubSnapshotDb(userId, snapshot) {
  assertClient();

  const { data, error } = await supabase
    .from('github_snapshots')
    .insert({
      user_id: userId,
      languages_json: snapshot.languages,
      repos_count: snapshot.reposCount,
      top_repos_json: snapshot.topRepos,
    })
    .select()
    .single();

  if (error) throw error;
  return mapGithubSnapshot(data);
}

export async function updateProfileDb(userId, { displayName, weeklyHoursGoal, githubUsername }) {
  assertClient();

  const updates = {};
  if (displayName !== undefined) updates.display_name = displayName;
  if (weeklyHoursGoal !== undefined) updates.weekly_hours_goal = weeklyHoursGoal;
  if (githubUsername !== undefined) updates.github_username = githubUsername;

  const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
  if (error) throw error;
}

export async function updateCareerGoalDb(goalId, { title, targetDate }) {
  assertClient();

  const updates = {};
  if (title !== undefined) updates.title = title;
  if (targetDate !== undefined) updates.target_date = targetDate;

  const { error } = await supabase.from('career_goals').update(updates).eq('id', goalId);
  if (error) throw error;
}

export async function createSkillDb(userId, { name, category, level, status, goalId }) {
  assertClient();

  const { data, error } = await supabase
    .from('skills')
    .insert({
      user_id: userId,
      name,
      category,
      level: Number(level),
      status,
      goal_id: goalId ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapSkill(data);
}

export async function updateSkillDb(id, updates) {
  assertClient();

  const row = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.category !== undefined) row.category = updates.category;
  if (updates.level !== undefined) row.level = Number(updates.level);
  if (updates.status !== undefined) row.status = updates.status;

  const { data, error } = await supabase.from('skills').update(row).eq('id', id).select().single();
  if (error) throw error;
  return mapSkill(data);
}

export async function deleteSkillDb(id) {
  assertClient();
  const { error } = await supabase.from('skills').delete().eq('id', id);
  if (error) throw error;
}

export async function createSessionDb(userId, { skillId, sessionDate, durationMinutes, notes }) {
  assertClient();

  const { data, error } = await supabase
    .from('learning_sessions')
    .insert({
      user_id: userId,
      skill_id: skillId,
      session_date: sessionDate,
      duration_minutes: Number(durationMinutes),
      notes: notes ?? '',
    })
    .select()
    .single();

  if (error) throw error;

  const { data: skill } = await supabase.from('skills').select('name').eq('id', skillId).single();
  return mapSession(data, skill?.name);
}

export async function deleteSessionDb(id) {
  assertClient();
  const { error } = await supabase.from('learning_sessions').delete().eq('id', id);
  if (error) throw error;
}

export async function replaceRecommendationsDb(userId, recommendations) {
  assertClient();

  const { error: deleteError } = await supabase
    .from('recommendations')
    .delete()
    .eq('user_id', userId)
    .eq('source', 'engine');

  if (deleteError) throw deleteError;

  if (!recommendations.length) return [];

  const rows = recommendations.map((r) => ({
    user_id: userId,
    skill_name: r.skillName,
    reason: r.reason,
    priority_score: r.score,
    source: 'engine',
    is_dismissed: false,
  }));

  const { data, error } = await supabase.from('recommendations').insert(rows).select();
  if (error) throw error;
  return (data ?? []).map(mapRecommendation);
}
