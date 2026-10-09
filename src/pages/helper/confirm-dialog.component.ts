import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],

  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
})
export class ConfirmDialogComponent {
  private fb = inject(FormBuilder);

  @Input() title = 'Confirm';
  @Input() message = 'Are you sure?';
  @Input() confirmLabel = 'Yes, Delete';
  @Input() cancelLabel = 'Cancel';
  @Input() isProcessing = false;
  @Input() errorMessage: string | null = null;

  // Remarks Configuration
  @Input() showRemarks: boolean = false;
  @Input() remarksRequired: boolean = false;
  @Input() remarksLabel: string = 'Reason / Remarks';
  @Input() remarksPlaceholder: string = 'Please explain why you are performing this action...';

  @Output() confirmed = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  remarksForm = this.fb.group({
    remarks: ['', this.remarksRequired ? [Validators.required, Validators.minLength(5)] : []],
  });

  onConfirm(): void {
    if (this.showRemarks && this.remarksRequired && this.remarksForm.invalid) {
      this.remarksForm.markAllAsTouched();
      return;
    }

    const remarksValue = this.showRemarks ? this.remarksForm.value.remarks || '' : '';
    this.confirmed.emit(remarksValue);
  }

  onBackdropClick(): void {
    if (!this.isProcessing) {
      this.cancelled.emit();
    }
  }
}
