import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "has_active_trip";

/** Salva no cache se o usuário tem viagem ativa */
export async function setHasActiveTrip(value: boolean): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(value));
}

/** Lê do cache. Retorna false se ainda não foi populado. */
export async function getHasActiveTrip(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw === null) return false;
    return JSON.parse(raw) === true;
  } catch {
    return false;
  }
}

/** Limpa o cache (usar no logout) */
export async function clearActiveTripContext(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
