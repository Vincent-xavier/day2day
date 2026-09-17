import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { Card, Button, Screen, styles } from '@/design-system';
export default function HomeScreen() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  useEffect(() => { SecureStore.getItemAsync('day2day_onboarding_complete').then((complete) => { if (!complete) router.replace('/onboarding'); }).finally(() => setChecking(false)); }, [router]);
  if (checking) return <Screen><View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator color="#9e94ff" /></View></Screen>;
  return <Screen><ScrollView contentContainerStyle={{ paddingTop: 28, paddingBottom: 30 }}><Text style={styles.eyebrow}>DAY2DAY  /  YOUR LIFE, SIMPLIFIED</Text><Text style={styles.title}>A calmer way to stay on top of life.</Text><Text style={styles.subtitle}>Money, people, plans, and the next small step — all in one thoughtful space.</Text><Card style={{ backgroundColor: '#211d42', borderColor: '#403b70', paddingVertical: 24 }}><Text style={styles.eyebrow}>TODAY'S SPACE</Text><Text style={styles.heading}>Make the next thing easy.</Text><Text style={[styles.muted, { marginTop: 8 }]}>Start with a quick overview, then add only what matters.</Text><Button title="Open my dashboard" onPress={() => router.push('/dashboard')} /></Card><Button title="Explore modules" variant="secondary" onPress={() => router.push('/modules')} /><View style={{ marginTop: 24 }}><Text style={styles.heading}>Built for real life</Text><Text style={[styles.muted, { marginTop: 6 }]}>Private by default. Simple enough to use every day.</Text></View><View style={[styles.row, { marginTop: 16 }]}><Card style={styles.stat}><Text style={{ fontSize: 24 }}>✦</Text><Text style={[styles.heading, { fontSize: 16, marginTop: 10 }]}>Clear</Text><Text style={[styles.muted, { fontSize: 13, marginTop: 4 }]}>See what needs attention.</Text></Card><Card style={styles.stat}><Text style={{ fontSize: 24 }}>◌</Text><Text style={[styles.heading, { fontSize: 16, marginTop: 10 }]}>Local</Text><Text style={[styles.muted, { fontSize: 13, marginTop: 4 }]}>Your data stays on device.</Text></Card></View></ScrollView></Screen>;
}
