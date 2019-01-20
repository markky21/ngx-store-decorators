import { isObservable, Observable, OperatorFunction, Subscription } from 'rxjs';
import { Action, select, Selector, Store } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';

import { GetOptions } from './decorators/injectables-decorators';

/*
* Interfaces
* */

export interface IDispatcher<T extends Action> {
  new (...args: any[]): T;
}

export interface IDecoratorOptionsForObservable {
  log?: boolean;
  pipe?: Array<OperatorFunction<any, any>>;
}

export interface IDecoratorOptionsForSubscription extends IDecoratorOptionsForObservable {
  subscriptionsCollector?: string;
  takeUntil?: string;
}

/*
* Types
* */

export type Selector<T, V> = (state: T) => V;
export type SelectorFactory<T, V, Y> = (arg: T) => (state: V) => Y;
export type ExtendedSelector<T, V, Y> = Selector<T, V> | SelectorFactory<T, V, Y>;

/*
* Const
* */

export const ERROR_MESSAGE_NO_STORE = `The class instance does not contain the store property`;

export const ERROR_MESSAGE_NO_SUBSCRIPTION_COLLECTOR = (className: string) =>
  `The class ${className} does not contain the subscriptions property`;

export const ERROR_MESSAGE_NOT_AN_OBSERVABLE = (injection: string, methodOrProperty: string) =>
  `The ${methodOrProperty} property of ${injection} instance is not a Observable or is not a method returning Observable`;

export const ERROR_MESSAGE_READONLY = (key: string) => `The "${key}" property is readonly`;

export const ERROR_MESSAGE_NO_INSTANCE_FOUND = (className: string, injectionName: string) =>
  `The "${className}" doesn't have instance of ${injectionName} class`;

/*
* Definitions
* */

export const decoratorOptionDefaultValuesForObservable: IDecoratorOptionsForObservable = {
  pipe: [],
  log: false
};

export const decoratorOptionDefaultValuesForSubscription: IDecoratorOptionsForSubscription = {
  ...decoratorOptionDefaultValuesForObservable,
  subscriptionsCollector: 'subscriptions'
};

/*
* Validators
* */

export function checkIfHasPropertyStore(): void {
  if (!(this.store as Store<any>)) {
    throw new Error(ERROR_MESSAGE_NO_STORE);
  }
}

export function checkIfHasPropertySubscriptions(options: IDecoratorOptionsForSubscription): void {
  if (!(this[options.subscriptionsCollector] as Subscription) && !options.takeUntil) {
    throw new Error(ERROR_MESSAGE_NO_SUBSCRIPTION_COLLECTOR(this.constructor.name));
  }
}

export function throwIsNotAnObservable(injection: string, methodOrProperty: string): never {
  throw new Error(ERROR_MESSAGE_NOT_AN_OBSERVABLE(injection, methodOrProperty));
}

export function throwIsReadonly(key: string): never {
  throw new Error(ERROR_MESSAGE_READONLY(key));
}

export function throwNoInstance(injection: string): never {
  throw new Error(ERROR_MESSAGE_NO_INSTANCE_FOUND(this.constructor.name, injection));
}
/*
* Utils
* */

export function isSelector<T, V>(selector: any): selector is Selector<T, V> {
  return selector.length === 0;
}

export function isFunction(functionToCheck: any): functionToCheck is Function {
  return !!functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

export function applyPipes<T>(selection: Observable<T>, options: IDecoratorOptionsForSubscription): Observable<T> {
  selection = options.takeUntil ? selection.pipe(takeUntil(this[options.takeUntil])) : selection;

  return options.pipe.length ? selection.pipe(...(options.pipe as [OperatorFunction<any, any>])) : selection;
}

export function logValues<T>(selection: Observable<T>, key: string, options: IDecoratorOptionsForSubscription): void {
  if (options.log) {
    const subscription = selection.subscribe((value: any) => {
      console.log(`${key}:`);
      console.dir(value);
    });

    if (options.subscriptionsCollector) {
      this[options.subscriptionsCollector].add(subscription);
    }
  }
}

export function getObservable(target: any, injection: string, methodOrProperty: string, args?: any[]): Observable<any> {
  if (isObservable(target)) {
    return target;
  } else {
    try {
      return getObservable(target(...args), injection, methodOrProperty);
    } catch (e) {
      throwIsNotAnObservable(injection, methodOrProperty);
    }
  }
}

export function getObservableFromSelector(...arg): Observable<any> {
  let selection = this.context.store.pipe(select(isSelector(this.selector) ? this.selector : this.selector(...arg)));

  selection = applyPipes.call(this.context, selection, this.options);

  logValues.call(this.context, selection, this.key, this.options);
  return selection;
}

export function subscribeTo(
  selection: Observable<any>,
  privateKeyName: string,
  options: IDecoratorOptionsForSubscription
): void {
  const subscription = selection.subscribe((value: any) => {
    this[privateKeyName] = value;
  });

  if (options.subscriptionsCollector) {
    this[options.subscriptionsCollector].add(subscription);
  }
}

export function getArgumentsFromOptions(options: GetOptions): any[] {
  return options && options.args ? options.args : [];
}

export function findClassInstancePropertyName(injection: Function): string | never {
  return (
    Object.getOwnPropertyNames(this).find(key => {
      return this[key] instanceof injection;
    }) || throwNoInstance.call(this, injection.name)
  );
}
