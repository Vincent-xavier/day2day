import { Link } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useAccounts } from '@/db/hooks';
import { Card, Button, Screen, styles } from '@/design-system';

export default function AccountsScreen() { const { data = [], isLoading } = useAccounts(); const total = data.reduce((sum, account) => sum + account.openingBalanceMinor, 0); return <Screen><ScrollView><Text style={styles.title}>Accounts</Text><Text style={styles.subtitle}>Local-first balances and transactions.</Text><Card><Text style={styles.muted}>Total balance</Text><Text style={{ color: '#a5b4fc', fontSize: 36, fontWeight: '800', marginTop: 6 }}>${(total / 100).toFixed(2)}</Text></Card>{isLoading ? <Text style={styles.muted}>Loading...</Text> : data.map((account) => <Card key={account.id}><Text style={styles.heading}>{account.name}</Text><Text style={styles.muted}>{account.type} · ${(account.openingBalanceMinor / 100).toFixed(2)}</Text></Card>)}<Link href="/accounts/new" asChild><View><Button title="Add account" /></View></Link></ScrollView></Screen>; }
