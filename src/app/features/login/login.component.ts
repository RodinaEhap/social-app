import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [RouterModule, ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  //=========================================================injections====================================================================================
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  //====================================================================form group========================================================================================
  loginForm: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, Validators.required),
  });
  //===========================================================================for help===================================================================================
  loginAttempts: number = 0;
  showForgot: boolean = false;
  TypingTimer: any;
  //=====observe user's typing======
  startTimer() {
    clearTimeout(this.TypingTimer);
    this.TypingTimer = setTimeout(() => {
      this.showForgot = true;
    }, 5000);
  }
  //===========================================================================call API===================================================================================
  signInSubmit() {
    if (this.loginForm.valid) {
      this.authService.signIn(this.loginForm.value).subscribe({
        next: (res) => {
          console.log(res);
          if (res.data.token) {
            localStorage.setItem('userToken', res.data.token);
            localStorage.setItem('userId', res.data.user._id);
            console.log(res);
            this.authService.userId = res.data.user._id;
            //======navigate home=======
            this.router.navigate(['/main/feed']);
          }
        },
        //=====error interceptor=========
        error: (err) => {
          console.log(err);
          this.loginAttempts++;
          if (this.loginAttempts >= 3) {
            this.showForgot = true;
          }
        },
      });
    }
  }
}
