import { StoredUser } from "./authStorage";

const getApiUrl = () => {
  const url = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!url) throw new Error("EXPO_PUBLIC_API_URL não configurada no .env");
  return url.replace(/\/$/, "");
};

export type AuthResponse = {
  user: StoredUser;
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  username: string;
  email: string;
  password: string;
};

async function handleResponse(response: Response): Promise<AuthResponse> {
  const text = await response.text();
  const body = text.trim() ? (JSON.parse(text) as Record<string, unknown>) : {};
  if (!response.ok) {
    const message = typeof body.message === "string" ? body.message : "Erro desconhecido.";
    throw new Error(message);
  }
  return body as AuthResponse;
}

export async function loginRequest(payload: LoginPayload): Promise<AuthResponse> {
  const response = await fetch(`${getApiUrl()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function registerRequest(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await fetch(`${getApiUrl()}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}
