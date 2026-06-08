import { skills } from '../data/mock-data.js';
import { levelDots } from '../utils/formatters.js';

export function renderSkills() {
  const skillCards = skills
    .map(
      (skill) => `
        <article class="skill-card">
          <div class="skill-card__header">
            <h3>${skill.name}</h3>
            <span class="badge">${skill.category}</span>
          </div>
          <div class="skill-card__level">
            <span class="level-dots" aria-label="Lygis ${skill.level} iš 5">${levelDots(skill.level)}</span>
            <span class="text-muted">Lygis ${skill.level}/5</span>
          </div>
          <p class="text-muted">${skill.sessionsCount} sesijos</p>
        </article>
      `
    )
    .join('');

  return `
    <section class="view">
      <div class="view-header">
        <h2>Įgūdžiai</h2>
        <p class="text-muted">Tavo mokymosi įgūdžiai ir jų lygiai</p>
      </div>

      <div class="card">
        <h3>Pridėti įgūdį (mock)</h3>
        <form class="form form--inline" id="skill-form">
          <div class="form-group">
            <label for="skill-name">Pavadinimas</label>
            <input type="text" id="skill-name" placeholder="pvz. React" disabled />
          </div>
          <div class="form-group">
            <label for="skill-category">Kategorija</label>
            <select id="skill-category" disabled>
              <option>Programavimas</option>
              <option>Dizainas</option>
              <option>Įrankiai</option>
            </select>
          </div>
          <button type="submit" class="btn btn--primary" disabled>Pridėti (netrukus)</button>
        </form>
      </div>

      <div class="skills-grid">
        ${skillCards}
      </div>
    </section>
  `;
}
