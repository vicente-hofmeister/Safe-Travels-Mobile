import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import MapView, { Marker, Region, PROVIDER_GOOGLE } from "react-native-maps";
import { mapStyle } from "./mapStyle";
import { theme } from "../../theme";
import { locationTrackingService } from "../services/location";
import { getLatestLocations, registerLocation } from "../services/location/locationApi";
import { getGroupsByUserId, getGroupLocations } from "../services/group/groupApi";
import { getStoredUser } from "../services/auth/authStorage";
import type { StoredLocationPoint } from "../services/location/locationTypes";
import type { LatestLocationPoint } from "../services/location/locationApi";
import type { GroupLocationPin } from "../services/group/groupApi";

const DEFAULT_DELTA = { latitudeDelta: 0.01, longitudeDelta: 0.01 };

export function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const [myLocation, setMyLocation] = useState<StoredLocationPoint | null>(null);
  const [otherLocations, setOtherLocations] = useState<LatestLocationPoint[]>([]);
  const [groupLocations, setGroupLocations] = useState<GroupLocationPin[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      const [point, user] = await Promise.all([
        locationTrackingService.captureCurrentPosition().catch((err: unknown) => {
          console.error("[Map] Falha ao capturar posição:", err);
          return null;
        }),
        getStoredUser(),
      ]);

      if (!isMounted) return;

      if (!point) {
        setError("Permissão de localização negada.");
        return;
      }

      setMyLocation(point);

      // Registra a localização na API (best-effort) para vincular aos grupos
      if (user) {
        registerLocation({
          userId: user.id,
          latitude: point.latitude,
          longitude: point.longitude,
          accuracyMeters: point.accuracy != null ? Math.round(point.accuracy) : null,
          capturedAt: new Date(point.timestamp).toISOString(),
        }).catch((err: unknown) => {
          console.error("[Map] Falha ao registrar localização na API:", err);
        });
      }

      const [latest] = await Promise.all([
        getLatestLocations().catch((err: unknown) => {
          console.error("[Map] Falha ao buscar localizações de usuários:", err);
          return [] as LatestLocationPoint[];
        }),
      ]);

      if (!isMounted) return;
      setOtherLocations(latest);

      if (!user) return;

      try {
        const groups = await getGroupsByUserId(user.id);
        console.log(`[Map] Grupos encontrados: ${groups.length}`);

        if (!isMounted || groups.length === 0) return;

        const locsPerGroup = await Promise.all(
          groups.map((g) =>
            getGroupLocations(g.groupId).catch((err: unknown) => {
              console.error(`[Map] Falha ao buscar localização do grupo "${g.name}":`, err);
              return [];
            }),
          ),
        );

        if (!isMounted) return;

        const pins: GroupLocationPin[] = groups.flatMap((g, i) =>
          locsPerGroup[i].map((loc) => ({ ...loc, groupName: g.name })),
        );

        console.log(`[Map] Pins de grupos: ${pins.length}`);
        setGroupLocations(pins);
      } catch (err) {
        console.error("[Map] Falha ao carregar dados de grupos:", err);
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
          key={`user-${loc.locationEventId}`}
          coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
          title={loc.user.name}
          description={`@${loc.user.username} · ${new Date(loc.capturedAt).toLocaleTimeString("pt-BR")}`}
          pinColor={theme.colors.secondary_3}
        />
      ))}
      {groupLocations.map((loc) => (
        <Marker
          key={`group-${loc.locationEventId}`}
          coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
          title={loc.groupName}
          description={new Date(loc.capturedAt).toLocaleTimeString("pt-BR")}
          pinColor={theme.colors.primary}
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
