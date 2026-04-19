import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LoginScreen } from "../screens/LoginScreen";
import { LoginFormScreen } from "../screens/LoginFormScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { HomeScreen } from "../screens/HomeScreen";

export type RootStackParamList = {
  Login: undefined;
  LoginForm: undefined;
  Register: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Safe Travels" }} />
      <Stack.Screen name="LoginForm" component={LoginFormScreen} options={{ title: "Entrar" }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Criar conta" }} />
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Home" }} />
    </Stack.Navigator>
  );
}
