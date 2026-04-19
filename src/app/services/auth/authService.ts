import { loginRequest, registerRequest, type LoginPayload, type RegisterPayload } from "./authApi";
import { saveAuthData, clearAuthData, getStoredUser, getAccessToken, type StoredUser } from "./authStorage";

export async function login(payload: LoginPayload): Promise<StoredUser> {
  const { user, accessToken } = await loginRequest(payload);
  await saveAuthData(user, accessToken);
  return user;
}

export async function register(payload: RegisterPayload): Promise<StoredUser> {
  const { user, accessToken } = await registerRequest(payload);
  await saveAuthData(user, accessToken);
  return user;
}

export async function logout(): Promise<void> {
  await clearAuthData();
}

export async function getLoggedUser(): Promise<StoredUser | null> {
  return getStoredUser();
}

export async function getToken(): Promise<string | null> {
  return getAccessToken();
}
