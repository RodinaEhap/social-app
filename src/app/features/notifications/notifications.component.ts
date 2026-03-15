import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsService } from '../../core/auth/services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationsComponent implements OnInit {
  private readonly notificationsService = inject(NotificationsService);
  private readonly router = inject(Router);
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
    this.notificationsService.getNotifications(this.currentPage).subscribe({
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
    this.notificationsService.getUnreadCount().subscribe({
      next: (res) => {
        this.unreadCount = res.data?.unreadCount || 0;
      },
    });
  }
  markAsRead(notif: any) {
    if (notif.isRead) return;
    this.notificationsService.markAsRead(notif._id).subscribe({
      next: () => {
        notif.isRead = true;
        if (this.unreadCount > 0) this.unreadCount--;
      },
    });
  }
  markAllAsRead() {
    this.notificationsService.markAllAsRead().subscribe({
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
  goToProfile(notif: any) {
    this.markAsRead(notif);
    this.router.navigate(['/profile', notif.actor?._id]);
  }
}
