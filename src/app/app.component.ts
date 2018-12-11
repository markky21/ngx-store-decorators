import { Component, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';

import { WithSubscriptions } from 'projects/ngx-store-decorators/src/lib/classes/with-subscriptions.class';
import { Select, Subscribe } from 'projects/ngx-store-decorators/src/lib/decorators/injectables-decorators';

import { CounterFacadeService } from './store/facades/counter.facade.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends WithSubscriptions implements OnDestroy {
  @Select('counterFacadeService', 'count$', {log: true})
  public count$: Observable<number>;

  @Subscribe('counterFacadeService', 'count$')
  public count: number;

  public constructor(public counterFacadeService: CounterFacadeService) {
    super();
  }

  public ngOnDestroy(): void {
    this.unsubscribeAll();
  }
}
