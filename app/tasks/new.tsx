import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useCreateTask } from "@/db/hooks";
import {
  BackButton,
  Button,
  Field,
  Screen,
  styles,
  colors,
} from "@/design-system";

const toISODate = (date: Date) => date.toISOString().slice(0, 10);
const dueDatePresets = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  return [
    { label: "Today", value: toISODate(today) },
    { label: "Tomorrow", value: toISODate(tomorrow) },
    { label: "Next week", value: toISODate(nextWeek) },
  ];
};

export default function NewTaskScreen() {
  const router = useRouter();
  const create = useCreateTask();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");
  const presets = dueDatePresets();
  const save = async () => {
    if (!title.trim()) return Alert.alert("Task title is required");
    try {
      await create.mutateAsync({
        title: title.trim(),
        notes: notes.trim() || undefined,
        dueDate: dueDate || undefined,
      });
      router.back();
    } catch (error) {
      Alert.alert(
        "Could not save task",
        error instanceof Error ? error.message : "Please try again.",
      );
    }
  };
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingTop: 8, paddingBottom: 30 }}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.title}>New task</Text>
        <Text style={styles.subtitle}>Capture one clear next action.</Text>
        <Field
          label="Task title"
          value={title}
          onChangeText={setTitle}
          placeholder="Review monthly spending"
        />
        <Text style={styles.label}>Due date (optional)</Text>
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
          {presets.map((preset) => (
            <TouchableOpacity
              key={preset.label}
              accessibilityRole="button"
              accessibilityState={{ selected: dueDate === preset.value }}
              onPress={() =>
                setDueDate(dueDate === preset.value ? "" : preset.value)
              }
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 15,
                borderWidth: 1,
                borderColor:
                  dueDate === preset.value ? colors.accent : colors.border,
                backgroundColor:
                  dueDate === preset.value ? colors.accent : "transparent",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color:
                    dueDate === preset.value
                      ? colors.onAccent
                      : colors.accentText,
                  fontWeight: "700",
                  fontSize: 13,
                }}
              >
                {preset.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Field
          label="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="Keep it small and specific"
          multiline
        />
        <Button
          title={create.isPending ? "Saving..." : "Save task"}
          onPress={save}
          disabled={create.isPending}
        />
      </ScrollView>
    </Screen>
  );
}
