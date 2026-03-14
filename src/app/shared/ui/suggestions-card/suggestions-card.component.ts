import { PostsServiceService } from './../../../core/auth/services/posts-service.service';
import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';

@Component({
  selector: 'app-suggestions-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './suggestions-card.component.html',
})
export class SuggestionsCardComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly postsServiceService = inject(PostsServiceService);
  @Input() users: any[] = [];
  handleFollow(userId: string, user: any) {
    this.authService.toggleFollow(userId).subscribe({
      next: (res) => {
        console.log('Done', res);
        user.isFollowed = !user.isFollowed;
        this.postsServiceService.notifyRefresh();
      },
      error: (err) => console.log('Error!!:', err),
    });
  }
  goToProfile(userId: string) {
    this.router.navigate(['/main/profile', userId]);
  }
}
