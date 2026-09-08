import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { Train, Play, UserCheck, Bell, RefreshCw, Cpu } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onRunDemo: () => void;
  isDemoLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  onRunDemo,
  isDemoLoading,
}) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between shadow-md">
      {/* Title & Brand */}
      <div className="flex items-center space-x-3">
        <div className="bg-gradient-to-tr from-sky-600 to-cyan-500 p-2.5 rounded-xl shadow-lg shadow-sky-500/20 text-white">
          <Train className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold text-slate-100 tracking-wide">
              RAIL-BLOCK <span className="text-sky-400 text-sm font-semibold uppercase tracking-wider">AI Optimizer</span>
            </h1>
            <span className="bg-sky-950 text-sky-400 text-[10px] font-bold px-2 py-0.5 rounded border border-sky-800">
              MINISTRY OF RAILWAYS
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Automatic Block Planning & Multi-Department Asset Availability Engine
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4">
        {/* 1-Click Run Synthetic Demo Scenario Button */}
        <button
          onClick={onRunDemo}
          disabled={isDemoLoading}
          className="relative group bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-md shadow-emerald-600/30 flex items-center space-x-2 transition-all transform active:scale-95 disabled:opacity-50"
        >
          {isDemoLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Play className="w-4 h-4 fill-white text-white" />
          )}
          <span>{isDemoLoading ? 'OPTIMIZING DEMO...' : 'RUN SYNTHETIC DEMO SCENARIO'}</span>
        </button>

        {/* Role Switcher */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700">
          <UserCheck className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
          <span className="text-[11px] font-semibold text-slate-400 mr-2">ROLE:</span>
          {(['ADMIN', 'OPERATIONS_CONTROLLER', 'MAINTENANCE_ENGINEER'] as UserRole[]).map((role) => (
            <button
              key={role}
              onClick={() => onRoleChange(role)}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-md transition-all ${
                currentRole === role
                  ? 'bg-sky-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              {role === 'ADMIN' ? 'ADMIN' : role === 'OPERATIONS_CONTROLLER' ? 'CONTROLLER' : 'ENGINEER'}
            </button>
          ))}
        </div>

        {/* Live Clock & Notifications */}
        <div className="hidden lg:flex items-center space-x-3 text-xs font-mono text-slate-400 border-l border-slate-800 pl-4">
          <div className="bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800 text-sky-400 font-bold">
            {time || '17:00:00'}
          </div>
          <button className="relative text-slate-400 hover:text-slate-200 p-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-slate-900">
              3
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
