import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-activate-account',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './activate-account.component.html',
  styleUrls: ['./activate-account.component.css']
})
export class ActivateAccountComponent {

  // 6 individual digit inputs
  code: string[] = ['', '', '', '', '', ''];

  loading = false;
  errorMessage = '';
  successMessage = '';
  submitted = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Handle typing in each digit box
  onInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, ''); // digits only

    this.code[index] = value.slice(-1); // keep last digit only
    input.value = this.code[index];

    // Auto-focus next box
    if (this.code[index] && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`) as HTMLInputElement;
      nextInput?.focus();
    }
  }

  // Handle backspace to go to previous box
  onKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`) as HTMLInputElement;
      prevInput?.focus();
    }
  }

  // Handle paste - fill all 6 boxes at once
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text').replace(/\D/g, '') ?? '';
    for (let i = 0; i < 6; i++) {
      this.code[i] = pasted[i] ?? '';
    }
  }

  get fullCode(): string {
    return this.code.join('');
  }

  get isCodeComplete(): boolean {
    return this.code.every(d => d !== '');
  }

  onSubmit(): void {
    if (!this.isCodeComplete) {
      this.errorMessage = 'Please enter the complete 6-digit code.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.submitted = true;

    this.authService.activateAccount(this.fullCode).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Account activated successfully! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.loading = false;
        this.submitted = false;
        this.errorMessage =
          err?.error?.businessErrorDescription ||
          err?.error?.error ||
          'Activation failed. The code may be expired or invalid.';
      }
    });
  }
}
