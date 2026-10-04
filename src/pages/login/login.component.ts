import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

 private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
 
  isLoggingIn = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
 
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });
 
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
 
    this.isLoggingIn.set(true);
    this.errorMessage.set(null);
 
    const { email, password } = this.form.getRawValue();
 
    // Load the menu right after login succeeds, so the sidebar is ready
    // by the time we navigate into the app — not loaded after the fact.
    this.authService
      .login({ email, password })
      .pipe(switchMap(() => this.authService.loadMenu()))
      .subscribe({
        next: () => {
          console.log('AuthService.login response:', this.authService.currentUser());
          this.isLoggingIn.set(false);
          this.router.navigateByUrl('/');
        },
        error: (err) => {
          this.isLoggingIn.set(false);
          this.errorMessage.set(
            err?.status === 401
              ? 'Incorrect email or password.'
              : 'Login failed. Please try again.'
          );
        }
      });
  }
}