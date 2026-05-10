import type { AuthUser } from "@/types/auth";

const TOKEN_KEY = "auth_token";
const USER_KEY  = "auth_user";

export function setAuth(user: AuthUser): void {
  const expires = new Date();
  expires.setHours(expires.getHours() + 8);
  const expStr = expires.toUTCString();

  document.cookie = `${TOKEN_KEY}=${user.token}; path=/; expires=${expStr}; SameSite=Lax`;
  document.cookie = `${USER_KEY}=${encodeURIComponent(JSON.stringify({ username: user.username, role: user.role }))}; path=/; expires=${expStr}; SameSite=Lax`;
}

export function clearAuth(): void {
  document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  document.cookie = `${USER_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export function getToken(): string | null {
  if (typeof document === "undefined") return null;
  return cookieValue(TOKEN_KEY);
}

export function getAuthUser(): { username: string; role: string } | null {
  if (typeof document === "undefined") return null;
  const val = cookieValue(USER_KEY);
  if (!val) return null;
  try {
    return JSON.parse(decodeURIComponent(val));
  } catch {
    return null;
  }
}

function cookieValue(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? match[1] : null;
}
