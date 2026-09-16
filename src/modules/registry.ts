import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function NewTransactionScreen() {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New transaction</Text>

      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Description"
        placeholderTextColor="#94a3b8"
        style={styles.input}
      />

      <TextInput
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder="Amount"
        placeholderTextColor="#94a3b8"
        style={styles.input}
      />

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 24,
  },
  title: {
    color: '#f8fafc',
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 14,
    color: '#f8fafc',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#374151',
  },
  button: {
    backgroundColor: '#22c55e',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
  },
});
