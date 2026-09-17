 import { useRouter, type Href } from "expo-router";
 import { useMemo, useState } from "react";
 import {
   Alert,
   Pressable,
   RefreshControl,
   ScrollView,
   Text,
   TouchableOpacity,
   View,
 } from "react-native";
 import {
   isThisWeek,
   isToday,
   isYesterday,
   format,
   startOfMonth,
   startOfDay,
   subDays,
 } from "date-fns";
 import { useAccounts, useRemoveTransaction, useTransactions } from "@/db/hooks";
 import {
   BottomBar,
   BottomSheet,
   Button,
   Card,
   EmptyState,
   ErrorState,
   LoadingState,
   Screen,
   ScreenHeader,
   SearchBar,
   colors,
   styles,
 } from "@/design-system";
 import { formatMoney as money } from "@/utils/money";
 import type { Transaction, TransactionType } from "@/db/types";

 type TypeFilter = "all" | TransactionType;
 type RangeFilter = "all" | "7d" | "month";

 const rangeLabels: Record<RangeFilter, string> = {
   all: "All time",
   "7d": "Last 7 days",
   month: "This month",
 };

 const groupLabel = (dateValue: string) => {
   const date = new Date(dateValue);
   if (isToday(date)) return "Today";
   if (isYesterday(date)) return "Yesterday";
   if (isThisWeek(date, { weekStartsOn: 1 })) return format(date, "EEEE");
   return format(date, "MMM d, yyyy");
 };

 const dateLabel = (dateValue: string) => {
   const date = new Date(dateValue);
   const time = format(date, "h:mm a");
   if (isToday(date)) return `${time}`;
   if (isYesterday(date)) return `${time}`;
   return format(date, "MMM d, yyyy · h:mm a");
 };

 const typeColor = (type: TransactionType) =>
   type === "income"
     ? colors.positive
     : type === "expense"
       ? colors.negative
       : colors.muted;

 const typeGlyph = (type: TransactionType) =>
   type === "income" ? "↑" : type === "expense" ? "↓" : "↔";

 const matchesRange = (value: string, range: RangeFilter) => {
   if (range === "all") return true;
   const date = new Date(value);
   const today = new Date();
   return range === "7d"
     ? date >= startOfDay(subDays(today, 6))
     : date >= startOfMonth(today);
 };

 export default function AllTransactionsScreen() {
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
   const [accountFilter, setAccountFilter] = useState("all");
   const [rangeFilter, setRangeFilter] = useState<RangeFilter>("all");
   const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

   const accountName = (id: string) =>
     accounts.find((account) => account.id === id)?.name ?? "Account";
   const activeFilterCount =
     Number(typeFilter !== "all") +
     Number(accountFilter !== "all") +
     Number(rangeFilter !== "all");

   const filtered = useMemo(() => {
     const query = search.trim().toLowerCase();
     return transactions.filter((item) => {
       if (typeFilter !== "all" && item.type !== typeFilter) return false;
       if (accountFilter !== "all" && item.accountId !== accountFilter)
         return false;
       if (!matchesRange(item.transactionDate, rangeFilter)) return false;
       if (
         query &&
         !`${item.description ?? ""} ${accountName(item.accountId)}`
           .toLowerCase()
           .includes(query)
       )
         return false;
       return true;
     });
   }, [accountFilter, accounts, rangeFilter, search, transactions, typeFilter]);

   const groups = useMemo(() => {
     const buckets = new Map<string, Transaction[]>();
     filtered.forEach((item) => {
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

   const clearFilters = () => {
     setSearch("");
     setTypeFilter("all");
     setAccountFilter("all");
     setRangeFilter("all");
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
           <View style={{ flex: 1, minWidth: 0 }}>
             <ScreenHeader
               eyebrow="MONEY / HISTORY"
               title="All transactions"
               subtitle="Search, filter, and review every movement."
             />
           </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={searchOpen ? "Hide transaction search" : "Show transaction search"}
              accessibilityState={{ expanded: searchOpen }}
              onPress={() => setSearchOpen((open) => !open)}
              style={({ pressed }) => [
                {
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: searchOpen ? colors.accent : colors.accentSoft,
                  borderWidth: 1,
                  borderColor: colors.borderStrong,
                },
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={{
                  color: searchOpen ? colors.onAccent : colors.accentText,
                  fontSize: 22,
                }}
              >
                ⌕
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open transaction filters"
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
                  <Text style={{ color: colors.onAccent, fontSize: 10, fontWeight: "800" }}>
                    {activeFilterCount}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          </View>
         </View>

         <View style={styles.row}>
           <Card style={styles.stat}>
             <Text style={styles.muted}>Money in</Text>
             <Text style={styles.success}>{money(income)}</Text>
           </Card>
           <Card style={styles.stat}>
             <Text style={styles.muted}>Money out</Text>
             <Text style={styles.destructiveText}>{money(expenses)}</Text>
           </Card>
         </View>

        {searchOpen ? (
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Search description or account"
          />
        ) : null}

         {isError ? (
           <ErrorState
             message="Your transactions couldn't load."
             onRetry={() => refetch()}
           />
         ) : isLoading ? (
           <LoadingState label="Loading your transactions..." />
         ) : groups.length === 0 ? (
           <EmptyState
             title={transactions.length ? "No matching transactions" : "No transactions yet"}
             message={
               transactions.length
                 ? "Try changing the search or filters."
                 : "Add your first income or expense."
             }
             action={transactions.length ? "Clear filters" : "Add transaction"}
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
                   onPress={() => router.push(`/transactions/${item.id}` as Href)}
                   onLongPress={() => confirmDelete(item)}
                   style={({ pressed }) => pressed && styles.pressed}
                 >
                   <View
                     style={{
                       flexDirection: "row",
                       alignItems: "center",
                       paddingVertical: 11,
                       borderBottomWidth: 1,
                       borderBottomColor: colors.border,
                     }}
                   >
                     <View
                       style={[
                         {
                           width: 34,
                           height: 34,
                           borderRadius: 17,
                           alignItems: "center",
                           justifyContent: "center",
                           marginRight: 10,
                           backgroundColor: `${typeColor(item.type)}22`,
                         },
                       ]}
                     >
                       <Text style={{ color: typeColor(item.type), fontSize: 16 }}>
                         {typeGlyph(item.type)}
                       </Text>
                     </View>
                     <View style={{ flex: 1, paddingRight: 12 }}>
                       <Text style={[styles.heading, { fontSize: 16 }]}>
                         {item.description || item.type}
                       </Text>
                       <Text style={styles.muted} numberOfLines={1}>
                         {accountName(item.accountId)} · {dateLabel(item.transactionDate)}
                       </Text>
                     </View>
                     <Text style={{ color: typeColor(item.type), fontSize: 16, fontWeight: "800" }}>
                       {item.type === "expense" ? "-" : item.type === "income" ? "+" : ""}
                       {money(item.amountMinor)}
                     </Text>
                   </View>
                 </Pressable>
               ))}
             </View>
           ))
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
         <Text style={{ color: colors.onAccent, fontSize: 30, fontWeight: "300" }}>
           +
         </Text>
       </Pressable>

       <BottomSheet
         visible={filtersOpen}
         title="Filter transactions"
         onClose={() => setFiltersOpen(false)}
       >
         <Text style={styles.label}>Time range</Text>
         <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
           {(["all", "7d", "month"] as RangeFilter[]).map((option) => (
             <TouchableOpacity
               key={option}
               onPress={() => setRangeFilter(option)}
               style={[styles.choice, rangeFilter === option && styles.choiceActive]}
             >
               <Text style={[styles.choiceText, rangeFilter === option && styles.choiceTextActive]}>
                 {rangeLabels[option]}
               </Text>
             </TouchableOpacity>
           ))}
         </View>
         <Text style={styles.label}>Type</Text>
         <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
           {(["all", "income", "expense", "transfer"] as TypeFilter[]).map((option) => (
             <TouchableOpacity
               key={option}
               onPress={() => setTypeFilter(option)}
               style={[styles.choice, typeFilter === option && styles.choiceActive]}
             >
               <Text style={[styles.choiceText, typeFilter === option && styles.choiceTextActive]}>
                 {option[0].toUpperCase() + option.slice(1)}
               </Text>
             </TouchableOpacity>
           ))}
         </View>
         <Text style={styles.label}>Account</Text>
         <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
           <TouchableOpacity
             onPress={() => setAccountFilter("all")}
             style={[styles.choice, accountFilter === "all" && styles.choiceActive]}
           >
             <Text style={[styles.choiceText, accountFilter === "all" && styles.choiceTextActive]}>All accounts</Text>
           </TouchableOpacity>
           {accounts.map((account) => (
             <TouchableOpacity
               key={account.id}
               onPress={() => setAccountFilter(account.id)}
               style={[styles.choice, accountFilter === account.id && styles.choiceActive]}
             >
               <Text style={[styles.choiceText, accountFilter === account.id && styles.choiceTextActive]}>
                 {account.name}
               </Text>
             </TouchableOpacity>
           ))}
         </View>
         <Button title="Done" onPress={() => setFiltersOpen(false)} />
       </BottomSheet>
     </Screen>
   );
 }
