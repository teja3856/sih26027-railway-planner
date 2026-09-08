import React from 'react';
import { History, Shield, User, Clock } from 'lucide-react';
import { AuditLog } from '../types';

interface AuditLogsProps {
  logs: AuditLog[];
}

export const AuditLogs: React.FC<AuditLogsProps> = ({ logs }) => {
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
          {logs.length} Audit Entries Recorded
        </span>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity Type</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 text-slate-400">{log.timestamp}</td>
                  <td className="py-3 px-4 font-bold text-sky-400">{log.username}</td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {log.userRole}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-400">{log.action}</td>
                  <td className="py-3 px-4 text-slate-400">{log.entityType}</td>
                  <td className="py-3 px-4 text-slate-200">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
