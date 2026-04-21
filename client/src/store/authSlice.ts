import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../lib/api';
import type { AuthUser, GoogleAuthPayload } from '../lib/api';

export const registerUser = createAsyncThunk(
  'auth/register',
  async (
    payload: { name: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      return await authApi.register(payload);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Registration failed');
    }
  }
);

export const verifyOtpUser = createAsyncThunk(
  'auth/verifyOtp',
  async (
    payload: { email: string; otp: string },
    { rejectWithValue }
  ) => {
    try {
      const data = await authApi.verifyOtp(payload);
      if (data.token) localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'OTP verification failed');
    }
  }
);

export const resendOtpUser = createAsyncThunk(
  'auth/resendOtp',
  async (payload: { email: string }, { rejectWithValue }) => {
    try {
      return await authApi.resendOtp(payload);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Resend failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (
    payload: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const data = await authApi.login(payload);
      if (data.token) localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Login failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (err: any) {
      return rejectWithValue(err.message || 'Logout failed');
    }
  }
);

export const googleAuthUser = createAsyncThunk(
  'auth/google',
  async (payload: GoogleAuthPayload, { rejectWithValue }) => {
    try {
      const data = await authApi.googleAuth(payload);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Google sign-in failed');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const data = await authApi.getMe();
      localStorage.setItem('user', JSON.stringify(data.user));
      return data.user;
    } catch (err: any) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return rejectWithValue(err.message || 'Session expired');
    }
  }
);

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoginLoading: boolean;
  isRegisterLoading: boolean;
  isOtpLoading: boolean;
  isResendLoading: boolean;
  isGoogleLoading: boolean;
  isMeLoading: boolean;
  loginError: string | null;
  registerError: string | null;
  otpError: string | null;
  resendError: string | null;
  googleError: string | null;
  otpSent: boolean;
  isVerified: boolean;
}

const savedUser = localStorage.getItem('user');
const savedToken = localStorage.getItem('token');

const initialState: AuthState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  token: savedToken,
  isLoginLoading: false,
  isRegisterLoading: false,
  isOtpLoading: false,
  isResendLoading: false,
  isGoogleLoading: false,
  isMeLoading: false,
  loginError: null,
  registerError: null,
  otpError: null,
  resendError: null,
  googleError: null,
  otpSent: false,
  isVerified: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    resetAuthState: (state) => {
      state.loginError = null;
      state.registerError = null;
      state.otpError = null;
      state.resendError = null;
      state.googleError = null;
      state.otpSent = false;
      state.isVerified = false;
    },
    clearLoginError: (state) => {
      state.loginError = null;
    },
    clearRegisterError: (state) => {
      state.registerError = null;
    },
    clearOtpError: (state) => {
      state.otpError = null;
    },
    clearGoogleError: (state) => {
      state.googleError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isRegisterLoading = true;
        state.registerError = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isRegisterLoading = false;
        state.otpSent = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isRegisterLoading = false;
        state.registerError = action.payload as string;
      });

    builder
      .addCase(verifyOtpUser.pending, (state) => {
        state.isOtpLoading = true;
        state.otpError = null;
      })
      .addCase(verifyOtpUser.fulfilled, (state, action) => {
        state.isOtpLoading = false;
        state.isVerified = true;
        state.user = action.payload.user;
        state.token = action.payload.token ?? state.token;
        state.otpSent = false;
      })
      .addCase(verifyOtpUser.rejected, (state, action) => {
        state.isOtpLoading = false;
        state.otpError = action.payload as string;
      });

    builder
      .addCase(resendOtpUser.pending, (state) => {
        state.isResendLoading = true;
        state.resendError = null;
        state.otpError = null;
      })
      .addCase(resendOtpUser.fulfilled, (state) => {
        state.isResendLoading = false;
      })
      .addCase(resendOtpUser.rejected, (state, action) => {
        state.isResendLoading = false;
        state.resendError = action.payload as string;
      });

    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoginLoading = true;
        state.loginError = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoginLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token ?? state.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoginLoading = false;
        state.loginError = action.payload as string;
      });

    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
        state.token = null;
      });

    builder
      .addCase(googleAuthUser.pending, (state) => {
        state.isGoogleLoading = true;
        state.googleError = null;
      })
      .addCase(googleAuthUser.fulfilled, (state, action) => {
        state.isGoogleLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(googleAuthUser.rejected, (state, action) => {
        state.isGoogleLoading = false;
        state.googleError = action.payload as string;
      });

    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isMeLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isMeLoading = false;
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isMeLoading = false;
        state.user = null;
        state.token = null;
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
