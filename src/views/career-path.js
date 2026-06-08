import { getState } from '../state/store.js';
import {
  runPathEngineAction,
  toggleMilestone,
  updateMilestone,
  addMilestone,
  deleteMilestone,
} from '../state/actions.js';
import { formatDate, escapeHtml } from '../utils/formatters.js';
import { formatGithubLanguages, renderGithubSnapshotCard } from '../utils/github-helpers.js';
import { showToast } from '../components/toast.js';
import { renderEmptyState } from '../components/ui-states.js';

let pathEngineError = null;
let editingMilestoneId = null;

function renderPathSteps(steps) {
  if (!steps.length) {
    return renderEmptyState({
      icon: '🛤️',
      title: 'Kelias dar nesugeneruotas',
      description: 'Paspausk „Sugeneruoti kelią“ – variklis parinks prioritetus ir savaitės planą.',
    });
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
    return renderEmptyState({
      icon: '📆',
      title: 'Savaitės plano dar nėra',
      description: 'Jis sugeneruojamas kartu su karjeros keliu.',
    });
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

  let milestoneListBlock;

  if (!careerGoal.milestones.length) {
    milestoneListBlock = renderEmptyState({
      icon: '🏁',
      title: 'Milestone\'ų dar nėra',
      description: 'Pridėk žingsnius link savo karjeros tikslo.',
    });
  } else {
    const milestoneItems = careerGoal.milestones
        .map((m) => {
          const isEditing = editingMilestoneId === m.id;

          if (isEditing) {
            return `
              <li class="milestone milestone--editing" data-milestone-id="${m.id}">
                <input
                  type="text"
                  class="milestone__input"
                  id="milestone-edit-input"
                  value="${escapeHtml(m.title)}"
                  maxlength="200"
                  required
                />
                <div class="milestone__actions">
                  <button type="button" class="btn btn--small btn--primary" data-action="save-milestone" data-id="${m.id}">Išsaugoti</button>
                  <button type="button" class="btn btn--small btn--secondary" data-action="cancel-milestone">Atšaukti</button>
                </div>
              </li>
            `;
          }

          return `
            <li class="milestone ${m.isCompleted ? 'milestone--done' : ''}" data-milestone-id="${m.id}">
              <button
                type="button"
                class="milestone__toggle"
                data-action="toggle-milestone"
                data-id="${m.id}"
                aria-label="${m.isCompleted ? 'Atžymėti' : 'Pažymėti'} kaip atliktą"
              >${m.isCompleted ? '✓' : '○'}</button>
              <span class="milestone__title">${escapeHtml(m.title)}</span>
              <div class="milestone__actions">
                <button type="button" class="btn btn--small btn--secondary" data-action="edit-milestone" data-id="${m.id}">Redaguoti</button>
                <button type="button" class="btn btn--small btn--danger" data-action="delete-milestone" data-id="${m.id}">Ištrinti</button>
              </div>
            </li>
          `;
        })
        .join('');

    milestoneListBlock = `<ul class="milestone-list">${milestoneItems}</ul>`;
  }

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
    : '';

  const recommendationsBlock = recommendations.length
    ? `<ul class="list">${recList}</ul>`
    : renderEmptyState({
        icon: '💡',
        title: 'Rekomendacijų dar nėra',
        description: 'Sugeneruok kelią – variklis pasiūlys, kuriuos įgūdžius tobulinti pirmiausia.',
      });

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
        ${
          pathEngineError
            ? `<div class="error-banner">
                <span class="error-banner__text">${escapeHtml(pathEngineError)}</span>
                <button type="button" class="btn btn--small btn--secondary" id="retry-path-engine">Bandyti dar kartą</button>
              </div>`
            : ''
        }
      </div>

      ${renderAnalysisSteps(pathAnalysis)}

      <div class="grid-2">
        <div class="card">
          <h3>Milestone'ai</h3>
          <p class="text-muted">Pažymėk atliktus, redaguok ar pridėk naujus žingsnius.</p>
          ${milestoneListBlock}
          <form class="form form--inline milestone-form" id="milestone-form">
            <div class="form-group milestone-form__field">
              <label for="milestone-title">Naujas milestone</label>
              <input type="text" id="milestone-title" placeholder="pvz. Portfolio projektas" maxlength="200" required />
            </div>
            <button type="submit" class="btn btn--primary btn--small">Pridėti</button>
          </form>
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
        ${recommendationsBlock}
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

async function runPathGeneration(btn) {
  btn.disabled = true;
  pathEngineError = null;

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
    pathEngineError = err.message || 'Nepavyko sugeneruoti kelio';
    showToast(pathEngineError, 'error');
    window.dispatchEvent(new CustomEvent('skillforge:rerender'));
  } finally {
    btn.disabled = false;
    btn.textContent = 'Sugeneruoti kelią';
  }
}

export function bindCareerPath(root) {
  const generateBtn = root.querySelector('#generate-path');
  generateBtn?.addEventListener('click', () => runPathGeneration(generateBtn));
  root.querySelector('#retry-path-engine')?.addEventListener('click', () => {
    if (generateBtn) runPathGeneration(generateBtn);
  });

  root.querySelector('#milestone-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = root.querySelector('#milestone-title');
    const btn = e.target.querySelector('[type="submit"]');
    btn.disabled = true;

    try {
      await addMilestone({ title: input.value });
      input.value = '';
      showToast('Milestone pridėtas');
    } catch (err) {
      showToast(err.message || 'Nepavyko pridėti', 'error');
    } finally {
      btn.disabled = false;
    }
  });

  root.querySelectorAll('[data-action="toggle-milestone"]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await toggleMilestone(btn.dataset.id);
      } catch (err) {
        showToast(err.message || 'Nepavyko atnaujinti', 'error');
      }
    });
  });

  root.querySelectorAll('[data-action="edit-milestone"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      editingMilestoneId = btn.dataset.id;
      window.dispatchEvent(new CustomEvent('skillforge:rerender'));
    });
  });

  root.querySelectorAll('[data-action="cancel-milestone"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      editingMilestoneId = null;
      window.dispatchEvent(new CustomEvent('skillforge:rerender'));
    });
  });

  root.querySelectorAll('[data-action="save-milestone"]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const input = root.querySelector('#milestone-edit-input');
      if (!input) return;

      btn.disabled = true;
      try {
        await updateMilestone(btn.dataset.id, { title: input.value });
        editingMilestoneId = null;
        showToast('Milestone atnaujintas');
      } catch (err) {
        showToast(err.message || 'Nepavyko išsaugoti', 'error');
      } finally {
        btn.disabled = false;
      }
    });
  });

  root.querySelectorAll('[data-action="delete-milestone"]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Ištrinti šį milestone?')) return;

      try {
        if (editingMilestoneId === btn.dataset.id) editingMilestoneId = null;
        await deleteMilestone(btn.dataset.id);
        showToast('Milestone ištrintas');
      } catch (err) {
        showToast(err.message || 'Nepavyko ištrinti', 'error');
      }
    });
  });

  root.querySelector('#milestone-edit-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      root.querySelector('[data-action="save-milestone"]')?.click();
    }
    if (e.key === 'Escape') {
      editingMilestoneId = null;
      window.dispatchEvent(new CustomEvent('skillforge:rerender'));
    }
  });
}
