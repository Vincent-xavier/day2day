import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useAccounts, useGoals, useLendingItems, useTasks, useTransactions } from '@/db/hooks';
import { ActionSheet, Card, Button, Screen, styles } from '@/design-system';

const money = (minor: number) => `$${(minor / 100).toFixed(2)}`;
export default function DashboardScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [actionsOpen, setActionsOpen] = useState(false);
  useEffect(() => { SecureStore.getItemAsync('day2day_profile').then((value) => { if (value) setName(JSON.parse(value).name ?? ''); }); }, []);
  const { data: accounts = [] } = useAccounts(); const { data: transactions = [] } = useTransactions(); const { data: lending = [] } = useLendingItems(); const { data: goals = [] } = useGoals(); const { data: tasks = [] } = useTasks();
  const balance = accounts.reduce((sum, account) => sum + account.openingBalanceMinor, 0) + transactions.reduce((sum, item) => sum + (item.type === 'income' ? item.amountMinor : item.type === 'expense' ? -item.amountMinor : 0), 0);
  const activeLending = lending.filter((item) => item.status === 'active').length; const openTasks = tasks.filter((task) => !task.completed).length; const activeGoals = goals.filter((goal) => goal.status === 'active').length;
  return <Screen><ScrollView contentContainerStyle={{ paddingTop: 24, paddingBottom: 30 }}><Text style={styles.eyebrow}>DAY2DAY  /  TODAY</Text><Text style={styles.title}>Good to see you{name ? `, ${name}` : ''}.</Text><Text style={styles.subtitle}>Here’s your calm view of what matters today.</Text><Card><Text style={styles.muted}>Total balance</Text><Text style={styles.metric}>{money(balance)}</Text><Text style={[styles.muted, { marginTop: 8 }]}>Across {accounts.length || 'no'} account{accounts.length === 1 ? '' : 's'}</Text></Card><View style={styles.row}><Card style={styles.stat}><Text style={styles.muted}>Transactions</Text><Text style={styles.statValue}>{transactions.length}</Text></Card><Card style={styles.stat}><Text style={styles.muted}>Open ledgers</Text><Text style={styles.statValue}>{activeLending}</Text></Card></View><View style={styles.row}><Card style={styles.stat}><Text style={styles.muted}>Active goals</Text><Text style={styles.statValue}>{activeGoals}</Text></Card><Card style={styles.stat}><Text style={styles.muted}>Open tasks</Text><Text style={styles.statValue}>{openTasks}</Text></Card></View><Text style={styles.heading}>What would you like to do?</Text><Button title="Add transaction" onPress={() => router.push('/transactions/new')} /><Button title="Create a goal" variant="secondary" onPress={() => router.push('/goals/new')} /><Button title="Add a task" variant="secondary" onPress={() => router.push('/tasks/new')} /><Button title="More actions" variant="ghost" onPress={() => setActionsOpen(true)} /></ScrollView><ActionSheet visible={actionsOpen} title="More actions" message="Jump to another part of your space." onClose={() => setActionsOpen(false)} options={[{ label: 'Explore all modules', description: 'Accounts, ledgers, goals, and tasks', onPress: () => router.push('/modules') }, { label: 'View transactions', description: 'Review recent money movement', onPress: () => router.push('/transactions') }, { label: 'Manage accounts', description: 'Add or review your wallets', onPress: () => router.push('/accounts') }]} /></Screen>;
}
