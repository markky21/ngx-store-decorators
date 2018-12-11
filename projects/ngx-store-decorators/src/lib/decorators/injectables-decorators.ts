import { Observable, isObservable } from 'rxjs';

import {
  applyPipes,
  checkIfHasInjection,
  checkIfHasPropertySubscriptions,
  checkIfInjectionHasMethodOrProperty,
  decoratorOptionDefaultValues,
  DecoratorOptionInterface,
  logValues,
  throwIsNotAnObservable,
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
      options = { ...decoratorOptionDefaultValues, ...options };

      checkIfHasInjection.call(this, injection);
      checkIfInjectionHasMethodOrProperty.call(this, injection, methodOrProperty);

      const privateKeyName = '_' + key;

      if (!this[privateKeyName]) {
        const method = this[injection][methodOrProperty];
        let selection: Observable<any>;

        if (isObservable(method)) {
          selection = this[injection][methodOrProperty];
        } else {
          try {
            selection = this[injection][methodOrProperty]();
          } catch (e) {
            throwIsNotAnObservable(injection, methodOrProperty);
          }
        }

        selection = applyPipes(selection, options);
        logValues.call(this, selection, key, options);

        this[privateKeyName] = selection;
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
      options = { ...decoratorOptionDefaultValues, ...options };

      checkIfHasInjection.call(this, injection);
      checkIfInjectionHasMethodOrProperty.call(this, injection, methodOrProperty);
      checkIfHasPropertySubscriptions.call(this, options);

      const privateKeyName = '_' + key;

      if (!this[privateKeyName]) {
        const method = this[injection][methodOrProperty];
        let selection: Observable<any>;

        if (isObservable(method)) {
          selection = this[injection][methodOrProperty];
        } else {
          try {
            selection = this[injection][methodOrProperty]();
          } catch (e) {
            throwIsNotAnObservable(injection, methodOrProperty);
          }
        }

        selection = applyPipes(selection, options);
        logValues.call(this, selection, key, options);

        this[options.subscriptionsCollector].add(
          selection.subscribe(data => {
            this[privateKeyName] = data;
          })
        );
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
