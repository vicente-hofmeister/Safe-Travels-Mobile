import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/RootNavigator";
import { theme } from "../../theme";
import { register } from "../services/auth";
import { PasswordInput } from "../components/PasswordInput";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export function RegisterScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleRegister(): Promise<void> {
    if (isSubmitting) return;

    if (password !== confirmPassword) {
      setSubmitError("As senhas não coincidem.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await register({
        name: name.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password,
      });
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Erro ao criar conta.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scroll_content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.base_container}>
        <Text style={styles.title}>Criar conta</Text>
        <View style={styles.form_container}>
          <TextInput
            style={styles.input}
            placeholder="Nome completo"
            placeholderTextColor={theme.colors.auxiliary_2}
            autoCapitalize="words"
            autoCorrect={false}
            value={name}
            onChangeText={setName}
            editable={!isSubmitting}
          />
          <TextInput
            style={styles.input}
            placeholder="Nome de usuário"
            placeholderTextColor={theme.colors.auxiliary_2}
            autoCapitalize="none"
            autoCorrect={false}
            value={username}
            onChangeText={setUsername}
            editable={!isSubmitting}
          />
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor={theme.colors.auxiliary_2}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            editable={!isSubmitting}
          />
          <PasswordInput
            value={password}
            onChangeText={setPassword}
            editable={!isSubmitting}
          />
          <PasswordInput
            placeholder="Confirmar senha"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!isSubmitting}
          />
          {submitError ? <Text style={styles.error_text}>{submitError}</Text> : null}
          <Pressable
            style={styles.register_button}
            onPress={() => void handleRegister()}
            disabled={isSubmitting}
          >
            <Text style={styles.register_text}>
              {isSubmitting ? "Criando conta..." : "Criar conta"}
            </Text>
          </Pressable>
          <Pressable
            style={styles.back_button}
            onPress={() => navigation.goBack()}
            disabled={isSubmitting}
          >
            <Text style={styles.back_text}>Já tenho conta</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll_content: {
    flexGrow: 1,
  },
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
  register_button: {
    backgroundColor: theme.colors.secondary_3,
    borderRadius: 30,
    paddingVertical: theme.spacing.sm,
    alignItems: "center",
  },
  register_text: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.primary_7,
  },
  back_button: {
    backgroundColor: theme.colors.auxiliary_2,
    borderRadius: 30,
    paddingVertical: theme.spacing.sm,
    alignItems: "center",
  },
  back_text: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.primary_7,
  },
  error_text: {
    color: "#A61B1B",
    textAlign: "center",
  },
});
