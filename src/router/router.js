const routes = new Map();

export function registerRoute(path, handler) {
  routes.set(path, handler);
}

export function navigate(path) {
  window.location.hash = path.startsWith('#') ? path : `#${path}`;
}

export function getCurrentPath() {
  const hash = window.location.hash.slice(1) || '/dashboard';
  return hash.startsWith('/') ? hash : `/${hash}`;
}

export function initRouter(onRouteChange) {
  const handleRoute = () => {
    const path = getCurrentPath();
    const handler = routes.get(path) ?? routes.get('/dashboard');
    onRouteChange(path, handler);
  };

  window.addEventListener('hashchange', handleRoute);
  handleRoute();

  return () => window.removeEventListener('hashchange', handleRoute);
}
