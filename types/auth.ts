export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthUser {
  token: string;
  username: string;
  role: string;
}
