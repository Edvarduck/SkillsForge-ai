import { getState } from '../state/store.js';
import { getDashboardSummary } from '../state/selectors.js';
import { formatDate, formatMinutes, escapeHtml } from '../utils/formatters.js';
import { renderGithubDashboardSummary } from '../utils/github-helpers.js';

export function renderDashboard() {
  const { sessions, recommendations, careerGoal, profile, githubSnapshot } = getState();
  const summary = getDashboardSummary();

  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.sessionDate) - new Date(a.sessionDate))
    .slice(0, 4);

  const topRecommendations = recommendations.slice(0, 3);
  const goalProgress = careerGoal.progressPercent;
  const weeklyPercent = Math.min(100, (summary.weeklyHours / summary.weeklyGoal) * 100);

  const sessionItems = recentSessions.length
    ? recentSessions
        .map(
          (s) => `
        <li class="list-item">
          <div>
            <strong>${escapeHtml(s.skillName)}</strong>
            <span class="text-muted">${formatDate(s.sessionDate)}</span>
          </div>
          <span class="badge">${formatMinutes(s.durationMinutes)}</span>
        </li>
      `
        )
        .join('')
    : '<li class="text-muted">Sesijų dar nėra.</li>';

  const recItems = topRecommendations.length
    ? topRecommendations
        .map(
          (r) => `
        <li class="list-item">
          <div>
            <strong>${escapeHtml(r.skillName)}</strong>
            <span class="text-muted">${escapeHtml(r.reason)}</span>
          </div>
          <span class="badge badge--priority">${r.priority}</span>
        </li>
      `
        )
        .join('')
    : '<li class="text-muted">Eik į Karjeros kelią ir sugeneruok rekomendacijas.</li>';

  return `
    <section class="view">
      <div class="view-header">
        <h2>Dashboard</h2>
        <p class="text-muted">Santrauka – greita apžvalga be grafikų</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-card__label">Šios savaitės valandos</span>
          <span class="stat-card__value">${summary.weeklyHours} / ${summary.weeklyGoal}</span>
          <div class="progress-bar">
            <div class="progress-bar__fill" style="width: ${weeklyPercent}%"></div>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-card__label">Iš viso sesijų</span>
          <span class="stat-card__value">${summary.totalSessions}</span>
        </div>
        <div class="stat-card">
          <span class="stat-card__label">Aktyvūs įgūdžiai</span>
          <span class="stat-card__value">${summary.activeSkills}</span>
        </div>
        <div class="stat-card">
          <span class="stat-card__label">Streak</span>
          <span class="stat-card__value">${summary.streakDays} d.</span>
        </div>
      </div>

      <div class="card">
        <h3>GitHub aktyvumas</h3>
        ${renderGithubDashboardSummary(githubSnapshot, profile.githubUsername)}
      </div>

      <div class="card card--highlight">
        <h3>Karjeros tikslas: ${escapeHtml(careerGoal.title)}</h3>
        <p class="text-muted">Tikslas iki ${formatDate(careerGoal.targetDate)}</p>
        <div class="progress-bar progress-bar--lg">
          <div class="progress-bar__fill" style="width: ${goalProgress}%"></div>
        </div>
        <span class="text-muted">${goalProgress}% įvykdyta</span>
      </div>

      <div class="grid-2">
        <div class="card">
          <h3>Paskutinės sesijos</h3>
          <ul class="list">${sessionItems}</ul>
        </div>
        <div class="card">
          <h3>Rekomendacijos</h3>
          <ul class="list">${recItems}</ul>
        </div>
      </div>
    </section>
  `;
}
