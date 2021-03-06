import { combineReducers } from '@reduxjs/toolkit';
import { currentContentReducer } from './CurrentContent';
import { userReducer } from './User';
import { charactersReducer } from './Characters';
import { filmsReducer } from './Films';
import { planetsReducer } from './Planets';

/** Root reducer, that combine all other reducers */
export const rootReducer = combineReducers({
  user: userReducer,
  films: filmsReducer,
  planets: planetsReducer,
  characters: charactersReducer,
  currentContent: currentContentReducer,
});

/** Type of store state */
export type RootState = ReturnType<typeof rootReducer>;
