import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sprout } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getRouteForRole } from '../../utils/authRouting';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { completeOAuthSession } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const finalize = async () => {
      try {
        const resolvedUser = await completeOAuthSession();
        if (!mounted) {
          return;
        }

        navigate(getRouteForRole(resolvedUser.role), { replace: true });
      } catch (err) {
        if (!mounted) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : 'We could not finish your Google sign-in. Please try again.'
        );
      }
    };

    void finalize();

    return () => {
      mounted = false;
    };
  }, [completeOAuthSession, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f6f8f8]">
      <div className="w-full max-w-[480px] rounded-2xl border border-primary/10 bg-white p-8 text-center shadow-2xl">
        <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Sprout size={32} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Finalizing your Google sign-in</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          We&apos;re securing your session and loading your AgroSmart profile.
        </p>

        {error ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-700">
            {error}
          </div>
        ) : (
          <div className="mt-8 flex items-center justify-center gap-3 text-primary">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span className="text-sm font-semibold">Please wait a moment...</span>
          </div>
        )}

        {error && (
          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#134E5E] to-[#71B280] px-6 text-sm font-bold text-white shadow-lg shadow-primary/20"
          >
            Back to login
            <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
