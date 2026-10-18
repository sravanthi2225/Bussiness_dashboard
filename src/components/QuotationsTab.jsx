import React, { useState, useMemo } from 'react';
import {
  FileText,
  DollarSign,
  CheckCircle2,
  Percent,
  Search,
  Filter,
  ArrowUpDown,
  Building,
  Layers,
  ChevronRight,
  Clock,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend
} from 'recharts';
import KpiCard from './KpiCard';
import { formatCurrency, formatCompactNumber, formatDate } from '../utils/analytics';
import { SERVICES, RAW_LEADS } from '../data/mockData';

export default function QuotationsTab({ metrics, onSelectEntity }) {
  const { quoteMetrics, deltas } = metrics;
  const rawQuotations = metrics.raw.quotations;

  const [quoteSearch, setQuoteSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortField, setSortField] = useState('value');
  const [sortAsc, setSortAsc] = useState(false);

  // Map lead info onto quotations for search and display
  const enrichedQuotes = useMemo(() => {
    return rawQuotations.map((q) => {
      const lead = RAW_LEADS.find((l) => l.id === q.leadId);
      return {
        ...q,
        leadName: lead?.name || 'Unknown Lead',
        company: lead?.company || 'N/A'
      };
    });
  }, [rawQuotations]);

  const filteredQuotes = useMemo(() => {
    return enrichedQuotes
      .filter((q) => {
        const matchesSearch =
          q.quoteNumber.toLowerCase().includes(quoteSearch.toLowerCase()) ||
          q.company.toLowerCase().includes(quoteSearch.toLowerCase()) ||
          q.service.toLowerCase().includes(quoteSearch.toLowerCase());
        const matchesService =
          serviceFilter === 'All' || q.service === serviceFilter;
        const matchesStatus =
          statusFilter === 'All' || q.status === statusFilter;
        return matchesSearch && matchesService && matchesStatus;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') {
          return sortAsc
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }
        return sortAsc ? valA - valB : valB - valA;
      });
  }, [enrichedQuotes, quoteSearch, serviceFilter, statusFilter, sortField, sortAsc]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const avgQuoteValue =
    quoteMetrics.totalQuotes > 0
      ? Math.round(quoteMetrics.totalQuoteValue / quoteMetrics.totalQuotes)
      : 0;

  return (
    <div className="space-y-6">
      {/* 4 Compact Quotation KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Quotations Issued"
          value={quoteMetrics.totalQuotes}
          subvalue={`${quoteMetrics.acceptedQuotes} Accepted`}
          delta={deltas.wonDeals}
          icon={FileText}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          badgeLabel="issued proposals"
        />

        <KpiCard
          title="Total Proposal Value"
          value={formatCurrency(quoteMetrics.totalQuoteValue)}
          subvalue={`Avg ${formatCurrency(avgQuoteValue)}`}
          delta={deltas.quotesValue}
          icon={DollarSign}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          badgeLabel="pipeline value"
        />

        <KpiCard
          title="Accepted Quotations"
          value={quoteMetrics.acceptedQuotes}
          subvalue={`${quoteMetrics.quoteToDealRate}% Win Rate`}
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          badgeLabel="signed contracts"
        />

        <KpiCard
          title="Quote-to-Deal Conversion"
          value={`${quoteMetrics.quoteToDealRate}%`}
          subvalue="Target: 60%"
          icon={Percent}
          iconColor="text-cyan-600"
          iconBg="bg-cyan-50"
          badgeLabel="conversion velocity"
        />
      </div>

      {/* Visual Analytics Row: Quotation Value by Service & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Quotation Value by Service */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Quotation Value by Offering
              </h3>
              <p className="text-xs text-slate-500">
                Monetary value proposed across technology practices
              </p>
            </div>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-64 w-full cursor-pointer">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={quoteMetrics.quotesByService.filter(s => s.totalValue > 0)}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                onClick={(state) => {
                  if (state && state.activeLabel) {
                    setServiceFilter(state.activeLabel);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="service"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(val) => `₹${formatCompactNumber(val)}`}
                />
                <Tooltip
                  formatter={(val) => [formatCurrency(val) + ' (Click to filter)', 'Total Proposed']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px'
                  }}
                />
                <Bar
                  dataKey="totalValue"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  barSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quotation Status Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Quotation Status Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Tracking proposals &bull; <span className="text-blue-600 font-medium">Click slice to filter status</span>
              </p>
            </div>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-64 w-full cursor-pointer">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={quoteMetrics.statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                  onClick={(entry) => {
                    if (entry && entry.name) {
                      setStatusFilter(entry.name);
                    }
                  }}
                >
                  {quoteMetrics.statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} Proposals (Click to filter)`, name]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Interactive Quotation History & Drilldown Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search quotes, client, service..."
                value={quoteSearch}
                onChange={(e) => setQuoteSearch(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-48 sm:w-60"
              />
            </div>

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

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Accepted">Accepted</option>
              <option value="Under Review">Under Review</option>
              <option value="Sent">Sent</option>
              <option value="Draft">Draft</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredQuotes.length} quotations
          </span>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Quote #</th>
                <th className="py-3 px-4">Client Lead & Company</th>
                <th className="py-3 px-4">Service</th>
                <th
                  onClick={() => toggleSort('value')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Value</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Version</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Valid Until</th>
                <th className="py-3 px-4 text-right">Relationship</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredQuotes.length > 0 ? (
                filteredQuotes.map((q) => (
                  <tr
                    key={q.id}
                    onClick={() => onSelectEntity('quotation', q.id)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-blue-600">
                      {q.quoteNumber}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {q.company}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {q.leadName}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {q.service}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {formatCurrency(q.value)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      {q.version}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          q.status === 'Accepted'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : q.status === 'Under Review'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : q.status === 'Sent'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : q.status === 'Draft'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {q.validUntil}
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
                    No quotations match the selected criteria.
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
