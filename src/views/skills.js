import { getState } from '../state/store.js';
import { getSkillsWithSessionCounts } from '../state/selectors.js';
import { addSkill, updateSkill, deleteSkill } from '../state/actions.js';
import { levelDots, escapeHtml } from '../utils/formatters.js';
import { showToast } from '../components/toast.js';
import { renderEmptyState } from '../components/ui-states.js';

const CATEGORIES = ['Programavimas', 'Dizainas', 'Įrankiai'];
const STATUSES = [
  { value: 'active', label: 'Aktyvus' },
  { value: 'paused', label: 'Pristabdytas' },
  { value: 'mastered', label: 'Įvaldytas' },
];

let editingId = null;
let filterCategory = 'all';
let filterStatus = 'all';

function getFilteredSkills() {
  return getSkillsWithSessionCounts().filter((skill) => {
    if (filterCategory !== 'all' && skill.category !== filterCategory) return false;
    if (filterStatus !== 'all' && skill.status !== filterStatus) return false;
    return true;
  });
}

function statusLabel(status) {
  return STATUSES.find((s) => s.value === status)?.label ?? status;
}

export function renderSkills() {
  const allSkills = getSkillsWithSessionCounts();
  const skills = getFilteredSkills();
  const editingSkill = editingId ? getState().skills.find((s) => s.id === editingId) : null;

  let skillCards;

  if (!allSkills.length) {
    skillCards = renderEmptyState({
      icon: '🧠',
      title: 'Įgūdžių dar nėra',
      description: 'Pridėk pirmą įgūdį naudodamas formą viršuje.',
    });
  } else if (!skills.length) {
    skillCards = renderEmptyState({
      icon: '🔍',
      title: 'Pagal filtrą nieko nerasta',
      description: 'Pakeisk kategoriją arba statusą, kad pamatytum įgūdžius.',
    });
  } else {
    skillCards = skills
      .map(
        (skill) => `
        <article class="skill-card" data-skill-id="${skill.id}">
          <div class="skill-card__header">
            <h3>${escapeHtml(skill.name)}</h3>
            <span class="badge">${escapeHtml(skill.category)}</span>
          </div>
          <div class="skill-card__level">
            <span class="level-dots" aria-label="Lygis ${skill.level} iš 5">${levelDots(skill.level)}</span>
            <span class="text-muted">Lygis ${skill.level}/5</span>
          </div>
          <p class="text-muted">${skill.sessionsCount} sesijos · ${statusLabel(skill.status)}</p>
          <div class="skill-card__actions">
            <button type="button" class="btn btn--small btn--secondary" data-action="edit" data-id="${skill.id}">Redaguoti</button>
            <button type="button" class="btn btn--small btn--danger" data-action="delete" data-id="${skill.id}">Ištrinti</button>
          </div>
        </article>
      `
      )
      .join('');
  }

  const categoryOptions = CATEGORIES.map(
    (c) => `<option value="${c}" ${editingSkill?.category === c ? 'selected' : ''}>${c}</option>`
  ).join('');

  const filterCategoryOptions = [
    '<option value="all">Visos kategorijos</option>',
    ...CATEGORIES.map((c) => `<option value="${c}" ${filterCategory === c ? 'selected' : ''}>${c}</option>`),
  ].join('');

  const filterStatusOptions = [
    '<option value="all">Visi statusai</option>',
    ...STATUSES.map(
      (s) => `<option value="${s.value}" ${filterStatus === s.value ? 'selected' : ''}>${s.label}</option>`
    ),
  ].join('');

  const statusOptions = STATUSES.map(
    (s) =>
      `<option value="${s.value}" ${(editingSkill?.status ?? 'active') === s.value ? 'selected' : ''}>${s.label}</option>`
  ).join('');

  return `
    <section class="view">
      <div class="view-header">
        <h2>Įgūdžiai</h2>
        <p class="text-muted">Tavo mokymosi įgūdžiai ir jų lygiai</p>
      </div>

      <div class="card">
        <h3>${editingId ? 'Redaguoti įgūdį' : 'Pridėti įgūdį'}</h3>
        <form class="form form--inline" id="skill-form">
          <input type="hidden" id="skill-edit-id" value="${editingId ?? ''}" />
          <div class="form-group">
            <label for="skill-name">Pavadinimas</label>
            <input type="text" id="skill-name" placeholder="pvz. React" value="${escapeHtml(editingSkill?.name ?? '')}" required />
          </div>
          <div class="form-group">
            <label for="skill-category">Kategorija</label>
            <select id="skill-category" required>${categoryOptions}</select>
          </div>
          <div class="form-group">
            <label for="skill-level">Lygis</label>
            <select id="skill-level">
              ${[1, 2, 3, 4, 5].map((n) => `<option value="${n}" ${(editingSkill?.level ?? 1) === n ? 'selected' : ''}>${n}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label for="skill-status">Statusas</label>
            <select id="skill-status">${statusOptions}</select>
          </div>
          <button type="submit" class="btn btn--primary">${editingId ? 'Išsaugoti' : 'Pridėti'}</button>
          ${editingId ? '<button type="button" class="btn btn--secondary" id="skill-cancel-edit">Atšaukti</button>' : ''}
        </form>
      </div>

      <div class="card">
        <h3>Filtrai</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="filter-category">Kategorija</label>
            <select id="filter-category">${filterCategoryOptions}</select>
          </div>
          <div class="form-group">
            <label for="filter-status">Statusas</label>
            <select id="filter-status">${filterStatusOptions}</select>
          </div>
        </div>
      </div>

      <div class="skills-grid">
        ${skillCards}
      </div>
    </section>
  `;
}

export function bindSkills(root) {
  const form = root.querySelector('#skill-form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = root.querySelector('#skill-name').value.trim();
    const category = root.querySelector('#skill-category').value;
    const level = root.querySelector('#skill-level').value;
    const status = root.querySelector('#skill-status').value;
    const editId = root.querySelector('#skill-edit-id').value;
    const submitBtn = form.querySelector('[type="submit"]');

    if (!name) {
      showToast('Įvesk įgūdžio pavadinimą', 'error');
      return;
    }

    submitBtn.disabled = true;
    try {
      if (editId) {
        await updateSkill(editId, { name, category, level, status });
        editingId = null;
        showToast('Įgūdis atnaujintas');
      } else {
        await addSkill({ name, category, level, status });
        showToast('Įgūdis pridėtas');
      }
    } catch (err) {
      showToast(err.message || 'Nepavyko išsaugoti', 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });

  root.querySelector('#skill-cancel-edit')?.addEventListener('click', () => {
    editingId = null;
    window.dispatchEvent(new CustomEvent('skillforge:rerender'));
  });

  root.querySelector('#filter-category')?.addEventListener('change', (e) => {
    filterCategory = e.target.value;
    window.dispatchEvent(new CustomEvent('skillforge:rerender'));
  });

  root.querySelector('#filter-status')?.addEventListener('change', (e) => {
    filterStatus = e.target.value;
    window.dispatchEvent(new CustomEvent('skillforge:rerender'));
  });

  root.querySelectorAll('[data-action="edit"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      editingId = btn.dataset.id;
      window.dispatchEvent(new CustomEvent('skillforge:rerender'));
    });
  });

  root.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Ištrinti įgūdį ir susijusias sesijas?')) return;
      try {
        if (editingId === btn.dataset.id) editingId = null;
        await deleteSkill(btn.dataset.id);
        showToast('Įgūdis ištrintas');
      } catch (err) {
        showToast(err.message || 'Nepavyko ištrinti', 'error');
      }
    });
  });
}
