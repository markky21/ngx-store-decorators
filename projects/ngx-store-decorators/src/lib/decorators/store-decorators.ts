import { Selector } from '@ngrx/store';
import {
  checkIfHasPropertyStore,
  checkIfHasPropertySubscriptions,
  DecoratorOptionInterface,
  decoratorStoreOptionDefaultValues,
  getObservableFromSelector,
  isSelector,
  subscribeTo
} from '../common';

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
export function StoreSelect(selector: Selector<any, any> | any, options?: DecoratorOptionInterface) {
  return function(target, key) {
    const getter = function() {
      const privateKeyName = '_' + key;

      if (!this.hasOwnProperty(privateKeyName)) {
        options = { ...decoratorStoreOptionDefaultValues, ...options };
        checkIfHasPropertyStore.call(this);

        const context = {
          context: this,
          selector,
          key,
          options
        };

        this[privateKeyName] = isSelector(selector)
          ? getObservableFromSelector.call(context)
          : getObservableFromSelector.bind(context);
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
export function StoreSubscribe(selector: Selector<any, any>, options?: DecoratorOptionInterface) {
  return function(target, key) {
    const getter = function() {
      const privateKeyName = '_' + key;

      if (!this.hasOwnProperty(privateKeyName)) {
        options = { ...decoratorStoreOptionDefaultValues, ...options };
        checkIfHasPropertyStore.call(this);
        checkIfHasPropertySubscriptions.call(this, options);

        const context = {
          context: this,
          selector,
          key,
          options
        };

        let selection = isSelector(selector)
          ? getObservableFromSelector.call(context)
          : getObservableFromSelector.bind(context);

        subscribeTo.call(this, selection, privateKeyName, options);
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
      checkIfHasPropertyStore.call(this);

      this.store.dispatch(new Action(payload));
    };
    return descriptor;
  };
}
