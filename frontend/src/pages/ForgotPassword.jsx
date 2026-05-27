import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Link as LinkIcon, Mail, Lock, ArrowRight, ArrowLeft, KeyRound, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { apiClient } from '../utils/api';

// Step indicators
const STEPS = ['Email', 'Verify OTP', 'New Password'];

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const otpRefs = useRef([]);

  const clearMessages = () => { setError(''); setSuccess(''); };

  // ── Step 1: Send OTP ──────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!email.trim()) return setError('Please enter your email address.');

    try {
      setLoading(true);
      const data = await apiClient('/auth/forgot-password', {
        method: 'POST',
        body: { email: email.trim().toLowerCase() },
      });
      setSuccess(data.message);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── OTP input handlers ────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = [...otp];
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    clearMessages();
    const otpString = otp.join('');
    if (otpString.length < 6) return setError('Please enter all 6 digits of the OTP.');

    try {
      setLoading(true);
      const data = await apiClient('/auth/verify-otp', {
        method: 'POST',
        body: { email: email.trim().toLowerCase(), otp: otpString },
      });
      setSuccess(data.message);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Reset Password ────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    clearMessages();
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirmPassword) return setError('Passwords do not match.');

    try {
      setLoading(true);
      const data = await apiClient('/auth/reset-password', {
        method: 'POST',
        body: {
          email: email.trim().toLowerCase(),
          otp: otp.join(''),
          password,
          confirmPassword,
        },
      });
      setSuccess(data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    clearMessages();
    setOtp(['', '', '', '', '', '']);
    try {
      setLoading(true);
      const data = await apiClient('/auth/forgot-password', {
        method: 'POST',
        body: { email: email.trim().toLowerCase() },
      });
      setSuccess('A new OTP has been sent to your email.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const stepIcons = [
    <Mail className="w-5 h-5" />,
    <ShieldCheck className="w-5 h-5" />,
    <Lock className="w-5 h-5" />,
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-violet-600/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-fuchsia-600/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute inset-0 grid-glow-layer pointer-events-none opacity-40"></div>

      {/* Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex items-center justify-center gap-2.5 group">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 group-hover:border-primary/40 transition-colors shadow-glow-primary">
            <LinkIcon className="h-6 w-6 text-primary group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight font-display">
            Snap<span className="text-primary font-dark">Link</span>
          </span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold font-display">Reset Password</h2>
        <p className="mt-2 text-center text-sm text-stone-400">
          Remembered it?{' '}
          <Link to="/login" className="font-semibold text-primary hover:text-primary-hover transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      {/* Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="glass-card py-8 px-4 sm:px-10 rounded-2xl">

          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-8">
            {STEPS.map((label, i) => {
              const stepNum = i + 1;
              const isActive = step === stepNum;
              const isDone = step > stepNum;
              return (
                <React.Fragment key={label}>
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 text-sm font-bold
                      ${isDone ? 'bg-violet-600 border-violet-600 text-white' : isActive ? 'border-violet-500 text-violet-400 bg-violet-500/10' : 'border-stone-700 text-stone-600'}`}>
                      {isDone ? '✓' : stepNum}
                    </div>
                    <span className={`text-[10px] font-semibold tracking-wide ${isActive ? 'text-violet-400' : isDone ? 'text-stone-400' : 'text-stone-600'}`}>
                      {label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 mb-4 rounded transition-all duration-500 ${step > stepNum ? 'bg-violet-600' : 'bg-stone-800'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Error / Success banners */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl border border-rose-500/30 bg-rose-950/20 text-rose-300 text-sm flex items-center gap-2">
              <span className="text-rose-400 text-base">✕</span>
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 px-4 py-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-emerald-300 text-sm flex items-center gap-2">
              <span className="text-emerald-400 text-base">✓</span>
              {success}
            </div>
          )}

          {/* ── Step 1: Email ── */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label htmlFor="fp-email" className="block text-sm font-semibold text-stone-300 tracking-wide mb-1.5">
                  Registered Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-stone-500" />
                  </div>
                  <input
                    id="fp-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 border rounded-xl glass-input text-black text-sm"
                    placeholder="enter registered email"
                  />
                </div>
                <p className="mt-2 text-xs text-stone-500">We'll send a 6-digit OTP to this address.</p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 shadow-glow-primary transition-all duration-200 disabled:opacity-50"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <><span>Send OTP</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}

          {/* ── Step 2: OTP ── */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-stone-300 tracking-wide mb-3">
                  Enter 6-digit OTP
                </label>
                <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (otpRefs.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-11 h-12 text-center text-lg font-bold rounded-xl border glass-input text-dark focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-all"
                    />
                  ))}
                </div>
                <p className="mt-2 text-xs text-stone-500">
                  Sent to <span className="text-stone-300 font-medium">{email}</span>.{' '}
                  <button type="button" onClick={resendOtp} className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                    Resend
                  </button>
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { clearMessages(); setStep(1); }}
                  className="flex items-center gap-1.5 py-3 px-4 rounded-xl text-sm font-bold text-stone-400 bg-stone-800/60 hover:bg-stone-700/60 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="submit"
                  disabled={loading || otp.join('').length < 6}
                  className="flex-1 flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 shadow-glow-primary transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <><span>Verify OTP</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </form>
          )}

          {/* ── Step 3: New Password ── */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label htmlFor="new-password" className="block text-sm font-semibold text-stone-300 tracking-wide mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-stone-500" />
                  </div>
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-12 py-3 border rounded-xl glass-input text-dark text-sm"
                    placeholder="Min. 6 characters"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-200 transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-semibold text-stone-300 tracking-wide mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-stone-500" />
                  </div>
                  <input
                    id="confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-11 pr-12 py-3 border rounded-xl glass-input text-dark text-sm"
                    placeholder="Re-enter password"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-200 transition-colors">
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {password && confirmPassword && password !== confirmPassword && (
                  <p className="mt-1.5 text-xs text-rose-400">Passwords do not match</p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 shadow-glow-primary transition-all duration-200 disabled:opacity-50"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <><span>Reset Password</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
