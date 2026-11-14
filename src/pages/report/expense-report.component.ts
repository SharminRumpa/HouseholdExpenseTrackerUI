import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { map, of, switchMap, tap } from 'rxjs';
import { ExpenseReportService } from '../../core/services/report.service';
import { LookupService } from '../../core/services/lookup.service';
import { ExpenseReport, ExpenseReportFilter } from '../../models/expense-report';
import { DropdownItem, ExpenseSubCategoryDropdown } from '../../models/lookup';

const PAGE_SIZE = 10;

// Local yyyy-MM-dd (not toISOString, which shifts the day by the UTC offset).
function toDateString(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function defaultFilter() {
  const now = new Date();
  return {
    fromDate: toDateString(new Date(now.getFullYear(), now.getMonth(), 1)),
    toDate: toDateString(now),
    categoryId: null as number | null,
    subCategoryId: null as number | null,
    expenseBy: null as string | null,
    expenseFor: null as string | null,
  };
}

@Component({
  selector: 'app-expense-report',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './expense-report.component.html',
  styleUrls: ['./expense-report.component.scss'],
})
export class ExpenseReportComponent implements OnInit {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private reportService = inject(ExpenseReportService);
  private lookupService = inject(LookupService);

  readonly pageSize = PAGE_SIZE;

  categories = signal<DropdownItem[]>([]);
  subCategories = signal<DropdownItem[]>([]);
  persons = signal<string[]>([]);
  forPersons = signal<string[]>([]);

  report = signal<ExpenseReport | null>(null);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  currentPage = signal<number>(1);
  isDownloading = signal<boolean>(false);

  // The filters behind the report on screen, so the download always matches the table
  // even if the user has edited the filter fields since the last search.
  private appliedFilter: ExpenseReportFilter = defaultFilter();

  filterForm = this.fb.nonNullable.group(defaultFilter());

  private filters = toSignal(
    this.filterForm.valueChanges.pipe(map(() => this.filterForm.getRawValue())),
    {
      initialValue: this.filterForm.getRawValue(),
    },
  );

  // The server would reject this, so catch it before the request.
  isDateRangeInvalid = computed(() => {
    const { fromDate, toDate } = this.filters();
    return !!fromDate && !!toDate && fromDate > toDate;
  });

  rows = computed(() => this.report()?.rows ?? []);

  totalPages = computed(() => Math.max(1, Math.ceil(this.rows().length / this.pageSize)));

  pagedRows = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.rows().slice(start, start + this.pageSize);
  });

  rowNumberOffset = computed(() => (this.currentPage() - 1) * this.pageSize);

  ngOnInit(): void {
    this.lookupService.getExpenseCategories().subscribe((c) => this.categories.set(c));
    this.lookupService.getExpensePersons().subscribe((p) => this.persons.set(p));
    this.lookupService.getExpenseForPersons().subscribe((p) => this.forPersons.set(p));
    //this.loadSubCategories(null);
    this.watchCategoryChanges();
    this.search();
  }

  // Picking a category narrows the sub-category list and clears the old pick.
  private watchCategoryChanges(): void {
    this.filterForm.controls.categoryId.valueChanges
      .pipe(
        tap(() => {
          this.filterForm.controls.subCategoryId.setValue(null);
          this.subCategories.set([]);
        }),
        switchMap((categoryId) => this.lookupService.getExpenseSubCategories(categoryId)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((subCategories) => this.subCategories.set(subCategories));
  }

  private loadSubCategories(categoryId: number | null): void {
    this.lookupService
      .getExpenseSubCategories(categoryId)
      .subscribe((subCategories) => this.subCategories.set(subCategories));
  }

  search(): void {
    if (this.isDateRangeInvalid()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const filter: ExpenseReportFilter = this.filterForm.getRawValue();

    this.reportService.getExpenseReport(filter).subscribe({
      next: (report) => {
        console.log(report);
        this.appliedFilter = filter;
        this.report.set(report);
        this.currentPage.set(1);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(
          err?.error?.message ?? 'Failed to load the expense report. Please try again.',
        );
        this.isLoading.set(false);
      },
    });
  }

  downloadExcel(): void {
    if (this.isDownloading()) return;

    this.isDownloading.set(true);
    this.errorMessage.set(null);

    const { fromDate, toDate } = this.appliedFilter;

    this.reportService.downloadExpenseReport(this.appliedFilter).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `expense-report_${fromDate || 'start'}_${toDate || 'today'}.xlsx`;
        link.click();
        URL.revokeObjectURL(url);
        this.isDownloading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to download the Excel file. Please try again.');
        this.isDownloading.set(false);
      },
    });
  }

  resetFilters(): void {
    this.filterForm.reset(defaultFilter());
    this.search();
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
}
