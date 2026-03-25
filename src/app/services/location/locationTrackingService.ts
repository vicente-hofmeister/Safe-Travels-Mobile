import * as Location from "expo-location";
import { appendStoredLocation, clearStoredLocations, readStoredLocations } from "./locationStorage";
import { registerLocation } from "./locationApi";
import type {
  LocationTrackingOptions,
  LocationSampleSource,
  StoredLocationPoint,
} from "./locationTypes";

const DEFAULT_TRACKING_OPTIONS: Required<LocationTrackingOptions> = {
  accuracy: Location.Accuracy.Balanced,
  distanceInterval: 10,
  timeInterval: 10000,
  maxStoredPoints: 500,
};

class LocationTrackingService {
  private subscription: Location.LocationSubscription | null = null;

  public isTracking(): boolean {
    return this.subscription !== null;
  }

  public async requestPermissions(): Promise<boolean> {
    const currentPermissions = await Location.getForegroundPermissionsAsync();

    if (currentPermissions.granted) {
      return true;
    }

    const requestedPermissions = await Location.requestForegroundPermissionsAsync();

    return requestedPermissions.granted;
  }

  public async captureCurrentPosition(): Promise<StoredLocationPoint | null> {
    const hasPermission = await this.requestPermissions();

    if (!hasPermission) {
      return null;
    }

    const hasLocationServicesEnabled = await Location.hasServicesEnabledAsync();

    if (!hasLocationServicesEnabled) {
      throw new Error("Servicos de localizacao estao desativados no aparelho.");
    }

    const point = await this.getCurrentOrLastKnownPosition();
    try {
      await appendStoredLocation(point, DEFAULT_TRACKING_OPTIONS.maxStoredPoints);
    } catch {
      // Ignore storage errors so location capture still succeeds.
    }

    return point;
  }

  public async registerCurrentPosition(userId: string): Promise<StoredLocationPoint | null> {
    const point = await this.captureCurrentPosition();

    if (!point) {
      return null;
    }

    await registerLocation({
      userId,
      latitude: point.latitude,
      longitude: point.longitude,
      accuracyMeters: point.accuracy === null ? null : Math.round(point.accuracy),
      capturedAt: new Date(point.timestamp).toISOString(),
    });

    return point;
  }

  private async getCurrentOrLastKnownPosition(): Promise<StoredLocationPoint> {
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        mayShowUserSettingsDialog: true,
      });

      return this.mapToStoredPoint(currentLocation.coords, currentLocation.timestamp, "current");
    } catch {
      const lastKnownLocation = await Location.getLastKnownPositionAsync({
        maxAge: 5 * 60 * 1000,
        requiredAccuracy: 500,
      });

      if (lastKnownLocation) {
        return this.mapToStoredPoint(
          lastKnownLocation.coords,
          lastKnownLocation.timestamp,
          "current",
        );
      }

      throw new Error("Nao foi possivel obter uma localizacao valida.");
    }
  }

  public async startTracking(options: LocationTrackingOptions = {}): Promise<void> {
    if (this.subscription) {
      return;
    }

    const hasPermission = await this.requestPermissions();

    if (!hasPermission) {
      throw new Error("Permissao de localizacao nao concedida.");
    }

    const hasLocationServicesEnabled = await Location.hasServicesEnabledAsync();

    if (!hasLocationServicesEnabled) {
      throw new Error("Servicos de localizacao estao desativados no aparelho.");
    }

    const mergedOptions = this.mergeOptions(options);

    this.subscription = await Location.watchPositionAsync(
      {
        accuracy: mergedOptions.accuracy,
        distanceInterval: mergedOptions.distanceInterval,
        timeInterval: mergedOptions.timeInterval,
      },
      (location) => {
        void this.handleLocationUpdate(location, mergedOptions.maxStoredPoints);
      },
    );
  }

  public stopTracking(): void {
    if (!this.subscription) {
      return;
    }

    this.subscription.remove();
    this.subscription = null;
  }

  public async getStoredLocations(): Promise<StoredLocationPoint[]> {
    return readStoredLocations();
  }

  public async clearStoredLocations(): Promise<void> {
    await clearStoredLocations();
  }

  private async handleLocationUpdate(
    location: Location.LocationObject,
    maxStoredPoints: number,
  ): Promise<void> {
    const point = this.mapToStoredPoint(location.coords, location.timestamp, "watch");

    await appendStoredLocation(point, maxStoredPoints);
  }

  private mapToStoredPoint(
    coords: Location.LocationObjectCoords,
    timestamp: number,
    source: LocationSampleSource,
  ): StoredLocationPoint {
    return {
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
      altitude: coords.altitude,
      heading: coords.heading,
      speed: coords.speed,
      timestamp,
      source,
    };
  }

  private mergeOptions(options: LocationTrackingOptions): Required<LocationTrackingOptions> {
    return {
      accuracy: options.accuracy ?? DEFAULT_TRACKING_OPTIONS.accuracy,
      distanceInterval: options.distanceInterval ?? DEFAULT_TRACKING_OPTIONS.distanceInterval,
      timeInterval: options.timeInterval ?? DEFAULT_TRACKING_OPTIONS.timeInterval,
      maxStoredPoints: options.maxStoredPoints ?? DEFAULT_TRACKING_OPTIONS.maxStoredPoints,
    };
  }
}

export const locationTrackingService = new LocationTrackingService();
