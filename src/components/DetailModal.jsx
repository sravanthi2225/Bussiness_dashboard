import React, { useState } from 'react';
import {
  X,
  Building,
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  ArrowRight,
  FileText,
  Briefcase,
  PackageCheck,
  CreditCard,
  Layers,
  ChevronRight,
  GitBranch,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { getEntityRelationships, formatCurrency, formatDate } from '../utils/analytics';

export default function DetailModal({ entityType, entityId, onClose, onSelectEntity }) {
  if (!entityType || !entityId) return null;

  const lineage = getEntityRelationships(entityType, entityId);
  const { lead, quotations, deals, orders, payments, focalEntity } = lineage;

  const [activeTab, setActiveTab] = useState(
    entityType === 'lead'
      ? 'journey'
      : entityType === 'quotation'
      ? 'quotes'
      : entityType === 'deal'
      ? 'deals'
      : entityType === 'order'
      ? 'orders'
      : 'payments'
  );

  const totalQuoted = quotations.reduce((s, q) => s + (q.value || 0), 0);
  const totalContract = deals.reduce((s, d) => s + (d.totalValue || 0), 0);
  const totalPaid = payments.filter(p => p.status === 'Paid').reduce((s, p) => s + (p.amount || 0), 0);
  const totalPending = payments.filter(p => p.status !== 'Paid').reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-50 border-b border-slate-200/80 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <GitBranch className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                  {entityType.toUpperCase()} RELATIONAL VIEW
                </span>
                <span className="text-xs font-mono font-semibold text-slate-500">
                  {entityId}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                {lead?.company || 'Enterprise Account Record'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-white overflow-x-auto">
          {[
            { id: 'journey', label: 'Relational Flow', count: 'Chain', icon: GitBranch },
            { id: 'lead', label: 'Lead Profile', count: lead ? 1 : 0, icon: User },
            { id: 'quotes', label: 'Quotations', count: quotations.length, icon: FileText },
            { id: 'deals', label: 'Deals & Orders', count: deals.length, icon: Briefcase },
            { id: 'orders', label: 'Orders & Payments', count: orders.length, icon: PackageCheck },
            { id: 'payments', label: 'Payment Ledger', count: payments.length, icon: CreditCard }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Modal Tab Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          
          {/* TAB 0: All-in-One Relational Journey */}
          {activeTab === 'journey' && (
            <div className="space-y-5">
              {/* Financial Rollup */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100">
                  <span className="text-[11px] font-semibold text-blue-700 block">Total Quoted</span>
                  <span className="text-lg font-bold text-blue-900">{formatCurrency(totalQuoted)}</span>
                  <span className="text-[10px] text-blue-500 block">{quotations.length} Quotation(s)</span>
                </div>
                <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-100">
                  <span className="text-[11px] font-semibold text-indigo-700 block">Contracted Deals</span>
                  <span className="text-lg font-bold text-indigo-900">{formatCurrency(totalContract)}</span>
                  <span className="text-[10px] text-indigo-500 block">{deals.length} Won Deal(s)</span>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100">
                  <span className="text-[11px] font-semibold text-emerald-700 block">Cleared Cash</span>
                  <span className="text-lg font-bold text-emerald-900">{formatCurrency(totalPaid)}</span>
                  <span className="text-[10px] text-emerald-500 block">{payments.filter(p => p.status === 'Paid').length} Paid</span>
                </div>
                <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-100">
                  <span className="text-[11px] font-semibold text-amber-700 block">Outstanding</span>
                  <span className="text-lg font-bold text-amber-900">{formatCurrency(totalPending)}</span>
                  <span className="text-[10px] text-amber-500 block">{payments.filter(p => p.status !== 'Paid').length} Pending/Overdue</span>
                </div>
              </div>

              {/* Connected Visual Pipeline */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-blue-600" />
                    Account: {lead?.company} &bull; Contact: {lead?.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                    Lead Status: {lead?.status}
                  </span>
                </div>

                {/* Deals with nested orders and payments */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Won Deals & Associated Delivery & Payments:
                  </h4>

                  {deals.length > 0 ? (
                    deals.map((d) => {
                      const dealOrders = orders.filter(o => o.dealId === d.id);
                      const dealPayments = payments.filter(p => p.dealId === d.id);

                      return (
                        <div key={d.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
                          {/* Deal Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-xs font-bold text-indigo-600">{d.dealNumber}</span>
                                <span className="text-xs font-bold text-slate-900">{d.title}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">{d.service} &bull; Owner: {d.owner}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-bold text-slate-900 block">{formatCurrency(d.totalValue)}</span>
                              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                {d.stage}
                              </span>
                            </div>
                          </div>

                          {/* Associated Orders for this Deal */}
                          <div className="pl-3 border-l-2 border-blue-500 space-y-2">
                            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                              Fulfillment Orders ({dealOrders.length}):
                            </span>

                            {dealOrders.map((ord) => {
                              const ordPayments = dealPayments.filter(p => p.orderId === ord.id);

                              return (
                                <div key={ord.id} className="p-3 rounded-lg bg-slate-50/80 border border-slate-200 text-xs space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-mono font-bold text-slate-700">{ord.orderNumber}</span>
                                      <span className="text-slate-600">Lead: {ord.projectLead}</span>
                                    </div>
                                    <span className="font-semibold text-blue-600">{ord.progressPercentage}% Complete</span>
                                  </div>

                                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${ord.progressPercentage}%` }} />
                                  </div>

                                  {/* Associated Payments for this Order */}
                                  <div className="pt-2 border-t border-slate-200/70">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                      Milestone Payments ({ordPayments.length}):
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {ordPayments.map((pmt) => (
                                        <div key={pmt.id} className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                                          <div>
                                            <span className="font-mono font-semibold text-[11px] text-slate-800">{pmt.paymentNumber}</span>
                                            <span className="text-[10px] text-slate-400 block">{pmt.paymentMethod}</span>
                                          </div>
                                          <div className="text-right">
                                            <span className="font-bold text-[11px] text-slate-900 block">{formatCurrency(pmt.amount)}</span>
                                            <span className={`text-[10px] font-bold ${
                                              pmt.status === 'Paid' ? 'text-emerald-600' : 'text-amber-600'
                                            }`}>
                                              {pmt.status}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4">No won deals recorded yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: Lead Profile */}
          {activeTab === 'lead' && (
            lead ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{lead.name}</h3>
                      <p className="text-xs font-semibold text-blue-600 flex items-center gap-1 mt-0.5">
                        <Building className="w-3.5 h-3.5" />
                        {lead.company} &bull; {lead.title}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                      {lead.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-500 block">Email Address:</span>
                      <span className="font-semibold text-slate-800">{lead.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Phone Number:</span>
                      <span className="font-semibold text-slate-800">{lead.phone}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Acquisition Channel:</span>
                      <span className="font-semibold text-slate-800">{lead.source}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Assigned Sales Executive:</span>
                      <span className="font-semibold text-slate-800">{lead.assignedTo}</span>
                    </div>
                  </div>

                  {lead.notes && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                        Executive Qualification Notes:
                      </span>
                      <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/80">
                        {lead.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Associated Summary Pills */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs">
                    <span className="font-bold text-slate-900">Connected Records for this Account:</span>
                    <span className="text-slate-500 ml-2">
                      {quotations.length} Quotes &bull; {deals.length} Deals &bull; {orders.length} Orders &bull; {payments.length} Invoices
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setActiveTab('quotes')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs font-semibold text-slate-700 cursor-pointer"
                    >
                      View Quotes &rarr;
                    </button>
                    <button
                      onClick={() => setActiveTab('deals')}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 rounded text-xs font-semibold text-blue-700 cursor-pointer"
                    >
                      View Deals &rarr;
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center py-6 text-xs text-slate-400">No lead record associated.</p>
            )
          )}

          {/* TAB 2: Quotations */}
          {activeTab === 'quotes' && (
            <div className="space-y-3">
              {quotations.length > 0 ? (
                quotations.map((q) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 transition-colors shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs text-blue-600">{q.quoteNumber}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {q.version}
                        </span>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        q.status === 'Accepted'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {q.status}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-900">{q.service}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Valid until: {q.validUntil}</span>
                      <span className="text-sm font-bold text-slate-900">{formatCurrency(q.value)}</span>
                    </div>

                    {q.dealId && (
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Converted into Won Deal:</span>
                        <button
                          onClick={() => {
                            setActiveTab('deals');
                          }}
                          className="font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>{q.dealId}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center py-6 text-xs text-slate-400">No quotations found for this entity.</p>
              )}
            </div>
          )}

          {/* TAB 3: Deals & Connected Orders */}
          {activeTab === 'deals' && (
            <div className="space-y-4">
              {deals.length > 0 ? (
                deals.map((d) => {
                  const dealOrders = orders.filter(o => o.dealId === d.id);
                  const dealPayments = payments.filter(p => p.dealId === d.id);

                  return (
                    <div
                      key={d.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 transition-colors shadow-2xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-indigo-600">{d.dealNumber}</span>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {d.stage} ({d.probability}%)
                        </span>
                      </div>

                      <p className="text-sm font-bold text-slate-900">{d.title}</p>
                      <p className="text-xs text-slate-500">{d.service}</p>

                      <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Contract Value:</span>
                          <span className="font-bold text-slate-900">{formatCurrency(d.totalValue)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Priority Tier:</span>
                          <span className="font-semibold text-slate-700">{d.priority}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Deal Closer:</span>
                          <span className="font-semibold text-slate-700">{d.owner}</span>
                        </div>
                      </div>

                      {/* Associated Orders for this Deal */}
                      <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                          <span>Fulfillment Orders for this Deal:</span>
                          <span>{dealOrders.length} Order(s)</span>
                        </div>
                        {dealOrders.map(o => (
                          <div key={o.id} className="p-2.5 bg-white rounded border border-slate-200 text-xs space-y-1">
                            <div className="flex justify-between font-medium">
                              <span className="font-mono text-blue-600 font-bold">{o.orderNumber}</span>
                              <span className="text-slate-800">{formatCurrency(o.totalAmount)}</span>
                            </div>
                            <div className="flex justify-between text-[11px] text-slate-500">
                              <span>Status: <strong>{o.status}</strong></span>
                              <span>{o.progressPercentage}% Complete</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Associated Payments for this Deal */}
                      <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                          <span>Payment Milestones for this Deal:</span>
                          <span>{dealPayments.length} Invoices</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {dealPayments.map(p => (
                            <div key={p.id} className="p-2 bg-white rounded border border-slate-200 text-xs flex justify-between items-center">
                              <div>
                                <span className="font-mono font-bold text-[11px] text-slate-800">{p.paymentNumber}</span>
                                <span className="text-[10px] text-slate-400 block">{p.paymentMethod}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-[11px] text-slate-900 block">{formatCurrency(p.amount)}</span>
                                <span className={`text-[10px] font-bold ${
                                  p.status === 'Paid' ? 'text-emerald-600' : 'text-amber-600'
                                }`}>
                                  {p.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  );
                })
              ) : (
                <p className="text-center py-6 text-xs text-slate-400">No deals found for this entity.</p>
              )}
            </div>
          )}

          {/* TAB 4: Orders & Payments */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {orders.length > 0 ? (
                orders.map((o) => {
                  const ordPayments = payments.filter(p => p.orderId === o.id);

                  return (
                    <div
                      key={o.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 transition-colors shadow-2xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-slate-700">{o.orderNumber}</span>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          o.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {o.status}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-slate-900">{o.service}</p>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-500">Delivery Completion:</span>
                          <span className="font-bold text-blue-600">{o.progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${o.progressPercentage}%` }} />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Delivery Lead: <strong>{o.projectLead}</strong></span>
                        <span className="font-bold text-slate-900">{formatCurrency(o.totalAmount)}</span>
                      </div>

                      {/* Associated payments for this order */}
                      {ordPayments.length > 0 && (
                        <div className="bg-slate-50 rounded-lg p-2.5 text-xs space-y-1.5">
                          <span className="font-bold text-slate-700 text-[11px] block">Associated Invoices:</span>
                          {ordPayments.map(p => (
                            <div key={p.id} className="p-2 bg-white rounded border border-slate-200 flex justify-between items-center text-xs">
                              <span className="font-mono font-semibold text-slate-800">{p.paymentNumber} ({p.paymentMethod})</span>
                              <div className="text-right">
                                <span className="font-bold text-slate-900">{formatCurrency(p.amount)}</span>
                                <span className={`ml-2 text-[10px] font-bold ${
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
                  );
                })
              ) : (
                <p className="text-center py-6 text-xs text-slate-400">No orders associated with this entity.</p>
              )}
            </div>
          )}

          {/* TAB 5: Payments */}
          {activeTab === 'payments' && (
            <div className="space-y-3">
              {payments.length > 0 ? (
                payments.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 transition-colors shadow-2xs flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs text-blue-600">{p.paymentNumber}</span>
                        <span className="text-[11px] font-medium text-slate-500">via {p.paymentMethod}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Due: {p.dueDate} {p.paidDate ? `• Paid: ${formatDate(p.paidDate)}` : ''}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900 block">{formatCurrency(p.amount)}</span>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-6 text-xs text-slate-400">No payment records found.</p>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>Relational Integrity: 1 Lead &rarr; {quotations.length} Quotes &rarr; {deals.length} Deals &rarr; {orders.length} Orders &rarr; {payments.length} Payments</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            Close View
          </button>
        </div>

      </div>
    </div>
  );
}
