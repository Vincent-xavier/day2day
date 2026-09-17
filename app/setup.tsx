import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Button, Field, Screen, styles } from '@/design-system';

export default function SetupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [profile, setProfile] = useState<'personal' | 'business' | 'both'>('personal');
  const finish = async () => {
    if (!name.trim()) return;
    await SecureStore.setItemAsync('day2day_profile', JSON.stringify({ name: name.trim(), profile }));
    router.replace('/setup/account');
  };
  return <Screen><ScrollView contentContainerStyle={{ paddingTop: 30, paddingBottom: 30 }}><Text style={styles.eyebrow}>FIRST STEP</Text><Text style={styles.title}>Let’s make this yours.</Text><Text style={styles.subtitle}>Just the basics for now. You can change these anytime.</Text><Field label="What should we call you?" value={name} onChangeText={setName} placeholder="Your first name" autoFocus /><Text style={styles.label}>How will you use Day2Day?</Text><View style={styles.row}>{(['personal', 'business', 'both'] as const).map((item) => <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: profile === item }} key={item} style={[styles.choice, profile === item && styles.choiceActive]} onPress={() => setProfile(item)}><Text style={styles.choiceText}>{item === 'both' ? 'Both' : item[0].toUpperCase() + item.slice(1)}</Text></TouchableOpacity>)}</View><Button title="Continue" onPress={finish} disabled={!name.trim()} /><Button title="Skip for now" variant="ghost" onPress={() => router.replace('/dashboard')} /></ScrollView></Screen>;
}
