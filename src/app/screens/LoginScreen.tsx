import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";
import { theme } from "../../theme";
import { Image } from "expo-image";
import logo from "../../../assets/images/safe-travels-logo.png";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  return (
    <View style={styles.base_container}>
      <View style={styles.logo_container}>
        <Image source={logo} style={styles.logo} contentFit="contain" />
        <View style={styles.logo_text_container}>
          <Text style={theme.typography.title}>Safe</Text>
          <Text style={theme.typography.title}>Travels</Text>
        </View>
      </View>
      <View style={styles.buttons_container}>
        <Pressable
          style={styles.login_button}
          onPress={() => navigation.navigate("LoginForm")}
        >
          <Text style={styles.login_text}>Log in</Text>
        </Pressable>
        <Pressable
          style={styles.register_button}
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={styles.register_text}>Register</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  base_container: {
    flex: 1,
    justifyContent: "center",
    gap: theme.spacing.md,
    backgroundColor: theme.base.backgroundColor,
    paddingTop: theme.spacing.external_padding_top,
    paddingBottom: theme.spacing.external_padding_bottom,
    paddingLeft: theme.spacing.external_padding_left,
    paddingRight: theme.spacing.external_padding_right,
  },
  logo_container: {
    flex: 1,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: theme.spacing.md,
  },
  logo: {
    width: "85%",
    aspectRatio: 1,
    alignSelf: "center",
  },
  logo_text_container: {
    alignItems: "center",
  },
  buttons_container: {
    gap: theme.spacing.sm,
  },
  login_button: {
    backgroundColor: theme.colors.secondary_3,
    borderRadius: 30,
    paddingVertical: theme.spacing.sm,
    alignItems: "center",
  },
  login_text: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.primary_7,
  },
  register_button: {
    backgroundColor: theme.colors.auxiliary_2,
    borderRadius: 30,
    paddingVertical: theme.spacing.sm,
    alignItems: "center",
  },
  register_text: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.primary_7,
  },
});
