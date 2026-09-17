import { useRouter, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { isThisWeek, isToday, isYesterday, format, startOfMonth, startOfDay, endOfDay, subDays, subMonths, endOfMonth } from 'date-fns';
import { Alert, Platform, Pressable, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAccounts, useRemoveTransaction, useTransactions } from '@/db/hooks';
import { BottomSheet, BottomBar, Card, Button, EmptyState, ErrorState, LoadingState, Screen, ScreenHeader, SearchBar, styles } from '@/design-system';
import { formatMoney as money } from '@/utils/money';
import type { Transaction, TransactionType } from '@/db/types';

type TypeFilter = 'all' | TransactionType;
type RangeFilter = 'all' | '7d' | 'month' | 'lastMonth' | 'custom';

const RANGE_LABELS: Record<RangeFilter, string> = { all: 'All time', '7d': 'Last 7 days', month: 'This month', lastMonth: 'Last month', custom: 'Custom range' };
const TYPE_LABELS: Record<TypeFilter, string> = { all: 'All types', income: 'Income', expense: 'Expenses', transfer: 'Transfers' };

const groupLabel = (dateValue: string) => {
  const date = new Date(dateValue);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (isThisWeek(date, { weekStartsOn: 1 })) return format(date, 'EEEE');
  return format(date, 'MMM d, yyyy');
};

const withinRange = (dateValue: string, range: RangeFilter, customFrom: Date | null, customTo: Date | null) => {
  if (range === 'all') return true;
  const date = new Date(dateValue);
  const now = new Date();
  if (range === '7d') return date >= startOfDay(subDays(now, 6));
  if (range === 'month') return date >= startOfMonth(now);
  if (range === 'custom') {
    if (customFrom && date < startOfDay(customFrom)) return false;
    if (customTo && date > endOfDay(customTo)) return false;
    return true;
  }
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));
  return date >= lastMonthStart && date <= lastMonthEnd;
};

export default function TransactionsScreen() {
  const router = useRouter();
  const { data: accounts = [] } = useAccounts();
  const { data: transactions = [], isLoading, isError, isRefetching, refetch } = useTransactions();
  const removeTransaction = useRemoveTransaction();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [accountFilter, setAccountFilter] = useState<'all' | string>('all');
  const [rangeFilter, setRangeFilter] = useState<RangeFilter>('all');
  const [customFrom, setCustomFrom] = useState<Date | null>(null);
  const [customTo, setCustomTo] = useState<Date | null>(null);
  const [activeCalendar, setActiveCalendar] = useState<'from' | 'to' | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const accountName = (id: string) => accounts.find((account) => account.id === id)?.name ?? 'Account';
  const activeFilterCount = (typeFilter !== 'all' ? 1 : 0) + (accountFilter !== 'all' ? 1 : 0) + (rangeFilter !== 'all' ? 1 : 0);

  const filtered = useMemo(() => transactions.filter((item) => {
    if (typeFilter !== 'all' && item.type !== typeFilter) return false;
    if (accountFilter !== 'all' && item.accountId !== accountFilter) return false;
    if (!withinRange(item.transactionDate, rangeFilter, customFrom, customTo)) return false;
    if (search.trim()) {
      const query = search.trim().toLowerCase();
      const haystack = `${item.description ?? ''} ${accountName(item.accountId)}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  }), [transactions, typeFilter, accountFilter, rangeFilter, customFrom, customTo, search, accounts]);

  const groups = useMemo(() => {
    const buckets = new Map<string, Transaction[]>();
    filtered.forEach((item) => {
      const label = groupLabel(item.transactionDate);
      if (!buckets.has(label)) buckets.set(label, []);
      buckets.get(label)!.push(item);
    });
    return Array.from(buckets.entries());
  }, [filtered]);

  const income = filtered.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amountMinor, 0);
  const expenses = filtered.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amountMinor, 0);
  const flowTotal = income + expenses;
  const incomeShare = flowTotal ? Math.round((income / flowTotal) * 100) : 0;

  const clearFilters = () => { setTypeFilter('all'); setAccountFilter('all'); setRangeFilter('all'); setCustomFrom(null); setCustomTo(null); };

  const confirmDelete = (item: Transaction) => {
    Alert.alert(
      'Delete this transaction?',
      `${item.description || item.type} · ${money(item.amountMinor)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => removeTransaction.mutate(item.id) },
      ],
    );
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 18 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor="#8b7dff" />}
      >
        <ScreenHeader eyebrow="MONEY" title="Transactions" subtitle="A simple record of money moving in and out." />
        <Button title="Add transaction" onPress={() => router.push('/transactions/new')} />

        {isError ? (
          <ErrorState message="Your transactions couldn't load." onRetry={() => refetch()} />
        ) : isLoading ? (
          <LoadingState label="Loading your transactions..." />
        ) : (
          <>
            <SearchBar value={search} onChangeText={setSearch} placeholder="Search description or account" />

            <Card>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.muted}>Income</Text>
                  <Text style={styles.success}>{money(income)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.muted}>Expenses</Text>
                  <Text style={styles.destructiveText}>{money(expenses)}</Text>
                </View>
                <View>
                  <Text style={styles.muted}>Net</Text>
                  <Text style={[styles.statValue, { fontSize: 20 }, income - expenses < 0 && styles.destructiveText]}>{money(income - expenses)}</Text>
                </View>
              </View>
              {flowTotal > 0 ? (
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${incomeShare}%`, backgroundColor: '#72dfad', borderRadius: 0 }]} />
                </View>
              ) : null}
            </Card>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <View style={{ flex: 1 }}>
                <Button
                  title={activeFilterCount ? `Filters · ${activeFilterCount} active` : 'Filter transactions'}
                  variant="secondary"
                  onPress={() => setFiltersOpen(true)}
                />
              </View>
              {activeFilterCount ? (
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Clear filters" onPress={clearFilters}>
                  <Text style={styles.linkText}>Clear</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {filtered.length === 0 ? (
              <EmptyState
                title={transactions.length ? 'No matching transactions' : 'No transactions yet'}
                message={transactions.length ? 'Try another filter or search term.' : 'Add your first income or expense.'}
                action={!transactions.length ? 'Add transaction' : undefined}
                onAction={!transactions.length ? () => router.push('/transactions/new') : undefined}
              />
            ) : (
              groups.map(([label, items]) => (
                <View key={label}>
                  <Text style={styles.sectionLabel}>{label.toUpperCase()}</Text>
                  {items.map((item) => (
                    <Pressable
                      key={item.id}
                      accessibilityRole="button"
                      accessibilityLabel={`${item.description || item.type}, ${money(item.amountMinor)}. Long press to delete.`}
                      onLongPress={() => confirmDelete(item)}
                      style={({ pressed }) => pressed && styles.pressed}
                    >
                      <Card>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <View style={{ flex: 1, paddingRight: 12 }}>
                            <Text style={styles.heading}>{item.description || item.type}</Text>
                            <Text style={styles.muted}>{accountName(item.accountId)} · {new Date(item.transactionDate).toLocaleDateString()}</Text>
                          </View>
                          <Text style={{ color: item.type === 'expense' ? '#fda4af' : item.type === 'transfer' ? '#969bb2' : '#72dfad', fontSize: 20, fontWeight: '800' }}>
                            {item.type === 'expense' ? '-' : item.type === 'transfer' ? '' : '+'}{money(item.amountMinor)}
                          </Text>
                        </View>
                      </Card>
                    </Pressable>
                  ))}
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>

      <BottomBar
        active="money"
        onNavigate={(tab) => {
          if (tab === 'home') router.push('/dashboard');
          if (tab === 'money') router.push('/transactions');
          if (tab === 'lending') router.push('/lending');
          if (tab === 'tasks') router.push('/tasks');
          if (tab === 'settings') router.push('/settings' as unknown as Href);
        }}
      />

      <BottomSheet visible={filtersOpen} title="Filter transactions" onClose={() => setFiltersOpen(false)}>
        <Text style={styles.label}>Type</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
          {(['all', 'income', 'expense', 'transfer'] as TypeFilter[]).map((option) => (
            <TouchableOpacity
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected: typeFilter === option }}
              onPress={() => setTypeFilter(option)}
              style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: typeFilter === option ? '#8b7dff' : '#303650', backgroundColor: typeFilter === option ? '#8b7dff' : 'transparent' }}
            >
              <Text style={{ color: typeFilter === option ? '#fff' : '#b8b1ff', fontSize: 12, fontWeight: '700' }}>{TYPE_LABELS[option]}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Date range</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {(['all', '7d', 'month', 'lastMonth', 'custom'] as RangeFilter[]).map((option) => (
            <TouchableOpacity
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected: rangeFilter === option }}
              onPress={() => setRangeFilter(option)}
              style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: rangeFilter === option ? '#8b7dff' : '#303650', backgroundColor: rangeFilter === option ? '#8b7dff' : 'transparent' }}
            >
              <Text style={{ color: rangeFilter === option ? '#fff' : '#b8b1ff', fontSize: 12, fontWeight: '700' }}>{RANGE_LABELS[option]}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {rangeFilter === 'custom' ? (
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 18 }}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Choose start date" onPress={() => setActiveCalendar('from')} style={{ flex: 1 }}>
              <Card style={{ paddingVertical: 12 }}>
                <Text style={styles.muted}>From</Text>
                <Text style={[styles.heading, { fontSize: 15, marginTop: 4 }]}>{customFrom ? format(customFrom, 'MMM d, yyyy') : 'Any'}</Text>
              </Card>
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Choose end date" onPress={() => setActiveCalendar('to')} style={{ flex: 1 }}>
              <Card style={{ paddingVertical: 12 }}>
                <Text style={styles.muted}>To</Text>
                <Text style={[styles.heading, { fontSize: 15, marginTop: 4 }]}>{customTo ? format(customTo, 'MMM d, yyyy') : 'Any'}</Text>
              </Card>
            </TouchableOpacity>
          </View>
        ) : null}

        {activeCalendar ? (
          <>
            <DateTimePicker
              value={(activeCalendar === 'from' ? customFrom : customTo) ?? new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
              maximumDate={new Date()}
              onChange={(event: DateTimePickerEvent, selected?: Date) => {
                if (Platform.OS === 'android') setActiveCalendar(null);
                if (event.type === 'dismissed' || !selected) return;
                if (activeCalendar === 'from') setCustomFrom(selected); else setCustomTo(selected);
              }}
            />
            {Platform.OS === 'ios' ? (
              <Button title="Done" variant="ghost" onPress={() => setActiveCalendar(null)} />
            ) : null}
          </>
        ) : null}

        {accounts.length > 1 ? (
          <>
            <Text style={styles.label}>Account</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={{ selected: accountFilter === 'all' }}
                onPress={() => setAccountFilter('all')}
                style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: accountFilter === 'all' ? '#8b7dff' : '#303650', backgroundColor: accountFilter === 'all' ? '#8b7dff' : 'transparent' }}
              >
                <Text style={{ color: accountFilter === 'all' ? '#fff' : '#b8b1ff', fontSize: 12, fontWeight: '700' }}>All accounts</Text>
              </TouchableOpacity>
              {accounts.map((account) => (
                <TouchableOpacity
                  key={account.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: accountFilter === account.id }}
                  onPress={() => setAccountFilter(account.id)}
                  style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: accountFilter === account.id ? '#8b7dff' : '#303650', backgroundColor: accountFilter === account.id ? '#8b7dff' : 'transparent' }}
                >
                  <Text style={{ color: accountFilter === account.id ? '#fff' : '#b8b1ff', fontSize: 12, fontWeight: '700' }}>{account.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : null}

        <Button title="Apply filters" onPress={() => setFiltersOpen(false)} />
      </BottomSheet>
    </Screen>
  );
}

