// src/store/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi, AuthUser } from '../lib/api';

// ── Async thunks ──────────────────────────────────────────

// STEP 1: Submit register form → sends OTP, does NOT log user in yet
// Returns the email so OtpDialog knows which address to show
export const registerUser = createAsyncThunk(
  'auth/register',
  async (
    payload: { name: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const data = await authApi.register(payload);
      return data; // { message, email }
    } catch (err: any) {
      return rejectWithValue(err.message || 'Registration failed');
    }
  }
);

// STEP 2: Submit OTP → verifies, creates account, logs user in
export const verifyOtpUser = createAsyncThunk(
  'auth/verifyOtp',
  async (
    payload: { email: string; otp: string },
    { rejectWithValue }
  ) => {
    try {
      const data = await authApi.verifyOtp(payload);
      // Persist token + user so page refresh keeps them logged in
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data; // { token, user, message }
    } catch (err: any) {
      return rejectWithValue(err.message || 'OTP verification failed');
    }
  }
);

// RESEND: Generate a fresh OTP — only updates backend, no state change
export const resendOtpUser = createAsyncThunk(
  'auth/resendOtp',
  async (payload: { email: string }, { rejectWithValue }) => {
    try {
      const data = await authApi.resendOtp(payload);
      return data; // { message }
    } catch (err: any) {
      return rejectWithValue(err.message || 'Resend failed');
    }
  }
);

// LOGIN: Normal email + password login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (
    payload: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const data = await authApi.login(payload);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data; // { token, user }
    } catch (err: any) {
      return rejectWithValue(err.message || 'Login failed');
    }
  }
);

// ── State ─────────────────────────────────────────────────
interface AuthState {
  user: AuthUser | null;
  token: string | null;

  // Separate loading flags so dialogs know which button to spin
  isLoginLoading: boolean;
  isRegisterLoading: boolean;
  isOtpLoading: boolean;
  isResendLoading: boolean;

  // Separate error fields so each dialog shows the right error
  loginError: string | null;
  registerError: string | null;
  otpError: string | null;
  resendError: string | null;

  // Set to true after register succeeds — triggers OtpDialog to open
  otpSent: boolean;

  // Set to true after verifyOtp succeeds — triggers dialogs to close
  isVerified: boolean;
}

// Rehydrate from localStorage on page refresh
const savedToken = localStorage.getItem('token');
const savedUser  = localStorage.getItem('user');

const initialState: AuthState = {
  user:    savedUser  ? JSON.parse(savedUser)  : null,
  token:   savedToken ?? null,

  isLoginLoading:    false,
  isRegisterLoading: false,
  isOtpLoading:      false,
  isResendLoading:   false,

  loginError:    null,
  registerError: null,
  otpError:      null,
  resendError:   null,

  otpSent:    false,
  isVerified: false,
};

// ── Slice ─────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user  = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    // Call when user closes AuthDialog to reset everything
    resetAuthState: (state) => {
      state.loginError    = null;
      state.registerError = null;
      state.otpError      = null;
      state.resendError   = null;
      state.otpSent       = false;
      state.isVerified    = false;
    },
    // Clear individual errors when user starts typing again
    clearLoginError:    (state) => { state.loginError    = null; },
    clearRegisterError: (state) => { state.registerError = null; },
    clearOtpError:      (state) => { state.otpError      = null; },
  },
  extraReducers: (builder) => {

    // ── Register (Step 1) ─────────────────────────────────
    builder
      .addCase(registerUser.pending, (state) => {
        state.isRegisterLoading = true;
        state.registerError     = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isRegisterLoading = false;
        state.otpSent           = true;  // AuthDialog watches this to open OtpDialog
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isRegisterLoading = false;
        state.registerError     = action.payload as string;
      });

    // ── Verify OTP (Step 2) ───────────────────────────────
    builder
      .addCase(verifyOtpUser.pending, (state) => {
        state.isOtpLoading = true;
        state.otpError     = null;
      })
      .addCase(verifyOtpUser.fulfilled, (state, action) => {
        state.isOtpLoading = false;
        state.isVerified   = true;   // OtpDialog watches this to show success state
        state.user         = action.payload.user;
        state.token        = action.payload.token;
        state.otpSent      = false;
      })
      .addCase(verifyOtpUser.rejected, (state, action) => {
        state.isOtpLoading = false;
        state.otpError     = action.payload as string;
      });

    // ── Resend OTP ────────────────────────────────────────
    builder
      .addCase(resendOtpUser.pending, (state) => {
        state.isResendLoading = true;
        state.resendError     = null;
        state.otpError        = null;
      })
      .addCase(resendOtpUser.fulfilled, (state) => {
        state.isResendLoading = false;
      })
      .addCase(resendOtpUser.rejected, (state, action) => {
        state.isResendLoading = false;
        state.resendError     = action.payload as string;
      });

    // ── Login ─────────────────────────────────────────────
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoginLoading = true;
        state.loginError     = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoginLoading = false;
        state.user           = action.payload.user;
        state.token          = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoginLoading = false;
        state.loginError     = action.payload as string;
      });
  },
});

export const {
  logout,
  resetAuthState,
  clearLoginError,
  clearRegisterError,
  clearOtpError,
} = authSlice.actions;

export default authSlice.reducer;
