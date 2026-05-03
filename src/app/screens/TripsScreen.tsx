import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../theme";

export function TripsScreen() {
  return (
    <View style={styles.container}>
      <Text style={theme.typography.body}>Trips</Text>
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
});
