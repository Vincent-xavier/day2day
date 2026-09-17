import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text } from 'react-native';
import { useCreateGoal } from '@/db/hooks';
import { BackButton, Button, Field, Screen, styles } from '@/design-system';

export default function NewGoalScreen() {
  const router = useRouter();
  const create = useCreateGoal();
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const save = async () => {
    const parsed = Number(target);
    if (!name.trim()) return Alert.alert('Goal name is required');
    if (!Number.isFinite(parsed) || parsed <= 0) return Alert.alert('Enter a valid target');
    await create.mutateAsync({ name: name.trim(), targetMinor: Math.round(parsed * 100) });
    router.back();
  };
  return <Screen><ScrollView contentContainerStyle={{ paddingTop: 8, paddingBottom: 30 }}><BackButton onPress={() => router.back()} /><Text style={styles.title}>New goal</Text><Text style={styles.subtitle}>Set a target you can make progress toward.</Text><Field label="Goal name" value={name} onChangeText={setName} placeholder="Emergency fund" /><Field label="Target amount" value={target} onChangeText={setTarget} keyboardType="decimal-pad" placeholder="1000.00" /><Button title={create.isPending ? 'Saving...' : 'Save goal'} onPress={save} disabled={create.isPending} /></ScrollView></Screen>;
}
