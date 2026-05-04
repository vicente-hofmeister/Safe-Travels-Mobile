import { getAccessToken, clearAuthData } from "../auth/authStorage";
import { navigateToLogin } from "../../navigation/navigationRef";

async function handleUnauthorized(): Promise<never> {
  const { locationTrackingService } = await import("../location");
  await locationTrackingService.stopBackgroundTracking();
  await clearAuthData();
  navigateToLogin();
  throw new Error("Sessão expirada. Faça login novamente.");
}

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
  if (!token) {
    return handleUnauthorized();
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    return handleUnauthorized();
  }

  return response;
}
