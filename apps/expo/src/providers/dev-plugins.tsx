import { useMMKVDevTools } from "@dev-plugins/react-native-mmkv";
import { useReactQueryDevTools } from "@dev-plugins/react-query";

import { appStorage } from "@/lib/layers/mmkv";
import { queryClient } from "@/providers/query/client";

export const DevPlugins = () => {
  useMMKVDevTools({ storage: appStorage });
  useReactQueryDevTools(queryClient);

  return null;
};
