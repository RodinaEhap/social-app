import { PostsServiceService } from './../../core/auth/services/posts-service.service';
import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from './../../core/auth/services/auth.service';
import { PostCardComponent } from '../../shared/ui/post-card/post-card.component';
import { CommonModule } from '@angular/common';
import { SuggestionsCardComponent } from '../../shared/ui/suggestions-card/suggestions-card.component';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [PostCardComponent, CommonModule, SuggestionsCardComponent, RouterModule],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.css',
})
export class FeedComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly postsServiceService = inject(PostsServiceService);
  private readonly route = inject(ActivatedRoute);
  allPosts: any[] = [];
  currentTab: string = 'explore';
  suggestions: any[] = [];
  isSuggestionsOpen = false;
  userPhoto: string = '';
  userName: string = '';
  currentPage: number = 1;
  hasNextPage: boolean = false;
  isLoading: boolean = false;
  ngOnInit() {
    this.loadUserData();
    this.getSuggestions();

    this.route.queryParams.subscribe((params) => {
      const tab = params['tab'] || 'explore';
      this.changeTab(tab);
    });
    this.postsServiceService.refreshPosts$.subscribe(() => {
      this.currentPage = 1;
      this.loadPosts();
      this.getSuggestions();
    });
  }
  getSuggestions() {
    this.authService.getFollowSuggestions(50).subscribe({
      next: (res) => {
        console.log('sug', res);
        this.suggestions = res.data.suggestions;
      },
    });
  }
  loadUserData() {
    this.authService.userPhoto.subscribe((photo) => {
      this.userPhoto = photo || localStorage.getItem('userPhoto') || '';
    });

    this.authService.getMyProfile().subscribe({
      next: (res) => {
        this.userName = res.data.user.name;
      },
    });
  }

  changeTab(tabName: string) {
    this.currentTab = tabName;
    this.allPosts = [];
    this.currentPage = 1;
    this.hasNextPage = false;
    if (tabName === 'explore') {
      this.loadPosts();
    } else if (tabName === 'following') {
      this.loadPosts();
    } else if (tabName === 'saved') {
      this.postsServiceService.getUserBookmarks().subscribe({
        next: (res) => {
          this.allPosts = res.data.posts || res.data.bookmarks;
        },
        error: (err) => {
          console.log(err);
          this.allPosts = [];
        },
      });
    } else if (tabName === 'likes') {
      const savedLikes = localStorage.getItem('myLikedPosts');
      this.allPosts = savedLikes ? JSON.parse(savedLikes) : [];
    }
  }
  loadPosts() {
    if (this.isLoading) return;
    this.isLoading = true;
    const observer =
      this.currentTab === 'explore'
        ? this.authService.getAllPosts(this.currentPage)
        : this.postsServiceService.getFollowingPosts(this.currentPage);
    observer.subscribe({
      next: (res: any) => {
        console.log(res);
        const newPosts = res.data.posts || [];

        if (this.currentPage === 1) {
          this.allPosts = newPosts;
        } else {
          this.allPosts = [...this.allPosts, ...newPosts];
        }
        this.hasNextPage = res.meta.pagination.nextPage;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  loadMore() {
    if (this.hasNextPage && !this.isLoading) {
      this.currentPage++;
      this.loadPosts();
    }
  }
}
