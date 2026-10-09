import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Income, IncomeCategoryOption } from '../../models/income';
import { IncomeService } from '../../core/services/income.service';
import { DropdownItem, MONTH_NAMES } from '../../models/lookup';

@Component({
  selector: 'app-income-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './income-form.component.html',
  styleUrls: ['./income-form.component.scss'],
})
export class IncomeFormComponent {
  private fb = inject(FormBuilder);
  private incomeService = inject(IncomeService);

  @Input() categories: DropdownItem[] = [];
  @Input() incomeSources: DropdownItem[] = [];
  @Output() created = new EventEmitter<Income>();
  @Output() cancelled = new EventEmitter<void>();

  readonly months = MONTH_NAMES;

  isSaving = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    incomeCategoryId: [null as number | null, Validators.required],
    incomeSourceId: [null as number | null],
    month: [''],
    receivedDate: [this.today(), Validators.required],
    actualDate: [''],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    description: [''],
    paymentMethod: [''],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    this.isSaving.set(true);
    this.errorMessage.set(null);

    this.incomeService
      .create({
        incomeCategoryId: raw.incomeCategoryId!,
        incomeSourceId: raw.incomeSourceId,
        receivedDate: raw.receivedDate,
        actualDate: raw.actualDate || null,
        amount: raw.amount!,
        description: raw.description || null,
        paymentMethod: raw.paymentMethod || null,
        Month: raw.receivedDate.substring(0, 7), // Extract yyyy-MM from receivedDate
      })
      .subscribe({
        next: (income) => {
          this.isSaving.set(false);
          this.created.emit(income);
        },
        error: () => {
          this.isSaving.set(false);
          this.errorMessage.set('Failed to save income. Please try again.');
        },
      });
  }

  cancel(): void {
    this.cancelled.emit();
  }

  private today(): string {
    // Built from local date parts (not toISOString()) so the value matches
    // the user's actual calendar day regardless of UTC offset — e.g. late
    // evening in Bangladesh (UTC+6) would otherwise roll over to tomorrow.
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
