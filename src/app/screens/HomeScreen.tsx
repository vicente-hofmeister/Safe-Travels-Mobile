import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../theme";
import { locationTrackingService } from "../services/location";
import { getHasActiveTrip } from "../services/trip/tripContextStorage";

export function HomeScreen() {
  const [locationText, setLocationText] = useState("Carregando localizacao...");

  useEffect(() => {
    // Só inicia background tracking se houver trip ativa
    getHasActiveTrip().then((hasActive) => {
      if (hasActive) {
        locationTrackingService.startBackgroundTracking().catch(() => {});
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadLocation() {
      try {
        const point = await locationTrackingService.captureCurrentPosition();

        if (!isMounted) return;

        if (!point) {
          setLocationText("Permissao de localizacao negada.");
          return;
        }

        setLocationText(`Lat: ${point.latitude.toFixed(6)} | Lon: ${point.longitude.toFixed(6)}`);
      } catch (error) {
        if (isMounted) {
          const message =
            error instanceof Error ? error.message : "Nao foi possivel obter a localizacao.";
          setLocationText(message);
        }
      }
    }

    void loadLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View style={styles.base_container}>
      <Text style={theme.typography.body}>{locationText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base_container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing.md,
    backgroundColor: theme.base.backgroundColor,
    paddingTop: theme.spacing.external_padding_top,
    paddingBottom: theme.spacing.external_padding_bottom,
    paddingLeft: theme.spacing.external_padding_left,
    paddingRight: theme.spacing.external_padding_right,
  },
});
