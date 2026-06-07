import { apiFetch } from "../api/apiFetch";

function getApiUrl(): string {
  const url = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!url) throw new Error("EXPO_PUBLIC_API_URL nao configurada.");
  return url.replace(/\/$/, "");
}

export type UserProfile = {
  userId: string;
  username: string;
  name: string;
  email: string;
  createdAt: string;
};

export type UserSearchResult = {
  userId: string;
  username: string;
  name: string;
};

export async function getUserById(userId: string): Promise<UserProfile> {
  const res = await apiFetch(`${getApiUrl()}/user/${userId}`);
  if (!res.ok) throw new Error(`Falha ao buscar usuário (${res.status}).`);
  const json = (await res.json()) as { data: UserProfile };
  return json.data;
}

export async function searchUsers(q: string): Promise<UserSearchResult[]> {
  const res = await apiFetch(
    `${getApiUrl()}/user/search?q=${encodeURIComponent(q)}`
  );
  if (!res.ok) throw new Error(`Falha ao buscar usuários (${res.status}).`);
  const json = (await res.json()) as { data: UserSearchResult[] };
  return json.data;
}
