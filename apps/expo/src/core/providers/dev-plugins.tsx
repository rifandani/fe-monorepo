import { useMMKVDevTools } from "@dev-plugins/react-native-mmkv";
import { useReactNavigationDevTools } from "@dev-plugins/react-navigation";
import { useReactQueryDevTools } from "@dev-plugins/react-query";
import { useNavigationContainerRef } from "expo-router";

import { queryClient } from "@/core/providers/query/client";
import { appStorage } from "@/core/services/mmkv";

export const DevPlugins = () => {
  const navigationRef = useNavigationContainerRef();
  // SAFETY: @dev-plugins/react-navigation pins its own @react-navigation/core
  // copy, so the ref's generic parameter list is nominally a different type than
  // the identical one expo-router hands back. Dev-only devtools wiring.
  // oxlint-disable-next-line typescript/no-explicit-any
  useReactNavigationDevTools(navigationRef as any);
  useMMKVDevTools({ storage: appStorage });
  useReactQueryDevTools(queryClient);
  return null;
};
