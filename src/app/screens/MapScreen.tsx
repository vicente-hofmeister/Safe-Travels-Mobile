import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Region, PROVIDER_GOOGLE } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Svg, { Path } from "react-native-svg";
import { mapStyle } from "./mapStyle";
import { theme } from "../../theme";
import { locationTrackingService } from "../services/location";
import { getLatestLocations, registerLocation } from "../services/location/locationApi";
import { getGroupsByUserId, getGroupLocations } from "../services/group/groupApi";
import { getStoredUser } from "../services/auth/authStorage";
import { searchUsers } from "../services/user/userApi";
import type { StoredLocationPoint } from "../services/location/locationTypes";
import type { LatestLocationPoint } from "../services/location/locationApi";
import type { GroupLocationPin } from "../services/group/groupApi";
import type { UserSearchResult } from "../services/user/userApi";
import type { RootStackParamList } from "../navigation/RootNavigator";

const DEFAULT_DELTA = { latitudeDelta: 0.01, longitudeDelta: 0.01 };

type Nav = NativeStackNavigationProp<RootStackParamList>;

function SearchIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const [myLocation, setMyLocation] = useState<StoredLocationPoint | null>(null);
  const [otherLocations, setOtherLocations] = useState<LatestLocationPoint[]>([]);
  const [groupLocations, setGroupLocations] = useState<GroupLocationPin[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [noLocation, setNoLocation] = useState<string | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      const [point, user] = await Promise.all([
        locationTrackingService.captureCurrentPosition().catch((err: unknown) => {
          console.error("[Map] Falha ao capturar posição:", err);
          return null;
        }),
        getStoredUser(),
      ]);

      if (!isMounted) return;

      if (!point) {
        setError("Permissão de localização negada.");
        return;
      }

      setMyLocation(point);

      if (user) {
        registerLocation({
          userId: user.id,
          latitude: point.latitude,
          longitude: point.longitude,
          accuracyMeters: point.accuracy != null ? Math.round(point.accuracy) : null,
          capturedAt: new Date(point.timestamp).toISOString(),
        }).catch((err: unknown) => {
          console.error("[Map] Falha ao registrar localização na API:", err);
        });
      }

      const latest = await getLatestLocations().catch((err: unknown) => {
        console.error("[Map] Falha ao buscar localizações de usuários:", err);
        return [] as LatestLocationPoint[];
      });

      if (!isMounted) return;
      setOtherLocations(latest);

      if (!user) return;

      try {
        const groups = await getGroupsByUserId(user.id);
        if (!isMounted || groups.length === 0) return;

        const locsPerGroup = await Promise.all(
          groups.map((g) =>
            getGroupLocations(g.groupId).catch(() => []),
          ),
        );

        if (!isMounted) return;

        const seen = new Set<string>();
        const pins: GroupLocationPin[] = groups
          .flatMap((g, i) => locsPerGroup[i].map((loc) => ({ ...loc, groupName: g.name })))
          .filter((pin) => {
            if (seen.has(pin.locationEventId)) return false;
            seen.add(pin.locationEventId);
            return true;
          });

        setGroupLocations(pins);
      } catch (err) {
        console.error("[Map] Falha ao carregar dados de grupos:", err);
      }
    }

    void load();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!myLocation || !mapRef.current) return;
    const region: Region = {
      latitude: myLocation.latitude,
      longitude: myLocation.longitude,
      ...DEFAULT_DELTA,
    };
    mapRef.current.animateToRegion(region, 500);
  }, [myLocation]);

  function handleQueryChange(text: string) {
    setQuery(text);
    setNoLocation(null);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (text.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchUsers(text.trim());
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  }

  function handleSelectUser(user: UserSearchResult) {
    setQuery("");
    setSearchResults([]);

    const found = otherLocations.find((loc) => loc.user.userId === user.userId);
    if (found && mapRef.current) {
      mapRef.current.animateToRegion(
        { latitude: found.latitude, longitude: found.longitude, ...DEFAULT_DELTA },
        600,
      );
    } else {
      setNoLocation(`${user.name} não tem localização ativa.`);
      setTimeout(() => setNoLocation(null), 3000);
    }
  }

  function handleUserCalloutPress(loc: LatestLocationPoint) {
    navigation.navigate("UserProfile", {
      userId: loc.user.userId,
      username: loc.user.username,
    });
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={theme.typography.body}>{error}</Text>
      </View>
    );
  }

  if (!myLocation) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: myLocation.latitude,
          longitude: myLocation.longitude,
          ...DEFAULT_DELTA,
        }}
        showsUserLocation
        showsMyLocationButton={false}
        toolbarEnabled={false}
        customMapStyle={mapStyle}
      >
        {otherLocations.map((loc) => (
          <Marker
            key={`user-${loc.locationEventId}`}
            coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
            title={loc.user.name}
            description={`@${loc.user.username} · ${new Date(loc.capturedAt).toLocaleTimeString("pt-BR")}`}
            pinColor={theme.colors.secondary_3}
            onCalloutPress={() => handleUserCalloutPress(loc)}
          />
        ))}
        {groupLocations.map((loc) => (
          <Marker
            key={`group-${loc.locationEventId}`}
            coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
            title={loc.groupName}
            description={new Date(loc.capturedAt).toLocaleTimeString("pt-BR")}
            pinColor={theme.colors.tertiary_4}
          />
        ))}
      </MapView>

      <View style={[styles.searchContainer, { top: insets.top + 12 }]}>
        <View style={styles.searchBar}>
          <SearchIcon color={theme.colors.secondary_6} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar usuário no mapa..."
            placeholderTextColor={theme.colors.secondary_6}
            value={query}
            onChangeText={handleQueryChange}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => { setQuery(""); setSearchResults([]); setNoLocation(null); }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.clearButton}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {searching && (
          <View style={styles.dropdown}>
            <ActivityIndicator size="small" color={theme.colors.primary} style={{ padding: 12 }} />
          </View>
        )}

        {!searching && searchResults.length > 0 && (
          <FlatList
            style={styles.dropdown}
            data={searchResults}
            keyExtractor={(u) => u.userId}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultRow}
                onPress={() => handleSelectUser(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultUsername}>@{item.username}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        {noLocation && (
          <View style={styles.noLocationBadge}>
            <Text style={styles.noLocationText}>{noLocation}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.base.backgroundColor,
  },
  searchContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 10,
    gap: 4,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.auxiliary_1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.secondary_5,
    fontFamily: "Montserrat",
    padding: 0,
  },
  clearButton: {
    fontSize: 14,
    color: theme.colors.secondary_6,
  },
  dropdown: {
    backgroundColor: theme.colors.auxiliary_1,
    borderRadius: 12,
    maxHeight: 220,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  resultRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.auxiliary_2,
    gap: 2,
  },
  resultName: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.secondary_5,
    fontFamily: "Montserrat",
  },
  resultUsername: {
    fontSize: 13,
    color: theme.colors.tertiary_4,
    fontFamily: "Montserrat",
  },
  noLocationBadge: {
    backgroundColor: theme.colors.auxiliary_1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  noLocationText: {
    fontSize: 13,
    color: theme.colors.secondary_6,
    fontFamily: "Montserrat",
  },
});
