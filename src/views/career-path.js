import { getState } from '../state/store.js';
import { runRecommendationEngine } from '../state/actions.js';
import { formatDate, escapeHtml } from '../utils/formatters.js';
import { formatGithubLanguages, renderGithubSnapshotCard } from '../utils/github-helpers.js';
import { showToast } from '../components/toast.js';

export function renderCareerPath() {
  const { careerGoal, careerPathSteps, recommendations, profile, githubSnapshot } = getState();

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

  const pathSteps = careerPathSteps.length
    ? careerPathSteps
        .map(
          (step) => `
        <div class="path-step path-step--${step.status}">
          <div class="path-step__order">${step.order}</div>
          <div class="path-step__content">
            <h4>${escapeHtml(step.skill)}</h4>
            <p class="text-muted">${escapeHtml(step.reason)}</p>
            <span class="badge">~${step.hours} val.</span>
          </div>
        </div>
      `
        )
        .join('')
    : '<p class="text-muted">Paspausk „Sugeneruoti rekomendacijas“, kad sukurtum kelią.</p>';

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
    : '<li class="text-muted empty-msg">Rekomendacijų dar nėra. Sugeneruok pagal savo duomenis.</li>';

  return `
    <section class="view">
      <div class="view-header">
        <h2>Karjeros kelias</h2>
        <p class="text-muted">Karjeros Kelio Variklis – personalizuotas mokymosi kelias</p>
      </div>

      <div class="card card--highlight">
        <div class="goal-header">
          <div>
            <h3>${escapeHtml(careerGoal.title)}</h3>
            <p class="text-muted">Tikslas: ${formatDate(careerGoal.targetDate)} · ${careerGoal.progressPercent}%</p>
          </div>
          <button type="button" class="btn btn--primary" id="generate-recommendations">Sugeneruoti rekomendacijas</button>
        </div>
        <div class="progress-bar progress-bar--lg">
          <div class="progress-bar__fill" style="width: ${careerGoal.progressPercent}%"></div>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <h3>Milestone'ai</h3>
          <ul class="milestone-list">${milestones}</ul>
        </div>
        <div class="card">
          <h3>Rekomenduojamas kelias</h3>
          <div class="path-timeline">${pathSteps}</div>
        </div>
      </div>

      <div class="card">
        <h3>GitHub įžvalgos</h3>
        ${githubSnapshot
          ? `
            <p class="text-muted">Kalbų pasiskirstymas repozitorijose:</p>
            <p>${formatGithubLanguages(githubSnapshot.languages)}</p>
            <p class="text-muted">Sugeneruojant rekomendacijas, lyginama su tavo GitHub aktyvumu.</p>
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

export function bindCareerPath(root) {
  root.querySelector('#generate-recommendations')?.addEventListener('click', async () => {
    const btn = root.querySelector('#generate-recommendations');
    btn.disabled = true;
    btn.textContent = 'Generuojama...';

    try {
      const recs = await runRecommendationEngine();
      if (recs.length) {
        showToast(`Sugeneruota ${recs.length} rekomendacijos`);
      } else {
        showToast('Nepakanka duomenų – pridėk įgūdžių ir sesijų', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Nepavyko sugeneruoti', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Sugeneruoti rekomendacijas';
    }
  });
}
