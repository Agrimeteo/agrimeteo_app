import React, { useState } from 'react';
import { ArrowLeft, Mail, Send, Sprout } from 'lucide-react';
import { Link } from 'react-router-dom';
import { isSupabaseConfigured, supabase } from '../../services/supabase';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setSubmitting(true);

    try {
      if (!isSupabaseConfigured) {
        throw new Error('Password recovery is not configured yet.');
      }

      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

      if (error) {
        throw error;
      }

      setSuccessMessage('If an account exists for this email, a reset link has been sent.');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'We could not send the reset link right now. Please try again.';
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
            <h1 className="text-slate-900 tracking-tight text-3xl font-bold">Reset your password</h1>
            <p className="text-slate-500 mt-2">
              Enter the email linked to your account and we&apos;ll send you a secure reset link.
            </p>
          </header>

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
              <label className="text-slate-700 text-sm font-semibold ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  className="w-full rounded-xl text-slate-900 focus:ring-2 focus:ring-primary/20 border border-slate-200 bg-white h-14 pl-11 pr-4 placeholder:text-slate-400 transition-all outline-none"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-14 bg-gradient-to-r from-[#134E5E] to-[#71B280] text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span>{submitting ? 'Sending reset link...' : 'Send reset link'}</span>
              <Send size={20} />
            </button>
          </form>

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

export default ForgotPassword;
