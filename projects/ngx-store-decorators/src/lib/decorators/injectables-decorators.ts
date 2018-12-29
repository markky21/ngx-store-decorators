import { Observable } from 'rxjs';

import {
  applyPipes,
  checkIfHasInjection,
  checkIfHasPropertySubscriptions,
  checkIfInjectionHasMethodOrProperty,
  decoratorInjectableOptionDefaultValues,
  DecoratorOptionInterface,
  getObservable,
  logValues,
  subscribeTo,
  throwIsReadonly
} from '../common';

/**
 * The decorator who pass Observable from injection method or property to decorated property
 *
 * @param injection - injection name
 * @param methodOrProperty - method or property name
 * @param options - options
 * @return Observable
 *
 * Sample usage:
 * ```
 * @Select('sampleService', 'currency$')
 * public currency$: Observable<CurrencyInterface>;
 * ```
 */
export function Select(injection: string, methodOrProperty: string, options?: DecoratorOptionInterface) {
  return function(target, key) {
    const getter = function() {
      const privateKeyName = '_' + key;

      if (!this.hasOwnProperty(privateKeyName)) {
        options = { ...decoratorInjectableOptionDefaultValues, ...options };
        checkIfHasInjection.call(this, injection);
        checkIfInjectionHasMethodOrProperty.call(this, injection, methodOrProperty);

        let selection: Observable<any>;
        selection = getObservable(this[injection][methodOrProperty], injection, methodOrProperty);
        selection = applyPipes.call(this, selection, options);
        this[privateKeyName] = selection;

        logValues.call(this, selection, key, options);
      }

      return this[privateKeyName];
    };

    const setter = function() {
      throwIsReadonly(key);
    };

    if (delete target[key]) {
      Object.defineProperty(target, key, {
        get: getter,
        set: setter,
        enumerable: true,
        configurable: true
      });
    }
  };
}

/**
 * The decorator who subscribes to the observable and submits the subscription to "subscriptions" collector
 *
 * @param injection - injection name
 * @param methodOrProperty - method or property name
 * @param options - options
 * @return values from subscription
 *
 * Sample usage:
 * ```
 * @Subscribe('sampleService', 'currency$')
 * public currency: CurrencyInterface;
 * ```
 */
export function Subscribe(injection: string, methodOrProperty: string, options?: DecoratorOptionInterface) {
  return function(target, key) {
    const getter = function() {
      const privateKeyName = '_' + key;

      if (!this.hasOwnProperty(privateKeyName)) {
        options = { ...decoratorInjectableOptionDefaultValues, ...options };
        checkIfHasInjection.call(this, injection);
        checkIfInjectionHasMethodOrProperty.call(this, injection, methodOrProperty);
        checkIfHasPropertySubscriptions.call(this, options);

        let selection: Observable<any>;
        selection = getObservable(this[injection][methodOrProperty], injection, methodOrProperty);
        selection = applyPipes.call(this, selection, options);
        subscribeTo.call(this, selection, privateKeyName, options);

        logValues.call(this, selection, key, options);
      }

      return this[privateKeyName];
    };

    const setter = function() {
      throwIsReadonly(key);
    };

    if (delete target[key]) {
      Object.defineProperty(target, key, {
        get: getter,
        set: setter,
        enumerable: true,
        configurable: true
      });
    }
  };
}