import { isObservable, Observable, of, Subject, Subscription } from 'rxjs';
import { delay, first } from 'rxjs/operators';

import * as common from './common';

describe('Validators', () => {
  const toTest: {
    methodName: string;
    method: any;
    context: any;
    arg: any[];
    contain: string;
  }[] = [
    {
      methodName: 'checkIfHasPropertyStore()',
      method: common.checkIfHasPropertyStore,
      context: {},
      arg: [],
      contain: common.ERROR_MESSAGE_NO_STORE
    },
    {
      methodName: 'checkIfHasPropertySubscriptions()',
      method: common.checkIfHasPropertySubscriptions,
      context: { constructor: { name: 'TEST' } },
      arg: [{}],
      contain: common.ERROR_MESSAGE_NO_SUBSCRIPTION_COLLECTOR('TEST')
    },
    {
      methodName: 'checkIfHasInjection()',
      method: common.checkIfHasInjection,
      context: {},
      arg: ['TEST'],
      contain: common.ERROR_MESSAGE_NO_INJECTION_INSTANCE('TEST')
    },
    {
      methodName: 'checkIfInjectionHasMethodOrProperty()',
      method: common.checkIfInjectionHasMethodOrProperty,
      context: { TEST: 'TEST' },
      arg: ['TEST', 'TEST'],
      contain: common.ERROR_MESSAGE_NO_METHOD_OR_PROPERTY('TEST', 'TEST')
    },
    {
      methodName: 'throwIsReadonly()',
      method: common.throwIsReadonly,
      context: {},
      arg: ['TEST'],
      contain: common.ERROR_MESSAGE_READONLY('TEST')
    }
  ];

  toTest.forEach(test => {
    it(`${test.methodName} should trow an error`, () => {
      let errorMessage: Error;

      try {
        test.method.call(test.context, ...test.arg);
      } catch (e) {
        errorMessage = e.message;
      }

      expect(errorMessage).toContain(test.contain);
    });
  });
});

describe('Utils', () => {
  it('applyPipes() should apply pipes', () => {
    const result = common.applyPipes.call({ takeUntilSubject: new Subject() }, new Observable(), {
      ...common.decoratorOptionDefaultValuesForObservable,
      takeUntil: 'takeUntilSubject',
      pipe: [delay(0)]
    });

    expect(Object.getPrototypeOf(result.source.operator).constructor.name).toBe('TakeUntilOperator');
  });

  it('logValues() should subscribe to observable and log value', () => {
    const spyLog = spyOn(console, 'log');
    const spyLog2 = spyOn(console, 'dir');
    const observable = of(1);
    const subscriptions = new Subscription();
    const spySubscription = spyOn(subscriptions, 'add');

    common.logValues.call({ subscriptions }, observable, 'key', { log: true, subscriptionsCollector: 'subscriptions' });

    expect(spyLog).toHaveBeenCalledTimes(1);
    expect(spyLog2).toHaveBeenCalledTimes(1);
    expect(spySubscription).toHaveBeenCalledTimes(1);
  });

  it('getObservable() should return observable', () => {
    expect(isObservable(common.getObservable(() => of(1), 'TEST', 'TEST'))).toBeTruthy();

    let errorMessage: Error;

    try {
      common.getObservable(() => null, 'TEST', 'TEST');
    } catch (e) {
      errorMessage = e.message;
    }

    expect(errorMessage).toBeTruthy();
  });

  it('getObservableFromSelector() should return observable', () => {
    const context = {
      context: { store: { pipe: () => of(1) } },
      selector: () => {},
      options: common.decoratorOptionDefaultValuesForObservable,
      key: 'key'
    };

    common.getObservableFromSelector
      .call(context)
      .pipe(first())
      .subscribe(val => {
        expect(val).toEqual(1);
      });
  });

  it('getObservableFromSelector() call selector factory with passed arguments', () => {
    const context = {
      context: { store: { pipe: () => of(1) } },
      selector: a => {},
      options: common.decoratorOptionDefaultValuesForObservable,
      key: 'key'
    };
    const spy = spyOn(context, 'selector').and.callThrough();

    common.getObservableFromSelector.call(context, 2);

    expect(spy).toHaveBeenCalledWith(2);
  });

  it('subscribeTo() should subscribe to an observable', () => {
    const subscriptions = new Subscription();
    const spySubscription = spyOn(subscriptions, 'add');
    const context = { subscriptions, key: null };

    common.subscribeTo.call(context, of(1), 'key', { subscriptionsCollector: 'subscriptions' });

    expect(context.key).toEqual(1);
    expect(spySubscription).toHaveBeenCalledTimes(1);
  });

  it('isFunction() should return true if arg is a function', () => {
    const toTest = [
      { arg: () => {}, result: true },
      { arg: 'a', result: false },
      { arg: 0, result: false },
      { arg: function() {}, result: true },
      { arg: Observable, result: true },
      { arg: new Observable(), result: false },
      { arg: null, result: false },
      { arg: undefined, result: false }
    ];

    toTest.forEach((test: any) => {
      expect(common.isFunction(test.arg)).toEqual(test.result);
    });
  });

  it('getArgumentsFromOptions() should return args property from decorator options', () => {
    const toTest = [{ arg: [1], result: [1] }, { arg: undefined, result: [] }];

    toTest.forEach((test: any) => {
      expect(common.getArgumentsFromOptions({ args: test.arg })).toEqual(test.result);
    });
  });
});
