import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { AccountTransactionService } from '../../core/services/account-transaction.service';
import { todayString } from '../../core/utils/defaults.util';
import {
  AccountTransaction,
  AccountTransactionCreate,
  TRANSACTION_TYPES,
  TRANSACTION_TYPE_LABELS,
  TransactionType,
  PersonalAccount,
} from '../../models/account-transaction';

import { AuthService } from '../../core/services/auth.service';

type EntrySide = 'credit' | 'debit';

// Validators.required lets "   " through; this doesn't.
function requiredTrimmed(control: AbstractControl): ValidationErrors | null {
  return String(control.value ?? '').trim() ? null : { required: true };
}

@Component({
  selector: 'app-account-transaction-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account-transaction-form.component.html',
  styleUrls: ['./account-transaction-form.component.scss'],
})
export class AccountTransactionFormComponent {
  private fb = inject(FormBuilder);
  private accountTransactionService = inject(AccountTransactionService);
  private authService = inject(AuthService);

  @Input() accounts: PersonalAccount[] = [];

  @Output() saved = new EventEmitter<AccountTransaction>();
  @Output() cancelled = new EventEmitter<void>();

  currentUser = this.authService.currentUser;

  readonly types = TRANSACTION_TYPES;
  readonly typeLabels = TRANSACTION_TYPE_LABELS;

  isSaving = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    personalAccountId: [this.currentUser()?.userId ?? null, Validators.required],
    accountName: [this.currentUser()?.name ?? null, Validators.required],
    transactionType: [null as TransactionType | null, Validators.required],
    transactionDate: [todayString(), Validators.required],
    // Only used when the type is "Adjustment"; every other type has a fixed side.
    direction: ['credit' as EntrySide],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    details: ['', [requiredTrimmed, Validators.maxLength(250)]],
  });

  get isAdjustment(): boolean {
    return this.form.controls.transactionType.value === 'Adjustment';
  }

  // The table allows exactly one of Debit/Credit per row, so the user enters one
  // amount and the side is worked out from the type:
  //   Opening Balance, Income -> credit (money in)
  //   Expense                 -> debit  (money out)
  //   Adjustment              -> whichever the user picks
  get entrySide(): EntrySide | null {
    switch (this.form.controls.transactionType.value) {
      case 'OpeningBalance':
      case 'Income':
        return 'credit';
      case 'Expense':
        return 'debit';
      case 'Adjustment':
        return this.form.controls.direction.value;
      default:
        return null;
    }
  }

  get selectedAccount(): PersonalAccount | undefined {
    const id = this.form.controls.personalAccountId.value;
    return this.accounts.find((account) => account.personalAccountId === id);
  }

  // The balance can't go below zero, so warn early instead of waiting for the
  // server to refuse. Only a hint: the server stays the source of truth.
  get exceedsBalance(): boolean {
    const balance = this.selectedAccount?.currentBalance;
    const amount = this.form.controls.amount.value;
    return this.entrySide === 'debit' && balance != null && amount != null && amount > balance;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const amount = Math.round(raw.amount! * 100) / 100;
    const isDebit = this.entrySide === 'debit';

    const payload: AccountTransactionCreate = {
      personalAccountId: raw.personalAccountId!,
      transactionType: raw.transactionType!,
      transactionDate: raw.transactionDate,
      details: raw.details.trim(),
      debit: isDebit ? amount : 0,
      credit: isDebit ? 0 : amount,
    };

    this.isSaving.set(true);
    this.errorMessage.set(null);

    this.accountTransactionService.create(payload).subscribe({
      next: (transaction) => {
        this.isSaving.set(false);
        this.saved.emit(transaction);
      },
      error: (err) => {
        this.isSaving.set(false);
        // Show the server's reason when it sends one (e.g. "insufficient balance").
        this.errorMessage.set(
          err?.error?.message ?? 'Failed to save transaction. Please try again.',
        );
      },
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
