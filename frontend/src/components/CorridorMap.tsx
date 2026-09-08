import React, { useState } from 'react';
import { MapPin, Activity, AlertTriangle, ShieldCheck, Wrench, Train, Clock, CheckCircle } from 'lucide-react';
import { Asset, Corridor } from '../types';

interface CorridorMapProps {
  assets: Asset[];
  corridors: Corridor[];
}

export const CorridorMap: React.FC<CorridorMapProps> = ({ assets, corridors }) => {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(assets[0] || null);
  const [selectedCorridorId, setSelectedCorridorId] = useState<string>('c-01');

  const filteredAssets = assets.filter(a => a.corridorId === selectedCorridorId);
  const activeCorridor = corridors.find(c => c.id === selectedCorridorId) || corridors[0];

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-110px)]">
      {/* Header & Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-sky-400" />
            <span>Synthetic Railway Network Corridor Map</span>
          </h2>
          <p className="text-xs text-slate-400">
            Interactive topology & asset condition visualizer across Indian Railways main trunk lines
          </p>
        </div>

        {/* Corridor Picker */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-medium">SELECT CORRIDOR:</span>
          <select
            value={selectedCorridorId}
            onChange={(e) => {
              setSelectedCorridorId(e.target.value);
              const firstAsset = assets.find(a => a.corridorId === e.target.value);
              if (firstAsset) setSelectedAsset(firstAsset);
            }}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg focus:outline-none focus:border-sky-500 font-mono"
          >
            {corridors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}: {c.name} ({c.lengthKm} km)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Interactive Canvas Track Line & Details Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Track Line Topology Visualization */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <div className="text-sm font-bold text-sky-400 font-mono">{activeCorridor.code}</div>
              <div className="text-xs font-semibold text-slate-200">{activeCorridor.name}</div>
            </div>
            <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono">
              <span className="bg-slate-800 px-2 py-1 rounded">Tracks: {activeCorridor.totalTracks} Line</span>
              <span className="bg-slate-800 px-2 py-1 rounded">Length: {activeCorridor.lengthKm} KM</span>
            </div>
          </div>

          {/* Interactive Synthetic Track Node Map Diagram */}
          <div className="relative bg-slate-950 rounded-xl p-8 border border-slate-800/80 min-h-[300px] flex flex-col justify-center space-y-12 overflow-x-auto">
            {/* Legend Bar */}
            <div className="flex items-center space-x-6 text-[11px] font-mono text-slate-400 border-b border-slate-800/60 pb-3">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span>Normal Condition (&gt;70)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span>Warning (40-70)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                <span>Critical / Defect (&lt;40)</span>
              </div>
            </div>

            {/* Track Line 1: UP LINE */}
            <div className="space-y-2">
              <div className="text-[10px] font-mono font-bold text-slate-400 tracking-wider">UP MAIN LINE</div>
              <div className="relative flex items-center justify-between">
                {/* Horizontal Rail Bar */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-700 -translate-y-1/2 rounded"></div>

                {/* Station Start */}
                <div className="relative z-10 bg-sky-950 border border-sky-500 text-sky-300 text-xs font-bold px-3 py-1.5 rounded-lg shadow">
                  {activeCorridor.startStation}
                </div>

                {/* Corridor Assets Nodes */}
                {filteredAssets.map((ast) => {
                  const isSelected = selectedAsset?.id === ast.id;
                  const isCritical = ast.conditionScore < 45 || ast.hasDefect;
                  const color = isCritical ? 'bg-red-500 text-white shadow-red-500/50' : ast.conditionScore < 70 ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950';

                  return (
                    <button
                      key={ast.id}
                      onClick={() => setSelectedAsset(ast)}
                      className={`relative z-10 p-2.5 rounded-xl font-mono text-xs font-bold flex flex-col items-center space-y-1 transition-all transform hover:scale-110 shadow-lg ${color} ${
                        isSelected ? 'ring-4 ring-sky-400 scale-110' : ''
                      }`}
                    >
                      <span className="text-[10px] opacity-90">{ast.assetCode}</span>
                      <span className="text-[9px] font-normal">{ast.assetType}</span>
                      {ast.hasDefect && (
                        <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-0.5 animate-bounce">
                          <AlertTriangle className="w-3 h-3" />
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* Station End */}
                <div className="relative z-10 bg-sky-950 border border-sky-500 text-sky-300 text-xs font-bold px-3 py-1.5 rounded-lg shadow">
                  {activeCorridor.endStation}
                </div>
              </div>
            </div>

            {/* Track Line 2: DOWN LINE */}
            <div className="space-y-2 opacity-80">
              <div className="text-[10px] font-mono font-bold text-slate-400 tracking-wider">DOWN MAIN LINE</div>
              <div className="relative flex items-center justify-between">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 rounded"></div>
                <div className="relative z-10 bg-slate-800 text-slate-300 text-xs font-semibold px-3 py-1 rounded">
                  {activeCorridor.startStation}
                </div>
                <div className="text-xs text-slate-500 font-mono">Continuous Signal & OHE Overhead Feeders</div>
                <div className="relative z-10 bg-slate-800 text-slate-300 text-xs font-semibold px-3 py-1 rounded">
                  {activeCorridor.endStation}
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-400 flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span>Click on any asset node above to inspect asset health, USFD defects, and block recommendations.</span>
            <span className="font-mono text-sky-400 font-semibold">{filteredAssets.length} Assets Found</span>
          </div>
        </div>

        {/* Right Drawer: Selected Asset Detail Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col justify-between">
          {selectedAsset ? (
            <div className="space-y-5">
              <div className="border-b border-slate-800 pb-3 flex justify-between items-start">
                <div>
                  <div className="text-xs font-mono font-bold text-sky-400">{selectedAsset.assetCode}</div>
                  <h3 className="text-base font-bold text-slate-100">{selectedAsset.name}</h3>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                  selectedAsset.criticality === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                }`}>
                  {selectedAsset.criticality}
                </span>
              </div>

              {/* Specs List */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">DEPARTMENT</span>
                  <span className="font-semibold text-slate-200">{selectedAsset.department}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">ASSET TYPE</span>
                  <span className="font-semibold text-slate-200">{selectedAsset.assetType}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 col-span-2">
                  <span className="text-slate-400 block text-[10px]">LOCATION</span>
                  <span className="font-mono font-semibold text-slate-200">{selectedAsset.location}</span>
                </div>
              </div>

              {/* Health & Availability Meters */}
              <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">Condition Score</span>
                    <span className={`font-mono font-bold ${selectedAsset.conditionScore < 50 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {selectedAsset.conditionScore} / 100
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${selectedAsset.conditionScore < 50 ? 'bg-red-500' : 'bg-emerald-500'}`}
                      style={{ width: `${selectedAsset.conditionScore}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">Historical Availability</span>
                    <span className="font-mono text-sky-400 font-bold">{selectedAsset.availability}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-sky-500 h-2 rounded-full" style={{ width: `${selectedAsset.availability}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Defect Warning if present */}
              {selectedAsset.hasDefect ? (
                <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-3 text-xs text-red-200 space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>ACTIVE DEFECT ALERT DETECTED</span>
                  </div>
                  <p className="text-[11px] text-red-300">
                    USFD / Wear defect reported. Speed restriction imposed on this track section. Urgent block scheduling required.
                  </p>
                </div>
              ) : (
                <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-200 flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>No active defects reported on this asset.</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-500 p-8 text-center">Select an asset from the corridor map to inspect.</div>
          )}
        </div>
      </div>
    </div>
  );
};
