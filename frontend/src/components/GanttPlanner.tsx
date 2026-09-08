import React, { useState } from 'react';
import { CalendarDays, CalendarRange, Layers, CheckCircle2, Clock } from 'lucide-react';
import { MaintenanceBlock, Corridor } from '../types';

interface GanttPlannerProps {
  horizon: 'WEEKLY' | 'MONTHLY';
  blocks: MaintenanceBlock[];
  corridors: Corridor[];
}

export const GanttPlanner: React.FC<GanttPlannerProps> = ({ horizon, blocks, corridors }) => {
  const [selectedBlock, setSelectedBlock] = useState<MaintenanceBlock | null>(blocks[0] || null);

  const days = horizon === 'WEEKLY'
    ? ['Mon (09-Sep)', 'Tue (10-Sep)', 'Wed (11-Sep)', 'Thu (12-Sep)', 'Fri (13-Sep)', 'Sat (14-Sep)', 'Sun (15-Sep)']
    : Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-110px)]">
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2 font-mono">
            {horizon === 'WEEKLY' ? <CalendarDays className="w-5 h-5 text-sky-400" /> : <CalendarRange className="w-5 h-5 text-sky-400" />}
            <span>{horizon === 'WEEKLY' ? 'Weekly Corridor Maintenance Schedule Planner' : 'Monthly Corridor Horizon Schedule Planner'}</span>
          </h2>
          <p className="text-xs text-slate-400">Interactive Gantt chart showing multi-department coordinated block slots</p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-purple-500"></span>
            <span>Joint Dept Block</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-sky-500"></span>
            <span>Track & Eng</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-amber-500"></span>
            <span>OHE / Traction</span>
          </div>
        </div>
      </div>

      {/* Main Gantt Grid & Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gantt Timeline Board */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-md overflow-x-auto">
          {/* Days Header */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono font-bold text-slate-400 border-b border-slate-800 pb-3">
            {days.slice(0, 7).map((d, i) => (
              <div key={i} className="bg-slate-950 p-2 rounded border border-slate-800/60 text-[11px]">
                {d}
              </div>
            ))}
          </div>

          {/* Corridor Rows */}
          <div className="space-y-4">
            {corridors.slice(0, 5).map((c) => {
              const corridorBlocks = blocks.filter(b => b.corridorId === c.id);

              return (
                <div key={c.id} className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center text-xs font-mono mb-2">
                    <span className="font-bold text-sky-400">{c.code}: {c.name}</span>
                    <span className="text-slate-500">{corridorBlocks.length} Scheduled Blocks</span>
                  </div>

                  {/* Gantt Bar Slot Container */}
                  <div className="grid grid-cols-7 gap-2 min-h-[48px] relative items-center">
                    {corridorBlocks.length > 0 ? (
                      corridorBlocks.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => setSelectedBlock(b)}
                          className={`col-span-2 p-2 rounded-lg text-[10px] font-mono font-bold text-left shadow transition-all transform hover:scale-105 ${
                            b.isJointBlock ? 'bg-purple-600 text-white border border-purple-400' : 'bg-sky-600 text-white border border-sky-400'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span>{b.id}</span>
                            {b.isJointBlock && <Layers className="w-3 h-3 text-purple-200" />}
                          </div>
                          <div className="opacity-90">{b.scheduledStartTime.substring(11, 16)} - {b.scheduledEndTime.substring(11, 16)}</div>
                        </button>
                      ))
                    ) : (
                      <div className="col-span-7 text-[11px] text-slate-600 font-mono italic text-center py-2">
                        No maintenance blocks scheduled on this corridor segment.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Block Info Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
          <h3 className="text-sm font-bold text-slate-100 font-mono border-b border-slate-800 pb-3">
            BLOCK INSPECTION DETAILS
          </h3>

          {selectedBlock ? (
            <div className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <span className="text-slate-400 text-[10px]">BLOCK IDENTIFIER</span>
                <div className="text-base font-bold text-sky-400">{selectedBlock.id}</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Scheduled Slot:</span>
                  <span className="text-emerald-400 font-bold">{selectedBlock.scheduledStartTime.substring(11, 16)} - {selectedBlock.scheduledEndTime.substring(11, 16)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Duration:</span>
                  <span className="text-slate-200">{selectedBlock.durationMinutes} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Approval State:</span>
                  <span className="text-emerald-400 font-bold">{selectedBlock.approvalStatus}</span>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] block">AI RECOMMENDATION REASON:</span>
                <p className="font-sans italic text-slate-300 leading-relaxed">
                  "{selectedBlock.recommendationReason}"
                </p>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 text-center py-12">Click any block bar on the Gantt timeline to inspect.</div>
          )}
        </div>
      </div>
    </div>
  );
};
