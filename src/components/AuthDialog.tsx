// src/components/AuthDialog.tsx
import { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, BarChart2, Loader2 } from 'lucide-react';
import OtpDialog from './OtpDialog';
import { useAuth } from '../hooks/useAuth.js';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { googleAuth } from '@/lib/api.js';
import type { ViewType } from '@/pages/Index';

interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
  setCurrentView: React.Dispatch<React.SetStateAction<ViewType>>; // ADD THIS
}


export default function AuthDialog({ open, onClose, setCurrentView }: AuthDialogProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const {
    // login flow
    handleLogin,
    isLoginLoading,
    loginError,
    clearLoginError,
    isLoggedIn,

    // register flow
    handleRegister,
    isRegisterLoading,
    registerError,
    clearRegisterError,
    otpSent,

    // reset on close
    resetAuth,
  } = useAuth();

  // ── Auto-close when login succeeds ───────────────────────
  useEffect(() => {
    if (isLoggedIn && open) {
      handleClose();
    }
  }, [isLoggedIn]);

  // ── When register succeeds, otpSent becomes true ─────────
  // OtpDialog renders automatically because otpSent is passed as `open`

  // ── Reset everything when modal closes ───────────────────
  const handleClose = () => {
    setEmail('');
    setPassword('');
    setName('');
    setShowPassword(false);
    setMode('login');
    resetAuth();
    onClose();
  };

  // ── Switch mode and clear errors ─────────────────────────
  const handleModeSwitch = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setEmail('');
    setPassword('');
    setName('');
    clearLoginError();
    clearRegisterError();
  };

  // ── OTP dialog closed by user (without verifying) ────────
  const handleOtpClose = () => {
    // Don't close AuthDialog — let them retry or change email
    resetAuth();
  };

  // ── OTP verified successfully ─────────────────────────────
  // OtpDialog handles the success animation then calls this
  const handleOtpVerified = () => {
    handleClose();
  };

  // ── Form submit ───────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'signup') {
      // Calls POST /auth/register → sends OTP
      // On success, Redux sets otpSent=true → OtpDialog opens automatically
      await handleRegister(name, email, password);
    } else {
      // Calls POST /auth/login → returns JWT
      // On success, Redux sets isLoggedIn=true → useEffect closes modal
      await handleLogin(email, password);
    }
  };

  if (!open) return null;

  // While OTP dialog is open, hide the auth dialog behind it
  if (otpSent) {
    return (
      <OtpDialog
        open={otpSent}
        email={email}
        onClose={handleOtpClose}
        onVerified={handleOtpVerified}
      />
    );
  }

  const isLoading = mode === 'login' ? isLoginLoading : isRegisterLoading;
  const error = mode === 'login' ? loginError : registerError;

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/20 z-50 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <BarChart2 size={16} className="text-white" />
                </div>
                <span className="font-bold text-slate-900 text-lg">ROOKNOMICS</span>
              </div>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="text-slate-600 hover:text-slate-800 transition-colors p-1 disabled:opacity-40"
              >
                <X size={20} />
              </button>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-1">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-slate-600 text-sm mb-6">
              {mode === 'login'
                ? 'Sign in to save your strategies and results.'
                : 'Start backtesting in seconds.'}
            </p>

            {/* Social buttons — UI only for now */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  try {
                    const decoded: any = jwtDecode(credentialResponse.credential!);

                    const res = await googleAuth({
                      googleId: decoded.sub,
                      email: decoded.email,
                      name: decoded.name,
                      avatar: decoded.picture,
                    });

                    if (res.token) {
                      localStorage.setItem("token", res.token);

                      setCurrentView('builder'); 
                      onClose();
                    }
                  } catch (err) {
                    console.error("Google login failed", err);
                    alert("Google login failed");
                  }
                }}
              />

            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-slate-500 text-xs">or continue with email</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Error banner */}
            {error && (
              <div className="mb-4 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2">
                <span className="text-rose-500 text-xs mt-0.5 flex-shrink-0">⚠</span>
                <p className="text-rose-600 text-xs leading-relaxed">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Full name"
                    value={name}
                    onChange={e => { setName(e.target.value); clearRegisterError(); }}
                    disabled={isLoading}
                    required
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-500 outline-none focus:border-indigo-500/50 transition-colors disabled:opacity-60"
                  />
                </div>
              )}

              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    mode === 'login' ? clearLoginError() : clearRegisterError();
                  }}
                  disabled={isLoading}
                  required
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-500 outline-none focus:border-indigo-500/50 transition-colors disabled:opacity-60"
                />
              </div>

              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    mode === 'login' ? clearLoginError() : clearRegisterError();
                  }}
                  disabled={isLoading}
                  required
                  minLength={6}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-800 placeholder-slate-500 outline-none focus:border-indigo-500/50 transition-colors disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {mode === 'login' && (
                <div className="text-right">
                  <button
                    type="button"
                    className="text-indigo-600 text-xs hover:text-indigo-700 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit — spins while loading */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {mode === 'login' ? 'Signing in…' : 'Sending OTP…'}
                  </>
                ) : (
                  mode === 'login' ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            <p className="text-slate-500 text-xs text-center mt-6">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => handleModeSwitch(mode === 'login' ? 'signup' : 'login')}
                disabled={isLoading}
                className="text-indigo-600 hover:text-indigo-700 transition-colors font-medium disabled:opacity-50"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>

          </div>
        </div>
      </div>
    </>
  );
}
