import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingService } from './core/auth/services/loading.service';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('social-app');
  private readonly loadingService = inject(LoadingService);
  private readonly translateService = inject(TranslateService);
  showSpinner: boolean = false;
  loadingSub!: Subscription;
  ngOnInit() {
    this.loadingSub = this.loadingService.isLoading$.subscribe((status) => {
      this.showSpinner = status;
    });
  }
  ngOnDestroy() {
    if (this.loadingSub) {
      this.loadingSub.unsubscribe();
    }
  }
}
