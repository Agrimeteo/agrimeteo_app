import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getRouteForRole, SelectableRole } from '../../utils/authRouting';

const RoleSelection = () => {
  const navigate = useNavigate();
  const { completeRoleSelection, user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<SelectableRole>('farmer');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = async () => {
    setSaving(true);
    setError('');

    try {
      const resolvedUser = await completeRoleSelection(selectedRole);
      navigate(getRouteForRole(resolvedUser.role), { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'We could not save your role right now. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f8f8]">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <div className="px-6 pt-12 pb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Choose your role</h1>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            {user?.name ? `Welcome ${user.name}. ` : ''}
            Before continuing, tell us how you&apos;ll use AgroSmart so we can open the right
            dashboard for you.
          </p>
        </div>

        <div className="flex flex-col gap-4 px-6 pb-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <label className="relative cursor-pointer">
            <input
              checked={selectedRole === 'farmer'}
              className="peer sr-only"
              name="role"
              type="radio"
              value="farmer"
              onChange={() => setSelectedRole('farmer')}
            />
            <div className="rounded-2xl border-2 border-transparent bg-white p-6 shadow-sm transition-all peer-checked:border-[#13515e] peer-checked:ring-2 peer-checked:ring-[#13515e]/20">
              <div className="mb-4 flex aspect-video items-center justify-center rounded-xl bg-[#13515e]/10">
                <span className="material-symbols-outlined text-6xl text-[#13515e]">agriculture</span>
              </div>
              <p className="text-xl font-bold text-slate-900">I am a Farmer</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Manage crops, follow weather alerts, and track each field from one place.
              </p>
            </div>
          </label>

          <label className="relative cursor-pointer">
            <input
              checked={selectedRole === 'beginner'}
              className="peer sr-only"
              name="role"
              type="radio"
              value="beginner"
              onChange={() => setSelectedRole('beginner')}
            />
            <div className="rounded-2xl border-2 border-transparent bg-white p-6 shadow-sm transition-all peer-checked:border-[#13515e] peer-checked:ring-2 peer-checked:ring-[#13515e]/20">
              <div className="mb-4 flex aspect-video items-center justify-center rounded-xl bg-[#71B280]/10">
                <span className="material-symbols-outlined text-6xl text-[#71B280]">potted_plant</span>
              </div>
              <p className="text-xl font-bold text-slate-900">I am a Beginner</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Learn how to start, explore practical guidance, and build confidence step by step.
              </p>
            </div>
          </label>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-500">
            Administrator accounts keep their role from the database and do not need to choose it here.
          </div>
        </div>

        <div className="mt-auto px-6 pb-8">
          <button
            type="button"
            onClick={handleContinue}
            disabled={saving}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#13515e] text-lg font-bold text-white shadow-lg shadow-[#13515e]/20 transition-colors hover:bg-[#13515e]/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span>{saving ? 'Saving your role...' : 'Continue'}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
