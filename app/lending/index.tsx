import { Link } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useLendingItems, useReturnLending } from '@/db/hooks';
import { Card, Button, Screen, styles } from '@/design-system';

export default function LendingScreen() { const { data = [], isLoading } = useLendingItems(); const returned = useReturnLending(); return <Screen><ScrollView><Text style={styles.title}>Lending</Text><Text style={styles.subtitle}>Keep track of what you lent and borrowed.</Text><Link href="/lending/new" asChild><View><Button title="Add lending record" /></View></Link>{isLoading ? <Text style={styles.muted}>Loading...</Text> : data.map((item) => <Card key={item.id}><Text style={styles.heading}>{item.name}</Text><Text style={styles.muted}>{item.direction} · {item.personName}</Text>{item.amountMinor ? <Text style={{ color: '#a5b4fc', fontSize: 20, fontWeight: '700', marginTop: 8 }}>${(item.amountMinor / 100).toFixed(2)}</Text> : null}{item.status === 'active' ? <Button title="Mark returned" variant="secondary" onPress={() => returned.mutate(item.id)} /> : <Text style={{ color: '#86efac', marginTop: 10 }}>Returned</Text>}</Card>)}</ScrollView></Screen>; }
