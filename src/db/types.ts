export type AccountType = 'cash' | 'bank' | 'savings' | 'credit_card' | 'wallet';
export type TransactionType = 'income' | 'expense' | 'transfer';

export type Account = {
  id: string; name: string; type: AccountType; openingBalanceMinor: number;
  currency: string; color?: string; icon?: string; createdAt: string; updatedAt: string;
};

export type Transaction = {
  id: string; accountId: string; type: TransactionType; amountMinor: number;
  currency: string; description?: string; transactionDate: string; createdAt: string; updatedAt: string;
};

export type Person = { id: string; name: string; phone?: string; email?: string; notes?: string; createdAt: string; updatedAt: string };
export type LendingDirection = 'lent' | 'borrowed';
export type LendingStatus = 'active' | 'returned' | 'overdue';
export type LendingItem = {
  id: string; personId: string; personName: string; direction: LendingDirection; name: string;
  description?: string; amountMinor?: number; paidMinor: number; currency: string; lentAt: string; dueAt?: string;
  returnedAt?: string; status: LendingStatus; createdAt: string; updatedAt: string;
};
export type LendingPayment = {
  id: string; lendingItemId: string; amountMinor: number; paymentDate: string;
  method?: string; note?: string; createdAt: string;
};

export type Goal = {
  id: string;
  name: string;
  targetMinor: number;
  savedMinor: number;
  targetDate?: string;
  status: 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
};

export type Task = {
  id: string;
  title: string;
  notes?: string;
  dueDate?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};
