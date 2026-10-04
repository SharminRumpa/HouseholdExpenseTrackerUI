import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { of, switchMap, tap } from 'rxjs';
import { todayString } from '../../core/utils/defaults.util';
import { Expense, ExpenseSearchFilter } from '../../models/expense';
import { ExpenseService } from '../../core/services/expense.service';
import { DropdownItem, ExpenseSubCategoryDropdown } from '../../models/lookup';
import { LookupService } from '../../core/services/lookup.service';


@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './expense-form.component.html',
  styleUrls: ['./expense-form.component.scss']
})
export class ExpenseFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private expenseService = inject(ExpenseService);
  private lookupService = inject(LookupService);

  @Input() categories: DropdownItem[] = [];
  @Output() created = new EventEmitter<Expense>();
  @Output() cancelled = new EventEmitter<void>();

  subCategories = signal<ExpenseSubCategoryDropdown[]>([]);
  expenseItems = signal<DropdownItem[]>([]);
 
  isSaving = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    expenseCategoryId: [null as number | null, Validators.required],
    expenseSubCategoryId: [null as number | null],
    expenseItemId: [null as number | null],
    expenseDate: [todayString(), Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    quantity: [null as number | null, Validators.min(0)],
    unit: [''],
    netWeight: [null as number | null, Validators.min(0)],
    weightUnit: [''],
    paymentMethod: [''],
    expenseBy: [''],
    expenseFor: [''],
    description: ['']
  });

  ngOnInit(): void {
  // Cascading dropdown: reload sub-categories whenever the category changes.
  this.form.controls.expenseCategoryId.valueChanges
    .pipe(
      tap(() => {
        this.form.controls.expenseSubCategoryId.setValue(null);
        this.subCategories.set([]);
      }),
      switchMap((categoryId) =>
        categoryId ? this.lookupService.getExpenseSubCategories(categoryId) : of([])
      ),
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe((subCategories) => this.subCategories.set(subCategories));

  // Cascading dropdown: reload items whenever the sub-category changes.
  this.form.controls.expenseSubCategoryId.valueChanges
    .pipe(
      tap(() => {
        this.form.controls.expenseItemId.setValue(null); // the missing reset
        this.expenseItems.set([]);
      }),
      switchMap((subCategoryId) =>
        subCategoryId ? this.lookupService.getExpenseItems(subCategoryId) : of([])
      ),
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe((items) => this.expenseItems.set(items));
}

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    this.isSaving.set(true);
    this.errorMessage.set(null);

    this.expenseService.create({
      expenseCategoryId: raw.expenseCategoryId!,
      expenseSubCategoryId: raw.expenseSubCategoryId,
      expenseDate: raw.expenseDate,
      amount: raw.amount!,
      quantity: raw.quantity,
      unit: raw.unit || null,
      netWeight: raw.netWeight,
      weightUnit: raw.weightUnit || null,
      paymentMethod: raw.paymentMethod || null,
      expenseBy: raw.expenseBy || null,
      expenseFor: raw.expenseFor || null,
      description: raw.description || null
    }).subscribe({
      next: (expense) => {
        this.isSaving.set(false);
        this.created.emit(expense);
      },
      error: () => {
        this.isSaving.set(false);
        this.errorMessage.set('Failed to save expense. Please try again.');
      }
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}