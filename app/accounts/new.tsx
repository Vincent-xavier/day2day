import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { useCreateAccount } from '@/db/hooks';
import { Button, Field, Screen, styles } from '@/design-system';

export default function NewAccountScreen() { const router = useRouter(); const create = useCreateAccount(); const [name, setName] = useState(''); const [balance, setBalance] = useState('0'); const save = async () => { if (!name.trim()) return Alert.alert('Account name is required'); await create.mutateAsync({ name: name.trim(), type: 'cash', openingBalanceMinor: Math.round(Number(balance || 0) * 100) }); router.back(); }; return <Screen><ScrollView><styles.title /> <Field label="Account name" value={name} onChangeText={setName} placeholder="Main wallet" /><Field label="Opening balance" value={balance} onChangeText={setBalance} keyboardType="decimal-pad" placeholder="0.00" /><Button title={create.isPending ? 'Saving...' : 'Save account'} onPress={save} /></ScrollView></Screen>; }
