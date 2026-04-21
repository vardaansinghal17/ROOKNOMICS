import { useEffect, useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, BarChart2, Loader2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import OtpDialog from './OtpDialog';
import { useAuth } from '../hooks/useAuth.js';
import type { GoogleAuthPayload } from '../lib/api';

interface GoogleBtnProps {
  disabled: boolean;
  isLoading: boolean;
  onAuth: (payload: GoogleAuthPayload) => void;
}

function GoogleLoginButton({ disabled, isLoading, onAuth }: GoogleBtnProps) {
  const triggerGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const g = await res.json();
        onAuth({ googleId: g.sub, email: g.email, name: g.name, avatar: g.picture });
      } catch {
        // surfaced via Redux state
      }
    },
  });

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => triggerGoogle()}
      className="relative flex w-full items-center justify-center gap-2 rounded-xl border border-[#1A1A1A] bg-[#111111] py-2.5 text-sm font-medium text-[#BDBDBD] transition-all hover:scale-[1.02] hover:border-[#2A2A2A] hover:text-[#EAEAEA] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isLoading ? (
        <Loader2 size={15} className="animate-spin text-[#7A7A7A]" />
      ) : (
        <>
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google
        </>
      )}
    </button>
  );
}

interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
  context?: 'gate';
}

const GOOGLE_ENABLED = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function AuthDialog({ open, onClose, context }: AuthDialogProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const {
    handleLogin, isLoginLoading, loginError, clearLoginError,
    handleRegister, isRegisterLoading, registerError, clearRegisterError,
    handleGoogleAuth, isGoogleLoading, googleError, clearGoogleError,
    isLoggedIn,
    otpSent,
    resetAuth,
  } = useAuth();

  useEffect(() => {
    if (isLoggedIn && open) handleClose();
  }, [isLoggedIn, open]);

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setName('');
    setShowPassword(false);
    setMode('login');
    resetAuth();
    onClose();
  };

  const handleModeSwitch = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setEmail('');
    setPassword('');
    setName('');
    clearLoginError();
    clearRegisterError();
    clearGoogleError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signup') {
      await handleRegister(name, email, password);
      return;
    }
    await handleLogin(email, password);
  };

  if (otpSent) {
    return (
      <OtpDialog
        open={otpSent}
        email={email}
        onClose={resetAuth}
        onVerified={handleClose}
      />
    );
  }

  const isEmailLoading = mode === 'login' ? isLoginLoading : isRegisterLoading;
  const isAnyLoading = isEmailLoading || isGoogleLoading;
  const displayError = (mode === 'login' ? loginError : registerError) || googleError;

  const headline = context === 'gate'
    ? 'Sign in to continue'
    : mode === 'login' ? 'Welcome back' : 'Create your account';

  const subline = context === 'gate'
    ? 'Builder access is restricted to authenticated users.'
    : mode === 'login'
      ? 'Sign in to save your strategies and results.'
      : 'Start backtesting in seconds.';

  const inputCls =
    'w-full rounded-xl border border-[#1A1A1A] bg-[#111111] py-3 text-sm text-[#EAEAEA] outline-none transition-all placeholder:text-[#5F5F5F] focus:border-emerald-400/40 focus:shadow-[0_0_0_1px_rgba(52,211,153,0.08)] disabled:opacity-60';

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
            onClick={handleClose}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md overflow-hidden rounded-2xl border border-[#1A1A1A] bg-[#090909] shadow-[0_32px_96px_rgba(0,0,0,0.7)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative p-6">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.15),transparent_65%)]" />

                <div className="relative mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-400/10">
                      <BarChart2 size={16} className="text-emerald-300" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-[#7A7A7A]">Secure Access</p>
                      <span className="text-lg font-bold text-[#EAEAEA]">ROOKNOMICS</span>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    disabled={isAnyLoading}
                    className="rounded-lg border border-[#1A1A1A] bg-[#111111] p-2 text-[#7A7A7A] transition-colors hover:border-[#2A2A2A] hover:text-[#EAEAEA] disabled:opacity-40"
                  >
                    <X size={18} />
                  </button>
                </div>

                <h2 className="mb-1 text-2xl font-bold text-[#EAEAEA]">{headline}</h2>
                <p className="mb-6 text-sm text-[#7A7A7A]">{subline}</p>

                <div className="mb-6">
                  {GOOGLE_ENABLED ? (
                    <GoogleLoginButton
                      disabled={isAnyLoading}
                      isLoading={isGoogleLoading}
                      onAuth={handleGoogleAuth}
                    />
                  ) : (
                    <button
                      type="button"
                      disabled
                      title="Google sign-in not configured"
                      className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-[#1A1A1A] bg-[#111111] py-2.5 text-sm font-medium text-[#3A3A3A]"
                    >
                      <svg className="h-4 w-4 opacity-30" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Google
                    </button>
                  )}
                </div>

                <div className="mb-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#1A1A1A]" />
                  <span className="text-xs uppercase tracking-[0.2em] text-[#5F5F5F]">Email Access</span>
                  <div className="h-px flex-1 bg-[#1A1A1A]" />
                </div>

                <AnimatePresence>
                  {displayError && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18 }}
                      className="mb-4 flex items-start gap-2 rounded-xl border border-rose-400/20 bg-rose-400/5 px-4 py-3"
                    >
                      <AlertTriangle size={14} className="mt-0.5 flex-shrink-0 text-rose-300" />
                      <p className="text-xs leading-relaxed text-rose-200">{displayError}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'signup' && (
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5F5F5F]" />
                      <input
                        type="text"
                        placeholder="Full name"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          clearRegisterError();
                        }}
                        disabled={isAnyLoading}
                        required
                        className={`${inputCls} pl-10 pr-4`}
                      />
                    </div>
                  )}

                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5F5F5F]" />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        mode === 'login' ? clearLoginError() : clearRegisterError();
                        clearGoogleError();
                      }}
                      disabled={isAnyLoading}
                      required
                      className={`${inputCls} pl-10 pr-4`}
                    />
                  </div>

                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5F5F5F]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        mode === 'login' ? clearLoginError() : clearRegisterError();
                      }}
                      disabled={isAnyLoading}
                      required
                      minLength={6}
                      className={`${inputCls} pl-10 pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5F5F5F] transition-colors hover:text-[#EAEAEA]"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* {mode === 'login' && (
                    <div className="text-right">
                      <button type="button" className="text-xs text-emerald-300 transition-colors hover:text-emerald-200">
                        Forgot password?
                      </button>
                    </div>
                  )} */}

                  <button
                    type="submit"
                    disabled={isAnyLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 py-3 text-sm font-semibold text-emerald-300 transition-all duration-200 hover:scale-[1.01] hover:border-emerald-400/35 hover:bg-emerald-400/15 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isEmailLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        {mode === 'login' ? 'Signing in...' : 'Sending OTP...'}
                      </>
                    ) : mode === 'login' ? (
                      'Sign In'
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </form>

                <p className="mt-6 text-center text-xs text-[#6E6E6E]">
                  {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    onClick={() => handleModeSwitch(mode === 'login' ? 'signup' : 'login')}
                    disabled={isAnyLoading}
                    className="font-medium text-emerald-300 transition-colors hover:text-emerald-200 disabled:opacity-50"
                  >
                    {mode === 'login' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
