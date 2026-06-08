import { renderNavbar, bindNavbar } from './components/navbar.js';
import { registerRoute, initRouter, getCurrentPath } from './router/router.js';
import { subscribe } from './state/store.js';
import { renderDashboard } from './views/dashboard.js';
import { renderSkills, bindSkills } from './views/skills.js';
import { renderSessions, bindSessions } from './views/sessions.js';
import {
  renderAnalytics,
  mountAnalyticsCharts,
  unmountAnalyticsCharts,
} from './views/analytics.js';
import { renderCareerPath, bindCareerPath } from './views/career-path.js';
import { renderProfile, bindProfile } from './views/profile.js';

const appRoot = document.getElementById('app');

let currentPath = '/dashboard';
let currentHandler = null;

const binders = {
  '/skills': bindSkills,
  '/sessions': bindSessions,
  '/analytics': mountAnalyticsCharts,
  '/career-path': bindCareerPath,
  '/profile': bindProfile,
};

function renderShell(content) {
  appRoot.innerHTML = `
    <div class="app-shell">
      ${renderNavbar()}
      <main class="main-content" id="main-content">
        ${content}
      </main>
    </div>
  `;
  bindNavbar(appRoot);
}

function bindCurrentView(path) {
  const main = document.getElementById('main-content');
  if (!main) return;

  const binder = binders[path];
  if (binder) binder(main);
}

function renderCurrentView() {
  if (!currentHandler) return;

  if (currentPath !== '/analytics') {
    unmountAnalyticsCharts();
  }

  renderShell(currentHandler());
  bindCurrentView(currentPath);
}

function setupRoutes() {
  registerRoute('/dashboard', () => renderDashboard());
  registerRoute('/skills', () => renderSkills());
  registerRoute('/sessions', () => renderSessions());
  registerRoute('/analytics', () => renderAnalytics());
  registerRoute('/career-path', () => renderCareerPath());
  registerRoute('/profile', () => renderProfile());
}

export function initApp() {
  setupRoutes();

  initRouter((path, handler) => {
    currentPath = path;
    currentHandler = handler;
    renderCurrentView();
  });

  subscribe(() => {
    renderCurrentView();
  });

  window.addEventListener('skillforge:rerender', () => {
    if (getCurrentPath() === currentPath) {
      renderCurrentView();
    }
  });
}
