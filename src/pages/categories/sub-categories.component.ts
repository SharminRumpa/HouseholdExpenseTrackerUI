import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CategoryService } from '../../core/services/category.service';
import { LookupService } from '../../core/services/lookup.service';
import { ExpenseSubCategory, ExpenseSubCategoryPayload } from '../../models/category';
import { DropdownItem } from '../../models/lookup';
// Adjust to wherever ConfirmDialogComponent lives in your project.
import { ConfirmDialogComponent } from '../helper/confirm-dialog.component';
import { SubCategoryFormComponent } from './sub-category-form.component';

const PAGE_SIZE = 10;

type StatusFilter = 'all' | 'active' | 'inactive';

@Component({
  selector: 'app-sub-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SubCategoryFormComponent, ConfirmDialogComponent],
  templateUrl: './sub-categories.component.html',
  styleUrls: ['./categories.component.scss'],
})
export class SubCategoriesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private subCategoryService = inject(CategoryService);
  private lookupService = inject(LookupService);

  readonly pageSize = PAGE_SIZE;

  subCategories = signal<ExpenseSubCategory[]>([]);
  categories = signal<DropdownItem[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  currentPage = signal<number>(1);

  // One form instance serves both create and edit.
  showCreateForm = signal<boolean>(false);
  subCategoryBeingEdited = signal<ExpenseSubCategory | null>(null);
  isFormOpen = computed(() => this.showCreateForm() || this.subCategoryBeingEdited() !== null);

  // Is Active switch state.
  togglingId = signal<number | null>(null);
  actionError = signal<string | null>(null);

  // Delete confirmation state.
  subCategoryPendingDelete = signal<ExpenseSubCategory | null>(null);
  isDeleting = signal<boolean>(false);
  deleteErrorMessage = signal<string | null>(null);

  filterForm = this.fb.nonNullable.group({
    expenseCategoryId: [null as number | null],
    status: ['all' as StatusFilter],
    search: [''],
  });

  private filters = toSignal(this.filterForm.valueChanges, {
    initialValue: this.filterForm.getRawValue(),
  });

  hasActiveFilters = computed(() => {
    const f = this.filters();
    return !!(f.expenseCategoryId || (f.status && f.status !== 'all') || f.search?.trim());
  });

  // Every word typed must appear in the category, name or description,
  // so "grocery rice" can match across columns.
  filteredSubCategories = computed(() => {
    const f = this.filters();
    const words = (f.search ?? '').trim().toLowerCase().split(/\s+/).filter(Boolean);

    return this.subCategories().filter((s) => {
      if (f.expenseCategoryId && s.categoryId !== f.expenseCategoryId) return false;
      if (f.status === 'active' && !s.isActive) return false;
      if (f.status === 'inactive' && s.isActive) return false;
      if (!words.length) return true;

      const haystack = [s.categoryName, s.subCategoryName, s.description].join(' ').toLowerCase();
      return words.every((word) => haystack.includes(word));
    });
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredSubCategories().length / this.pageSize)),
  );

  pagedSubCategories = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredSubCategories().slice(start, start + this.pageSize);
  });

  // Keeps the "#" column counting continuously across pages (11, 12, 13...).
  rowNumberOffset = computed(() => (this.currentPage() - 1) * this.pageSize);

  constructor() {
    // Any filter change starts again from page 1.
    this.filterForm.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.currentPage.set(1));
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadSubCategories();
  }

  loadCategories(): void {
    this.lookupService.getExpenseCategories().subscribe({
      next: (categories) => this.categories.set(categories),
    });
  }

  loadSubCategories(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.subCategoryService.getAllExpenseSubCategories().subscribe({
      next: (subCategories) => {
        this.subCategories.set(subCategories);
        // Stay on the current page; only step back if it no longer exists.
        this.currentPage.set(Math.min(this.currentPage(), this.totalPages()));
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load expense sub-categories. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  resetFilters(): void {
    this.filterForm.reset();
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

  // ----- create / edit -----

  openCreateForm(): void {
    this.subCategoryBeingEdited.set(null);
    this.showCreateForm.set(true);
  }

  startEdit(subCategory: ExpenseSubCategory): void {
    this.showCreateForm.set(false);
    this.subCategoryBeingEdited.set(subCategory);
  }

  onSaved(): void {
    this.showCreateForm.set(false);
    this.subCategoryBeingEdited.set(null);
    this.loadSubCategories();
  }

  onFormCancelled(): void {
    this.showCreateForm.set(false);
    this.subCategoryBeingEdited.set(null);
  }

  // ----- active / inactive switch -----

  // ----- active / inactive switch -----

  toggleActive(subCategory: ExpenseSubCategory): void {
    if (this.togglingId() !== null) return; // one request at a time

    this.togglingId.set(subCategory.subCategoryId);
    this.actionError.set(null);

    this.subCategoryService
      .setActiveSubCategoryStatus(subCategory.subCategoryId, !subCategory.isActive)
      .subscribe({
        next: (updated) => {
          // Update just this row instead of reloading the whole list.
          // this.subCategories.update((list) =>
          //   list.map((s) => (s.categoryId === updated.expenseCategoryId ? updated : s)),
          // );
          this.togglingId.set(null);
        },
        error: (err) => {
          this.togglingId.set(null);
          this.actionError.set(err?.error?.message ?? 'Failed to update status. Please try again.');
        },
      });
  }

  // ----- delete -----

  remove(subCategory: ExpenseSubCategory): void {
    this.subCategoryPendingDelete.set(subCategory);
    this.deleteErrorMessage.set(null);
  }

  confirmDelete(): void {
    const subCategory = this.subCategoryPendingDelete();
    if (!subCategory) return;

    this.isDeleting.set(true);
    this.deleteErrorMessage.set(null);

    this.subCategoryService.deleteSubCategory(subCategory.subCategoryId).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.subCategoryPendingDelete.set(null);
        this.loadSubCategories();
      },
      error: (err) => {
        this.isDeleting.set(false);
        // 409 carries "in use - deactivate it instead".
        this.deleteErrorMessage.set(
          err?.error?.message ?? 'Failed to delete sub-category. Please try again.',
        );
      },
    });
  }

  cancelDelete(): void {
    if (this.isDeleting()) return;
    this.subCategoryPendingDelete.set(null);
    this.deleteErrorMessage.set(null);
  }
}
