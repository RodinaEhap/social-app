import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private readonly HttpClient = inject(HttpClient);

  getNotifications(page: number = 1): Observable<any> {
    const options = {
      params: {
        unread: 'false',
        page: page.toString(),
        limit: '10',
      },
    };

    return this.HttpClient.get(`${environment.baseUrl}/notifications`, options);
  }

  getUnreadCount(): Observable<any> {
    return this.HttpClient.get(`${environment.baseUrl}/notifications/unread-count`, {
      headers: { 'Skip-Loading': 'true' },
    });
  }

  markAsRead(notificationId: string): Observable<any> {
    return this.HttpClient.patch(
      `${environment.baseUrl}/notifications/${notificationId}/read`,
      {},
      {
        headers: { 'Skip-Loading': 'true' },
      },
    );
  }

  markAllAsRead(): Observable<any> {
    return this.HttpClient.patch(
      `${environment.baseUrl}/notifications/read-all`,
      {},
      {
        headers: { 'Skip-Loading': 'true' },
      },
    );
  }
}
