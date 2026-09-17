import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useAddLendingPayment, useLendingItems, useLendingPayments, useReturnLending } from '@/db/hooks';
import { BackButton, Button, Card, Field, Screen, styles } from '@/design-system';
import { formatMoney, parseMoneyMinor } from '@/utils/money';

const money = formatMoney;

export default function LendingDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const itemId = Array.isArray(id) ? id[0] : id;
  const { data: items = [] } = useLendingItems();
  const item = items.find((entry) => entry.id === itemId);
  const { data: payments = [] } = useLendingPayments(itemId);
  const addPayment = useAddLendingPayment();
  const returned = useReturnLending();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Cash');
  const [note, setNote] = useState('');

  if (!item) return <Screen><BackButton onPress={() => router.back()} /><Card><Text style={styles.heading}>Ledger entry not found</Text><Text style={styles.muted}>It may have been removed.</Text></Card></Screen>;
  const remaining = Math.max((item.amountMinor ?? 0) - item.paidMinor, 0);
  const savePayment = async () => {
    const parsed = parseMoneyMinor(amount);
    if (!parsed.ok) return Alert.alert('Check the payment amount', parsed.error);
    if (parsed.minor > remaining) return Alert.alert('Payment is too large', `The remaining balance is ${money(remaining)}.`);
    try { await addPayment.mutateAsync({ lendingItemId: item.id, amountMinor: parsed.minor, method, note }); setAmount(''); setNote(''); } catch (error) { Alert.alert('Could not save payment', error instanceof Error ? error.message : 'Please try again.'); }
  };
  const settle = async () => {
    try { await returned.mutateAsync(item.id); router.back(); } catch (error) { Alert.alert('Could not settle ledger', error instanceof Error ? error.message : 'Please try again.'); }
  };
  return <Screen><ScrollView contentContainerStyle={{ paddingTop: 8, paddingBottom: 30 }}><BackButton onPress={() => router.back()} /><Text style={styles.eyebrow}>PAYMENT DETAILS</Text><Text style={styles.title}>{item.personName}</Text><Text style={styles.subtitle}>{item.name} · {item.direction === 'lent' ? 'They owe you' : 'You owe them'}</Text><Card><View style={styles.listHeader}><View><Text style={styles.muted}>Remaining</Text><Text style={styles.metric}>{money(remaining)}</Text></View><View style={{ alignItems: 'flex-end' }}><Text style={styles.muted}>Original</Text><Text style={styles.heading}>{item.amountMinor ? money(item.amountMinor) : 'Not set'}</Text></View></View><Text style={styles.muted}>Paid so far: {money(item.paidMinor)}</Text><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${item.amountMinor ? Math.min(item.paidMinor / item.amountMinor, 1) * 100 : 0}%` }]} /></View></Card>{remaining > 0 && item.status !== 'returned' ? <Card><Text style={styles.heading}>Record a payment</Text><Text style={[styles.muted, { marginTop: 6, marginBottom: 16 }]}>Add a partial payment or settle the remaining balance.</Text><Field label="Payment amount" value={amount} onChangeText={setAmount} placeholder={money(remaining)} keyboardType="decimal-pad" /><Field label="Payment method" value={method} onChangeText={setMethod} placeholder="Cash, bank transfer, UPI" /><Field label="Note (optional)" value={note} onChangeText={setNote} placeholder="Reference or context" multiline /><Button title={addPayment.isPending ? 'Saving payment...' : 'Add payment'} onPress={savePayment} disabled={addPayment.isPending || returned.isPending} /></Card> : <Card><Text style={styles.success}>Fully settled</Text><Text style={styles.muted}>All recorded payments cover this balance.</Text></Card>}{item.status !== 'returned' ? <Button title={returned.isPending ? 'Settling...' : 'Mark fully settled'} variant="secondary" disabled={returned.isPending || addPayment.isPending} onPress={() => Alert.alert('Mark as settled?', 'This closes the ledger without recording another payment.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Confirm', onPress: settle }])} /> : null}<Text style={styles.sectionTitle}>Payment history</Text>{payments.length ? payments.map((payment) => <Card key={payment.id}><View style={styles.listHeader}><View><Text style={styles.heading}>{payment.method || 'Payment'}</Text><Text style={styles.muted}>{payment.paymentDate}{payment.note ? ` · ${payment.note}` : ''}</Text></View><Text style={styles.success}>{money(payment.amountMinor)}</Text></View></Card>) : <Card><Text style={styles.muted}>No payments recorded yet.</Text></Card>}</ScrollView></Screen>;
}
