import React, { useState } from 'react';
import { Wrench, Plus, Filter, AlertTriangle, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { MaintenanceTask, AssetDefect, Asset } from '../types';

interface TasksDefectsProps {
  tasks: MaintenanceTask[];
  defects: AssetDefect[];
  assets: Asset[];
  onCreateTask: (taskData: any) => void;
  onReportDefect: (assetId: string, defectData: any) => void;
}

export const TasksDefects: React.FC<TasksDefectsProps> = ({
  tasks,
  defects,
  assets,
  onCreateTask,
  onReportDefect,
}) => {
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [showTaskModal, setShowTaskModal] = useState<boolean>(false);
  const [showDefectModal, setShowDefectModal] = useState<boolean>(false);

  // Form states
  const [assetId, setAssetId] = useState<string>(assets[0]?.id || '');
  const [description, setDescription] = useState<string>('');
  const [criticality, setCriticality] = useState<string>('HIGH');
  const [duration, setDuration] = useState<number>(120);

  const [defectType, setDefectType] = useState<string>('Ultrasonic Flaw Defect (USFD)');
  const [severity, setSeverity] = useState<string>('CRITICAL');
  const [speedRestriction, setSpeedRestriction] = useState<number>(30);

  const filteredTasks = departmentFilter === 'ALL' ? tasks : tasks.filter(t => t.department === departmentFilter);

  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateTask({
      assetId,
      department: assets.find(a => a.id === assetId)?.department || 'ENGINEERING',
      maintenanceType: 'CORRECTIVE',
      description,
      criticality,
      estimatedDurationMinutes: Number(duration),
      requiredResources: ['Power-Block', 'Gang-1'],
    });
    setShowTaskModal(false);
    setDescription('');
  };

  const handleReportDefectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReportDefect(assetId, {
      defectType,
      description,
      severity,
      speedRestrictionKmh: Number(speedRestriction),
    });
    setShowDefectModal(false);
    setDescription('');
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-110px)]">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Wrench className="w-5 h-5 text-sky-400" />
            <span>Maintenance Tasks & Infrastructure Defects</span>
          </h2>
          <p className="text-xs text-slate-400">
            Unified maintenance requests across Engineering, Traction Distribution, and Signal & Telecom
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Department Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none font-semibold"
            >
              <option value="ALL">All Departments</option>
              <option value="ENGINEERING">Track & Engineering</option>
              <option value="TRACTION_DISTRIBUTION">Traction / OHE</option>
              <option value="SIGNAL_TELECOM">Signal & Telecom</option>
            </select>
          </div>

          {/* Action Buttons */}
          <button
            onClick={() => setShowDefectModal(true)}
            className="bg-red-600/90 hover:bg-red-500 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center space-x-1.5 shadow"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Report Defect</span>
          </button>

          <button
            onClick={() => setShowTaskModal(true)}
            className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center space-x-1.5 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>New Task Request</span>
          </button>
        </div>
      </div>

      {/* Task Queue Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
        <div className="px-5 py-3 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
          <span className="text-xs font-bold text-slate-300 font-mono">PRIORITIZED MAINTENANCE QUEUE</span>
          <span className="text-xs text-sky-400 font-mono font-bold">{filteredTasks.length} Tasks Listed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Task Code</th>
                <th className="py-3 px-4">Dept</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Priority Score</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Required Resources</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredTasks.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-sky-400">{t.taskId}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      t.department === 'ENGINEERING' ? 'bg-sky-500/20 text-sky-300 border-sky-500/30' :
                      t.department === 'TRACTION_DISTRIBUTION' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                      'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {t.department === 'ENGINEERING' ? 'TRACK/ENG' : t.department === 'TRACTION_DISTRIBUTION' ? 'OHE/TD' : 'S&T'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-200">
                    <div>{t.description}</div>
                    <div className="text-[10px] text-slate-500 font-mono">Preferred Window: {t.preferredWindowStart} - {t.preferredWindowEnd}</div>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className={`font-bold text-sm ${t.priorityScore >= 85 ? 'text-red-400' : 'text-sky-400'}`}>
                      {t.priorityScore} / 100
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">{t.estimatedDurationMinutes} mins</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {t.requiredResources.map((res, i) => (
                        <span key={i} className="bg-slate-800 text-slate-300 text-[10px] px-1.5 py-0.5 rounded border border-slate-700 font-mono">
                          {res}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      t.status === 'SCHEDULED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Creation Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <Plus className="w-5 h-5 text-sky-400" />
              <span>Create New Maintenance Request</span>
            </h3>

            <form onSubmit={handleCreateTaskSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Target Asset</label>
                <select
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-2 rounded-lg focus:outline-none focus:border-sky-500 font-mono"
                >
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.assetCode} - {a.name} ({a.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Maintenance Description</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Deep track tamping & joint bolt tightening"
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-2 rounded-lg focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Criticality</label>
                  <select
                    value={criticality}
                    onChange={(e) => setCriticality(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-2 rounded-lg"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Est. Duration (Minutes)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-2 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-500 shadow"
                >
                  Submit Maintenance Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Defect Reporting Modal */}
      {showDefectModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/40 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-red-400 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Report Critical Asset Defect</span>
            </h3>

            <form onSubmit={handleReportDefectSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Defective Asset</label>
                <select
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-2 rounded-lg font-mono"
                >
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.assetCode} - {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Defect Category</label>
                <input
                  type="text"
                  required
                  value={defectType}
                  onChange={(e) => setDefectType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-2 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-2 rounded-lg"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="SEVERE">SEVERE</option>
                    <option value="MAJOR">MAJOR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Speed Restriction (km/h)</label>
                  <input
                    type="number"
                    value={speedRestriction}
                    onChange={(e) => setSpeedRestriction(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-2 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDefectModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 shadow"
                >
                  Post Defect & Auto-Prioritize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
