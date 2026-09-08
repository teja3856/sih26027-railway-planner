import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  Wrench,
  TrainTrack,
  Activity,
  Cpu,
  CalendarDays,
  CalendarRange,
  SlidersHorizontal,
  CheckSquare,
  FileSpreadsheet,
  History,
  AlertOctagon,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'corridor-map'
  | 'tasks-defects'
  | 'timetable-freight'
  | 'corridor-availability'
  | 'optimizer'
  | 'weekly-planner'
  | 'monthly-planner'
  | 'simulator'
  | 'approval'
  | 'reports'
  | 'audit';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  conflictsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, conflictsCount }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Operations Dashboard', icon: LayoutDashboard, category: 'OVERVIEW' },
    { id: 'corridor-map', label: 'Corridor Network Map', icon: MapPin, category: 'OVERVIEW' },
    { id: 'tasks-defects', label: 'Tasks & Defects', icon: Wrench, category: 'MAINTENANCE' },
    { id: 'timetable-freight', label: 'Timetable & Freight', icon: TrainTrack, category: 'TRAFFIC' },
    { id: 'corridor-availability', label: 'Corridor Capacity', icon: Activity, category: 'TRAFFIC' },
    { id: 'optimizer', label: 'Block Planning Engine', icon: Cpu, category: 'AI OPTIMIZATION', highlight: true },
    { id: 'weekly-planner', label: 'Weekly Schedule', icon: CalendarDays, category: 'PLANNING' },
    { id: 'monthly-planner', label: 'Monthly Schedule', icon: CalendarRange, category: 'PLANNING' },
    { id: 'simulator', label: 'What-If Simulation', icon: SlidersHorizontal, category: 'PLANNING' },
    { id: 'approval', label: 'Block Approval Studio', icon: CheckSquare, category: 'WORKFLOW' },
    { id: 'reports', label: 'Analytics & Reports', icon: FileSpreadsheet, category: 'SYSTEM' },
    { id: 'audit', label: 'Audit History Logs', icon: History, category: 'SYSTEM' },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
      <div className="p-4 space-y-1 overflow-y-auto flex-1">
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const showCategoryHeader = idx === 0 || menuItems[idx - 1].category !== item.category;

          return (
            <React.Fragment key={item.id}>
              {showCategoryHeader && (
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 pt-3 pb-1">
                  {item.category}
                </div>
              )}

              <button
                onClick={() => onTabChange(item.id as TabType)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-sky-600/90 text-white shadow-md shadow-sky-600/20'
                    : item.highlight
                    ? 'bg-sky-950/60 text-sky-300 border border-sky-600/40 hover:bg-sky-900/60'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.id === 'optimizer' && conflictsCount > 0 && (
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold border border-amber-500/40">
                    AI
                  </span>
                )}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-500 space-y-1">
        <div className="flex justify-between items-center text-slate-400 font-medium">
          <span>Engine Status:</span>
          <span className="text-emerald-400 font-mono font-bold flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>OPTIMIZER READY</span>
          </span>
        </div>
        <div className="text-[10px] text-slate-500 font-mono">
          Python FastAPI + Express Gateway
        </div>
      </div>
    </aside>
  );
};
