import { createNavigationContainerRef, CommonActions } from "@react-navigation/native";
import { RootStackParamList } from "./RootNavigator";

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigateToLogin() {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: "Login" }] })
    );
  }
}
