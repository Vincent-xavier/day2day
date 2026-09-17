import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { appModules } from '@/modules/registry';
import { Screen, styles } from '@/design-system';

export default function ModulesScreen() {
  const router = useRouter();
  return (
    <Screen><ScrollView contentContainerStyle={{ paddingTop: 28, paddingBottom: 30 }}>
      <Text style={styles.eyebrow}>YOUR TOOLKIT</Text>
      <Text style={styles.title}>Everything in its place.</Text>
      <Text style={styles.subtitle}>Small, focused spaces for the parts of life you want to manage.</Text>

      {appModules.map((module) => (
        <Pressable key={module.id} onPress={() => router.push(module.route)} style={({ pressed }) => [styles.card, { borderColor: `${module.color}88`, backgroundColor: '#151827' }, pressed && { opacity: 0.75 }]}>
          <View>
            <View style={styles.listHeader}>
              <View style={{ flex: 1 }}><Text style={{ color: module.color, fontSize: 26 }}>{module.icon}</Text><Text style={[styles.heading, { marginTop: 10 }]}>{module.title}</Text></View>
              <Text style={{ color: '#8d91a7', fontSize: 24 }}>›</Text>
            </View>
            <Text style={[styles.muted, { marginTop: 7 }]}>{module.description}</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView></Screen>
  );
}
