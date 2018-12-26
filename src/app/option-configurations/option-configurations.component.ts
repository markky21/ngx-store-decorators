import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';

import { CounterFacadeService } from '../store/facades/counter.facade.service';
import { Select, Subscribe } from '../../../projects/ngx-store-decorators/src/lib/decorators/injectables-decorators';
import { WithSubscriptions } from '../../../projects/ngx-store-decorators/src/lib/classes/with-subscriptions.class';
import { AppSampleService } from '../app-sample.service';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-option-configurations',
  templateUrl: './option-configurations.component.html',
  styleUrls: ['./option-configurations.component.scss']
})
export class OptionConfigurationsComponent extends WithSubscriptions implements OnDestroy {
  @Select('counterFacadeService', 'count$')
  public countWithLog$: Observable<number>;

  @Subscribe('counterFacadeService', 'count$')
  public count: number;

  @Select('appSampleService', 'observableWithLog$', { log: true })
  public observableWithLog$: Observable<boolean>;

  @Subscribe('counterFacadeService', 'count$', { pipe: [delay(1000)] })
  public observableWithOperator: number;

  @Subscribe('counterFacadeService', 'count$', { subscriptionsCollector: 'customSubscriptionsCollector' })
  public observableCustomSubscriptionsCollector: number;

  @Subscribe('counterFacadeService', 'count$', { takeUntil: 'takeUntilSubject' })
  public observableWithTakeUntil: number;


  public customSubscriptionsCollector: Subscription = new Subscription();
  public takeUntilSubject = new Subject<true>();

  public constructor(public counterFacadeService: CounterFacadeService, public appSampleService: AppSampleService) {
    super();
  }

  public ngOnDestroy(): void {
    super.unsubscribeAll();
  }

  public toggleObservableWithLog(): void {
    this.appSampleService.toggleObservableWithLog();
  }

  public unsubscribeCustomSubscriptionsCollector(): void {
    this.customSubscriptionsCollector.unsubscribe();
  }

  public unsubscribeByTakeUntil(): void {
    this.takeUntilSubject.next(true);
  }
}
