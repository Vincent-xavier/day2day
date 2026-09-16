import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text } from 'react-native';
import { useCreateAccount } from '@/db/hooks';
import { Button, Field, Screen, styles } from '@/design-system';

export default function NewAccountScreen() {
  const router = useRouter(); const create = useCreateAccount();
  const [name, setName] = useState(''); const [balance, setBalance] = useState('0');
  const save = async () => {
    const parsed = Number(balance || 0);
    if (!name.trim()) return Alert.alert('Account name is required');
    if (!Number.isFinite(parsed)) return Alert.alert('Enter a valid balance');
    await create.mutateAsync({ name: name.trim(), type: 'cash', openingBalanceMinor: Math.round(parsed * 100) }); router.back();
  };
  return <Screen><ScrollView><Text style={styles.title}>New account</Text><Text style={styles.subtitle}>Add a wallet, bank account, or savings pot.</Text><Field label="Account name" value={name} onChangeText={setName} placeholder="Main wallet" /><Field label="Opening balance" value={balance} onChangeText={setBalance} keyboardType="decimal-pad" placeholder="0.00" /><Button title={create.isPending ? 'Saving...' : 'Save account'} onPress={save} /></ScrollView></Screen>;
}
