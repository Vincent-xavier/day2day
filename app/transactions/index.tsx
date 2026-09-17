import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { useAccounts, useTransactions } from '@/db/hooks';
import { BottomSheet, Card, Button, Screen, styles } from '@/design-system';

const money = (minor: number) => `$${(minor / 100).toFixed(2)}`;

export default function TransactionsScreen() {
  const router = useRouter();
  const { data: accounts = [] } = useAccounts();
  const { data: transactions = [], isLoading } = useTransactions();
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const accountName = (id: string) => accounts.find((account) => account.id === id)?.name ?? 'Account';
  const visible = useMemo(() => filter === 'all' ? transactions : transactions.filter((item) => item.type === filter), [filter, transactions]);

  return <Screen><ScrollView contentContainerStyle={{ paddingTop: 24, paddingBottom: 30 }}><Text style={styles.eyebrow}>MONEY</Text><Text style={styles.title}>Transactions</Text><Text style={styles.subtitle}>A simple record of money moving in and out.</Text><Button title="Add transaction" onPress={() => router.push('/transactions/new')} /><Button title={filter === 'all' ? 'Filter transactions' : `Showing ${filter}`} variant="secondary" onPress={() => setFiltersOpen(true)} />{isLoading ? <Text style={styles.muted}>Loading...</Text> : visible.length === 0 ? <Card><Text style={styles.heading}>{transactions.length ? 'No matching transactions' : 'No transactions yet'}</Text><Text style={styles.muted}>{transactions.length ? 'Try another filter.' : 'Add your first income or expense.'}</Text></Card> : visible.map((item) => <Card key={item.id}><Text style={styles.heading}>{item.description || item.type}</Text><Text style={styles.muted}>{accountName(item.accountId)} · {new Date(item.transactionDate).toLocaleDateString()}</Text><Text style={{ color: item.type === 'expense' ? '#fda4af' : '#72dfad', fontSize: 20, fontWeight: '800', marginTop: 8 }}>{item.type === 'expense' ? '-' : '+'}{money(item.amountMinor)}</Text></Card>)}</ScrollView><BottomSheet visible={filtersOpen} title="Filter transactions" onClose={() => setFiltersOpen(false)}><Text style={[styles.muted, { marginBottom: 12 }]}>Choose what you want to see.</Text><Button title="All transactions" variant={filter === 'all' ? 'primary' : 'secondary'} onPress={() => { setFilter('all'); setFiltersOpen(false); }} /><Button title="Income only" variant={filter === 'income' ? 'primary' : 'secondary'} onPress={() => { setFilter('income'); setFiltersOpen(false); }} /><Button title="Expenses only" variant={filter === 'expense' ? 'primary' : 'secondary'} onPress={() => { setFilter('expense'); setFiltersOpen(false); }} /></BottomSheet></Screen>;
}
