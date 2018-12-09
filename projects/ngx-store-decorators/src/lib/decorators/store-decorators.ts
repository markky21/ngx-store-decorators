import { select, Selector, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { distinctUntilObjectChanged } from '../rxjs-pipes/distinctUntilObjectChanged';

export interface DecoratorSelectSubscribeOptionsInterface {
  shouldDistinctUntilChanged: boolean;
  compareFunction?: (p: any, q: any) => boolean;
}

/**
 * The decorator who pass Observable from injection method or property to decorated property
 *
 * @param selector - store selector
 * @param options
 * @return Observable
 *
 * Sample usage:
 * ```
 * @StoreSelect(getCurrency)
 * public currency$: Observable<CurrencyInterface>;
 * ```
 */
export function StoreSelect(
  selector: Selector<any, any>,
  options: DecoratorSelectSubscribeOptionsInterface = { shouldDistinctUntilChanged: true }
) {
  return function(target, key) {
    const getter = function() {
      if (!(this.store as Store<any>)) {
        throw new Error(`The class instance does not contain the store property`);
      }

      const privateKeyName = '_' + key;

      if (!this[privateKeyName]) {
        let selection = this.store.pipe(select(selector));

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
 * The decorator who subscribes to the store and submits the subscription to "subscriptions" collector
 *
 * @param selector - store selector
 * @param options
 * @return values from subscription
 *
 * Sample usage:
 * ```
 * @Subscribe(getCurrency)
 * public currency: CurrencyInterface;
 * ```
 */
export function StoreSubscribe(
  selector: Selector<any, any>,
  options: DecoratorSelectSubscribeOptionsInterface = { shouldDistinctUntilChanged: true }
) {
  return function(target, key) {
    const getter = function() {
      if (!(this.store as Store<any>)) {
        throw new Error(`The class instance does not contain the store property`);
      }
      if (!(this.subscriptions as Subscription)) {
        throw new Error(`The class ${this.prototype.constructor.name} does not contain the subscription property`);
      }

      const privateKeyName = '_' + key;

      if (!this[privateKeyName]) {
        let selection = this.store.pipe(select(selector));
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

/**
 * The decorator who dispatch payload to store
 *
 * @param Action - store action
 *
 * Sample usage:
 * ```
 * @StoreDispatch(ClearInvoice)
 * public clearInvoice(invoiceId: number): void {}
 * ```
 */
export function StoreDispatch<T extends any>(Action: T) {
  return function(target: any, key: string, descriptor: PropertyDescriptor) {
    descriptor.writable = false;
    descriptor.value = function(payload: any = undefined) {
      if (!(this.store as Store<any>)) {
        throw new Error(`The class instance does not contain the store property`);
      }

      this.store.dispatch(new Action(payload));
    };
    return descriptor;
  };
}
