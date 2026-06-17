import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Lock, Sprout } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { clearStoredAuth } from '../../services/authStorage';
import { isSupabaseConfigured, supabase } from '../../services/supabase';

const MIN_PASSWORD_LENGTH = 8;

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [isRecoverySession, setIsRecoverySession] = useState(false);

  const hasRecoveryHint = useMemo(() => {
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    return hash.includes('type=recovery') || search.includes('type=recovery');
  }, []);

  useEffect(() => {
    let mounted = true;

    const verifyRecoverySession = async () => {
      if (!isSupabaseConfigured) {
        if (mounted) {
          setErrorMessage('Password reset is not configured yet.');
          setCheckingSession(false);
        }
        return;
      }

      const applySessionState = async () => {
        const { data } = await supabase.auth.getSession();
        if (!mounted) {
          return false;
        }

        if (data.session) {
          setIsRecoverySession(true);
          setCheckingSession(false);
          return true;
        }

        return false;
      };

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (!mounted) {
          return;
        }

        if ((event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') && session) {
          setIsRecoverySession(true);
          setCheckingSession(false);
          setErrorMessage('');
        }
      });

      const immediateSession = await applySessionState();
      if (!immediateSession && hasRecoveryHint) {
        await new Promise((resolve) => window.setTimeout(resolve, 500));
        const delayedSession = await applySessionState();
        if (!delayedSession && mounted) {
          setCheckingSession(false);
          setErrorMessage('This reset link is invalid or has expired. Please request a new one.');
        }
      } else if (!immediateSession && mounted) {
        setCheckingSession(false);
        setErrorMessage('Open the reset link from your email to choose a new password.');
      }

      return () => subscription.unsubscribe();
    };

    let cleanup: (() => void) | undefined;

    void verifyRecoverySession().then((dispose) => {
      cleanup = dispose;
    });

    return () => {
      mounted = false;
      cleanup?.();
    };
  }, [hasRecoveryHint]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!isRecoverySession) {
      setErrorMessage('Open the reset link from your email before choosing a new password.');
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage(`Your password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('The password confirmation does not match.');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        throw error;
      }

      clearStoredAuth();
      await supabase.auth.signOut().catch(() => undefined);
      setSuccessMessage('Password updated successfully. Redirecting you to login...');

      window.setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: {
            message: 'Password updated successfully. You can now sign in.',
          },
        });
      }, 1200);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'We could not update your password right now. Please try again.';
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f6f8f8]">
      <div className="w-full max-w-[480px] bg-white shadow-2xl rounded-xl overflow-hidden border border-primary/10">
        <div className="h-2 w-full bg-gradient-to-r from-[#134E5E] to-[#71B280]" />

        <div className="p-8">
          <header className="mb-8 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-xl text-primary mb-4">
              <Sprout size={32} />
            </div>
            <h1 className="text-slate-900 tracking-tight text-3xl font-bold">Choose a new password</h1>
            <p className="text-slate-500 mt-2">
              Set a secure password for your AgroSmart account, then we&apos;ll take you back to login.
            </p>
          </header>

          {checkingSession ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-8 text-center">
              <div className="mx-auto mb-4 h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm font-medium text-slate-600">Verifying your reset link...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {successMessage && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {successMessage}
                </div>
              )}

              {errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-slate-700 text-sm font-semibold ml-1">New Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    className="w-full rounded-xl text-slate-900 focus:ring-2 focus:ring-primary/20 border border-slate-200 bg-white h-14 pl-11 pr-12 placeholder:text-slate-400 transition-all outline-none"
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-slate-700 text-sm font-semibold ml-1">Confirm Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                    <KeyRound size={20} />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    className="w-full rounded-xl text-slate-900 focus:ring-2 focus:ring-primary/20 border border-slate-200 bg-white h-14 pl-11 pr-12 placeholder:text-slate-400 transition-all outline-none"
                    placeholder="Repeat your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((current) => !current)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <p className="text-xs leading-6 text-slate-500">
                Use at least {MIN_PASSWORD_LENGTH} characters so your account stays protected.
              </p>

              <button
                type="submit"
                disabled={submitting || !isRecoverySession}
                className="w-full h-14 bg-gradient-to-r from-[#134E5E] to-[#71B280] text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span>{submitting ? 'Updating password...' : 'Update password'}</span>
                <CheckCircle2 size={20} />
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              <ArrowLeft size={16} />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
