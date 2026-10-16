import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    userProfile,
    role,
    signInWithEmail,
    signUpWithEmail,
    signInGoogle,
    signOutUser,
    setSimulatedRole,
    changePassword,
  } = useAuth();
  const { t } = useProject();

  const [mode, setMode] = useState<'signin' | 'signup' | 'profile'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('SUPERVISOR');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
        setSuccess('Signed in successfully.');
        setTimeout(onClose, 800);
      } else if (mode === 'signup') {
        await signUpWithEmail(email, password, displayName, selectedRole);
        setSuccess('Account created successfully.');
        setTimeout(onClose, 800);
      } else if (mode === 'profile' && newPassword) {
        await changePassword(newPassword);
        setSuccess('Password updated.');
        setNewPassword('');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    try {
      await signInGoogle();
      setTimeout(onClose, 800);
    } catch (err: any) {
      setError(err?.message || 'Google authentication failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#142238] border border-[#00E5FF]/30 p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#94A8C2] hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {currentUser ? (
          <div>
            <div className="flex items-center gap-3 pb-4 border-b border-[#1f3556]">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#00E5FF] to-[#2979FF] flex items-center justify-center text-[#080F1D] font-bold text-lg">
                {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F3F7FF]">
                  {currentUser.displayName || 'MEP Engineer'}
                </h3>
                <p className="text-xs text-[#94A8C2]">{currentUser.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40">
                  {role}
                </span>
              </div>
            </div>

            {/* Test Role Switcher for instant workflow evaluation */}
            <div className="mt-5 p-3.5 rounded-xl bg-[#101B2E] border border-[#1f3556]">
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-[#00E5FF]">
                <Shield className="w-4 h-4" />
                <span>{t('demo_role_switch')}</span>
              </div>
              <p className="text-[11px] text-[#94A8C2] mb-3">
                Switch permission modes in real-time to test Manager full control, Supervisor proposal submissions, or Viewer read-only restrictions:
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(['MANAGER', 'SUPERVISOR', 'VIEWER'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSimulatedRole(r)}
                    className={`py-2 px-2 rounded-lg text-xs font-semibold transition border ${
                      role === r
                        ? 'bg-[#00E5FF] text-[#080F1D] border-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.4)]'
                        : 'bg-[#142238] text-[#94A8C2] border-[#1f3556] hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Change Password */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <label className="block text-xs font-medium text-[#94A8C2]">
                Update Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-[#94A8C2]" />
                <input
                  type="password"
                  placeholder="Enter new password..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                />
              </div>
              {newPassword && (
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2 rounded-xl bg-[#2979FF] hover:bg-[#00E5FF] text-white hover:text-[#080F1D] text-xs font-bold transition"
                >
                  {submitting ? 'Updating...' : 'Save New Password'}
                </button>
              )}
            </form>

            <button
              onClick={() => {
                signOutUser();
                onClose();
              }}
              className="mt-5 w-full py-2.5 rounded-xl bg-[#FF526B]/15 border border-[#FF526B]/30 text-[#FF526B] hover:bg-[#FF526B] hover:text-white text-xs font-bold transition cursor-pointer"
            >
              {t('sign_out')}
            </button>
          </div>
        ) : (
          <div>
            <div className="text-center mb-5">
              <h3 className="text-lg font-bold text-[#F3F7FF]">
                {mode === 'signin' ? 'Sign In to MEP Control' : 'Register New Account'}
              </h3>
              <p className="text-xs text-[#94A8C2] mt-1">
                BALAK RESORT • PT. PANTAI BESOR REKREASI BAHARI
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-[#FF526B]/15 border border-[#FF526B]/40 text-xs text-[#FF526B] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 rounded-xl bg-[#00D8B4]/15 border border-[#00D8B4]/40 text-xs text-[#00D8B4] flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-[#94A8C2] mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-2.5 text-[#94A8C2]" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ir. Hendra Wijaya"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#94A8C2] mb-1">
                      Role
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                    >
                      <option value="MANAGER">MANAGER (Full Project Access)</option>
                      <option value="SUPERVISOR">SUPERVISOR (Progress Submissions)</option>
                      <option value="VIEWER">VIEWER (Read-Only)</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-[#94A8C2] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-[#94A8C2]" />
                  <input
                    type="email"
                    required
                    placeholder="engineer@balakresort.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#94A8C2] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-[#94A8C2]" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#101B2E] border border-[#1f3556] text-xs text-[#F3F7FF] focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#2979FF] text-[#080F1D] text-xs font-bold shadow-[0_0_15px_rgba(0,229,255,0.3)] hover:opacity-95 transition"
              >
                {submitting
                  ? 'Processing...'
                  : mode === 'signin'
                  ? 'Sign In with Email'
                  : 'Create MEP Account'}
              </button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#1f3556]"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#142238] px-2 text-[#94A8C2]">or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogle}
              className="w-full py-2.5 rounded-xl bg-[#101B2E] border border-[#1f3556] hover:border-[#00E5FF]/40 text-xs font-semibold text-[#F3F7FF] flex items-center justify-center gap-2 transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google Account</span>
            </button>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="text-xs text-[#00E5FF] hover:underline"
              >
                {mode === 'signin'
                  ? "Don't have an account? Register here"
                  : 'Already registered? Sign in'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
