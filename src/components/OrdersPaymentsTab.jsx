import React, { useState, useMemo } from 'react';
import {
  PackageCheck,
  CreditCard,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  ArrowUpDown,
  Building,
  CheckCircle,
  TrendingUp,
  ChevronRight,
  DollarSign,
  Activity
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
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend
} from 'recharts';
import KpiCard from './KpiCard';
import { formatCurrency, formatCompactNumber, formatDate } from '../utils/analytics';
import { RAW_LEADS, RAW_DEALS } from '../data/mockData';

export default function OrdersPaymentsTab({ metrics, onSelectEntity }) {
  const { orderMetrics, deltas } = metrics;
  const rawOrders = metrics.raw.orders;
  const rawPayments = metrics.raw.payments;

  const [activeSubTab, setActiveSubTab] = useState('orders'); // 'orders' | 'payments'
  const [searchQuery, setSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');

  // Enrich orders with client lead data
  const enrichedOrders = useMemo(() => {
    return rawOrders.map((o) => {
      const lead = RAW_LEADS.find((l) => l.id === o.leadId);
      const deal = RAW_DEALS.find((d) => d.id === o.dealId);
      return {
        ...o,
        company: lead?.company || 'Enterprise Client',
        dealTitle: deal?.title || 'Contract'
      };
    });
  }, [rawOrders]);

  const filteredOrders = useMemo(() => {
    return enrichedOrders.filter((o) => {
      const matchesSearch =
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.service.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        orderStatusFilter === 'All' || o.status === orderStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [enrichedOrders, searchQuery, orderStatusFilter]);

  // Enrich payments with client lead data
  const enrichedPayments = useMemo(() => {
    return rawPayments.map((p) => {
      const lead = RAW_LEADS.find((l) => l.id === p.leadId);
      return {
        ...p,
        company: lead?.company || 'Enterprise Client'
      };
    });
  }, [rawPayments]);

  const filteredPayments = useMemo(() => {
    return enrichedPayments.filter((p) => {
      const matchesSearch =
        p.paymentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        paymentStatusFilter === 'All' || p.status === paymentStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [enrichedPayments, searchQuery, paymentStatusFilter]);

  return (
    <div className="space-y-6">
      {/* 5 Orders & Payments KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <KpiCard
          title="Collected Cash"
          value={formatCurrency(orderMetrics.collectedRevenue)}
          subvalue={`${orderMetrics.collectionRate}% of Contract`}
          delta={deltas.collected}
          icon={CreditCard}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          badgeLabel="cleared payments"
        />

        <KpiCard
          title="Outstanding Balance"
          value={formatCurrency(orderMetrics.outstandingRevenue)}
          delta={deltas.outstandingRevenue}
          icon={Clock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          badgeLabel="pending + overdue"
        />

        <KpiCard
          title="Completed Orders"
          value={orderMetrics.completedOrders}
          subvalue={`Out of ${orderMetrics.totalOrders}`}
          delta={deltas.completedOrders}
          icon={PackageCheck}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          badgeLabel="delivered projects"
        />

        <KpiCard
          title="Average Progress"
          value={`${orderMetrics.avgProgress}%`}
          subvalue="Across active projects"
          icon={Activity}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          badgeLabel="fulfillment health"
        />

        <KpiCard
          title="Overdue Invoices"
          value={formatCurrency(orderMetrics.overdueRevenue)}
          subvalue="Requires immediate follow-up"
          icon={AlertTriangle}
          iconColor="text-rose-600"
          iconBg="bg-rose-50"
          badgeLabel="aging receivables"
        />
      </div>

      {/* Visual Analytics Row: Collection Trend & Order Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Payment Collection Timeline Chart */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Cash Collection Timeline
              </h3>
              <p className="text-xs text-slate-500">
                Payment inflows received and reconciled
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
              {formatCurrency(orderMetrics.collectedRevenue)} Cleared
            </span>
          </div>

          <div className="h-64 w-full">
            {orderMetrics.collectionTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={orderMetrics.collectionTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="pmtGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
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
                    formatter={(val) => [formatCurrency(val), 'Collected']}
                  />
                  <Area
                    type="monotone"
                    dataKey="collected"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#pmtGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No payment collections recorded for this timeframe.
              </div>
            )}
          </div>
        </div>

        {/* Order Fulfillment Status */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Order Delivery Status
              </h3>
              <p className="text-xs text-slate-500">
                Milestone breakdown &bull; <span className="text-blue-600 font-medium">Click slice to filter orders</span>
              </p>
            </div>
            <PackageCheck className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-64 w-full cursor-pointer">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderMetrics.orderStatusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="name"
                  onClick={(entry) => {
                    if (entry && entry.name) {
                      setActiveSubTab('orders');
                      setOrderStatusFilter(entry.name);
                    }
                  }}
                >
                  {orderMetrics.orderStatusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} Orders (Click to filter)`, name]}
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

      {/* Sub-Tabs Selector: Orders Fulfillment vs Payments Ledger */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveSubTab('orders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'orders'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Fulfillment Orders ({filteredOrders.length})
            </button>
            <button
              onClick={() => setActiveSubTab('payments')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'payments'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Payments Ledger ({filteredPayments.length})
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={activeSubTab === 'orders' ? 'Filter orders...' : 'Filter payments...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-48 sm:w-60"
              />
            </div>

            {activeSubTab === 'orders' ? (
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="All">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Under Review">Under Review</option>
                <option value="Pending Kickoff">Pending Kickoff</option>
              </select>
            ) : (
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="All">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
            )}
          </div>

        </div>

        {/* View 1: Orders Fulfillment Table */}
        {activeSubTab === 'orders' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Client & Deal Title</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 w-44">Progress</th>
                  <th className="py-3 px-4">Project Lead</th>
                  <th className="py-3 px-4 text-right">Relationship</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((ord) => (
                    <tr
                      key={ord.id}
                      onClick={() => onSelectEntity('order', ord.id)}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-blue-600">
                        {ord.orderNumber}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {ord.company}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
                          {ord.dealTitle}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {ord.service}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {formatCurrency(ord.totalAmount)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            ord.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : ord.status === 'In Progress'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{ width: `${ord.progressPercentage}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-semibold text-slate-700">
                            {ord.progressPercentage}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {ord.projectLead}
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
                      No orders match the selected criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* View 2: Payments Ledger Table */}
        {activeSubTab === 'payments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Payment #</th>
                  <th className="py-3 px-4">Client Company</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Paid Date</th>
                  <th className="py-3 px-4 text-right">Relationship</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((pmt) => (
                    <tr
                      key={pmt.id}
                      onClick={() => onSelectEntity('payment', pmt.id)}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-blue-600">
                        {pmt.paymentNumber}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {pmt.company}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {formatCurrency(pmt.amount)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {pmt.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            pmt.status === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : pmt.status === 'Pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {pmt.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {pmt.dueDate}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {pmt.paidDate ? formatDate(pmt.paidDate) : '—'}
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
                      No payment records match the selected criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
