import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AccountsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Accounts</Text>
      <Text style={styles.balance}>$4,250.00</Text>
      <Text style={styles.caption}>Total balance across all accounts</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Quick actions</Text>
        <Link href="/transactions/new" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Add transaction</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/accounts/new" asChild>
          <TouchableOpacity style={[styles.button, styles.secondaryButton]}>
            <Text style={styles.buttonText}>New account</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 24,
  },
  title: {
    color: '#f8fafc',
    fontSize: 30,
    fontWeight: '700',
  },
  balance: {
    color: '#a5b4fc',
    fontSize: 38,
    fontWeight: '800',
    marginTop: 12,
  },
  caption: {
    color: '#cbd5e1',
    fontSize: 14,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 18,
  },
  cardLabel: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#6d5efc',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: '#1e293b',
  },
  buttonText: {
    color: '#f8fafc',
    fontWeight: '700',
    textAlign: 'center',
  },
});
