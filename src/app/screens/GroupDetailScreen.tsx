import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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
import { getGroupById } from "../services/group/groupApi";
import type { GroupDetail, GroupMember } from "../services/group/groupApi";
import type { GroupsStackParamList } from "../navigation/GroupsNavigator";

type RouteProps = RouteProp<GroupsStackParamList, "GroupDetail">;
type NavProps = NativeStackNavigationProp<GroupsStackParamList, "GroupDetail">;

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

function MemberRow({
  member,
  isOwner,
  onPress,
}: {
  member: GroupMember;
  isOwner: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.memberRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials(member.name)}</Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName} numberOfLines={1}>
          {member.name}
        </Text>
        <Text style={styles.memberUsername}>@{member.username}</Text>
      </View>
      {isOwner && (
        <View style={styles.ownerBadge}>
          <Text style={styles.ownerBadgeText}>admin</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export function GroupDetailScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavProps>();
  const insets = useSafeAreaInsets();
  const { groupId } = route.params;

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const data = await getGroupById(groupId);
        if (isMounted) setGroup(data);
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : "Erro ao carregar grupo.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void load();
    return () => {
      isMounted = false;
    };
  }, [groupId]);

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
        <TouchableOpacity
          style={styles.iconButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.topBarIcon}>+</Text>
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

      {!loading && !error && group && (
        <FlatList
          data={group.members}
          keyExtractor={(m) => m.userId}
          ListHeaderComponent={
            <View style={styles.header}>
              <View style={styles.groupHeaderRow}>
                <View style={styles.groupAvatar}>
                  <Text style={styles.groupAvatarText}>{getInitials(group.name)}</Text>
                </View>
                <Text style={styles.title}>{group.name}</Text>
              </View>
              {group.description ? (
                <Text style={styles.description}>{group.description}</Text>
              ) : null}
              <Text style={styles.sectionLabel}>
                Membros · {group.members.length}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <MemberRow
              member={item}
              isOwner={item.userId === group.owner.userId}
              onPress={() =>
                navigation.navigate("UserProfile", {
                  userId: item.userId,
                  username: item.username,
                })
              }
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
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
    justifyContent: "space-between",
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
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  groupHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.md,
  },
  title: {
    ...theme.typography.title,
    flex: 1,
    fontSize: 28,
    lineHeight: 32,
    color: theme.colors.secondary_5,
  },
  description: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.secondary_6,
    lineHeight: 20,
  },
  sectionLabel: {
    ...theme.typography.caption,
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.secondary_6,
    marginTop: theme.spacing.md,
    fontFamily: "Montserrat",
  },
  listContent: {
    paddingBottom: theme.spacing.external_padding_bottom,
    paddingHorizontal: 30,
    gap: 10,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 4,
    gap: theme.spacing.md,
    backgroundColor: theme.colors.auxiliary_1,
    borderRadius: 16,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.tertiary_2,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.tertiary_4,
    fontFamily: "Montserrat",
  },
  groupAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.tertiary_2,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  groupAvatarText: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.tertiary_4,
    fontFamily: "Montserrat",
  },
  memberInfo: {
    flex: 1,
    gap: 2,
  },
  memberName: {
    ...theme.typography.body,
    fontSize: 15,
    color: theme.colors.secondary_6,
    flexShrink: 1,
  },
  ownerBadge: {
    backgroundColor: theme.colors.secondary_1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexShrink: 0,
  },
  ownerBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: theme.colors.secondary_3,
    fontFamily: "Montserrat",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  memberUsername: {
    ...theme.typography.caption,
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.secondary_6,
    fontFamily: "Montserrat",
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.danger,
    textAlign: "center",
    paddingHorizontal: theme.spacing.xl,
  },
});
