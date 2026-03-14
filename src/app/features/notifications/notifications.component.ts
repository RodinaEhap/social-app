import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsService } from '../../core/auth/services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationsComponent implements OnInit {
  private readonly _notifService = inject(NotificationsService);

  notifications: any[] = [];
  unreadCount = 0;
  currentPage = 1;
  hasMore = true;
  loading = false;

  ngOnInit() {
    this.loadInitialData();
  }

  loadInitialData() {
    this.getUnreadCount();
    this.loadNotifications();
  }
  loadNotifications() {
    if (this.loading) return;
    this.loading = true;

    this._notifService.getNotifications(this.currentPage).subscribe({
      next: (res) => {
        console.log('Response:', res);

        const newNotifs = res?.data?.notifications || [];

        if (newNotifs.length < 10) {
          this.hasMore = false;
        }

        this.notifications = [...this.notifications, ...newNotifs];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.loading = false;
      },
    });
  }

  getUnreadCount() {
    this._notifService.getUnreadCount().subscribe({
      next: (res) => {
        this.unreadCount = res.data?.unreadCount || res.unreadCount || 0;
      },
    });
  }

  markAsRead(notif: any) {
    if (notif.isRead) return;
    this._notifService.markAsRead(notif._id).subscribe({
      next: () => {
        notif.isRead = true;
        if (this.unreadCount > 0) this.unreadCount--;
      },
    });
  }

  markAllAsRead() {
    this._notifService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach((n) => (n.isRead = true));
        this.unreadCount = 0;
      },
    });
  }

  loadMore() {
    if (this.hasMore) {
      this.currentPage++;
      this.loadNotifications();
    }
  }
}
