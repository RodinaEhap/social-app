import { PostsServiceService } from './../../core/auth/services/posts-service.service';
import { Component, inject, HostListener, OnInit } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth.service';
import { SuggestionsCardComponent } from '../../shared/ui/suggestions-card/suggestions-card.component';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterModule, SuggestionsCardComponent, FormsModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly postsServiceService = inject(PostsServiceService);

  //============dropdown&&createPostModal================
  isProfileMenuOpen = false;
  showCreateModal: boolean = false;
  isDarkMode = false;
  suggestions: any[] = [];
  isSuggestionsOpen = false;
  isMobileMenuOpen = false;
  postContent: string = '';

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  mediaType: 'image' | 'video' | null = null;

  //=========user profile===========
  userPhoto: string = '';
  //==========CloseDropdownWhenClickingOutside==========
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-trigger')) {
      this.isProfileMenuOpen = false;
    }
  }
  //========theme===========
  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
  //========profileMenuOpenOrNot===========
  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      document.documentElement.classList.add('dark');
    }
    this.authService.userPhoto.subscribe((urlPhoto) => {
      if (urlPhoto) this.userPhoto = urlPhoto;
    });
    this.authService.getMyProfile().subscribe({
      next: (res) => {
        console.log(res);
        const serverPhoto = res.data.user.photo;
        if (serverPhoto) {
          this.userPhoto = serverPhoto;
          localStorage.setItem('userPhoto', serverPhoto);
          this.authService.userPhoto.next(serverPhoto);
        }
      },
    });
    this.getSuggestions();
    this.postsServiceService.refreshPosts$.subscribe(() => {
      this.getSuggestions();
    });
  }
  getSuggestions() {
    this.authService.getFollowSuggestions(50).subscribe({
      next: (res: any) => {
        console.log('sug', res);
        this.suggestions = res.data.suggestions;
      },
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.mediaType = file.type.startsWith('video') ? 'video' : 'image';

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
  handleCreatePost() {
    if (!this.postContent.trim() && !this.selectedFile) return;

    const formData = new FormData();
    formData.append('body', this.postContent);
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.postsServiceService.postCreation(formData).subscribe({
      next: (res) => {
        this.showCreateModal = false;
        this.postContent = '';
        this.previewUrl = null;
        this.selectedFile = null;
        this.postsServiceService.notifyRefresh();
      },
    });
  }

  logOut() {
    this.authService.logout();
  }
}
