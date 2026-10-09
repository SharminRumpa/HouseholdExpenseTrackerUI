import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Toast, ToastType } from '../../models/toast.model';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toasts$ = new BehaviorSubject<Toast[]>([]);

  // Expose toasts as a read-only Observable stream
  get toasts(): Observable<Toast[]> {
    return this.toasts$.asObservable();
  }

  show(message: string, type: ToastType = 'info', duration: number = 4000): void {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, message, type, duration };

    // Append new toast to current array
    const currentToasts = this.toasts$.value;
    this.toasts$.next([...currentToasts, newToast]);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }

  remove(id: string): void {
    const updatedToasts = this.toasts$.value.filter((toast) => toast.id !== id);
    this.toasts$.next(updatedToasts);
  }
}
