import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { accountRepository, lendingRepository } from '@/db/repositories';

export const useAccounts = () => useQuery({ queryKey: ['accounts'], queryFn: () => accountRepository.list() });
export const useCreateAccount = () => { const client = useQueryClient(); return useMutation({ mutationFn: accountRepository.create.bind(accountRepository), onSuccess: () => client.invalidateQueries({ queryKey: ['accounts'] }) }); };
export const useLendingItems = () => useQuery({ queryKey: ['lending'], queryFn: () => lendingRepository.list() });
export const useCreateLending = () => { const client = useQueryClient(); return useMutation({ mutationFn: lendingRepository.create.bind(lendingRepository), onSuccess: () => client.invalidateQueries({ queryKey: ['lending'] }) }); };
export const useReturnLending = () => { const client = useQueryClient(); return useMutation({ mutationFn: lendingRepository.markReturned.bind(lendingRepository), onSuccess: () => client.invalidateQueries({ queryKey: ['lending'] }) }); };
