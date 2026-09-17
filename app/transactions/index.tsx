import { useRouter, type Href } from "expo-router";
import { useMemo, useState } from "react";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import {
  isThisWeek,
  isToday,
  isYesterday,
  format,
  startOfMonth,
  startOfDay,
  endOfDay,
  subDays,
  subMonths,
  endOfMonth,
} from "date-fns";
import {
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAccounts, useRemoveTransaction, useTransactions } from "@/db/hooks";
import {
  BottomSheet,
  BottomBar,
  Card,
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  ScreenHeader,
  SearchBar,
  styles,
  colors,
} from "@/design-system";
import { formatMoney as money } from "@/utils/money";
import type { Transaction, TransactionType } from "@/db/types";

type TypeFilter = "all" | TransactionType;
type RangeFilter = "all" | "7d" | "month" | "lastMonth" | "custom";

const RANGE_LABELS: Record<RangeFilter, string> = {
  all: "All time",
  "7d": "Last 7 days",
  month: "This month",
  lastMonth: "Last month",
  custom: "Custom range",
};
const TYPE_LABELS: Record<TypeFilter, string> = {
  all: "All types",
  income: "Income",
  expense: "Expenses",
  transfer: "Transfers",
};

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
  if (isToday(date)) return `Today, ${time}`;
  if (isYesterday(date)) return `Yesterday, ${time}`;
  return format(date, "MMM d, yyyy · h:mm a");
};

const withinRange = (
  dateValue: string,
  range: RangeFilter,
  customFrom: Date | null,
  customTo: Date | null,
) => {
  if (range === "all") return true;
  const date = new Date(dateValue);
  const now = new Date();
  if (range === "7d") return date >= startOfDay(subDays(now, 6));
  if (range === "month") return date >= startOfMonth(now);
  if (range === "custom") {
    if (customFrom && date < startOfDay(customFrom)) return false;
    if (customTo && date > endOfDay(customTo)) return false;
    return true;
  }
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));
  return date >= lastMonthStart && date <= lastMonthEnd;
};

export default function TransactionsScreen({
  showAll = false,
}: {
  showAll?: boolean;
}) {
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

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [accountFilter, setAccountFilter] = useState<"all" | string>("all");
  const [rangeFilter, setRangeFilter] = useState<RangeFilter>("all");
  const [customFrom, setCustomFrom] = useState<Date | null>(null);
  const [customTo, setCustomTo] = useState<Date | null>(null);
  const [activeCalendar, setActiveCalendar] = useState<"from" | "to" | null>(
    null,
  );
  const [filtersOpen, setFiltersOpen] = useState(false);

  const accountName = (id: string) =>
    accounts.find((account) => account.id === id)?.name ?? "Account";
  const activeFilterCount =
    (typeFilter !== "all" ? 1 : 0) +
    (accountFilter !== "all" ? 1 : 0) +
    (rangeFilter !== "all" ? 1 : 0);
  const searchActive = Boolean(search.trim());

  const filtered = useMemo(
    () =>
      transactions.filter((item) => {
        if (typeFilter !== "all" && item.type !== typeFilter) return false;
        if (accountFilter !== "all" && item.accountId !== accountFilter)
          return false;
        if (
          !withinRange(item.transactionDate, rangeFilter, customFrom, customTo)
        )
          return false;
        if (search.trim()) {
          const query = search.trim().toLowerCase();
          const haystack =
            `${item.description ?? ""} ${accountName(item.accountId)}`.toLowerCase();
          if (!haystack.includes(query)) return false;
        }
        return true;
      }),
    [
      transactions,
      typeFilter,
      accountFilter,
      rangeFilter,
      customFrom,
      customTo,
      search,
      accounts,
    ],
  );

  const groups = useMemo(() => {
    const buckets = new Map<string, Transaction[]>();
    const visibleTransactions = showAll ? filtered : filtered.slice(0, 5);
    visibleTransactions.forEach((item) => {
      const label = groupLabel(item.transactionDate);
      if (!buckets.has(label)) buckets.set(label, []);
      buckets.get(label)!.push(item);
    });
    return Array.from(buckets.entries());
  }, [filtered, showAll]);

  const income = filtered
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amountMinor, 0);
  const expenses = filtered
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amountMinor, 0);
  const flowTotal = income + expenses;
  const incomeShare = flowTotal ? Math.round((income / flowTotal) * 100) : 0;

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setAccountFilter("all");
    setRangeFilter("all");
    setCustomFrom(null);
    setCustomTo(null);
    setActiveCalendar(null);
  };

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
        <View style={styles.listHeader}>
          <ScreenHeader
            eyebrow={showAll ? undefined : "MONEY / ACTIVITY"}
            title={showAll ? "All transactions" : "Transactions"}
            subtitle={showAll ? undefined : "Your money, in motion."}
          />
          {showAll ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                activeFilterCount || searchActive
                  ? `Filter transactions${activeFilterCount ? `, ${activeFilterCount} active` : ""}${searchActive ? ", search active" : ""}`
                  : "Filter transactions"
              }
              onPress={() => setFiltersOpen(true)}
              style={({ pressed }) => [
                {
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: colors.accentSoft,
                  borderWidth: 1,
                  borderColor: colors.borderStrong,
                },
                pressed && styles.pressed,
              ]}
            >
              <View style={{ alignItems: "center", gap: 3 }}>
                <View
                  style={{
                    width: 17,
                    height: 2,
                    borderRadius: 1,
                    backgroundColor: colors.accentText,
                  }}
                />
                <View
                  style={{
                    width: 12,
                    height: 2,
                    borderRadius: 1,
                    backgroundColor: colors.accentText,
                  }}
                />
                <View
                  style={{
                    width: 7,
                    height: 2,
                    borderRadius: 1,
                    backgroundColor: colors.accentText,
                  }}
                />
              </View>
              {activeFilterCount ? (
                <View
                  style={{
                    position: "absolute",
                    top: -5,
                    right: -5,
                    minWidth: 20,
                    height: 20,
                    paddingHorizontal: 5,
                    borderRadius: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: colors.accent,
                    borderWidth: 2,
                    borderColor: colors.background,
                  }}
                >
                  <Text
                    style={{
                      color: colors.onAccent,
                      fontSize: 10,
                      fontWeight: "800",
                    }}
                  >
                    {activeFilterCount}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          ) : (
            <Text style={styles.sectionLabel}>{transactions.length} TOTAL</Text>
          )}
        </View>

        {isError ? (
          <ErrorState
            message="Your transactions couldn't load."
            onRetry={() => refetch()}
          />
        ) : isLoading ? (
          <LoadingState label="Loading your transactions..." />
        ) : (
          <>
            {!showAll ? (
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
                    <Text style={styles.metric}>
                      {money(income - expenses)}
                    </Text>
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
                    <Text style={styles.destructiveText}>
                      {money(expenses)}
                    </Text>
                  </View>
                </View>
              </Card>
            ) : null}

            <View style={[styles.listHeader, { marginTop: 14 }]}>
              <View>
                <Text style={styles.sectionTitle}>
                  {showAll ? "Transactions" : "Activity"}
                </Text>
                <Text style={styles.muted}>
                  {!showAll
                    ? "Latest transactions"
                    : searchActive || activeFilterCount
                      ? "Filtered results"
                      : rangeFilter === "all"
                        ? "All time"
                        : RANGE_LABELS[rangeFilter]}
                </Text>
              </View>
              {showAll ? (
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.muted}>
                    {filtered.length} result{filtered.length === 1 ? "" : "s"}
                  </Text>
                </View>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="View all transactions"
                  onPress={() => router.push("/transactions/all")}
                  style={({ pressed }) => pressed && styles.pressed}
                >
                  <Text style={styles.linkText}>View all</Text>
                </Pressable>
              )}
            </View>

            {showAll ? (
              <SearchBar
                value={search}
                onChangeText={setSearch}
                placeholder="Search description or account"
              />
            ) : null}

            {(showAll ? filtered : filtered.slice(0, 5)).length === 0 ? (
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
                action={
                  transactions.length ? "Clear filters" : "Add transaction"
                }
                onAction={
                  transactions.length
                    ? clearFilters
                    : () => router.push("/transactions/new")
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

      {showAll ? (
        <BottomSheet
          visible={filtersOpen}
          title="Filter transactions"
          onClose={() => setFiltersOpen(false)}
        >
          <Text style={styles.label}>Type</Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 18,
            }}
          >
            {(["all", "income", "expense", "transfer"] as TypeFilter[]).map(
              (option) => (
                <TouchableOpacity
                  key={option}
                  accessibilityRole="button"
                  accessibilityState={{ selected: typeFilter === option }}
                  onPress={() => setTypeFilter(option)}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 18,
                    borderWidth: 1,
                    borderColor:
                      typeFilter === option ? colors.accent : colors.border,
                    backgroundColor:
                      typeFilter === option
                        ? colors.accent
                        : colors.surfaceMuted,
                  }}
                >
                  <Text
                    style={{
                      color:
                        typeFilter === option ? colors.onAccent : colors.text,
                      fontSize: 12,
                      fontWeight: "800",
                    }}
                  >
                    {TYPE_LABELS[option]}
                  </Text>
                </TouchableOpacity>
              ),
            )}
          </View>

          <Text style={styles.label}>Date range</Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 12,
            }}
          >
            {(
              ["all", "7d", "month", "lastMonth", "custom"] as RangeFilter[]
            ).map((option) => (
              <TouchableOpacity
                key={option}
                accessibilityRole="button"
                accessibilityState={{ selected: rangeFilter === option }}
                onPress={() => setRangeFilter(option)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor:
                    rangeFilter === option ? colors.accent : colors.border,
                  backgroundColor:
                    rangeFilter === option
                      ? colors.accent
                      : colors.surfaceMuted,
                }}
              >
                <Text
                  style={{
                    color:
                      rangeFilter === option ? colors.onAccent : colors.text,
                    fontSize: 12,
                    fontWeight: "800",
                  }}
                >
                  {RANGE_LABELS[option]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {rangeFilter === "custom" ? (
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 18 }}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Choose start date"
                onPress={() => setActiveCalendar("from")}
                style={{ flex: 1 }}
              >
                <Card style={{ paddingVertical: 12 }}>
                  <Text style={styles.muted}>From</Text>
                  <Text
                    style={[styles.heading, { fontSize: 15, marginTop: 4 }]}
                  >
                    {customFrom ? format(customFrom, "MMM d, yyyy") : "Any"}
                  </Text>
                </Card>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Choose end date"
                onPress={() => setActiveCalendar("to")}
                style={{ flex: 1 }}
              >
                <Card style={{ paddingVertical: 12 }}>
                  <Text style={styles.muted}>To</Text>
                  <Text
                    style={[styles.heading, { fontSize: 15, marginTop: 4 }]}
                  >
                    {customTo ? format(customTo, "MMM d, yyyy") : "Any"}
                  </Text>
                </Card>
              </TouchableOpacity>
            </View>
          ) : null}

          {activeCalendar ? (
            <>
              <DateTimePicker
                value={
                  (activeCalendar === "from" ? customFrom : customTo) ??
                  new Date()
                }
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "calendar"}
                maximumDate={new Date()}
                onChange={(event: DateTimePickerEvent, selected?: Date) => {
                  if (Platform.OS === "android") setActiveCalendar(null);
                  if (event.type === "dismissed" || !selected) return;
                  if (activeCalendar === "from") setCustomFrom(selected);
                  else setCustomTo(selected);
                }}
              />
              {Platform.OS === "ios" ? (
                <Button
                  title="Done"
                  variant="ghost"
                  onPress={() => setActiveCalendar(null)}
                />
              ) : null}
            </>
          ) : null}

          {accounts.length > 1 ? (
            <>
              <Text style={styles.label}>Account</Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityState={{ selected: accountFilter === "all" }}
                  onPress={() => setAccountFilter("all")}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 18,
                    borderWidth: 1,
                    borderColor:
                      accountFilter === "all" ? colors.accent : colors.border,
                    backgroundColor:
                      accountFilter === "all"
                        ? colors.accent
                        : colors.surfaceMuted,
                  }}
                >
                  <Text
                    style={{
                      color:
                        accountFilter === "all" ? colors.onAccent : colors.text,
                      fontSize: 12,
                      fontWeight: "800",
                    }}
                  >
                    All accounts
                  </Text>
                </TouchableOpacity>
                {accounts.map((account) => (
                  <TouchableOpacity
                    key={account.id}
                    accessibilityRole="button"
                    accessibilityState={{
                      selected: accountFilter === account.id,
                    }}
                    onPress={() => setAccountFilter(account.id)}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                      borderRadius: 18,
                      borderWidth: 1,
                      borderColor:
                        accountFilter === account.id
                          ? colors.accent
                          : colors.border,
                      backgroundColor:
                        accountFilter === account.id
                          ? colors.accent
                          : colors.surfaceMuted,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          accountFilter === account.id
                            ? colors.onAccent
                            : colors.text,
                        fontSize: 12,
                        fontWeight: "800",
                      }}
                    >
                      {account.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : null}

          {activeFilterCount ? (
            <Button
              title="Reset filters"
              variant="ghost"
              onPress={clearFilters}
            />
          ) : null}
        </BottomSheet>
      ) : null}
    </Screen>
  );
}
