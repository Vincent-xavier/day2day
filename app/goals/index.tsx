import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useAddGoalSavings, useGoals } from '@/db/hooks';
import { Button, Card, Field, Screen, styles } from '@/design-system';

const money = (minor: number) => `$${(minor / 100).toFixed(2)}`;

export default function GoalsScreen() {
  const { data: goals = [], isLoading } = useGoals();
  const addSavings = useAddGoalSavings();
  const [savingGoalId, setSavingGoalId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const router = useRouter();

  const saveProgress = async () => {
    const parsed = Number(amount);
    if (!savingGoalId || !Number.isFinite(parsed) || parsed <= 0) {
      Alert.alert('Enter a valid savings amount');
      return;
    }
    await addSavings.mutateAsync({ goalId: savingGoalId, amountMinor: Math.round(parsed * 100) });
    setSavingGoalId(null);
    setAmount('');
  };

  return (
    <Screen>
      <ScrollView>
        <Text style={styles.eyebrow}>PROGRESS</Text>
        <Text style={styles.title}>Goals</Text>
        <Text style={styles.subtitle}>Turn intentions into visible progress.</Text>
        <Button title="Create a goal" onPress={() => router.push('/goals/new')} />
        {isLoading ? <Text style={styles.muted}>Loading...</Text> : goals.length === 0 ? (
          <Card><Text style={styles.heading}>No goals yet</Text><Text style={styles.muted}>Create a savings target to give your next milestone a home.</Text></Card>
        ) : goals.map((goal) => {
          const progress = goal.targetMinor ? Math.min(goal.savedMinor / goal.targetMinor, 1) : 0;
          return (
            <Card key={goal.id}>
              <View style={styles.listHeader}><Text style={styles.heading}>{goal.name}</Text><Text style={goal.status === 'completed' ? styles.success : styles.muted}>{goal.status === 'completed' ? 'Complete' : `${Math.round(progress * 100)}%`}</Text></View>
              <Text style={styles.muted}>{money(goal.savedMinor)} of {money(goal.targetMinor)} saved</Text>
              <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress * 100}%` }]} /></View>
              {goal.status === 'active' ? (savingGoalId === goal.id ? (
                <View><Field label="Add savings" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="25.00" /><Button title={addSavings.isPending ? 'Saving...' : 'Save progress'} onPress={saveProgress} /></View>
              ) : <Button title="Add progress" variant="secondary" onPress={() => setSavingGoalId(goal.id)} />) : null}
            </Card>
          );
        })}
        <Button title="Back to modules" variant="secondary" onPress={() => router.push('/modules')} />
      </ScrollView>
    </Screen>
  );
}
