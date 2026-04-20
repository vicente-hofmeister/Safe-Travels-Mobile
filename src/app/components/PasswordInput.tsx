import React, { useState } from "react";
import { View, TextInput, Pressable, Text, StyleSheet } from "react-native";
import { theme } from "../../theme";

type Props = {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
};

export function PasswordInput({ placeholder = "Senha", value, onChangeText, editable = true }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.auxiliary_2}
        secureTextEntry={!visible}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="off"
        importantForAutofill="no"
      />
      <Pressable onPress={() => setVisible((v) => !v)} style={styles.toggle}>
        <Text style={styles.toggle_text}>{visible ? "Ocultar" : "Mostrar"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: theme.colors.auxiliary_2,
    borderRadius: 30,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: "transparent",
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: theme.colors.auxiliary_2,
  },
  toggle: {
    paddingLeft: theme.spacing.sm,
  },
  toggle_text: {
    fontSize: 14,
    color: theme.colors.auxiliary_2,
    fontWeight: "600",
  },
});
