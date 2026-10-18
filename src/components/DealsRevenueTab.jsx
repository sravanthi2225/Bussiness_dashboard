import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Briefcase,
  TrendingUp,
  Percent,
  Search,
  Filter,
  ArrowUpDown,
  Building,
  CheckCircle,
  Clock,
  Layers,
  ChevronRight,
  Flame,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell
} from 'recharts';
import KpiCard from './KpiCard';
import { formatCurrency, formatCompactNumber, formatDate } from '../utils/analytics';
import { SERVICES, RAW_LEADS } from '../data/mockData';

export default function DealsRevenueTab({ metrics, onSelectEntity }) {
  const { dealMetrics, orderMetrics, deltas } = metrics;
  const rawDeals = metrics.raw.deals;

  const [dealSearch, setDealSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [sortField, setSortField] = useState('totalValue');
  const [sortAsc, setSortAsc] = useState(false);

  // Enrich deals with lead data
  const enrichedDeals = useMemo(() => {
    return rawDeals.map((d) => {
      const lead = RAW_LEADS.find((l) => l.id === d.leadId);
      return {
        ...d,
        company: lead?.company || 'Enterprise Client',
        contactName: lead?.name || 'Primary Contact'
      };
    });
  }, [rawDeals]);

  const filteredDeals = useMemo(() => {
    return enrichedDeals
      .filter((d) => {
        const matchesSearch =
          d.dealNumber.toLowerCase().includes(dealSearch.toLowerCase()) ||
          d.title.toLowerCase().includes(dealSearch.toLowerCase()) ||
          d.company.toLowerCase().includes(dealSearch.toLowerCase()) ||
          d.service.toLowerCase().includes(dealSearch.toLowerCase());
        const matchesPriority =
          priorityFilter === 'All' || d.priority === priorityFilter;
        const matchesService =
          serviceFilter === 'All' || d.service === serviceFilter;
        return matchesSearch && matchesPriority && matchesService;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') {
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortAsc ? valA - valB : valB - valA;
      });
  }, [enrichedDeals, dealSearch, priorityFilter, serviceFilter, sortField, sortAsc]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 5 Deals & Revenue KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <KpiCard
          title="Total Contract Revenue"
          value={formatCurrency(dealMetrics.totalRevenue)}
          delta={deltas.revenue}
          icon={DollarSign}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          badgeLabel="vs prev period"
        />

        <KpiCard
          title="Collected Revenue"
          value={formatCurrency(orderMetrics.collectedRevenue)}
          subvalue={`${orderMetrics.collectionRate}% Realized`}
          delta={deltas.collected}
          icon={CheckCircle}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          badgeLabel="cash in bank"
        />

        <KpiCard
          title="Outstanding Balance"
          value={formatCurrency(orderMetrics.outstandingRevenue)}
          delta={deltas.outstandingRevenue}
          icon={Clock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          badgeLabel="receivables"
        />

        <KpiCard
          title="Deals Won"
          value={dealMetrics.wonDealsCount}
          subvalue={`Out of ${dealMetrics.totalDeals}`}
          delta={deltas.wonDeals}
          icon={Award}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          badgeLabel="closed contracts"
        />

        <KpiCard
          title="Win Rate"
          value={`${dealMetrics.winRate}%`}
          subvalue={`Avg ${formatCurrency(dealMetrics.averageDealSize)}`}
          icon={Percent}
          iconColor="text-cyan-600"
          iconBg="bg-cyan-50"
          badgeLabel="pipeline velocity"
        />
      </div>

      {/* Visual Analytics Row: Daily Revenue Trends & Service Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Revenue Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Daily Revenue Realization Trend
              </h3>
              <p className="text-xs text-slate-500">
                Daily closed won deal contract amounts
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
              {dealMetrics.wonDealsCount} Successful Closings
            </span>
          </div>

          <div className="h-64 w-full">
            {dealMetrics.dailyRevenueTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dealMetrics.dailyRevenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dealsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
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
                    fill="url(#dealsGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No revenue entries recorded for this timeframe.
              </div>
            )}
          </div>
        </div>

        {/* Priority Breakdown & Top Deal Sizes */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Deal Priority & Focus
                </h3>
                <p className="text-xs text-slate-500">
                  Active tier allocation for sales reps
                </p>
              </div>
              <Flame className="w-4 h-4 text-rose-500" />
            </div>

            <div className="space-y-3 mt-3">
              {dealMetrics.dealsByPriority.map((p) => {
                const total = dealMetrics.totalDeals || 1;
                const pct = Math.round((p.count / total) * 100);
                const priorityKey = p.name.replace(' Priority', '');
                const isActive = priorityFilter === priorityKey;

                return (
                  <div
                    key={p.name}
                    onClick={() => {
                      setPriorityFilter(isActive ? 'All' : priorityKey);
                    }}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isActive
                        ? 'border-blue-500 bg-blue-50/70 shadow-xs ring-1 ring-blue-400'
                        : 'border-slate-100 bg-slate-50/60 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill }} />
                        {p.name}
                      </span>
                      <span className="font-bold text-slate-900">{p.count} Deals ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: p.fill }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>Average Closing Size:</span>
            <span className="font-bold text-slate-900">{formatCurrency(dealMetrics.averageDealSize)}</span>
          </div>
        </div>

      </div>

      {/* Interactive Deals Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search deals, company, title..."
                value={dealSearch}
                onChange={(e) => setDealSearch(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-48 sm:w-60"
              />
            </div>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>

            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Services</option>
              {SERVICES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredDeals.length} of {rawDeals.length} deals
          </span>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Deal ID</th>
                <th className="py-3 px-4">Title & Client</th>
                <th className="py-3 px-4">Service</th>
                <th
                  onClick={() => toggleSort('totalValue')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Contract Value</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Deal Owner</th>
                <th className="py-3 px-4 text-right">Relationship</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredDeals.length > 0 ? (
                filteredDeals.map((deal) => (
                  <tr
                    key={deal.id}
                    onClick={() => onSelectEntity('deal', deal.id)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-blue-600">
                      {deal.dealNumber}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {deal.title}
                      </p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-slate-400" />
                        {deal.company}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {deal.service}
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
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {deal.owner}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:underline">
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    No deals match the selected criteria.
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
