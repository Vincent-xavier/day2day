import { useRouter, type Href } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useAccounts, useLendingItems, useTasks, useTransactions } from '@/db/hooks';
import { BottomBar, Button, Card, ErrorState, IconButton, LoadingState, Screen, styles } from '@/design-system';
import { formatMoney as money } from '@/utils/money';

export default function DashboardScreen() {
  const router = useRouter();
  const [name, setName] = useState('');

  useEffect(() => {
    SecureStore.getItemAsync('day2day_profile')
      .then((value) => {
        if (!value) return;
        try {
          const parsed = JSON.parse(value) as { name?: string };
          setName(parsed.name ?? '');
        } catch {
          // Corrupted profile blob: fall back to the generic greeting rather than crash.
        }
      })
      .catch(() => undefined);
  }, []);

  const { data: accounts = [], isLoading: accountsLoading, isError: accountsError, refetch: refetchAccounts } = useAccounts();
  const { data: transactions = [], isLoading: transactionsLoading, isError: transactionsError, refetch: refetchTransactions } = useTransactions();
  const { data: lending = [], isLoading: lendingLoading, isError: lendingError, refetch: refetchLending } = useLendingItems();
  const { data: tasks = [], isLoading: tasksLoading, isError: tasksError, refetch: refetchTasks } = useTasks();

  const loading = accountsLoading || transactionsLoading || lendingLoading || tasksLoading;
  const hasError = accountsError || transactionsError || lendingError || tasksError;
  const retryAll = () => { refetchAccounts(); refetchTransactions(); refetchLending(); refetchTasks(); };

  const balance = accounts.reduce((sum, account) => sum + account.openingBalanceMinor, 0) + transactions.reduce((sum, item) => sum + (item.type === 'income' ? item.amountMinor : item.type === 'expense' ? -item.amountMinor : 0), 0);
  const activeLending = lending.filter((item) => item.status === 'active').length;
  const openTasks = tasks.filter((task) => !task.completed).length;
  const today = new Date().toISOString().slice(0, 10);
  const reminders = lending.filter((item) => (item.status === 'active' || item.status === 'overdue') && item.dueAt && item.dueAt <= today);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // One next action, chosen by what matters most right now. Everything else on the
  // screen supports this decision instead of competing with it.
  const nextAction = useMemo(() => {
    if (accounts.length === 0) {
      return { eyebrow: 'GET STARTED', headline: 'Add your first account', detail: 'This is the only step left before Day2Day can show your real balance.', cta: 'Add account', route: '/accounts/new' as Href };
    }
    if (reminders.length > 0) {
      const item = reminders[0];
      return { eyebrow: reminders.length > 1 ? `${reminders.length} BALANCES NEED YOU` : 'NEEDS YOU TODAY', headline: `Follow up with ${item.personName}`, detail: `${item.name} · ${item.dueAt === today ? 'due today' : `was due ${item.dueAt}`}`, cta: 'Open ledger', route: '/lending' as Href };
    }
    if (transactions.length === 0) {
      return { eyebrow: 'GET STARTED', headline: 'Log your first transaction', detail: 'A single entry is enough to start seeing your real balance move.', cta: 'Add transaction', route: '/transactions/new' as Href };
    }
    if (openTasks > 0) {
      return { eyebrow: 'NEXT STEP', headline: `Finish ${openTasks} open task${openTasks === 1 ? '' : 's'}`, detail: 'Small, specific actions keep today moving.', cta: 'Open tasks', route: '/tasks' as Href };
    }
    return { eyebrow: 'ALL CLEAR', headline: 'Nothing needs you right now', detail: 'Add a transaction whenever money moves.', cta: 'Add transaction', route: '/transactions/new' as Href };
  }, [accounts.length, openTasks, reminders, today, transactions.length]);

  const navigate = (destination: 'home' | 'money' | 'lending' | 'tasks' | 'settings') => {
    if (destination === 'home') return;
    if (destination === 'settings') return router.push('/settings' as unknown as Href);
    if (destination === 'money') return router.push('/transactions');
    router.push(`/${destination}`);
  };

  return <Screen><ScrollView contentContainerStyle={{ paddingTop: 18, paddingBottom: 18 }}>
    <View style={styles.listHeader}>
      <View>
        <Text style={styles.eyebrow}>DAY2DAY</Text>
        <Text style={styles.headerTitle}>{greeting}{name ? `, ${name}` : ''}</Text>
      </View>
      <IconButton label="Open settings" icon="⚙" onPress={() => router.push('/settings' as unknown as Href)} />
    </View>

    {hasError ? <ErrorState message="Your accounts, transactions, ledgers, or tasks couldn't load." onRetry={retryAll} /> : loading ? <LoadingState label="Getting your space ready..." /> : <>
      <Card style={{ backgroundColor: '#211d42', borderColor: '#403b70', padding: 22 }}>
        <Text style={styles.eyebrow}>{nextAction.eyebrow}</Text>
        <Text style={styles.title}>{nextAction.headline}</Text>
        <Text style={[styles.muted, { marginBottom: 6 }]}>{nextAction.detail}</Text>
        <Button title={nextAction.cta} onPress={() => router.push(nextAction.route)} />
      </Card>

      <Card>
        <Text style={styles.muted}>Your balance</Text>
        <Text style={styles.metric}>{money(balance)}</Text>
        <Text style={[styles.muted, { marginTop: 6 }]}>Across {accounts.length || 'no'} account{accounts.length === 1 ? '' : 's'}</Text>
      </Card>

      <View style={styles.row}>
        <Card style={styles.stat}><Text style={styles.muted}>Open ledgers</Text><Text style={styles.statValue}>{activeLending}</Text></Card>
        <Card style={styles.stat}><Text style={styles.muted}>Open tasks</Text><Text style={styles.statValue}>{openTasks}</Text></Card>
      </View>
    </>}
  </ScrollView>

  <BottomBar active="home" onNavigate={(tab) => navigate(tab)} />
  </Screen>;
}

