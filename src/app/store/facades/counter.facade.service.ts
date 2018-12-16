import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { StoreFacade } from 'projects/ngx-store-decorators/src/lib/classes/store-facade.class';
import {
  StoreDispatch,
  StoreSelect,
  StoreSubscribe
} from 'projects/ngx-store-decorators/src/lib/decorators/store-decorators';

import * as actions from '../actions/counter.actions';
import * as selectors from '../selectors/counter.selector';
import { State } from '../reducers/app.reducer';

@Injectable()
export class CounterFacadeService extends StoreFacade {
  @StoreSelect(selectors.getCount) public count$: Observable<number>;

  @StoreSelect(selectors.getSecondCount) public secondCount$: Observable<number>;
  @StoreSelect(selectors.getSecondCount, { shouldDistinctUntilChanged: { enable: false } })
  public secondCountWithoutChangeDetection$: Observable<number>;

  @StoreSubscribe(selectors.getCount) public count: number;

  public constructor(protected store: Store<State>) {
    super();
  }

  @StoreDispatch(actions.CounterSet)
  public counterSet(payload: number) {}

  @StoreDispatch(actions.CounterIncrement)
  public counterIncrement() {}

  @StoreDispatch(actions.CounterDecrement)
  public counterDecrement() {}

  @StoreDispatch(actions.CounterReset)
  public counterReset() {}

  @StoreDispatch(actions.SecondCounterDecrement)
  public secondCounterDecrement() {}
}
