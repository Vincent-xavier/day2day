import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text } from 'react-native';
import { useCreateAccount } from '@/db/hooks';
import { Button, Field, Screen, styles } from '@/design-system';

export default function AccountSetupScreen() {
  const router = useRouter();
  const create = useCreateAccount();
  const [accountName, setAccountName] = useState('');
  const [balance, setBalance] = useState('');
  const [saving, setSaving] = useState(false);
  const finish = async () => {
    if (!accountName.trim() && !balance.trim()) { router.replace('/dashboard'); return; }
    const parsed = Number(balance || 0);
    if (!accountName.trim()) return Alert.alert('Add an account name or skip setup');
    if (!Number.isFinite(parsed) || parsed < 0) return Alert.alert('Enter a valid opening balance');
    setSaving(true);
    try { await create.mutateAsync({ name: accountName.trim(), type: 'cash', openingBalanceMinor: Math.round(parsed * 100) }); router.replace('/dashboard'); } finally { setSaving(false); }
  };
  return <Screen><ScrollView contentContainerStyle={{ paddingTop: 30, paddingBottom: 30 }}><Text style={styles.eyebrow}>OPTIONAL NEXT STEP</Text><Text style={styles.title}>Add your first account.</Text><Text style={styles.subtitle}>A wallet, bank account, or savings pot. You can always do this later.</Text><Field label="Account name" value={accountName} onChangeText={setAccountName} placeholder="Main wallet" autoFocus /><Field label="Opening balance (optional)" value={balance} onChangeText={setBalance} keyboardType="decimal-pad" placeholder="0.00" /><Button title={saving ? 'Creating...' : 'Finish setup'} onPress={finish} /><Button title="I will do this later" variant="ghost" onPress={() => router.replace('/dashboard')} /></ScrollView></Screen>;
}
