import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';
import { X, BarChart2, ShieldCheck, RefreshCw, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.js';

interface OtpDialogProps {
  open: boolean;
  email: string;
  onClose: () => void;
  onVerified: () => void;
}

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;

export default function OtpDialog({ open, email, onClose, onVerified }: OtpDialogProps) {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    handleVerifyOtp,
    isOtpLoading,
    otpError,
    clearOtpError,
    isVerified,
    handleResendOtp,
    isResendLoading,
    resendError,
  } = useAuth();

  useEffect(() => {
    if (!open) return;
    setOtp(Array(OTP_LENGTH).fill(''));
    setResendTimer(RESEND_COOLDOWN);
    setCanResend(false);
    clearOtpError();
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, [open, clearOtpError]);

  useEffect(() => {
    if (!open || isVerified) return;
    if (resendTimer <= 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [open, isVerified, resendTimer]);

  useEffect(() => {
    if (isVerified) {
      const timer = setTimeout(() => onVerified(), 1800);
      return () => clearTimeout(timer);
    }
  }, [isVerified, onVerified]);

  if (!open) return null;

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    clearOtpError();

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (value && newOtp.every((digit) => digit !== '')) {
      triggerVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!paste) return;

    const newOtp = Array(OTP_LENGTH).fill('');
    paste.split('').forEach((char, index) => {
      newOtp[index] = char;
    });
    setOtp(newOtp);

    const nextFocus = Math.min(paste.length, OTP_LENGTH - 1);
    inputRefs.current[nextFocus]?.focus();

    if (paste.length === OTP_LENGTH) {
      triggerVerify(paste);
    }
  };

  const triggerVerify = async (code: string) => {
    await handleVerifyOtp(email, code);
  };

  const handleManualVerify = () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) return;
    triggerVerify(code);
  };

  const handleResend = async () => {
    if (!canResend || isResendLoading) return;
    await handleResendOtp(email);
    setOtp(Array(OTP_LENGTH).fill(''));
    clearOtpError();
    setResendTimer(RESEND_COOLDOWN);
    setCanResend(false);
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  };

  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, (_match, start, middle, end) =>
    start + '*'.repeat(middle.length) + end
  );

  const displayError = otpError || resendError;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm"
        onClick={!isVerified ? onClose : undefined}
      />

      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
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
              {!isVerified && (
                <button
                  onClick={onClose}
                  disabled={isOtpLoading}
                  className="rounded-lg border border-[#1A1A1A] bg-[#111111] p-2 text-[#7A7A7A] transition-colors hover:border-[#2A2A2A] hover:text-[#EAEAEA] disabled:opacity-40"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {isVerified ? (
              <div className="py-6 text-center">
                <motion.div
                  initial={{ scale: 0.88, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="mb-4 flex justify-center"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10">
                    <CheckCircle2 size={36} className="text-emerald-300" strokeWidth={1.5} />
                  </div>
                </motion.div>
                <h2 className="mb-2 text-2xl font-bold text-[#EAEAEA]">Email verified</h2>
                <p className="text-sm text-[#7A7A7A]">
                  Your account has been created successfully.
                  <br />
                  Redirecting you now...
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10">
                    <ShieldCheck size={18} className="text-emerald-300" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#EAEAEA]">Verify your email</h2>
                    <p className="mt-1 text-sm text-[#7A7A7A]">
                      We sent a 6-digit code to <span className="font-medium text-[#EAEAEA]">{maskedEmail}</span>
                    </p>
                  </div>
                </div>

                <AnimatePresence>
                  {displayError && (
                    <motion.div
                      key="otp-error"
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

                <div className="mb-5 grid grid-cols-6 gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      disabled={isOtpLoading}
                      className={[
                        'aspect-square w-full rounded-xl border text-center text-xl font-semibold outline-none transition-all duration-150',
                        displayError
                          ? 'border-rose-400/40 bg-rose-400/5 text-rose-200'
                          : digit
                            ? 'border-emerald-400/40 bg-emerald-400/10 text-[#EAEAEA]'
                            : 'border-[#1A1A1A] bg-[#111111] text-[#EAEAEA] focus:border-emerald-400/40 focus:bg-[#141414]',
                        isOtpLoading ? 'cursor-not-allowed opacity-60' : '',
                      ].join(' ')}
                    />
                  ))}
                </div>

                <button
                  onClick={handleManualVerify}
                  disabled={isOtpLoading || otp.some((digit) => !digit)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 py-3 text-sm font-semibold text-emerald-300 transition-all duration-200 hover:scale-[1.01] hover:border-emerald-400/35 hover:bg-emerald-400/15 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isOtpLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Continue'
                  )}
                </button>

                <div className="mt-5 text-center text-xs text-[#6E6E6E]">
                  <span>Didn't receive the code? </span>
                  {canResend ? (
                    <button
                      onClick={handleResend}
                      disabled={isResendLoading}
                      className="inline-flex items-center gap-1 font-medium text-emerald-300 transition-colors hover:text-emerald-200 disabled:opacity-50"
                    >
                      {isResendLoading ? (
                        <>
                          <RefreshCw size={11} className="animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Resend'
                      )}
                    </button>
                  ) : (
                    <span className="font-medium text-[#7A7A7A]">Resend in {resendTimer}s</span>
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
