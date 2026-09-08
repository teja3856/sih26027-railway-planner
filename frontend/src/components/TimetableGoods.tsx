import React, { useState } from 'react';
import { TrainTrack, Truck, Search, Calendar, ShieldAlert } from 'lucide-react';
import { TrainSchedule, GoodsTrainForecast } from '../types';

interface TimetableGoodsProps {
  schedules: TrainSchedule[];
  freightForecasts: GoodsTrainForecast[];
}

export const TimetableGoods: React.FC<TimetableGoodsProps> = ({ schedules, freightForecasts }) => {
  const [activeSubTab, setActiveSubTab] = useState<'TIMETABLE' | 'FREIGHT'>('TIMETABLE');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredSchedules = schedules.filter(
    s => s.trainName.toLowerCase().includes(searchQuery.toLowerCase()) || s.trainNumber.includes(searchQuery)
  );

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-110px)]">
      {/* Subtab Toggle Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveSubTab('TIMETABLE')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center space-x-2 ${
              activeSubTab === 'TIMETABLE'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrainTrack className="w-4 h-4" />
            <span>Passenger Train Timetable ({schedules.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('FREIGHT')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center space-x-2 ${
              activeSubTab === 'FREIGHT'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Goods Train Forecast ({freightForecasts.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search train name/no..."
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs pl-9 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-sky-500 w-64"
          />
        </div>
      </div>

      {activeSubTab === 'TIMETABLE' ? (
        /* Passenger Timetable Table */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Train No</th>
                  <th className="py-3 px-4">Train Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Origin / Destination</th>
                  <th className="py-3 px-4">Arr / Dep Time</th>
                  <th className="py-3 px-4">Frequency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredSchedules.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-sky-400">{s.trainNumber}</td>
                    <td className="py-3 px-4 font-bold text-slate-100">{s.trainName}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        s.trainType === 'SUPERFAST' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                        s.trainType === 'EXPRESS' ? 'bg-sky-500/20 text-sky-300 border-sky-500/30' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {s.trainType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {s.origin} ➔ {s.destination}
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                      {s.arrivalTime} / {s.departureTime}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {s.isDaily ? 'DAILY' : s.dayOfWeek}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Goods Train Forecast Matrix */
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-md">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Freight Rake Corridor Traffic Forecast</h3>
              <p className="text-xs text-slate-400">Used by Optimizer engine to pinpoint non-conflicting maintenance windows</p>
            </div>
            <span className="text-xs bg-sky-950 text-sky-300 px-2.5 py-1 rounded border border-sky-800 font-mono">
              24-Hour Forecast
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {freightForecasts.map((f) => (
              <div key={f.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs font-bold text-sky-400">{f.corridorId}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    f.trafficLevel === 'LOW' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                    f.trafficLevel === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                    'bg-red-500/20 text-red-300 border-red-500/30'
                  }`}>
                    {f.trafficLevel} TRAFFIC
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-200 font-mono">Slot: {f.timeSlot}</div>
                <div className="text-xs text-slate-400 font-mono">
                  Expected Freight Rakes: <strong className="text-slate-100">{f.expectedTrainsCount} Rakes</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
