import { first } from 'rxjs/operators';
import { of, Subscription, Observable } from 'rxjs';

import { Get, Select, Subscribe } from './injectables-decorators';

let SampleClass;
let SampleClassWithoutSubscriptions;
let sampleClassInstance;
let sampleServiceInstance;
let sampleClassWithoutSubscriptionsInstance;

beforeEach(() => {
  class SampleService {
    public sampleProperty = 2;
    public observableInProperty: Observable<number> = of(21);
    public observableInMethod(): Observable<number> {
      return of(21);
    }

    public methodNotReturnObservable() {
      return 1;
    }

    public sampleMethod() {
      return 2;
    }
  }

  SampleClass = class {
    public sampleProperty: any = null;
    public sampleProperty$: any;
    public subscriptions = new Subscription();
    public constructor(private sampleService: SampleService) {}
  };

  SampleClassWithoutSubscriptions = class {
    public sampleProperty$: any;
    public constructor(private sampleService: SampleService) {}
  };

  sampleServiceInstance = new SampleService();
  sampleClassInstance = new SampleClass(sampleServiceInstance);
  sampleClassWithoutSubscriptionsInstance = new SampleClassWithoutSubscriptions(sampleServiceInstance);
});

describe('Decorator Select', () => {
  it('should return observable from service when property was read', () => {
    const decoratorFn = Select('sampleService', 'observableInProperty');
    decoratorFn(sampleClassInstance, 'sampleProperty$');

    const values$ = sampleClassInstance.sampleProperty$;

    values$.pipe(first()).subscribe(val => expect(val).toEqual(21));
  });

  it('should return observable from service when method was call', () => {
    const decoratorFn = Select('sampleService', 'observableInMethod');
    decoratorFn(sampleClassInstance, 'sampleProperty$');

    const values$ = sampleClassInstance.sampleProperty$;

    values$.pipe(first()).subscribe(val => expect(val).toEqual(21));
  });

  it('should return throw an error when injection does not exist', () => {
    const decoratorFn = Select('sampleService2', 'observableInMethod');
    decoratorFn(sampleClassInstance, 'sampleProperty$');
    let error;

    try {
      decoratorFn(sampleClassInstance, 'sampleProperty$');
      const values$ = sampleClassInstance.sampleProperty$;
    } catch (e) {
      error = e;
    }

    expect(error).toBeTruthy();
  });

  it('should return throw an error when method or property on injection does not exist', () => {
    const decoratorFn = Select('sampleService', 'observableInMethod2');
    let error;

    try {
      decoratorFn(sampleClassInstance, 'sampleProperty$');
      const values$ = sampleClassInstance.sampleProperty$;
    } catch (e) {
      error = e;
    }

    expect(error).toBeTruthy();
  });

  it('should trow an error when user try to set value to decorated property', () => {
    const decoratorFn = Select('sampleService', 'observableInProperty');

    let error;
    try {
      decoratorFn(sampleClassInstance, 'sampleProperty$');
      sampleClassInstance.sampleProperty$ = 1;
    } catch (e) {
      error = e;
    }

    expect(error).toBeTruthy();
  });
});

describe('Decorator Subscribe', () => {
  it('should subscribe and return value from service when property was read', () => {
    const decoratorFn = Subscribe('sampleService', 'observableInProperty');

    decoratorFn(sampleClassInstance, 'sampleProperty$');

    const values = sampleClassInstance.sampleProperty$;

    expect(values).toEqual(21);
  });

  it('should subscribe and return observable from service when method was call', () => {
    const decoratorFn = Subscribe('sampleService', 'observableInMethod');
    decoratorFn(sampleClassInstance, 'sampleProperty$');

    const values = sampleClassInstance.sampleProperty$;

    expect(values).toEqual(21);
  });

  it('should throw an error when injection does not exist', () => {
    const decoratorFn = Subscribe('sampleService2', 'observableInMethod');
    decoratorFn(sampleClassInstance, 'sampleProperty$');

    let error;

    try {
      decoratorFn(sampleClassInstance, 'sampleProperty$');
      const values$ = sampleClassInstance.sampleProperty$;
    } catch (e) {
      error = e;
    }

    expect(error).toBeTruthy();
  });

  it('should throw an error when method or property on injection does not exist', () => {
    const decoratorFn = Subscribe('sampleService', 'observableInMethod2');
    let error;

    try {
      decoratorFn(sampleClassInstance, 'sampleProperty$');
      const values$ = sampleClassInstance.sampleProperty$;
    } catch (e) {
      error = e;
    }

    expect(error).toBeTruthy();
  });

  it('should return throw an subscriptions property does not exist', () => {
    const decoratorFn = Subscribe('sampleService', 'observableInMethod');
    let error;

    try {
      decoratorFn(sampleClassWithoutSubscriptionsInstance, 'sampleProperty$');
      const values$ = sampleClassWithoutSubscriptionsInstance.sampleProperty$;
    } catch (e) {
      error = e;
    }

    expect(error).toBeTruthy();
  });

  it('should return throw an error when subscriptions property does not exist', () => {
    const decoratorFn = Subscribe('sampleService', 'observableInMethod', {
      subscriptionsCollector: 'wrongPropertyName'
    });
    let error;

    try {
      decoratorFn(sampleClassInstance, 'sampleProperty$');
      const values$ = sampleClassInstance.sampleProperty$;
    } catch (e) {
      error = e;
    }

    expect(error).toBeTruthy();
  });

  it('should return throw an error when property or method does not return Observable', () => {
    const decoratorFn = Subscribe('sampleService', 'methodNotReturnObservable');
    let error;

    try {
      decoratorFn(sampleClassInstance, 'sampleProperty$');
      const values = sampleClassInstance.sampleProperty$;
    } catch (e) {
      error = e;
    }

    expect(error).toBeTruthy();
  });

  it('should trow an error when user try to set value to decorated property', () => {
    const decoratorFn = Subscribe('sampleService', 'observableInProperty');

    let error;
    try {
      decoratorFn(sampleClassInstance, 'sampleProperty$');
      sampleClassInstance.sampleProperty$ = 1;
    } catch (e) {
      error = e;
    }

    expect(error).toBeTruthy();
  });
});

describe('Decorator Get', () => {
  it('should get the value from injected class property', () => {
    const decoratorFn = Get('sampleService', 'sampleProperty');

    decoratorFn(sampleClassInstance, 'sampleProperty');
    const values$ = sampleClassInstance.sampleProperty;

    expect(values$).toEqual(2);
  });

  it('should get the value from injected class method', () => {
    const decoratorFn = Get('sampleService', 'sampleMethod');

    decoratorFn(sampleClassInstance, 'sampleProperty');
    const values$ = sampleClassInstance.sampleProperty;

    expect(values$).toEqual(2);
  });

  it('should throw an error when injection does not exist', () => {
    const decoratorFn = Get('sampleService2', 'sampleMethod');
    decoratorFn(sampleClassInstance, 'sampleProperty');

    let error;

    try {
      decoratorFn(sampleClassInstance, 'sampleProperty');
      const values$ = sampleClassInstance.sampleProperty;
    } catch (e) {
      error = e;
    }

    expect(error).toBeTruthy();
  });

  it('should throw an error when method or property on injection does not exist', () => {
    const decoratorFn = Get('sampleService', 'sampleMethod2');
    let error;

    try {
      decoratorFn(sampleClassInstance, 'sampleProperty');
      const values$ = sampleClassInstance.sampleProperty;
    } catch (e) {
      error = e;
    }

    expect(error).toBeTruthy();
  });

  it('should trow an error when user try to set value to decorated property', () => {
    const decoratorFn = Get('sampleService', 'sampleMethod');

    let error;
    try {
      decoratorFn(sampleClassInstance, 'sampleProperty');
      sampleClassInstance.sampleProperty = 1;
    } catch (e) {
      error = e;
    }

    expect(error).toBeTruthy();
  });
});
