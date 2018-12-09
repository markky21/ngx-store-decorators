import { Store } from '@ngrx/store';

import { WithSubscriptions } from './with-subscriptions.class';

export abstract class StoreFacade extends WithSubscriptions {
  protected abstract store: Store<any>;
}
