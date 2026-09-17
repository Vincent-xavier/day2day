import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useCreateLending } from "@/db/hooks";
import {
  BackButton,
  Button,
  Field,
  Screen,
  styles,
  colors,
} from "@/design-system";
import { formatMoney as money } from "@/utils/money";

type Direction = "lent" | "borrowed";

const parseAmount = (value: string) => {
  const normalized = value.replace(/[$,\s]/g, "");
  if (!normalized) return undefined;
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0
    ? Math.round(parsed * 100)
    : null;
};

const isValidDate = (value: string) => {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
};

export default function NewLendingScreen() {
  const router = useRouter();
  const create = useCreateLending();
  const [name, setName] = useState("");
  const [personName, setPersonName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [description, setDescription] = useState("");
  const [direction, setDirection] = useState<Direction>("lent");

  const save = async () => {
    const cleanName = name.trim();
    const cleanPerson = personName.trim();
    const cleanDueAt = dueAt.trim();
    const amountMinor = parseAmount(amount);
    if (!cleanPerson)
      return Alert.alert(
        "Person required",
        "Add the person connected to this balance.",
      );
    if (!cleanName)
      return Alert.alert("Purpose required", "Add what this balance is for.");
    if (!amount.trim())
      return Alert.alert("Amount required", "Add the amount for this balance.");
    if (cleanPerson.length > 120 || cleanName.length > 120)
      return Alert.alert(
        "Entry is too long",
        "Use 120 characters or fewer for the person and purpose.",
      );
    if (amountMinor === null || amountMinor === undefined)
      return Alert.alert(
        "Invalid amount",
        "Enter a positive amount with up to two decimal places.",
      );
    if (!isValidDate(cleanDueAt))
      return Alert.alert(
        "Invalid due date",
        "Use a real date in YYYY-MM-DD format.",
      );
    try {
      await create.mutateAsync({
        name: cleanName,
        personName: cleanPerson,
        direction,
        amountMinor,
        dueAt: cleanDueAt || undefined,
        description: description.trim() || undefined,
      });
      router.back();
    } catch (error) {
      Alert.alert(
        "Could not save ledger entry",
        error instanceof Error ? error.message : "Please try again.",
      );
    }
  };

  const previewAmount = parseAmount(amount);
  const directionColor =
    direction === "lent" ? colors.positive : colors.negative;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.listHeader}>
          <BackButton onPress={() => router.back()} label="" />
          <Text style={styles.heading}>New balance</Text>
          <View style={{ width: 48 }} />
        </View>

        <View style={{ alignItems: "center", marginTop: 18 }}>
          <Text style={styles.muted}>Amount</Text>
          <View style={{ flexDirection: "row", alignItems: "baseline" }}>
            <Text style={[styles.metric, { color: directionColor }]}>$</Text>
            <TextInput
              accessibilityLabel="Amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.muted}
              style={[styles.metric, { color: directionColor, minWidth: 130 }]}
            />
          </View>
          <Text style={styles.muted}>Required</Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            backgroundColor: colors.surfaceMuted,
            borderRadius: 18,
            padding: 4,
            marginTop: 24,
            marginBottom: 26,
          }}
        >
          {(["lent", "borrowed"] as const).map((item) => (
            <TouchableOpacity
              key={item}
              accessibilityRole="button"
              accessibilityState={{ selected: direction === item }}
              onPress={() => setDirection(item)}
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: 12,
                borderRadius: 14,
                backgroundColor:
                  direction === item ? colors.accent : "transparent",
              }}
            >
              <Text
                style={{
                  color: direction === item ? colors.onAccent : colors.text,
                  fontWeight: "800",
                  fontSize: 13,
                }}
              >
                {item === "lent" ? "You lent" : "You borrowed"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Field
          label="Person"
          value={personName}
          onChangeText={setPersonName}
          placeholder="Alex"
          autoCapitalize="words"
          maxLength={120}
        />

        <Field
          label="Purpose"
          value={name}
          onChangeText={setName}
          placeholder="Dinner or cash"
          maxLength={120}
        />
        <Field
          label="Due date (optional)"
          value={dueAt}
          onChangeText={setDueAt}
          placeholder="YYYY-MM-DD"
          maxLength={10}
          autoCapitalize="none"
        />
        <Field
          label="Note (optional)"
          value={description}
          onChangeText={setDescription}
          placeholder="Add a short note"
          multiline
          maxLength={500}
        />

        <Button
          title={create.isPending ? "Saving..." : "Save balance"}
          onPress={save}
          disabled={create.isPending}
        />
      </ScrollView>
    </Screen>
  );
}
