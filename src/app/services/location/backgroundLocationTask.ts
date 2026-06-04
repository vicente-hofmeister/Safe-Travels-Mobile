import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { registerLocation } from "./locationApi";
import { getStoredUser } from "../auth/authStorage";
import { getHasActiveTrip } from "../trip/tripContextStorage";

export const BACKGROUND_LOCATION_TASK = "safe-travels-background-location";

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error("[BackgroundLocation] Erro na task:", error.message);
    return;
  }

  const { locations } = data as { locations: Location.LocationObject[] };
  if (!locations?.length) return;

  // Checar cache antes de qualquer chamada à API
  const hasActiveTrip = await getHasActiveTrip();
  if (!hasActiveTrip) {
    console.log("[BackgroundLocation] Sem viagem ativa — envio ignorado.");
    return;
  }

  const user = await getStoredUser();
  if (!user) return;

  const latest = locations[locations.length - 1];

  await registerLocation({
    userId: user.id,
    latitude: latest.coords.latitude,
    longitude: latest.coords.longitude,
    accuracyMeters: latest.coords.accuracy != null ? Math.round(latest.coords.accuracy) : null,
    capturedAt: new Date(latest.timestamp).toISOString(),
  }).catch((err: unknown) => {
    console.error("[BackgroundLocation] Falha ao registrar:", err);
  });
});
