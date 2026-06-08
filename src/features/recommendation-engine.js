import { daysSince } from '../utils/date-helpers.js';

const PRIORITY_LABELS = [
  [80, 'Aukštas'],
  [60, 'Vidutinis'],
  [0, 'Žemas'],
];

function toPriority(score) {
  return PRIORITY_LABELS.find(([min]) => score >= min)[1];
}

export function generateRecommendations(skills, sessions, careerGoal) {
  const recs = [];
  const sessionsBySkill = {};

  sessions.forEach((s) => {
    sessionsBySkill[s.skillId] = sessionsBySkill[s.skillId] ?? [];
    sessionsBySkill[s.skillId].push(s);
  });

  skills.forEach((skill) => {
    const skillSessions = sessionsBySkill[skill.id] ?? [];
    const lastDate = skillSessions[0]?.sessionDate;
    const daysIdle = lastDate ? daysSince(lastDate) : 999;

    if (skill.level < 3) {
      const score = 90 - skill.level * 15 + (daysIdle > 7 ? 10 : 0);
      recs.push({
        id: `rec-${skill.id}-level`,
        skillName: skill.name,
        reason: `Lygis ${skill.level}/5 – skirk daugiau laiko praktikai`,
        priority: toPriority(score),
        score,
      });
    } else if (daysIdle > 14) {
      const score = 75 + Math.min(daysIdle, 30);
      recs.push({
        id: `rec-${skill.id}-idle`,
        skillName: skill.name,
        reason: `Nemokei ${daysIdle} d. – atnaujink žinias`,
        priority: toPriority(score),
        score,
      });
    } else if (skillSessions.length < 3) {
      const score = 70;
      recs.push({
        id: `rec-${skill.id}-few`,
        skillName: skill.name,
        reason: `Tik ${skillSessions.length} sesijos – reikia daugiau praktikos`,
        priority: toPriority(score),
        score,
      });
    }
  });

  const existing = new Set(skills.map((s) => s.name.toLowerCase()));
  const suggestedForGoal = getSuggestedSkillsForGoal(careerGoal.title);

  suggestedForGoal.forEach((name) => {
    if (!existing.has(name.toLowerCase())) {
      recs.push({
        id: `rec-missing-${name}`,
        skillName: name,
        reason: `Reikalingas „${careerGoal.title}“ tikslui, bet dar nepridėtas`,
        priority: 'Aukštas',
        score: 88,
      });
    }
  });

  return recs
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((r, i) => ({ ...r, id: r.id ?? `rec-${i}` }));
}

export function generateCareerPathSteps(recommendations) {
  return recommendations.slice(0, 4).map((rec, index) => ({
    order: index + 1,
    skill: rec.skillName,
    hours: Math.max(6, Math.round(rec.score / 5)),
    reason: rec.reason,
    status: index === 0 ? 'current' : 'upcoming',
  }));
}

function getSuggestedSkillsForGoal(goalTitle) {
  const lower = goalTitle.toLowerCase();

  if (lower.includes('frontend')) {
    return ['React', 'TypeScript', 'Testing'];
  }
  if (lower.includes('backend')) {
    return ['Node.js', 'SQL', 'API Design'];
  }
  if (lower.includes('full')) {
    return ['React', 'Node.js', 'TypeScript'];
  }

  return ['TypeScript', 'Testing'];
}
