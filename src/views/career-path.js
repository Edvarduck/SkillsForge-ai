import { careerGoal, careerPathSteps, recommendations } from '../data/mock-data.js';
import { formatDate } from '../utils/formatters.js';

export function renderCareerPath() {
  const milestones = careerGoal.milestones
    .map(
      (m) => `
        <li class="milestone ${m.isCompleted ? 'milestone--done' : ''}">
          <span class="milestone__check">${m.isCompleted ? '✓' : '○'}</span>
          <span>${m.title}</span>
        </li>
      `
    )
    .join('');

  const pathSteps = careerPathSteps
    .map(
      (step) => `
        <div class="path-step path-step--${step.status}">
          <div class="path-step__order">${step.order}</div>
          <div class="path-step__content">
            <h4>${step.skill}</h4>
            <p class="text-muted">${step.reason}</p>
            <span class="badge">~${step.hours} val.</span>
          </div>
        </div>
      `
    )
    .join('');

  const recList = recommendations
    .map(
      (r) => `
        <li class="list-item">
          <div>
            <strong>${r.skillName}</strong>
            <span class="text-muted">${r.reason}</span>
          </div>
          <span class="badge">Score: ${r.score}</span>
        </li>
      `
    )
    .join('');

  return `
    <section class="view">
      <div class="view-header">
        <h2>Karjeros kelias</h2>
        <p class="text-muted">Karjeros Kelio Variklis – personalizuotas mokymosi kelias</p>
      </div>

      <div class="card card--highlight">
        <div class="goal-header">
          <div>
            <h3>${careerGoal.title}</h3>
            <p class="text-muted">Tikslas: ${formatDate(careerGoal.targetDate)} · ${careerGoal.progressPercent}%</p>
          </div>
          <button class="btn btn--primary" disabled>Sugeneruoti kelią (netrukus)</button>
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
        <h3>Išmanios rekomendacijos</h3>
        <ul class="list">${recList}</ul>
      </div>
    </section>
  `;
}
