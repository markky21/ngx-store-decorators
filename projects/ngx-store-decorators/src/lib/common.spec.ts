import { isObservable, Observable, of, Subject, Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';

import * as common from './common';

describe('Validators', () => {
  const toTest = [
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
      context: { prototype: { constructor: { name: 'TEST' } } },
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
      ...common.decoratorOptionDefaultValues,
      shouldDistinctUntilChanged: { enable: true },
      takeUntil: 'takeUntilSubject',
      pipe: [delay(0)]
    });

    expect(Object.getPrototypeOf(result.source.source.operator).constructor.name).toBe('DistinctUntilChangedOperator');
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

  it('getObservable() sh.ould return observable', () => {
    expect(isObservable(common.getObservable(() => of(1), 'TEST', 'TEST'))).toBeTruthy();

    let errorMessage: Error;

    try {
      common.getObservable(() => null, 'TEST', 'TEST');
    } catch (e) {
      errorMessage = e.message;
    }

    expect(errorMessage).toBeTruthy();
  });

  it('subscribeTo() should subscribe to an observable', () => {
    const subscriptions = new Subscription();
    const spySubscription = spyOn(subscriptions, 'add');
    const context = { subscriptions, key: null };

    common.subscribeTo.call(context, of(1), 'key', { subscriptionsCollector: 'subscriptions' });

    expect(context.key).toEqual(1);
    expect(spySubscription).toHaveBeenCalledTimes(1);
  });
});
