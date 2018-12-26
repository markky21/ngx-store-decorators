# NgxStoreDecorators for Angular [![Build Status](https://travis-ci.org/markky21/ngx-store-decorators.svg?branch=master)](https://travis-ci.org/markky21/ngx-store-decorators) [![Coverage Status](https://coveralls.io/repos/github/markky21/ngx-store-decorators/badge.svg?branch=master)](https://coveralls.io/github/markky21/ngx-store-decorators?branch=master)

[![NPM](https://nodei.co/npm/ngx-store-decorators.png?downloads=true&stars=true)](https://nodei.co/npm/ngx-chips/)

NgxStoreDecorators is a set of useful decorators and classes for quickly create NgRx store facades, 
creating observables and subscribing to them. 

This package introduce `@StoreSelect()`, `@StoreSubscribe()`, `@StoreDispatch()` decorators and `StoreFacade()` abstract class for NgRx store maintaining,
also `@Select()`, `@Subscribe()` decorators and `WithSubscriptions` abstract class to create observables and handle subscriptions.

##Example
1. Sample store facade service:
  ```
  @Injectable()
  export class CounterFacadeService extends StoreFacade {
    @StoreSelect(selectors.getCount) 
    public count$: Observable<number>;
  
    @StoreSelect(selectors.getCountMutliplyBy) 
    public countMultiplyBy$: (multiplyBy: number) => Observable<number>;
  
    @StoreSubscribe(selectors.getCount) 
    public count: number;
  
    public constructor(protected store: Store<State>) {
      super();
    }
  
    @StoreDispatch(actions.CounterSet)
    public counterSet(payload: number) {}
  }
  ```

2. Sample usage in component or service:
  ```
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
  
    public constructor(public counterFacadeService: CounterFacadeService) {
      super();
    }
  
    public ngOnDestroy(): void {
      this.unsubscribeAll();
    }
  }
```

## Decorators configuration (optional)

**`log`** - [**`?boolean`**]

Default is set to **false**. Set to **true** if you want to console.log all new values from an observable.

**`pipe`** - [**`?OperatorFunction<any, any>[]`**]

Here you can pass some RxJs operators.


**`subscriptionsCollector`** - [**`?string`**]

Needed only for `@StoreSubscribe()` and `@Subscribe` decorators. 
Default is set to **subscriptions** witch should be an RxJs **Subscription** instance. 
You can extend component or service with `StoreFacade` or `WithSubscriptions` abstract classes
to automatically add this property to class.

**`takeUntil`** - [**`?string`**]

Optional needed only for `@StoreSubscribe()` and `@Subscribe` decorators. 
You can handle subscriptions by **takeUntil** operator. 
Here you just pass a name of the class property witch should be **Subject<boolean>** instance 

## Demo

To see decorators and classes usage in real app run `ng serve` for a dev server. Navigate to `http://localhost:4200/`.
