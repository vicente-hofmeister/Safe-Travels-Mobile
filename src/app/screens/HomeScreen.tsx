import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../theme";
import { locationTrackingService } from "../services/location";
import { getHasActiveTrip } from "../services/trip/tripContextStorage";

export function HomeScreen() {
  useEffect(() => {
    getHasActiveTrip().then((hasActive) => {
      if (hasActive) {
        locationTrackingService.startBackgroundTracking().catch(() => {});
      }
    }).catch(() => {});
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.base.backgroundColor,
  },
  title: {
    ...theme.typography.title,
    fontSize: 36,
    color: theme.colors.secondary_5,
  },
});
