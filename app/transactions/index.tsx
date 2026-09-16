import { Link } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useAccounts, useTransactions } from '@/db/hooks';
import { Card, Button, Screen, styles } from '@/design-system';

const money = (minor: number) => `$${(minor / 100).toFixed(2)}`;
export default function TransactionsScreen() {
  const { data: accounts = [] } = useAccounts(); const { data: transactions = [], isLoading } = useTransactions();
  const accountName = (id: string) => accounts.find((account) => account.id === id)?.name ?? 'Account';
  return <Screen><ScrollView><Text style={styles.title}>Transactions</Text><Text style={styles.subtitle}>Income and expenses saved on this device.</Text><Link href="/transactions/new" asChild><View><Button title="Add transaction" /></View></Link>{isLoading ? <Text style={styles.muted}>Loading...</Text> : transactions.length === 0 ? <Card><Text style={styles.heading}>No transactions yet</Text><Text style={styles.muted}>Add your first income or expense.</Text></Card> : transactions.map((item) => <Card key={item.id}><Text style={styles.heading}>{item.description || item.type}</Text><Text style={styles.muted}>{accountName(item.accountId)} · {new Date(item.transactionDate).toLocaleDateString()}</Text><Text style={{ color: item.type === 'expense' ? '#fda4af' : '#86efac', fontSize: 20, fontWeight: '700', marginTop: 8 }}>{item.type === 'expense' ? '-' : '+'}{money(item.amountMinor)}</Text></Card>)}</ScrollView></Screen>;
}
