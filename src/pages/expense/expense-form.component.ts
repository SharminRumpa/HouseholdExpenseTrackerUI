import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, of, switchMap, tap } from 'rxjs';
import { todayString } from '../../core/utils/defaults.util';
import { Expense } from '../../models/expense';
import { ExpenseService } from '../../core/services/expense.service';
import { DropdownItem, ExpenseSubCategoryDropdown } from '../../models/lookup';
import { LookupService } from '../../core/services/lookup.service';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './expense-form.component.html',
  styleUrls: ['./expense-form.component.scss'],
})
export class ExpenseFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private expenseService = inject(ExpenseService);
  private lookupService = inject(LookupService);

  @Input() categories: DropdownItem[] = [];
  @Input() expenseToEdit: Expense | null = null;

  // Fires for both create and update — the modal/page that hosts this form
  // doesn't need to care which one happened.
  @Output() saved = new EventEmitter<Expense>();
  @Output() cancelled = new EventEmitter<void>();

  subCategories = signal<ExpenseSubCategoryDropdown[]>([]);
  expenseItems = signal<DropdownItem[]>([]);

  isSaving = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  get isEditMode(): boolean {
    return this.expenseToEdit !== null;
  }

  form = this.fb.nonNullable.group({
    expenseCategoryId: [null as number | null, Validators.required],
    expenseSubCategoryId: [null as number | null, Validators.required],
    expenseItemId: [null as number | null, Validators.required],
    expenseDate: [todayString(), Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    quantity: [null as number | null, Validators.min(0)],
    unit: [''],
    netWeight: [null as number | null, Validators.min(0)],
    weightUnit: [''],
    paymentMethod: [''],
    expenseBy: [''],
    expenseFor: [''],
    description: [''],
  });

  ngOnInit(): void {
    // Pre-fill (and load the dependent dropdown lists) BEFORE the live
    // cascade watchers below are wired up — otherwise the category watcher
    // would immediately null out the sub-category/item we just set.
    if (this.expenseToEdit) {
      this.initializeEditMode(this.expenseToEdit);
    }
    console.log('ExpenseFormComponent initialized with expenseToEdit:', this.expenseToEdit);

    this.watchCategoryChanges();
    this.watchSubCategoryChanges();
  }

  private initializeEditMode(expense: Expense): void {
    this.form.patchValue(
      {
        expenseCategoryId: expense.expenseCategoryId,
        expenseDate: expense.expenseDate,
        amount: expense.amount,
        quantity: expense.quantity ?? null,
        unit: expense.unit ?? '',
        netWeight: expense.netWeight ?? null,
        weightUnit: expense.weightUnit ?? '',
        paymentMethod: expense.paymentMethod ?? '',
        expenseBy: expense.expenseBy ?? '',
        expenseFor: expense.expenseFor ?? '',
        description: expense.description ?? '',
      },
      { emitEvent: false },
    );

    if (!expense.expenseCategoryId) return;

    // One flat chain instead of nested subscribes, so a single
    // takeUntilDestroyed covers both the sub-category and item lookups —
    // if the modal closes mid-request, nothing left dangling.
    this.lookupService
      .getExpenseSubCategories(expense.expenseCategoryId)
      .pipe(
        tap((subCategories) => {
          this.subCategories.set(subCategories);
          this.form.controls.expenseSubCategoryId.setValue(expense.expenseSubCategoryId ?? null, {
            emitEvent: false,
          });
        }),
        switchMap(() =>
          expense.expenseSubCategoryId
            ? this.lookupService.getExpenseItems(expense.expenseSubCategoryId)
            : of([]),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((items) => {
        this.expenseItems.set(items);
        console.log('Setting expenseItemId to:', expense.expenseItemId);
        this.form.controls.expenseItemId.setValue(expense.expenseItemId ?? null, {
          emitEvent: false,
        });
      });
  }

  private watchCategoryChanges(): void {
    // Cascading dropdown: reload sub-categories whenever the category changes.
    this.form.controls.expenseCategoryId.valueChanges
      .pipe(
        tap(() => {
          this.form.controls.expenseSubCategoryId.setValue(null);
          this.subCategories.set([]);
        }),
        switchMap((categoryId) =>
          categoryId ? this.lookupService.getExpenseSubCategories(categoryId) : of([]),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((subCategories) => this.subCategories.set(subCategories));
  }

  private watchSubCategoryChanges(): void {
    // Cascading dropdown: reload items whenever the sub-category changes.
    this.form.controls.expenseSubCategoryId.valueChanges
      .pipe(
        tap(() => {
          this.form.controls.expenseItemId.setValue(null);
          this.expenseItems.set([]);
        }),
        switchMap((subCategoryId) =>
          subCategoryId ? this.lookupService.getExpenseItems(subCategoryId) : of([]),
        ),
        takeUntilDestroyed(this.destroyRef),
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

    const payload = {
      expenseCategoryId: raw.expenseCategoryId!,
      expenseSubCategoryId: raw.expenseSubCategoryId,
      expenseItemId: raw.expenseItemId,
      expenseDate: raw.expenseDate,
      amount: raw.amount!,
      quantity: raw.quantity,
      unit: raw.unit || null,
      netWeight: raw.netWeight,
      weightUnit: raw.weightUnit || null,
      paymentMethod: raw.paymentMethod || null,
      expenseBy: raw.expenseBy || null,
      expenseFor: raw.expenseFor || null,
      description: raw.description || null,
    };

    const request$: Observable<Expense> = this.isEditMode
      ? this.expenseService.update(this.expenseToEdit!.expenseId, payload)
      : this.expenseService.create(payload);

    request$.subscribe({
      next: (expense) => {
        this.isSaving.set(false);
        this.saved.emit(expense);
      },
      error: () => {
        this.isSaving.set(false);
        this.errorMessage.set(
          `Failed to ${this.isEditMode ? 'update' : 'save'} expense. Please try again.`,
        );
      },
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
