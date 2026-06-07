import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { theme } from "../../theme";
import { getStoredUser } from "../services/auth/authStorage";
import { getTripsByUserId, refreshActiveTripContext } from "../services/trip/tripApi";
import type { TripSummary } from "../services/trip/tripTypes";
import type { TripsStackParamList } from "../navigation/TripsNavigator";

type Nav = NativeStackNavigationProp<TripsStackParamList, "TripsList">;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function TripCard({ trip, onPress }: { trip: TripSummary; onPress: () => void }) {
  const isActive = !trip.endedAt;
  const accentColor = isActive ? theme.colors.primary : theme.colors.auxiliary_4;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.cardAccent, { backgroundColor: accentColor }]} />
      <View style={styles.cardContent}>
        <Text style={styles.tripTitle} numberOfLines={1}>
          {trip.name}
        </Text>
        {trip.description ? (
          <Text style={styles.tripDescription} numberOfLines={1}>
            {trip.description}
          </Text>
        ) : null}
        <View style={styles.cardMeta}>
          <Text style={styles.metaText}>Início: {formatDate(trip.startedAt)}</Text>
          {trip.endedAt ? (
            <Text style={styles.metaText}>Fim: {formatDate(trip.endedAt)}</Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

type Section = { title: string; data: TripSummary[] };

function buildSections(trips: TripSummary[]): Section[] {
  const active = trips.filter((t) => !t.endedAt);
  const history = trips.filter((t) => !!t.endedAt);
  const sections: Section[] = [];
  if (active.length > 0) sections.push({ title: "Viagens Ativas", data: active });
  if (history.length > 0) sections.push({ title: "Histórico", data: history });
  return sections;
}

export function TripsScreen() {
  const navigation = useNavigation<Nav>();
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await getStoredUser();
      if (!user) throw new Error("Usuário não encontrado.");
      const data = await getTripsByUserId(user.id);
      setTrips(data);
      // Atualizar cache de trip ativa sempre que a tela de viagens for focada
      await refreshActiveTripContext(user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar viagens.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Recarrega ao entrar na tela (inclusive ao voltar do detalhe)
  useFocusEffect(
    useCallback(() => {
      void loadTrips();
    }, [loadTrips]),
  );

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
        <TouchableOpacity onPress={() => void loadTrips()} style={styles.retryButton}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const sections = buildSections(trips);

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Viagens</Text>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.tripId}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        renderItem={({ item }) => (
          <TripCard
            trip={item}
            onPress={() => navigation.navigate("TripDetail", { tripId: item.tripId })}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma viagem encontrada.</Text>
          </View>
        }
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
    paddingHorizontal: theme.spacing.xl,
  },
  screenTitle: {
    ...theme.typography.title,
    fontSize: 36,
    lineHeight: 40,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xs,
  },
  listContent: {
    paddingBottom: theme.spacing.external_padding_bottom,
  },
  sectionHeader: {
    ...theme.typography.body,
    fontSize: 18,
    color: theme.colors.primary_6,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  separator: {
    height: theme.spacing.md,
  },
  sectionSeparator: {
    height: theme.spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: theme.spacing.xl,
  },
  emptyText: {
    ...theme.typography.caption,
    textAlign: "center",
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.danger,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  retryButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary_1,
    borderRadius: 8,
  },
  retryText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: "700",
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
  },
  cardContent: {
    flex: 1,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  tripTitle: {
    ...theme.typography.body,
    fontSize: 16,
    color: theme.colors.tertiary_7,
  },
  tripDescription: {
    ...theme.typography.caption,
    fontSize: 12,
    color: theme.colors.neutral_5,
    fontFamily: "Montserrat",
  },
  cardMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
