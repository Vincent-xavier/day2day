import { useRouter } from "expo-router";
import { useState } from "react";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { format, isToday, isYesterday, parse, subDays } from "date-fns";
import {
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAccounts, useCreateTransaction } from "@/db/hooks";
import {
  BackButton,
  BottomSheet,
  Button,
  Card,
  Field,
  Screen,
  styles,
  colors,
} from "@/design-system";
import { parseMoneyMinor } from "@/utils/money";

const QUICK_LABELS = ["Groceries", "Transport", "Rent", "Salary", "Dining"];
const DATE_FORMAT = "yyyy-MM-dd";
const today = () => format(new Date(), DATE_FORMAT);
const yesterday = () => format(subDays(new Date(), 1), DATE_FORMAT);

const describeDate = (value: string) => {
  const date = parse(value, DATE_FORMAT, new Date());
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEE, MMM d, yyyy");
};

export default function NewTransactionScreen() {
  const router = useRouter();
  const { data: accounts = [] } = useAccounts();
  const create = useCreateTransaction();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [accountIndex, setAccountIndex] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [transactionDate, setTransactionDate] = useState(today());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const save = async () => {
    if (!accounts.length) return Alert.alert("Create an account first");
    const parsed = parseMoneyMinor(amount);
    if (!parsed.ok) return Alert.alert("Check the amount", parsed.error);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(transactionDate))
      return Alert.alert("Check the date", "Choose a valid date.");
    try {
      await create.mutateAsync({
        accountId: accounts[accountIndex].id,
        type,
        amountMinor: parsed.minor,
        description: description.trim() || type,
        transactionDate,
      });
      router.back();
    } catch (error) {
      Alert.alert(
        "Could not save transaction",
        error instanceof Error ? error.message : "Please try again.",
      );
    }
  };
  const onPickDate = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") setCalendarOpen(false);
    if (event.type === "dismissed" || !selected) return;
    setTransactionDate(format(selected, DATE_FORMAT));
  };
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingTop: 8, paddingBottom: 30 }}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.title}>New transaction</Text>
        <Text style={styles.subtitle}>Record money moving in or out.</Text>
        <View style={styles.row}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ selected: type === "expense" }}
            style={[styles.choice, type === "expense" && styles.choiceActive]}
            onPress={() => setType("expense")}
          >
            <Text
              style={[
                styles.choiceText,
                type === "expense" && styles.choiceTextActive,
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ selected: type === "income" }}
            style={[styles.choice, type === "income" && styles.choiceActive]}
            onPress={() => setType("income")}
          >
            <Text
              style={[
                styles.choiceText,
                type === "income" && styles.choiceTextActive,
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>

        <Card style={{ alignItems: "center", paddingVertical: 26 }}>
          <Text style={styles.muted}>Amount</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "baseline",
              marginTop: 6,
            }}
          >
            <Text style={[styles.metric, { marginTop: 0 }]}>$</Text>
            <TextInput
              accessibilityLabel="Amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.muted}
              autoFocus
              style={[
                styles.metric,
                { marginTop: 0, minWidth: 120, textAlign: "left" },
              ]}
            />
          </View>
        </Card>

        <Text style={styles.label}>Quick description</Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 6,
          }}
        >
          {QUICK_LABELS.map((label) => (
            <TouchableOpacity
              key={label}
              accessibilityRole="button"
              onPress={() => setDescription(label)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderRadius: 20,
                borderWidth: 1,
                borderColor:
                  description === label ? colors.accent : colors.border,
                backgroundColor:
                  description === label ? colors.accent : "transparent",
              }}
            >
              <Text
                style={{
                  color:
                    description === label ? colors.onAccent : colors.accentText,
                  fontSize: 12,
                  fontWeight: "700",
                }}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Field
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Groceries"
        />

        <Text style={styles.label}>Date</Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ selected: transactionDate === today() }}
            onPress={() => setTransactionDate(today())}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 20,
              borderWidth: 1,
              borderColor:
                transactionDate === today() ? colors.accent : colors.border,
              backgroundColor:
                transactionDate === today() ? colors.accent : "transparent",
            }}
          >
            <Text
              style={{
                color:
                  transactionDate === today()
                    ? colors.onAccent
                    : colors.accentText,
                fontSize: 12,
                fontWeight: "700",
              }}
            >
              Today
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ selected: transactionDate === yesterday() }}
            onPress={() => setTransactionDate(yesterday())}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 20,
              borderWidth: 1,
              borderColor:
                transactionDate === yesterday() ? colors.accent : colors.border,
              backgroundColor:
                transactionDate === yesterday() ? colors.accent : "transparent",
            }}
          >
            <Text
              style={{
                color:
                  transactionDate === yesterday()
                    ? colors.onAccent
                    : colors.accentText,
                fontSize: 12,
                fontWeight: "700",
              }}
            >
              Yesterday
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Choose a date from the calendar"
          onPress={() => setCalendarOpen(true)}
          style={{ marginBottom: 16 }}
        >
          <Card
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 14,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Text style={{ fontSize: 18 }}>📅</Text>
              <Text style={styles.heading}>
                {describeDate(transactionDate)}
              </Text>
            </View>
            <Text style={styles.linkText}>Open calendar</Text>
          </Card>
        </TouchableOpacity>
        {calendarOpen ? (
          Platform.OS === "ios" ? (
            <BottomSheet
              visible={calendarOpen}
              title="Choose date"
              onClose={() => setCalendarOpen(false)}
            >
              <DateTimePicker
                value={parse(transactionDate, DATE_FORMAT, new Date())}
                mode="date"
                display="inline"
                maximumDate={new Date()}
                onChange={onPickDate}
              />
            </BottomSheet>
          ) : (
            <DateTimePicker
              value={parse(transactionDate, DATE_FORMAT, new Date())}
              mode="date"
              display="calendar"
              maximumDate={new Date()}
              onChange={onPickDate}
            />
          )
        ) : null}

        <Text style={styles.label}>Account</Text>
        {accounts.length ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Choose account"
            onPress={() => setPickerOpen(true)}
          >
            <Card
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={styles.heading}>{accounts[accountIndex]?.name}</Text>
              <Text style={styles.linkText}>Change</Text>
            </Card>
          </TouchableOpacity>
        ) : (
          <Text style={styles.muted}>
            Create an account before adding transactions.
          </Text>
        )}

        <Button
          title={create.isPending ? "Saving..." : "Save transaction"}
          onPress={save}
          disabled={create.isPending}
        />
      </ScrollView>
      <BottomSheet
        visible={pickerOpen}
        title="Choose account"
        onClose={() => setPickerOpen(false)}
      >
        {accounts.map((account, index) => (
          <TouchableOpacity
            key={account.id}
            accessibilityRole="button"
            onPress={() => {
              setAccountIndex(index);
              setPickerOpen(false);
            }}
            style={{
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Text
              style={[
                styles.heading,
                index === accountIndex && { color: colors.accentText },
              ]}
            >
              {account.name}
            </Text>
          </TouchableOpacity>
        ))}
      </BottomSheet>
    </Screen>
  );
}
