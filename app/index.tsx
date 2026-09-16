import { Link } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { initializeDatabase } from '@/db/database';
import { appModules } from '@/modules/registry';

export default function HomeScreen() {
  useEffect(() => {
    initializeDatabase();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>Day2Day</Text>
      <Text style={styles.title}>Personal command center</Text>
      <Text style={styles.subtitle}>
        Modular life management for accounts, lending, goals, tasks and more.
      </Text>

      <View style={styles.grid}>
        {appModules.map((module) => (
          <Link key={module.id} href={module.route} asChild>
            <View style={[styles.moduleCard, { borderColor: module.color }]}>
              <Text style={[styles.moduleIcon, { color: module.color }]}>{module.icon}</Text>
              <Text style={styles.moduleTitle}>{module.title}</Text>
              <Text style={styles.moduleText}>{module.description}</Text>
            </View>
          </Link>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#0f172a',
  },
  eyebrow: {
    color: '#a5b4fc',
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#cbd5e1',
    marginBottom: 24,
    lineHeight: 24,
  },
  grid: {
    gap: 16,
  },
  moduleCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
  },
  moduleIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  moduleTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  moduleText: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
  },
});
