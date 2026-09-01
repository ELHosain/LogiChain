import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Colors } from '../utils/theme';
import { useAuthStore } from '../store';
import GlassTabBar from './GlassTabBar';

import LoginScreen from '../screens/LoginScreen';
import EventsScreen from '../screens/EventsScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ItemsScreen from '../screens/ItemsScreen';
import AnomaliesScreen from '../screens/AnomaliesScreen';
import AlertsScreen from '../screens/AlertsScreen';
import ScanScreen from '../screens/ScanScreen';
import SyncScreen from '../screens/SyncScreen';

const Tab = createBottomTabNavigator();
const navTheme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: Colors.bg } };

function Tabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Items" component={ItemsScreen} />
      <Tab.Screen name="Anomalies" component={AnomaliesScreen} />
      <Tab.Screen name="Alerts" component={AlertsScreen} />
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="Sync" component={SyncScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated } = useAuthStore();
  return (
    <NavigationContainer theme={navTheme}>
      {isAuthenticated ? <Tabs /> : <LoginScreen />}
    </NavigationContainer>
  );
}
