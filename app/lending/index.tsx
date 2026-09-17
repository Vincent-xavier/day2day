import { useRouter, type Href } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLendingItems } from "@/db/hooks";
import {
  BottomBar,
  BottomSheet,
  Card,
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  SearchBar,
  styles,
  colors,
} from "@/design-system";
import { formatMoney as money } from "@/utils/money";

type DirectionFilter = "all" | "lent" | "borrowed";
type StatusFilter = "open" | "overdue" | "settled" | "all";
type Sort = "recent" | "due" | "amount";

export default function LendingScreen({
  showAll = false,
}: {
  showAll?: boolean;
}) {
  const router = useRouter();
  const { data = [], isLoading, isError, refetch } = useLendingItems();
  const [direction, setDirection] = useState<DirectionFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("open");
  const [sort, setSort] = useState<Sort>("recent");
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const activeFilterCount =
    (direction !== "all" ? 1 : 0) +
    (status !== "open" ? 1 : 0) +
    (sort !== "recent" ? 1 : 0);
  const today = new Date().toISOString().slice(0, 10);
  const openItems = data.filter(
    (item) => item.status === "active" || item.status === "overdue",
  );
  const youGive = openItems
    .filter((item) => item.direction === "lent")
    .reduce(
      (sum, item) =>
        sum + Math.max((item.amountMinor ?? 0) - item.paidMinor, 0),
      0,
    );
  const youGet = openItems
    .filter((item) => item.direction === "borrowed")
    .reduce(
      (sum, item) =>
        sum + Math.max((item.amountMinor ?? 0) - item.paidMinor, 0),
      0,
    );
  const overdueCount = openItems.filter(
    (item) => item.dueAt && item.dueAt < today,
  ).length;
  const visible = useMemo(
    () =>
      data
        .filter((item) => {
          const directionMatch =
            direction === "all" || item.direction === direction;
          const statusMatch =
            status === "all" ||
            (status === "open"
              ? item.status === "active" || item.status === "overdue"
              : status === "overdue"
                ? item.status === "overdue" ||
                  (item.status === "active" &&
                    !!item.dueAt &&
                    item.dueAt < today)
                : item.status === "returned");
          const query = search.trim().toLowerCase();
          return (
            directionMatch &&
            statusMatch &&
            (!query ||
              `${item.personName} ${item.name} ${item.description ?? ""}`
                .toLowerCase()
                .includes(query))
          );
        })
        .sort((a, b) =>
          sort === "amount"
            ? (b.amountMinor ?? 0) - (a.amountMinor ?? 0)
            : sort === "due"
              ? (a.dueAt ?? "9999-12-31").localeCompare(b.dueAt ?? "9999-12-31")
              : b.createdAt.localeCompare(a.createdAt),
        ),
    [data, direction, search, sort, status, today],
  );
  const clearView = () => {
    setDirection("all");
    setStatus("open");
    setSort("recent");
    setSearch("");
  };
  const displayItems = showAll ? visible : visible.slice(0, 5);
  const openDetails = (itemId: string) =>
    router.push(`/lending/${itemId}` as Href);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 18 }}>
        <LinearGradient
          colors={[colors.accentSoft, colors.accent]}
          style={styles.lendingHero}
        >
          <View style={styles.listHeader}>
            <View>
              <Text style={styles.lendingEyebrow}>LENDING</Text>
              <Text style={styles.lendingTitle}>People & balances</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add ledger entry"
              onPress={() => router.push("/lending/new")}
              style={styles.lendingAdd}
            >
              <Text style={styles.lendingAddText}>＋</Text>
            </Pressable>
          </View>
          <View style={styles.lendingHeroRow}>
            <View>
              <Text style={styles.lendingCaption}>Your open balance</Text>
              <Text style={styles.lendingAmount}>
                {money(youGet - youGive)}
              </Text>
            </View>
            <View style={styles.lendingHeroMeta}>
              <Text style={styles.lendingCaption}>Overdue</Text>
              <Text style={styles.lendingMetaValue}>{overdueCount}</Text>
            </View>
          </View>
        </LinearGradient>
        <View style={styles.lendingToolbar}>
          <Text style={styles.sectionLabel}>
            {showAll ? visible.length : Math.min(visible.length, 5)} ENTRIES
          </Text>
          {showAll ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Customize ledger filters"
              onPress={() => setFilterOpen(true)}
            >
              <Text style={styles.linkText}>
                {activeFilterCount
                  ? `Filters · ${activeFilterCount}`
                  : "Filter & sort"}
              </Text>
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View all balances"
              onPress={() => router.push("/lending/all")}
            >
              <Text style={styles.linkText}>View all</Text>
            </Pressable>
          )}
        </View>
        {showAll ? (
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Search contacts or entries"
          />
        ) : null}
        <View style={styles.row}>
          <Card style={styles.stat}>
            <Text style={styles.muted}>You lent</Text>
            <Text style={[styles.statValue, { color: colors.negative }]}>
              {money(youGive)}
            </Text>
          </Card>
          <Card style={styles.stat}>
            <Text style={styles.muted}>You borrowed</Text>
            <Text style={[styles.statValue, { color: colors.positive }]}>
              {money(youGet)}
            </Text>
          </Card>
        </View>
        {isError ? (
          <ErrorState
            message="Your ledgers couldn't load."
            onRetry={() => refetch()}
          />
        ) : isLoading ? (
          <LoadingState label="Loading your ledgers..." />
        ) : displayItems.length === 0 ? (
          <EmptyState
            title="No balances yet"
            message="Add a balance to start tracking money you lend or borrow."
            action="Add ledger entry"
            onAction={() => router.push("/lending/new")}
          />
        ) : (
          displayItems.map((item) => {
            const overdue =
              item.status !== "returned" && !!item.dueAt && item.dueAt < today;
            const remaining = Math.max(
              (item.amountMinor ?? 0) - item.paidMinor,
              0,
            );
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={`${item.personName}, ${item.name}. ${money(remaining)} remaining.`}
                onPress={() => openDetails(item.id)}
                style={({ pressed }) => [
                  {
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.listHeader}>
                  <View style={styles.contactIdentity}>
                    <View style={styles.contactAvatar}>
                      <Text style={styles.contactAvatarText}>
                        {item.personName[0]?.toUpperCase() ?? "?"}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[styles.heading, { fontSize: 16 }]}
                        numberOfLines={1}
                      >
                        {item.personName}
                      </Text>
                      <Text style={styles.muted} numberOfLines={1}>
                        {item.name} ·{" "}
                        {item.direction === "lent"
                          ? "You lent"
                          : "You borrowed"}{" "}
                        ·{" "}
                        {overdue
                          ? "Overdue"
                          : item.status === "returned"
                            ? "Settled"
                            : item.dueAt
                              ? `Due ${item.dueAt}`
                              : "No due date"}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {item.amountMinor ? (
                      <Text style={styles.lendingCardAmount}>
                        {money(remaining)} left
                      </Text>
                    ) : (
                      <Text style={styles.muted}>No amount</Text>
                    )}
                    <Text style={{ color: colors.muted, fontSize: 21 }}>›</Text>
                  </View>
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
      {showAll ? (
        <BottomSheet
          visible={filterOpen}
          title="Customize ledger view"
          onClose={() => setFilterOpen(false)}
        >
          <Text style={styles.label}>Direction</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {(
              [
                ["all", "All balances"],
                ["lent", "You lent"],
                ["borrowed", "You borrowed"],
              ] as [DirectionFilter, string][]
            ).map(([value, label]) => (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityState={{ selected: direction === value }}
                onPress={() => setDirection(value)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor:
                    direction === value ? colors.accent : colors.border,
                  backgroundColor:
                    direction === value ? colors.accent : colors.surfaceMuted,
                }}
              >
                <Text
                  style={{
                    color: direction === value ? colors.onAccent : colors.text,
                    fontSize: 12,
                    fontWeight: "800",
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.label}>Status</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {(
              [
                ["open", "Open"],
                ["overdue", "Overdue"],
                ["settled", "Settled"],
                ["all", "All"],
              ] as [StatusFilter, string][]
            ).map(([value, label]) => (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityState={{ selected: status === value }}
                onPress={() => setStatus(value)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: status === value ? colors.accent : colors.border,
                  backgroundColor:
                    status === value ? colors.accent : colors.surfaceMuted,
                }}
              >
                <Text
                  style={{
                    color: status === value ? colors.onAccent : colors.text,
                    fontSize: 12,
                    fontWeight: "800",
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { marginTop: 22 }]}>Sort by</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {(
              [
                ["recent", "Most recent"],
                ["due", "Due date"],
                ["amount", "Largest amount"],
              ] as [Sort, string][]
            ).map(([value, label]) => (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityState={{ selected: sort === value }}
                onPress={() => setSort(value)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: sort === value ? colors.accent : colors.border,
                  backgroundColor:
                    sort === value ? colors.accent : colors.surfaceMuted,
                }}
              >
                <Text
                  style={{
                    color: sort === value ? colors.onAccent : colors.text,
                    fontSize: 12,
                    fontWeight: "800",
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
          {activeFilterCount ? (
            <Button title="Reset view" variant="ghost" onPress={clearView} />
          ) : null}
        </BottomSheet>
      ) : null}
      <BottomBar
        active="lending"
        onNavigate={(tab) => {
          if (tab === "home") router.push("/dashboard");
          if (tab === "money") router.push("/transactions");
          if (tab === "lending") router.push("/lending");
          if (tab === "tasks") router.push("/tasks");
          if (tab === "settings") router.push("/settings" as Href);
        }}
      />
    </Screen>
  );
}
