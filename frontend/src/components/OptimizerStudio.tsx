import React, { useState } from 'react';
import { Cpu, Play, Sliders, CheckCircle2, AlertTriangle, Sparkles, Layers, ArrowRight } from 'lucide-react';
import { BlockPlan, MaintenanceBlock, OptimizationWeight } from '../types';

interface OptimizerStudioProps {
  plans: BlockPlan[];
  blocks: MaintenanceBlock[];
  weights: OptimizationWeight;
  onGeneratePlan: (horizon: 'WEEKLY' | 'MONTHLY') => void;
  onUpdateWeights: (newWeights: any) => void;
  isOptimizing: boolean;
}

export const OptimizerStudio: React.FC<OptimizerStudioProps> = ({
  plans,
  blocks,
  weights,
  onGeneratePlan,
  onUpdateWeights,
  isOptimizing,
}) => {
  const [horizon, setHorizon] = useState<'WEEKLY' | 'MONTHLY'>('WEEKLY');
  const [showWeightsModal, setShowWeightsModal] = useState<boolean>(false);

  // Weights Form state
  const [tempWeights, setTempWeights] = useState({ ...weights });

  const activePlan = plans[0];

  const handleWeightsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateWeights(tempWeights);
    setShowWeightsModal(false);
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-110px)]">
      {/* Top Banner Control Panel */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950/60 to-slate-900 border border-sky-500/40 rounded-2xl p-6 shadow-xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="bg-sky-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
              AUTOMATIC BLOCK PLANNING ENGINE
            </span>
            <h2 className="text-xl font-black text-slate-100 flex items-center space-x-2">
              <span>AI Multi-Objective Optimization Studio</span>
              <Sparkles className="w-5 h-5 text-sky-400 animate-pulse" />
            </h2>
          </div>
          <p className="text-xs text-slate-300">
            Integrates TMS defects, OHE telemetry, train schedules, and COA corridor windows to output non-conflicting schedules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Horizon Selector */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setHorizon('WEEKLY')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                horizon === 'WEEKLY' ? 'bg-sky-600 text-white font-bold shadow' : 'text-slate-400'
              }`}
            >
              WEEKLY PLAN
            </button>
            <button
              onClick={() => setHorizon('MONTHLY')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                horizon === 'MONTHLY' ? 'bg-sky-600 text-white font-bold shadow' : 'text-slate-400'
              }`}
            >
              MONTHLY PLAN
            </button>
          </div>

          {/* Configurable Weights Button */}
          <button
            onClick={() => setShowWeightsModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold px-3 py-2 rounded-lg flex items-center space-x-1.5"
          >
            <Sliders className="w-4 h-4 text-sky-400" />
            <span>Configure Objective Weights</span>
          </button>

          {/* Generate Button */}
          <button
            onClick={() => onGeneratePlan(horizon)}
            disabled={isOptimizing}
            className="bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white text-xs font-bold px-5 py-2.5 rounded-lg flex items-center space-x-2 shadow-lg shadow-sky-600/30 disabled:opacity-50 transition-all transform active:scale-95"
          >
            <Cpu className="w-4 h-4" />
            <span>{isOptimizing ? 'RUNNING PYTHON SOLVER...' : `GENERATE ${horizon} BLOCK PLAN`}</span>
          </button>
        </div>
      </div>

      {/* Generated Plan Overview Score Card */}
      {activePlan && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">ACTIVE BLOCK PLAN CONTAINER</span>
              <h3 className="text-base font-bold text-slate-100">{activePlan.planName}</h3>
            </div>
            <div className="flex items-center space-x-3 font-mono">
              <span className="text-xs text-slate-400">Total Score:</span>
              <span className="text-xl font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/20">
                {activePlan.totalOptimizationScore} / 100
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">TOTAL BLOCKS GENERATED</span>
              <span className="text-lg font-bold text-sky-400">{activePlan.metrics.totalBlocks} Blocks</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">JOINT DEPARTMENTAL BLOCKS</span>
              <span className="text-lg font-bold text-purple-400">{activePlan.metrics.jointBlocksCount} Merged Blocks</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">ESTIMATED TRAIN DELAY</span>
              <span className="text-lg font-bold text-emerald-400">{activePlan.metrics.totalDelayMinutes} Minutes</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">BLOCK UTILIZATION</span>
              <span className="text-lg font-bold text-emerald-400">{activePlan.metrics.blockUtilizationPercent}%</span>
            </div>
          </div>
        </div>
      )}

      {/* AI Block Recommendation Rationale Cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2 font-mono">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>AI AUTOMATIC BLOCK RECOMMENDATIONS ({blocks.length})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {blocks.map((b) => (
            <div
              key={b.id}
              className={`bg-slate-900 border rounded-2xl p-5 space-y-4 shadow-md relative transition-all hover:border-sky-500/50 ${
                b.isJointBlock ? 'border-purple-500/40 bg-gradient-to-tr from-slate-900 to-purple-950/20' : 'border-slate-800'
              }`}
            >
              {/* Joint Block Badge */}
              {b.isJointBlock && (
                <span className="absolute top-4 right-4 bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-purple-500/40 flex items-center space-x-1">
                  <Layers className="w-3 h-3 text-purple-400" />
                  <span>JOINT DEPARTMENT BLOCK</span>
                </span>
              )}

              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-xs font-mono">
                  <span className="font-bold text-sky-400">{b.id}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300 font-semibold">{b.corridorId}</span>
                </div>
                <div className="text-sm font-bold text-slate-100 font-mono">
                  Recommended Slot: <span className="text-emerald-400">{b.scheduledStartTime.substring(11, 16)} - {b.scheduledEndTime.substring(11, 16)}</span> ({b.durationMinutes} mins)
                </div>
              </div>

              {/* Rationale Quote Card */}
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 text-xs text-slate-300 space-y-1">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block font-mono">
                  AI RECOMMENDATION RATIONALE:
                </span>
                <p className="italic text-slate-300 font-sans leading-relaxed">
                  "{b.recommendationReason}"
                </p>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-300">
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[9px]">PAX TRAINS</span>
                  <span className="font-bold text-emerald-400">{b.affectedPassengerTrains} Affected</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[9px]">PAX DELAY</span>
                  <span className="font-bold text-emerald-400">{b.expectedDelayMinutes} Min</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[9px]">AI SCORE</span>
                  <span className="font-bold text-sky-400">{b.optimizationScore} / 100</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Configurable Objective Weights Modal */}
      {showWeightsModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg space-y-5 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-sky-400" />
              <span>Configure AI Optimization Weights</span>
            </h3>
            <p className="text-xs text-slate-400">
              Adjust objective function parameters used by the Python solver engine.
            </p>

            <form onSubmit={handleWeightsSubmit} className="space-y-4 text-xs font-mono">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Asset Criticality Weight:</span>
                    <span className="text-sky-400 font-bold">{tempWeights.assetCriticalityWeight}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={tempWeights.assetCriticalityWeight}
                    onChange={(e) => setTempWeights({ ...tempWeights, assetCriticalityWeight: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Maintenance Urgency Weight:</span>
                    <span className="text-sky-400 font-bold">{tempWeights.maintenanceUrgencyWeight}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={tempWeights.maintenanceUrgencyWeight}
                    onChange={(e) => setTempWeights({ ...tempWeights, maintenanceUrgencyWeight: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Train Impact Penalty Weight:</span>
                    <span className="text-sky-400 font-bold">{tempWeights.trainImpactWeight}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={tempWeights.trainImpactWeight}
                    onChange={(e) => setTempWeights({ ...tempWeights, trainImpactWeight: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Passenger Delay Penalty Weight:</span>
                    <span className="text-sky-400 font-bold">{tempWeights.delayWeight}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={tempWeights.delayWeight}
                    onChange={(e) => setTempWeights({ ...tempWeights, delayWeight: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowWeightsModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-500 shadow"
                >
                  Save & Apply Weights
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
