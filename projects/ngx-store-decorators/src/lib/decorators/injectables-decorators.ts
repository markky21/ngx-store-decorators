import { isObservable } from 'rxjs/internal/util/isObservable';
import { Subscription, Observable } from 'rxjs';

import { DecoratorSelectSubscribeOptionsInterface } from './store-decorators';
import { distinctUntilObjectChanged } from '../rxjs-pipes/distinctUntilObjectChanged';

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
export function Select(
  injection: string,
  methodOrProperty: string,
  options?: DecoratorSelectSubscribeOptionsInterface
) {
  return function(target, key) {
    const getter = function() {
      if (!this[injection]) {
        throw new Error(`The class instance does not contain the injection: ${injection}`);
      }
      if (!this[injection][methodOrProperty]) {
        throw new Error(`The ${injection} instance does not contain the method or property: ${methodOrProperty}`);
      }

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
            throw new Error(`this.${injection}.${methodOrProperty} is not a Observable or returning Observable`);
          }
        }

        if (options && options.shouldDistinctUntilChanged) {
          selection = selection.pipe(distinctUntilObjectChanged(options.compareFunction));
        }

        this[privateKeyName] = selection;
      }

      return this[privateKeyName];
    };

    const setter = function() {
      throw new Error(`The "${key}" property is readonly`);
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
export function Subscribe(
  injection: string,
  methodOrProperty: string,
  options?: DecoratorSelectSubscribeOptionsInterface
) {
  return function(target, key) {
    const getter = function() {
      if (!this[injection]) {
        throw new Error(`The class instance does not contain the injection: ${injection}`);
      }
      if (!this[injection][methodOrProperty]) {
        throw new Error(`The ${injection} instance does not contain the method or property: ${methodOrProperty}`);
      }
      if (!(this.subscriptions as Subscription)) {
        throw new Error(`The class ${this.prototype.constructor.name} does not contain the subscription property`);
      }

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
            throw new Error(`this.${injection}.${methodOrProperty} is not a Observable or returning Observable`);
          }
        }

        if (options && options.shouldDistinctUntilChanged) {
          selection = selection.pipe(distinctUntilObjectChanged(options.compareFunction));
        }

        this.subscriptions.add(
          selection.subscribe(data => {
            this[privateKeyName] = data;
          })
        );
      }

      return this[privateKeyName];
    };

    const setter = function() {
      throw new Error(`The "${key}" property is readonly`);
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
