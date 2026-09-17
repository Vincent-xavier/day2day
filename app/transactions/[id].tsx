import { useLocalSearchParams, useRouter } from "expo-router";
import { format } from "date-fns";
import { Alert, Pressable, ScrollView, Share, Text, View } from "react-native";
import { useAccounts, useRemoveTransaction, useTransactions } from "@/db/hooks";
import {
  BackButton,
  Button,
  Card,
  ErrorState,
  LoadingState,
  Screen,
  styles,
  colors,
  useTheme,
} from "@/design-system";
import { formatMoney as money } from "@/utils/money";
import type { TransactionType } from "@/db/types";

const typeColor = (type: TransactionType) => {
  if (type === "income") return colors.positive;
  if (type === "expense") return colors.negative;
  return colors.muted;
};

const typeLabel = (type: TransactionType) => {
  if (type === "income") return "Income";
  if (type === "expense") return "Expense";
  return "Transfer";
};

const typeGlyph = (type: TransactionType) => {
  if (type === "income") return "↑";
  if (type === "expense") return "↓";
  return "↔";
};

export default function TransactionDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { palette } = useTheme();
  const transactionId = Array.isArray(id) ? id[0] : id;
  const {
    data: transactions = [],
    isLoading,
    isError,
    refetch,
  } = useTransactions();
  const { data: accounts = [] } = useAccounts();
  const removeTransaction = useRemoveTransaction();
  const transaction = transactions.find((item) => item.id === transactionId);
  const account = accounts.find((item) => item.id === transaction?.accountId);

  const confirmDelete = () => {
    if (!transaction) return;
    Alert.alert(
      "Delete this transaction?",
      `${transaction.description || typeLabel(transaction.type)} · ${money(transaction.amountMinor)}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await removeTransaction.mutateAsync(transaction.id);
            router.back();
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <Screen>
        <BackButton onPress={() => router.back()} />
        <LoadingState label="Loading transaction..." />
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen>
        <BackButton onPress={() => router.back()} />
        <ErrorState
          message="This transaction could not load."
          onRetry={() => refetch()}
        />
      </Screen>
    );
  }

  if (!transaction) {
    return (
      <Screen>
        <BackButton onPress={() => router.back()} />
        <Card>
          <Text style={styles.heading}>Transaction not found</Text>
          <Text style={[styles.muted, { marginTop: 6 }]}>
            It may have been removed.
          </Text>
        </Card>
      </Screen>
    );
  }

  const color = typeColor(transaction.type);
  const sign =
    transaction.type === "expense"
      ? "-"
      : transaction.type === "income"
        ? "+"
        : "";
  const transactionDate = new Date(transaction.transactionDate);
  const createdDate = new Date(transaction.createdAt);
  const backgroundColor =
    transaction.type === "income"
      ? palette.mode === "light"
        ? "#effbf1"
        : "#102b25"
      : transaction.type === "expense"
        ? palette.mode === "light"
          ? "#fff5ed"
          : "#321f22"
        : palette.mode === "light"
          ? "#f1f4ff"
          : "#202939";

  const shareReceipt = async () => {
    try {
      await Share.share({
        title: "Day2Day transaction receipt",
        message: [
          "Day2Day transaction receipt",
          "",
          `${typeLabel(transaction.type)}: ${sign}${money(transaction.amountMinor, transaction.currency)}`,
          `Description: ${transaction.description || "No description"}`,
          `Account: ${account?.name ?? "Account"}`,
          `Date: ${format(transactionDate, "d MMM yyyy")}`,
          `Transaction ID: ${transaction.id}`,
        ].join("\n"),
      });
    } catch {
      Alert.alert("Could not share receipt", "Please try again in a moment.");
    }
  };

  return (
    <Screen style={{ backgroundColor }}>
      <ScrollView contentContainerStyle={{ paddingTop: 8, paddingBottom: 30 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 26,
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={({ pressed }) => [
              {
                width: 34,
                height: 34,
                borderRadius: 17,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: `${palette.surface}cc`,
                borderWidth: 1,
                borderColor: palette.border,
              },
              pressed && styles.pressed,
            ]}
          >
            <Text style={{ color: palette.text, fontSize: 22, lineHeight: 22 }}>
              ‹
            </Text>
          </Pressable>
          <Text
            style={{ color: palette.muted, fontSize: 12, fontWeight: "700" }}
          >
            TRANSACTION
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Share receipt"
            onPress={shareReceipt}
            style={({ pressed }) => [
              {
                width: 34,
                height: 34,
                borderRadius: 17,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: `${palette.surface}cc`,
                borderWidth: 1,
                borderColor: palette.border,
              },
              pressed && styles.pressed,
            ]}
          >
            <Text style={{ color: palette.text, fontSize: 18 }}>↥</Text>
          </Pressable>
        </View>

        <View style={{ alignItems: "center" }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: palette.text,
              marginBottom: 14,
            }}
          >
            <Text
              style={{
                color: palette.background,
                fontSize: 34,
                fontWeight: "500",
              }}
            >
              {typeGlyph(transaction.type)}
            </Text>
          </View>
          <Text
            style={{ color: palette.muted, fontSize: 12, fontWeight: "600" }}
          >
            {transaction.description ||
              `Paid via ${account?.name ?? "Account"}`}
          </Text>
          <Text
            style={{
              color: palette.text,
              fontSize: 30,
              fontWeight: "800",
              marginTop: 4,
            }}
          >
            {sign}
            {money(transaction.amountMinor, transaction.currency)}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 18,
              backgroundColor: `${color}28`,
              marginTop: 14,
            }}
          >
            <Text style={{ color, fontSize: 16 }}>
              {typeGlyph(transaction.type)}
            </Text>
            <Text
              style={{ color: palette.text, fontSize: 12, fontWeight: "700" }}
            >
              {typeLabel(transaction.type)}
            </Text>
            <Text style={{ color: palette.muted, fontSize: 14 }}>⌄</Text>
          </View>
        </View>

        <View
          style={{
            backgroundColor: palette.surfaceMuted,
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 6,
            marginTop: 26,
          }}
        >
          <DetailRow
            label="Date"
            value={format(transactionDate, "d MMM yyyy")}
          />
          <DetailRow
            label="Tran ID"
            value={transaction.id.slice(0, 12).toUpperCase()}
          />
          <DetailRow label="Account" value={account?.name ?? "Account"} />
        </View>

        <Button title="Share receipt" onPress={shareReceipt} />
        <Button
          title={
            removeTransaction.isPending ? "Deleting..." : "Delete transaction"
          }
          variant="secondary"
          disabled={removeTransaction.isPending}
          onPress={confirmDelete}
        />
      </ScrollView>
    </Screen>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: 36,
      }}
    >
      <Text style={{ color: colors.muted, fontSize: 12 }}>{label}</Text>
      <Text
        numberOfLines={1}
        style={{
          color: colors.text,
          fontSize: 12,
          fontWeight: "700",
          maxWidth: "65%",
          textAlign: "right",
        }}
      >
        {value}
      </Text>
    </View>
  );
}
