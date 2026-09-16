import { db, id, now } from '@/db/database';
import type { Account, AccountType, LendingDirection, LendingItem, Person } from '@/db/types';

export interface AccountRepository {
  list(): Promise<Account[]>; create(input: { name: string; type: AccountType; openingBalanceMinor: number }): Promise<Account>;
}
export interface LendingRepository {
  list(): Promise<LendingItem[]>; create(input: { name: string; personName: string; direction: LendingDirection; amountMinor?: number; dueAt?: string; description?: string }): Promise<LendingItem>;
  markReturned(id: string): Promise<void>;
}

const mapAccount = (row: any): Account => ({ id: row.id, name: row.name, type: row.type, openingBalanceMinor: row.opening_balance_minor, currency: row.currency, color: row.color, icon: row.icon, createdAt: row.created_at, updatedAt: row.updated_at });

export class SQLiteAccountRepository implements AccountRepository {
  async list() {
    return db.getAllSync<any>('SELECT * FROM accounts WHERE deleted_at IS NULL ORDER BY created_at DESC').map(mapAccount);
  }
  async create(input: { name: string; type: AccountType; openingBalanceMinor: number }) {
    const timestamp = now(); const account = { id: id(), ...input, currency: 'USD', createdAt: timestamp, updatedAt: timestamp };
    db.runSync('INSERT INTO accounts (id,name,type,opening_balance_minor,currency,created_at,updated_at) VALUES (?,?,?,?,?,?,?)', account.id, account.name, account.type, account.openingBalanceMinor, account.currency, account.createdAt, account.updatedAt);
    return account;
  }
}

const ensurePerson = (name: string) => {
  const existing = db.getFirstSync<any>('SELECT * FROM people WHERE name = ? AND deleted_at IS NULL LIMIT 1', name);
  if (existing) return existing.id;
  const personId = id(); const timestamp = now();
  db.runSync('INSERT INTO people (id,name,created_at,updated_at) VALUES (?,?,?,?)', personId, name, timestamp, timestamp);
  return personId;
};

export class SQLiteLendingRepository implements LendingRepository {
  async list() {
    const rows = db.getAllSync<any>('SELECT l.*, p.name AS person_name FROM lending_items l JOIN people p ON p.id = l.person_id WHERE l.deleted_at IS NULL ORDER BY l.created_at DESC');
    return rows.map((row): LendingItem => ({ id: row.id, personId: row.person_id, personName: row.person_name, direction: row.direction, name: row.name, description: row.description, amountMinor: row.amount_minor, currency: row.currency, lentAt: row.lent_at, dueAt: row.due_at, returnedAt: row.returned_at, status: row.status, createdAt: row.created_at, updatedAt: row.updated_at }));
  }
  async create(input: { name: string; personName: string; direction: LendingDirection; amountMinor?: number; dueAt?: string; description?: string }) {
    const personId = ensurePerson(input.personName); const timestamp = now(); const item = { id: id(), personId, ...input, currency: 'USD', lentAt: timestamp, status: 'active' as const, createdAt: timestamp, updatedAt: timestamp };
    db.runSync('INSERT INTO lending_items (id,person_id,direction,name,description,amount_minor,currency,lent_at,due_at,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', item.id, personId, input.direction, input.name, input.description ?? null, input.amountMinor ?? null, item.currency, item.lentAt, input.dueAt ?? null, item.status, timestamp, timestamp);
    return { ...item, personName: input.personName };
  }
  async markReturned(itemId: string) { const timestamp = now(); db.runSync("UPDATE lending_items SET status='returned', returned_at=?, updated_at=? WHERE id=?", timestamp, timestamp, itemId); }
}

export const accountRepository: AccountRepository = new SQLiteAccountRepository();
export const lendingRepository: LendingRepository = new SQLiteLendingRepository();
