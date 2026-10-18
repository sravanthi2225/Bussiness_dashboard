import React, { useState } from 'react';
import {
  Calendar,
  Download,
  Search,
  BarChart3,
  TrendingUp,
  ArrowRight,
  Filter,
  CheckCircle2,
  X
} from 'lucide-react';
import { formatDate } from '../utils/analytics';

export default function Header({
  activeFilter,
  setActiveFilter,
  customStart,
  setCustomStart,
  customEnd,
  setCustomEnd,
  boundaries,
  searchQuery,
  setSearchQuery,
  onOpenExport
}) {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [tempStart, setTempStart] = useState(customStart || '2026-10-01');
  const [tempEnd, setTempEnd] = useState(customEnd || '2026-10-18');

  const handleApplyCustom = () => {
    setCustomStart(tempStart);
    setCustomEnd(tempEnd);
    setActiveFilter('custom');
    setShowCustomPicker(false);
  };

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
      {/* Top Banner with Brand, Search, Export & Profile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & System Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-slate-900 font-sans">
                  Nexus<span className="text-blue-600">Revenue</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                  Enterprise OS
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Business Performance & Revenue Analytics
              </p>
            </div>
          </div>

          {/* Quick Search across leads, quotes, deals, orders */}
          <div className="flex-1 max-w-md mx-auto md:mx-6 w-full">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search leads, companies, quotes, deals, invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Action buttons: Export & User avatar */}
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onOpenExport}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-semibold shadow-2xs hover:bg-slate-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Report</span>
            </button>

            <div className="h-6 w-px bg-slate-200" />

            <div className="flex items-center space-x-2 pl-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                AM
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-slate-800 leading-none">
                  Alex Morgan
                </p>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                  VP Revenue Operations
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Date Filter Bar & Comparison Context */}
      <div className="bg-slate-50/80 border-t border-slate-200/70 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Preset Buttons */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-semibold text-slate-500 mr-2 flex items-center gap-1 flex-shrink-0">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              Timeframe:
            </span>

            {[
              { id: 'today', label: 'Today' },
              { id: 'last7', label: 'Last 7 Days' },
              { id: 'last30', label: 'Last 30 Days' }
            ].map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setActiveFilter(preset.id);
                  setShowCustomPicker(false);
                }}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex-shrink-0 ${
                  activeFilter === preset.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {preset.label}
              </button>
            ))}

            <button
              onClick={() => setShowCustomPicker(!showCustomPicker)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                activeFilter === 'custom'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Filter className="w-3 h-3" />
              <span>
                {activeFilter === 'custom' && customStart && customEnd
                  ? `Custom (${customStart.slice(5)} to ${customEnd.slice(5)})`
                  : 'Custom Range'}
              </span>
            </button>
          </div>

          {/* Period Context Badge */}
          {boundaries && (
            <div className="flex items-center text-xs text-slate-600 bg-white px-3 py-1 rounded-md border border-slate-200 shadow-2xs flex-wrap gap-1">
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
                {formatDate(boundaries.current.start)} – {formatDate(boundaries.current.end)}
              </span>
              <span className="text-slate-400 font-normal mx-1">compared to</span>
              <span className="text-slate-500 font-medium">
                {formatDate(boundaries.previous.start)} – {formatDate(boundaries.previous.end)}
              </span>
            </div>
          )}

        </div>

        {/* Custom Date Range Popover */}
        {showCustomPicker && (
          <div className="max-w-7xl mx-auto mt-2.5 p-3.5 bg-white rounded-xl border border-slate-200 shadow-md animate-in fade-in slide-in-from-top-1">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              
              {/* Date pickers */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-1.5">
                  <label className="text-xs font-bold text-slate-700">Start Date:</label>
                  <input
                    type="date"
                    value={tempStart}
                    onChange={(e) => setTempStart(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center space-x-1.5">
                  <label className="text-xs font-bold text-slate-700">End Date:</label>
                  <input
                    type="date"
                    value={tempEnd}
                    onChange={(e) => setTempEnd(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleApplyCustom}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors"
                >
                  Apply Custom Range
                </button>
              </div>

              {/* Quick shortcut presets */}
              <div className="flex items-center space-x-1.5 overflow-x-auto text-[11px]">
                <span className="text-slate-400 font-medium">Quick select:</span>
                <button
                  onClick={() => {
                    setTempStart('2026-10-01');
                    setTempEnd('2026-10-18');
                    setCustomStart('2026-10-01');
                    setCustomEnd('2026-10-18');
                    setActiveFilter('custom');
                    setShowCustomPicker(false);
                  }}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Oct 1 - Oct 18
                </button>
                <button
                  onClick={() => {
                    setTempStart('2026-09-01');
                    setTempEnd('2026-09-30');
                    setCustomStart('2026-09-01');
                    setCustomEnd('2026-09-30');
                    setActiveFilter('custom');
                    setShowCustomPicker(false);
                  }}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  September 2026
                </button>
                <button
                  onClick={() => {
                    setTempStart('2026-08-20');
                    setTempEnd('2026-09-18');
                    setCustomStart('2026-08-20');
                    setCustomEnd('2026-09-18');
                    setActiveFilter('custom');
                    setShowCustomPicker(false);
                  }}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Previous 30 Days
                </button>
                <button
                  onClick={() => setShowCustomPicker(false)}
                  className="px-2 py-0.5 text-slate-400 hover:text-slate-600 ml-1"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </header>
  );
}
