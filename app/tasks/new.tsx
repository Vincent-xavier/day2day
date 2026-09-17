import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text } from 'react-native';
import { useCreateTask } from '@/db/hooks';
import { Button, Field, Screen, styles } from '@/design-system';

export default function NewTaskScreen() {
  const router = useRouter();
  const create = useCreateTask();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const save = async () => {
    if (!title.trim()) return Alert.alert('Task title is required');
    await create.mutateAsync({ title: title.trim(), notes: notes.trim() || undefined });
    router.back();
  };
  return <Screen><ScrollView><Text style={styles.title}>New task</Text><Text style={styles.subtitle}>Capture one clear next action.</Text><Field label="Task title" value={title} onChangeText={setTitle} placeholder="Review monthly spending" /><Field label="Notes (optional)" value={notes} onChangeText={setNotes} placeholder="Keep it small and specific" multiline /><Button title={create.isPending ? 'Saving...' : 'Save task'} onPress={save} /></ScrollView></Screen>;
}
