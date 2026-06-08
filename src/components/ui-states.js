import { escapeHtml } from '../utils/formatters.js';

export function renderEmptyState({ icon = '📭', title, description, ctaLabel, ctaHref }) {
  const cta =
    ctaLabel && ctaHref
      ? `<a href="${ctaHref}" class="btn btn--secondary btn--small">${escapeHtml(ctaLabel)}</a>`
      : '';

  return `
    <div class="empty-state">
      <span class="empty-state__icon" aria-hidden="true">${icon}</span>
      <strong class="empty-state__title">${escapeHtml(title)}</strong>
      <p class="empty-state__desc">${escapeHtml(description)}</p>
      ${cta}
    </div>
  `;
}

export function renderErrorState({ title, message, retryId = 'retry-load' }) {
  return `
    <div class="error-state">
      <span class="error-state__icon" aria-hidden="true">⚠️</span>
      <strong class="error-state__title">${escapeHtml(title)}</strong>
      <p class="error-state__desc">${escapeHtml(message)}</p>
      <button type="button" class="btn btn--primary" id="${escapeHtml(retryId)}">Bandyti dar kartą</button>
    </div>
  `;
}

export function renderAppSkeleton() {
  const statBlocks = Array(4)
    .fill('<div class="skeleton skeleton--stat"></div>')
    .join('');

  return `
    <section class="view view--skeleton" aria-busy="true" aria-label="Kraunama">
      <div class="skeleton skeleton--title"></div>
      <div class="skeleton skeleton--subtitle"></div>
      <div class="stats-grid">${statBlocks}</div>
      <div class="skeleton skeleton--card skeleton--card-wide"></div>
      <div class="grid-2">
        <div class="skeleton skeleton--card"></div>
        <div class="skeleton skeleton--card"></div>
      </div>
    </section>
  `;
}
