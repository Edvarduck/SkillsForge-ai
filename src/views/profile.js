import { getState } from '../state/store.js';
import { updateProfile, updateCareerGoal, syncGithub } from '../state/actions.js';
import { formatDate, escapeHtml } from '../utils/formatters.js';
import { renderGithubSnapshotCard } from '../utils/github-helpers.js';
import { showToast } from '../components/toast.js';

export function renderProfile() {
  const { profile, careerGoal, badges, githubSnapshot } = getState();

  const badgeCards = badges.length
    ? badges
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
        .join('')
    : '<p class="text-muted">Ženklelių dar nėra.</p>';

  const githubCard = renderGithubSnapshotCard(githubSnapshot, profile.githubUsername);

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
        <p class="text-muted">Vieši API endpoint'ai be token</p>
        <form class="form form--inline" id="github-form">
          <div class="form-group">
            <label for="github-username">GitHub vartotojo vardas</label>
            <input type="text" id="github-username" value="${escapeHtml(profile.githubUsername)}" placeholder="username" />
          </div>
          <button type="submit" class="btn btn--secondary">Išsaugoti vardą</button>
          <button type="button" class="btn btn--primary" id="github-sync-btn">Sinchronizuoti</button>
        </form>
        <div class="github-snapshot" id="github-snapshot">
          ${githubCard}
        </div>
      </div>

      <div class="card">
        <h3>Uždirbti ženkleliai</h3>
        <div class="badges-grid">${badgeCards}</div>
      </div>
    </section>
  `;
}

export function bindProfile(root) {
  root.querySelector('#profile-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('[type="submit"]');
    btn.disabled = true;
    try {
      await updateProfile({
        displayName: root.querySelector('#display-name').value.trim(),
        weeklyHoursGoal: Number(root.querySelector('#weekly-goal').value),
      });
      showToast('Profilis išsaugotas');
    } catch (err) {
      showToast(err.message || 'Nepavyko išsaugoti', 'error');
    } finally {
      btn.disabled = false;
    }
  });

  root.querySelector('#career-goal-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('[type="submit"]');
    btn.disabled = true;
    try {
      await updateCareerGoal({
        title: root.querySelector('#career-goal-title').value.trim(),
        targetDate: root.querySelector('#career-goal-date').value,
      });
      showToast('Karjeros tikslas atnaujintas');
    } catch (err) {
      showToast(err.message || 'Nepavyko išsaugoti', 'error');
    } finally {
      btn.disabled = false;
    }
  });

  root.querySelector('#github-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('[type="submit"]');
    btn.disabled = true;
    try {
      await updateProfile({
        githubUsername: root.querySelector('#github-username').value.trim(),
      });
      showToast('GitHub vardas išsaugotas');
    } catch (err) {
      showToast(err.message || 'Nepavyko išsaugoti', 'error');
    } finally {
      btn.disabled = false;
    }
  });

  root.querySelector('#github-sync-btn')?.addEventListener('click', async () => {
    const btn = root.querySelector('#github-sync-btn');
    const username = root.querySelector('#github-username').value.trim();

    if (!username) {
      showToast('Įvesk GitHub vartotojo vardą', 'error');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Sinchronizuojama...';

    try {
      await updateProfile({ githubUsername: username });
      await syncGithub({ force: true });
      showToast('GitHub duomenys sinchronizuoti');
    } catch (err) {
      showToast(err.message || 'GitHub sinchronizacijos klaida', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Sinchronizuoti';
    }
  });
}
