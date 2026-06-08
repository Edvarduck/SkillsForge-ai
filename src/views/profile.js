import { getState } from '../state/store.js';
import { updateProfile, updateCareerGoal } from '../state/actions.js';
import { formatDate, escapeHtml } from '../utils/formatters.js';
import { showToast } from '../components/toast.js';

export function renderProfile() {
  const { profile, careerGoal, badges } = getState();

  const badgeCards = badges
    .map(
      (b) => `
        <div class="badge-card">
          <span class="badge-card__icon">${b.icon}</span>
          <div>
            <strong>${escapeHtml(b.title)}</strong>
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
          <form class="form" id="profile-form">
            <div class="form-group">
              <label for="display-name">Vardas</label>
              <input type="text" id="display-name" value="${escapeHtml(profile.displayName)}" required />
            </div>
            <div class="form-group">
              <label>El. paštas</label>
              <input type="email" value="${escapeHtml(profile.email)}" disabled />
            </div>
            <div class="form-group">
              <label>Savaitės tikslas (val.)</label>
              <input type="number" id="weekly-goal" min="1" value="${profile.weeklyHoursGoal}" />
            </div>
            <p class="text-muted">Narys nuo ${formatDate(profile.memberSince)}</p>
            <button type="submit" class="btn btn--primary">Išsaugoti profilį</button>
          </form>
        </div>

        <div class="card">
          <h3>Karjeros tikslas</h3>
          <form class="form" id="career-goal-form">
            <div class="form-group">
              <label for="career-goal-title">Tikslo pavadinimas</label>
              <input type="text" id="career-goal-title" value="${escapeHtml(careerGoal.title)}" required />
            </div>
            <div class="form-group">
              <label for="career-goal-date">Tikslinė data</label>
              <input type="date" id="career-goal-date" value="${careerGoal.targetDate}" />
            </div>
            <button type="submit" class="btn btn--primary">Išsaugoti tikslą</button>
          </form>
        </div>
      </div>

      <div class="card">
        <h3>GitHub</h3>
        <p class="text-muted">Vėliau – vieši API endpoint'ai be token</p>
        <form class="form form--inline" id="github-form">
          <div class="form-group">
            <label for="github-username">GitHub vartotojo vardas</label>
            <input type="text" id="github-username" value="${escapeHtml(profile.githubUsername)}" placeholder="username" />
          </div>
          <button type="submit" class="btn btn--secondary">Išsaugoti GitHub</button>
        </form>
      </div>

      <div class="card">
        <h3>Uždirbti ženkleliai</h3>
        <div class="badges-grid">${badgeCards}</div>
      </div>
    </section>
  `;
}

export function bindProfile(root) {
  root.querySelector('#profile-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    updateProfile({
      displayName: root.querySelector('#display-name').value.trim(),
      weeklyHoursGoal: Number(root.querySelector('#weekly-goal').value),
    });
    showToast('Profilis išsaugotas');
  });

  root.querySelector('#career-goal-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    updateCareerGoal({
      title: root.querySelector('#career-goal-title').value.trim(),
      targetDate: root.querySelector('#career-goal-date').value,
    });
    showToast('Karjeros tikslas atnaujintas');
  });

  root.querySelector('#github-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    updateProfile({
      githubUsername: root.querySelector('#github-username').value.trim(),
    });
    showToast('GitHub vardas išsaugotas');
  });
}
