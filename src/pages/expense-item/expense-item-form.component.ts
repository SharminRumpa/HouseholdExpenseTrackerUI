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
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Observable, of, switchMap, tap } from 'rxjs';
import { ExpenseItemService } from '../../core/services/expense-item.service';
import { LookupService } from '../../core/services/lookup.service';
import { ExpenseItem, ExpenseItemPayload } from '../../models/expense-item';
import { DropdownItem, ExpenseSubCategoryDropdown } from '../../models/lookup';

// Validators.required lets "   " through; this doesn't.
function requiredTrimmed(control: AbstractControl): ValidationErrors | null {
  return String(control.value ?? '').trim() ? null : { required: true };
}

@Component({
  selector: 'app-expense-item-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './expense-item-form.component.html',
  styleUrls: ['./expense-item-form.component.scss'],
})
export class ExpenseItemFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private expenseItemService = inject(ExpenseItemService);
  private lookupService = inject(LookupService);

  @Input() categories: DropdownItem[] = [];
  @Input() itemToEdit: ExpenseItem | null = null;

  @Output() saved = new EventEmitter<ExpenseItem>();
  @Output() cancelled = new EventEmitter<void>();

  subCategories = signal<ExpenseSubCategoryDropdown[]>([]);
  isSaving = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  get isEditMode(): boolean {
    return this.itemToEdit !== null;
  }

  form = this.fb.nonNullable.group({
    // The master category isn't stored on an item — it only exists to
    // drive the sub-category dropdown (and to show the parent in edit mode).
    expenseCategoryId: [null as number | null, Validators.required],
    expenseSubCategoryId: [null as number | null, Validators.required],
    itemName: ['', [requiredTrimmed, Validators.maxLength(150)]],
    description: ['', Validators.maxLength(500)],
    isActive: [true],
  });

  ngOnInit(): void {
    // Pre-fill first, then wire the live watcher — otherwise the watcher
    // would null out the sub-category we just set.
    if (this.itemToEdit) {
      this.initializeEditMode(this.itemToEdit);
    }

    this.watchCategoryChanges();
  }

  private initializeEditMode(item: ExpenseItem): void {
    this.form.patchValue(
      {
        expenseCategoryId: item.expenseCategoryId,
        itemName: item.itemName,
        description: item.description ?? '',
        isActive: item.isActive,
      },
      { emitEvent: false },
    );

    this.lookupService
      .getExpenseSubCategories(item.expenseCategoryId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((subCategories) => {
        this.subCategories.set(subCategories);
        this.form.controls.expenseSubCategoryId.setValue(item.expenseSubCategoryId, {
          emitEvent: false,
        });
      });
  }

  private watchCategoryChanges(): void {
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

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    const payload: ExpenseItemPayload = {
      expenseSubCategoryId: raw.expenseSubCategoryId!,
      itemName: raw.itemName.trim(),
      description: raw.description.trim() || null,
      isActive: raw.isActive,
    };

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const request$: Observable<ExpenseItem> = this.isEditMode
      ? this.expenseItemService.update(this.itemToEdit!.expenseItemId, payload)
      : this.expenseItemService.create(payload);

    request$.subscribe({
      next: (item) => {
        this.isSaving.set(false);
        this.saved.emit(item);
      },
      error: (err) => {
        this.isSaving.set(false);
        // The API sends { message } for duplicate-name (409) and bad
        // sub-category (400); anything else gets the generic text.
        this.errorMessage.set(
          err?.error?.message ??
            `Failed to ${this.isEditMode ? 'update' : 'save'} expense item. Please try again.`,
        );
      },
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
