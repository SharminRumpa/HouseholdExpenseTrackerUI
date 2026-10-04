import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Role } from '../../models/Role';
import { RoleService } from '../../core/services/role.service';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './role-form.component.html',
  styleUrls: ['./role-form.component.scss']
})
export class RoleFormComponent {
  private fb = inject(FormBuilder);
  private roleService = inject(RoleService);

  @Output() created = new EventEmitter<Role>();
  @Output() cancelled = new EventEmitter<void>();

  isSaving = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    roleName: ['', Validators.required]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    this.isSaving.set(true);
    this.errorMessage.set(null);

    // this.roleService.create({ roleName: raw.roleName }).subscribe({
    //   next: (role) => {
    //     this.isSaving.set(false);
    //     this.created.emit(role);
    //   },
    //   error: (err) => {
    //     this.isSaving.set(false);
    //     this.errorMessage.set(
    //       err?.status === 409
    //         ? 'A role with this name already exists.'
    //         : 'Failed to save role. Please try again.'
    //     );
    //   }
    // });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
