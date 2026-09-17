import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { useAddGoalSavings, useGoals } from "@/db/hooks";
import {
  BottomBar,
  Button,
  Card,
  EmptyState,
  Field,
  Screen,
  ScreenHeader,
  styles,
} from "@/design-system";

const money = (minor: number) => `$${(minor / 100).toFixed(2)}`;

export default function GoalsScreen() {
  const { data: goals = [], isLoading } = useGoals();
  const addSavings = useAddGoalSavings();
  const [savingGoalId, setSavingGoalId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const router = useRouter();

  const saveProgress = async () => {
    const parsed = Number(amount);
    if (!savingGoalId || !Number.isFinite(parsed) || parsed <= 0) {
      Alert.alert("Enter a valid savings amount");
      return;
    }
    await addSavings.mutateAsync({
      goalId: savingGoalId,
      amountMinor: Math.round(parsed * 100),
    });
    setSavingGoalId(null);
    setAmount("");
  };

  return (
    <Screen>
      <ScrollView>
        <ScreenHeader
          eyebrow="PROGRESS"
          title="Goals"
          subtitle="Turn intentions into visible progress."
        />
        <Button
          title="Create a goal"
          onPress={() => router.push("/goals/new")}
        />
        {isLoading ? (
          <Text style={styles.muted}>Loading your goals...</Text>
        ) : goals.length === 0 ? (
          <EmptyState
            title="No goals yet"
            message="Create a savings target to give your next milestone a home."
            action="Create a goal"
            onAction={() => router.push("/goals/new")}
          />
        ) : (
          goals.map((goal) => {
            const progress = goal.targetMinor
              ? Math.min(goal.savedMinor / goal.targetMinor, 1)
              : 0;
            return (
              <Card key={goal.id}>
                <View style={styles.listHeader}>
                  <Text style={styles.heading}>{goal.name}</Text>
                  <Text
                    style={
                      goal.status === "completed"
                        ? styles.success
                        : styles.muted
                    }
                  >
                    {goal.status === "completed"
                      ? "Complete"
                      : `${Math.round(progress * 100)}%`}
                  </Text>
                </View>
                <Text style={styles.muted}>
                  {money(goal.savedMinor)} of {money(goal.targetMinor)} saved
                </Text>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${progress * 100}%` },
                    ]}
                  />
                </View>
                {goal.status === "active" ? (
                  savingGoalId === goal.id ? (
                    <View>
                      <Field
                        label="Add savings"
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="decimal-pad"
                        placeholder="25.00"
                      />
                      <Button
                        title={
                          addSavings.isPending ? "Saving..." : "Save progress"
                        }
                        onPress={saveProgress}
                      />
                    </View>
                  ) : (
                    <Button
                      title="Add progress"
                      variant="secondary"
                      onPress={() => setSavingGoalId(goal.id)}
                    />
                  )
                ) : null}
              </Card>
            );
          })
        )}
      </ScrollView>
      <BottomBar
        active="home"
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
