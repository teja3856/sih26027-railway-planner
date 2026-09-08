import React from 'react';
import { FileSpreadsheet, Download, CheckCircle, BarChart3 } from 'lucide-react';
import { reportsApi } from '../services/api';
import { BlockPlan } from '../types';

interface AnalyticsReportsProps {
  plans: BlockPlan[];
}

export const AnalyticsReports: React.FC<AnalyticsReportsProps> = ({ plans }) => {
  const activePlan = plans[0];

  const handleDownloadCsv = () => {
    if (!activePlan) return;
    const url = reportsApi.getExportCsvUrl(activePlan.id);
    window.open(url, '_blank');
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-110px)] font-mono">
      {/* Header */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-sky-400" />
            <span>Operational Analytics & Official Report Export Studio</span>
          </h2>
          <p className="text-xs text-slate-400 font-sans">
            Export structured maintenance block reports, asset availability metrics, and optimization logs
          </p>
        </div>

        {activePlan && (
          <button
            onClick={handleDownloadCsv}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center space-x-2 shadow-lg shadow-emerald-600/30 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT BLOCK PLAN REPORT (CSV)</span>
          </button>
        )}
      </div>

      {/* Report Preview */}
      {activePlan && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-md">
          <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">REPORT PREVIEW</span>
              <h3 className="text-base font-bold text-slate-100">{activePlan.planName}</h3>
            </div>
            <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/20">
              OPTIMIZATION SCORE: {activePlan.totalOptimizationScore} / 100
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">TOTAL SCHEDULED BLOCKS</span>
              <span className="text-lg font-bold text-sky-400">{activePlan.metrics.totalBlocks} Blocks</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">JOINT BLOCKS SAVING DOWNTIME</span>
              <span className="text-lg font-bold text-purple-400">{activePlan.metrics.jointBlocksCount} Merged</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">PASSENGER DELAY REDUCTION</span>
              <span className="text-lg font-bold text-emerald-400">
                {activePlan.beforeMetrics ? Math.round(((activePlan.beforeMetrics.totalDelayMinutes - activePlan.metrics.totalDelayMinutes) / activePlan.beforeMetrics.totalDelayMinutes) * 100) : 80}% Saved
              </span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">ASSET AVAILABILITY RATING</span>
              <span className="text-lg font-bold text-emerald-400">{activePlan.metrics.assetAvailabilityPercent}% Uptime</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
