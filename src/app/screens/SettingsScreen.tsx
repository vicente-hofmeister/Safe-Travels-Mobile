import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  StyleSheet,
} from "react-native";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Location from "expo-location";
import {
  getTrackingSettings,
  setTrackingSettings,
  TRACKING_DEFAULTS,
  type TrackingSettings,
} from "../services/location/trackingSettingsStorage";
import { logout } from "../services/auth";
import { locationTrackingService } from "../services/location";
import { theme } from "../../theme";
import { ProfileStackParamList } from "../navigation/ProfileNavigator";

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

const FOREGROUND_OPTIONS: { label: string; value: number }[] = [
  { label: "5s", value: 5_000 },
  { label: "10s", value: 10_000 },
  { label: "30s", value: 30_000 },
];

const BACKGROUND_OPTIONS: { label: string; value: number }[] = [
  { label: "15min", value: 15 * 60 * 1000 },
  { label: "30min", value: 30 * 60 * 1000 },
  { label: "60min", value: 60 * 60 * 1000 },
];

const ACCURACY_OPTIONS: { label: string; value: Location.Accuracy }[] = [
  { label: "Alta", value: Location.Accuracy.High },
  { label: "Balanceada", value: Location.Accuracy.Balanced },
  { label: "Baixa", value: Location.Accuracy.Low },
];

function SegmentedControl<T>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <TouchableOpacity
            key={String(opt.value)}
            style={[styles.segment, active && styles.segmentActive]}
            onPress={() => onChange(opt.value)}
            activeOpacity={0.7}
          >
            <Text style={[styles.segmentLabel, active && styles.segmentLabelActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const [settings, setSettings] = useState<TrackingSettings>(TRACKING_DEFAULTS);

  useEffect(() => {
    getTrackingSettings().then(setSettings).catch(() => {});
  }, []);

  const update = useCallback(async (patch: Partial<TrackingSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    await setTrackingSettings(patch);
  }, [settings]);

  async function handleLogout() {
    await locationTrackingService.stopBackgroundTracking();
    await logout();
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: "Login" as never }] })
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.screenTitle}>Configurações</Text>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>Rastreamento</Text>

        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>Segundo plano</Text>
            <Text style={styles.rowCaption}>Captura localização com o app fechado</Text>
          </View>
          <Switch
            value={settings.backgroundEnabled}
            onValueChange={(v) => update({ backgroundEnabled: v })}
            trackColor={{ false: theme.colors.auxiliary_2, true: theme.colors.tertiary_4 }}
            thumbColor={theme.colors.white}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Intervalo em primeiro plano</Text>
          <SegmentedControl
            options={FOREGROUND_OPTIONS}
            value={settings.foregroundIntervalMs}
            onChange={(v) => update({ foregroundIntervalMs: v })}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Intervalo em segundo plano</Text>
          <SegmentedControl
            options={BACKGROUND_OPTIONS}
            value={settings.backgroundIntervalMs}
            onChange={(v) => update({ backgroundIntervalMs: v })}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Precisão do GPS</Text>
          <Text style={styles.rowCaption}>Maior precisão consome mais bateria</Text>
          <SegmentedControl
            options={ACCURACY_OPTIONS}
            value={settings.accuracy}
            onChange={(v) => update({ accuracy: v })}
          />
        </View>

        <Text style={styles.sectionLabel}>Conta</Text>

        <TouchableOpacity style={styles.logoutRow} onPress={handleLogout} activeOpacity={0.75}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.base.backgroundColor,
    paddingTop: theme.spacing.external_padding_top,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  iconButton: {
    padding: theme.spacing.sm,
  },
  backIcon: {
    fontSize: 36,
    color: theme.colors.secondary_6,
    fontWeight: "300",
  },
  screenTitle: {
    ...theme.typography.title,
    fontSize: 36,
    lineHeight: 40,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md + theme.spacing.xs,
  },
  content: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.external_padding_bottom,
    gap: theme.spacing.sm,
  },
  sectionLabel: {
    ...theme.typography.caption,
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.secondary_6,
    fontFamily: "Montserrat",
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xs,
  },
  row: {
    backgroundColor: theme.colors.auxiliary_1,
    borderRadius: 16,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
    flexDirection: "column",
  },
  rowText: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLabel: {
    ...theme.typography.body,
    fontSize: 15,
    color: theme.colors.secondary_6,
  },
  rowCaption: {
    ...theme.typography.caption,
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.neutral_5,
    fontFamily: "Montserrat",
  },
  segmented: {
    flexDirection: "row",
    alignSelf: "flex-start",
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: theme.colors.tertiary_4,
  },
  segment: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: "transparent",
  },
  segmentActive: {
    backgroundColor: theme.colors.tertiary_4,
  },
  segmentLabel: {
    ...theme.typography.caption,
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.tertiary_4,
    fontFamily: "Montserrat",
  },
  segmentLabelActive: {
    color: theme.colors.white,
  },
  logoutRow: {
    backgroundColor: theme.colors.auxiliary_1,
    borderRadius: 16,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    alignItems: "center",
  },
  logoutText: {
    ...theme.typography.body,
    fontSize: 15,
    color: theme.colors.primary,
  },
});
