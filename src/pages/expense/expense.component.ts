import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
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
  imports: [CommonModule, ReactiveFormsModule, ExpenseFormComponent],
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.scss']
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
  currentPage = signal<number>(1);

  readonly pageSize = PAGE_SIZE;

  filterForm = this.fb.nonNullable.group({
    fromDate: [firstOfMonthString()],
    toDate: [todayString()],
    categoryId: [null as number | null]
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.expenses().length / this.pageSize))
  );

  pagedExpenses = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.expenses().slice(start, start + this.pageSize);
  });

  // Total of all rows matching the current filters (not just the visible page).
  totalAmount = computed(() =>
    this.expenses().reduce((sum, expense) => sum + expense.amount, 0)
  );

  ngOnInit(): void {
    this.loadCategories();
    this.loadExpenses();
  }

  loadCategories(): void {
    this.lookupService.getExpenseCategories().subscribe({
      next: (categories) => this.categories.set(categories)
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
        console.log('Expenses loaded:', expenses);
      },
      error: () => {
        this.errorMessage.set('Failed to load expense records. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  applyFilters(): void {
    this.loadExpenses();
  }

  resetFilters(): void {
    this.filterForm.reset({
      fromDate: firstOfMonthString(),
      toDate: todayString(),
      categoryId: null
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
    this.showCreateForm.set(true);
  }

  onExpenseCreated(): void {
    this.showCreateForm.set(false);
    this.loadExpenses();
  }

  onCreateCancelled(): void {
    this.showCreateForm.set(false);
  }
}