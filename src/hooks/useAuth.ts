// src/hooks/useAuth.ts
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import {
  loginUser,
  registerUser,
  verifyOtpUser,
  resendOtpUser,
  logoutUser,
  resetAuthState,
  clearLoginError,
  clearRegisterError,
  clearOtpError,
} from '../store/authSlice';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const auth     = useSelector((state: RootState) => state.auth);

  return {
    // ── State ──────────────────────────────────────────────
    user:       auth.user,
    isLoggedIn: !!auth.user ,

    // Loading states — one per action so each button spins independently
    isLoginLoading:    auth.isLoginLoading,
    isRegisterLoading: auth.isRegisterLoading,
    isOtpLoading:      auth.isOtpLoading,
    isResendLoading:   auth.isResendLoading,

    // Error states — one per action
    loginError:    auth.loginError,
    registerError: auth.registerError,
    otpError:      auth.otpError,
    resendError:   auth.resendError,

    // Flow flags
    otpSent:    auth.otpSent,    // true after register → AuthDialog opens OtpDialog
    isVerified: auth.isVerified, // true after verifyOtp → OtpDialog shows success

    // ── Handlers — components call these, no dispatch needed ──
    handleRegister: (name: string, email: string, password: string) =>
      dispatch(registerUser({ name, email, password })),

    handleLogin: (email: string, password: string) =>
      dispatch(loginUser({ email, password })),

    handleVerifyOtp: (email: string, otp: string) =>
      dispatch(verifyOtpUser({ email, otp })),

    handleResendOtp: (email: string) =>
      dispatch(resendOtpUser({ email })),

    handleLogout: () => dispatch(logoutUser()),

    // ── Error clearers ─────────────────────────────────────
    clearLoginError:    () => dispatch(clearLoginError()),
    clearRegisterError: () => dispatch(clearRegisterError()),
    clearOtpError:      () => dispatch(clearOtpError()),

    // Resets all auth state — call when modal closes
    resetAuth: () => dispatch(resetAuthState()),
  };
}
