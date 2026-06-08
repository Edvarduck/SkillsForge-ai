import { renderNavbar, bindNavbar } from './components/navbar.js';
import { registerRoute, initRouter, getCurrentPath, navigate } from './router/router.js';
import { subscribe } from './state/store.js';
import {
  isAuthReady,
  isAuthenticated,
  isDataLoading,
  getDataLoadError,
  retryDataLoad,
  requiresAuth,
} from './state/auth-state.js';
import { renderAppSkeleton, renderErrorState } from './components/ui-states.js';
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
import { renderAuth, bindAuth } from './views/auth.js';

const appRoot = document.getElementById('app');

let currentPath = '/dashboard';
let currentHandler = null;

const binders = {
  '/auth': bindAuth,
  '/skills': bindSkills,
  '/sessions': bindSessions,
  '/analytics': mountAnalyticsCharts,
  '/career-path': bindCareerPath,
  '/profile': bindProfile,
};

function renderLoading() {
  if (!isAuthReady()) {
    appRoot.innerHTML = `
      <div class="app-loading">
        <div class="spinner"></div>
        <p>Kraunama...</p>
      </div>
    `;
    return;
  }

  renderShell(renderAppSkeleton(), true);
}

function bindDataErrorRetry() {
  const btn = document.getElementById('retry-load');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.textContent = 'Kraunama...';
    await retryDataLoad();
    btn.disabled = false;
    btn.textContent = 'Bandyti dar kartą';
  });
}

function renderDataError() {
  renderShell(
    renderErrorState({
      title: 'Nepavyko įkelti duomenų',
      message: getDataLoadError() || 'Patikrink interneto ryšį ir bandyk dar kartą.',
      retryId: 'retry-load',
    }),
    true
  );
  bindDataErrorRetry();
}

function renderShell(content, showNav = true) {
  appRoot.innerHTML = `
    <div class="app-shell">
      ${showNav ? renderNavbar() : ''}
      <main class="main-content" id="main-content">
        ${content}
      </main>
    </div>
  `;
  if (showNav) bindNavbar(appRoot);
}

function bindCurrentView(path) {
  const main = document.getElementById('main-content');
  if (!main) return;
  const binder = binders[path];
  if (binder) binder(main);
}

function renderCurrentView() {
  if (!isAuthReady()) {
    renderLoading();
    return;
  }

  if (isDataLoading()) {
    renderLoading();
    return;
  }

  if (getDataLoadError() && isAuthenticated()) {
    renderDataError();
    return;
  }

  if (requiresAuth() && !isAuthenticated() && currentPath !== '/auth') {
    navigate('/auth');
    return;
  }

  if (isAuthenticated() && currentPath === '/auth') {
    navigate('/dashboard');
    return;
  }

  if (!currentHandler) return;

  if (currentPath !== '/analytics') {
    unmountAnalyticsCharts();
  }

  const showNav = currentPath !== '/auth';
  renderShell(currentHandler(), showNav);
  bindCurrentView(currentPath);
}

function setupRoutes() {
  registerRoute('/auth', () => renderAuth());
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

  window.addEventListener('skillforge:auth-change', () => {
    renderCurrentView();
  });

  renderCurrentView();
}
