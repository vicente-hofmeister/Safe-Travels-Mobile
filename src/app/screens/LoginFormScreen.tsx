import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";
import { theme } from "../../theme";
import { login } from "../services/auth";
import { PasswordInput } from "../components/PasswordInput";

type Props = NativeStackScreenProps<RootStackParamList, "LoginForm">;

export function LoginFormScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleLogin(): Promise<void> {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await login({ email: email.trim().toLowerCase(), password });
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Erro ao fazer login.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.base_container}>
      <Text style={styles.title}>Entrar</Text>
      <View style={styles.form_container}>
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor={theme.colors.auxiliary_2}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          importantForAutofill="no"
          value={email}
          onChangeText={setEmail}
          editable={!isSubmitting}
        />
        <PasswordInput
          value={password}
          onChangeText={setPassword}
          editable={!isSubmitting}
        />
        {submitError ? <Text style={styles.error_text}>{submitError}</Text> : null}
        <Pressable
          style={styles.login_button}
          onPress={() => void handleLogin()}
          disabled={isSubmitting}
        >
          <Text style={styles.login_text}>{isSubmitting ? "Entrando..." : "Log in"}</Text>
        </Pressable>
        <Pressable
          style={styles.register_button}
          onPress={() => navigation.navigate("Register")}
          disabled={isSubmitting}
        >
          <Text style={styles.register_text}>Criar conta</Text>
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
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: theme.colors.primary_7,
    textAlign: "center",
  },
  form_container: {
    gap: theme.spacing.sm,
  },
  input: {
    borderWidth: 1.5,
    borderColor: theme.colors.auxiliary_2,
    borderRadius: 30,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    fontSize: 18,
    color: theme.colors.auxiliary_2,
    backgroundColor: "transparent",
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
  error_text: {
    color: "#A61B1B",
    textAlign: "center",
  },
});
