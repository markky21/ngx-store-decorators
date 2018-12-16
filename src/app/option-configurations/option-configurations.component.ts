import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';

import { CounterFacadeService } from '../store/facades/counter.facade.service';
import { Select, Subscribe } from '../../../projects/ngx-store-decorators/src/lib/decorators/injectables-decorators';
import { WithSubscriptions } from '../../../projects/ngx-store-decorators/src/lib/classes/with-subscriptions.class';
import { AppSampleService } from '../app-sample.service';
import { debounce, delay } from 'rxjs/operators';

@Component({
  selector: 'app-option-configurations',
  templateUrl: './option-configurations.component.html',
  styleUrls: ['./option-configurations.component.scss']
})
export class OptionConfigurationsComponent extends WithSubscriptions implements OnInit, OnDestroy {
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

  @Select('counterFacadeService', 'secondCount$')
  public observableWithChangeDetection$: Observable<number>;

  @Select('counterFacadeService', 'secondCountWithoutChangeDetection$')
  public observableWithoutChangeDetection$: Observable<number>;

  public customSubscriptionsCollector: Subscription = new Subscription();
  public takeUntilSubject = new Subject<true>();
  public changesLogWithChangeDetection: string[] = [];
  public changesLogWithoutChangeDetection: string[] = [];

  public constructor(public counterFacadeService: CounterFacadeService, public appSampleService: AppSampleService) {
    super();
  }

  public ngOnInit(): void {
    this.subscriptions.add(
      this.observableWithChangeDetection$.subscribe(value => {
        this.changesLogWithChangeDetection.push(`Emitted value: ${value}`);
      })
    );
    this.subscriptions.add(
      this.observableWithoutChangeDetection$.subscribe(value => {
        this.changesLogWithoutChangeDetection.push(`Emitted value: ${value}`);
      })
    );
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
