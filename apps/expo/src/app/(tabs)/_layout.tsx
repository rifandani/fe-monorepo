import Feather from "@expo/vector-icons/Feather";
import { Tabs } from "expo-router";

import { useTranslation } from "@/providers/i18n/context";

export const unstable_settings = {
  initialRouteName: "index",
};

const HomeTabIcon = ({ color }: { color: string }) => (
  <Feather testID="home-tab-icon" name="home" size={24} color={color} />
);

const ProfileTabIcon = ({ color }: { color: string }) => (
  <Feather testID="profile-tab-icon" name="user" size={24} color={color} />
);

const TabsLayout = () => {
  const { t } = useTranslation();

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
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
};

export default TabsLayout;
