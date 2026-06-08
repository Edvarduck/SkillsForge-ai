import {
  dashboardSummary,
  sessions,
  recommendations,
  careerGoal,
} from '../data/mock-data.js';
import { formatDate, formatMinutes } from '../utils/formatters.js';

export function renderDashboard() {
  const recentSessions = sessions.slice(0, 4);
  const topRecommendations = recommendations.slice(0, 3);
  const goalProgress = careerGoal.progressPercent;

  const sessionItems = recentSessions
    .map(
      (s) => `
        <li class="list-item">
          <div>
            <strong>${s.skillName}</strong>
            <span class="text-muted">${formatDate(s.sessionDate)}</span>
          </div>
          <span class="badge">${formatMinutes(s.durationMinutes)}</span>
        </li>
      `
    )
    .join('');

  const recItems = topRecommendations
    .map(
      (r) => `
        <li class="list-item">
          <div>
            <strong>${r.skillName}</strong>
            <span class="text-muted">${r.reason}</span>
          </div>
          <span class="badge badge--priority">${r.priority}</span>
        </li>
      `
    )
    .join('');

  return `
    <section class="view">
      <div class="view-header">
        <h2>Dashboard</h2>
        <p class="text-muted">Santrauka – greita apžvalga be grafikų</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-card__label">Šios savaitės valandos</span>
          <span class="stat-card__value">${dashboardSummary.weeklyHours} / ${dashboardSummary.weeklyGoal}</span>
          <div class="progress-bar">
            <div class="progress-bar__fill" style="width: ${(dashboardSummary.weeklyHours / dashboardSummary.weeklyGoal) * 100}%"></div>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-card__label">Iš viso sesijų</span>
          <span class="stat-card__value">${dashboardSummary.totalSessions}</span>
        </div>
        <div class="stat-card">
          <span class="stat-card__label">Aktyvūs įgūdžiai</span>
          <span class="stat-card__value">${dashboardSummary.activeSkills}</span>
        </div>
        <div class="stat-card">
          <span class="stat-card__label">Streak</span>
          <span class="stat-card__value">${dashboardSummary.streakDays} d.</span>
        </div>
      </div>

      <div class="card card--highlight">
        <h3>Karjeros tikslas: ${careerGoal.title}</h3>
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
