import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private requestCount = 0;
  isLoading$ = new BehaviorSubject<boolean>(false);
  show() {
    this.requestCount++;
    setTimeout(() => {
      this.isLoading$.next(true);
    });
  }

  hide() {
    this.requestCount--;
    if (this.requestCount <= 0) {
      this.requestCount = 0;
      setTimeout(() => {
        this.isLoading$.next(false);
      });
    }
  }
}
