import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initializeDatabase } from '@/db/database';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppErrorBoundary } from '@/components/AppErrorBoundary';

const queryClient = new QueryClient();
export default function RootLayout() { useEffect(() => { initializeDatabase(); }, []); return <AppErrorBoundary><SafeAreaProvider><QueryClientProvider client={queryClient}><Stack screenOptions={{ headerShown: false }} /></QueryClientProvider></SafeAreaProvider></AppErrorBoundary>; }
