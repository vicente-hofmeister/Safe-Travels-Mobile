import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TripsScreen } from "../screens/TripsScreen";
import { TripDetailScreen } from "../screens/TripDetailScreen";

export type TripsStackParamList = {
  TripsList: undefined;
  TripDetail: { tripId: string };
};

const Stack = createNativeStackNavigator<TripsStackParamList>();

export function TripsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TripsList" component={TripsScreen} />
      <Stack.Screen name="TripDetail" component={TripDetailScreen} />
    </Stack.Navigator>
  );
}
