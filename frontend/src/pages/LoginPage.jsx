import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HardDrive, Eye, EyeOff, Lock, ArrowRight, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!password || !password.trim()) {
      setFormError('Please enter your password.');
      return;
    }

    const result = await login(password);
    if (result.success) {
      if (result.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/drive');
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-4 sm:p-6 relative overflow-hidden selection:bg-brand-500 selection:text-white">
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-gradient-to-tr from-brand-600/25 to-purple-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse-subtle" />
      <div className="absolute bottom-10 right-10 w-[24rem] h-[24rem] bg-indigo-600/15 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Main Glass Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 space-y-6">
          
          {/* Brand Logo & Header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-brand-500/30 transform hover:scale-105 transition-transform duration-300">
              <HardDrive className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                CloudVault
              </h1>
              <p className="text-xs font-medium text-brand-400 uppercase tracking-widest mt-1">
                Personal Cloud Drive
              </p>
            </div>
          </div>

          {/* Error Notice */}
          {(error || formError) && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{formError || error}</span>
            </div>
          )}

          {/* Single Password Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Drive Password
              </label>
              <div className="relative group">
                <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter single password..."
                  disabled={isLoading}
                  autoFocus
                  className="w-full pl-11 pr-11 py-3.5 text-sm bg-slate-950/90 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-200 transition-colors rounded-lg"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:via-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2.5 transition-all duration-200 transform active:scale-98 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Access Personal Cloud</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Footer Security Badge */}
          <div className="pt-2 text-center border-t border-slate-800/80">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/60 border border-slate-800 text-[11px] font-medium text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Backend Single Source of Truth</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
