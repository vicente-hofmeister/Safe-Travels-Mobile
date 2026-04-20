import React from "react";
import { Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { HomeScreen } from "../screens/HomeScreen";
import { MapScreen } from "../screens/MapScreen";
import { theme } from "../../theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Circle } from "react-native-svg";

export type TabParamList = {
  Inicio: undefined;
  Map: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

function HomeIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z"
        fill={color}
      />
    </Svg>
  );
}

function MapIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"
        fill={color}
      />
      <Circle cx={12} cy={9} r={2.5} fill={theme.colors.white} />
    </Svg>
  );
}

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 12, fontWeight: "600", color: focused ? theme.colors.neutral_7 : theme.colors.auxiliary_3 }}>
      {label}
    </Text>
  );
}

export function TabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.secondary_3,
        tabBarInactiveTintColor: theme.colors.auxiliary_2,
        tabBarStyle: {
          backgroundColor: theme.colors.auxiliary_1,
          borderTopColor: theme.colors.auxiliary_2,
          borderTopWidth: 1,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Inicio"
        component={HomeScreen}
        options={{
          tabBarLabel: ({ focused }) => <TabLabel label="Início" focused={focused} />,
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarLabel: ({ focused }) => <TabLabel label="Mapa" focused={focused} />,
          tabBarIcon: ({ color }) => <MapIcon color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
