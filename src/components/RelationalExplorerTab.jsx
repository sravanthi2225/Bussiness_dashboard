import React, { useState } from 'react';
import {
  GitBranch,
  Building,
  User,
  FileText,
  Briefcase,
  PackageCheck,
  CreditCard,
  ArrowRight,
  CheckCircle,
  Clock,
  Layers,
  ChevronDown
} from 'lucide-react';
import { RAW_LEADS } from '../data/mockData';
import { getEntityRelationships, formatCurrency, formatDate } from '../utils/analytics';

export default function RelationalExplorerTab({ onSelectEntity }) {
  const [selectedLeadId, setSelectedLeadId] = useState(RAW_LEADS[0].id);

  const lineage = getEntityRelationships('lead', selectedLeadId);
  const { lead, quotations, deals, orders, payments } = lineage;

  const totalQuoted = quotations.reduce((s, q) => s + (q.value || 0), 0);
  const totalDealValue = deals.reduce((s, d) => s + (d.totalValue || 0), 0);
  const totalCollected = payments.filter(p => p.status === 'Paid').reduce((s, p) => s + (p.amount || 0), 0);
  const totalOutstanding = payments.filter(p => p.status !== 'Paid').reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Lead Selector & Relationship Explainer Banner */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <GitBranch className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Relational Pipeline & Lifecycle Explorer
                </h3>
                <p className="text-xs text-slate-500">
                  Inspect how 1 Lead branches into multiple Quotations, Deals, Orders, and Payment Milestones
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <label className="text-xs font-semibold text-slate-600">Select Client Account:</label>
            <div className="relative">
              <select
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                {RAW_LEADS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.company} ({l.name})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Financial Flow Rollup across this relationship */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100">
            <span className="text-[11px] font-medium text-blue-800 block">Total Quoted Value</span>
            <span className="text-lg font-bold text-blue-900">{formatCurrency(totalQuoted)}</span>
            <span className="text-[10px] text-blue-600 block mt-0.5">{quotations.length} Quotation(s)</span>
          </div>

          <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-100">
            <span className="text-[11px] font-medium text-indigo-800 block">Contracted Deals</span>
            <span className="text-lg font-bold text-indigo-900">{formatCurrency(totalDealValue)}</span>
            <span className="text-[10px] text-indigo-600 block mt-0.5">{deals.length} Won Deal(s)</span>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100">
            <span className="text-[11px] font-medium text-emerald-800 block">Cash Collected</span>
            <span className="text-lg font-bold text-emerald-900">{formatCurrency(totalCollected)}</span>
            <span className="text-[10px] text-emerald-600 block mt-0.5">Cleared via {payments.filter(p => p.status === 'Paid').length} pmt(s)</span>
          </div>

          <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-100">
            <span className="text-[11px] font-medium text-amber-800 block">Outstanding Balance</span>
            <span className="text-lg font-bold text-amber-900">{formatCurrency(totalOutstanding)}</span>
            <span className="text-[10px] text-amber-600 block mt-0.5">{payments.filter(p => p.status !== 'Paid').length} Pending / Overdue</span>
          </div>
        </div>
      </div>

      {/* Relational Hierarchy Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Level 1: Client Lead Account */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              1. Lead Account
            </span>
            <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
              Source
            </span>
          </div>

          {lead && (
            <div
              onClick={() => onSelectEntity('lead', lead.id)}
              className="bg-white rounded-xl border-2 border-blue-500/40 p-4 shadow-sm hover:border-blue-600 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900">{lead.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {lead.status}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-700 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {lead.company}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">{lead.title}</p>
              
              <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
                <div>Source: <span className="font-semibold text-slate-800">{lead.source}</span></div>
                <div>Owner: <span className="font-semibold text-slate-800">{lead.assignedTo}</span></div>
              </div>
              <div className="mt-3 text-right">
                <span className="text-[11px] font-semibold text-blue-600 hover:underline">
                  Inspect Profile &rarr;
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Level 2: Quotations Issued */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              2. Quotations ({quotations.length})
            </span>
            <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded">
              Proposals
            </span>
          </div>

          {quotations.length > 0 ? (
            quotations.map((q) => (
              <div
                key={q.id}
                onClick={() => onSelectEntity('quotation', q.id)}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-blue-400 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono font-bold text-blue-600">{q.quoteNumber}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    q.status === 'Accepted'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {q.status}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800">{q.service}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{formatCurrency(q.value)}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{q.version}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-center text-xs text-slate-400">
              No quotations issued yet.
            </div>
          )}
        </div>

        {/* Level 3: Deals Closed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
              3. Deals Won ({deals.length})
            </span>
            <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
              Contracts
            </span>
          </div>

          {deals.length > 0 ? (
            deals.map((d) => (
              <div
                key={d.id}
                onClick={() => onSelectEntity('deal', d.id)}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-blue-400 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono font-bold text-indigo-600">{d.dealNumber}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {d.stage}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800">{d.title}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{formatCurrency(d.totalValue)}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                    {d.priority} Priority
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-center text-xs text-slate-400">
              No won deals recorded.
            </div>
          )}
        </div>

        {/* Level 4: Orders & Payments */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              4. Orders & Cash ({payments.length} Payments)
            </span>
            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
              Realization
            </span>
          </div>

          {orders.map((o) => (
            <div
              key={o.id}
              onClick={() => onSelectEntity('order', o.id)}
              className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs hover:border-blue-400 cursor-pointer transition-all mb-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-slate-700">{o.orderNumber}</span>
                <span className="text-[10px] font-semibold text-blue-600">{o.progressPercentage}% done</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 my-2">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${o.progressPercentage}%` }} />
              </div>
              <div className="text-[11px] text-slate-500 flex justify-between">
                <span>Total: {formatCurrency(o.totalAmount)}</span>
                <span className="font-medium text-slate-700">{o.status}</span>
              </div>
            </div>
          ))}

          {payments.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {payments.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectEntity('payment', p.id)}
                  className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-emerald-50/40 cursor-pointer transition-all flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-semibold text-slate-800">{p.paymentNumber}</span>
                    <span className="text-[10px] text-slate-400 block">{p.paymentMethod}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 block">{formatCurrency(p.amount)}</span>
                    <span className={`text-[10px] font-bold ${
                      p.status === 'Paid' ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
