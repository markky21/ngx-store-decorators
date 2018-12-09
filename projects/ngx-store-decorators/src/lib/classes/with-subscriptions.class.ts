import { Subscription } from 'rxjs';

export abstract class WithSubscriptions {
  protected subscriptions: Subscription = new Subscription();

  public unsubscribeAll(): void {
    this.subscriptions.unsubscribe();
  }
}
