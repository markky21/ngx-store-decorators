# NgxStoreDecorators for Angular [![Build Status](https://travis-ci.org/markky21/ngx-store-decorators.svg?branch=master)](https://travis-ci.org/markky21/ngx-store-decorators) [![Coverage Status](https://coveralls.io/repos/github/markky21/ngx-store-decorators/badge.svg?branch=master)](https://coveralls.io/github/markky21/ngx-store-decorators?branch=master)

[![NPM](https://nodei.co/npm/ngx-store-decorators.png?downloads=true&stars=true)](https://nodei.co/npm/ngx-store-decorators/)

NgxStoreDecorators is a set of useful decorators and classes for quickly create NgRx store facades, 
assigning values, observables or observables values to class properties.

<br>This package introduce:
 
`@StoreSelect()`, `@StoreSubscribe()`, `@StoreDispatch()` decorators 
and `StoreFacade` abstract class for NgRx store maintaining,


`@Select()`, `@Subscribe()` decorators and `WithSubscriptions` abstract class 
to assign observables or observables values and handle subscriptions,

also `@Get()` to assign values from injected classes method or properties. 

<br>

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

<br>

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
    
    @Get('counterFacadeService', 'count')
    public getCount: number;
    
    @Get('counterFacadeService', 'countFunction')
    public getCountFunction: number;
  
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
    
    public getCount: number;
    
    public getCountFunction: number;
    
    public readonly subscriptions = new Subscription();
  
    public constructor(public counterFacadeService: CounterFacadeService) {}
  
    public ngOnInit(): void {
      this.count$ = this.counterFacadeService.count$
      
      this.subscriptions.add(
        this.counterFacadeService.count$
        .subscribe(value => this.count = value)
      )
      
      this.getCount = this.counterFacadeService.count;
      
      this.getCountFunction = this.counterFacadeService.countFunction();
    }
    
    public ngOnDestroy(): void {
      this.unsubscribeAll();
    }
    
    public unsubscribeAll(): void {
      this.subscriptions.unsubscribe();
    }
  }
```

<br>

## Decorators configuration (optional)

**`log`** - [**`?boolean`**]

Default is set to **false**. Set to **true** if you want to console.log all new values from an observable.
<br> _Optional for `@StoreSelect()`,  `@StoreSubscribe()`,  `@Select()`,  `@Subscribe()`_

<br>**`pipe`** - [**`?OperatorFunction<any, any>[]`**]

Here you can pass some RxJs operators.
<br> _Optional for `@StoreSelect()`,  `@StoreSubscribe()`,  `@Select()`,  `@Subscribe()`_


<br>**`subscriptionsCollector`** - [**`?string`**]

Default is set to **subscriptions** witch should be an RxJs **Subscription** instance. 
You can extend component or service with `StoreFacade` or `WithSubscriptions` abstract classes
to automatically add this property to class.
<br> _Optional for `@StoreSubscribe()`, `@Subscribe()`_

<br>**`takeUntil`** - [**`?string`**]

You can handle subscriptions by **takeUntil** operator. 
Here you just pass a name of the class property witch should be **Subject<boolean>** instance.
<br> _Optional for `@StoreSubscribe()`, `@Subscribe()`_

<br>**`args`** - [**`?any[]`**]

You can resolve injection method with given arguments.
<br> _Optional for `@Select()`, `@Subscribe()`, `@get()`_

<br>

## Demo

To see decorators and classes usage in real app check 
[DEMO](https://markky21.github.io/ngx-store-decorators/)
 or download git repository then type 
 
     npm install // OR
     yarn
     
     ng serve
 
Then navigate to `http://localhost:4200/`.
