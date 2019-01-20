import { Component, OnDestroy } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';

import {
  Get,
  Select,
  Subscribe
} from '../../../projects/ngx-store-decorators/src/lib/decorators/injectables-decorators';
import { CounterFacadeService } from '../store/facades/counter.facade.service';
import { WithSubscriptions } from '../../../projects/ngx-store-decorators/src/lib/classes/with-subscriptions.class';
import { AppSampleService } from '../app-sample.service';

@Component({
  selector: 'app-option-configurations',
  templateUrl: './option-configurations.component.html',
  styleUrls: ['./option-configurations.component.scss']
})
export class OptionConfigurationsComponent extends WithSubscriptions implements OnDestroy {
  @Select(CounterFacadeService, 'count$')
  public countWithLog$: Observable<number>;

  @Subscribe(CounterFacadeService, 'count$')
  public count: number;

  @Select(AppSampleService, 'observableWithLog$', { log: true })
  public observableWithLog$: Observable<boolean>;

  @Subscribe(CounterFacadeService, 'count$', { pipe: [delay(1000)] })
  public observableWithOperator: number;

  @Subscribe(CounterFacadeService, 'count$', { subscriptionsCollector: 'customSubscriptionsCollector' })
  public observableCustomSubscriptionsCollector: number;

  @Subscribe(CounterFacadeService, 'count$', { takeUntil: 'takeUntilSubject' })
  public observableWithTakeUntil: number;

  @Get(CounterFacadeService, 'countFunctionWithArg', { args: [3] })
  public getCountFunctionWithArguments: number;

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
