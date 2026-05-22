import { loginRequest, registerRequest, type LoginPayload, type RegisterPayload } from "./authApi";
import { saveAuthData, clearAuthData, getStoredUser, getAccessToken, type StoredUser } from "./authStorage";
import { refreshActiveTripContext } from "../trip/tripApi";
import { clearActiveTripContext } from "../trip/tripContextStorage";

export async function login(payload: LoginPayload): Promise<StoredUser> {
  const { user, accessToken } = await loginRequest(payload);
  await saveAuthData(user, accessToken);
  // Popular cache de trip ativa logo após login (best-effort)
  refreshActiveTripContext(user.id).catch(() => {});
  return user;
}

export async function register(payload: RegisterPayload): Promise<StoredUser> {
  const { user, accessToken } = await registerRequest(payload);
  await saveAuthData(user, accessToken);
  // Novo usuário não tem trips — cache já começa false
  refreshActiveTripContext(user.id).catch(() => {});
  return user;
}

export async function logout(): Promise<void> {
  await clearAuthData();
  await clearActiveTripContext();
}

export async function getLoggedUser(): Promise<StoredUser | null> {
  return getStoredUser();
}

export async function getToken(): Promise<string | null> {
  return getAccessToken();
}
