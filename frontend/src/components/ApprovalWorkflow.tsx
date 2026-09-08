import React, { useState } from 'react';
import { CheckSquare, CheckCircle, Edit2, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { BlockPlan, MaintenanceBlock, UserRole } from '../types';

interface ApprovalWorkflowProps {
  plans: BlockPlan[];
  blocks: MaintenanceBlock[];
  userRole: UserRole;
  onModifyBlock: (planId: string, blockId: string, data: any) => Promise<any>;
  onApprovePlan: (planId: string) => Promise<any>;
  onRejectPlan: (planId: string) => Promise<any>;
}

export const ApprovalWorkflow: React.FC<ApprovalWorkflowProps> = ({
  plans,
  blocks,
  userRole,
  onModifyBlock,
  onApprovePlan,
  onRejectPlan,
}) => {
  const activePlan = plans[0];
  const [editingBlock, setEditingBlock] = useState<MaintenanceBlock | null>(null);
  const [newStartTime, setNewStartTime] = useState<string>('01:00');
  const [newEndTime, setNewEndTime] = useState<string>('04:00');

  const handleModifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePlan || !editingBlock) return;
    await onModifyBlock(activePlan.id, editingBlock.id, {
      scheduledStartTime: `${editingBlock.scheduledStartTime.substring(0, 10)} ${newStartTime}`,
      scheduledEndTime: `${editingBlock.scheduledEndTime.substring(0, 10)} ${newEndTime}`,
      approvalStatus: 'MODIFIED',
    });
    setEditingBlock(null);
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-110px)]">
      {/* Header */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2 font-mono">
            <CheckSquare className="w-5 h-5 text-sky-400" />
            <span>Block Plan Review & Approval Workflow Studio</span>
          </h2>
          <p className="text-xs text-slate-400">
            Operations Controller authority to review, modify timing, approve, or reject proposed maintenance blocks
          </p>
        </div>

        {activePlan && (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onRejectPlan(activePlan.id)}
              className="px-3 py-1.5 bg-red-600/80 hover:bg-red-500 text-white text-xs font-bold rounded-lg flex items-center space-x-1 shadow"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject Plan</span>
            </button>
            <button
              onClick={() => onApprovePlan(activePlan.id)}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center space-x-1 shadow"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approve All Blocks</span>
            </button>
          </div>
        )}
      </div>

      {/* Plan Status Overview */}
      {activePlan && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-md">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 font-mono">CURRENT PLAN FOR REVIEW</span>
              <h3 className="text-base font-bold text-slate-100">{activePlan.planName}</h3>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full font-mono ${
              activePlan.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
            }`}>
              STATUS: {activePlan.status}
            </span>
          </div>

          {/* Block Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Block ID</th>
                  <th className="py-3 px-4">Corridor</th>
                  <th className="py-3 px-4">Scheduled Window</th>
                  <th className="py-3 px-4">Pax Delays</th>
                  <th className="py-3 px-4">AI Score</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {blocks.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-sky-400">{b.id}</td>
                    <td className="py-3 px-4 text-slate-200">{b.corridorId}</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">
                      {b.scheduledStartTime.substring(11, 16)} - {b.scheduledEndTime.substring(11, 16)}
                    </td>
                    <td className="py-3 px-4">{b.expectedDelayMinutes} mins</td>
                    <td className="py-3 px-4 font-bold text-sky-400">{b.optimizationScore}/100</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        b.approvalStatus === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {b.approvalStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setEditingBlock(b);
                          setNewStartTime(b.scheduledStartTime.substring(11, 16));
                          setNewEndTime(b.scheduledEndTime.substring(11, 16));
                        }}
                        className="bg-slate-800 hover:bg-slate-700 text-sky-300 text-[11px] font-bold px-2.5 py-1 rounded border border-slate-700 inline-flex items-center space-x-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Modify Window</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modify Window Modal */}
      {editingBlock && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2 font-mono">
              <Edit2 className="w-5 h-5 text-sky-400" />
              <span>Modify Block Window ({editingBlock.id})</span>
            </h3>

            <form onSubmit={handleModifySubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">Scheduled Start Time (HH:mm)</label>
                <input
                  type="text"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Scheduled End Time (HH:mm)</label>
                <input
                  type="text"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="text-[11px] text-amber-300 bg-amber-950/40 p-2.5 rounded border border-amber-500/30">
                Modifying the time slot will trigger instant recalculation of passenger train conflicts, expected delays, and optimization score.
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBlock(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-500 shadow"
                >
                  Save & Recalculate Score
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
