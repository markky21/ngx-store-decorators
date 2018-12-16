import { isObservable, Observable, OperatorFunction, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';

import { distinctUntilObjectChanged } from './rxjs-pipes/distinctUntilObjectChanged';
import { takeUntil } from 'rxjs/operators';

/*
* Interfaces
* */

export interface DecoratorOptionInterface {
  log?: boolean;
  pipe?: OperatorFunction<any, any>[];
  subscriptionsCollector?: string;
  takeUntil?: string;
  shouldDistinctUntilChanged?: {
    enable: boolean;
    compareFunction?: (p: any, q: any) => boolean;
  };
}

/*
* Definitions
* */

export const decoratorOptionDefaultValues: DecoratorOptionInterface = {
  shouldDistinctUntilChanged: {
    enable: false
  },
  pipe: [],
  log: false,
  subscriptionsCollector: 'subscriptions'
};

export const decoratorStoreOptionDefaultValues: DecoratorOptionInterface = {
  ...decoratorOptionDefaultValues,
  shouldDistinctUntilChanged: { enable: true }
};
export const decoratorInjectableOptionDefaultValues: DecoratorOptionInterface = {
  ...decoratorOptionDefaultValues
};

/*
* Validators
* */

export function checkIfHasPropertyStore(): void {
  if (!(this.store as Store<any>)) {
    throw new Error(`The class instance does not contain the store property`);
  }
}

export function checkIfHasPropertySubscriptions(options: DecoratorOptionInterface): void {
  if (!(this[options.subscriptionsCollector] as Subscription) && !options.takeUntil) {
    throw new Error(`The class ${this.prototype.constructor.name} does not contain the subscriptions property`);
  }
}

export function checkIfHasInjection(injection: string): void {
  if (!this[injection]) {
    throw new Error(`The class instance does not contain the injection: ${injection}`);
  }
}

export function checkIfInjectionHasMethodOrProperty(injection: string, methodOrProperty: string): void {
  if (!this[injection][methodOrProperty]) {
    throw new Error(`The ${injection} instance does not contain the method or property: ${methodOrProperty}`);
  }
}

export function throwIsNotAnObservable(injection: string, methodOrProperty: string): void {
  throw new Error(`this.${injection}.${methodOrProperty} is not a Observable or is not a method returning Observable`);
}

export function throwIsReadonly(key: string): void {
  throw new Error(`The "${key}" property is readonly`);
}

/*
* Utils
* */

export function applyPipes(selection: Observable<any>, options: DecoratorOptionInterface): Observable<any> {
  selection = options.shouldDistinctUntilChanged && options.shouldDistinctUntilChanged.enable
    ? selection.pipe(distinctUntilObjectChanged(options.shouldDistinctUntilChanged.compareFunction))
    : selection;

  selection = options.takeUntil ? selection.pipe(takeUntil(this[options.takeUntil])) : selection;

  return options.pipe.length ? selection.pipe(...(options.pipe as [OperatorFunction<any, any>])) : selection;
}

export function logValues(selection: Observable<any>, key: string, options: DecoratorOptionInterface) {
  if (options.log) {
    const subscription = selection.subscribe(value => {
      console.log(`${key.toUpperCase()}:`);
      console.dir(value);
    });

    if (options.subscriptionsCollector) {
      this[options.subscriptionsCollector].add(subscription);
    }
  }
}

export function getObservable(target: any, injection: string, methodOrProperty: string): Observable<any> {
  if (isObservable(target)) {
    return target;
  } else {
    try {
      return getObservable(target(), injection, methodOrProperty);
    } catch (e) {
      throwIsNotAnObservable(injection, methodOrProperty);
    }
  }
}

export function subscribeTo(selection: Observable<any>, privateKeyName: string, options: DecoratorOptionInterface) {
  const subscription = selection.subscribe(data => {
    this[privateKeyName] = data;
  });

  if (options.subscriptionsCollector) {
    this[options.subscriptionsCollector].add(subscription);
  }
}
