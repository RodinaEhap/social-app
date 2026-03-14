import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css',
})
export class ChangePasswordComponent {
  //========call api========
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  passwordForm: FormGroup = new FormGroup({
    password: new FormControl(null, [Validators.required]),
    newPassword: new FormControl(null, [
      Validators.required,
      Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/),
    ]),
  });

  onSubmit() {
    if (this.passwordForm.valid) {
      this.authService.changePassword(this.passwordForm.value).subscribe({
        next: (res) => {
          console.log('Success!', res);
          this.toastr.success('Your vibe is safe! Password updated.', 'Success change');
          this.authService.logout();
        },
        error: (err) => {
          console.error('Error!', err);
          this.toastr.error(err.error.message || 'Check your current password', 'Oops');
        },
      });
    }
  }
}
