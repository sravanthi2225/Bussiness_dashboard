import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function KpiCard({
  title,
  value,
  subvalue,
  delta,
  icon: Icon,
  iconColor = 'text-blue-600',
  iconBg = 'bg-blue-50',
  badgeLabel = 'vs prev period',
  tooltip,
  onClick
}) {
  const isUp = delta?.direction === 'up';
  const isDown = delta?.direction === 'down';
  const isFlat = !isUp && !isDown;

  return (
    <div
      onClick={onClick}
      className={`kpi-card bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:border-blue-300 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            {title}
          </p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">
              {value}
            </h3>
            {subvalue && (
              <span className="text-xs font-medium text-slate-500">
                {subvalue}
              </span>
            )}
          </div>
        </div>
        <div className={`p-2.5 rounded-lg ${iconBg} ${iconColor} flex-shrink-0`}>
          {Icon && <Icon className="w-5 h-5 stroke-[2.2]" />}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center space-x-1.5">
          {delta && (
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                isUp
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : isDown
                  ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {isUp && <TrendingUp className="w-3.5 h-3.5" />}
              {isDown && <TrendingDown className="w-3.5 h-3.5" />}
              {isFlat && <Minus className="w-3.5 h-3.5" />}
              {delta.formatted}
            </span>
          )}
          <span className="text-xs text-slate-500 truncate max-w-[140px]">
            {badgeLabel}
          </span>
        </div>
        {tooltip && (
          <span className="text-[11px] text-slate-400 font-medium">
            {tooltip}
          </span>
        )}
      </div>
    </div>
  );
}
