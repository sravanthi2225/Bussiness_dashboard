import React from 'react';
import {
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle,
  FileText,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  Building,
  CreditCard,
  Layers
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import KpiCard from './KpiCard';
import { formatCurrency, formatCompactNumber, formatDate } from '../utils/analytics';

export default function ExecutiveOverviewTab({ metrics, onSelectEntity, onNavigateTab }) {
  const { leadMetrics, quoteMetrics, dealMetrics, orderMetrics, deltas } = metrics;

  return (
    <div className="space-y-6">
      {/* Top Level Strategic KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Contract Revenue"
          value={formatCurrency(dealMetrics.totalRevenue)}
          subvalue={`${dealMetrics.wonDealsCount} Won Deals`}
          delta={deltas.revenue}
          icon={DollarSign}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          tooltip="Closed won contract value"
          onClick={() => onNavigateTab('deals')}
        />

        <KpiCard
          title="Collected Revenue"
          value={formatCurrency(orderMetrics.collectedRevenue)}
          subvalue={`${orderMetrics.collectionRate}% of Total`}
          delta={deltas.collected}
          icon={CheckCircle}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          tooltip="Cash cleared in bank"
          onClick={() => onNavigateTab('orders')}
        />

        <KpiCard
          title="Total Pipeline Leads"
          value={leadMetrics.totalLeads}
          subvalue={`${leadMetrics.conversionRate}% Win Rate`}
          delta={deltas.leads}
          icon={Users}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          tooltip="Active inbound & outbound inquiries"
          onClick={() => onNavigateTab('leads')}
        />

        <KpiCard
          title="Outstanding Receivables"
          value={formatCurrency(orderMetrics.outstandingRevenue)}
          subvalue={`${orderMetrics.inProgressOrders} Active Orders`}
          delta={deltas.outstandingRevenue}
          icon={AlertCircle}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          tooltip="Pending & overdue milestone balances"
          onClick={() => onNavigateTab('orders')}
        />
      </div>

      {/* Main Charts Row: Revenue Growth Trajectory & Service Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Revenue Trend Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Revenue Trajectory & Daily Closings
              </h3>
              <p className="text-xs text-slate-500">
                Value of closed won deals over the selected timeframe
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
              Avg Deal: {formatCurrency(dealMetrics.averageDealSize)}
            </span>
          </div>

          <div className="h-64 w-full">
            {dealMetrics.dailyRevenueTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dealMetrics.dailyRevenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickFormatter={(val) => `₹${formatCompactNumber(val)}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      fontSize: '12px'
                    }}
                    formatter={(val) => [formatCurrency(val), 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No deal closing events recorded for this timeframe.
              </div>
            )}
          </div>
        </div>

        {/* Revenue Distribution by Service */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Revenue by Service
                </h3>
                <p className="text-xs text-slate-500">
                  Performance across core enterprise offerings
                </p>
              </div>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-3 mt-2">
              {dealMetrics.revenueByService
                .filter(s => s.revenue > 0)
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 5)
                .map((srv, idx) => {
                  const share = dealMetrics.totalRevenue > 0
                    ? Math.round((srv.revenue / dealMetrics.totalRevenue) * 100)
                    : 0;
                  return (
                    <div key={srv.service} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700 truncate max-w-[190px]">
                          {srv.service}
                        </span>
                        <span className="font-semibold text-slate-900">
                          {formatCurrency(srv.revenue)} ({share}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${share}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Total Active Services:</span>
            <span className="font-semibold text-slate-800">
              {dealMetrics.revenueByService.filter(s => s.revenue > 0).length} Offerings
            </span>
          </div>
        </div>

      </div>

      {/* Second Row: Lead Funnel & Order Milestones Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Lead Funnel Snapshot */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Lead Conversion Funnel
              </h3>
              <p className="text-xs text-slate-500">
                Pipeline conversion rate at {leadMetrics.conversionRate}%
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('leads')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              <span>Lead Details</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-2">
            {leadMetrics.funnel.map((step, idx) => (
              <div
                key={step.stage}
                className="bg-slate-50 border border-slate-200/70 rounded-lg p-3 text-center"
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block truncate">
                  {step.stage}
                </span>
                <span className="text-xl font-bold text-slate-900 block my-1">
                  {step.count}
                </span>
                <span className="inline-block text-[11px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">
                  {step.dropoff}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50/50 rounded-lg border border-blue-100 flex items-center justify-between text-xs">
            <span className="text-slate-600">
              <strong>{leadMetrics.qualifiedLeads}</strong> leads currently qualified for enterprise deployment
            </span>
            <span className="font-semibold text-blue-700">
              {leadMetrics.unqualifiedLeads} unqualified filtered
            </span>
          </div>
        </div>

        {/* Order Fulfillment & Collections Snapshot */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Fulfillment & Cash Collections
              </h3>
              <p className="text-xs text-slate-500">
                Tracking delivery progress and cash realization
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              <span>View Ledger</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4 pt-1">
            {/* Overall Delivery Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Overall Milestone Progress</span>
                <span className="font-bold text-blue-600">{orderMetrics.avgProgress}% Complete</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${orderMetrics.avgProgress}%` }}
                />
              </div>
            </div>

            {/* Quick Metrics Columns */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100">
                <span className="text-[11px] font-medium text-emerald-800 block">Completed</span>
                <span className="text-lg font-bold text-emerald-700">{orderMetrics.completedOrders} Orders</span>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100">
                <span className="text-[11px] font-medium text-blue-800 block">In Progress</span>
                <span className="text-lg font-bold text-blue-700">{orderMetrics.inProgressOrders} Active</span>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-100">
                <span className="text-[11px] font-medium text-amber-800 block">Pending Invoices</span>
                <span className="text-lg font-bold text-amber-700">{formatCurrency(orderMetrics.pendingRevenue)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Strategic Deals Table with Clickable Relationships */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Recent Enterprise Deals in this Period
            </h3>
            <p className="text-xs text-slate-500">
              Click any deal to inspect connected leads, quotes, orders, and payments
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing {metrics.raw.deals.length} deals
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Deal ID</th>
                <th className="py-3 px-4">Deal Title & Service</th>
                <th className="py-3 px-4">Value</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {metrics.raw.deals.length > 0 ? (
                metrics.raw.deals.map((deal) => (
                  <tr
                    key={deal.id}
                    onClick={() => onSelectEntity('deal', deal.id)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-blue-600">
                      {deal.dealNumber}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {deal.title}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {deal.service}
                      </p>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {formatCurrency(deal.totalValue)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          deal.priority === 'High'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : deal.priority === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {deal.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="w-3 h-3" />
                        {deal.stage}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {deal.owner}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-xs font-semibold text-blue-600 group-hover:underline">
                        View Chain &rarr;
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No deals match the selected timeframe.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
