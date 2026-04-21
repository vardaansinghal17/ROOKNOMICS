import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import {
  loginUser,
  registerUser,
  verifyOtpUser,
  resendOtpUser,
  googleAuthUser,
  fetchCurrentUser,
  logoutUser,
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
  const auth = useSelector((state: RootState) => state.auth);

  return {
    user: auth.user,
    token: auth.token,
    isLoggedIn: !!auth.user,

    isLoginLoading: auth.isLoginLoading,
    isRegisterLoading: auth.isRegisterLoading,
    isOtpLoading: auth.isOtpLoading,
    isResendLoading: auth.isResendLoading,
    isGoogleLoading: auth.isGoogleLoading,
    isMeLoading: auth.isMeLoading,

    loginError: auth.loginError,
    registerError: auth.registerError,
    otpError: auth.otpError,
    resendError: auth.resendError,
    googleError: auth.googleError,

    otpSent: auth.otpSent,
    isVerified: auth.isVerified,

    handleRegister: (name: string, email: string, password: string) =>
      dispatch(registerUser({ name, email, password })),

    handleLogin: (email: string, password: string) =>
      dispatch(loginUser({ email, password })),

    handleVerifyOtp: (email: string, otp: string) =>
      dispatch(verifyOtpUser({ email, otp })),

    handleResendOtp: (email: string) =>
      dispatch(resendOtpUser({ email })),

    handleGoogleAuth: (payload: GoogleAuthPayload) =>
      dispatch(googleAuthUser(payload)),

    fetchCurrentUser: () =>
      dispatch(fetchCurrentUser()),

    handleLogout: async () => {
      await dispatch(logoutUser());
      dispatch(logout());
    },

    clearLoginError: () => dispatch(clearLoginError()),
    clearRegisterError: () => dispatch(clearRegisterError()),
    clearOtpError: () => dispatch(clearOtpError()),
    clearGoogleError: () => dispatch(clearGoogleError()),

    resetAuth: () => dispatch(resetAuthState()),
  };
}
