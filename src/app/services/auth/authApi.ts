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

const REQUEST_TIMEOUT_MS = 30_000;

async function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("[Auth] Timeout ao conectar:", url);
      throw new Error("O servidor não respondeu. Tente novamente em alguns instantes.");
    }
    console.error("[Auth] Erro de rede:", error);
    throw new Error("Não foi possível conectar. Verifique sua conexão e tente novamente.");
  } finally {
    clearTimeout(timer);
  }
}

async function handleResponse(response: Response): Promise<AuthResponse> {
  const text = await response.text();
  let body: Record<string, unknown> = {};
  if (text.trim()) {
    try {
      body = JSON.parse(text) as Record<string, unknown>;
    } catch {
      throw new Error("Resposta inesperada do servidor.");
    }
  }
  if (!response.ok) {
    const message = typeof body.message === "string" ? body.message : "Erro desconhecido.";
    throw new Error(message);
  }
  return body as AuthResponse;
}

export async function loginRequest(payload: LoginPayload): Promise<AuthResponse> {
  const response = await fetchWithTimeout(`${getApiUrl()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function registerRequest(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await fetchWithTimeout(`${getApiUrl()}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}
