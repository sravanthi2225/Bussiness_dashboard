import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, FileJson, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../utils/analytics';

export default function ExportModal({ metrics, onClose }) {
  const [format, setFormat] = useState('csv'); // 'csv' | 'json'
  const [dataset, setDataset] = useState('all'); // 'all' | 'leads' | 'deals' | 'orders' | 'payments'
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleExport = () => {
    let filename = `revenue_dashboard_export_${Date.now()}`;
    let dataStr = '';
    let mimeType = 'text/plain';

    if (format === 'json') {
      mimeType = 'application/json';
      filename += '.json';
      const exportObject = {
        exportedAt: new Date().toISOString(),
        timeframe: metrics.boundaries,
        kpiSummary: {
          totalRevenue: metrics.dealMetrics.totalRevenue,
          collectedRevenue: metrics.orderMetrics.collectedRevenue,
          outstandingRevenue: metrics.orderMetrics.outstandingRevenue,
          totalLeads: metrics.leadMetrics.totalLeads,
          conversionRate: metrics.leadMetrics.conversionRate,
          totalWonDeals: metrics.dealMetrics.wonDealsCount
        },
        data: dataset === 'all' ? metrics.raw : metrics.raw[dataset]
      };
      dataStr = JSON.stringify(exportObject, null, 2);
    } else {
      // CSV Export
      mimeType = 'text/csv';
      filename += '.csv';

      if (dataset === 'leads') {
        const headers = ['ID', 'Name', 'Company', 'Title', 'Email', 'Source', 'Status', 'AssignedTo', 'CreatedDate'];
        const rows = metrics.raw.leads.map(l => [
          l.id, `"${l.name}"`, `"${l.company}"`, `"${l.title}"`, l.email, l.source, l.status, l.assignedTo, l.createdAt
        ]);
        dataStr = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      } else if (dataset === 'deals') {
        const headers = ['DealID', 'Title', 'Service', 'Value', 'Priority', 'Stage', 'Owner', 'ClosedDate'];
        const rows = metrics.raw.deals.map(d => [
          d.dealNumber, `"${d.title}"`, `"${d.service}"`, d.totalValue, d.priority, d.stage, d.owner, d.closedDate || d.createdAt
        ]);
        dataStr = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      } else if (dataset === 'orders') {
        const headers = ['OrderNumber', 'DealID', 'Service', 'TotalAmount', 'Status', 'Progress', 'ProjectLead'];
        const rows = metrics.raw.orders.map(o => [
          o.orderNumber, o.dealId, `"${o.service}"`, o.totalAmount, o.status, `${o.progressPercentage}%`, o.projectLead
        ]);
        dataStr = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      } else if (dataset === 'payments') {
        const headers = ['PaymentNumber', 'OrderID', 'Amount', 'Method', 'Status', 'DueDate', 'PaidDate'];
        const rows = metrics.raw.payments.map(p => [
          p.paymentNumber, p.orderId, p.amount, p.paymentMethod, p.status, p.dueDate, p.paidDate || 'N/A'
        ]);
        dataStr = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      } else {
        // Executive Summary CSV
        const rows = [
          ['Metric', 'Current Period', 'Previous Equivalent Period', 'Delta %'],
          ['Total Won Revenue', formatCurrency(metrics.dealMetrics.totalRevenue), formatCurrency(metrics.previousMetrics.deals.totalRevenue), metrics.deltas.revenue.formatted],
          ['Collected Revenue', formatCurrency(metrics.orderMetrics.collectedRevenue), formatCurrency(metrics.previousMetrics.orders.collectedRevenue), metrics.deltas.collected.formatted],
          ['Outstanding Receivables', formatCurrency(metrics.orderMetrics.outstandingRevenue), formatCurrency(metrics.previousMetrics.orders.outstandingRevenue), metrics.deltas.outstandingRevenue.formatted],
          ['Total Leads Captured', metrics.leadMetrics.totalLeads, metrics.previousMetrics.leads.totalLeads, metrics.deltas.leads.formatted],
          ['Lead Conversion Rate', `${metrics.leadMetrics.conversionRate}%`, `${metrics.previousMetrics.leads.conversionRate}%`, metrics.deltas.conversionRate.formatted],
          ['Closed Won Deals', metrics.dealMetrics.wonDealsCount, metrics.previousMetrics.deals.wonDealsCount, metrics.deltas.wonDeals.formatted]
        ];
        dataStr = rows.map(r => r.join(',')).join('\n');
      }
    }

    const blob = new Blob([dataStr], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <Download className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              Export Analytics Data
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <div className="p-5 space-y-4">
          
          {/* Format Selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Select Export Format:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`flex items-center justify-center space-x-2 p-2.5 rounded-lg border text-xs font-bold transition-all ${
                  format === 'csv'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-700'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>CSV Spreadsheet</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('json')}
                className={`flex items-center justify-center space-x-2 p-2.5 rounded-lg border text-xs font-bold transition-all ${
                  format === 'json'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-700'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <FileJson className="w-4 h-4" />
                <span>JSON Raw Schema</span>
              </button>
            </div>
          </div>

          {/* Dataset Selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Select Dataset Scope:
            </label>
            <select
              value={dataset}
              onChange={(e) => setDataset(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Executive Summary & KPIs</option>
              <option value="leads">Leads Database ({metrics.raw.leads.length} records)</option>
              <option value="deals">Deals & Revenue ({metrics.raw.deals.length} records)</option>
              <option value="orders">Fulfillment Orders ({metrics.raw.orders.length} records)</option>
              <option value="payments">Payments & Invoices ({metrics.raw.payments.length} records)</option>
            </select>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
            Export reflects current active date range filter ({metrics.boundaries.current.start.toLocaleDateString()} to {metrics.boundaries.current.end.toLocaleDateString()}).
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center space-x-1.5 transition-colors"
          >
            {downloadSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Report</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
