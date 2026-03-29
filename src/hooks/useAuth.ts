// src/hooks/useAuth.ts
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import {
  loginUser,
  registerUser,
  verifyOtpUser,
  resendOtpUser,
  googleAuthUser,
  fetchCurrentUser,
  logout,
  resetAuthState,
  clearLoginError,
  clearRegisterError,
  clearOtpError,
  clearGoogleError,
} from '../store/authSlice';
import type { GoogleAuthPayload } from '../lib/api';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const auth     = useSelector((state: RootState) => state.auth);

  return {
    // ── State ──────────────────────────────────────────────
    user:       auth.user,
    token:      auth.token,
    isLoggedIn: !!auth.user && !!auth.token,

    // Loading states
    isLoginLoading:    auth.isLoginLoading,
    isRegisterLoading: auth.isRegisterLoading,
    isOtpLoading:      auth.isOtpLoading,
    isResendLoading:   auth.isResendLoading,
    isGoogleLoading:   auth.isGoogleLoading,
    isMeLoading:       auth.isMeLoading,

    // Error states
    loginError:    auth.loginError,
    registerError: auth.registerError,
    otpError:      auth.otpError,
    resendError:   auth.resendError,
    googleError:   auth.googleError,

    // Flow flags
    otpSent:    auth.otpSent,
    isVerified: auth.isVerified,

    // ── Handlers ──────────────────────────────────────────
    handleRegister: (name: string, email: string, password: string) =>
      dispatch(registerUser({ name, email, password })),

    handleLogin: (email: string, password: string) =>
      dispatch(loginUser({ email, password })),

    handleVerifyOtp: (email: string, otp: string) =>
      dispatch(verifyOtpUser({ email, otp })),

    handleResendOtp: (email: string) =>
      dispatch(resendOtpUser({ email })),

    /** POST /api/auth/google — send decoded Google user payload */
    handleGoogleAuth: (payload: GoogleAuthPayload) =>
      dispatch(googleAuthUser(payload)),

    /** GET /api/auth/me — validate JWT + refresh user data from server */
    fetchCurrentUser: () =>
      dispatch(fetchCurrentUser()),

    handleLogout: () => dispatch(logout()),

    // ── Error clearers ─────────────────────────────────────
    clearLoginError:    () => dispatch(clearLoginError()),
    clearRegisterError: () => dispatch(clearRegisterError()),
    clearOtpError:      () => dispatch(clearOtpError()),
    clearGoogleError:   () => dispatch(clearGoogleError()),

    resetAuth: () => dispatch(resetAuthState()),
  };
}
