import { apiFetch } from "../api/apiFetch";
import type { TripSummary, TripDetail, CreateTripPayload } from "./tripTypes";
import { setHasActiveTrip } from "./tripContextStorage";

function getApiUrl(): string {
  const url = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!url) throw new Error("EXPO_PUBLIC_API_URL não configurada.");
  return url.replace(/\/$/, "");
}

/** Criar uma nova viagem */
export async function createTrip(payload: CreateTripPayload): Promise<TripDetail> {
  const res = await apiFetch(`${getApiUrl()}/trip`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message ?? `Falha ao criar viagem (${res.status}).`);
  }
  const json = (await res.json()) as { data: TripDetail };
  return json.data;
}

/** Listar viagens de um usuário */
export async function getTripsByUserId(userId: string): Promise<TripSummary[]> {
  const res = await apiFetch(`${getApiUrl()}/trip/user/${userId}`);
  if (!res.ok) throw new Error(`Falha ao buscar viagens (${res.status}).`);
  const json = (await res.json()) as { data: TripSummary[] };
  return json.data;
}

/** Listar viagens de um grupo */
export async function getTripsByGroupId(groupId: string): Promise<TripSummary[]> {
  const res = await apiFetch(`${getApiUrl()}/trip/group/${groupId}`);
  if (!res.ok) throw new Error(`Falha ao buscar viagens do grupo (${res.status}).`);
  const json = (await res.json()) as { data: TripSummary[] };
  return json.data;
}

/** Buscar detalhe de uma viagem (com membros e rota) */
export async function getTripById(tripId: string): Promise<TripDetail> {
  const res = await apiFetch(`${getApiUrl()}/trip/${tripId}`);
  if (!res.ok) throw new Error(`Falha ao buscar viagem (${res.status}).`);
  const json = (await res.json()) as { data: TripDetail };
  return json.data;
}

/** Encerrar viagem */
export async function endTrip(tripId: string): Promise<void> {
  const res = await apiFetch(`${getApiUrl()}/trip/${tripId}/end`, { method: "PATCH" });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message ?? `Falha ao encerrar viagem (${res.status}).`);
  }
}

/**
 * Busca as trips do usuário e atualiza o cache hasActiveTrip.
 * Chamar no login e em pontos chave (ex: useFocusEffect da TripsScreen).
 */
export async function refreshActiveTripContext(userId: string): Promise<boolean> {
  try {
    const trips = await getTripsByUserId(userId);
    const hasActive = trips.some((t) => t.endedAt === null);
    await setHasActiveTrip(hasActive);
    return hasActive;
  } catch {
    // Em caso de falha de rede, mantém o cache atual sem alterar
    return false;
  }
}

/** Deletar viagem */
export async function deleteTrip(tripId: string): Promise<void> {
  const res = await apiFetch(`${getApiUrl()}/trip/${tripId}`, { method: "DELETE" });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message ?? `Falha ao deletar viagem (${res.status}).`);
  }
}
