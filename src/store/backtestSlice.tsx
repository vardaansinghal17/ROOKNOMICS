// src/store/backtestSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// Async thunk — calls your backend and stores the result
export const runBacktest = createAsyncThunk(
  'backtest/run',
  async (payload: {
    symbol:      string
    startDate:   string
    endDate:     string
    capital:     number
    activeRules: string[]
    rulesConfig: object
  }) => {
    const response = await fetch('http://localhost:3000/backtest', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error)
    }

    return response.json()
  }
)

interface BacktestState {
  data:    unknown | null
  loading: boolean
  error:   string | null
}

const initialState: BacktestState = {
  data:    null,
  loading: false,
  error:   null
}

const backtestSlice = createSlice({
  name: 'backtest',
  initialState,
  reducers: {
    // Call this to clear results when user resets the form
    clearBacktest: (state) => {
      state.data    = null
      state.error   = null
      state.loading = false
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(runBacktest.pending, (state) => {
        state.loading = true
        state.error   = null
      })
      .addCase(runBacktest.fulfilled, (state, action) => {
        state.loading = false
        state.data    = action.payload
      })
      .addCase(runBacktest.rejected, (state, action) => {
        state.loading = false
        state.error   = action.error.message ?? 'Something went wrong'
      })
  }
})

export const { clearBacktest } = backtestSlice.actions
export default backtestSlice.reducer