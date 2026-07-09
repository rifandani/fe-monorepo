/* oxlint-disable eslint/func-style sonarjs/variable-name -- function declarations; expo-router unstable_settings export */
import Feather from "@expo/vector-icons/Feather";
import { Tabs } from "expo-router";

import { useTranslation } from "@/core/providers/i18n/context";

export const unstable_settings = {
  // Ensure any route can link back to `/`
  initialRouteName: "index",
};

function HomeTabIcon({ color }: { color: string }) {
  return <Feather testID="home-tab-icon" name="home" size={24} color={color} />;
}

function ProfileTabIcon({ color }: { color: string }) {
  return (
    <Feather testID="profile-tab-icon" name="user" size={24} color={color} />
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          // use href null to hide tab bar
          // href: null,
          title: t("title"),
          tabBarIcon: HomeTabIcon,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ProfileTabIcon,
          title: t("profile"),
        }}
      />
    </Tabs>
  );
}
