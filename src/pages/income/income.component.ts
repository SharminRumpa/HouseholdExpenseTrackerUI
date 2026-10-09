import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { IncomeFormComponent } from '../income-form/income-form.component';
import { Income, IncomeCategoryOption, IncomeSearchFilter } from '../../models/income';
import { DropdownItem } from '../../models/lookup';
import { IncomeService } from '../../core/services/income.service';
import { LookupService } from '../../core/services/lookup.service';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-income',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IncomeFormComponent],
  templateUrl: './income.component.html',
  styleUrls: ['./income.component.scss'],
})
export class IncomeComponent implements OnInit {
  private fb = inject(FormBuilder);
  private incomeService = inject(IncomeService);
  private lookupService = inject(LookupService);
  private authService = inject(AuthService);

  currentUser = this.authService.currentUser;

  categories = signal<DropdownItem[]>([]);
  incomeSources = signal<DropdownItem[]>([]);
  incomes = signal<Income[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  showCreateForm = signal<boolean>(false);
  currentPage = signal<number>(1);

  readonly pageSize = PAGE_SIZE;

  filterForm = this.fb.nonNullable.group({
    fromDate: [this.firstOfMonth()],
    toDate: [this.today()],
    categoryId: [null as number | null],
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.incomes().length / this.pageSize)));

  pagedIncomes = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.incomes().slice(start, start + this.pageSize);
  });

  // Total of all rows matching the current filters (not just the visible page).
  totalAmount = computed(() => this.incomes().reduce((sum, expense) => sum + expense.amount, 0));

  ngOnInit(): void {
    this.loadLookups();
    this.loadIncomes();
  }

  loadLookups(): void {
    forkJoin({
      categories: this.lookupService.getIncomeCategories(),
      sources: this.lookupService.getIncomeSources(),
    }).subscribe({
      next: ({ categories, sources }) => {
        this.categories.set(categories);
        this.incomeSources.set(sources);
        console.log(sources);
        console.log(this.incomeSources());
      },
    });
  }

  loadIncomes(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const filter: IncomeSearchFilter = this.filterForm.getRawValue();

    this.incomeService.getAll(filter).subscribe({
      next: (incomes) => {
        this.incomes.set(incomes);
        this.currentPage.set(1);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load income records. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  applyFilters(): void {
    this.loadIncomes();
  }

  resetFilters(): void {
    this.filterForm.reset({ fromDate: '', toDate: '', categoryId: null });
    this.loadIncomes();
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

  onIncomeCreated(): void {
    this.showCreateForm.set(false);
    this.loadIncomes();
  }

  onCreateCancelled(): void {
    this.showCreateForm.set(false);
  }

  private today(): string {
    return this.toDateString(new Date());
  }

  private firstOfMonth(): string {
    const now = new Date();
    return this.toDateString(new Date(now.getFullYear(), now.getMonth(), 1));
  }

  private toDateString(date: Date): string {
    // Built from local date parts (not toISOString()) so the value matches
    // the user's actual calendar day regardless of UTC offset.
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
