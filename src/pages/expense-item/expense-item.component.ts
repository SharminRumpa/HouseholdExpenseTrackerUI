import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms'; // <-- Import FormsModule
import { ExpenseItemService } from '../../core/services/expense-item.service';
import { LookupService } from '../../core/services/lookup.service';
import { ExpenseItem } from '../../models/expense-item';
import { DropdownItem } from '../../models/lookup';
import { ConfirmDialogComponent } from '../helper/confirm-dialog.component';
import { ExpenseItemFormComponent } from './expense-item-form.component';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-expense-item',
  standalone: true,
  imports: [CommonModule, FormsModule, ExpenseItemFormComponent, ConfirmDialogComponent], // <-- Add FormsModule
  templateUrl: './expense-item.component.html',
  styleUrls: ['./expense-item.component.scss'],
})
export class ExpenseItemComponent implements OnInit {
  private expenseItemService = inject(ExpenseItemService);
  private lookupService = inject(LookupService);

  items = signal<ExpenseItem[]>([]);
  categories = signal<DropdownItem[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  // Search input query signal
  searchQuery = signal<string>('');

  // Create/edit modal state
  showCreateForm = signal<boolean>(false);
  itemBeingEdited = signal<ExpenseItem | null>(null);
  isFormOpen = computed(() => this.showCreateForm() || this.itemBeingEdited() !== null);

  // Delete confirmation state
  itemPendingDelete = signal<ExpenseItem | null>(null);
  isDeleting = signal<boolean>(false);
  deleteErrorMessage = signal<string | null>(null);

  currentPage = signal<number>(1);
  readonly pageSize = PAGE_SIZE;

  // Live filter across Category, Sub Category, Item Name, and Description
  filteredItems = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const allItems = this.items();

    if (!query) return allItems;

    return allItems.filter((item) => {
      const category = (item.expenseCategoryName || '').toLowerCase();
      const subCategory = (item.expenseSubCategoryName || '').toLowerCase();
      const itemName = (item.itemName || '').toLowerCase();
      const description = (item.description || '').toLowerCase();

      return (
        category.includes(query) ||
        subCategory.includes(query) ||
        itemName.includes(query) ||
        description.includes(query)
      );
    });
  });

  // Calculate pages based on filtered results
  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredItems().length / this.pageSize)));

  // Page slice derived from filtered results
  pagedItems = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredItems().slice(start, start + this.pageSize);
  });

  rowNumberOffset = computed(() => (this.currentPage() - 1) * this.pageSize);

  ngOnInit(): void {
    this.loadCategories();
    this.loadItems();
  }

  // Reset pagination to page 1 whenever the user types
  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.currentPage.set(1);
  }

  loadCategories(): void {
    this.lookupService.getExpenseCategories().subscribe({
      next: (categories) => this.categories.set(categories),
    });
  }

  loadItems(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.expenseItemService.getAll().subscribe({
      next: (items) => {
        this.items.set(items);
        this.currentPage.set(Math.min(this.currentPage(), this.totalPages()));
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load expense items. Please try again.');
        this.isLoading.set(false);
      },
    });
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
    this.itemBeingEdited.set(null);
    this.showCreateForm.set(true);
  }

  startEdit(item: ExpenseItem): void {
    this.showCreateForm.set(false);
    this.itemBeingEdited.set(item);
  }

  onItemSaved(): void {
    this.showCreateForm.set(false);
    this.itemBeingEdited.set(null);
    this.loadItems();
  }

  onFormCancelled(): void {
    this.showCreateForm.set(false);
    this.itemBeingEdited.set(null);
  }

  remove(item: ExpenseItem): void {
    this.itemPendingDelete.set(item);
    this.deleteErrorMessage.set(null);
  }

  confirmDelete(): void {
    const item = this.itemPendingDelete();
    if (!item) return;

    this.isDeleting.set(true);
    this.deleteErrorMessage.set(null);

    this.expenseItemService.delete(item.expenseItemId).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.itemPendingDelete.set(null);
        this.loadItems();
      },
      error: () => {
        this.isDeleting.set(false);
        this.deleteErrorMessage.set('Failed to delete expense item. Please try again.');
      },
    });
  }

  cancelDelete(): void {
    if (this.isDeleting()) return;
    this.itemPendingDelete.set(null);
    this.deleteErrorMessage.set(null);
  }
}
