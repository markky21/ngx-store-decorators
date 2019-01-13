import { isObservable, Observable, OperatorFunction, Subscription } from 'rxjs';
import { select, Selector, Store } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';

import { IDecoratorOptionsForGet } from './decorators/injectables-decorators';

/*
* Const
* */

export const ERROR_MESSAGE_NO_STORE = `The class instance does not contain the store property`;
export const ERROR_MESSAGE_NO_SUBSCRIPTION_COLLECTOR = (className: string) =>
  `The class ${className} does not contain the subscriptions property`;
export const ERROR_MESSAGE_NO_INJECTION_INSTANCE = (injection: string) =>
  `The class instance does not contain the injection: ${injection}`;
export const ERROR_MESSAGE_NO_METHOD_OR_PROPERTY = (injection: string, methodOrProperty: string) =>
  `The ${injection} instance does not contain the method or property: ${methodOrProperty}`;
export const ERROR_MESSAGE_NOT_AN_OBSERVABLE = (injection: string, methodOrProperty: string) =>
  `The ${methodOrProperty} property of ${injection} instance is not a Observable or is not a method returning Observable`;
export const ERROR_MESSAGE_READONLY = (key: string) => `The "${key}" property is readonly`;

/*
* Interfaces
* */

export interface IDecoratorOptionsForObservable {
  log?: boolean;
  pipe?: Array<OperatorFunction<any, any>>;
}

export interface IDecoratorOptionsForSubscription extends IDecoratorOptionsForObservable {
  subscriptionsCollector?: string;
  takeUntil?: string;
}

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
    throw new Error(ERROR_MESSAGE_NO_SUBSCRIPTION_COLLECTOR(this.constructor.name || this.prototype.constructor.name));
  }
}

export function checkIfHasInjection(injection: string): void {
  if (!this.hasOwnProperty(injection)) {
    throw new Error(ERROR_MESSAGE_NO_INJECTION_INSTANCE(injection));
  }
}

export function checkIfInjectionHasMethodOrProperty(injection: string, methodOrProperty: string): void {
  if (!hasOwnProperty(this[injection], methodOrProperty)) {
    throw new Error(ERROR_MESSAGE_NO_METHOD_OR_PROPERTY(injection, methodOrProperty));
  }
}

export function throwIsNotAnObservable(injection: string, methodOrProperty: string): void {
  throw new Error(ERROR_MESSAGE_NOT_AN_OBSERVABLE(injection, methodOrProperty));
}

export function throwIsReadonly(key: string): void {
  throw new Error(ERROR_MESSAGE_READONLY(key));
}

/*
* Utils
* */

export function hasOwnProperty(object: any, key: string): boolean {
  return typeof object[key] !== 'undefined';
}

export function isSelector(selector: Selector<any, any>) {
  return selector.length === 0;
}

export function isFunction(functionToCheck: any): boolean {
  return !!functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

export function applyPipes(selection: Observable<any>, options: IDecoratorOptionsForSubscription): Observable<any> {
  selection = options.takeUntil ? selection.pipe(takeUntil(this[options.takeUntil])) : selection;

  return options.pipe.length ? selection.pipe(...(options.pipe as [OperatorFunction<any, any>])) : selection;
}

export function logValues(selection: Observable<any>, key: string, options: IDecoratorOptionsForSubscription) {
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
) {
  const subscription = selection.subscribe((value: any) => {
    this[privateKeyName] = value;
  });

  if (options.subscriptionsCollector) {
    this[options.subscriptionsCollector].add(subscription);
  }
}

export function getArgumentsFromOptions<T extends IDecoratorOptionsForGet>(options: T): any[] {
  return options && options.args ? options.args : [];
}
