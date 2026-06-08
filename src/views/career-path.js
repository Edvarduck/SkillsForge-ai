import { getState } from '../state/store.js';
import { runPathEngineAction } from '../state/actions.js';
import { formatDate, escapeHtml } from '../utils/formatters.js';
import { formatGithubLanguages, renderGithubSnapshotCard } from '../utils/github-helpers.js';
import { showToast } from '../components/toast.js';

function renderPathSteps(steps) {
  if (!steps.length) {
    return '<p class="text-muted">Paspausk „Sugeneruoti kelią“, kad paleistum Karjeros Kelio Variklį.</p>';
  }

  return steps
    .map(
      (step) => `
    <div class="path-step path-step--${step.status}">
      <div class="path-step__order">${step.order}</div>
      <div class="path-step__content">
        <div class="path-step__header">
          <h4>${escapeHtml(step.skill)}</h4>
          <span class="badge badge--priority">${escapeHtml(step.priority ?? '—')}</span>
        </div>
        <p class="text-muted">${escapeHtml(step.reason)}</p>
        <div class="path-step__meta">
          <span class="badge">~${step.hours} val.</span>
          <span class="badge">Score: ${step.score ?? '—'}</span>
        </div>
      </div>
    </div>
  `
    )
    .join('');
}

function renderWeeklyPlan(plan) {
  if (!plan.length) {
    return '<p class="text-muted">Savaitės planas sugeneruojamas kartu su keliu.</p>';
  }

  return `
    <div class="weekly-plan">
      ${plan
        .map(
          (day) => `
        <div class="weekly-plan__day ${day.hours > 0 ? 'weekly-plan__day--active' : ''}">
          <span class="weekly-plan__name">${escapeHtml(day.dayName)}</span>
          <strong class="weekly-plan__skill">${day.skillName ? escapeHtml(day.skillName) : '—'}</strong>
          <span class="weekly-plan__hours">${day.hours > 0 ? `${day.hours} val.` : 'poilsis'}</span>
        </div>
      `
        )
        .join('')}
    </div>
  `;
}

function renderAnalysisSteps(analysis) {
  if (!analysis?.length) return '';

  const items = analysis
    .map(
      (a) => `
      <li class="analysis-step">
        <span class="analysis-step__num">${a.step}</span>
        <div>
          <strong>${escapeHtml(a.label)}</strong>
          <span class="text-muted">${escapeHtml(a.detail)}</span>
        </div>
      </li>
    `
    )
    .join('');

  return `
    <div class="card">
      <h3>Variklio analizė</h3>
      <ul class="analysis-list">${items}</ul>
    </div>
  `;
}

export function renderCareerPath() {
  const {
    careerGoal,
    careerPathSteps,
    recommendations,
    profile,
    githubSnapshot,
    weeklyPlan,
    pathAnalysis,
  } = getState();

  const milestones = careerGoal.milestones
    .map(
      (m) => `
        <li class="milestone ${m.isCompleted ? 'milestone--done' : ''}">
          <span class="milestone__check">${m.isCompleted ? '✓' : '○'}</span>
          <span>${escapeHtml(m.title)}</span>
        </li>
      `
    )
    .join('');

  const recList = recommendations.length
    ? recommendations
        .map(
          (r) => `
        <li class="list-item">
          <div>
            <strong>${escapeHtml(r.skillName)}</strong>
            <span class="text-muted">${escapeHtml(r.reason)}</span>
          </div>
          <span class="badge">Score: ${r.score}</span>
        </li>
      `
        )
        .join('')
    : '<li class="text-muted empty-msg">Rekomendacijų dar nėra.</li>';

  return `
    <section class="view">
      <div class="view-header">
        <h2>Karjeros kelias</h2>
        <p class="text-muted">Karūnos Brangakmenis – Karjeros Kelio Variklis (5 žingsnių algoritmas)</p>
      </div>

      <div class="card card--highlight">
        <div class="goal-header">
          <div>
            <h3>${escapeHtml(careerGoal.title)}</h3>
            <p class="text-muted">Tikslas: ${formatDate(careerGoal.targetDate)} · ${careerGoal.progressPercent}%</p>
          </div>
          <button type="button" class="btn btn--primary" id="generate-path">Sugeneruoti kelią</button>
        </div>
        <div class="progress-bar progress-bar--lg">
          <div class="progress-bar__fill" style="width: ${careerGoal.progressPercent}%"></div>
        </div>
        <p class="text-muted path-engine-hint">
          Gap analysis → Momentum → GitHub alignment → Priority ranking → Weekly plan
        </p>
      </div>

      ${renderAnalysisSteps(pathAnalysis)}

      <div class="grid-2">
        <div class="card">
          <h3>Milestone'ai</h3>
          <ul class="milestone-list">${milestones}</ul>
        </div>
        <div class="card">
          <h3>Rekomenduojamas kelias</h3>
          <div class="path-timeline">${renderPathSteps(careerPathSteps)}</div>
        </div>
      </div>

      <div class="card">
        <h3>Savaitės planas (${profile.weeklyHoursGoal} val. tikslas)</h3>
        ${renderWeeklyPlan(weeklyPlan)}
      </div>

      <div class="card">
        <h3>GitHub įžvalgos</h3>
        ${githubSnapshot
          ? `
            <p class="text-muted">Kalbų pasiskirstymas repozitorijose:</p>
            <p>${formatGithubLanguages(githubSnapshot.languages)}</p>
            <p class="text-muted">Variklis naudoja GitHub duomenis alignment žingsnyje.</p>
          `
          : renderGithubSnapshotCard(null, profile.githubUsername)}
      </div>

      <div class="card">
        <h3>Išmanios rekomendacijos</h3>
        <ul class="list">${recList}</ul>
      </div>
    </section>
  `;
}

const ENGINE_STEPS = [
  'Gap analysis...',
  'Momentum score...',
  'GitHub alignment...',
  'Priority ranking...',
  'Weekly plan...',
];

export function bindCareerPath(root) {
  root.querySelector('#generate-path')?.addEventListener('click', async () => {
    const btn = root.querySelector('#generate-path');
    btn.disabled = true;

    try {
      for (let i = 0; i < ENGINE_STEPS.length; i++) {
        btn.textContent = `${i + 1}/5 ${ENGINE_STEPS[i]}`;
        await new Promise((r) => setTimeout(r, 280));
      }

      const result = await runPathEngineAction();

      if (result.recommendations.length) {
        showToast(`Kelias sugeneruotas – ${result.recommendations.length} rekomendacijos`);
      } else {
        showToast('Nepakanka duomenų – pridėk tikslą ir įgūdžius', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Nepavyko sugeneruoti kelio', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Sugeneruoti kelią';
    }
  });
}
