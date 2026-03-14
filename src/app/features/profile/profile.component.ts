import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth.service';
import { PostsServiceService } from './../../core/auth/services/posts-service.service';
import { ToastrService } from 'ngx-toastr';
import { PostCardComponent } from '../../shared/ui/post-card/post-card.component';
import { SuggestionsCardComponent } from '../../shared/ui/suggestions-card/suggestions-card.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [PostCardComponent, SuggestionsCardComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly postsService = inject(PostsServiceService);
  private readonly toastr = inject(ToastrService);
  private readonly activatedRoute = inject(ActivatedRoute);
  userProfile: any = {};
  myPosts: any[] = [];
  suggestedUsers: any[] = [];
  isMyProfile: boolean = false;
  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((params) => {
      const userIdFromRoute = params.get('id');
      const mySavedId = localStorage.getItem('userId');
      if (!userIdFromRoute || userIdFromRoute === mySavedId) {
        this.isMyProfile = true;
        this.loadMyProfile();
      } else {
        this.isMyProfile = false;
        this.loadUserProfile(userIdFromRoute);
      }
    });
    this.loadSuggestions();
  }
  loadMyProfile() {
    this.authService.getMyProfile().subscribe({
      next: (res) => {
        this.userProfile = res.data.user;
        this.getUserPosts(this.userProfile._id);
      },
    });
  }
  loadUserProfile(id: string) {
    this.authService.getUserProfile(id).subscribe({
      next: (res) => {
        this.userProfile = res.data.user;
        this.getUserPosts(id);
      },
    });
  }
  getUserPosts(id: string) {
    this.postsService.getUserPosts(id).subscribe({
      next: (res) => {
        this.myPosts = res.data.posts;
      },
    });
  }
  loadSuggestions() {
    this.authService.getFollowSuggestions(7).subscribe({
      next: (res) => {
        this.suggestedUsers = res.data.suggestions;
      },
    });
  }
  handleImageUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('photo', file);
      this.authService.uploadPhoto(formData).subscribe({
        next: (res) => {
          this.userProfile.photo = res.data.photo;
          this.authService.userPhoto.next(res.data.photo);
          localStorage.setItem('userPhoto', res.data.photo);
          this.toastr.success('Profile photo updated!', 'Success');
        },
      });
    }
  }
  handleFollow(userId: string) {
    this.authService.toggleFollow(userId).subscribe({
      next: (res) => {
        this.userProfile.following = !this.userProfile.following;
        if (this.userProfile.following) {
          this.userProfile.followersCount++;
          this.toastr.success(`You are now following ${this.userProfile.name}`);
        } else {
          this.userProfile.followersCount--;
          this.toastr.info(`Unfollowed ${this.userProfile.name}`);
        }
      },
    });
  }
}
