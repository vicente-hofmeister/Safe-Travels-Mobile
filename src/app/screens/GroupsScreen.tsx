import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { theme } from "../../theme";
import { getStoredUser } from "../services/auth/authStorage";
import { getGroupsByUserId, GroupSummary } from "../services/group/groupApi";
import type { GroupsStackParamList } from "../navigation/GroupsNavigator";

type Nav = NativeStackNavigationProp<GroupsStackParamList, "GroupsList">;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function GroupCard({
  group,
  isOwner,
  onPress,
}: {
  group: GroupSummary;
  isOwner: boolean;
  onPress: () => void;
}) {
  const accentColor = isOwner ? theme.colors.secondary_4 : theme.colors.tertiary_4;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.cardAccent, { backgroundColor: accentColor }]} />
      <View style={styles.cardContent}>
        <Text style={styles.groupName} numberOfLines={1}>
          {group.name}
        </Text>
        {group.description ? (
          <Text style={styles.groupDescription} numberOfLines={2}>
            {group.description}
          </Text>
        ) : null}
        <View style={styles.cardMeta}>
          <Text style={styles.metaText}>por {group.owner.name}</Text>
          <Text style={styles.metaText}>desde {formatDate(group.joinedAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function GroupsScreen() {
  const navigation = useNavigation<Nav>();
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadGroups() {
      try {
        const user = await getStoredUser();
        if (!user) throw new Error("Usuário não encontrado.");
        const data = await getGroupsByUserId(user.id);
        if (isMounted) {
          setCurrentUserId(user.id);
          setGroups(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Erro ao carregar grupos.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void loadGroups();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Grupos</Text>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.groupId}
        renderItem={({ item }) => (
          <GroupCard
            group={item}
            isOwner={currentUserId === item.owner.userId}
            onPress={() =>
              navigation.navigate("GroupDetail", {
                groupId: item.groupId,
                groupName: item.name,
              })
            }
          />
        )}
        contentContainerStyle={
          groups.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Você não pertence a nenhum grupo.</Text>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.base.backgroundColor,
    paddingTop: theme.spacing.external_padding_top,
    paddingHorizontal: theme.spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.base.backgroundColor,
  },
  screenTitle: {
    ...theme.typography.title,
    fontSize: 36,
    lineHeight: 40,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xs,
  },
  listContent: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.external_padding_bottom,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    ...theme.typography.caption,
    textAlign: "center",
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.danger,
    textAlign: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  card: {
    flexDirection: "row",
    backgroundColor: theme.colors.tertiary_2,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: theme.colors.primary_7,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardAccent: {
    width: 5,
    backgroundColor: theme.colors.primary,
  },
  cardContent: {
    flex: 1,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  groupName: {
    ...theme.typography.body,
    fontSize: 16,
    color: theme.colors.tertiary_7,
  },
  groupDescription: {
    ...theme.typography.caption,
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.neutral_5,
    fontFamily: "Montserrat",
  },
  cardMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.sm,
  },
  metaText: {
    ...theme.typography.caption,
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.neutral_5,
    fontFamily: "Montserrat",
  },
});
