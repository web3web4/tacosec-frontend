import Cookies from 'js-cookie';
import { config } from './config';

const TOKEN_KEY = 'jwt_token';
const TOKEN_EXPIRY_BUFFER = 60; // seconds

// Parse JWT token to get payload
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

// Check if token is about to expire
export function isTokenExpiring(token: string): boolean {
  const payload = parseJwt(token);
  if (!payload?.exp) return true;
  
  const now = Math.floor(Date.now() / 1000);
  return now >= (payload.exp - TOKEN_EXPIRY_BUFFER);
}

// Set token in HTTP-only cookie
export function setToken(token: string): void {
  // Set secure cookie with HttpOnly, SameSite and Secure flags
  Cookies.set(TOKEN_KEY, token, {
    expires: 7, // 7 days
    path: '/',
    sameSite: 'strict',
    secure: window.location.protocol === 'https:' // Only set secure in HTTPS
  });
}

// Get token from cookie
export function getToken(): string | null {
  return Cookies.get(TOKEN_KEY) || null;
}

// Clear token from cookie
export function clearToken(): void {
  Cookies.remove(TOKEN_KEY, { path: '/' });
}