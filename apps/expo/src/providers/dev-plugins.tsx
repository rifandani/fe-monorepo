import { useMMKVDevTools } from "@dev-plugins/react-native-mmkv";
import { useReactNavigationDevTools } from "@dev-plugins/react-navigation";
import { useReactQueryDevTools } from "@dev-plugins/react-query";
import { useNavigationContainerRef } from "expo-router";

import { appStorage } from "@/lib/layers/mmkv";
import { queryClient } from "@/providers/query/client";

export const DevPlugins = () => {
  const navigationRef = useNavigationContainerRef();
  // SAFETY: the dev tools only read the navigation container from the ref; the ref type of expo-router does not match the type that the plugin declares.
  // oxlint-disable-next-line typescript/no-explicit-any, typescript/no-unsafe-type-assertion, typescript/no-unsafe-argument
  useReactNavigationDevTools(navigationRef as any);
  useMMKVDevTools({ storage: appStorage });
  useReactQueryDevTools(queryClient);

  return null;
};
