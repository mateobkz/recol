import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { navigationRef } from './navigationRef';
import HomeScreen from '../screens/HomeScreen';
import MultiplayerScreen from '../screens/MultiplayerScreen';
import MemorizeScreen from '../screens/MemorizeScreen';
import GoScreen from '../screens/GoScreen';
import RecreateScreen from '../screens/RecreateScreen';
import ResultsScreen from '../screens/ResultsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          animationDuration: 300,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Multiplayer" component={MultiplayerScreen} />
        <Stack.Screen name="Memorize" component={MemorizeScreen} />
        <Stack.Screen name="Go" component={GoScreen} />
        <Stack.Screen name="Recreate" component={RecreateScreen} />
        <Stack.Screen name="Results" component={ResultsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
