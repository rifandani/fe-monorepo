import Feather from "@expo/vector-icons/Feather";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";

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
          tabBarIcon: HomeTabIcon,
          title: t("home.home"),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ProfileTabIcon,
          title: t("user.profile"),
        }}
      />
    </Tabs>
  );
};
export default TabsLayout;
