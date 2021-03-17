/* No-param-reassign was disabled, because redux-toolkit use immer and don't mutate state */
/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { Maybe } from 'yup/lib/types';
import { UserInfo } from '../../models/UserInfo';
import { signInByEmailAndPassword, registerByEmailAndPassword } from './userThunks/apiThunks';
import { addUserInStore, removeUserFromStore } from './userThunks/storeThunks';

export type user = {
  /** Information about user */
  readonly info: Maybe<UserInfo>;
  /** Errors from server during authorization */
  readonly errorMsg: Maybe<string>;
  /** User login state */
  readonly logged: boolean;
  /** Is user pending */
  readonly isPending: boolean;
};

const initialState: user = {
  info: null,
  errorMsg: null,
  logged: false,
  isPending: true,
};

/**
 * Contain all data about user
 * And methods to work with that data
 */
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    removeErrorMsg(state) {
      state.errorMsg = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addUserInStore.fulfilled, (state, action) => {
        state.isPending = false;
        state.logged = true;
        state.info = action.payload;
      })
      .addCase(removeUserFromStore.fulfilled, (state) => {
        state.isPending = false;
        state.logged = false;
        state.info = null;
      })
      .addCase(signInByEmailAndPassword.rejected, (state, action) => {
        state.errorMsg = action.error.message;
      })
      .addCase(registerByEmailAndPassword.rejected, (state, action) => {
        state.errorMsg = action.error.message;
      });
  },
});

export const { removeErrorMsg } = userSlice.actions;

export const userReducer = userSlice.reducer;
