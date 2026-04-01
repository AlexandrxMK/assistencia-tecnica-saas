const STORAGE_KEY = 'assistencia_saas_session_v1';

function parseStoredSession(rawValue) {
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue);

    if (!parsed?.token) {
      return null;
    }

    return {
      token: String(parsed.token),
      user: parsed.user ?? null
    };
  } catch (_error) {
    return null;
  }
}

export function getStoredSession() {
  return parseStoredSession(localStorage.getItem(STORAGE_KEY));
}

export function getStoredToken() {
  const session = getStoredSession();
  return session?.token ?? null;
}

export function saveStoredSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  localStorage.removeItem(STORAGE_KEY);
}
