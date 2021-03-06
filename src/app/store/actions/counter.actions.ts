import { Action } from '@ngrx/store';

export const DECREMENT = '[COUNTER] DECREMENT';
export const INCREMENT = '[COUNTER] INCREMENT';
export const RESET = '[COUNTER] RESET';
export const SET = '[COUNTER] SET';

export class CounterIncrement implements Action {
  public readonly type = INCREMENT;
}

export class CounterDecrement implements Action {
  public readonly type = DECREMENT;
}

export class CounterReset implements Action {
  public readonly type = RESET;
}

export class CounterSet implements Action {
  public readonly type = SET;
  public constructor(public payload: number) {}
}

export type Actions = CounterIncrement | CounterDecrement | CounterReset | CounterSet;
