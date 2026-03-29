import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Go'>;

export default function GoScreen({ navigation }: Props) {
  useEffect(() => {
    const id = setTimeout(() => navigation.navigate('Recreate'), 500);
    return () => clearTimeout(id);
  }, [navigation]);

  return (
    <View style={s.container}>
      <Text style={s.text}>go</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1f0d',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingTop: 80,
    paddingRight: 40,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 80,
    fontWeight: '900',
    letterSpacing: -2,
  },
});
