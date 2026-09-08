import React, { useState } from 'react';
import { SlidersHorizontal, Play, ArrowRight, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { MaintenanceBlock } from '../types';

interface SimulatorSandboxProps {
  blocks: MaintenanceBlock[];
  onSimulate: (payload: any) => Promise<any>;
}

export const SimulatorSandbox: React.FC<SimulatorSandboxProps> = ({ blocks, onSimulate }) => {
  const [selectedBlockId, setSelectedBlockId] = useState<string>(blocks[0]?.id || '');
  const [newStartTime, setNewStartTime] = useState<string>('01:30');
  const [newDuration, setNewDuration] = useState<number>(150);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  const handleSimulateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    try {
      const res = await onSimulate({
        blockId: selectedBlockId,
        newStartTime,
        newDurationMinutes: Number(newDuration),
      });
      setResult(res.data);
    } catch (err) {
      console.error('Simulation failed', err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-110px)]">
      {/* Header */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2 font-mono">
            <SlidersHorizontal className="w-5 h-5 text-sky-400" />
            <span>Interactive What-If Maintenance Block Simulation Sandbox</span>
          </h2>
          <p className="text-xs text-slate-400">
            Simulate operational impact when modifying block timings, maintenance duration, or corridor windows
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Parameter Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-5">
          <h3 className="text-sm font-bold text-slate-100 font-mono border-b border-slate-800 pb-3">
            SIMULATION PARAMETERS
          </h3>

          <form onSubmit={handleSimulateSubmit} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-slate-400 mb-1">Target Maintenance Block</label>
              <select
                value={selectedBlockId}
                onChange={(e) => setSelectedBlockId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-sky-500"
              >
                {blocks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.id} ({b.corridorId} - Current: {b.scheduledStartTime.substring(11, 16)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Proposed Start Time Slot</label>
              <input
                type="text"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                placeholder="e.g. 01:30 or 11:30"
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-sky-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Night slot 01:00-04:00 gives minimal passenger train impact</span>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Proposed Duration (Minutes)</label>
              <input
                type="number"
                value={newDuration}
                onChange={(e) => setNewDuration(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-sky-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSimulating}
              className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg flex items-center justify-center space-x-2 shadow-lg shadow-sky-600/30 transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{isSimulating ? 'SIMULATING IMPACT...' : 'RUN WHAT-IF SIMULATION'}</span>
            </button>
          </form>
        </div>

        {/* Right Output: Side-by-Side Comparison */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-6 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-100 font-mono border-b border-slate-800 pb-3 flex justify-between items-center">
            <span>SIMULATION DELTA COMPARISON RESULTS</span>
            {result && (
              <span className={`text-xs px-2.5 py-1 rounded font-bold ${result.improvement.isBetter ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                {result.improvement.isBetter ? 'OPTIMAL ADJUSTMENT' : 'SUBOPTIMAL WINDOW WARNING'}
              </span>
            )}
          </h3>

          {result ? (
            <div className="space-y-6">
              {/* Side-by-Side Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Current Baseline Plan */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 font-mono">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-2">
                    CURRENT BASELINE PLAN
                  </span>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Affected Passenger Trains:</span>
                      <span className="text-slate-200 font-bold">{result.currentPlan.affectedTrainsCount} Trains</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Expected Passenger Delay:</span>
                      <span className="text-slate-200 font-bold">{result.currentPlan.totalDelayMinutes} Min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Corridor Downtime:</span>
                      <span className="text-slate-200 font-bold">{result.currentPlan.assetDowntimeHours} Hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Schedule Conflicts:</span>
                      <span className="text-amber-400 font-bold">{result.currentPlan.conflictCount}</span>
                    </div>
                  </div>
                </div>

                {/* Proposed Plan */}
                <div className="bg-slate-950 border border-sky-500/40 rounded-xl p-4 space-y-3 font-mono shadow-inner">
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block border-b border-slate-800 pb-2">
                    PROPOSED SIMULATED PLAN
                  </span>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Affected Passenger Trains:</span>
                      <span className="text-emerald-400 font-bold">{result.proposedPlan.affectedTrainsCount} Trains</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Expected Passenger Delay:</span>
                      <span className="text-emerald-400 font-bold">{result.proposedPlan.totalDelayMinutes} Min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Corridor Downtime:</span>
                      <span className="text-sky-400 font-bold">{result.proposedPlan.assetDowntimeHours} Hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Schedule Conflicts:</span>
                      <span className="text-emerald-400 font-bold">{result.proposedPlan.conflictCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Improvement Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-xl text-center space-y-1 font-mono">
                  <span className="text-xs text-emerald-400 block font-semibold">PASSENGER DELAY REDUCTION</span>
                  <span className="text-2xl font-black text-emerald-400">{result.improvement.delayReductionPercent}%</span>
                </div>
                <div className="bg-sky-950/40 border border-sky-500/30 p-4 rounded-xl text-center space-y-1 font-mono">
                  <span className="text-xs text-sky-400 block font-semibold">ASSET AVAILABILITY GAIN</span>
                  <span className="text-2xl font-black text-sky-400">+{result.improvement.availabilityImprovementPercent}%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 text-center py-16">
              Adjust start time slot or duration on the left form and click "Run What-If Simulation" to generate delta comparison.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
