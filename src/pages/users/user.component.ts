import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ConfirmDialogComponent } from '../helper/confirm-dialog.component';
import { UserFormComponent } from './user-form.component';
import { User } from '../../models/user';
import { UserService } from '../../core/services/user.service';
import { DropdownItem } from '../../models/lookup';
import { LookupService } from '../../core/services/lookup.service';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, UserFormComponent, ConfirmDialogComponent],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UserComponent implements OnInit {
  private userService = inject(UserService);
  private lookupService = inject(LookupService);

  users = signal<User[]>([]);
  roles = signal<DropdownItem[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  currentPage = signal<number>(1);

  // Create/edit form state. Only one is ever active at a time — showCreateForm
  // for "+ Add User", userBeingEdited for the row's Edit button. Both drive the
  // same <app-user-form> instance (see isFormOpen), which reads userBeingEdited
  // to decide whether it's in create or edit mode.
  showCreateForm = signal<boolean>(false);
  userBeingEdited = signal<User | null>(null);
  isFormOpen = computed(() => this.showCreateForm() || this.userBeingEdited() !== null);

  // Delete confirmation state: holding the user here (instead of a plain
  // boolean) is what drives the modal open/closed AND tells it who/what
  // it's about to delete.
  userPendingDelete = signal<User | null>(null);
  isDeleting = signal<boolean>(false);
  deleteErrorMessage = signal<string | null>(null);

  readonly pageSize = PAGE_SIZE;

  totalPages = computed(() => Math.max(1, Math.ceil(this.users().length / this.pageSize)));

  pagedUsers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.users().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.loadRoles();
    this.loadUsers();
  }

  loadRoles(): void {
    this.lookupService.getRoles().subscribe({
      next: (roles) => this.roles.set(roles),
    });
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.userService.getAll().subscribe({
      next: (users) => {
        this.users.set(users);
        this.currentPage.set(1);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load users. Please try again.');
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
    this.userBeingEdited.set(null);
    this.showCreateForm.set(true);
  }

  // Called from the row's Edit button: (click)="startEdit(user)"
  startEdit(user: User): void {
    this.showCreateForm.set(false);
    this.userBeingEdited.set(user);
  }

  onUserSaved(): void {
    this.showCreateForm.set(false);
    this.userBeingEdited.set(null);
    this.loadUsers();
  }

  onFormCancelled(): void {
    this.showCreateForm.set(false);
    this.userBeingEdited.set(null);
  }

  // Called from the row's Delete button: (click)="remove(user)"
  remove(user: User): void {
    this.userPendingDelete.set(user);
    this.deleteErrorMessage.set(null);
  }

  confirmDelete(): void {
    const user = this.userPendingDelete();
    if (!user) return;

    this.isDeleting.set(true);
    this.deleteErrorMessage.set(null);

    this.userService.delete(user.userId).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.userPendingDelete.set(null);
        this.loadUsers();
      },
      error: () => {
        this.isDeleting.set(false);
        this.deleteErrorMessage.set('Failed to delete user. Please try again.');
      },
    });
  }

  cancelDelete(): void {
    if (this.isDeleting()) return; // ignore Cancel/backdrop while a delete is in flight
    this.userPendingDelete.set(null);
    this.deleteErrorMessage.set(null);
  }
}
