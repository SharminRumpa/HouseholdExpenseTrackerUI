import { Component, OnInit } from '@angular/core';
import { AsyncPipe, NgFor, NgIf, NgClass } from '@angular/common'; // <-- Import AsyncPipe
import { Observable } from 'rxjs';
import { Toast } from '../../models/toast.model';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true, // <-- Standalone component
  imports: [
    AsyncPipe, // <-- Required for `| async`
    NgFor,
    NgIf,
    NgClass,
    // Alternatively, you can just import CommonModule instead of individual directives/pipes:
    // CommonModule
  ],
  template: `
    <div class="toast-container" *ngIf="toasts$ | async as toasts">
      <div
        *ngFor="let toast of toasts"
        class="toast"
        [ngClass]="'toast-' + toast.type"
        role="alert"
      >
        <span class="toast-message">{{ toast.message }}</span>
        <button class="toast-close" (click)="remove(toast.id)">&times;</button>
      </div>
    </div>
  `,
  styleUrls: ['./toast-container.component.scss'],
})
export class ToastContainerComponent implements OnInit {
  toasts$!: Observable<Toast[]>;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toasts$ = this.toastService.toasts;
  }

  remove(id: string): void {
    this.toastService.remove(id);
  }
}
