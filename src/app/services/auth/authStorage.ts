import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  ACCESS_TOKEN: "@safe_travels:access_token",
  USER: "@safe_travels:user",
} as const;

export type StoredUser = {
  id: string;
  username: string;
  name: string;
  email: string;
};

export async function saveAuthData(user: StoredUser, accessToken: string): Promise<void> {
  await AsyncStorage.multiSet([
    [KEYS.ACCESS_TOKEN, accessToken],
    [KEYS.USER, JSON.stringify(user)],
  ]);
}

export async function getAccessToken(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.ACCESS_TOKEN);
}

export async function getStoredUser(): Promise<StoredUser | null> {
  const raw = await AsyncStorage.getItem(KEYS.USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    await AsyncStorage.removeItem(KEYS.USER);
    return null;
  }
}

export async function clearAuthData(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.ACCESS_TOKEN, KEYS.USER]);
}
