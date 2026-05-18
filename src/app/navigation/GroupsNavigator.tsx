import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GroupsScreen } from "../screens/GroupsScreen";
import { GroupDetailScreen } from "../screens/GroupDetailScreen";

export type GroupsStackParamList = {
  GroupsList: undefined;
  GroupDetail: { groupId: string; groupName: string };
};

const Stack = createNativeStackNavigator<GroupsStackParamList>();

export function GroupsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GroupsList" component={GroupsScreen} />
      <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
    </Stack.Navigator>
  );
}
