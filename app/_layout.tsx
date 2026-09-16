import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initializeDatabase } from '@/db/database';

const queryClient = new QueryClient();
export default function RootLayout() { useEffect(() => { initializeDatabase(); }, []); return <QueryClientProvider client={queryClient}><Stack screenOptions={{ headerShown: false }} /></QueryClientProvider>; }
