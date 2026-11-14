import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { CategoryService } from '../../core/services/category.service';
import { ExpenseSubCategory, ExpenseSubCategoryPayload } from '../../models/category';
import { DropdownItem } from '../../models/lookup';

// Validators.required lets "   " through; this doesn't.
function requiredTrimmed(control: AbstractControl): ValidationErrors | null {
  return String(control.value ?? '').trim() ? null : { required: true };
}

@Component({
  selector: 'app-sub-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sub-category-form.component.html',
  styleUrls: ['./sub-category-form.component.scss'],
})
export class SubCategoryFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private subCategoryService = inject(CategoryService);

  @Input() categories: DropdownItem[] = [];
  @Input() subCategoryToEdit: ExpenseSubCategory | null = null;

  @Output() saved = new EventEmitter<ExpenseSubCategory>();
  @Output() cancelled = new EventEmitter<void>();

  isSaving = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  get isEditMode(): boolean {
    return this.subCategoryToEdit !== null;
  }

  form = this.fb.nonNullable.group({
    expenseCategoryId: [null as number | null, Validators.required],
    subCategoryName: ['', [requiredTrimmed, Validators.maxLength(100)]],
    description: ['', Validators.maxLength(500)],
    isActive: [true],
  });

  ngOnInit(): void {
    const sub = this.subCategoryToEdit;
    if (sub) {
      this.form.patchValue({
        expenseCategoryId: sub.categoryId,
        subCategoryName: sub.subCategoryName,
        description: sub.description ?? '',
        isActive: sub.isActive,
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    const payload: ExpenseSubCategoryPayload = {
      expenseCategoryId: raw.expenseCategoryId!,
      subCategoryName: raw.subCategoryName.trim(),
      description: raw.description.trim() || null,
      isActive: raw.isActive,
    };

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const request$: Observable<ExpenseSubCategory> = this.isEditMode
      ? this.subCategoryService.updateSubCategory(this.subCategoryToEdit!.subCategoryId, payload)
      : this.subCategoryService.createSubCategory(payload);

    request$.subscribe({
      next: (sub) => {
        this.isSaving.set(false);
        this.saved.emit(sub);
      },
      error: (err) => {
        this.isSaving.set(false);
        // The API sends { message } for duplicate-name (409) and bad category (400).
        this.errorMessage.set(
          err?.error?.message ??
            `Failed to ${this.isEditMode ? 'update' : 'save'} sub-category. Please try again.`,
        );
      },
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
