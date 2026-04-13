export type LocationSampleSource = "current" | "watch";

export type StoredLocationPoint = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
  source: LocationSampleSource;
};

export type LocationTrackingOptions = {
  accuracy?: number;
  distanceInterval?: number;
  timeInterval?: number;
  maxStoredPoints?: number;
};
