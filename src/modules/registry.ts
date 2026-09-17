import type { Href } from 'expo-router';

export type ModuleDefinition = { id: string; title: string; description: string; icon: string; color: string; route: Href };
export const appModules: ModuleDefinition[] = [
  { id: 'accounts', title: 'Accounts', description: 'Track balances, transactions, and monthly cash flow.', icon: '💳', color: '#6d5efc', route: '/accounts' },
  { id: 'lending', title: 'Ledgers', description: 'Track who owes you, who you owe, and follow-ups in one place.', icon: '🤝', color: '#22c55e', route: '/lending' },
  { id: 'goals', title: 'Goals', description: 'Track progress toward saving and personal goals.', icon: '🎯', color: '#f59e0b', route: '/goals' as Href },
  { id: 'tasks', title: 'Tasks', description: 'Organize daily actions and recurring responsibilities.', icon: '✅', color: '#ef4444', route: '/tasks' as Href },
];
