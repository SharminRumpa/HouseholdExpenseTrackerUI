import { Component, OnInit, inject, signal } from '@angular/core';
import { finalize } from 'rxjs/operators'; // Add this import at the top
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../core/services/category.service';
import { Category, CategoryUpdate, IncomeSource } from '../../models/category';

@Component({
  selector: 'app-income-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './income-categories.component.html',
  styleUrl: './income-categories.component.scss',
})
export class IncomeCategoriesComponent implements OnInit {
  incomeCategories = signal<Category[]>([]);
  categories = signal<Category[]>([]);
  incomeSources = signal<IncomeSource[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);

  loading = false;
  incomeSourcesLoading = false;

  showForm = false;
  editingId: number | null = null;

  form: FormGroup = this.fb.group({
    categoryName: ['', Validators.required],
    description: [''],
    isActive: [true],
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      categories: this.categoryService.getIncomeCategories(),
      sources: this.categoryService.getIncomeSources(),
    }).subscribe({
      next: ({ categories, sources }) => {
        this.incomeCategories.set(categories);
        this.categories.set(categories);
        this.incomeSources.set(sources);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load income categories and sources. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  openCreateForm(): void {
    this.editingId = null;
    this.form.reset({ categoryName: '', description: '', isActive: true });
    this.showForm = true;
  }

  startEdit(c: Category): void {
    this.editingId = c.categoryId;
    this.form.setValue({
      categoryName: c.categoryName,
      description: c.description ?? '',
      isActive: c.isActive,
    });
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    if (this.editingId !== null) {
      const dto: CategoryUpdate = {
        categoryName: raw.categoryName,
        description: raw.description || null,
        isActive: raw.isActive,
      };
      this.categoryService.updateIncomeCategory(this.editingId, dto).subscribe({
        next: () => {
          this.cancelForm();
          ////this.loadCategories();
        },
        error: () => this.errorMessage.set('Could not save this income category.'),
      });
    } else {
      this.categoryService
        .createIncomeCategory({
          categoryName: raw.categoryName,
          description: raw.description || null,
        })
        .subscribe({
          next: () => {
            this.cancelForm();
            //this.loadCategories();
          },
          error: () => this.errorMessage.set('Could not create this income category.'),
        });
    }
  }

  remove(c: Category): void {
    if (!confirm(`Delete "${c.categoryName}"? This can't be undone.`)) return;

    // this.categoryService.deleteIncomeCategory(c.categoryId).subscribe({
    //   next: () => this.loadCategories(),
    //   error: () =>
    //     (this.errorMessage.set('Could not delete this category — it may still have income recorded against it.'))
    // });
  }
}
