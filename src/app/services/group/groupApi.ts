import { apiFetch } from "../api/apiFetch";

function getApiUrl(): string {
  const url = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!url) throw new Error("EXPO_PUBLIC_API_URL nao configurada.");
  return url.replace(/\/$/, "");
}

export type GroupSummary = {
  groupId: string;
  name: string;
  description: string | null;
  owner: { userId: string; username: string; name: string };
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type GroupMember = {
  userId: string;
  username: string;
  name: string;
  joinedAt: string;
};

export type GroupDetail = GroupSummary & { members: GroupMember[] };

export async function getGroupsByUserId(userId: string): Promise<GroupSummary[]> {
  const res = await apiFetch(`${getApiUrl()}/group/user/${userId}`);
  if (!res.ok) throw new Error(`Falha ao buscar grupos (${res.status}).`);
  const json = (await res.json()) as { data: GroupSummary[] };
  return json.data;
}

export async function getGroupById(groupId: string): Promise<GroupDetail> {
  const res = await apiFetch(`${getApiUrl()}/group/${groupId}`);
  if (!res.ok) throw new Error(`Falha ao buscar grupo (${res.status}).`);
  const json = (await res.json()) as { data: GroupDetail };
  return json.data;
}

export type AnonymousLocationPoint = {
  locationEventId: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
  capturedAt: string;
  createdAt: string;
};

export type GroupLocationPin = AnonymousLocationPoint & { groupName: string };

export async function getGroupLocations(groupId: string): Promise<AnonymousLocationPoint[]> {
  const res = await apiFetch(`${getApiUrl()}/group/${groupId}/location`);
  if (!res.ok) throw new Error(`Falha ao buscar localizações do grupo (${res.status}).`);
  const json = (await res.json()) as { data: AnonymousLocationPoint[] };
  return json.data;
}
