import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { User } from '../../models/user';
import { UserService } from '../../core/services/user.service';
import { DropdownItem } from '../../models/lookup';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);

  @Input() roles: DropdownItem[] = [];
  // Present -> edit mode, pre-fills the form and calls update().
  // Absent (null) -> create mode, calls create().
  @Input() userToEdit: User | null = null;

  @Output() saved = new EventEmitter<User>();
  @Output() cancelled = new EventEmitter<void>();

  isSaving = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  get isEditMode(): boolean {
    return this.userToEdit !== null;
  }

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    mobileNumber: [''],
    password: ['', [Validators.required, Validators.minLength(6)]],
    roleId: [null as number | null, Validators.required],
  });

  ngOnInit(): void {
    if (!this.userToEdit) return;

    this.form.patchValue({
      name: this.userToEdit.name,
      email: this.userToEdit.email,
      mobileNumber: this.userToEdit.mobileNumber ?? '',
      roleId: this.userToEdit.roleId,
    });

    // Editing: password is optional — leave it blank to keep the current one.
    // (Still enforce minlength if they *do* choose to set a new one.)
    const passwordControl = this.form.controls.password;
    passwordControl.clearValidators();
    passwordControl.addValidators(Validators.minLength(6));
    passwordControl.updateValueAndValidity();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const request$: Observable<User> = this.isEditMode
      ? this.userService.update(this.userToEdit!.userId, {
          name: raw.name,
          email: raw.email,
          mobileNumber: raw.mobileNumber || null,
          roleId: raw.roleId!,
          ...(raw.password ? { password: raw.password } : {}),
        })
      : this.userService.create({
          name: raw.name,
          email: raw.email,
          mobileNumber: raw.mobileNumber || null,
          password: raw.password,
          roleId: raw.roleId!,
        });

    request$.subscribe({
      next: (user) => {
        this.isSaving.set(false);
        this.saved.emit(user);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.errorMessage.set(
          err?.status === 409
            ? 'A user with this email already exists.'
            : `Failed to ${this.isEditMode ? 'update' : 'save'} user. Please try again.`,
        );
      },
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
