import { renderNavbar, bindNavbar } from './components/navbar.js';
import { registerRoute, initRouter } from './router/router.js';
import { renderDashboard } from './views/dashboard.js';
import { renderSkills } from './views/skills.js';
import { renderSessions } from './views/sessions.js';
import {
  renderAnalytics,
  mountAnalyticsCharts,
  unmountAnalyticsCharts,
} from './views/analytics.js';
import { renderCareerPath } from './views/career-path.js';
import { renderProfile } from './views/profile.js';

const appRoot = document.getElementById('app');

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
    unmountAnalyticsCharts();

    if (handler) {
      renderShell(handler());
    }

    if (path === '/analytics') {
      const main = document.getElementById('main-content');
      if (main) mountAnalyticsCharts(main);
    }
  });
}
