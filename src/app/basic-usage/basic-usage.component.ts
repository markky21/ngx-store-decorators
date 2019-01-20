import { Component, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';

import {
  Get,
  Select,
  Subscribe
} from '../../../projects/ngx-store-decorators/src/lib/decorators/injectables-decorators';
import { CounterFacadeService } from '../store/facades/counter.facade.service';
import { WithSubscriptions } from '../../../projects/ngx-store-decorators/src/lib/classes/with-subscriptions.class';

@Component({
  selector: 'app-basic-usage',
  templateUrl: './basic-usage.component.html',
  styleUrls: ['./basic-usage.component.scss']
})
export class BasicUsageComponent extends WithSubscriptions implements OnDestroy {
  // Decorator Select
  @Select(CounterFacadeService, 'count$')
  public count$: Observable<number>;

  @Select(CounterFacadeService, 'countMultiplyBy$', { args: [3] })
  public countMultiplyBy$: Observable<number>;

  // Decorator Subscribe
  @Subscribe(CounterFacadeService, 'count$')
  public count: number;

  @Subscribe(CounterFacadeService, 'countMultiplyBy$', { args: [3] })
  public countMultiplyBy: number;

  // Decorator Get
  @Get(CounterFacadeService, 'count')
  public getCount: number;

  @Get(CounterFacadeService, 'countFunction')
  public getCountFunction: number;

  @Get(CounterFacadeService, 'countFunctionWithArg', { args: [3] })
  public getCountFunctionWithArguments: number;

  public constructor(public counterFacadeService: CounterFacadeService) {
    super();
  }

  public ngOnDestroy(): void {
    this.unsubscribeAll();
  }
}
