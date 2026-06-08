import { getState } from '../state/store.js';
import { addSession, deleteSession } from '../state/actions.js';
import { formatDate, formatMinutes, escapeHtml } from '../utils/formatters.js';
import { toInputDate } from '../utils/date-helpers.js';
import { showToast } from '../components/toast.js';

export function renderSessions() {
  const { skills, sessions } = getState();

  const skillOptions = skills.length
    ? skills.map((s) => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('')
    : '<option value="">Nėra įgūdžių</option>';

  const sessionRows = sessions.length
    ? sessions
        .map(
          (s) => `
        <tr>
          <td>${formatDate(s.sessionDate)}</td>
          <td><strong>${escapeHtml(s.skillName)}</strong></td>
          <td>${formatMinutes(s.durationMinutes)}</td>
          <td class="text-muted">${escapeHtml(s.notes || '—')}</td>
          <td>
            <button type="button" class="btn btn--small btn--danger" data-action="delete-session" data-id="${s.id}">Ištrinti</button>
          </td>
        </tr>
      `
        )
        .join('')
    : `<tr><td colspan="5" class="text-muted">Sesijų dar nėra. Pridėk pirmą!</td></tr>`;

  return `
    <section class="view">
      <div class="view-header">
        <h2>Sesijos</h2>
        <p class="text-muted">Mokymosi sesijų registravimas ir istorija</p>
      </div>

      <div class="card">
        <h3>Nauja sesija</h3>
        <form class="form" id="session-form">
          <div class="form-row">
            <div class="form-group">
              <label for="session-skill">Įgūdis</label>
              <select id="session-skill" required ${skills.length ? '' : 'disabled'}>${skillOptions}</select>
            </div>
            <div class="form-group">
              <label for="session-date">Data</label>
              <input type="date" id="session-date" value="${toInputDate()}" required />
            </div>
            <div class="form-group">
              <label for="session-duration">Trukmė (min)</label>
              <input type="number" id="session-duration" min="1" placeholder="60" required />
            </div>
          </div>
          <div class="form-group">
            <label for="session-notes">Pastabos</label>
            <textarea id="session-notes" rows="2" placeholder="Ką mokėjaisi?"></textarea>
          </div>
          <button type="submit" class="btn btn--primary" ${skills.length ? '' : 'disabled'}>Išsaugoti</button>
        </form>
      </div>

      <div class="card">
        <h3>Sesijų istorija (${sessions.length})</h3>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Įgūdis</th>
                <th>Trukmė</th>
                <th>Pastabos</th>
                <th></th>
              </tr>
            </thead>
            <tbody>${sessionRows}</tbody>
          </table>
        </div>
      </div>
    </section>
  `;
}

export function bindSessions(root) {
  root.querySelector('#session-form')?.addEventListener('submit', (e) => {
    e.preventDefault();

    const skillId = root.querySelector('#session-skill').value;
    const sessionDate = root.querySelector('#session-date').value;
    const durationMinutes = root.querySelector('#session-duration').value;
    const notes = root.querySelector('#session-notes').value;

    if (!skillId || !sessionDate || !durationMinutes) {
      showToast('Užpildyk visus privalomus laukus', 'error');
      return;
    }

    addSession({ skillId, sessionDate, durationMinutes, notes });
    showToast('Sesija išsaugota');
  });

  root.querySelectorAll('[data-action="delete-session"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (confirm('Ištrinti šią sesiją?')) {
        deleteSession(btn.dataset.id);
        showToast('Sesija ištrinta');
      }
    });
  });
}
