import { Link } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useTasks, useToggleTask } from '@/db/hooks';
import { Button, Card, Screen, styles } from '@/design-system';

export default function TasksScreen() {
  const { data: tasks = [], isLoading } = useTasks();
  const toggle = useToggleTask();
  return <Screen><ScrollView><Text style={styles.eyebrow}>EXECUTION</Text><Text style={styles.title}>Tasks</Text><Text style={styles.subtitle}>Keep the next useful action close at hand.</Text><Link href="/tasks/new" asChild><View><Button title="Add task" /></View></Link>{isLoading ? <Text style={styles.muted}>Loading...</Text> : tasks.length === 0 ? <Card><Text style={styles.heading}>Nothing queued</Text><Text style={styles.muted}>Add a task for today or your next recurring responsibility.</Text></Card> : tasks.map((task) => <Card key={task.id}><View style={styles.listHeader}><Text style={[styles.heading, task.completed && styles.completedText]}>{task.title}</Text><Button title={task.completed ? 'Reopen' : 'Complete'} variant="secondary" onPress={() => toggle.mutate({ taskId: task.id, completed: !task.completed })} /></View>{task.notes ? <Text style={styles.muted}>{task.notes}</Text> : null}{task.dueDate ? <Text style={styles.muted}>Due {task.dueDate}</Text> : null}</Card>)}</ScrollView></Screen>;
}
