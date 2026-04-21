// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import backtestReducer from './backtestSlice';
import authReducer     from './authSlice';

export const store = configureStore({
  reducer: {
    backtest: backtestReducer,
    auth:     authReducer,
  },
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
