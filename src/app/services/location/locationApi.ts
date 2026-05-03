export type LatestLocationPoint = {
  locationEventId: number;
  user: {
    userId: string;
    username: string;
    name: string;
  };
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
  capturedAt: string;
  createdAt: string;
};

export type LocationRegisterPayload = {
  userId: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
  capturedAt: string;
};

function getApiUrl(): string {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (!configuredUrl) {
    throw new Error("EXPO_PUBLIC_API_URL nao configurada. Defina a URL no arquivo .env.");
  }

  return configuredUrl.replace(/\/$/, "");
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const { getAccessToken } = await import("../auth/authStorage");
  const token = await getAccessToken();
  if (!token) throw new Error("Usuário não autenticado.");
  return { Authorization: `Bearer ${token}` };
}

export async function registerLocation(payload: LocationRegisterPayload): Promise<void> {
  const response = await fetch(`${getApiUrl()}/location/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await getAuthHeaders()),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const responseText = await response.text();
    const details = responseText.trim();

    throw new Error(
      details
        ? `Falha ao registrar localizacao no servidor (${response.status}): ${details}`
        : `Falha ao registrar localizacao no servidor (${response.status}).`,
    );
  }
}

export async function getLatestLocations(userIds?: string[]): Promise<LatestLocationPoint[]> {
  const url = new URL(`${getApiUrl()}/location/latest`);

  if (userIds && userIds.length > 0) {
    url.searchParams.set("userIds", userIds.join(","));
  }

  const response = await fetch(url.toString(), { headers: await getAuthHeaders() });

  if (!response.ok) {
    throw new Error(`Falha ao buscar localizacoes (${response.status}).`);
  }

  const json = (await response.json()) as { data: LatestLocationPoint[] };
  return json.data;
}
