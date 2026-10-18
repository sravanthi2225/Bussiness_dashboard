import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  DollarSign,
  PackageCheck,
  GitBranch,
  Search,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import Header from './components/Header';
import ExecutiveOverviewTab from './components/ExecutiveOverviewTab';
import LeadAnalyticsTab from './components/LeadAnalyticsTab';
import QuotationsTab from './components/QuotationsTab';
import DealsRevenueTab from './components/DealsRevenueTab';
import OrdersPaymentsTab from './components/OrdersPaymentsTab';
import RelationalExplorerTab from './components/RelationalExplorerTab';
import DetailModal from './components/DetailModal';
import ExportModal from './components/ExportModal';
import { getFullDashboardMetrics } from './utils/analytics';
import { RAW_LEADS, RAW_DEALS, RAW_QUOTATIONS } from './data/mockData';

export default function App() {
  // Date filter state
  const [activeFilter, setActiveFilter] = useState('last30'); // 'today' | 'last7' | 'last30' | 'custom'
  const [customStart, setCustomStart] = useState('2026-10-01');
  const [customEnd, setCustomEnd] = useState('2026-10-18');

  // Navigation tab state
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'leads' | 'quotes' | 'deals' | 'orders' | 'relationships'

  // Modals state
  const [selectedEntity, setSelectedEntity] = useState(null); // { type, id }
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Global search input
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate master metrics dynamically based on active date filter
  const metrics = useMemo(() => {
    return getFullDashboardMetrics(activeFilter, customStart, customEnd);
  }, [activeFilter, customStart, customEnd]);

  // Handler to open detail modal for any entity
  const handleSelectEntity = (type, id) => {
    setSelectedEntity({ type, id });
  };

  // Quick search matches banner
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return null;
    const query = searchQuery.toLowerCase();

    const matchingLeads = RAW_LEADS.filter(
      l => l.name.toLowerCase().includes(query) || l.company.toLowerCase().includes(query)
    );
    const matchingDeals = RAW_DEALS.filter(
      d => d.title.toLowerCase().includes(query) || d.dealNumber.toLowerCase().includes(query)
    );
    const matchingQuotes = RAW_QUOTATIONS.filter(
      q => q.quoteNumber.toLowerCase().includes(query) || q.service.toLowerCase().includes(query)
    );

    return {
      leads: matchingLeads,
      deals: matchingDeals,
      quotes: matchingQuotes,
      totalCount: matchingLeads.length + matchingDeals.length + matchingQuotes.length
    };
  }, [searchQuery]);

  const navTabs = [
    { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard, badge: null },
    { id: 'leads', label: 'Lead Analytics', icon: Users, badge: metrics.raw.leads.length },
    { id: 'quotes', label: 'Quotations', icon: FileText, badge: metrics.raw.quotations.length },
    { id: 'deals', label: 'Deals & Revenue', icon: DollarSign, badge: metrics.raw.deals.length },
    { id: 'orders', label: 'Orders & Payments', icon: PackageCheck, badge: metrics.raw.orders.length },
    { id: 'relationships', label: 'Relational Explorer', icon: GitBranch, badge: 'Unified' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Top Application Header */}
      <Header
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        customStart={customStart}
        setCustomStart={setCustomStart}
        customEnd={customEnd}
        setCustomEnd={setCustomEnd}
        boundaries={metrics.boundaries}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Global Search Results Quick Dropdown if typing */}
      {searchResults && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-3">
          <div className="bg-white rounded-xl border border-blue-200 p-4 shadow-lg animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700">
                Found {searchResults.totalCount} results matching "{searchQuery}"
              </span>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-blue-600 hover:underline"
              >
                Clear Search
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 text-xs">
              {/* Leads Matches */}
              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                  Leads ({searchResults.leads.length})
                </span>
                {searchResults.leads.slice(0, 3).map((l) => (
                  <div
                    key={l.id}
                    onClick={() => {
                      handleSelectEntity('lead', l.id);
                      setSearchQuery('');
                    }}
                    className="p-2 hover:bg-blue-50 rounded cursor-pointer transition-colors"
                  >
                    <p className="font-semibold text-slate-900">{l.name}</p>
                    <p className="text-[11px] text-slate-500">{l.company}</p>
                  </div>
                ))}
              </div>

              {/* Deals Matches */}
              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                  Deals ({searchResults.deals.length})
                </span>
                {searchResults.deals.slice(0, 3).map((d) => (
                  <div
                    key={d.id}
                    onClick={() => {
                      handleSelectEntity('deal', d.id);
                      setSearchQuery('');
                    }}
                    className="p-2 hover:bg-blue-50 rounded cursor-pointer transition-colors"
                  >
                    <p className="font-semibold text-slate-900">{d.title}</p>
                    <p className="text-[11px] text-blue-600 font-mono">{d.dealNumber}</p>
                  </div>
                ))}
              </div>

              {/* Quotes Matches */}
              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                  Quotations ({searchResults.quotes.length})
                </span>
                {searchResults.quotes.slice(0, 3).map((q) => (
                  <div
                    key={q.id}
                    onClick={() => {
                      handleSelectEntity('quotation', q.id);
                      setSearchQuery('');
                    }}
                    className="p-2 hover:bg-blue-50 rounded cursor-pointer transition-colors"
                  >
                    <p className="font-semibold text-slate-900">{q.quoteNumber}</p>
                    <p className="text-[11px] text-slate-500">{q.service}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation Tabs Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge !== null && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-blue-700 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Dashboard Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        
        {activeTab === 'overview' && (
          <ExecutiveOverviewTab
            metrics={metrics}
            onSelectEntity={handleSelectEntity}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'leads' && (
          <LeadAnalyticsTab
            metrics={metrics}
            onSelectEntity={handleSelectEntity}
          />
        )}

        {activeTab === 'quotes' && (
          <QuotationsTab
            metrics={metrics}
            onSelectEntity={handleSelectEntity}
          />
        )}

        {activeTab === 'deals' && (
          <DealsRevenueTab
            metrics={metrics}
            onSelectEntity={handleSelectEntity}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersPaymentsTab
            metrics={metrics}
            onSelectEntity={handleSelectEntity}
          />
        )}

        {activeTab === 'relationships' && (
          <RelationalExplorerTab
            onSelectEntity={handleSelectEntity}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>NexusRevenue Analytics Engine &bull; System Status: Active</span>
          </div>
          <div>
            Data Model: 1 Lead &rarr; Multiple Quotations & Deals &rarr; Orders & Payments
          </div>
        </div>
      </footer>

      {/* Relational Entity Detail Modal */}
      {selectedEntity && (
        <DetailModal
          entityType={selectedEntity.type}
          entityId={selectedEntity.id}
          onClose={() => setSelectedEntity(null)}
          onSelectEntity={handleSelectEntity}
        />
      )}

      {/* Data Export Modal */}
      {isExportOpen && (
        <ExportModal
          metrics={metrics}
          onClose={() => setIsExportOpen(false)}
        />
      )}

    </div>
  );
}
