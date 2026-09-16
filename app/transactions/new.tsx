import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAccounts, useCreateTransaction } from '@/db/hooks';
import { Button, Card, Field, Screen, styles } from '@/design-system';

export default function NewTransactionScreen() {
  const router = useRouter(); const { data: accounts = [] } = useAccounts(); const create = useCreateTransaction();
  const [description, setDescription] = useState(''); const [amount, setAmount] = useState(''); const [type, setType] = useState<'income' | 'expense'>('expense'); const [accountIndex, setAccountIndex] = useState(0);
  const save = async () => { const parsed = Number(amount); if (!accounts.length) return Alert.alert('Create an account first'); if (!Number.isFinite(parsed) || parsed <= 0) return Alert.alert('Enter a valid amount'); await create.mutateAsync({ accountId: accounts[accountIndex].id, type, amountMinor: Math.round(parsed * 100), description: description.trim() || type }); router.back(); };
  return <Screen><ScrollView><Text style={styles.title}>New transaction</Text><Text style={styles.subtitle}>Record money moving in or out.</Text><View style={styles.row}><TouchableOpacity style={[styles.choice, type === 'expense' && styles.choiceActive]} onPress={() => setType('expense')}><Text style={styles.choiceText}>Expense</Text></TouchableOpacity><TouchableOpacity style={[styles.choice, type === 'income' && styles.choiceActive]} onPress={() => setType('income')}><Text style={styles.choiceText}>Income</Text></TouchableOpacity></View><Field label="Description" value={description} onChangeText={setDescription} placeholder="Groceries" /><Field label="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0.00" /><Text style={styles.label}>Account</Text>{accounts.length ? <Card><Text style={styles.heading}>{accounts[accountIndex]?.name}</Text><Button title="Choose next account" variant="secondary" onPress={() => setAccountIndex((accountIndex + 1) % accounts.length)} /></Card> : <Text style={styles.muted}>Create an account before adding transactions.</Text>}<Button title={create.isPending ? 'Saving...' : 'Save transaction'} onPress={save} /></ScrollView></Screen>;
}
