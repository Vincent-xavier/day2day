import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text } from 'react-native';
import { useCreateAccount } from '@/db/hooks';
import { BackButton, Button, Field, Screen, styles } from '@/design-system';
import { parseMoneyMinor } from '@/utils/money';

export default function NewAccountScreen() {
  const router = useRouter(); const create = useCreateAccount();
  const [name, setName] = useState(''); const [balance, setBalance] = useState('0');
  const save = async () => {
    if (!name.trim()) return Alert.alert('Account name is required');
    // Opening balance may legitimately be zero for a brand-new account.
    const trimmedBalance = balance.trim();
    let openingBalanceMinor = 0;
    if (trimmedBalance && trimmedBalance !== '0') {
      const parsed = parseMoneyMinor(trimmedBalance);
      if (!parsed.ok) return Alert.alert('Check the opening balance', parsed.error);
      openingBalanceMinor = parsed.minor;
    }
    try {
      await create.mutateAsync({ name: name.trim(), type: 'cash', openingBalanceMinor });
      router.back();
    } catch (error) {
      Alert.alert('Could not save account', error instanceof Error ? error.message : 'Please try again.');
    }
  };
  return <Screen><ScrollView contentContainerStyle={{ paddingTop: 8, paddingBottom: 30 }}><BackButton onPress={() => router.back()} /><Text style={styles.title}>New account</Text><Text style={styles.subtitle}>Add a wallet, bank account, or savings pot.</Text><Field label="Account name" value={name} onChangeText={setName} placeholder="Main wallet" /><Field label="Opening balance" value={balance} onChangeText={setBalance} keyboardType="decimal-pad" placeholder="0.00" /><Button title={create.isPending ? 'Saving...' : 'Save account'} onPress={save} disabled={create.isPending} /></ScrollView></Screen>;
}
