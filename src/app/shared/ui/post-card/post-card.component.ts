import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  HostListener,
  OnInit,
} from '@angular/core';
import { PostsServiceService } from './../../../core/auth/services/posts-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommentsComponent } from './comments/comments.component';
import { AuthService } from '../../../core/auth/services/auth.service';
import { Router } from '@angular/router';
import { TimeAgoPipe } from '../../pipes/time-ago-pipe';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, FormsModule, CommentsComponent, TimeAgoPipe],
  templateUrl: './post-card.component.html',
  styleUrl: './post-card.component.css',
})
export class PostCardComponent implements OnInit {
  private readonly postsServiceService = inject(PostsServiceService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  @Input() post: any;
  @Output() likeTriggered = new EventEmitter<string>();
  @Output() postDeleted = new EventEmitter<string>();

  myId: string = '';
  likers: any[] = [];
  isMenuOpen = false;
  showLikersModal = false;
  showEditModal = false;
  editContent: string = '';
  showComments = false;

  ngOnInit() {
    this.myId = localStorage.getItem('userId') || this.authService.userId;
    let followedUsers = JSON.parse(localStorage.getItem('followedUsers') || '[]');
    if (followedUsers.includes(this.post.user._id)) {
      this.post.user.following = true;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container')) {
      this.isMenuOpen = false;
    }
  }

  onLike() {
    const previousLiked = this.post.liked;
    const previousCount = this.post.likesCount;
    this.post.liked = !this.post.liked;
    this.post.likesCount += this.post.liked ? 1 : -1;

    this.postsServiceService.toggleLike(this.post._id).subscribe({
      next: (res: any) => {
        if (res.message === 'success') {
          let likedPosts = JSON.parse(localStorage.getItem('myLikedPosts') || '[]');
          if (this.post.liked) {
            likedPosts.push(this.post);
            this.toastr.success('Vibe Liked!');
          } else {
            likedPosts = likedPosts.filter((p: any) => p._id !== this.post._id);
          }
          localStorage.setItem('myLikedPosts', JSON.stringify(likedPosts));
          this.likeTriggered.emit(this.post._id);
        }
      },
      error: (err) => {
        this.post.liked = previousLiked;
        this.post.likesCount = previousCount;
        this.toastr.error("Couldn't update like");
      },
    });
  }

  onUpdate() {
    const formData = new FormData();
    formData.append('body', this.editContent);
    this.postsServiceService.updatePost(this.post._id, formData).subscribe({
      next: (res: any) => {
        this.post.body = this.editContent;
        this.showEditModal = false;
        this.toastr.success('Vibe Updated Successfully');
      },
      error: (err) => this.toastr.error('Update failed'),
    });
  }

  onShare() {
    const shareData = new FormData();
    shareData.append('body', this.post.body);
    this.postsServiceService.postCreation(shareData).subscribe({
      next: (res) => {
        this.toastr.success('Vibe Shared on your feed!');
        this.postsServiceService.notifyRefresh();
      },
      error: (err) => this.toastr.error('Sharing failed'),
    });
  }

  bookmarkClick(id: string) {
    const previousStatus = this.post.bookmarked;
    this.post.bookmarked = !this.post.bookmarked;
    this.postsServiceService.toggleBookmark(id).subscribe({
      next: (res) => {
        const msg = this.post.bookmarked ? 'Saved to Bookmarks' : 'Removed from Bookmarks';
        this.toastr.success(msg);
      },
      error: (err) => {
        this.post.bookmarked = previousStatus;
        this.toastr.error('Failed to update bookmark');
      },
    });
  }

  onDelete() {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this vibe!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0b048a',
      cancelButtonColor: '#040d21',
      confirmButtonText: 'Yes, delete it!',
      background: 'rgba(255, 255, 255, 0.6)',
      backdrop: `rgba(0,0,0,0.3) blur(4px)`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.postsServiceService.deletePost(this.post._id).subscribe({
          next: () => {
            this.postDeleted.emit(this.post._id);
            let likedPosts = JSON.parse(localStorage.getItem('myLikedPosts') || '[]');
            likedPosts = likedPosts.filter((p: any) => p._id !== this.post._id);
            localStorage.setItem('myLikedPosts', JSON.stringify(likedPosts));
            this.postsServiceService.notifyRefresh();
            this.toastr.success('Vibe Deleted successfully', 'Deleted');
          },
          error: (err) => this.toastr.error('Delete failed'),
        });
      }
    });
  }
  openLikersModal(postId: string) {
    this.showLikersModal = true;
    this.postsServiceService.getPostLikes(postId).subscribe({
      next: (res) => {
        this.likers = res.data.likes;
        console.log('Likers loaded:', this.likers);
      },
      error: (err) => {
        (console.error('Failed to load likers', err), (this.showLikersModal = false));
      },
    });
  }
  openEditModal() {
    this.editContent = this.post.body;
    this.showEditModal = true;
    this.isMenuOpen = false;
  }

  goToProfile(userId: string) {
    this.router.navigate(['/main/profile', userId]);
    this.isMenuOpen = false;
  }

  handleFollow(userId: string) {
    this.authService.toggleFollow(userId).subscribe({
      next: (res: any) => {
        console.log(res);
        this.post.user.following = res.data.following;
        let followedUsers = JSON.parse(localStorage.getItem('followedUsers') || '[]');
        if (res.data.following) {
          followedUsers.push(userId);
        } else {
          followedUsers = followedUsers.filter((id: string) => id !== userId);
        }
        localStorage.setItem('followedUsers', JSON.stringify(followedUsers));
        this.isMenuOpen = false;
        const message = res.data.following
          ? this.toastr.info(`You are now following ${this.post.user.name}`)
          : this.toastr.info(`Unfollowed ${this.post.user.name}`);
      },
      error: (err) => {
        this.toastr.error('Something went wrong', 'Follow Failed');
      },
    });
  }
}
