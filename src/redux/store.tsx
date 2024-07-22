// store.ts
import {createStore} from 'redux';

interface State {
  authUrl: string | null;
}

const initialState: State = {
  authUrl: null,
};

type Action = {type: 'SET_AUTH_URL'; payload: string};

const reducer = (state = initialState, action: Action): State => {
  switch (action.type) {
    case 'SET_AUTH_URL':
      return {...state, authUrl: action.payload};
    default:
      return state;
  }
};

const store = createStore(reducer);

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
