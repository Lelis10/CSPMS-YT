// notification.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<number>(0);
  public notification$ = this.notificationSubject.asObservable();

  private pendingRequestsCount = 0;

  public getPendingRequestsCount(): number {
    return this.pendingRequestsCount;
  }

  public notifyNewPendingRequests(count: number) {
    this.pendingRequestsCount = count;
    this.notificationSubject.next(count);
  }
}
