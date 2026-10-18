import React, { useState, useMemo } from 'react';
import {
  Users,
  UserCheck,
  Award,
  UserX,
  Target,
  Search,
  Filter,
  ArrowUpDown,
  Building,
  Mail,
  Phone,
  Layers,
  ChevronRight
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
import { formatDate } from '../utils/analytics';
import { LEAD_SOURCES } from '../data/mockData';

export default function LeadAnalyticsTab({ metrics, onSelectEntity }) {
  const { leadMetrics, deltas } = metrics;
  const rawLeads = metrics.raw.leads;

  const [leadSearch, setLeadSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [sortField, setSortField] = useState('createdAt');
  const [sortAsc, setSortAsc] = useState(false);

  // Filter and sort leads table
  const filteredLeads = useMemo(() => {
    return rawLeads
      .filter((lead) => {
        const matchesSearch =
          lead.name.toLowerCase().includes(leadSearch.toLowerCase()) ||
          lead.company.toLowerCase().includes(leadSearch.toLowerCase()) ||
          lead.email.toLowerCase().includes(leadSearch.toLowerCase());
        const matchesStatus =
          statusFilter === 'All' || lead.status === statusFilter;
        const matchesSource =
          sourceFilter === 'All' || lead.source === sourceFilter;
        return matchesSearch && matchesStatus && matchesSource;
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
  }, [rawLeads, leadSearch, statusFilter, sourceFilter, sortField, sortAsc]);

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
      {/* 5 Compact Lead KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <KpiCard
          title="Total Leads"
          value={leadMetrics.totalLeads}
          delta={deltas.leads}
          icon={Users}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          badgeLabel="vs prev period"
        />

        <KpiCard
          title="Qualified Leads"
          value={leadMetrics.qualifiedLeads}
          delta={deltas.conversionRate}
          icon={UserCheck}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          badgeLabel="verified need"
        />

        <KpiCard
          title="Converted Leads"
          value={leadMetrics.convertedLeads}
          delta={deltas.wonDeals}
          icon={Award}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          badgeLabel="became customers"
        />

        <KpiCard
          title="Unqualified"
          value={leadMetrics.unqualifiedLeads}
          icon={UserX}
          iconColor="text-slate-500"
          iconBg="bg-slate-100"
          badgeLabel="out of scope"
        />

        <KpiCard
          title="Conversion Rate"
          value={`${leadMetrics.conversionRate}%`}
          subvalue={`${leadMetrics.convertedLeads}/${leadMetrics.totalLeads}`}
          delta={deltas.conversionRate}
          icon={Target}
          iconColor="text-cyan-600"
          iconBg="bg-cyan-50"
          badgeLabel="funnel efficacy"
        />
      </div>

      {/* Visual Analytics Row: Funnel Chart & Source Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Lead Funnel Chart */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Lead Progression Funnel
              </h3>
              <p className="text-xs text-slate-500">
                Stage progression &bull; <span className="text-blue-600 font-medium">Click bars to filter table below</span>
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
              {leadMetrics.conversionRate}% Win Ratio
            </span>
          </div>

          <div className="h-64 w-full cursor-pointer">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={leadMetrics.funnel}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                onClick={(state) => {
                  if (state && state.activeLabel) {
                    if (state.activeLabel.includes('Qualified')) setStatusFilter('Qualified');
                    else if (state.activeLabel.includes('Converted')) setStatusFilter('Converted');
                    else setStatusFilter('All');
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="stage"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#1e293b', fontSize: 11, fontWeight: 500 }}
                  width={110}
                />
                <Tooltip
                  formatter={(val, name, props) => [`${val} Leads (${props.payload.dropoff}) - Click to filter`, 'Volume']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px'
                  }}
                />
                <Bar
                  dataKey="count"
                  radius={[0, 6, 6, 0]}
                  fill="#2563eb"
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Source Breakdown Chart */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Leads by Acquisition Channel
              </h3>
              <p className="text-xs text-slate-500">
                Distribution &bull; <span className="text-blue-600 font-medium">Click slice to filter source</span>
              </p>
            </div>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-64 w-full cursor-pointer">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leadMetrics.sourceChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="source"
                  onClick={(entry) => {
                    if (entry && entry.source) {
                      setSourceFilter(entry.source);
                    }
                  }}
                >
                  {leadMetrics.sourceChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} className="hover:opacity-80 transition-opacity" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} Leads (Click to filter)`, name]}
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

      {/* Interactive Leads Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter table leads..."
                value={leadSearch}
                onChange={(e) => setLeadSearch(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-48 sm:w-60"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Qualified">Qualified</option>
              <option value="Converted">Converted</option>
              <option value="Unqualified">Unqualified</option>
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Sources</option>
              {LEAD_SOURCES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredLeads.length} of {rawLeads.length} leads
          </span>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th
                  onClick={() => toggleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Contact & Company</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('source')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Source</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('status')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Assigned Rep</th>
                <th
                  onClick={() => toggleSort('createdAt')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Created Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Relationship</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => onSelectEntity('lead', lead.id)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {lead.name}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3 text-slate-400" />
                          {lead.company}
                        </span>
                        <span>&bull;</span>
                        <span>{lead.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium">
                        {lead.source}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          lead.status === 'Converted'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : lead.status === 'Qualified'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {lead.assignedTo}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {formatDate(lead.createdAt)}
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
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No leads found matching current filters.
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
