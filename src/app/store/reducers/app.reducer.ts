import * as fromCounter from './counter.reducer';
import { ActionReducerMap } from '@ngrx/store';

export interface State {
  counter: fromCounter.State;
}

export const reducers: ActionReducerMap<State> = {
  counter: fromCounter.counterReducer
};
