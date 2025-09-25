// Small helpers for navigation and auth
export const navigateTo = (to) => {
  if (window.location.pathname === to) return;
  window.history.pushState({}, '', to);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

export const isAuthenticated = () => {
  try {
    return Boolean(JSON.parse(localStorage.getItem('auth'))?.email);
  } catch {
    return false;
  }
};

