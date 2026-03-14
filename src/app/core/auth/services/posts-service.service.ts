import { environment } from './../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PostsServiceService {
  private readonly router = inject(Router);
  private readonly httpClient = inject(HttpClient);
  public refreshPosts$ = new Subject<void>();
  notifyRefresh() {
    this.refreshPosts$.next();
  }
  getFollowingPosts(page: number = 1, limits: number = 20): Observable<any> {
    return this.httpClient.get(
      `${environment.baseUrl}/posts/feed?only=following&page=${page}&limit=${limits}`,
    );
  }

  getUserBookmarks(): Observable<any> {
    return this.httpClient.get(`${environment.baseUrl}/users/bookmarks`);
  }
  toggleBookmark(postId: string): Observable<any> {
    return this.httpClient.put(
      `${environment.baseUrl}/posts/${postId}/bookmark`,
      {},
      {
        headers: { 'Skip-Loading': 'true' },
      },
    );
  }

  getOtherUserProfile(userId: string): Observable<any> {
    return this.httpClient.get(`${environment.baseUrl}/users/${userId}/profile`);
  }

  getUserPosts(userId: string): Observable<any> {
    return this.httpClient.get(`${environment.baseUrl}/users/${userId}/posts`);
  }
  toggleLike(postId: string): Observable<any> {
    return this.httpClient.put(
      `${environment.baseUrl}/posts/${postId}/like`,
      {},
      {
        headers: { 'Skip-Loading': 'true' },
      },
    );
  }
  postCreation(formData: FormData): Observable<any> {
    return this.httpClient.post(`${environment.baseUrl}/posts`, formData);
  }
  deletePost(postId: string): Observable<any> {
    return this.httpClient.delete(`${environment.baseUrl}/posts/${postId}`);
  }
  sharePost(postId: string, content: object): Observable<any> {
    return this.httpClient.post(`${environment.baseUrl}/posts/${postId}/share`, content);
  }
  updatePost(postId: string, data: FormData | object): Observable<any> {
    return this.httpClient.put(`${environment.baseUrl}/posts/${postId}`, data);
  }
  getPostLikes(postId: string): Observable<any> {
    return this.httpClient.get(`${environment.baseUrl}/posts/${postId}/likes`);
  }
}
