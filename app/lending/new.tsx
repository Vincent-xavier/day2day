import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useCreateLending } from '@/db/hooks';
import { BackButton, Button, Card, Field, Screen, styles } from '@/design-system';

type Direction = 'lent' | 'borrowed';

const parseAmount = (value: string) => {
  const normalized = value.replace(/[$,\s]/g, '');
  if (!normalized) return undefined;
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed * 100) : null;
};

const isValidDate = (value: string) => {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
};

export default function NewLendingScreen() {
  const router = useRouter();
  const create = useCreateLending();
  const [name, setName] = useState('');
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [description, setDescription] = useState('');
  const [direction, setDirection] = useState<Direction>('lent');

  const save = async () => {
    const cleanName = name.trim();
    const cleanPerson = personName.trim();
    const cleanDueAt = dueAt.trim();
    const amountMinor = parseAmount(amount);
    if (!cleanPerson) return Alert.alert('Person required', 'Add the person connected to this balance.');
    if (!cleanName) return Alert.alert('Purpose required', 'Add what this balance is for.');
    if (cleanPerson.length > 120 || cleanName.length > 120) return Alert.alert('Entry is too long', 'Use 120 characters or fewer for the person and purpose.');
    if (amountMinor === null) return Alert.alert('Invalid amount', 'Enter a positive amount with up to two decimal places.');
    if (!isValidDate(cleanDueAt)) return Alert.alert('Invalid due date', 'Use a real date in YYYY-MM-DD format.');
    try {
      await create.mutateAsync({ name: cleanName, personName: cleanPerson, direction, amountMinor, dueAt: cleanDueAt || undefined, description: description.trim() || undefined });
      router.back();
    } catch (error) {
      Alert.alert('Could not save ledger entry', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return <Screen><ScrollView contentContainerStyle={{ paddingTop: 8, paddingBottom: 30 }}><BackButton onPress={() => router.back()} /><Text style={styles.eyebrow}>NEW LEDGER ENTRY</Text><Text style={styles.title}>Record a balance</Text><Text style={styles.subtitle}>Track money or an item clearly. You can leave the amount blank and add it later.</Text><Text style={styles.label}>Direction</Text><View style={styles.row}>{(['lent', 'borrowed'] as const).map((item) => <TouchableOpacity key={item} accessibilityRole="button" accessibilityLabel={item === 'lent' ? 'You give' : 'You get'} accessibilityState={{ selected: direction === item }} style={[styles.choice, direction === item && styles.choiceActive]} onPress={() => setDirection(item)}><Text style={styles.choiceText}>{item === 'lent' ? 'You give' : 'You get'}</Text><Text style={{ color: direction === item ? '#fff' : '#969bb2', fontSize: 11, marginTop: 4 }}>{item === 'lent' ? 'They owe you' : 'You owe them'}</Text></TouchableOpacity>)}</View><Field label="Person" value={personName} onChangeText={setPersonName} placeholder="Alex" autoCapitalize="words" maxLength={120} /><Field label="What is it for?" value={name} onChangeText={setName} placeholder="Dinner, cash, or item" maxLength={120} /><Field label="Amount (optional)" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0.00" maxLength={15} /><Field label="Due date (optional)" value={dueAt} onChangeText={setDueAt} placeholder="YYYY-MM-DD" maxLength={10} autoCapitalize="none" /><Field label="Notes (optional)" value={description} onChangeText={setDescription} placeholder="Add useful context" multiline maxLength={500} /><Card style={{ marginTop: 4 }}><Text style={styles.muted}>{direction === 'lent' ? 'You give' : 'You get'} · {personName.trim() || 'Person'} · {amount.trim() || 'amount not set'}</Text></Card><Button title={create.isPending ? 'Saving...' : 'Save ledger entry'} onPress={save} disabled={create.isPending} /><Button title="Cancel" variant="ghost" onPress={() => router.back()} /></ScrollView></Screen>;
}
