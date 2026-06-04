import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { theme } from "../../theme";
import { mapStyle } from "./mapStyle";
import { getTripById } from "../services/trip/tripApi";
import type { TripDetail, TripRoutePoint } from "../services/trip/tripTypes";
import type { TripsStackParamList } from "../navigation/TripsNavigator";

type RouteProps = RouteProp<TripsStackParamList, "TripDetail">;
type NavProps = NativeStackNavigationProp<TripsStackParamList, "TripDetail">;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getBoundingRegion(coords: TripRoutePoint[]) {
  const lats = coords.map((c) => c.latitude);
  const lons = coords.map((c) => c.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const latDelta = Math.max((maxLat - minLat) * 1.5, 0.01);
  const lonDelta = Math.max((maxLon - minLon) * 1.5, 0.01);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLon + maxLon) / 2,
    latitudeDelta: latDelta,
    longitudeDelta: lonDelta,
  };
}


export function TripDetailScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavProps>();
  const insets = useSafeAreaInsets();
  const { tripId } = route.params;

  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const data = await getTripById(tripId);
        if (isMounted) setTrip(data);
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : "Erro ao carregar viagem.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void load();
    return () => {
      isMounted = false;
    };
  }, [tripId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error || !trip) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error ?? "Viagem não encontrada."}</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButtonFallback}
        >
          <Text style={styles.backButtonFallbackText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Mapa: se não há rota, mostrar mapa padrão centrado em Porto Alegre
  const hasRoute = trip.route.length >= 2;
  const region = hasRoute
    ? getBoundingRegion(trip.route)
    : { latitude: -30.0346, longitude: -51.2177, latitudeDelta: 0.05, longitudeDelta: 0.05 };

  const start = trip.route[0];
  const end = trip.route[trip.route.length - 1];

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        customMapStyle={mapStyle}
      >
        {hasRoute && (
          <>
            <Polyline
              coordinates={trip.route}
              strokeColor={theme.colors.primary}
              strokeWidth={4}
            />
            <Marker
              coordinate={start}
              title="Início"
              description={formatDate(trip.startedAt)}
              pinColor={theme.colors.primary_3}
            />
            {trip.endedAt && (
              <Marker
                coordinate={end}
                title="Fim"
                description={formatDate(trip.endedAt)}
                pinColor={theme.colors.primary_5}
              />
            )}
          </>
        )}
      </MapView>

      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.titleCard}>
          <Text style={styles.titleText} numberOfLines={1}>
            {trip.name}
          </Text>
        </View>
      </View>

      <View style={[styles.infoCard, { paddingBottom: insets.bottom + theme.spacing.md }]}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Início</Text>
          <Text style={styles.infoValue}>{formatDate(trip.startedAt)}</Text>
        </View>
        {trip.endedAt ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fim</Text>
            <Text style={styles.infoValue}>{formatDate(trip.endedAt)}</Text>
          </View>
        ) : (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>ativa</Text>
            </View>
          </View>
        )}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Pontos registrados</Text>
          <Text style={styles.infoValue}>{trip.route.length}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Membros</Text>
          <Text style={styles.infoValue}>{trip.members.length}</Text>
        </View>
        {!hasRoute && (
          <Text style={styles.noRouteText}>
            Nenhum ponto de localização registrado ainda.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.base.backgroundColor,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.base.backgroundColor,
    paddingHorizontal: theme.spacing.xl,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.danger,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  backButtonFallback: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary_1,
    borderRadius: 8,
  },
  backButtonFallbackText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: "700",
  },
  map: {
    flex: 1,
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.auxiliary_1,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: theme.colors.primary_7,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  backIcon: {
    fontSize: 28,
    lineHeight: 32,
    color: theme.colors.secondary_6,
    fontWeight: "300",
    marginTop: -2,
  },
  titleCard: {
    flex: 1,
    backgroundColor: theme.colors.auxiliary_1,
    borderRadius: 20,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    elevation: 3,
    shadowColor: theme.colors.primary_7,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  titleText: {
    ...theme.typography.body,
    fontSize: 15,
    color: theme.colors.primary_6,
  },
  infoCard: {
    backgroundColor: theme.colors.auxiliary_1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    gap: theme.spacing.sm,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 8,
    shadowColor: theme.colors.primary_7,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    ...theme.typography.caption,
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.neutral_5,
    fontFamily: "Montserrat",
  },
  infoValue: {
    ...theme.typography.caption,
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.primary_6,
    fontFamily: "Montserrat",
  },
  activeBadge: {
    backgroundColor: theme.colors.primary_1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: theme.colors.primary,
    fontFamily: "Montserrat",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  noRouteText: {
    ...theme.typography.caption,
    fontSize: 12,
    color: theme.colors.neutral_5,
    fontFamily: "Montserrat",
    textAlign: "center",
    marginTop: theme.spacing.xs,
  },
});
