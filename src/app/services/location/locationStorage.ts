import AsyncStorage from "@react-native-async-storage/async-storage";
import type { StoredLocationPoint } from "./locationTypes";

const STORAGE_KEY = "safe-travels:location-history";
const DEFAULT_MAX_STORED_POINTS = 500;
let memoryFallbackStore: StoredLocationPoint[] = [];

function isStoredLocationPoint(value: unknown): value is StoredLocationPoint {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const location = value as Partial<StoredLocationPoint>;

  return (
    typeof location.latitude === "number" &&
    typeof location.longitude === "number" &&
    (typeof location.accuracy === "number" || location.accuracy === null) &&
    (typeof location.altitude === "number" || location.altitude === null) &&
    (typeof location.heading === "number" || location.heading === null) &&
    (typeof location.speed === "number" || location.speed === null) &&
    typeof location.timestamp === "number" &&
    (location.source === "current" || location.source === "watch")
  );
}

export async function readStoredLocations(): Promise<StoredLocationPoint[]> {
  try {
    const rawValue = await AsyncStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue) as unknown;

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(isStoredLocationPoint);
  } catch {
    return memoryFallbackStore;
  }
}

export async function appendStoredLocation(
  point: StoredLocationPoint,
  maxStoredPoints: number = DEFAULT_MAX_STORED_POINTS,
): Promise<void> {
  try {
    const storedPoints = await readStoredLocations();
    const nextPoints = [...storedPoints, point].slice(-maxStoredPoints);

    memoryFallbackStore = nextPoints;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextPoints));
  } catch {
    memoryFallbackStore = [...memoryFallbackStore, point].slice(-maxStoredPoints);
  }
}

export async function clearStoredLocations(): Promise<void> {
  memoryFallbackStore = [];

  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // Keep in-memory fallback cleared even when native storage is unavailable.
  }
}
