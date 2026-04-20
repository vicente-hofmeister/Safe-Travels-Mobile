import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import MapView, { Marker, Region, PROVIDER_GOOGLE } from "react-native-maps";
import { mapStyle } from "./mapStyle";
import { theme } from "../../theme";
import { locationTrackingService } from "../services/location";
import { getLatestLocations } from "../services/location/locationApi";
import type { StoredLocationPoint } from "../services/location/locationTypes";
import type { LatestLocationPoint } from "../services/location/locationApi";

const DEFAULT_DELTA = { latitudeDelta: 0.01, longitudeDelta: 0.01 };

export function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const [myLocation, setMyLocation] = useState<StoredLocationPoint | null>(null);
  const [otherLocations, setOtherLocations] = useState<LatestLocationPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const [point, latest] = await Promise.all([
          locationTrackingService.captureCurrentPosition(),
          getLatestLocations(),
        ]);

        if (!isMounted) return;

        if (!point) {
          setError("Permissão de localização negada.");
          return;
        }

        setMyLocation(point);
        setOtherLocations(latest);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Não foi possível carregar o mapa.");
        }
      }
    }

    void load();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!myLocation || !mapRef.current) return;

    const region: Region = {
      latitude: myLocation.latitude,
      longitude: myLocation.longitude,
      ...DEFAULT_DELTA,
    };
    mapRef.current.animateToRegion(region, 500);
  }, [myLocation]);

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={theme.typography.body}>{error}</Text>
      </View>
    );
  }

  if (!myLocation) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      provider={PROVIDER_GOOGLE}
      initialRegion={{
        latitude: myLocation.latitude,
        longitude: myLocation.longitude,
        ...DEFAULT_DELTA,
      }}
      showsUserLocation
      showsMyLocationButton
      customMapStyle={mapStyle}
    >
      {otherLocations.map((loc) => (
        <Marker
          key={loc.locationEventId}
          coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
          title={loc.user.name}
          description={`@${loc.user.username} · ${new Date(loc.capturedAt).toLocaleTimeString("pt-BR")}`}
          pinColor={theme.colors.secondary_3}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.base.backgroundColor,
  },
});
