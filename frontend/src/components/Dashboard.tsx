import React from 'react';
import {
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Train,
  Zap,
  Activity,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
} from 'recharts';

interface DashboardProps {
  data: any;
  onNavigate: (tab: any) => void;
  onRunDemo: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, onNavigate, onRunDemo }) => {
  if (!data) return <div className="p-8 text-slate-400">Loading Operational Dashboard...</div>;

  const { kpis, departmentBreakdown, availabilityTimeline, trafficByHour, beforeVsAfter } = data;

  const kpiCards = [
    { title: 'Total Fixed Assets', value: kpis.totalAssets, subtitle: 'Eng, Traction, S&T', icon: Activity, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
    { title: 'Asset Availability', value: `${kpis.assetAvailabilityPercent}%`, subtitle: 'Target: >95.0%', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { title: 'Critical Assets', value: kpis.criticalAssets, subtitle: 'High Priority Track/OHE', icon: ShieldCheck, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { title: 'Pending Tasks', value: kpis.pendingMaintenance, subtitle: 'Requests awaiting schedule', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { title: 'Overdue Defects', value: kpis.overdueMaintenance, subtitle: 'USFD / OHE wear alerts', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
    { title: 'Active Blocks', value: kpis.activeBlocks, subtitle: 'COA Approved Blocks', icon: CheckCircle2, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
  ];

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-110px)]">
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className={`p-4 rounded-xl border ${kpi.bg} backdrop-blur-sm shadow-sm space-y-1`}>
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>{kpi.title}</span>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <div className={`text-2xl font-black font-mono tracking-tight ${kpi.color}`}>
                {kpi.value}
              </div>
              <p className="text-[11px] text-slate-400">{kpi.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* CORE HIGHLIGHT: BEFORE VS AFTER OPTIMIZATION COMPARISON CARD */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-sky-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-sky-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
                MAIN INNOVATION DEMO
              </span>
              <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                <span>Data-Driven Optimization Impact</span>
                <Sparkles className="w-4 h-4 text-sky-400" />
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Comparison between Naive Decentralized Planning vs AI Automatic Block Planning System
            </p>
          </div>

          <button
            onClick={onRunDemo}
            className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center space-x-2 shadow-lg shadow-sky-600/30 transition-all self-start lg:self-auto"
          >
            <span>RE-RUN OPTIMIZER DEMO</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Metric Comparisons Side-by-Side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: Total Passenger Train Delay */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 min-w-0 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 block truncate">Total Passenger Delay</span>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5 font-mono">
              <div className="min-w-0">
                <span className="text-[10px] text-red-400 block font-bold uppercase tracking-wider">BEFORE</span>
                <div className="text-red-400 font-bold line-through leading-tight">
                  <span className="text-base">{beforeVsAfter.before.totalDelayMinutes}</span>{' '}
                  <span className="text-xs font-normal">min</span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0 mx-auto" />
              <div className="min-w-0 text-right">
                <span className="text-[10px] text-emerald-400 block font-bold uppercase tracking-wider">AFTER (AI)</span>
                <div className="text-emerald-400 font-black leading-tight">
                  <span className="text-xl font-black">{beforeVsAfter.after.totalDelayMinutes}</span>{' '}
                  <span className="text-xs font-semibold">min</span>
                </div>
              </div>
            </div>
            <div className="text-[10px] sm:text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 text-center leading-tight">
              ↓ {Math.round(((beforeVsAfter.before.totalDelayMinutes - beforeVsAfter.after.totalDelayMinutes) / beforeVsAfter.before.totalDelayMinutes) * 100)}% Delay Reduction
            </div>
          </div>

          {/* Metric 2: Affected Passenger Trains */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 min-w-0 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 block truncate">Affected Passenger Trains</span>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5 font-mono">
              <div className="min-w-0">
                <span className="text-[10px] text-red-400 block font-bold uppercase tracking-wider">BEFORE</span>
                <div className="text-red-400 font-bold line-through leading-tight">
                  <span className="text-base">{beforeVsAfter.before.affectedTrainsCount}</span>{' '}
                  <span className="text-xs font-normal">Trains</span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0 mx-auto" />
              <div className="min-w-0 text-right">
                <span className="text-[10px] text-emerald-400 block font-bold uppercase tracking-wider">AFTER (AI)</span>
                <div className="text-emerald-400 font-black leading-tight">
                  <span className="text-xl font-black">{beforeVsAfter.after.affectedTrainsCount}</span>{' '}
                  <span className="text-xs font-semibold">Trains</span>
                </div>
              </div>
            </div>
            <div className="text-[10px] sm:text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 text-center leading-tight">
              ↓ {beforeVsAfter.before.affectedTrainsCount - beforeVsAfter.after.affectedTrainsCount} Fewer Interrupted Trains
            </div>
          </div>

          {/* Metric 3: Total Asset Downtime Hours */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 min-w-0 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 block truncate">Corridor Downtime Hours</span>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5 font-mono">
              <div className="min-w-0">
                <span className="text-[10px] text-red-400 block font-bold uppercase tracking-wider">BEFORE</span>
                <div className="text-red-400 font-bold line-through leading-tight">
                  <span className="text-base">{beforeVsAfter.before.assetDowntimeHours}</span>{' '}
                  <span className="text-xs font-normal">hrs</span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0 mx-auto" />
              <div className="min-w-0 text-right">
                <span className="text-[10px] text-emerald-400 block font-bold uppercase tracking-wider">AFTER (AI)</span>
                <div className="text-emerald-400 font-black leading-tight">
                  <span className="text-xl font-black">{beforeVsAfter.after.assetDowntimeHours}</span>{' '}
                  <span className="text-xs font-semibold">hrs</span>
                </div>
              </div>
            </div>
            <div className="text-[10px] sm:text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 text-center leading-tight">
              Joint Block Coordination Efficiency
            </div>
          </div>

          {/* Metric 4: Schedule Conflicts */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 min-w-0 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 block truncate">Schedule Conflicts</span>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5 font-mono">
              <div className="min-w-0">
                <span className="text-[10px] text-red-400 block font-bold uppercase tracking-wider">BEFORE</span>
                <div className="text-red-400 font-bold line-through leading-tight">
                  <span className="text-base">{beforeVsAfter.before.conflictCount}</span>{' '}
                  <span className="text-xs font-normal">Conflicts</span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0 mx-auto" />
              <div className="min-w-0 text-right">
                <span className="text-[10px] text-emerald-400 block font-bold uppercase tracking-wider">AFTER (AI)</span>
                <div className="text-emerald-400 font-black leading-tight">
                  <span className="text-xl font-black">{beforeVsAfter.after.conflictCount}</span>{' '}
                  <span className="text-xs font-semibold">Conflicts</span>
                </div>
              </div>
            </div>
            <div className="text-[10px] sm:text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 text-center leading-tight">
              100% Conflict Resolution
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Asset Availability Timeline */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-md">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              <span>Asset Availability Trend (%) - Manual vs Automatic Planning</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Corridor C001 to C010</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={availabilityTimeline}>
                <defs>
                  <linearGradient id="colorOptimized" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOriginal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[80, 100]} stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="optimized" name="AI Automatic Block Plan (%)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorOptimized)" />
                <Area type="monotone" dataKey="original" name="Manual Planning Baseline (%)" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorOriginal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Maintenance Tasks by Department */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-md flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <span>Tasks by Department</span>
            </h3>
          </div>

          <div className="space-y-4">
            {/* Engineering */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-sky-300">Engineering (Track / Bridges)</span>
                <span className="font-mono text-sky-400">{departmentBreakdown.ENGINEERING} Tasks</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-2.5 rounded-full" style={{ width: `${(departmentBreakdown.ENGINEERING / (kpis.pendingMaintenance || 1)) * 100}%` }}></div>
              </div>
            </div>

            {/* Traction Distribution */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-purple-300">Traction Distribution (OHE)</span>
                <span className="font-mono text-purple-400">{departmentBreakdown.TRACTION_DISTRIBUTION} Tasks</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${(departmentBreakdown.TRACTION_DISTRIBUTION / (kpis.pendingMaintenance || 1)) * 100}%` }}></div>
              </div>
            </div>

            {/* Signal & Telecom */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-amber-300">Signal & Telecommunication</span>
                <span className="font-mono text-amber-400">{departmentBreakdown.SIGNAL_TELECOM} Tasks</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: `${(departmentBreakdown.SIGNAL_TELECOM / (kpis.pendingMaintenance || 1)) * 100}%` }}></div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('optimizer')}
            className="w-full py-2 bg-sky-950 hover:bg-sky-900 border border-sky-700/50 text-sky-300 text-xs font-bold rounded-lg flex items-center justify-center space-x-2 transition-all mt-4"
          >
            <span>GO TO BLOCK PLANNING ENGINE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
