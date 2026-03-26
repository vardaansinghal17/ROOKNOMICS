import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';
import { X, BarChart2, ShieldCheck, RefreshCw, CheckCircle2 } from 'lucide-react';

interface OtpDialogProps {
  open: boolean;
  email: string;
  onClose: () => void;
  onVerified: () => void;
}

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30; // seconds

export default function OtpDialog({ open, email, onClose, onVerified }: OtpDialogProps) {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Start resend countdown when dialog opens
  useEffect(() => {
    if (!open) return;
    setOtp(Array(OTP_LENGTH).fill(''));
    setError('');
    setVerified(false);
    setResendTimer(RESEND_COOLDOWN);
    setCanResend(false);
    setIsVerifying(false);
    // Focus first input
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, [open]);

  // Countdown timer
  useEffect(() => {
    if (!open || verified) return;
    if (resendTimer <= 0) { setCanResend(true); return; }
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) { setCanResend(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [open, verified, resendTimer]);

  if (!open) return null;

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-advance
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all filled
    if (value && newOtp.every(d => d !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!paste) return;
    const newOtp = Array(OTP_LENGTH).fill('');
    paste.split('').forEach((ch, i) => { newOtp[i] = ch; });
    setOtp(newOtp);
    const nextFocus = Math.min(paste.length, OTP_LENGTH - 1);
    inputRefs.current[nextFocus]?.focus();
    if (paste.length === OTP_LENGTH) handleVerify(paste);
  };

  const handleVerify = (code: string) => {
    setIsVerifying(true);
    setError('');
    // Simulate async verification (mock: any 6-digit code works)
    setTimeout(() => {
      setIsVerifying(false);
      // For demo, accept any 6-digit code
      if (code.length === OTP_LENGTH) {
        setVerified(true);
        setTimeout(() => {
          onVerified();
        }, 1800);
      } else {
        setError('Invalid code. Please try again.');
      }
    }, 800);
  };

  const handleManualVerify = () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      setError('Please enter the complete 6-digit code.');
      return;
    }
    handleVerify(code);
  };

  const handleResend = () => {
    if (!canResend) return;
    setOtp(Array(OTP_LENGTH).fill(''));
    setError('');
    setResendTimer(RESEND_COOLDOWN);
    setCanResend(false);
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
    // In a real app, trigger resend API call here
  };

  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, (_m, a, b, c) => a + '*'.repeat(b.length) + c);

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/30 z-[60] backdrop-blur-sm" onClick={!verified ? onClose : undefined} />
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div
          className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl"
          onClick={e => e.stopPropagation()}
          style={{ animation: 'otpSlideIn 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}
        >
          <style>{`
            @keyframes otpSlideIn {
              from { opacity: 0; transform: scale(0.94) translateY(8px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
            @keyframes otpSuccess {
              0% { transform: scale(0.8); opacity: 0; }
              60% { transform: scale(1.1); opacity: 1; }
              100% { transform: scale(1); opacity: 1; }
            }
            .otp-success-icon { animation: otpSuccess 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
          `}</style>

          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <BarChart2 size={16} className="text-white" />
                </div>
                <span className="font-bold text-slate-900 text-lg">ROOKNOMICS</span>
              </div>
              {!verified && (
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                  <X size={20} />
                </button>
              )}
            </div>

            {verified ? (
              /* ── SUCCESS STATE ── */
              <div className="text-center py-6">
                <div className="otp-success-icon flex justify-center mb-4">
                  <CheckCircle2 size={64} className="text-emerald-500" strokeWidth={1.5} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Email Verified!</h2>
                <p className="text-slate-500 text-sm">Your account has been created successfully.<br />Redirecting you now…</p>
              </div>
            ) : (
              /* ── VERIFICATION FORM ── */
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck size={20} className="text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 leading-tight">Verify your email</h2>
                    <p className="text-slate-500 text-xs mt-0.5">
                      We sent a 6-digit code to <span className="font-semibold text-slate-700">{maskedEmail}</span>
                    </p>
                  </div>
                </div>

                {/* OTP Inputs */}
                <div className="flex justify-between gap-2 mb-4">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleChange(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                      onPaste={handlePaste}
                      disabled={isVerifying}
                      className={`
                        w-full aspect-square text-center text-xl font-bold rounded-xl border-2 outline-none
                        transition-all duration-150 select-none
                        ${error
                          ? 'border-rose-400 bg-rose-50 text-rose-700'
                          : digit
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200 bg-slate-50 text-slate-800 focus:border-indigo-400 focus:bg-white'
                        }
                        ${isVerifying ? 'opacity-60 cursor-not-allowed' : ''}
                      `}
                      style={{ maxWidth: '3.2rem' }}
                    />
                  ))}
                </div>

                {/* Error message */}
                {error && (
                  <p className="text-rose-600 text-xs text-center mb-3">{error}</p>
                )}

                {/* Verify Button */}
                <button
                  onClick={handleManualVerify}
                  disabled={isVerifying || otp.some(d => !d)}
                  className={`
                    w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl
                    transition-all duration-300 text-sm flex items-center justify-center gap-2
                    ${(isVerifying || otp.some(d => !d)) ? 'opacity-60 cursor-not-allowed' : ''}
                  `}
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      Verifying…
                    </>
                  ) : 'Verify & Continue'}
                </button>

                {/* Resend */}
                <div className="flex items-center justify-center gap-1.5 mt-5 text-xs text-slate-500">
                  <span>Didn't receive the code?</span>
                  {canResend ? (
                    <button
                      onClick={handleResend}
                      className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
                    >
                      Resend
                    </button>
                  ) : (
                    <span className="text-slate-400">
                      Resend in <span className="font-semibold text-slate-600 tabular-nums">{resendTimer}s</span>
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
