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
      this.loadProfile(params.get('id'), localStorage.getItem('userId'));
    });

    this.loadSuggestions();
    this.authService.followStatus$.subscribe((status) => {
      if (status && status.userId === this.userProfile?._id) {
        this.userProfile.following = status.isFollowing;
        status.isFollowing ? this.userProfile.followersCount++ : this.userProfile.followersCount--;
      }
    });
  }
  loadProfile(routeId: string | null, myId: string | null) {
    if (!routeId || routeId === myId) {
      this.authService.getMyProfile().subscribe({
        next: (res) => this.updateProfileData(res),
        error: (err) => this.toastr.error('Failed to load your profile'),
      });
    } else {
      this.authService.getUserProfile(routeId).subscribe({
        next: (res) => this.updateProfileData(res),
        error: (err) => this.toastr.error('Failed to load user profile'),
      });
    }
  }
  updateProfileData(res: any) {
    this.userProfile = res.data.user;
    if (res.data.hasOwnProperty('isFollowing')) {
      this.isMyProfile = false;
      this.userProfile.following = res.data.isFollowing;
    } else {
      this.isMyProfile = true;
    }
    this.getUserPosts(this.userProfile._id);
  }
  getUserPosts(id: string) {
    this.postsService.getUserPosts(id).subscribe({
      next: (res) => {
        this.myPosts = res.data.posts;
      },
    });
  }
  loadSuggestions() {
    this.authService.getFollowSuggestions(10).subscribe({
      next: (res) => {
        this.suggestedUsers = res.data.suggestions;
      },
      error: (err) => {
        console.log(err);

        this.toastr.error('Failed to load suggestions');
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
        error: (err) => {
          console.log(err);
          this.toastr.error('Failed to load image');
        },
      });
    }
  }
  handleFollow(userId: string) {
    this.authService.toggleFollow(userId).subscribe({
      next: (res) => {
        console.log(res);

        this.userProfile.following = res.data.following;
        if (this.userProfile.following) {
          this.userProfile.followersCount++;
          this.toastr.success(`You are now following ${this.userProfile.name}`);
        } else {
          if (res.data.followersCount >= 0) this.userProfile.followersCount--;
          this.toastr.info(`Unfollowed ${this.userProfile.name}`);
        }
      },
      error: (err) => {
        this.toastr.error('Connection lost. Could not update follow status');
      },
    });
  }
}
