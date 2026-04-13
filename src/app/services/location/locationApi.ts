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

export async function registerLocation(payload: LocationRegisterPayload): Promise<void> {
  const response = await fetch(`${getApiUrl()}/location/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
