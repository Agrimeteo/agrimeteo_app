import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('admin@agrimeteo.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const resolvedUser = await login(email, password, 'admin');
      navigate(resolvedUser.role === 'admin' ? '/admin/dashboard' : '/role-selection', {
        replace: true,
      });
    } catch (err) {
      setError('Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/50 overflow-hidden">
        <div className="h-2 w-full bg-gradient-to-r from-orange-500 via-red-500 to-purple-600" />
        
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl text-white shadow-lg">
              <ShieldAlert size={28} />
            </div>
            <h1 className="text-slate-900 font-black text-3xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent leading-tight mb-2">
              Admin Panel
            </h1>
            <p className="text-slate-600">Accès sécurisé au panneau d'administration</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <ShieldAlert size={20} className="text-red-500 mt-0.5" />
                </div>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-slate-700 font-semibold text-sm block mb-2">Email Admin</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={20} className="text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl backdrop-blur-sm focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-900 placeholder-slate-400 outline-none"
                  placeholder="admin@agrimeteo.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-slate-700 font-semibold text-sm block mb-2">Mot de passe</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={20} className="text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 pl-12 pr-12 py-3 bg-white/50 border border-slate-200 rounded-xl backdrop-blur-sm focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-900 placeholder-slate-400 outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black rounded-xl shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Connexion...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Accès Admin</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-600">
              <Link to="/login" className="text-orange-600 hover:underline font-semibold">
                ← Retour connexion farmer
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
