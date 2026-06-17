import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Sprout, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getRouteForRole } from '../../utils/authRouting';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    try {
      const resolvedUser = await register(name, email, password);
      navigate(getRouteForRole(resolvedUser.role), { replace: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to create your account. Please try again.';
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleRegister = async () => {
    setErrorMessage('');
    setGoogleSubmitting(true);

    try {
      await loginWithGoogle();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to start Google sign-in right now.';
      setErrorMessage(message);
      setGoogleSubmitting(false);
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
            <h1 className="text-slate-900 tracking-tight text-3xl font-bold">Create Account</h1>
            <p className="text-slate-500 mt-2">Join our community of smart farmers</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-slate-700 text-sm font-semibold ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  className="w-full rounded-xl text-slate-900 focus:ring-2 focus:ring-primary/20 border border-slate-200 bg-white h-14 pl-11 pr-4 placeholder:text-slate-400 transition-all outline-none"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

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
                  placeholder="nature@agrosmart.com"
                />
              </div>
            </div>

<div className="space-y-2">
              <label className="text-slate-700 text-sm font-semibold ml-1">Password</label>
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
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleGoogleRegister}
                  disabled={googleSubmitting || submitting}
                  className="h-12 bg-white text-slate-700 font-medium rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>{googleSubmitting ? 'Redirecting...' : 'Google'}</span>
                </button>
                <button
                  type="button"
                  disabled
                  title="Coming Soon"
                  className="h-12 bg-slate-100 text-slate-400 font-medium rounded-xl border border-slate-200 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <span>Apple</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-14 bg-gradient-to-r from-[#134E5E] to-[#71B280] text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span>{submitting ? 'Creating account...' : 'Create Account'}</span>
              <ArrowRight size={20} />
            </button>
          </form>

          <div className="text-center mt-8">
            <p className="text-slate-600">
              Already have an account? 
              <Link to="/login" className="text-primary font-bold hover:underline ml-1">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
