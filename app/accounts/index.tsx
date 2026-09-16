import { Link } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useAccounts, useTransactions } from '@/db/hooks';
import { Card, Button, Screen, styles } from '@/design-system';

const money = (minor: number) => `$${(minor / 100).toFixed(2)}`;
export default function AccountsScreen() {
  const { data: accounts = [], isLoading } = useAccounts(); const { data: transactions = [] } = useTransactions();
  const total = accounts.reduce((sum, account) => sum + account.openingBalanceMinor, 0) + transactions.reduce((sum, item) => sum + (item.type === 'income' ? item.amountMinor : item.type === 'expense' ? -item.amountMinor : 0), 0);
  return <Screen><ScrollView><Text style={styles.title}>Accounts</Text><Text style={styles.subtitle}>Your local-first financial picture.</Text><Card><Text style={styles.muted}>Estimated total balance</Text><Text style={styles.metric}>{money(total)}</Text></Card>{isLoading ? <Text style={styles.muted}>Loading...</Text> : accounts.map((account) => <Card key={account.id}><Text style={styles.heading}>{account.name}</Text><Text style={styles.muted}>{account.type} · opening {money(account.openingBalanceMinor)}</Text></Card>)}<Link href="/accounts/new" asChild><View><Button title="Add account" /></View></Link><Link href="/transactions" asChild><View><Button title="View transactions" variant="secondary" /></View></Link></ScrollView></Screen>;
}
