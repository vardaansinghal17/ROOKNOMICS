import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL } from '@/lib/api';

export interface BacktestPayload {
  symbol: string;
  startDate: string;
  endDate: string;
  capital: number;
  activeRules: string[];
  rulesConfig: object;
}

function tryParseJson(raw: string) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function requestBacktest(url: string, payload: BacktestPayload) {
  const token = localStorage.getItem('token');
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const raw = await res.text();
  const data = tryParseJson(raw);

  return { res, raw, data };
}

function buildBacktestUrls() {
  const apiUrl = BASE_URL.replace(/\/$/, '');
  const urls = [`${apiUrl}/backtest`];

  if (/\/api$/i.test(apiUrl)) {
    urls.push(`${apiUrl.replace(/\/api$/i, '')}/backtest`);
  }

  return [...new Set(urls)];
}

export const runBacktest = createAsyncThunk(
  'backtest/run',
  async (payload: BacktestPayload, { rejectWithValue }) => {
    try {
      let lastMessage = 'Backtest failed';

      for (const url of buildBacktestUrls()) {
        const { res, raw, data } = await requestBacktest(url, payload);

        if (res.ok) {
          return data ?? raw;
        }

        lastMessage =
          (typeof data?.message === 'string' && data.message) ||
          (typeof data?.error === 'string' && data.error) ||
          (!raw.trim().startsWith('<') && raw.trim()) ||
          `Backtest request failed (${res.status})`;

        if (res.status !== 404) {
          throw new Error(lastMessage);
        }
      }

      return rejectWithValue(lastMessage);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Backtest failed');
    }
  }
);

interface BacktestState {
  data: unknown | null;
  loading: boolean;
  error: string | null;
}

const initialState: BacktestState = {
  data: null,
  loading: false,
  error: null,
};

const backtestSlice = createSlice({
  name: 'backtest',
  initialState,
  reducers: {
    clearBacktest: (state) => {
      state.data = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(runBacktest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(runBacktest.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(runBacktest.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? action.error.message ?? 'Something went wrong';
      });
  },
});

export const { clearBacktest } = backtestSlice.actions;
export default backtestSlice.reducer;
