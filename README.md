# NgxStoreDecorators for Angular [![Build Status](https://travis-ci.org/markky21/ngx-store-decorators.svg?branch=master)](https://travis-ci.org/markky21/ngx-store-decorators) [![Coverage Status](https://coveralls.io/repos/github/markky21/ngx-store-decorators/badge.svg?branch=master)](https://coveralls.io/github/markky21/ngx-store-decorators?branch=master)

[![NPM](https://nodei.co/npm/ngx-store-decorators.png?downloads=true&stars=true)](https://nodei.co/npm/ngx-store-decorators/)

NgxStoreDecorators is a set of useful decorators and classes for quickly create NgRx store facades, 
creating observables and subscribing to them. 

This package introduce `@StoreSelect()`, `@StoreSubscribe()`, `@StoreDispatch()` decorators 
and `StoreFacade` abstract class for NgRx store maintaining,
also `@Select()`, `@Subscribe()` decorators and `WithSubscriptions` abstract class 
to create observables and handle subscriptions.

## Example

### Sample store facade service:

  ```typescript
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
  without Store decorators and `StoreFacade` abstract class:
  
  ```typescript
  @Injectable()
  export class CounterFacadeService {
  
    public count$: Observable<number>;
    
    public countMultiplyBy$: (multiplyBy: number) => Observable<number>;
    
    public count: number;
  
    public readonly subscriptions = new Subscription();
    
    public constructor(protected store: Store<State>) {
      this.count$ = this.store.pipe(select(selectors.getCount));
      
      this.countMultiplyBy$ = (multiplyBy: number) => this.store.pipe(select(selectors.getCountMutliplyBy(multiplyBy)));
      
      this.subscriptions.add(
        this.store.pipe(select(selectors.getCount))
        .subscribe(value => this.count = value));
    }
  
    public counterSet(payload: number): void {
      this.store.dispatch(new actions.CounterSet(payload))
    }
    
    public unsubscribeAll(): void {
      this.subscriptions.unsubscribe();
    }
  }
  ```

### Sample usage in component or service:

  ```typescript
  @Component({
    selector: 'app-basic-usage',
    templateUrl: './basic-usage.component.html',
    styleUrls: ['./basic-usage.component.scss']
  })
  export class BasicUsageComponent extends WithSubscriptions implements OnDestroy {
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

without decorators and `WithSubscriptions` abstract class:

  ```typescript
  @Component({
    selector: 'app-basic-usage',
    templateUrl: './basic-usage.component.html',
    styleUrls: ['./basic-usage.component.scss']
  })
  export class BasicUsageComponent implements OnInit, OnDestroy {
    public count$: Observable<number>;
  
    public count: number;
    
    public readonly subscriptions = new Subscription();
  
    public constructor(public counterFacadeService: CounterFacadeService) {}
  
    public ngOnInit(): void {
      this.count$ = this.counterFacadeService.count$
      
      this.subscriptions.add(
        this.counterFacadeService.count$
        .subscribe(value => this.count = value)
      )
    }
    
    public ngOnDestroy(): void {
      this.unsubscribeAll();
    }
    
    public unsubscribeAll(): void {
      this.subscriptions.unsubscribe();
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

To see decorators and classes usage in real app check 
[DEMO](https://markky21.github.io/ngx-store-decorators/)
 or download git repository then type 
 
     npm install // OR
     yarn
     
     ng serve
 
Then navigate to `http://localhost:4200/`.
