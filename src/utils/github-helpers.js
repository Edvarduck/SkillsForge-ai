import { formatDate, escapeHtml } from './formatters.js';
import { renderEmptyState } from '../components/ui-states.js';

export function formatGithubLanguages(languages = {}) {
  const entries = Object.entries(languages).sort((a, b) => b[1] - a[1]);

  if (!entries.length) return 'Repozitorijose nėra nustatytos pagrindinės kalbos';

  return entries
    .map(([lang, count]) => `${lang} – ${count} repo.`)
    .join(', ');
}

export function renderGithubSnapshotCard(snapshot, username) {
  if (!snapshot) {
    return renderEmptyState({
      icon: '🐙',
      title: username ? 'GitHub duomenų dar nėra' : 'GitHub neprijungtas',
      description: username
        ? `Paspausk „Sinchronizuoti“, kad įkeltum @${escapeHtml(username)} viešų repozitorijų duomenis.`
        : 'Įvesk GitHub vartotojo vardą ir sinchronizuok profilį.',
    });
  }

  const languages = formatGithubLanguages(snapshot.languages);
  const topRepos = (snapshot.topRepos ?? [])
    .map(
      (r) =>
        `<li><strong>${escapeHtml(r.name)}</strong> · ${escapeHtml(r.language ?? 'kalba nenurodyta')}</li>`
    )
    .join('');

  const fetchedNote =
    snapshot.fetchedReposCount != null && snapshot.fetchedReposCount !== snapshot.reposCount
      ? `<p class="text-muted">API gauta: ${snapshot.fetchedReposCount} iš ${snapshot.reposCount} viešų</p>`
      : '';

  return `
    <dl class="profile-dl github-dl">
      <dt>Viešos repozitorijos</dt>
      <dd>${snapshot.reposCount}</dd>
      <dt>Kalbos (pagal repo)</dt>
      <dd>${languages}</dd>
      <dt>Atnaujinta</dt>
      <dd>${formatDate(snapshot.fetchedAt?.slice(0, 10) ?? snapshot.fetchedAt)}</dd>
    </dl>
    ${fetchedNote}
    <p class="text-muted github-note">
      Be token matomos tik <strong>viešos</strong> repozitorijos. Privatūs projektai GitHub API negrąžinami.
    </p>
    ${topRepos ? `<ul class="github-repos">${topRepos}</ul>` : '<p class="text-muted">Viešų repozitorijų sąrašas tuščias.</p>'}
  `;
}

export function renderGithubDashboardSummary(snapshot, username) {
  if (!snapshot) {
    return renderGithubSnapshotCard(null, username);
  }

  const repoList = (snapshot.topRepos ?? [])
    .slice(0, 5)
    .map((r) => escapeHtml(r.name))
    .join(', ');

  return `
    <p class="text-muted">@${escapeHtml(username)} · <strong>${snapshot.reposCount}</strong> viešos repozitorijos</p>
    <p>${formatGithubLanguages(snapshot.languages)}</p>
    ${repoList ? `<p class="text-muted">Projektai: ${repoList}</p>` : ''}
    <p class="text-muted github-note">Privatūs repo nematomi be GitHub token.</p>
  `;
}

export function isGithubCacheFresh(fetchedAt, maxHours = 1) {
  if (!fetchedAt) return false;
  const hours = (Date.now() - new Date(fetchedAt).getTime()) / 3600000;
  return hours < maxHours;
}
