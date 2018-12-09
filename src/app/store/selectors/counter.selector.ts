import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromCounter from '../reducers/counter.reducer';

export const counterFeatureSelector = createFeatureSelector<fromCounter.State>('counter');

export const getCount = createSelector(counterFeatureSelector, (state: fromCounter.State) => state.count);
