import { first } from 'rxjs/operators';
import { Observable, of, Subject, Subscription } from 'rxjs';

import { StoreDispatch, StoreSelect, StoreSubscribe } from './store-decorators';

export class StoreStub {
  public payload: Observable<any> = new Subject();

  public dispatch(action: any) {
    return this.select();
  }

  public pipe() {
    return this.select();
  }

  public select() {
    return this.payload;
  }
}

const storeSelector = () => {};
let SampleClass;
let SampleClassWithoutStore;
let SampleClassWithoutSubscriptions;
let sampleClassInstance;
let sampleClassWithoutStoreInstance;
let sampleClassWithoutSubscriptionsInstance;
let storeInstance: StoreStub;

beforeEach(() => {
  storeInstance = new StoreStub();

  SampleClass = class {
    public sampleProperty$: any;
    public subscriptions = new Subscription();
    public constructor(public store: StoreStub) {}
    public sampleMethod(): void {}
  };

  SampleClassWithoutStore = class {
    public sampleProperty$: any;
    public subscriptions = new Subscription();
    public sampleMethod(): void {}
  };

  SampleClassWithoutSubscriptions = class {
    public sampleProperty$: any;
    public constructor(public store: StoreStub) {}
    public sampleMethod(): void {}
  };

  sampleClassInstance = new SampleClass(storeInstance);
  sampleClassWithoutStoreInstance = new SampleClassWithoutStore();
  sampleClassWithoutSubscriptionsInstance = new SampleClassWithoutSubscriptions(storeInstance);
});

describe('Decorator StoreSelect', () => {
  it('should return observable from store when property was read', () => {
    const observable = of(21);
    const spy = spyOn<any>(storeInstance, 'pipe').and.returnValue(observable);

    const decoratorFn = StoreSelect(storeSelector);

    decoratorFn(sampleClassInstance, 'sampleProperty$');

    let values$;
    values$ = sampleClassInstance.sampleProperty$;
    values$ = sampleClassInstance.sampleProperty$;

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledTimes(1);
    values$.pipe(first()).subscribe(val => expect(val).toEqual(21));
  });

  it('should return throw an error when store property does not exist', () => {
    const observable = of(21);
    const spy = spyOn<any>(storeInstance, 'pipe').and.returnValue(observable);

    const decoratorFn = StoreSelect(storeSelector);

    let error;
    try {
      decoratorFn(sampleClassWithoutStoreInstance, 'sampleProperty$');
      const values$ = sampleClassWithoutStoreInstance.sampleProperty$;
    } catch (e) {
      error = e;
    }

    expect(error).toBeTruthy();
  });
});

describe('Decorator StoreSubscribe', () => {
  it('should subscribe to store and return value when property was read', () => {
    const observable = of(21, 22);
    const spy = spyOn<any>(storeInstance, 'pipe').and.returnValue(observable);

    const decoratorFn = StoreSubscribe(storeSelector);

    decoratorFn(sampleClassInstance, 'sampleProperty$');

    let values;
    values = sampleClassInstance.sampleProperty$;
    values = sampleClassInstance.sampleProperty$;

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(values).toEqual(22);
  });

  it('should return throw an error when store property does not exist', () => {
    const observable = of(21);
    const spy = spyOn<any>(storeInstance, 'pipe').and.returnValue(observable);

    const decoratorFn = StoreSubscribe(storeSelector);

    let error;
    try {
      decoratorFn(sampleClassWithoutStoreInstance, 'sampleProperty$');
      const values$ = sampleClassWithoutStoreInstance.sampleProperty$;
    } catch (e) {
      error = e;
    }

    expect(error).toBeTruthy();
  });

  it('should return throw an error when subscriptions property does not exist', () => {
    const observable = of(21);
    const spy = spyOn<any>(storeInstance, 'pipe').and.returnValue(observable);

    const decoratorFn = StoreSubscribe(storeSelector);

    let error;
    try {
      decoratorFn(sampleClassWithoutSubscriptionsInstance, 'sampleProperty$');
      const values = sampleClassWithoutSubscriptionsInstance.sampleProperty$;
    } catch (e) {
      error = e;
    }

    expect(error).toBeTruthy();
  });
});

describe('Decorator StoreDispatch', () => {
  it('should throw an error when store property does not exist', () => {
    let error;

    const descriptor = StoreDispatch(class {})(
      SampleClassWithoutStore.prototype,
      'sampleMethod',
      Object.getOwnPropertyDescriptor(SampleClassWithoutStore.prototype, 'sampleMethod')
    );
    Object.defineProperty(SampleClassWithoutStore.prototype, 'sampleMethod', descriptor);

    try {
      new SampleClassWithoutStore().sampleMethod();
    } catch (e) {
      error = e;
    }

    expect(error).toBeTruthy();
  });

  it('should dispatch to the store when method has been called', () => {
    const spy = spyOn<any>(storeInstance, 'dispatch').and.returnValue(null);

    const descriptor = StoreDispatch(class {})(
      SampleClass.prototype,
      'sampleMethod',
      Object.getOwnPropertyDescriptor(SampleClass.prototype, 'sampleMethod')
    );
    Object.defineProperty(SampleClass.prototype, 'sampleMethod', descriptor);

    new SampleClass(storeInstance).sampleMethod();

    expect(spy).toHaveBeenCalled();
  });
});
