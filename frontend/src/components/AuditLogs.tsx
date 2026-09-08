import React from 'react';
import { History, Shield, User, Clock, CheckCircle2, AlertTriangle, Cpu, FileText, Wrench } from 'lucide-react';
import { AuditLog } from '../types';

interface AuditLogsProps {
  logs: AuditLog[];
}

export const AuditLogs: React.FC<AuditLogsProps> = ({ logs }) => {
  // Sort logs strictly newest-first (descending timestamp)
  const sortedLogs = [...logs].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime() || 0;
    const timeB = new Date(b.timestamp).getTime() || 0;
    return timeB - timeA;
  });

  const getActionBadge = (action: string) => {
    if (action.includes('LOGIN_FAILED') || action.includes('REJECT')) {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
    if (action.includes('OPTIMIZATION') || action.includes('SIMULAT')) {
      return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    }
    if (action.includes('APPROVED') || action.includes('LOGIN_SUCCESS')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
    if (action.includes('TASK') || action.includes('DEFECT')) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
    if (action.includes('REPORT') || action.includes('EXPORT')) {
      return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    }
    if (action.includes('SYSTEM')) {
      return 'bg-slate-500/10 text-slate-300 border-slate-700';
    }
    return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-110px)] font-mono">
      {/* Header */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <History className="w-5 h-5 text-sky-400" />
            <span>Immutable System Audit History Logs</span>
          </h2>
          <p className="text-xs text-slate-400 font-sans">
            Complete traceability trail for all user actions, optimization executions, and block approvals
          </p>
        </div>
        <span className="text-xs bg-sky-950 text-sky-300 font-bold px-3 py-1 rounded border border-sky-800">
          {sortedLogs.length} Audit Entries Recorded
        </span>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 whitespace-nowrap">Timestamp</th>
                <th className="py-3 px-4 whitespace-nowrap">User</th>
                <th className="py-3 px-4 whitespace-nowrap">Role</th>
                <th className="py-3 px-4 whitespace-nowrap">Action</th>
                <th className="py-3 px-4 whitespace-nowrap">Entity Type</th>
                <th className="py-3 px-4 min-w-[300px]">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {sortedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-3 px-4 font-bold text-sky-400 whitespace-nowrap">{log.username}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {log.userRole}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${getActionBadge(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap font-semibold">{log.entityType}</td>
                  <td className="py-3 px-4 text-slate-200 break-words leading-relaxed">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
