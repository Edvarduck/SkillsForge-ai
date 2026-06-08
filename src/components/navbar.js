import { navigate, getCurrentPath } from '../router/router.js';

const tabs = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/skills', label: 'Įgūdžiai' },
  { path: '/sessions', label: 'Sesijos' },
  { path: '/analytics', label: 'Analitika' },
  { path: '/career-path', label: 'Karjeros kelias' },
  { path: '/profile', label: 'Profilis' },
];

export function renderNavbar() {
  const currentPath = getCurrentPath();

  const navItems = tabs
    .map(
      (tab) => `
        <a
          href="#${tab.path}"
          class="nav-link ${currentPath === tab.path ? 'nav-link--active' : ''}"
          data-path="${tab.path}"
        >${tab.label}</a>
      `
    )
    .join('');

  return `
    <header class="navbar">
      <div class="navbar__brand">
        <span class="navbar__logo">⚡</span>
        <div>
          <h1 class="navbar__title">SkillForge AI</h1>
          <p class="navbar__subtitle">Įgūdžių mokymosi sistema</p>
        </div>
      </div>
      <nav class="navbar__tabs" aria-label="Pagrindinė navigacija">
        ${navItems}
      </nav>
    </header>
  `;
}

export function bindNavbar(root) {
  root.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(link.dataset.path);
    });
  });
}
