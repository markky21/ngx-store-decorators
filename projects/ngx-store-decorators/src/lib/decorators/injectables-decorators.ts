import { Observable } from 'rxjs';

import * as fromCommon from '../common';

/*
* Interfaces
* */

export interface GetOptions {
  args?: any[];
}

/* tslint:disable-next-line:no-empty-interface */
export interface SelectOptions extends GetOptions, fromCommon.IDecoratorOptionsForObservable {}

/* tslint:disable-next-line:no-empty-interface */
export interface SubscribeOptions extends GetOptions, fromCommon.IDecoratorOptionsForSubscription {}

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
export function Select<T>(injection: string, methodOrProperty: string, options?: SelectOptions) {
  return function(target, key) {
    const getter = function(): T {
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

    const setter = fromCommon.throwIsReadonly.bind(this, key);

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
export function Subscribe<T>(injection: string, methodOrProperty: string, options?: SubscribeOptions) {
  return function(target, key) {
    const getter = function(): T {
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

    const setter = fromCommon.throwIsReadonly.bind(this, key);

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
export function Get<T>(injection: string, methodOrProperty: string, options?: GetOptions) {
  return function(target, key) {
    const getter = function(): T {
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

    const setter = fromCommon.throwIsReadonly.bind(this, key);

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
