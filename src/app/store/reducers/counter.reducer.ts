import * as fromActions from '../actions/counter.actions';

export interface State {
  count: number;
  secondCounter: number;
}

const initialState: State = {
  count: 0,
  secondCounter: 100
};

export function counterReducer(state: State = initialState, action: fromActions.Actions): State {
  switch (action.type) {
    case fromActions.INCREMENT:
      return { ...state, count: state.count + 1 };

    case fromActions.DECREMENT:
      return { ...state, count: state.count - 1 };

    case fromActions.RESET:
      return { ...state, count: 0 };

    case fromActions.SET:
      return { ...state, count: action.payload };

    case fromActions.DECREMENT_SECOND_COUNTER:
      return { ...state, secondCounter: state.secondCounter - 1 };

    default:
      return { ...state };
  }
}
