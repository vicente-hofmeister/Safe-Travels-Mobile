import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

export type TrackingSettings = {
  backgroundEnabled: boolean;
  foregroundIntervalMs: number;
  backgroundIntervalMs: number;
  accuracy: Location.Accuracy;
};

const KEY = "tracking_settings";

export const TRACKING_DEFAULTS: TrackingSettings = {
  backgroundEnabled: true,
  foregroundIntervalMs: 10_000,
  backgroundIntervalMs: 15 * 60 * 1000,
  accuracy: Location.Accuracy.Balanced,
};

export async function getTrackingSettings(): Promise<TrackingSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return TRACKING_DEFAULTS;
    return { ...TRACKING_DEFAULTS, ...(JSON.parse(raw) as Partial<TrackingSettings>) };
  } catch {
    return TRACKING_DEFAULTS;
  }
}

export async function setTrackingSettings(
  settings: Partial<TrackingSettings>,
): Promise<void> {
  const current = await getTrackingSettings();
  await AsyncStorage.setItem(KEY, JSON.stringify({ ...current, ...settings }));
}
