import { db, id, now } from "@/db/database";
import type {
  Account,
  AccountType,
  Goal,
  LendingDirection,
  LendingItem,
  LendingPayment,
  Task,
  Transaction,
  TransactionType,
} from "@/db/types";

export interface AccountRepository {
  list(): Promise<Account[]>;
  create(input: {
    name: string;
    type: AccountType;
    openingBalanceMinor: number;
  }): Promise<Account>;
}

export interface TransactionRepository {
  list(): Promise<Transaction[]>;
  create(input: {
    accountId: string;
    type: TransactionType;
    amountMinor: number;
    description?: string;
    transactionDate?: string;
  }): Promise<Transaction>;
  remove(transactionId: string): Promise<void>;
}

export interface LendingRepository {
  list(): Promise<LendingItem[]>;
  listPayments(itemId: string): Promise<LendingPayment[]>;
  create(input: {
    name: string;
    personName: string;
    direction: LendingDirection;
    amountMinor?: number;
    dueAt?: string;
    description?: string;
  }): Promise<LendingItem>;
  addPayment(input: {
    lendingItemId: string;
    amountMinor: number;
    paymentDate?: string;
    method?: string;
    note?: string;
  }): Promise<LendingPayment>;
  markReturned(itemId: string): Promise<void>;
}

export interface GoalRepository {
  list(): Promise<Goal[]>;
  create(input: {
    name: string;
    targetMinor: number;
    targetDate?: string;
  }): Promise<Goal>;
  addSavings(input: { goalId: string; amountMinor: number }): Promise<void>;
}

export interface TaskRepository {
  list(): Promise<Task[]>;
  create(input: {
    title: string;
    notes?: string;
    dueDate?: string;
  }): Promise<Task>;
  toggle(taskId: string, completed: boolean): Promise<void>;
}

const mapAccount = (row: any): Account => ({
  id: row.id,
  name: row.name,
  type: row.type,
  openingBalanceMinor: row.opening_balance_minor,
  currency: row.currency,
  color: row.color,
  icon: row.icon,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapTransaction = (row: any): Transaction => ({
  id: row.id,
  accountId: row.account_id,
  type: row.type,
  amountMinor: row.amount_minor,
  currency: row.currency,
  description: row.description,
  transactionDate: row.transaction_date,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const isValidDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
};

const MAX_AMOUNT_MINOR = 10_000_000 * 100;

export class SQLiteAccountRepository implements AccountRepository {
  async list() {
    return (
      await db.getAllAsync<any>(
        "SELECT * FROM accounts WHERE deleted_at IS NULL ORDER BY created_at DESC",
      )
    ).map(mapAccount);
  }
  async create(input: {
    name: string;
    type: AccountType;
    openingBalanceMinor: number;
  }) {
    const name = input.name.trim();
    if (!name || name.length > 120)
      throw new Error("Account name must be between 1 and 120 characters.");
    if (
      !Number.isInteger(input.openingBalanceMinor) ||
      input.openingBalanceMinor < 0
    )
      throw new Error("Opening balance cannot be negative.");
    if (input.openingBalanceMinor > MAX_AMOUNT_MINOR)
      throw new Error("That opening balance looks too large. Double-check it.");
    const timestamp = now();
    const account: Account = {
      id: id(),
      ...input,
      name,
      currency: "USD",
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await db.runAsync(
      "INSERT INTO accounts (id,name,type,opening_balance_minor,currency,created_at,updated_at) VALUES (?,?,?,?,?,?,?)",
      account.id,
      account.name,
      account.type,
      account.openingBalanceMinor,
      account.currency,
      account.createdAt,
      account.updatedAt,
    );
    return account;
  }
}

export class SQLiteTransactionRepository implements TransactionRepository {
  async list() {
    return (
      await db.getAllAsync<any>(
        "SELECT * FROM transactions WHERE deleted_at IS NULL ORDER BY transaction_date DESC, created_at DESC",
      )
    ).map(mapTransaction);
  }
  async create(input: {
    accountId: string;
    type: TransactionType;
    amountMinor: number;
    description?: string;
    transactionDate?: string;
  }) {
    if (!input.accountId) throw new Error("An account is required.");
    if (!Number.isInteger(input.amountMinor) || input.amountMinor <= 0)
      throw new Error("Amount must be greater than zero.");
    if (input.amountMinor > MAX_AMOUNT_MINOR)
      throw new Error("That amount looks too large. Double-check it.");
    if (input.description && input.description.length > 200)
      throw new Error("Description must be 200 characters or fewer.");
    if (
      input.transactionDate &&
      !isValidDate(input.transactionDate.slice(0, 10))
    )
      throw new Error("Transaction date must be a real date.");
    const timestamp = now();
    const transaction: Transaction = {
      id: id(),
      ...input,
      currency: "USD",
      transactionDate: input.transactionDate ?? timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await db.runAsync(
      "INSERT INTO transactions (id,account_id,type,amount_minor,currency,description,transaction_date,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)",
      transaction.id,
      transaction.accountId,
      transaction.type,
      transaction.amountMinor,
      transaction.currency,
      transaction.description ?? null,
      transaction.transactionDate,
      transaction.createdAt,
      transaction.updatedAt,
    );
    return transaction;
  }
  async remove(transactionId: string) {
    await db.runAsync(
      "UPDATE transactions SET deleted_at=?, updated_at=? WHERE id=?",
      now(),
      now(),
      transactionId,
    );
  }
}

const ensurePerson = async (name: string) => {
  const existing = await db.getFirstAsync<any>(
    "SELECT id FROM people WHERE lower(name) = lower(?) AND deleted_at IS NULL LIMIT 1",
    name,
  );
  if (existing) return existing.id;
  const personId = id();
  const timestamp = now();
  await db.runAsync(
    "INSERT INTO people (id,name,created_at,updated_at) VALUES (?,?,?,?)",
    personId,
    name,
    timestamp,
    timestamp,
  );
  return personId;
};

export class SQLiteLendingRepository implements LendingRepository {
  async list() {
    const rows = await db.getAllAsync<any>(
      "SELECT l.*, p.name AS person_name, COALESCE(SUM(lp.amount_minor), 0) AS paid_minor FROM lending_items l JOIN people p ON p.id = l.person_id LEFT JOIN lending_payments lp ON lp.lending_item_id = l.id WHERE l.deleted_at IS NULL GROUP BY l.id ORDER BY l.created_at DESC",
    );
    const today = new Date().toISOString().slice(0, 10);
    return rows.map((row): LendingItem => ({
      id: row.id,
      personId: row.person_id,
      personName: row.person_name,
      direction: row.direction,
      name: row.name,
      description: row.description,
      amountMinor: row.amount_minor,
      paidMinor: row.paid_minor,
      currency: row.currency,
      lentAt: row.lent_at,
      dueAt: row.due_at,
      returnedAt: row.returned_at,
      status:
        row.status === "active" && row.due_at && row.due_at < today
          ? "overdue"
          : row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async listPayments(itemId: string) {
    return (
      await db.getAllAsync<any>(
        "SELECT * FROM lending_payments WHERE lending_item_id = ? ORDER BY payment_date DESC, created_at DESC",
        itemId,
      )
    ).map((row): LendingPayment => ({
      id: row.id,
      lendingItemId: row.lending_item_id,
      amountMinor: row.amount_minor,
      paymentDate: row.payment_date,
      method: row.method,
      note: row.note,
      createdAt: row.created_at,
    }));
  }

  async create(input: {
    name: string;
    personName: string;
    direction: LendingDirection;
    amountMinor?: number;
    dueAt?: string;
    description?: string;
  }) {
    const name = input.name.trim();
    const personName = input.personName.trim();
    const description = input.description?.trim() || undefined;
    if (!name || name.length > 120)
      throw new Error("What it is for must be between 1 and 120 characters.");
    if (!personName || personName.length > 120)
      throw new Error("Person name must be between 1 and 120 characters.");
    if (input.direction !== "lent" && input.direction !== "borrowed")
      throw new Error("Choose whether you give or get.");
    if (
      input.amountMinor !== undefined &&
      (!Number.isInteger(input.amountMinor) || input.amountMinor <= 0)
    )
      throw new Error("Ledger amount must be greater than zero.");
    if (input.amountMinor !== undefined && input.amountMinor > MAX_AMOUNT_MINOR)
      throw new Error("That amount looks too large. Double-check it.");
    if (input.dueAt && !isValidDate(input.dueAt))
      throw new Error("Due date must be a real date in YYYY-MM-DD format.");
    const personId = await ensurePerson(personName);
    const timestamp = now();
    const item = {
      id: id(),
      personId,
      ...input,
      name,
      personName,
      description,
      paidMinor: 0,
      currency: "USD",
      lentAt: timestamp,
      status: "active" as const,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await db.runAsync(
      "INSERT INTO lending_items (id,person_id,direction,name,description,amount_minor,currency,lent_at,due_at,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
      item.id,
      personId,
      input.direction,
      name,
      description ?? null,
      input.amountMinor ?? null,
      item.currency,
      item.lentAt,
      input.dueAt ?? null,
      item.status,
      timestamp,
      timestamp,
    );
    return { ...item, personName };
  }

  async markReturned(itemId: string) {
    const timestamp = now();
    await db.runAsync(
      "UPDATE lending_items SET status='returned', returned_at=?, updated_at=? WHERE id=?",
      timestamp,
      timestamp,
      itemId,
    );
  }

  async addPayment(input: {
    lendingItemId: string;
    amountMinor: number;
    paymentDate?: string;
    method?: string;
    note?: string;
  }) {
    if (!Number.isInteger(input.amountMinor) || input.amountMinor <= 0)
      throw new Error("Payment must be greater than zero.");
    const timestamp = now();
    const payment: LendingPayment = {
      id: id(),
      lendingItemId: input.lendingItemId,
      amountMinor: input.amountMinor,
      paymentDate: input.paymentDate ?? timestamp.slice(0, 10),
      method: input.method?.trim() || undefined,
      note: input.note?.trim() || undefined,
      createdAt: timestamp,
    };
    if (!isValidDate(payment.paymentDate))
      throw new Error("Payment date must be a real date in YYYY-MM-DD format.");
    await db.withTransactionAsync(async () => {
      const item = await db.getFirstAsync<any>(
        "SELECT amount_minor, COALESCE((SELECT SUM(amount_minor) FROM lending_payments WHERE lending_item_id = ?), 0) AS paid_minor FROM lending_items WHERE id = ? AND deleted_at IS NULL",
        input.lendingItemId,
        input.lendingItemId,
      );
      if (!item) throw new Error("Ledger entry was not found.");
      if (
        item.amount_minor !== null &&
        input.amountMinor > item.amount_minor - item.paid_minor
      )
        throw new Error("Payment cannot exceed the remaining balance.");
      await db.runAsync(
        "INSERT INTO lending_payments (id,lending_item_id,amount_minor,payment_date,method,note,created_at) VALUES (?,?,?,?,?,?,?)",
        payment.id,
        payment.lendingItemId,
        payment.amountMinor,
        payment.paymentDate,
        payment.method ?? null,
        payment.note ?? null,
        payment.createdAt,
      );
      if (
        item.amount_minor !== null &&
        item.paid_minor + input.amountMinor >= item.amount_minor
      )
        await db.runAsync(
          "UPDATE lending_items SET status='returned', returned_at=?, updated_at=? WHERE id=?",
          timestamp,
          timestamp,
          input.lendingItemId,
        );
    });
    return payment;
  }
}

export class SQLiteGoalRepository implements GoalRepository {
  async list() {
    return (
      await db.getAllAsync<any>(
        "SELECT * FROM goals WHERE deleted_at IS NULL ORDER BY status, created_at DESC",
      )
    ).map((row): Goal => ({
      id: row.id,
      name: row.name,
      targetMinor: row.target_minor,
      savedMinor: row.saved_minor,
      targetDate: row.target_date,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }
  async create(input: {
    name: string;
    targetMinor: number;
    targetDate?: string;
  }) {
    const timestamp = now();
    const goal: Goal = {
      id: id(),
      ...input,
      savedMinor: 0,
      status: "active",
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await db.runAsync(
      "INSERT INTO goals (id,name,target_minor,saved_minor,target_date,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)",
      goal.id,
      goal.name,
      goal.targetMinor,
      goal.savedMinor,
      goal.targetDate ?? null,
      goal.status,
      goal.createdAt,
      goal.updatedAt,
    );
    return goal;
  }
  async addSavings({
    goalId,
    amountMinor,
  }: {
    goalId: string;
    amountMinor: number;
  }) {
    const timestamp = now();
    await db.runAsync(
      "UPDATE goals SET saved_minor = saved_minor + ?, status = CASE WHEN saved_minor + ? >= target_minor THEN 'completed' ELSE status END, updated_at = ? WHERE id = ?",
      amountMinor,
      amountMinor,
      timestamp,
      goalId,
    );
  }
}

export class SQLiteTaskRepository implements TaskRepository {
  async list() {
    return (
      await db.getAllAsync<any>(
        "SELECT * FROM tasks WHERE deleted_at IS NULL ORDER BY completed, due_date IS NULL, due_date, created_at DESC",
      )
    ).map((row): Task => ({
      id: row.id,
      title: row.title,
      notes: row.notes,
      dueDate: row.due_date,
      completed: Boolean(row.completed),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }
  async create(input: { title: string; notes?: string; dueDate?: string }) {
    const timestamp = now();
    const task: Task = {
      id: id(),
      ...input,
      completed: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await db.runAsync(
      "INSERT INTO tasks (id,title,notes,due_date,completed,created_at,updated_at) VALUES (?,?,?,?,?,?,?)",
      task.id,
      task.title,
      task.notes ?? null,
      task.dueDate ?? null,
      0,
      task.createdAt,
      task.updatedAt,
    );
    return task;
  }
  async toggle(taskId: string, completed: boolean) {
    await db.runAsync(
      "UPDATE tasks SET completed=?, updated_at=? WHERE id=?",
      completed ? 1 : 0,
      now(),
      taskId,
    );
  }
}

export const accountRepository: AccountRepository =
  new SQLiteAccountRepository();
export const transactionRepository: TransactionRepository =
  new SQLiteTransactionRepository();
export const lendingRepository: LendingRepository =
  new SQLiteLendingRepository();
export const goalRepository: GoalRepository = new SQLiteGoalRepository();
export const taskRepository: TaskRepository = new SQLiteTaskRepository();
