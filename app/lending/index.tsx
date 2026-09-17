import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useLendingItems, useReturnLending } from '@/db/hooks';
import { Card, Button, Screen, styles } from '@/design-system';

export default function LendingScreen() {
  const router = useRouter();
  const { data = [], isLoading } = useLendingItems();
  const returned = useReturnLending();
  const youGive = data.filter((item) => item.status === 'active' && item.direction === 'lent').reduce((sum, item) => sum + (item.amountMinor ?? 0), 0);
  const youGet = data.filter((item) => item.status === 'active' && item.direction === 'borrowed').reduce((sum, item) => sum + (item.amountMinor ?? 0), 0);
  const money = (minor: number) => `$${(minor / 100).toFixed(2)}`;
  return <Screen><ScrollView><Text style={styles.eyebrow}>LEDGERS</Text><Text style={styles.title}>People & balances</Text><Text style={styles.subtitle}>A clear record of what you give, get, and need to follow up on.</Text><Button title="Add ledger entry" onPress={() => router.push('/lending/new')} /><View style={styles.row}><Card style={styles.stat}><Text style={styles.muted}>You give</Text><Text style={[styles.statValue, { color: '#fda4af' }]}>{money(youGive)}</Text></Card><Card style={styles.stat}><Text style={styles.muted}>You get</Text><Text style={[styles.statValue, { color: '#86efac' }]}>{money(youGet)}</Text></Card></View>{isLoading ? <Text style={styles.muted}>Loading...</Text> : data.length === 0 ? <Card><Text style={styles.heading}>No ledger entries</Text><Text style={styles.muted}>Add a person and record the first amount.</Text></Card> : data.map((item) => <Card key={item.id}><View style={styles.listHeader}><View><Text style={styles.heading}>{item.personName}</Text><Text style={styles.muted}>{item.name} · {item.direction === 'lent' ? 'You give' : 'You get'}</Text></View>{item.amountMinor ? <Text style={styles.metric}>{money(item.amountMinor)}</Text> : null}</View>{item.status === 'active' ? <Button title="Mark settled" variant="secondary" onPress={() => returned.mutate(item.id)} /> : <Text style={styles.success}>Settled</Text>}</Card>)}</ScrollView></Screen>;
}
