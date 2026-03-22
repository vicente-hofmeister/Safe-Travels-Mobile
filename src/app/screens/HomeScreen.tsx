import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../theme";

export function HomeScreen() {
  return (
    <View style={styles.base_container}>
      <Text style={theme.typography.title}>Home</Text>
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
