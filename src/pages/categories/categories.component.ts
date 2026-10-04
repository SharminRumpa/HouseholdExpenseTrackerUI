import { Component, OnInit, inject, signal,computed} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../core/services/category.service';
import { Category, CategoryUpdate, IncomeSource, SubCategory } from '../../models/category';
import { forkJoin } from 'rxjs';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit {

  expenseCategories = signal<Category[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  currentPage = signal<number>(1);

  private categoryService = inject(CategoryService);

  readonly pageSize = PAGE_SIZE;

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.expenseCategories().length / this.pageSize))
  );

  pagedCategories = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.expenseCategories().slice(start, start + this.pageSize);
  });

  loading = false;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
      this.isLoading.set(true);
      this.errorMessage.set(null);
   
      forkJoin({
        categories: this.categoryService.getExpenseCategories()
      }).subscribe({
        next: ({ categories }) => {
          this.expenseCategories.set(categories);
          this.currentPage.set(1);
          console.log('Expense categories loaded successfully:', this.pageSize);
          this.isLoading.set(false);
          console.log('Income categories and sources loaded successfully.');
        },
        error: () => {
          this.errorMessage.set('Failed to load income categories and sources. Please try again.');
          this.isLoading.set(false);
        }
      });
    }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  nextPage(): void {
    console.log('Next page clicked. Current page:', this.currentPage());
    this.goToPage(this.currentPage() + 1);
  }

  previousPage(): void {
    console.log('Previous page clicked. Current page:', this.currentPage());
    this.goToPage(this.currentPage() - 1);
  }

  


  
}