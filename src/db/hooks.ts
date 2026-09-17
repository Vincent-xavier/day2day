import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { accountRepository, goalRepository, lendingRepository, taskRepository, transactionRepository } from '@/db/repositories';

export const useAccounts = () => useQuery({ queryKey: ['accounts'], queryFn: () => accountRepository.list() });
export const useCreateAccount = () => { const client = useQueryClient(); return useMutation({ mutationFn: accountRepository.create.bind(accountRepository), onSuccess: () => client.invalidateQueries({ queryKey: ['accounts'] }) }); };
export const useTransactions = () => useQuery({ queryKey: ['transactions'], queryFn: () => transactionRepository.list() });
export const useCreateTransaction = () => { const client = useQueryClient(); return useMutation({ mutationFn: transactionRepository.create.bind(transactionRepository), onSuccess: () => { client.invalidateQueries({ queryKey: ['transactions'] }); client.invalidateQueries({ queryKey: ['dashboard'] }); } }); };
export const useRemoveTransaction = () => { const client = useQueryClient(); return useMutation({ mutationFn: transactionRepository.remove.bind(transactionRepository), onSuccess: () => client.invalidateQueries({ queryKey: ['transactions'] }) }); };
export const useLendingItems = () => useQuery({ queryKey: ['lending'], queryFn: () => lendingRepository.list() });
export const useCreateLending = () => { const client = useQueryClient(); return useMutation({ mutationFn: lendingRepository.create.bind(lendingRepository), onSuccess: () => client.invalidateQueries({ queryKey: ['lending'] }) }); };
export const useLendingPayments = (itemId: string) => useQuery({ queryKey: ['lending-payments', itemId], queryFn: () => lendingRepository.listPayments(itemId), enabled: Boolean(itemId) });
export const useAddLendingPayment = () => { const client = useQueryClient(); return useMutation({ mutationFn: (input: { lendingItemId: string; amountMinor: number; paymentDate?: string; method?: string; note?: string }) => lendingRepository.addPayment(input), onSuccess: (_, input) => { client.invalidateQueries({ queryKey: ['lending'] }); client.invalidateQueries({ queryKey: ['lending-payments', input.lendingItemId] }); } }); };
export const useReturnLending = () => { const client = useQueryClient(); return useMutation({ mutationFn: lendingRepository.markReturned.bind(lendingRepository), onSuccess: () => client.invalidateQueries({ queryKey: ['lending'] }) }); };
export const useGoals = () => useQuery({ queryKey: ['goals'], queryFn: () => goalRepository.list() });
export const useCreateGoal = () => { const client = useQueryClient(); return useMutation({ mutationFn: goalRepository.create.bind(goalRepository), onSuccess: () => client.invalidateQueries({ queryKey: ['goals'] }) }); };
export const useAddGoalSavings = () => { const client = useQueryClient(); return useMutation({ mutationFn: goalRepository.addSavings.bind(goalRepository), onSuccess: () => client.invalidateQueries({ queryKey: ['goals'] }) }); };
export const useTasks = () => useQuery({ queryKey: ['tasks'], queryFn: () => taskRepository.list() });
export const useCreateTask = () => { const client = useQueryClient(); return useMutation({ mutationFn: taskRepository.create.bind(taskRepository), onSuccess: () => client.invalidateQueries({ queryKey: ['tasks'] }) }); };
export const useToggleTask = () => { const client = useQueryClient(); return useMutation({ mutationFn: ({ taskId, completed }: { taskId: string; completed: boolean }) => taskRepository.toggle(taskId, completed), onSuccess: () => client.invalidateQueries({ queryKey: ['tasks'] }) }); };
