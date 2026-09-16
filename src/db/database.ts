export type ModuleDefinition = {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  route: string;
};

export const appModules: ModuleDefinition[] = [
  {
    id: 'accounts',
    title: 'Accounts',
    description: 'Track balances, transactions, and monthly cash flow.',
    icon: '💳',
    color: '#6d5efc',
    route: '/accounts',
  },
  {
    id: 'lending',
    title: 'Lending',
    description: 'Monitor what you lent, borrowed, and need to follow up on.',
    icon: '🤝',
    color: '#22c55e',
    route: '/modules',
  },
  {
    id: 'goals',
    title: 'Goals',
    description: 'Track progress toward saving, spending, and personal goals.',
    icon: '🎯',
    color: '#f59e0b',
    route: '/modules',
  },
  {
    id: 'tasks',
    title: 'Tasks',
    description: 'Organize daily actions and recurring responsibilities.',
    icon: '✅',
    color: '#ef4444',
    route: '/modules',
  },
];
