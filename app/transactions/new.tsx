import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function NewAccountScreen() {
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('0');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New account</Text>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Account name"
        placeholderTextColor="#94a3b8"
        style={styles.input}
      />

      <TextInput
        value={balance}
        onChangeText={setBalance}
        keyboardType="numeric"
        placeholder="Opening balance"
        placeholderTextColor="#94a3b8"
        style={styles.input}
      />

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Save account</Text>
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
    backgroundColor: '#6d5efc',
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
