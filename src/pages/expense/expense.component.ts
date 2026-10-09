import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ConfirmDialogComponent } from '../helper/confirm-dialog.component';
import { ExpenseFormComponent } from './expense-form.component';
import { Expense, ExpenseSearchFilter } from '../../models/expense';
import { ExpenseService } from '../../core/services/expense.service';
import { firstOfMonthString, todayString } from '../../core/utils/defaults.util';
import { DropdownItem } from '../../models/lookup';
import { LookupService } from '../../core/services/lookup.service';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-expense',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ExpenseFormComponent, ConfirmDialogComponent],
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.scss'],
})
export class ExpenseComponent implements OnInit {
  private fb = inject(FormBuilder);
  private expenseService = inject(ExpenseService);
  private lookupService = inject(LookupService);

  categories = signal<DropdownItem[]>([]);
  expenses = signal<Expense[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  showCreateForm = signal<boolean>(false);
  expenseBeingEdited = signal<Expense | null>(null);
  isFormOpen = computed(() => this.showCreateForm() || this.expenseBeingEdited() !== null);

  expensePendingDelete = signal<Expense | null>(null);
  isDeleting = signal<boolean>(false);
  deleteErrorMessage = signal<string | null>(null);

  currentPage = signal<number>(1);

  readonly pageSize = PAGE_SIZE;

  filterForm = this.fb.nonNullable.group({
    fromDate: [firstOfMonthString()],
    toDate: [todayString()],
    categoryId: [null as number | null],
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.expenses().length / this.pageSize)));

  pagedExpenses = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.expenses().slice(start, start + this.pageSize);
  });

  // The row number offset for the current page, so the table's "#" column
  // counts continuously (11, 12, 13...) instead of restarting at 1 on every page.
  rowNumberOffset = computed(() => (this.currentPage() - 1) * this.pageSize);

  // Total of all rows matching the current filters (not just the visible page).
  totalAmount = computed(() => this.expenses().reduce((sum, expense) => sum + expense.amount, 0));

  ngOnInit(): void {
    this.loadCategories();
    this.loadExpenses();
  }

  loadCategories(): void {
    this.lookupService.getExpenseCategories().subscribe({
      next: (categories) => this.categories.set(categories),
    });
  }

  loadExpenses(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const filter: ExpenseSearchFilter = this.filterForm.getRawValue();

    this.expenseService.getAll(filter).subscribe({
      next: (expenses) => {
        this.expenses.set(expenses);
        this.currentPage.set(1);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load expense records. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  applyFilters(): void {
    this.loadExpenses();
  }

  resetFilters(): void {
    this.filterForm.reset({
      fromDate: firstOfMonthString(),
      toDate: todayString(),
      categoryId: null,
    });
    this.loadExpenses();
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
    this.expenseBeingEdited.set(null);
    this.showCreateForm.set(true);
  }

  onExpenseSaved(): void {
    this.expenseBeingEdited.set(null);
    this.showCreateForm.set(false);
    this.loadExpenses();
  }

  onCreateCancelled(): void {
    this.showCreateForm.set(false);
    this.expenseBeingEdited.set(null);
  }

  startEdit(expense: Expense): void {
    this.showCreateForm.set(false);
    console.log('Editing expense:', expense);
    this.expenseBeingEdited.set(expense);
  }

  remove(expense: Expense): void {
    this.expensePendingDelete.set(expense);
    this.deleteErrorMessage.set(null);
  }

  confirmDelete(remarks: string | null): void {
    const expense = this.expensePendingDelete();
    if (!expense) return;

    this.isDeleting.set(true);
    this.deleteErrorMessage.set(null);

    console.log(expense);

    const payload = {
      id: expense.expenseId,
      reason: remarks?.trim() || 'No reason provided',
    };

    this.expenseService.createExpenseDeleteRequest(payload).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.expensePendingDelete.set(null);
        this.loadExpenses();
      },
      error: (error) => {
        this.isDeleting.set(false);
        this.deleteErrorMessage.set(
          error?.error?.message || 'Failed to submit delete request. Please try again.',
        );
      },
    });
  }

  cancelDelete(): void {
    if (this.isDeleting()) return; // ignore Cancel/backdrop while a delete is in flight
    this.expensePendingDelete.set(null);
    this.deleteErrorMessage.set(null);
  }

  // Condition: Require remarks if expense amount exceeds 5000 BDT
  requiresRemarks = computed(() => {
    const expense = this.expensePendingDelete();
    //return expense ? expense.amount > 5000 : false;
    return true; // For testing purposes, always require remarks
  });
}
