import { Link } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useAccounts, useLendingItems, useTransactions } from '@/db/hooks';
import { Card, Button, Screen, styles } from '@/design-system';

const money = (minor: number) => `$${(minor / 100).toFixed(2)}`;
export default function DashboardScreen() {
  const { data: accounts = [] } = useAccounts(); const { data: transactions = [] } = useTransactions(); const { data: lending = [] } = useLendingItems();
  const balance = accounts.reduce((sum, account) => sum + account.openingBalanceMinor, 0) + transactions.reduce((sum, item) => sum + (item.type === 'income' ? item.amountMinor : item.type === 'expense' ? -item.amountMinor : 0), 0);
  const activeLending = lending.filter((item) => item.status === 'active').length;
  return <Screen><ScrollView><Text style={styles.eyebrow}>DAY2DAY</Text><Text style={styles.title}>Good to see you</Text><Text style={styles.subtitle}>One calm view of everything that matters today.</Text><Card><Text style={styles.muted}>Total balance</Text><Text style={styles.metric}>{money(balance)}</Text></Card><View style={styles.row}><Card style={styles.stat}><Text style={styles.muted}>Transactions</Text><Text style={styles.statValue}>{transactions.length}</Text></Card><Card style={styles.stat}><Text style={styles.muted}>Open lending</Text><Text style={styles.statValue}>{activeLending}</Text></Card></View><Text style={styles.heading}>Quick actions</Text><Link href="/transactions/new" asChild><View><Button title="Add transaction" /></View></Link><Link href="/lending/new" asChild><View><Button title="Add lending record" variant="secondary" /></View></Link><Link href="/modules" asChild><View><Button title="Explore modules" variant="secondary" /></View></Link></ScrollView></Screen>;
}
