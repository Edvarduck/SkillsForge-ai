import { profile, badges } from '../data/mock-data.js';
import { formatDate } from '../utils/formatters.js';

export function renderProfile() {
  const badgeCards = badges
    .map(
      (b) => `
        <div class="badge-card">
          <span class="badge-card__icon">${b.icon}</span>
          <div>
            <strong>${b.title}</strong>
            <span class="text-muted">${formatDate(b.earnedAt)}</span>
          </div>
        </div>
      `
    )
    .join('');

  return `
    <section class="view">
      <div class="view-header">
        <h2>Profilis</h2>
        <p class="text-muted">Nustatymai, GitHub ir pasiekimai</p>
      </div>

      <div class="grid-2">
        <div class="card">
          <h3>Profilio informacija</h3>
          <dl class="profile-dl">
            <dt>Vardas</dt>
            <dd>${profile.displayName}</dd>
            <dt>El. paštas</dt>
            <dd>${profile.email}</dd>
            <dt>Narys nuo</dt>
            <dd>${formatDate(profile.memberSince)}</dd>
            <dt>Savaitės tikslas</dt>
            <dd>${profile.weeklyHoursGoal} val.</dd>
          </dl>
        </div>

        <div class="card">
          <h3>GitHub (mock)</h3>
          <p class="text-muted">Vėliau – vieši API endpoint'ai be token</p>
          <div class="form-group">
            <label for="github-username">GitHub vartotojo vardas</label>
            <input type="text" id="github-username" value="${profile.githubUsername}" disabled />
          </div>
          <button class="btn btn--secondary" disabled>Sinchronizuoti (netrukus)</button>
        </div>
      </div>

      <div class="card">
        <h3>Uždirbti ženkleliai</h3>
        <div class="badges-grid">${badgeCards}</div>
      </div>
    </section>
  `;
}
