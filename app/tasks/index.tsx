import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useTasks, useToggleTask } from "@/db/hooks";
import {
  BottomBar,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  styles,
  colors,
} from "@/design-system";

export default function TasksScreen() {
  const router = useRouter();
  const { data: tasks = [], isLoading, isError, refetch } = useTasks();
  const toggle = useToggleTask();
  const [showCompleted, setShowCompleted] = useState(false);
  const visible = tasks.filter((task) => showCompleted || !task.completed);
  const completedCount = tasks.filter((task) => task.completed).length;
  const openCount = tasks.length - completedCount;
  const progress = tasks.length ? completedCount / tasks.length : 0;
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 18 }}>
        <View style={styles.taskWelcome}>
          <View style={styles.accountAvatar}>
            <Text style={styles.accountAvatarText}>D</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.muted}>Hi, let’s make today count</Text>
            <Text style={styles.accountGreeting}>My tasks</Text>
          </View>
        </View>
        <Button title="Add task" onPress={() => router.push("/tasks/new")} />
        {isError ? (
          <ErrorState
            message="Your tasks couldn't load."
            onRetry={() => refetch()}
          />
        ) : isLoading ? (
          <LoadingState label="Loading your tasks..." />
        ) : (
          <>
            <Card style={styles.taskProgressCard}>
              <View style={styles.listHeader}>
                <View>
                  <Text style={styles.muted}>Today&apos;s progress</Text>
                  <Text style={styles.taskProgressTitle}>
                    {openCount
                      ? `${openCount} next step${openCount === 1 ? "" : "s"}`
                      : "All caught up"}
                  </Text>
                </View>
                <Text style={styles.taskProgressPercent}>
                  {Math.round(progress * 100)}%
                </Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progress * 100}%`,
                      backgroundColor: colors.accent,
                    },
                  ]}
                />
              </View>
              <Text style={styles.muted}>
                {completedCount} completed · {openCount} open
              </Text>
            </Card>
            <View style={styles.listHeader}>
              <Text style={styles.sectionTitle}>
                {showCompleted ? "All tasks" : "Up next"}
              </Text>
              <Button
                title={showCompleted ? "Hide done" : "Show done"}
                variant="ghost"
                onPress={() => setShowCompleted((value) => !value)}
              />
            </View>
            {visible.length === 0 ? (
              <EmptyState
                title={showCompleted ? "No tasks yet" : "All caught up"}
                message={
                  showCompleted
                    ? "Add a task for today or your next recurring responsibility."
                    : "Completed tasks are hidden from your working list."
                }
                action="Add task"
                onAction={() => router.push("/tasks/new")}
              />
            ) : (
              visible.map((task) => (
                <Card key={task.id}>
                  <View style={styles.listHeader}>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.heading,
                          task.completed && styles.completedText,
                        ]}
                      >
                        {task.title}
                      </Text>
                      {task.notes ? (
                        <Text style={styles.muted} numberOfLines={1}>
                          {task.notes}
                        </Text>
                      ) : null}
                      {task.dueDate ? (
                        <Text style={styles.muted}>Due {task.dueDate}</Text>
                      ) : null}
                    </View>
                    <Button
                      title={task.completed ? "Reopen" : "Complete"}
                      variant="secondary"
                      onPress={() =>
                        toggle.mutate({
                          taskId: task.id,
                          completed: !task.completed,
                        })
                      }
                    />
                  </View>
                </Card>
              ))
            )}
          </>
        )}
      </ScrollView>
      <BottomBar
        active="tasks"
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
