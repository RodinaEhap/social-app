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
  showMore = false;
  shareComment: string = '';
  likedKey = '';

  ngOnInit() {
    this.post.user.following = this.authService.myFollowingList.includes(this.post.user._id);
    this.myId = localStorage.getItem('userId') || this.authService.userId;
    this.likedKey = this.authService.getLikedKey();
    const likedPosts = JSON.parse(localStorage.getItem(this.likedKey) || '[]');
    this.authService.followStatus$.subscribe((status) => {
      if (status && status.userId === this.post.user._id) {
        this.post.user.following = status.isFollowing;
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container')) {
      this.isMenuOpen = false;
    }
  }
  private updateLikedStorage(postFromServer: any, shouldExist: boolean) {
    let likedPosts = JSON.parse(localStorage.getItem(this.likedKey) || '[]');
    if (shouldExist) {
      const clickMoreOnLike = { ...postFromServer, liked: true };
      const index = likedPosts.findIndex((p: any) => p._id === clickMoreOnLike._id);
      //if found it means its index start from 0 we will update its data else <0 we will push
      index > -1 ? (likedPosts[index] = clickMoreOnLike) : likedPosts.push(clickMoreOnLike);
    } else {
      //we will delete it
      likedPosts = likedPosts.filter((p: any) => p._id !== postFromServer._id);
    }
    localStorage.setItem(this.likedKey, JSON.stringify(likedPosts));
  }
  onLike() {
    this.postsServiceService.toggleLike(this.post._id).subscribe({
      next: (res: any) => {
        console.log(res);
        if (res.message === 'success') {
          //ui
          this.post.liked = res.data.liked;
          this.post.likesCount = res.data.likesCount;

          this.updateLikedStorage(res.data.post, res.data.liked);
          this.toastr.success(res.data.liked ? 'Vibe Liked!' : 'Vibe Unliked');
          this.likeTriggered.emit(this.post._id);
        }
      },
      error: (err) => {
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
    Swal.fire({
      title: 'Share Vibe',
      input: 'textarea',
      inputPlaceholder: 'Write something about this vibe...',
      showCancelButton: true,
      confirmButtonText: 'Share Now',
      confirmButtonColor: '#0b048a',
      background: 'rgba(255, 255, 255, 0.8)',
      color: '#0b048a',
      inputAttributes: {
        style: 'background: ; color:#0b048a ; border-radius: 20px;',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const content = {
          body: result.value || 'Shared a vibe',
        };
        this.postsServiceService.sharePost(this.post._id, content).subscribe({
          next: (res) => {
            this.toastr.success('Vibe Shared successfully!');
            this.postsServiceService.notifyRefresh();
          },
          error: (err) => this.toastr.error('Sharing failed'),
        });
      }
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
            this.updateLikedStorage(this.post, false);
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

        this.isMenuOpen = false;
        res.data.following
          ? this.toastr.info(`You are now following ${this.post.user.name}`)
          : this.toastr.info(`Unfollowed ${this.post.user.name}`);
      },
      error: (err) => {
        this.toastr.error('Something went wrong', 'Follow Failed');
      },
    });
  }
  truncateText(text: string, limit: number = 100): string {
    if (!text) return '';
    return text.length > limit ? text.substring(0, limit) + '...' : text;
  }
}
