import { Observable, OperatorFunction, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';

import { distinctUntilObjectChanged } from './rxjs-pipes/distinctUntilObjectChanged';

/*
* Interfaces
* */

export interface DecoratorOptionInterface {
  shouldDistinctUntilChanged?: boolean;
  compareFunction?: (p: any, q: any) => boolean;
  pipe?: OperatorFunction<any, any>[];
  log?: boolean;
  subscriptionsCollector?: string;
}

/*
* Definitions
* */

export const decoratorOptionDefaultValues: DecoratorOptionInterface = {
  shouldDistinctUntilChanged: false,
  compareFunction: undefined,
  pipe: [],
  log: false,
  subscriptionsCollector: 'subscriptions'
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
  if (!(this[options.subscriptionsCollector] as Subscription)) {
    throw new Error(`The class ${this.prototype.constructor.name} does not contain the subscriptions property`);
  }
}

export function checkIfHasInjection(injection: string): void {
  if (!this[injection]) {
    throw new Error(`The class instance does not contain the injection: ${injection}`);
  }
}

export function checkIfInjectionHasMethodOrProperty(injection: string, methodOrProperty: string): void {
  console.log(injection);
  if (!this[injection][methodOrProperty]) {
    throw new Error(`The ${injection} instance does not contain the method or property: ${methodOrProperty}`);
  }
}

export function throwIsNotAnObservable(injection: string, methodOrProperty: string): void {
  throw new Error(`this.${injection}.${methodOrProperty} is not a Observable or returning Observable`);
}

export function throwIsReadonly(key: string): void {
  throw new Error(`The "${key}" property is readonly`);
}

/*
* Utils
* */

export const applyPipes = (selection: Observable<any>, options: DecoratorOptionInterface): Observable<any> => {
  selection = options.shouldDistinctUntilChanged
    ? selection.pipe(distinctUntilObjectChanged(options.compareFunction))
    : selection;
  return options.pipe.length ? selection.pipe(...(options.pipe as [OperatorFunction<any, any>])) : selection;
};

export function logValues(
  selection: Observable<any>,
  key: string,
  options: DecoratorOptionInterface
) {
  if (options.log) {
    const subscription = selection.subscribe(value => {
      console.log(`${key.toUpperCase()}:`);
      console.dir(value);
    });

    if (this[options.subscriptionsCollector]) {
      this[options.subscriptionsCollector].add(subscription);
    }
  }
};
