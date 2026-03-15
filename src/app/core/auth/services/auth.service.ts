import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly router = inject(Router);
  private readonly httpClient = inject(HttpClient);

  userId: string = localStorage.getItem('userId') || '';

  saveUserId() {
    this.getMyProfile().subscribe({
      next: (res) => {
        this.userId = res.data.user._id;
        localStorage.setItem('userId', this.userId);
      },
    });
  }
  signUp(data: object): Observable<any> {
    return this.httpClient.post(`${environment.baseUrl}/users/signup`, data);
  }

  signIn(data: object): Observable<any> {
    return this.httpClient.post(`${environment.baseUrl}/users/signin`, data);
  }

  changePassword(data: any): Observable<any> {
    return this.httpClient.patch(`${environment.baseUrl}/users/change-password`, data);
  }

  userPhoto: BehaviorSubject<string> = new BehaviorSubject<string>(
    localStorage.getItem('userPhoto') || '',
  );

  getMyProfile(): Observable<any> {
    return this.httpClient.get(`${environment.baseUrl}/users/profile-data`);
  }

  uploadPhoto(formData: FormData): Observable<any> {
    return this.httpClient.put(`${environment.baseUrl}/users/upload-photo`, formData);
  }

  getFollowSuggestions(limit: number = 20): Observable<any> {
    return this.httpClient.get(`${environment.baseUrl}/users/suggestions?limit=${limit}`);
  }

  toggleFollow(userId: string): Observable<any> {
    return this.httpClient.put(
      `${environment.baseUrl}/users/${userId}/follow`,
      {},
      {
        headers: { 'Skip-Loading': 'true' },
      },
    );
  }

  getUserProfile(userId: string): Observable<any> {
    return this.httpClient.get(`${environment.baseUrl}/users/${userId}/profile`);
  }

  getAllPosts(page: number = 1): Observable<any> {
    return this.httpClient.get(`${environment.baseUrl}/posts?page=${page}&limit=20`);
  }

  logout() {
    localStorage.clear();
    this.userPhoto.next('');
    this.userId = '';
    this.router.navigate(['/auth/login']);
  }
}
