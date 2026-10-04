import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

private fb = inject(FormBuilder);
  constructor(
    private auth: AuthService,
    private router: Router) { }

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    mobileNumber: [''],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  loading = false;
  errorMessage: string | null = null;





  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    // this.auth.register(this.form.getRawValue() as any).subscribe({
    //   next: () => {
    //     this.loading = false;
    //     this.router.navigate(['/dashboard']);
    //   },
    //   error: () => {
    //     this.loading = false;
    //     this.errorMessage =
    //       'Could not register. Note: the API currently has no /api/auth endpoints — this page is wired up for when authentication is added back.';
    //   }
    // });
  }
}
