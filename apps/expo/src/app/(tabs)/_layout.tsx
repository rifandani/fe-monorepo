import Feather from '@expo/vector-icons/Feather'
import { Tabs } from 'expo-router'
import { useTranslation } from 'react-i18next'

export const unstable_settings = {
  // Ensure any route can link back to `/`
  initialRouteName: 'index',
}

export default function TabsLayout() {
  const { t } = useTranslation()

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          // use href null to hide tab bar
          // href: null,
          title: t('home.home'),
          tabBarIcon: ({ color }) => <Feather testID="home-tab-icon" name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('user.profile'),
          tabBarIcon: ({ color }) => <Feather testID="profile-tab-icon" name="user" size={24} color={color} />,
        }}
      />
    </Tabs>
  )
}
