import { sessions, skills } from '../data/mock-data.js';
import { formatDate, formatMinutes } from '../utils/formatters.js';

export function renderSessions() {
  const skillOptions = skills
    .map((s) => `<option value="${s.id}">${s.name}</option>`)
    .join('');

  const sessionRows = sessions
    .map(
      (s) => `
        <tr>
          <td>${formatDate(s.sessionDate)}</td>
          <td><strong>${s.skillName}</strong></td>
          <td>${formatMinutes(s.durationMinutes)}</td>
          <td class="text-muted">${s.notes}</td>
        </tr>
      `
    )
    .join('');

  return `
    <section class="view">
      <div class="view-header">
        <h2>Sesijos</h2>
        <p class="text-muted">Mokymosi sesijų registravimas ir istorija</p>
      </div>

      <div class="card">
        <h3>Nauja sesija (mock)</h3>
        <form class="form" id="session-form">
          <div class="form-row">
            <div class="form-group">
              <label for="session-skill">Įgūdis</label>
              <select id="session-skill" disabled>${skillOptions}</select>
            </div>
            <div class="form-group">
              <label for="session-date">Data</label>
              <input type="date" id="session-date" disabled />
            </div>
            <div class="form-group">
              <label for="session-duration">Trukmė (min)</label>
              <input type="number" id="session-duration" min="1" placeholder="60" disabled />
            </div>
          </div>
          <div class="form-group">
            <label for="session-notes">Pastabos</label>
            <textarea id="session-notes" rows="2" placeholder="Ką mokėjaisi?" disabled></textarea>
          </div>
          <button type="submit" class="btn btn--primary" disabled>Išsaugoti (netrukus)</button>
        </form>
      </div>

      <div class="card">
        <h3>Sesijų istorija</h3>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Įgūdis</th>
                <th>Trukmė</th>
                <th>Pastabos</th>
              </tr>
            </thead>
            <tbody>${sessionRows}</tbody>
          </table>
        </div>
      </div>
    </section>
  `;
}
