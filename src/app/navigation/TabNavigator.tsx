import React from "react";
import { Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { HomeScreen } from "../screens/HomeScreen";
import { TripsScreen } from "../screens/TripsScreen";
import { MapScreen } from "../screens/MapScreen";
import { GroupsNavigator } from "./GroupsNavigator";
import { ProfileScreen } from "../screens/ProfileScreen";
import { theme } from "../../theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Circle, Rect } from "react-native-svg";

export type TabParamList = {
  Inicio: undefined;
  Trips: undefined;
  Map: undefined;
  Groups: undefined;
  Profile: undefined;
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

function TripsIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Rect x={2} y={7} width={20} height={13} rx={2} fill={color} />
      <Path d="M8 7V5C8 3.9 8.9 3 10 3H14C15.1 3 16 3.9 16 5V7" stroke={color} strokeWidth={1.5} />
      <Rect x={10} y={12} width={4} height={3} rx={0.5} fill={theme.colors.auxiliary_1} />
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

function GroupsIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx={9} cy={8} r={3} fill={color} />
      <Circle cx={17} cy={9} r={2.5} fill={color} />
      <Path d="M2 20C2 16.69 5.13 14 9 14C12.87 14 16 16.69 16 20" fill={color} />
      <Path d="M16 14C18.76 14 21 16 21 18.5V20H16" fill={color} />
    </Svg>
  );
}

function ProfileIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={4} fill={color} />
      <Path d="M4 20C4 16.69 7.58 14 12 14C16.42 14 20 16.69 20 20" fill={color} />
    </Svg>
  );
}

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text
      style={{
        fontSize: 12,
        fontWeight: "600",
        color: focused ? theme.colors.neutral_7 : theme.colors.auxiliary_3,
      }}
    >
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
          tabBarLabel: ({ focused }) => <TabLabel label="Home" focused={focused} />,
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="Trips"
        component={TripsScreen}
        options={{
          tabBarLabel: ({ focused }) => <TabLabel label="Trips" focused={focused} />,
          tabBarIcon: ({ color }) => <TripsIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarLabel: ({ focused }) => <TabLabel label="Map" focused={focused} />,
          tabBarIcon: ({ color }) => <MapIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="Groups"
        component={GroupsNavigator}
        options={{
          tabBarLabel: ({ focused }) => <TabLabel label="Groups" focused={focused} />,
          tabBarIcon: ({ color }) => <GroupsIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: ({ focused }) => <TabLabel label="Profile" focused={focused} />,
          tabBarIcon: ({ color }) => <ProfileIcon color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
