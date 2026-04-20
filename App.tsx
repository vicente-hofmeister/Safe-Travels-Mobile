import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { RootNavigator } from "./src/app/navigation/RootNavigator";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";
import montserratItalic from "./assets/fonts/Montserrat-Italic-VariableFont_wght.ttf";
import montserrat from "./assets/fonts/Montserrat-VariableFont_wght.ttf";

export default function App() {
  const [fontsLoaded] = useFonts({
    MontserratItalic: montserratItalic,
    Montserrat: montserrat,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
