import { AuthService } from './../../core/auth/services/auth.service';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
@Component({
  standalone: true,
  selector: 'app-register',
  imports: [RouterModule, ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private readonly router = inject(Router);

  private readonly authService = inject(AuthService);
  registerForm: FormGroup = new FormGroup(
    {
      name: new FormControl(null, [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
      ]),
      username: new FormControl(null, [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
      ]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      dateOfBirth: new FormControl(null, [Validators.required]),
      gender: new FormControl(null, [Validators.required]),
      password: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/),
      ]),
      rePassword: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/),
      ]),
    },
    { validators: this.isMatch },
  );
  signUPSubmit() {
    if (this.registerForm.valid) {
      console.log(this.registerForm);
      this.authService.signUp(this.registerForm.value).subscribe({
        next: (res) => {
          if (res.success) {
            console.log(res);
            //login
            this.router.navigate(['/auth/login']);
          }
        },
        error: (err: HttpErrorResponse) => {
          console.log(err);
        },
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
  isMatch(registerForm: AbstractControl) {
    return registerForm.get('password')?.value === registerForm.get('rePassword')?.value
      ? null
      : { mismatch: true };
  }
}
