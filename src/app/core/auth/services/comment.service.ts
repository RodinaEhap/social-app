import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class CommentsService {
  private readonly httpClient = inject(HttpClient);

  createComment(formData: FormData, postId: string): Observable<any> {
    return this.httpClient.post(`${environment.baseUrl}/posts/${postId}/comments`, formData);
  }

  createReply(formData: FormData, postId: string, commentId: string): Observable<any> {
    return this.httpClient.post(
      `${environment.baseUrl}/posts/${postId}/comments/${commentId}/replies`,
      formData,
    );
  }

  updateComment(postId: string, commentId: string, content: string): Observable<any> {
    return this.httpClient.put(`${environment.baseUrl}/posts/${postId}/comments/${commentId}`, {
      content: content,
    });
  }

  deleteComment(postId: string, commentId: string): Observable<any> {
    return this.httpClient.delete(`${environment.baseUrl}/posts/${postId}/comments/${commentId}`);
  }

  getPostComments(postId: string, limit: number = 10): Observable<any> {
    return this.httpClient.get(
      `${environment.baseUrl}/posts/${postId}/comments?page=1&limit=${limit}`,
    );
  }

  getCommentReplies(postId: string, commentId: string, limit: number = 10): Observable<any> {
    return this.httpClient.get(
      `${environment.baseUrl}/posts/${postId}/comments/${commentId}/replies?page=1&limit=${limit}`,
    );
  }

  likeComment(postId: string, commentId: string): Observable<any> {
    return this.httpClient.put(
      `${environment.baseUrl}/posts/${postId}/comments/${commentId}/like`,
      {},
    );
  }
}
