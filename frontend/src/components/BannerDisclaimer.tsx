import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export const BannerDisclaimer: React.FC = () => {
  return (
    <div className="bg-amber-950/60 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-200 flex items-center justify-between shadow-inner">
      <div className="flex items-center space-x-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="font-semibold text-amber-300">IMPORTANT DEMO NOTICE:</span>
        <span>
          Prototype using <strong className="underline decoration-amber-400">synthetic demonstration data</strong> (TMS, SMMS, TDMS, COA, Train Timetable). Not connected to live Indian Railways production systems.
        </span>
      </div>
      <div className="hidden md:flex items-center space-x-1 bg-amber-900/50 px-2 py-0.5 rounded border border-amber-600/40 text-[11px] font-mono text-amber-300">
        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
        <span>SIH 2026 PS ID: SIH26027</span>
      </div>
    </div>
  );
};
