import Feather from '@expo/vector-icons/Feather'
import { Tabs } from 'expo-router'

export const unstable_settings = {
  // Ensure any route can link back to `/`
  initialRouteName: 'index',
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          // use href null to hide tab bar
          // href: null,
          title: 'Home',
          tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Feather name="user" size={24} color={color} />,
        }}
      />
    </Tabs>
  )
}
