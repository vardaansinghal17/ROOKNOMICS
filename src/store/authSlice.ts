// src/store/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi, AuthUser, GoogleAuthPayload } from '../lib/api';

// ── Async thunks ──────────────────────────────────────────

// STEP 1: Submit register form → sends OTP, does NOT log user in yet
export const registerUser = createAsyncThunk(
  'auth/register',
  async (
    payload: { name: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      return await authApi.register(payload); // { message, email }
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
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data; // { token, user, message }
    } catch (err: any) {
      return rejectWithValue(err.message || 'OTP verification failed');
    }
  }
);

// RESEND: Generate a fresh OTP
export const resendOtpUser = createAsyncThunk(
  'auth/resendOtp',
  async (payload: { email: string }, { rejectWithValue }) => {
    try {
      return await authApi.resendOtp(payload); // { message }
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

// GOOGLE AUTH: Google OAuth flow — send decoded payload, get JWT back
export const googleAuthUser = createAsyncThunk(
  'auth/google',
  async (payload: GoogleAuthPayload, { rejectWithValue }) => {
    try {
      const data = await authApi.googleAuth(payload);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data; // { token, user }
    } catch (err: any) {
      return rejectWithValue(err.message || 'Google sign-in failed');
    }
  }
);

// FETCH ME: Validate stored JWT and refresh user data from server
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const data = await authApi.getMe();
      // Sync fresh user data back to localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      return data.user;
    } catch (err: any) {
      // Token expired or invalid — clear storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return rejectWithValue(err.message || 'Session expired');
    }
  }
);

// ── State ─────────────────────────────────────────────────
interface AuthState {
  user: AuthUser | null;
  token: string | null;

  isLoginLoading:    boolean;
  isRegisterLoading: boolean;
  isOtpLoading:      boolean;
  isResendLoading:   boolean;
  isGoogleLoading:   boolean;
  isMeLoading:       boolean;

  loginError:    string | null;
  registerError: string | null;
  otpError:      string | null;
  resendError:   string | null;
  googleError:   string | null;

  otpSent:    boolean;
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
  isGoogleLoading:   false,
  isMeLoading:       false,

  loginError:    null,
  registerError: null,
  otpError:      null,
  resendError:   null,
  googleError:   null,

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
    resetAuthState: (state) => {
      state.loginError    = null;
      state.registerError = null;
      state.otpError      = null;
      state.resendError   = null;
      state.googleError   = null;
      state.otpSent       = false;
      state.isVerified    = false;
    },
    clearLoginError:    (state) => { state.loginError    = null; },
    clearRegisterError: (state) => { state.registerError = null; },
    clearOtpError:      (state) => { state.otpError      = null; },
    clearGoogleError:   (state) => { state.googleError   = null; },
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
        state.otpSent           = true;
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
        state.isVerified   = true;
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

    // ── Google Auth ───────────────────────────────────────
    builder
      .addCase(googleAuthUser.pending, (state) => {
        state.isGoogleLoading = true;
        state.googleError     = null;
      })
      .addCase(googleAuthUser.fulfilled, (state, action) => {
        state.isGoogleLoading = false;
        state.user            = action.payload.user;
        state.token           = action.payload.token;
      })
      .addCase(googleAuthUser.rejected, (state, action) => {
        state.isGoogleLoading = false;
        state.googleError     = action.payload as string;
      });

    // ── Fetch Current User (GET /auth/me) ─────────────────
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isMeLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isMeLoading = false;
        state.user        = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        // Token invalid — clear session entirely
        state.isMeLoading = false;
        state.user        = null;
        state.token       = null;
      });
  },
});

export const {
  logout,
  resetAuthState,
  clearLoginError,
  clearRegisterError,
  clearOtpError,
  clearGoogleError,
} = authSlice.actions;

export default authSlice.reducer;
