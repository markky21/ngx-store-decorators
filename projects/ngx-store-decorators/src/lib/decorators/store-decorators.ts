import { Action } from '@ngrx/store';
import { Observable } from 'rxjs';

import * as fromCommon from '../common';

/*
* Interfaces
* */

/* tslint:disable-next-line:no-empty-interface */
export interface StoreSelectOptions extends fromCommon.IDecoratorOptionsForObservable {}

/* tslint:disable-next-line:no-empty-interface */
export interface StoreSubscribeOptions extends fromCommon.IDecoratorOptionsForSubscription {}

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
export function StoreSelect<T, V, Y>(selector: fromCommon.ExtendedSelector<T, V, Y>, options?: StoreSelectOptions) {
  return function(target, key) {
    const getter = function(): Observable<V> {
      const privateKeyName = '_' + key;

      if (!this.hasOwnProperty(privateKeyName)) {
        options = { ...fromCommon.decoratorOptionDefaultValuesForObservable, ...options };
        fromCommon.checkIfHasPropertyStore.call(this);

        const context = {
          context: this,
          selector,
          key,
          options
        };

        this[privateKeyName] = fromCommon.isSelector(selector)
          ? fromCommon.getObservableFromSelector.call(context)
          : fromCommon.getObservableFromSelector.bind(context);
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
export function StoreSubscribe<T, V, Y>(
  selector: fromCommon.ExtendedSelector<T, V, Y>,
  options?: StoreSubscribeOptions
) {
  return function(target, key) {
    const getter = function(): V {
      const privateKeyName = '_' + key;

      if (!this.hasOwnProperty(privateKeyName)) {
        options = { ...fromCommon.decoratorOptionDefaultValuesForSubscription, ...options };
        fromCommon.checkIfHasPropertyStore.call(this);
        fromCommon.checkIfHasPropertySubscriptions.call(this, options);

        const context = {
          context: this,
          selector,
          key,
          options
        };

        const selection = fromCommon.isSelector(selector)
          ? fromCommon.getObservableFromSelector.call(context)
          : fromCommon.getObservableFromSelector.bind(context);

        fromCommon.subscribeTo.call(this, selection, privateKeyName, options);
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
 * The decorator who dispatch payload to store
 *
 * @param action - store action
 *
 * Sample usage:
 * ```
 * @StoreDispatch(ClearInvoice)
 * public clearInvoice(invoiceId: number): void {}
 * ```
 */
export function StoreDispatch<T extends Action>(action: fromCommon.IDispatcher<T>) {
  return function(target: any, key: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    descriptor.writable = false;
    descriptor.value = function(...payload) {
      fromCommon.checkIfHasPropertyStore.call(this);

      this.store.dispatch(new action(...payload));
    };
    return descriptor;
  };
}
