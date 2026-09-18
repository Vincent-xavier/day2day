import { useRouter, type Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BarChart } from "react-native-gifted-charts";
import { useMemo, useState } from "react";
import {
  isThisWeek,
  isToday,
  isYesterday,
  format,
  endOfMonth,
  startOfMonth,
  subMonths,
} from "date-fns";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useAccounts, useRemoveTransaction, useTransactions } from "@/db/hooks";
import {
  BottomBar,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  ScreenHeader,
  styles,
  colors,
} from "@/design-system";
import { formatMoney as money } from "@/utils/money";
import type { Transaction, TransactionType } from "@/db/types";

const transactionColor = (type: TransactionType) => {
  if (type === "income") return colors.positive;
  if (type === "expense") return colors.negative;
  return colors.muted;
};

const transactionGlyph = (type: TransactionType) => {
  if (type === "income") return "↑";
  if (type === "expense") return "↓";
  return "↔";
};

const groupLabel = (dateValue: string) => {
  const date = new Date(dateValue);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  if (isThisWeek(date, { weekStartsOn: 1 })) return format(date, "EEEE");
  return format(date, "MMM d, yyyy");
};

const transactionDateLabel = (dateValue: string) => {
  const date = new Date(dateValue);
  const time = format(date, "h:mm a");
  if (isToday(date)) return `${time}`;
  if (isYesterday(date)) return `${time}`;
  return format(date, "MMM d, yyyy · h:mm a");
};

export default function TransactionsScreen() {
  const router = useRouter();
  const { data: accounts = [] } = useAccounts();
  const {
    data: transactions = [],
    isLoading,
    isError,
    isRefetching,
    refetch,
  } = useTransactions();
  const removeTransaction = useRemoveTransaction();
  const [balanceVisible, setBalanceVisible] = useState(true);

  const accountName = (id: string) =>
    accounts.find((account) => account.id === id)?.name ?? "Account";

  const filtered = transactions;

  const groups = useMemo(() => {
    const buckets = new Map<string, Transaction[]>();
    filtered.slice(0, 5).forEach((item) => {
      const label = groupLabel(item.transactionDate);
      if (!buckets.has(label)) buckets.set(label, []);
      buckets.get(label)!.push(item);
    });
    return Array.from(buckets.entries());
  }, [filtered]);

  const income = filtered
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amountMinor, 0);
  const expenses = filtered
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amountMinor, 0);
  const balance =
    accounts.reduce((sum, account) => sum + account.openingBalanceMinor, 0) +
    transactions.reduce(
      (sum, item) =>
        sum +
        (item.type === "income"
          ? item.amountMinor
          : item.type === "expense"
            ? -item.amountMinor
            : 0),
      0,
    );
  const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));
  const lastMonthBalance =
    accounts.reduce((sum, account) => sum + account.openingBalanceMinor, 0) +
    transactions.reduce((sum, item) => {
      if (new Date(item.transactionDate) > lastMonthEnd) return sum;
      return (
        sum +
        (item.type === "income"
          ? item.amountMinor
          : item.type === "expense"
            ? -item.amountMinor
            : 0)
      );
    }, 0);
  const balanceChangePercent =
    lastMonthBalance === 0
      ? balance === 0
        ? 0
        : 100
      : ((balance - lastMonthBalance) / Math.abs(lastMonthBalance)) * 100;
  const balanceChangeLabel = `${balanceChangePercent >= 0 ? "+" : ""}${balanceChangePercent.toFixed(1)}% from last month`;
  const monthlyCashflow = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, index) => {
      const month = startOfMonth(subMonths(new Date(), 5 - index));
      return {
        key: format(month, "yyyy-MM"),
        label: format(month, "MMM"),
        income: 0,
        expense: 0,
      };
    });
    const monthByKey = new Map(months.map((month) => [month.key, month]));
    transactions.forEach((item) => {
      const month = monthByKey.get(
        format(startOfMonth(new Date(item.transactionDate)), "yyyy-MM"),
      );
      if (!month) return;
      if (item.type === "income") month.income += item.amountMinor;
      if (item.type === "expense") month.expense += item.amountMinor;
    });
    return months;
  }, [transactions]);
  const chartData = useMemo(
    () =>
      monthlyCashflow.flatMap((month) => [
        {
          value: month.income,
          label: month.label,
          frontColor: colors.positive,
        },
        {
          value: month.expense,
          frontColor: colors.negative,
        },
      ]),
    [monthlyCashflow],
  );

  const confirmDelete = (item: Transaction) => {
    Alert.alert(
      "Delete this transaction?",
      `${item.description || item.type} · ${money(item.amountMinor)}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => removeTransaction.mutate(item.id),
        },
      ],
    );
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 104 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor={colors.accent}
          />
        }
      >
        <ScreenHeader
          eyebrow="MONEY / ACTIVITY"
          title="Transactions"
          subtitle="Your money, in motion."
        />

        {isError ? (
          <ErrorState
            message="Your transactions couldn't load."
            onRetry={() => refetch()}
          />
        ) : isLoading ? (
          <LoadingState label="Loading your transactions..." />
        ) : (
          <>
            <View style={{ paddingVertical: 8 }}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Text style={styles.eyebrow}>TOTAL BALANCE</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    balanceVisible ? "Hide balance" : "Show balance"
                  }
                  accessibilityState={{ selected: balanceVisible }}
                  onPress={() => setBalanceVisible((visible) => !visible)}
                  style={({ pressed }) => [
                    { padding: 4, marginBottom: 8 },
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name={balanceVisible ? "eye-outline" : "eye-off-outline"}
                    size={22}
                    color={colors.muted}
                  />
                </Pressable>
              </View>
              <Text style={styles.metric}>
                {balanceVisible ? money(balance) : "••••••"}
              </Text>
              <Text
                style={[
                  styles.muted,
                  {
                    marginTop: 4,
                    color:
                      balanceChangePercent >= 0
                        ? colors.positive
                        : colors.negative,
                  },
                ]}
              >
                {balanceChangeLabel}
              </Text>
              <View style={[styles.row, { marginTop: 18 }]}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Send money"
                  onPress={() => router.push("/transactions/new?type=expense")}
                  style={({ pressed }) => [
                    {
                      flex: 1,
                      backgroundColor: colors.accent,
                      borderRadius: 12,
                      paddingVertical: 11,
                      alignItems: "center",
                    },
                    pressed && styles.pressed,
                  ]}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.onAccent,
                        fontSize: 18,
                        fontWeight: "800",
                      }}
                    >
                      ↗
                    </Text>
                    <Text style={{ color: colors.onAccent, fontWeight: "800" }}>
                      Send
                    </Text>
                  </View>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Receive money"
                  onPress={() => router.push("/transactions/new?type=income")}
                  style={({ pressed }) => [
                    {
                      flex: 1,
                      backgroundColor: colors.positive,
                      borderWidth: 1,
                      borderColor: colors.borderStrong,
                      borderRadius: 12,
                      paddingVertical: 11,
                      alignItems: "center",
                    },
                    pressed && styles.pressed,
                  ]}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.onAccent,
                        fontSize: 18,
                        fontWeight: "800",
                      }}
                    >
                      ↙
                    </Text>
                    <Text style={{ color: colors.onAccent, fontWeight: "800" }}>
                      Receive
                    </Text>
                  </View>
                </Pressable>
              </View>

              <BarChart
                data={chartData}
                height={150}
                barWidth={10}
                spacing={10}
                initialSpacing={10}
                endSpacing={6}
                roundedTop
                hideAxesAndRules
                hideYAxisText
                disableScroll
                isAnimated
                animationDuration={350}
                xAxisLabelTextStyle={{ color: colors.muted, fontSize: 11 }}
              />
            </View>

            <View style={[styles.listHeader, { marginTop: 14 }]}>
              <View>
                <Text style={styles.sectionLabel}>RECENT ACTIVITY</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="View all transactions"
                onPress={() => router.push("/transactions/all")}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <Text style={styles.linkText}>View all</Text>
              </Pressable>
            </View>

            {filtered.slice(0, 5).length === 0 ? (
              <EmptyState
                title={
                  transactions.length
                    ? "No matching transactions"
                    : "No transactions yet"
                }
                message={
                  transactions.length
                    ? "Try another filter or clear the current view."
                    : "Use Send or Receive above to record your first movement."
                }
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
                      onPress={() =>
                        router.push(`/transactions/${item.id}` as Href)
                      }
                      onLongPress={() => confirmDelete(item)}
                      style={({ pressed }) => pressed && styles.pressed}
                    >
                      <View
                        style={{
                          paddingVertical: 11,
                          borderBottomWidth: 1,
                          borderBottomColor: colors.border,
                        }}
                      >
                        <View style={styles.listHeader}>
                          <View
                            style={[
                              {
                                width: 34,
                                height: 34,
                                borderRadius: 17,
                                alignItems: "center",
                                justifyContent: "center",
                                marginRight: 10,
                                backgroundColor: `${transactionColor(item.type)}22`,
                              },
                            ]}
                          >
                            <Text
                              style={{
                                color: transactionColor(item.type),
                                fontSize: 16,
                                fontWeight: "800",
                              }}
                            >
                              {transactionGlyph(item.type)}
                            </Text>
                          </View>
                          <View style={{ flex: 1, paddingRight: 12 }}>
                            <Text style={[styles.heading, { fontSize: 16 }]}>
                              {item.description || item.type}
                            </Text>
                            <Text
                              style={[styles.muted, { marginTop: 1 }]}
                              numberOfLines={1}
                            >
                              {accountName(item.accountId)} ·{" "}
                              {transactionDateLabel(item.transactionDate)}
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <Text
                              style={{
                                color: transactionColor(item.type),
                                fontSize: 17,
                                fontWeight: "800",
                              }}
                            >
                              {item.type === "expense"
                                ? "-"
                                : item.type === "transfer"
                                  ? ""
                                  : "+"}
                              {money(item.amountMinor)}
                            </Text>
                            <Text
                              accessibilityElementsHidden
                              style={{
                                color: colors.muted,
                                fontSize: 21,
                                lineHeight: 21,
                              }}
                            >
                              ›
                            </Text>
                          </View>
                        </View>
                      </View>
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
          if (tab === "home") router.push("/dashboard");
          if (tab === "money") router.push("/transactions");
          if (tab === "lending") router.push("/lending");
          if (tab === "tasks") router.push("/tasks");
          if (tab === "settings") router.push("/settings" as unknown as Href);
        }}
      />
    </Screen>
  );
}
