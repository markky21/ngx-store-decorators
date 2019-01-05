import { Component, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';

import { Get, Select, Subscribe } from '../../../projects/ngx-store-decorators/src/lib/decorators/injectables-decorators';
import { CounterFacadeService } from '../store/facades/counter.facade.service';
import { WithSubscriptions } from '../../../projects/ngx-store-decorators/src/lib/classes/with-subscriptions.class';

@Component({
  selector: 'app-basic-usage',
  templateUrl: './basic-usage.component.html',
  styleUrls: ['./basic-usage.component.scss']
})
export class BasicUsageComponent extends WithSubscriptions implements OnDestroy {

  // Decorator Select
  @Select('counterFacadeService', 'count$')
  public count$: Observable<number>;

  @Select('counterFacadeService', 'countMultiplyBy$', {args: [3]})
  public countMultiplyBy$: Observable<number>;

  // Decorator Subscribe
  @Subscribe('counterFacadeService', 'count$')
  public count: number;

  @Subscribe('counterFacadeService', 'countMultiplyBy$', {args: [3]})
  public countMultiplyBy: number;

  // Decorator Get
  @Get('counterFacadeService', 'count')
  public getCount: number;

  @Get('counterFacadeService', 'countFunction')
  public getCountFunction: number;

  @Get('counterFacadeService', 'countFunctionWithArg', {args: [3]})
  public getCountFunctionWithArguments: number;

  public constructor(public counterFacadeService: CounterFacadeService) {
    super();
  }

  public ngOnDestroy(): void {
    this.unsubscribeAll();
  }
}
