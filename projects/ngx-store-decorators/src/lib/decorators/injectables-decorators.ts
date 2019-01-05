import { Observable } from 'rxjs';

import * as fromCommon from '../common';

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
export function Select(injection: string, methodOrProperty: string, options?: fromCommon.IDecoratorOptionsSelect) {
  return function(target, key) {
    const getter = function() {
      const privateKeyName = '_' + key;

      if (!this.hasOwnProperty(privateKeyName)) {
        options = { ...fromCommon.decoratorOptionDefaultValuesForObservable, ...options };
        fromCommon.checkIfHasInjection.call(this, injection);
        fromCommon.checkIfInjectionHasMethodOrProperty.call(this, injection, methodOrProperty);

        let selection: Observable<any>;
        selection = fromCommon.getObservable(
          this[injection][methodOrProperty],
          injection,
          methodOrProperty,
          fromCommon.getArgumentsFromOptions(options)
        );
        selection = fromCommon.applyPipes.call(this, selection, options);
        this[privateKeyName] = selection;

        fromCommon.logValues.call(this, selection, key, options);
      }

      return this[privateKeyName];
    };

    const setter = function() {
      fromCommon.throwIsReadonly(key);
    };

    if (delete target[key]) {
      Object.defineProperty(target, key, {
        get: getter,
        set: setter,
        enumerable: true,
        configurable: false
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
export function Subscribe(
  injection: string,
  methodOrProperty: string,
  options?: fromCommon.IDecoratorOptionsForSubscribe
) {
  return function(target, key) {
    const getter = function() {
      const privateKeyName = '_' + key;

      if (!this.hasOwnProperty(privateKeyName)) {
        options = { ...fromCommon.decoratorOptionDefaultValuesForSubscription, ...options };
        fromCommon.checkIfHasInjection.call(this, injection);
        fromCommon.checkIfInjectionHasMethodOrProperty.call(this, injection, methodOrProperty);
        fromCommon.checkIfHasPropertySubscriptions.call(this, options);

        let selection: Observable<any>;
        selection = fromCommon.getObservable(
          this[injection][methodOrProperty],
          injection,
          methodOrProperty,
          fromCommon.getArgumentsFromOptions(options)
        );
        selection = fromCommon.applyPipes.call(this, selection, options);
        fromCommon.subscribeTo.call(this, selection, privateKeyName, options);

        fromCommon.logValues.call(this, selection, key, options);
      }

      return this[privateKeyName];
    };

    const setter = function() {
      fromCommon.throwIsReadonly(key);
    };

    if (delete target[key]) {
      Object.defineProperty(target, key, {
        get: getter,
        set: setter,
        enumerable: true,
        configurable: false
      });
    }
  };
}

/**
 * The decorator who get the value from injected class method or property
 *
 * @param injection - injection name
 * @param methodOrProperty - method or property name
 * @param options - options
 * @return values from return
 *
 * Sample usage:
 * ```
 * @Get('sampleService', 'currency')
 * public currency: CurrencyInterface;
 * ```
 */
export function Get(injection: string, methodOrProperty: string, options?: fromCommon.IDecoratorOptionsForGet) {
  return function(target, key) {
    const getter = function() {
      const privateKeyName = '_' + key;

      if (!this.hasOwnProperty(privateKeyName)) {
        fromCommon.checkIfHasInjection.call(this, injection);
        fromCommon.checkIfInjectionHasMethodOrProperty.call(this, injection, methodOrProperty);

        Object.defineProperty(this, privateKeyName, {
          get: fromCommon.isFunction(this[injection][methodOrProperty])
            ? () => this[injection][methodOrProperty](...fromCommon.getArgumentsFromOptions(options))
            : () => this[injection][methodOrProperty],
          set: undefined,
          enumerable: false,
          configurable: false
        });
      }

      return this[privateKeyName];
    };

    const setter = function() {
      fromCommon.throwIsReadonly(key);
    };

    if (delete target[key]) {
      Object.defineProperty(target, key, {
        get: getter,
        set: setter,
        enumerable: true,
        configurable: false
      });
    }
  };
}
