import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Button, Card, Screen, styles } from '@/design-system';

const pages = [
  { eyebrow: 'ONE CALM SPACE', title: 'See what matters today.', text: 'Day2Day brings your money, people, plans, and next actions into one gentle overview.', graphic: 'overview' },
  { eyebrow: 'PRIVATE BY DEFAULT', title: 'Your life stays yours.', text: 'Your first setup is local-first. No account, feed, or complicated sync is needed to get started.', graphic: 'private' },
  { eyebrow: 'START SMALL', title: 'Make the next thing easy.', text: 'Add one account, one task, or one ledger entry. You can build your space as life happens.', graphic: 'start' },
];

function OnboardingGraphic({ type }: { type: string }) {
  if (type === 'private') return <LinearGradient colors={['#1e3a4e', '#211d42']} style={graphicStyles.canvas}><Text style={{ color: '#a9e9d0', fontSize: 58 }}>◌</Text><View style={graphicStyles.orbit}><Text style={{ color: '#b8b1ff', fontSize: 28 }}>◎</Text></View><Text style={graphicStyles.graphicLabel}>PRIVATE</Text></LinearGradient>;
  if (type === 'start') return <LinearGradient colors={['#3b2d3d', '#211d42']} style={graphicStyles.canvas}><View style={graphicStyles.stack}><View style={[graphicStyles.stackCard, { transform: [{ rotate: '-6deg' }], backgroundColor: '#f2b97f' }]} /><View style={[graphicStyles.stackCard, { transform: [{ rotate: '5deg' }], backgroundColor: '#8b7dff' }]} /><View style={[graphicStyles.stackCard, { backgroundColor: '#72dfad' }]}><Text style={{ color: '#10121d', fontSize: 28, fontWeight: '800' }}>✓</Text></View></View><Text style={{ color: '#fff', fontSize: 30 }}>→</Text><Text style={graphicStyles.graphicLabel}>ONE STEP AT A TIME</Text></LinearGradient>;
  return <LinearGradient colors={['#332c5e', '#211d42']} style={graphicStyles.canvas}><View style={graphicStyles.glow}><Text style={{ color: '#f2b97f', fontSize: 34 }}>✦</Text></View><View style={graphicStyles.dashboardCard}><View style={graphicStyles.dashboardTop}><Text style={{ color: '#b8b1ff', fontSize: 20 }}>◈</Text><Text style={graphicStyles.dashboardText}>Today</Text></View><Text style={graphicStyles.dashboardAmount}>$2,480</Text><View style={graphicStyles.dashboardLine}><View /><View /></View></View><Text style={graphicStyles.graphicLabel}>YOUR EVERYDAY, TOGETHER</Text></LinearGradient>;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const current = pages[page];
  const finish = async () => { await SecureStore.setItemAsync('day2day_onboarding_complete', 'true'); router.replace('/setup'); };
  return <Screen><View style={{ flex: 1 }}><ScrollView contentContainerStyle={{ paddingTop: 32, paddingBottom: 24 }}><Text style={styles.eyebrow}>DAY2DAY</Text><View style={{ minHeight: 450, justifyContent: 'center' }}><OnboardingGraphic type={current.graphic} /><Text style={[styles.eyebrow, { marginTop: 26 }]}>{current.eyebrow}</Text><Text style={styles.title}>{current.title}</Text><Text style={styles.subtitle}>{current.text}</Text><Card style={{ marginTop: 8, backgroundColor: '#211d42', borderColor: '#403b70' }}><Text style={styles.heading}>A little less noise. A lot more clarity.</Text><Text style={[styles.muted, { marginTop: 8 }]}>Designed for your everyday rhythm.</Text></Card></View></ScrollView><View style={{ borderTopWidth: 1, borderTopColor: '#23273b', paddingTop: 14, paddingBottom: 8 }}><View style={[styles.row, { marginBottom: 6 }]}>{pages.map((item, index) => <Pressable key={item.eyebrow} accessibilityRole="button" accessibilityLabel={`Go to introduction step ${index + 1}`} onPress={() => setPage(index)} style={{ flex: 1, height: 5, borderRadius: 5, backgroundColor: index === page ? '#9e94ff' : '#303650' }} />)}</View>{page < pages.length - 1 ? <Button title="Continue" onPress={() => setPage(page + 1)} /> : <Button title="Set up my space" onPress={finish} />}<Button title="Skip introduction" variant="ghost" onPress={finish} /></View></View></Screen>;
}

const graphicStyles = {
  canvas: { height: 250, borderRadius: 30, padding: 24, alignItems: 'center' as const, justifyContent: 'center' as const, overflow: 'hidden' as const, borderWidth: 1, borderColor: '#403b70' },
  orbit: { position: 'absolute' as const, top: 44, right: 44, width: 58, height: 58, borderRadius: 29, borderWidth: 1, borderColor: '#8b7dff', alignItems: 'center' as const, justifyContent: 'center' as const },
  graphicLabel: { position: 'absolute' as const, bottom: 18, color: '#aeb2c7', fontSize: 10, fontWeight: '800' as const, letterSpacing: 2 },
  stack: { width: 130, height: 100, marginBottom: 18, position: 'relative' as const },
  stackCard: { position: 'absolute' as const, width: 110, height: 70, left: 10, top: 15, borderRadius: 16, alignItems: 'center' as const, justifyContent: 'center' as const },
  glow: { width: 78, height: 78, borderRadius: 39, backgroundColor: '#f2b97f22', alignItems: 'center' as const, justifyContent: 'center' as const, marginBottom: 16 },
  dashboardCard: { width: 210, padding: 18, borderRadius: 18, backgroundColor: '#151827', borderWidth: 1, borderColor: '#4b447e' },
  dashboardTop: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8 },
  dashboardText: { color: '#aeb2c7', fontSize: 13, fontWeight: '700' as const },
  dashboardAmount: { color: '#f7f7fb', fontSize: 30, fontWeight: '800' as const, marginTop: 12 },
  dashboardLine: { flexDirection: 'row' as const, gap: 8, marginTop: 18 },
};
