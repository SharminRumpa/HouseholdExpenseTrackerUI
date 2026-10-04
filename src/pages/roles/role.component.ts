import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RoleFormComponent } from './role-form.component';
import { Role } from '../../models/Role';
import { RoleService } from '../../core/services/role.service';

@Component({
  selector: 'app-role',
  standalone: true,
  imports: [CommonModule, RoleFormComponent],
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss']
})
export class RoleComponent implements OnInit {
  private roleService = inject(RoleService);

  roles = signal<Role[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  showCreateForm = signal<boolean>(false);

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.roleService.getAll().subscribe({
      next: (roles) => {
        this.roles.set(roles);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load roles. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  openCreateForm(): void {
    this.showCreateForm.set(true);
  }

  onRoleCreated(): void {
    this.showCreateForm.set(false);
    this.loadRoles();
  }

  onCreateCancelled(): void {
    this.showCreateForm.set(false);
  }
}
