const ACCESS_TOKEN_KEY  = 'tirepro_at';
const REFRESH_TOKEN_KEY = 'tirepro_rt';

// In-memory cache — survives re-renders but not tab close
let _accessToken: string | null = null;

export function getAccessToken(): string | null {
  return _accessToken ?? localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  _accessToken = accessToken;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function setAccessToken(accessToken: string): void {
  _accessToken = accessToken;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
}

export function clearTokens(): void {
  _accessToken = null;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getUserRole(): string | null {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    return payload.role ?? null;
  } catch {
    return null;
  }
}
