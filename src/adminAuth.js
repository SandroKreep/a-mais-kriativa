const ADMIN_AUTH_KEY = 'admin_session_v1';

const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USER || 'Siandro';
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'fs2005';

export function getAdminUsername() {
  return ADMIN_USERNAME;
}

export function isAdminLoggedIn() {
  return window.localStorage.getItem(ADMIN_AUTH_KEY) === '1';
}

export function loginAdmin(username, password) {
  const userOk = String(username || '').trim() === ADMIN_USERNAME;
  const passOk = String(password || '') === ADMIN_PASSWORD;
  if (!userOk || !passOk) return false;
  window.localStorage.setItem(ADMIN_AUTH_KEY, '1');
  return true;
}

export function logoutAdmin() {
  window.localStorage.removeItem(ADMIN_AUTH_KEY);
}
