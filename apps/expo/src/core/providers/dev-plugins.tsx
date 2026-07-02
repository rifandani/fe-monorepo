import { useMMKVDevTools } from "@dev-plugins/react-native-mmkv";
import { useReactNavigationDevTools } from "@dev-plugins/react-navigation";
import { useReactQueryDevTools } from "@dev-plugins/react-query";
import type { NavigationContainerRefWithCurrent } from "@react-navigation/native";
import { useNavigationContainerRef } from "expo-router";

import { queryClient } from "@/core/providers/query/client";
import { appStorage } from "@/core/services/mmkv";

export const DevPlugins = () => {
  const navigationRef = useNavigationContainerRef();
  useReactNavigationDevTools(
    navigationRef as NavigationContainerRefWithCurrent<ReactNavigation.RootParamList>
  );
  useMMKVDevTools({ storage: appStorage });
  useReactQueryDevTools(queryClient);
  return null;
};
