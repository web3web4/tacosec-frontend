import Cookies from 'js-cookie';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRY_BUFFER = 60; // seconds

export function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function isTokenExpiring(token: string): boolean {
  const payload = parseJwt(token);
  if (!payload?.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return now >= payload.exp - TOKEN_EXPIRY_BUFFER;
}

// Set tokens
export function setTokens(accessToken: string, refreshToken: string): void {
  Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
    expires: 7,
    path: '/',
    sameSite: 'strict',
    secure: window.location.protocol === 'https:',
  });
  Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
    expires: 30, // refresh token valid for 30 days
    path: '/',
    sameSite: 'strict',
    secure: window.location.protocol === 'https:',
  });
}

export function getAccessToken(): string | null {
  return Cookies.get(ACCESS_TOKEN_KEY) || null;
}

export function getRefreshToken(): string | null {
  return Cookies.get(REFRESH_TOKEN_KEY) || null;
}

export function clearTokens(): void {
  Cookies.remove(ACCESS_TOKEN_KEY, { path: '/' });
  Cookies.remove(REFRESH_TOKEN_KEY, { path: '/' });
}
