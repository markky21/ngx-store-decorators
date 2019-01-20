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
 * @param injection - constructor of injection
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
export function Select<T extends Function, K extends keyof T['prototype']>(
  injection: T,
  methodOrProperty: K,
  options?: SelectOptions
) {
  return function(target, key) {
    const getter = function(): T {
      const privateKeyName = '_' + key;

      if (!this.hasOwnProperty(privateKeyName)) {
        options = { ...fromCommon.decoratorOptionDefaultValuesForObservable, ...options };

        const classInstance = fromCommon.findClassInstancePropertyName.call(this, injection);

        let selection: Observable<any>;
        selection = fromCommon.getObservable(
          this[classInstance][methodOrProperty],
          injection.constructor.name,
          methodOrProperty.toString(),
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
 * @param injection - constructor of injection
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
export function Subscribe<T extends Function, K extends keyof T['prototype']>(
  injection: T,
  methodOrProperty: K,
  options?: SubscribeOptions
) {
  return function(target, key) {
    const getter = function(): T {
      const privateKeyName = '_' + key;

      if (!this.hasOwnProperty(privateKeyName)) {
        options = { ...fromCommon.decoratorOptionDefaultValuesForSubscription, ...options };
        fromCommon.checkIfHasPropertySubscriptions.call(this, options);

        const classInstance = fromCommon.findClassInstancePropertyName.call(this, injection);

        let selection: Observable<any>;
        selection = fromCommon.getObservable(
          this[classInstance][methodOrProperty],
          injection.constructor.name,
          methodOrProperty.toString(),
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
 * @param injection - constructor of injection
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
export function Get<T extends Function, K extends keyof T['prototype']>(
  injection: T,
  methodOrProperty: K,
  options?: GetOptions
) {
  return function(target, key) {
    const getter = function() {
      const privateKeyName = '_' + key;

      if (!this.hasOwnProperty(privateKeyName)) {
        const classInstance = fromCommon.findClassInstancePropertyName.call(this, injection);

        Object.defineProperty(this, privateKeyName, {
          get: fromCommon.isFunction(this[classInstance][methodOrProperty])
            ? () => this[classInstance][methodOrProperty](...fromCommon.getArgumentsFromOptions(options))
            : () => this[classInstance][methodOrProperty],
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
