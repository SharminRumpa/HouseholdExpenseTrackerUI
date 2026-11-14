// models/account-transaction.ts
export type TransactionType = 'OpeningBalance' | 'Income' | 'Expense' | 'Adjustment';

export const TRANSACTION_TYPES: readonly TransactionType[] = [
  'OpeningBalance',
  'Income',
  'Expense',
  'Adjustment',
];

// The API sends/accepts the raw value; this is only for what the user sees.
export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  OpeningBalance: 'Opening Balance',
  Income: 'Income',
  Expense: 'Expense',
  Adjustment: 'Adjustment',
};

export interface AccountTransaction {
  transactionId: number;
  personalAccountId: number;
  accountName: string;
  accountType: string;
  transactionType: TransactionType;
  transactionDate: string; // yyyy-MM-dd (may arrive as a full ISO datetime)
  details: string;
  debit: number;
  credit: number;
  balanceAfterTransaction: number;
  createdAt: string;
}

export interface AccountTransactionCreate {
  personalAccountId: number;
  transactionType: TransactionType;
  transactionDate: string; // yyyy-MM-dd
  details: string;
  // Exactly one of the two is greater than 0 (the table enforces this too).
  debit: number;
  credit: number;
}

export interface PersonalAccount {
  personalAccountId: number;
  accountName: string;
  accountType: string;
  // Used only to warn before a debit larger than the balance; optional so
  // the page still works if the accounts endpoint doesn't return it.
  currentBalance?: number | null;
}
