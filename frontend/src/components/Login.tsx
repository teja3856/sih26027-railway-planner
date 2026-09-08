import React, { useState } from 'react';
import { Train, Shield, Lock, User as UserIcon, AlertCircle, ArrowRight, CheckCircle2, KeyRound } from 'lucide-react';
import { authApi } from '../services/api';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User, token: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await authApi.login(username.trim(), password.trim());
      const { user, token } = res.data;
      if (token && user) {
        localStorage.setItem('sih_auth_token', token);
        localStorage.setItem('sih_user', JSON.stringify(user));
        onLoginSuccess(user, token);
      } else {
        setError('Authentication response missing session token.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const msg = err.response?.data?.error || err.response?.data?.message || 'Invalid username or password. Please verify credentials.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden font-sans text-slate-100">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-2xl shadow-2xl p-8 relative z-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-gradient-to-tr from-sky-600 to-cyan-500 rounded-2xl shadow-lg shadow-sky-500/20 text-white mb-2">
            <Train className="w-8 h-8" />
          </div>
          <div className="flex items-center justify-center space-x-2">
            <h1 className="text-xl font-bold tracking-tight text-white">RAIL-BLOCK <span className="text-sky-400">AI OPTIMIZER</span></h1>
            <span className="bg-sky-950 text-sky-400 text-[10px] font-bold px-2 py-0.5 rounded border border-sky-800">SIH26027</span>
          </div>
          <p className="text-xs text-slate-400">
            Ministry of Railways | Control Room Secure Authentication Portal
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-950/60 border border-red-800/80 rounded-xl p-3.5 flex items-start space-x-3 text-red-200 text-xs">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Username / RailNet ID</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <UserIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin, controller, engineer_eng"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Security Password</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-sky-600/30 flex items-center justify-center space-x-2 transition-all transform active:scale-98 disabled:opacity-50 text-xs"
          >
            {isLoading ? (
              <span>Authenticating Session...</span>
            ) : (
              <>
                <span>ACCESS SECURE DASHBOARD</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials Fill */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center space-x-1">
              <KeyRound className="w-3.5 h-3.5 text-sky-400" />
              <span>SIH DEMO ROLES (1-CLICK AUTOFILL)</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickFill('admin', 'admin123')}
              className="bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 p-2 rounded-lg text-left transition-all"
            >
              <span className="font-bold text-sky-400 block">Administrator</span>
              <span className="text-[10px] text-slate-500 block">admin / admin123</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('controller', 'control123')}
              className="bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 p-2 rounded-lg text-left transition-all"
            >
              <span className="font-bold text-purple-400 block">Ops Controller</span>
              <span className="text-[10px] text-slate-500 block">controller / control123</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('engineer_eng', 'eng123')}
              className="bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 p-2 rounded-lg text-left transition-all"
            >
              <span className="font-bold text-emerald-400 block">Track Engineer</span>
              <span className="text-[10px] text-slate-500 block">engineer_eng / eng123</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('engineer_td', 'ohe123')}
              className="bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 p-2 rounded-lg text-left transition-all"
            >
              <span className="font-bold text-amber-400 block">OHE Engineer</span>
              <span className="text-[10px] text-slate-500 block">engineer_td / ohe123</span>
            </button>
          </div>
        </div>

        {/* Disclaimer Footer */}
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[10px] text-slate-400 text-center leading-relaxed">
          <span className="font-bold text-amber-400 block mb-0.5">⚠️ SIH26027 PROTOTYPE DEMONSTRATION</span>
          Authenticated sessions connect to Render PostgreSQL & Python FastAPI optimizer using synthetic operational dataset.
        </div>
      </div>
    </div>
  );
};
