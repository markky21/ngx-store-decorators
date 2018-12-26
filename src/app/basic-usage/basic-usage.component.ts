import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { Select, Subscribe } from '../../../projects/ngx-store-decorators/src/lib/decorators/injectables-decorators';
import { CounterFacadeService } from '../store/facades/counter.facade.service';
import { WithSubscriptions } from '../../../projects/ngx-store-decorators/src/lib/classes/with-subscriptions.class';

@Component({
  selector: 'app-basic-usage',
  templateUrl: './basic-usage.component.html',
  styleUrls: ['./basic-usage.component.scss']
})
export class BasicUsageComponent extends WithSubscriptions implements OnInit, OnDestroy {
  @Select('counterFacadeService', 'count$')
  public count$: Observable<number>;

  @Subscribe('counterFacadeService', 'count$')
  public count: number;

  public countMultiplyBy$: Observable<number>;

  public constructor(public counterFacadeService: CounterFacadeService) {
    super();
  }

  public ngOnDestroy(): void {
    this.unsubscribeAll();
  }

  public ngOnInit(): void {
    this.countMultiplyBy$ = this.counterFacadeService.countMultiplyBy$(3);
  }
}
