import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../theme";
import { getUserById } from "../services/user/userApi";
import type { UserProfile } from "../services/user/userApi";
import type { GroupsStackParamList } from "../navigation/GroupsNavigator";

type RouteProps = RouteProp<GroupsStackParamList, "UserProfile">;
type NavProps = NativeStackNavigationProp<GroupsStackParamList, "UserProfile">;

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

export function UserProfileScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavProps>();
  const insets = useSafeAreaInsets();
  const { userId } = route.params;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const data = await getUserById(userId);
        if (isMounted) setProfile(data);
      } catch (err) {
        if (isMounted)
          setError(err instanceof Error ? err.message : "Erro ao carregar perfil.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void load();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const topPadding = insets.top + 16;

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.topBarIcon}>‹</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}

      {error && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && profile && (
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(profile.name)}</Text>
          </View>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.username}>@{profile.username}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.base.backgroundColor,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  topBarIcon: {
    fontSize: 36,
    color: theme.colors.secondary_6,
    fontWeight: "300",
  },
  card: {
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.xl,
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
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.danger,
    textAlign: "center",
    paddingHorizontal: theme.spacing.xl,
  },
});
