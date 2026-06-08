import { daysSince } from '../utils/date-helpers.js';

const PRIORITY_LABELS = [
  [80, 'Aukštas'],
  [60, 'Vidutinis'],
  [0, 'Žemas'],
];

const DAY_NAMES = ['Pirmadienis', 'Antradienis', 'Trečiadienis', 'Ketvirtadienis', 'Penktadienis', 'Šeštadienis', 'Sekmadienis'];

const GITHUB_LANG_MAP = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  css: 'CSS',
  html: 'HTML',
  python: 'Python',
  react: 'React',
};

function toPriority(score) {
  return PRIORITY_LABELS.find(([min]) => score >= min)[1];
}

function getTargetSkillsForGoal(goalTitle) {
  const lower = goalTitle.toLowerCase();

  if (lower.includes('frontend')) {
    return [
      { name: 'JavaScript', targetLevel: 4, weight: 40 },
      { name: 'CSS', targetLevel: 4, weight: 35 },
      { name: 'HTML', targetLevel: 4, weight: 30 },
      { name: 'TypeScript', targetLevel: 3, weight: 38 },
      { name: 'React', targetLevel: 3, weight: 36 },
      { name: 'Testing', targetLevel: 2, weight: 25 },
    ];
  }
  if (lower.includes('backend')) {
    return [
      { name: 'Node.js', targetLevel: 4, weight: 40 },
      { name: 'SQL', targetLevel: 3, weight: 35 },
      { name: 'API Design', targetLevel: 3, weight: 30 },
      { name: 'Python', targetLevel: 3, weight: 32 },
    ];
  }
  if (lower.includes('full')) {
    return [
      { name: 'JavaScript', targetLevel: 4, weight: 38 },
      { name: 'React', targetLevel: 3, weight: 36 },
      { name: 'Node.js', targetLevel: 3, weight: 34 },
      { name: 'TypeScript', targetLevel: 3, weight: 32 },
    ];
  }

  return [
    { name: 'TypeScript', targetLevel: 3, weight: 30 },
    { name: 'Testing', targetLevel: 2, weight: 25 },
  ];
}

function findSkill(skills, name) {
  return skills.find((s) => s.name.toLowerCase() === name.toLowerCase());
}

function analyzeGaps(careerGoal, skills) {
  const targets = getTargetSkillsForGoal(careerGoal.title);
  const gaps = [];

  targets.forEach((target) => {
    const skill = findSkill(skills, target.name);

    if (!skill) {
      gaps.push({
        skillName: target.name,
        gapType: 'missing',
        gapWeight: target.weight,
        currentLevel: 0,
        targetLevel: target.targetLevel,
        reason: `Trūksta „${target.name}" – reikalingas „${careerGoal.title}" tikslui`,
      });
      return;
    }

    if (skill.level < target.targetLevel) {
      const levelGap = target.targetLevel - skill.level;
      gaps.push({
        skillName: target.name,
        skillId: skill.id,
        gapType: 'level',
        gapWeight: target.weight * (levelGap / target.targetLevel),
        currentLevel: skill.level,
        targetLevel: target.targetLevel,
        reason: `„${target.name}" lygis ${skill.level}/${target.targetLevel} – reikia pakelti`,
      });
    }
  });

  skills.forEach((skill) => {
    if (skill.level < 3 && !gaps.find((g) => g.skillName.toLowerCase() === skill.name.toLowerCase())) {
      gaps.push({
        skillName: skill.name,
        skillId: skill.id,
        gapType: 'practice',
        gapWeight: 20,
        currentLevel: skill.level,
        targetLevel: 3,
        reason: `„${skill.name}" per žemas lygis (${skill.level}/5) – daugiau praktikos`,
      });
    }
  });

  return gaps;
}

function getSessionsInLastWeeks(sessions, weeks = 4) {
  const cutoff = Date.now() - weeks * 7 * 86400000;
  return sessions.filter((s) => new Date(s.sessionDate).getTime() >= cutoff);
}

function analyzeMomentum(skills, sessions) {
  const recent = getSessionsInLastWeeks(sessions, 4);
  const minutesBySkill = {};
  const lastDateBySkill = {};

  recent.forEach((session) => {
    minutesBySkill[session.skillId] = (minutesBySkill[session.skillId] ?? 0) + session.durationMinutes;
    const prev = lastDateBySkill[session.skillId];
    if (!prev || session.sessionDate > prev) {
      lastDateBySkill[session.skillId] = session.sessionDate;
    }
  });

  return skills.map((skill) => {
    const minutes = minutesBySkill[skill.id] ?? 0;
    const hours = minutes / 60;
    const lastDate = lastDateBySkill[skill.id];
    const daysIdle = lastDate ? daysSince(lastDate) : 999;

    let momentumScore = Math.min(100, hours * 12);
    let momentumPenalty = 0;

    if (daysIdle > 14) momentumPenalty = 25;
    else if (daysIdle > 7) momentumPenalty = 12;
    else if (hours < 1) momentumPenalty = 18;
    else if (hours < 3) momentumPenalty = 8;

    return {
      skillName: skill.name,
      skillId: skill.id,
      hoursLast4Weeks: Math.round(hours * 10) / 10,
      daysIdle,
      momentumScore,
      momentumPenalty,
      status: hours >= 4 ? 'active' : hours >= 1 ? 'moderate' : 'stagnant',
    };
  });
}

function analyzeGithubAlignment(careerGoal, skills, githubSnapshot) {
  if (!githubSnapshot?.languages) {
    return { aligned: [], misaligned: [], bonus: 0, note: 'GitHub duomenų nėra' };
  }

  const languages = githubSnapshot.languages;
  const goalLower = careerGoal.title.toLowerCase();
  const aligned = [];
  const misaligned = [];

  const expectedLangs =
    goalLower.includes('frontend') || goalLower.includes('full')
      ? ['JavaScript', 'TypeScript', 'CSS', 'HTML']
      : goalLower.includes('backend')
        ? ['Python', 'JavaScript']
        : [];

  expectedLangs.forEach((lang) => {
    const count = languages[lang] ?? 0;
    if (count > 0) aligned.push({ lang, count });
    else misaligned.push({ lang, count: 0 });
  });

  skills.forEach((skill) => {
    const ghLang = GITHUB_LANG_MAP[skill.name.toLowerCase()] ?? skill.name;
    const repoCount = languages[ghLang] ?? 0;
    if (skill.level >= 2 && repoCount === 0) {
      misaligned.push({ lang: skill.name, count: 0, skill: skill.name });
    }
  });

  const alignmentRatio = expectedLangs.length
    ? aligned.length / expectedLangs.length
    : 0.5;

  return {
    aligned,
    misaligned,
    alignmentRatio,
    bonus: Math.round(alignmentRatio * 15),
    note:
      misaligned.length > 0
        ? `GitHub neatitinka tikslo: trūksta ${misaligned.map((m) => m.lang).join(', ')}`
        : 'GitHub kalbos atitinka karjeros tikslą',
  };
}

function rankPriorities(gaps, momentumList, githubAnalysis) {
  const momentumMap = Object.fromEntries(momentumList.map((m) => [m.skillName.toLowerCase(), m]));

  const ranked = gaps.map((gap) => {
    const momentum = momentumMap[gap.skillName.toLowerCase()];
    const momentumPenalty = momentum?.momentumPenalty ?? 15;

    let githubBonus = 0;
    const misaligned = githubAnalysis.misaligned.find(
      (m) => m.lang?.toLowerCase() === gap.skillName.toLowerCase() || m.skill?.toLowerCase() === gap.skillName.toLowerCase()
    );
    if (misaligned) githubBonus = 18;
    else if (githubAnalysis.alignmentRatio >= 0.75) githubBonus = -5;

    const score = Math.round(gap.gapWeight + momentumPenalty + githubBonus);
    const clamped = Math.min(99, Math.max(40, score));

    return {
      id: `path-${gap.skillName.toLowerCase().replace(/\s+/g, '-')}`,
      skillName: gap.skillName,
      reason: gap.reason,
      priority: toPriority(clamped),
      score: clamped,
      gapType: gap.gapType,
      gapWeight: Math.round(gap.gapWeight),
      momentumPenalty,
      githubBonus,
      hoursLast4Weeks: momentum?.hoursLast4Weeks ?? 0,
      estimatedHours: Math.max(6, Math.round(clamped / 4)),
    };
  });

  return ranked.sort((a, b) => b.score - a.score).slice(0, 8);
}

function generateWeeklyPlan(rankedSkills, weeklyHoursGoal) {
  if (!rankedSkills.length) return [];

  const topSkills = rankedSkills.slice(0, 4);
  const totalWeight = topSkills.reduce((sum, s) => sum + s.score, 0);
  const hoursPerSkill = topSkills.map((s) => ({
    skillName: s.skillName,
    hours: Math.max(1, Math.round((s.score / totalWeight) * weeklyHoursGoal)),
    reason: s.reason,
  }));

  let dayIndex = 0;
  const plan = DAY_NAMES.map((dayName, index) => ({
    day: index + 1,
    dayName,
    skillName: null,
    hours: 0,
    focus: 'Poilsis / savarankiška peržiūra',
  }));

  hoursPerSkill.forEach((entry) => {
    for (let h = 0; h < entry.hours && dayIndex < 7; h++) {
      const day = plan[dayIndex];
      if (day.skillName === entry.skillName) {
        day.hours += 1;
      } else if (!day.skillName) {
        day.skillName = entry.skillName;
        day.hours = 1;
        day.focus = entry.reason;
      } else {
        dayIndex++;
        h--;
        continue;
      }
      if (day.hours >= 2) dayIndex++;
    }
  });

  return plan;
}

function buildPathSteps(ranked) {
  return ranked.slice(0, 5).map((item, index) => ({
    order: index + 1,
    skill: item.skillName,
    hours: item.estimatedHours,
    reason: item.reason,
    score: item.score,
    priority: item.priority,
    status: index === 0 ? 'current' : 'upcoming',
  }));
}

/**
 * Karūnos Brangakmenis – Karjeros Kelio Variklis
 * Gryna logika be DOM.
 */
export function runPathEngine({
  careerGoal,
  skills,
  sessions,
  githubSnapshot = null,
  weeklyHoursGoal = 10,
}) {
  if (!careerGoal?.title) {
    throw new Error('Nustatyk karjeros tikslą profilyje');
  }

  if (!skills.length) {
    throw new Error('Pridėk bent vieną įgūdį prieš generuojant kelią');
  }

  const analysisSteps = [];

  const gaps = analyzeGaps(careerGoal, skills);
  analysisSteps.push({
    step: 1,
    label: 'Gap analysis',
    detail: `Rasta ${gaps.length} spragų`,
  });

  const momentum = analyzeMomentum(skills, sessions);
  const stagnant = momentum.filter((m) => m.status === 'stagnant').length;
  analysisSteps.push({
    step: 2,
    label: 'Momentum score',
    detail: `${stagnant} įgūdžiai stagnuoja`,
  });

  const githubAnalysis = analyzeGithubAlignment(careerGoal, skills, githubSnapshot);
  analysisSteps.push({
    step: 3,
    label: 'GitHub alignment',
    detail: githubAnalysis.note,
  });

  const ranked = rankPriorities(gaps, momentum, githubAnalysis);
  analysisSteps.push({
    step: 4,
    label: 'Priority ranking',
    detail: `TOP: ${ranked[0]?.skillName ?? '—'} (${ranked[0]?.score ?? 0} balai)`,
  });

  const weeklyPlan = generateWeeklyPlan(ranked, weeklyHoursGoal);
  const totalPlannedHours = weeklyPlan.reduce((sum, d) => sum + d.hours, 0);
  analysisSteps.push({
    step: 5,
    label: 'Weekly plan',
    detail: `${totalPlannedHours} val. per 7 dienas`,
  });

  const recommendations = ranked.slice(0, 6).map((r) => ({
    id: r.id,
    skillName: r.skillName,
    reason: r.reason,
    priority: r.priority,
    score: r.score,
  }));

  const careerPathSteps = buildPathSteps(ranked);

  return {
    recommendations,
    careerPathSteps,
    weeklyPlan,
    analysisSteps,
    rankedSkills: ranked,
    githubAnalysis,
    momentum,
    gaps,
  };
}
