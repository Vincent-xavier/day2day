import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AccountsIndex() {
  const accounts = [
    { name: 'Main Wallet', balance: '$1,450.00', color: '#6d5efc' },
    { name: 'Savings', balance: '$2,000.00', color: '#22c55e' },
    { name: 'Travel Fund', balance: '$800.00', color: '#f59e0b' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Accounts</Text>
      {accounts.map((account) => (
        <View key={account.name} style={styles.accountCard}>
          <View style={[styles.dot, { backgroundColor: account.color }]} />
          <View style={styles.accountMeta}>
            <Text style={styles.accountName}>{account.name}</Text>
            <Text style={styles.accountBalance}>{account.balance}</Text>
          </View>
        </View>
      ))}

      <Link href="/accounts/new" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Add account</Text>
        </TouchableOpacity>
      </Link>
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
    marginBottom: 18,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 14,
  },
  accountMeta: {
    flex: 1,
  },
  accountName: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
  },
  accountBalance: {
    color: '#a5b4fc',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#6d5efc',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 18,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
});
