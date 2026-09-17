import { useRouter, type Href } from "expo-router";
import { useMemo } from "react";
import { isThisWeek, isToday, isYesterday, format } from "date-fns";
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
  Card,
  Button,
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
  const flowTotal = income + expenses;
  const incomeShare = flowTotal ? Math.round((income / flowTotal) * 100) : 0;

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
            <Card
              style={{
                backgroundColor: colors.surfaceRaised,
                borderColor: colors.borderStrong,
                padding: 22,
              }}
            >
              <View style={styles.listHeader}>
                <View>
                  <Text style={styles.eyebrow}>NET FLOW</Text>
                  <Text style={styles.metric}>{money(income - expenses)}</Text>
                </View>
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: colors.borderStrong,
                    borderRadius: 999,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                  }}
                >
                  <Text
                    style={{
                      color: colors.accentText,
                      fontSize: 11,
                      fontWeight: "800",
                      letterSpacing: 0.6,
                    }}
                  >
                    {incomeShare}% IN
                  </Text>
                </View>
              </View>
              {flowTotal > 0 ? (
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${incomeShare}%`,
                        backgroundColor: colors.positive,
                        borderRadius: 0,
                      },
                    ]}
                  />
                </View>
              ) : null}
              <View style={[styles.row, { marginTop: 18 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.muted}>Money in</Text>
                  <Text style={styles.success}>{money(income)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.muted}>Money out</Text>
                  <Text style={styles.destructiveText}>{money(expenses)}</Text>
                </View>
              </View>
            </Card>

            <View style={[styles.listHeader, { marginTop: 14 }]}>
              <View>
                <Text style={styles.sectionTitle}>Activity</Text>
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
                    : "Add your first income or expense."
                }
                action={"Add transaction"}
                onAction={() => router.push("/transactions/new")}
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

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add transaction"
        onPress={() => router.push("/transactions/new")}
        style={({ pressed }) => [
          {
            position: "absolute",
            right: 28,
            bottom: 86,
            width: 58,
            height: 58,
            borderRadius: 29,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.accent,
            borderWidth: 2,
            borderColor: colors.accentText,
            shadowColor: colors.text,
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.28,
            shadowRadius: 8,
            elevation: 7,
          },
          pressed && styles.pressed,
        ]}
      >
        <Text
          style={{ color: colors.onAccent, fontSize: 30, fontWeight: "300" }}
        >
          +
        </Text>
      </Pressable>
    </Screen>
  );
}
