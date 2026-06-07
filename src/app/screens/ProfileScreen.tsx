import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Svg, { Path, Circle } from "react-native-svg";
import { theme } from "../../theme";
import { ProfileStackParamList } from "../navigation/ProfileNavigator";
import { getStoredUser, StoredUser } from "../services/auth/authStorage";
import { getTripsByUserId } from "../services/trip/tripApi";
import type { TripSummary } from "../services/trip/tripTypes";

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

function GearIcon({ color }: { color: string }) {
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={3} fill={color} />
      <Path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ActiveTripRow({ trip }: { trip: TripSummary }) {
  const isGroup = trip.groupId !== null;
  return (
    <View style={styles.tripRow}>
      <View style={styles.tripDot} />
      <View style={styles.tripInfo}>
        <Text style={styles.tripName} numberOfLines={1}>
          {trip.name}
        </Text>
        <Text style={styles.tripMeta}>
          {isGroup ? "viagem em grupo" : "viagem individual"}
        </Text>
      </View>
    </View>
  );
}

export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [activeTrips, setActiveTrips] = useState<TripSummary[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function load() {
        const stored = await getStoredUser();
        if (!isMounted || !stored) return;
        setUser(stored);

        setLoadingTrips(true);
        try {
          const trips = await getTripsByUserId(stored.id);
          if (isMounted) setActiveTrips(trips.filter((t) => t.endedAt === null));
        } catch {
          if (isMounted) setActiveTrips([]);
        } finally {
          if (isMounted) setLoadingTrips(false);
        }
      }

      void load();
      return () => {
        isMounted = false;
      };
    }, [])
  );

  const initials = user
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((p) => p[0] ?? "")
        .join("")
        .toUpperCase()
    : "";

  return (
    <FlatList
      style={styles.root}
      contentContainerStyle={styles.content}
      data={activeTrips}
      keyExtractor={(t) => t.tripId}
      renderItem={({ item }) => <ActiveTripRow trip={item} />}
      ListHeaderComponent={
        <>
          <View style={styles.topBar}>
            <Text style={styles.screenTitle}>Perfil</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Settings")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <GearIcon color={theme.colors.tertiary_4} />
            </TouchableOpacity>
          </View>

          {user && (
            <View style={styles.card}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.username}>@{user.username}</Text>
              <Text style={styles.email}>{user.email}</Text>
            </View>
          )}

          {(loadingTrips || activeTrips.length > 0) && (
            <Text style={styles.sectionLabel}>Viagens ativas</Text>
          )}

          {loadingTrips && (
            <ActivityIndicator
              size="small"
              color={theme.colors.primary}
              style={{ marginTop: theme.spacing.sm }}
            />
          )}
        </>
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.base.backgroundColor,
  },
  content: {
    paddingTop: theme.spacing.external_padding_top,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.external_padding_bottom,
    gap: 10,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xs,
  },
  screenTitle: {
    ...theme.typography.title,
    fontSize: 36,
    lineHeight: 40,
  },
  card: {
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.tertiary_2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.tertiary_4,
    fontFamily: "Montserrat",
  },
  name: {
    ...theme.typography.title,
    fontSize: 22,
    lineHeight: 26,
    color: theme.colors.secondary_5,
  },
  username: {
    ...theme.typography.caption,
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.tertiary_4,
    fontFamily: "Montserrat",
  },
  email: {
    ...theme.typography.caption,
    fontSize: 14,
    color: theme.colors.secondary_6,
    fontFamily: "Montserrat",
  },
  sectionLabel: {
    ...theme.typography.caption,
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.secondary_6,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
    fontFamily: "Montserrat",
  },
  tripRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 4,
    gap: theme.spacing.md,
    backgroundColor: theme.colors.auxiliary_1,
    borderRadius: 16,
  },
  tripDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.tertiary_4,
    flexShrink: 0,
  },
  tripInfo: {
    flex: 1,
    gap: 2,
  },
  tripName: {
    ...theme.typography.body,
    fontSize: 15,
    color: theme.colors.secondary_6,
  },
  tripMeta: {
    ...theme.typography.caption,
    fontSize: 13,
    color: theme.colors.secondary_6,
    fontFamily: "Montserrat",
  },
});
