/* oxlint-disable eslint/func-style -- function declarations */
import { useMMKVDevTools } from "@dev-plugins/react-native-mmkv";
import { useReactNavigationDevTools } from "@dev-plugins/react-navigation";
import { useReactQueryDevTools } from "@dev-plugins/react-query";
import { useNavigationContainerRef } from "expo-router";

import { queryClient } from "@/core/providers/query/client";
import { appStorage } from "@/core/services/mmkv";

export function DevPlugins() {
  const navigationRef = useNavigationContainerRef();
  // oxlint-disable-next-line typescript/no-explicit-any -- devtools ref type mismatch
  useReactNavigationDevTools(navigationRef as any);
  useMMKVDevTools({ storage: appStorage });
  useReactQueryDevTools(queryClient);
  return null;
}
