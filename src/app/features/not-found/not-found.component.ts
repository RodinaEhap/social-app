import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css',
})
export class NotFoundComponent {
  private readonly router = inject(Router);

  goHome() {
    this.router.navigate(['/main/feed']);
  }
  goLogin() {
    this.router.navigate(['/auth/login']);
  }
}
