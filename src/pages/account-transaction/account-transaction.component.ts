import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AccountTransactionService } from '../../core/services/account-transaction.service';
//import { PersonalAccountService } from '../../core/services/personal-account.service';
import {
  AccountTransaction,
  TRANSACTION_TYPES,
  TRANSACTION_TYPE_LABELS,
  TransactionType,
  PersonalAccount,
} from '../../models/account-transaction';
//import { PersonalAccount } from '../../models/personal-account';
// Adjust to wherever ConfirmDialogComponent lives in your project.
import { ConfirmDialogComponent } from '../helper/confirm-dialog.component';
import { AccountTransactionFormComponent } from './account-transaction-form.component';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-account-transaction',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AccountTransactionFormComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './account-transaction.component.html',
  styleUrls: ['./account-transaction.component.scss'],
})
export class AccountTransactionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private transactionService = inject(AccountTransactionService);
  //private accountService = inject(PersonalAccountService);

  readonly types = TRANSACTION_TYPES;
  readonly typeLabels = TRANSACTION_TYPE_LABELS;
  readonly pageSize = PAGE_SIZE;

  transactions = signal<AccountTransaction[]>([]);
  accounts = signal<PersonalAccount[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  showCreateForm = signal<boolean>(false);

  transactionPendingDelete = signal<AccountTransaction | null>(null);
  isDeleting = signal<boolean>(false);
  deleteErrorMessage = signal<string | null>(null);

  currentPage = signal<number>(1);

  // The API returns everything, so filtering, search and paging all happen here.
  filterForm = this.fb.nonNullable.group({
    fromDate: [''],
    toDate: [''],
    personalAccountId: [null as number | null],
    transactionType: [null as TransactionType | null],
    search: [''],
  });

  private filters = toSignal(this.filterForm.valueChanges, {
    initialValue: this.filterForm.getRawValue(),
  });

  hasActiveFilters = computed(() => {
    const f = this.filters();
    return !!(
      f.fromDate ||
      f.toDate ||
      f.personalAccountId ||
      f.transactionType ||
      f.search?.trim()
    );
  });

  // Every word typed must appear somewhere in the row, so "cash salary" can match
  // an account name and the details text together.
  filteredTransactions = computed(() => {
    const f = this.filters();
    const words = (f.search ?? '').trim().toLowerCase().split(/\s+/).filter(Boolean);

    return this.transactions().filter((t) => {
      const date = t.transactionDate.slice(0, 10); // yyyy-MM-dd compares correctly as text
      if (f.fromDate && date < f.fromDate) return false;
      if (f.toDate && date > f.toDate) return false;
      if (f.personalAccountId && t.personalAccountId !== f.personalAccountId) return false;
      if (f.transactionType && t.transactionType !== f.transactionType) return false;
      if (!words.length) return true;

      const haystack = [
        t.accountName,
        t.accountType,
        this.typeLabel(t.transactionType),
        t.details,
        t.debit,
        t.credit,
        t.balanceAfterTransaction,
      ]
        .join(' ')
        .toLowerCase();

      return words.every((word) => haystack.includes(word));
    });
  });

  totalDebit = computed(() => this.filteredTransactions().reduce((sum, t) => sum + t.debit, 0));
  totalCredit = computed(() => this.filteredTransactions().reduce((sum, t) => sum + t.credit, 0));

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredTransactions().length / this.pageSize)),
  );

  pagedTransactions = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredTransactions().slice(start, start + this.pageSize);
  });

  rowNumberOffset = computed(() => (this.currentPage() - 1) * this.pageSize);

  ngOnInit(): void {
    this.loadAccounts();
    this.loadTransactions();
  }

  applyFilters(): void {
    this.currentPage.set(1);
  }

  loadAccounts(): void {
    this.transactionService.getAll().subscribe({
      next: (accounts) => this.accounts.set(accounts),
    });
  }

  loadTransactions(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.transactionService.getAll().subscribe({
      next: (transactions) => {
        this.transactions.set(transactions);
        this.currentPage.set(Math.min(this.currentPage(), this.totalPages()));
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load transactions. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  typeLabel(type: string): string {
    return this.typeLabels[type as TransactionType] ?? type;
  }

  // Any filter change starts again from page 1.
  onFilterChanged(): void {
    this.currentPage.set(1);
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  openCreateForm(): void {
    this.showCreateForm.set(true);
  }

  onSaved(): void {
    this.showCreateForm.set(false);
    // A new account balance changes, so reload both lists.
    this.loadAccounts();
    this.loadTransactions();
  }

  onFormCancelled(): void {
    this.showCreateForm.set(false);
  }

  remove(transaction: AccountTransaction): void {
    this.transactionPendingDelete.set(transaction);
    this.deleteErrorMessage.set(null);
  }

  confirmDelete(): void {
    const transaction = this.transactionPendingDelete();
    if (!transaction) return;

    this.isDeleting.set(true);
    this.deleteErrorMessage.set(null);

    this.transactionService.delete(transaction.transactionId).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.transactionPendingDelete.set(null);
        this.loadAccounts();
        this.loadTransactions();
      },
      error: (err) => {
        this.isDeleting.set(false);
        // e.g. the server refuses when removing the row would make a balance negative.
        this.deleteErrorMessage.set(
          err?.error?.message ?? err?.message ?? 'Failed to delete transaction. Please try again.',
        );
      },
    });
  }

  cancelDelete(): void {
    if (this.isDeleting()) return;
    this.transactionPendingDelete.set(null);
    this.deleteErrorMessage.set(null);
  }
}
