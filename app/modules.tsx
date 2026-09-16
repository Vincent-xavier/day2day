import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { appModules } from '@/modules/registry';

export default function ModulesScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Modules</Text>
      <Text style={styles.subtitle}>Enable and explore the platform modules.</Text>

      {appModules.map((module) => (
        <Link key={module.id} href={module.route} asChild>
          <View style={[styles.card, { borderColor: module.color }]}>
            <View style={styles.headerRow}>
              <Text style={[styles.icon, { color: module.color }]}>{module.icon}</Text>
              <Text style={styles.cardTitle}>{module.title}</Text>
            </View>
            <Text style={styles.cardText}>{module.description}</Text>
          </View>
        </Link>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 24,
  },
  title: {
    color: '#f8fafc',
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 16,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 26,
    marginRight: 12,
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '700',
  },
  cardText: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
  },
});
