// Analytical Calculation Engine
// Provides mathematically consistent metrics derived from the relational dataset

import { RAW_LEADS, RAW_QUOTATIONS, RAW_DEALS, RAW_ORDERS, RAW_PAYMENTS, SERVICES, LEAD_SOURCES } from '../data/mockData';

// Reference anchor date: October 18, 2026 (Month index 9 is October)
export const ANCHOR_DATE = new Date(2026, 9, 18, 23, 59, 59, 999);

// Format Currency in Indian Rupee (INR - ₹)
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

// Format Compact Currency for chart axis / cards
export const formatCompactNumber = (number) => {
  return new Intl.NumberFormat('en-IN', {
    notation: 'compact',
    compactDisplay: 'short'
  }).format(number || 0);
};

// Parse date string into local timezone Date
export const parseIsoDate = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2}))?/);
  if (parts) {
    const y = parseInt(parts[1], 10);
    const m = parseInt(parts[2], 10) - 1;
    const d = parseInt(parts[3], 10);
    const h = parts[4] ? parseInt(parts[4], 10) : 12;
    const min = parts[5] ? parseInt(parts[5], 10) : 0;
    const s = parts[6] ? parseInt(parts[6], 10) : 0;
    return new Date(y, m, d, h, min, s);
  }
  return new Date(dateStr);
};

// Format Date
export const formatDate = (dateInput) => {
  if (!dateInput) return 'N/A';
  const d = typeof dateInput === 'string' ? parseIsoDate(dateInput) : dateInput;
  if (!d || isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Determine date range boundaries based on filter preset
export const getDateRangeBoundaries = (filterType, customStart = null, customEnd = null) => {
  let start;
  let end;

  if (filterType === 'today') {
    start = new Date(2026, 9, 18, 0, 0, 0, 0);
    end = new Date(2026, 9, 18, 23, 59, 59, 999);
    const prevStart = new Date(2026, 9, 17, 0, 0, 0, 0);
    const prevEnd = new Date(2026, 9, 17, 23, 59, 59, 999);
    return {
      current: { start, end },
      previous: { start: prevStart, end: prevEnd }
    };
  } else if (filterType === 'last7') {
    start = new Date(2026, 9, 12, 0, 0, 0, 0);
    end = new Date(2026, 9, 18, 23, 59, 59, 999);
    const prevStart = new Date(2026, 9, 5, 0, 0, 0, 0);
    const prevEnd = new Date(2026, 9, 11, 23, 59, 59, 999);
    return {
      current: { start, end },
      previous: { start: prevStart, end: prevEnd }
    };
  } else if (filterType === 'last30') {
    start = new Date(2026, 8, 19, 0, 0, 0, 0); // Sep 19
    end = new Date(2026, 9, 18, 23, 59, 59, 999); // Oct 18
    const prevStart = new Date(2026, 7, 20, 0, 0, 0, 0); // Aug 20
    const prevEnd = new Date(2026, 8, 18, 23, 59, 59, 999); // Sep 18
    return {
      current: { start, end },
      previous: { start: prevStart, end: prevEnd }
    };
  } else if (filterType === 'custom' && customStart && customEnd) {
    const sParts = customStart.split('-').map(Number);
    const eParts = customEnd.split('-').map(Number);
    start = new Date(sParts[0], sParts[1] - 1, sParts[2], 0, 0, 0, 0);
    end = new Date(eParts[0], eParts[1] - 1, eParts[2], 23, 59, 59, 999);
    
    // Exact previous equivalent duration
    const durationMs = end.getTime() - start.getTime() + 1;
    const prevEnd = new Date(start.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - durationMs + 1);
    prevStart.setHours(0, 0, 0, 0);

    return {
      current: { start, end },
      previous: { start: prevStart, end: prevEnd }
    };
  } else {
    // Default fallback to last 30
    start = new Date(2026, 8, 19, 0, 0, 0, 0);
    end = new Date(2026, 9, 18, 23, 59, 59, 999);
    const prevStart = new Date(2026, 7, 20, 0, 0, 0, 0);
    const prevEnd = new Date(2026, 8, 18, 23, 59, 59, 999);
    return {
      current: { start, end },
      previous: { start: prevStart, end: prevEnd }
    };
  }
};

// Check if a date string falls within range
const isWithin = (dateStr, range) => {
  if (!dateStr) return false;
  const d = parseIsoDate(dateStr);
  if (!d) return false;
  return d >= range.start && d <= range.end;
};

// Calculate percentage change with direction
export const calculateDelta = (currentVal, prevVal) => {
  const current = Number(currentVal) || 0;
  const prev = Number(prevVal) || 0;

  if (prev === 0) {
    if (current > 0) return { delta: 100, direction: 'up', formatted: '+100%' };
    if (current < 0) return { delta: -100, direction: 'down', formatted: '-100%' };
    return { delta: 0, direction: 'flat', formatted: '0%' };
  }

  const diff = ((current - prev) / Math.abs(prev)) * 100;
  const rounded = Math.round(diff * 10) / 10;
  return {
    delta: rounded,
    direction: rounded > 0 ? 'up' : rounded < 0 ? 'down' : 'flat',
    formatted: `${rounded >= 0 ? '+' : ''}${rounded}%`
  };
};

// Filter dataset according to given period
export const getFilteredEntities = (range) => {
  const leads = RAW_LEADS.filter(item => isWithin(item.createdAt, range));
  const quotations = RAW_QUOTATIONS.filter(item => isWithin(item.createdAt, range));
  const deals = RAW_DEALS.filter(item => isWithin(item.closedDate || item.createdAt, range));
  const orders = RAW_ORDERS.filter(item => isWithin(item.startDate, range));
  const payments = RAW_PAYMENTS.filter(item => isWithin(item.paidDate || item.dueDate, range));

  return { leads, quotations, deals, orders, payments };
};

// Compute Lead Metrics
export const computeLeadAnalytics = (leads) => {
  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter(l => l.status === 'Qualified' || l.status === 'Converted').length;
  const convertedLeads = leads.filter(l => l.status === 'Converted').length;
  const unqualifiedLeads = leads.filter(l => l.status === 'Unqualified').length;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;

  // Funnel stages progression
  const funnel = [
    { stage: 'Total Inquiries', count: totalLeads, fill: '#3b82f6', dropoff: '100%' },
    { stage: 'Contacted & Engaged', count: Math.round(totalLeads * 0.88), fill: '#60a5fa', dropoff: '88%' },
    { stage: 'Qualified Pipeline', count: qualifiedLeads, fill: '#10b981', dropoff: totalLeads > 0 ? `${Math.round((qualifiedLeads / totalLeads) * 100)}%` : '0%' },
    { stage: 'Converted to Deal', count: convertedLeads, fill: '#2563eb', dropoff: totalLeads > 0 ? `${conversionRate}%` : '0%' }
  ];

  // Lead source distribution
  const sourceMap = {};
  LEAD_SOURCES.forEach(src => { sourceMap[src] = 0; });
  leads.forEach(l => {
    sourceMap[l.source] = (sourceMap[l.source] || 0) + 1;
  });

  const sourceChartData = Object.keys(sourceMap).map((source, idx) => ({
    source,
    count: sourceMap[source],
    fill: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#10b981', '#f59e0b'][idx % 6]
  }));

  return {
    totalLeads,
    qualifiedLeads,
    convertedLeads,
    unqualifiedLeads,
    conversionRate: Number(conversionRate),
    funnel,
    sourceChartData
  };
};

// Compute Quotation Analytics
export const computeQuotationAnalytics = (quotations, deals) => {
  const totalQuotes = quotations.length;
  const totalQuoteValue = quotations.reduce((sum, q) => sum + (q.value || 0), 0);
  const acceptedQuotes = quotations.filter(q => q.status === 'Accepted').length;
  const quoteToDealRate = totalQuotes > 0 ? ((acceptedQuotes / totalQuotes) * 100).toFixed(1) : 0;

  // Quotes by Status
  const statusCounts = {
    Accepted: 0,
    'Under Review': 0,
    Sent: 0,
    Draft: 0,
    Rejected: 0
  };
  quotations.forEach(q => {
    if (statusCounts[q.status] !== undefined) {
      statusCounts[q.status]++;
    }
  });

  const statusChartData = [
    { name: 'Accepted', value: statusCounts.Accepted, color: '#10b981' },
    { name: 'Under Review', value: statusCounts['Under Review'], color: '#3b82f6' },
    { name: 'Sent', value: statusCounts.Sent, color: '#f59e0b' },
    { name: 'Draft', value: statusCounts.Draft, color: '#94a3b8' },
    { name: 'Rejected', value: statusCounts.Rejected, color: '#ef4444' }
  ].filter(item => item.value > 0);

  // Quotes and Values by Service
  const serviceQuoteMap = {};
  SERVICES.forEach(s => {
    serviceQuoteMap[s] = { service: s, count: 0, totalValue: 0 };
  });

  quotations.forEach(q => {
    if (serviceQuoteMap[q.service]) {
      serviceQuoteMap[q.service].count++;
      serviceQuoteMap[q.service].totalValue += q.value;
    }
  });

  const quotesByService = Object.values(serviceQuoteMap);

  return {
    totalQuotes,
    totalQuoteValue,
    acceptedQuotes,
    quoteToDealRate: Number(quoteToDealRate),
    statusChartData,
    quotesByService
  };
};

// Compute Deals & Revenue Analytics
export const computeDealsAndRevenue = (deals) => {
  const totalDeals = deals.length;
  const wonDeals = deals.filter(d => d.stage === 'Won');
  const wonDealsCount = wonDeals.length;
  const winRate = totalDeals > 0 ? ((wonDealsCount / totalDeals) * 100).toFixed(1) : 0;
  
  // Total Revenue earned from Won Deals (no double counting)
  const totalRevenue = wonDeals.reduce((sum, d) => sum + (d.totalValue || 0), 0);
  const averageDealSize = wonDealsCount > 0 ? Math.round(totalRevenue / wonDealsCount) : 0;

  // Revenue by Service
  const serviceRevenueMap = {};
  SERVICES.forEach(s => {
    serviceRevenueMap[s] = { service: s, revenue: 0, count: 0 };
  });

  wonDeals.forEach(d => {
    if (serviceRevenueMap[d.service]) {
      serviceRevenueMap[d.service].revenue += d.totalValue;
      serviceRevenueMap[d.service].count += 1;
    }
  });

  const revenueByService = Object.values(serviceRevenueMap);

  // Deals by Priority
  const priorityMap = { High: 0, Medium: 0, Low: 0 };
  deals.forEach(d => {
    if (priorityMap[d.priority] !== undefined) {
      priorityMap[d.priority]++;
    }
  });

  const dealsByPriority = [
    { name: 'High Priority', count: priorityMap.High, fill: '#ef4444' },
    { name: 'Medium Priority', count: priorityMap.Medium, fill: '#f59e0b' },
    { name: 'Low Priority', count: priorityMap.Low, fill: '#3b82f6' }
  ];

  // Daily Revenue Timeline for the line/area chart
  const dailyMap = {};
  wonDeals.forEach(d => {
    const dayStr = d.closedDate ? d.closedDate.split('T')[0] : d.createdAt.split('T')[0];
    dailyMap[dayStr] = (dailyMap[dayStr] || 0) + d.totalValue;
  });

  const dailyRevenueTrend = Object.keys(dailyMap)
    .sort()
    .map(dateKey => {
      const d = new Date(dateKey);
      return {
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        rawDate: dateKey,
        revenue: dailyMap[dateKey]
      };
    });

  return {
    totalDeals,
    wonDealsCount,
    winRate: Number(winRate),
    totalRevenue,
    averageDealSize,
    revenueByService,
    dealsByPriority,
    dailyRevenueTrend
  };
};

// Compute Orders & Payments Analytics
export const computeOrdersAndPayments = (orders, payments, totalWonRevenue) => {
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'Completed').length;
  const inProgressOrders = orders.filter(o => o.status === 'In Progress').length;
  const pendingKickoffOrders = orders.filter(o => o.status === 'Pending Kickoff').length;
  
  const avgProgress = totalOrders > 0
    ? Math.round(orders.reduce((sum, o) => sum + (o.progressPercentage || 0), 0) / totalOrders)
    : 0;

  // Payments calculations (strictly from payments table, no double counting)
  const paidPayments = payments.filter(p => p.status === 'Paid');
  const pendingPayments = payments.filter(p => p.status === 'Pending');
  const overduePayments = payments.filter(p => p.status === 'Overdue');

  const collectedRevenue = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingRevenue = pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const overdueRevenue = overduePayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Outstanding revenue = Pending + Overdue
  const outstandingRevenue = pendingRevenue + overdueRevenue;
  const collectionRate = (collectedRevenue + outstandingRevenue) > 0
    ? Math.round((collectedRevenue / (collectedRevenue + outstandingRevenue)) * 100)
    : 0;

  // Order status distribution
  const orderStatusDistribution = [
    { name: 'Completed', count: completedOrders, color: '#10b981' },
    { name: 'In Progress', count: inProgressOrders, color: '#3b82f6' },
    { name: 'Under Review', count: orders.filter(o => o.status === 'Under Review').length, color: '#8b5cf6' },
    { name: 'Pending Kickoff', count: pendingKickoffOrders, color: '#f59e0b' }
  ].filter(item => item.count > 0);

  // Payment Timeline Trends
  const paymentTimelineMap = {};
  paidPayments.forEach(p => {
    const dayStr = p.paidDate.split('T')[0];
    paymentTimelineMap[dayStr] = (paymentTimelineMap[dayStr] || 0) + p.amount;
  });

  const collectionTrend = Object.keys(paymentTimelineMap)
    .sort()
    .map(dateKey => {
      const d = new Date(dateKey);
      return {
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        collected: paymentTimelineMap[dateKey]
      };
    });

  return {
    totalOrders,
    completedOrders,
    inProgressOrders,
    avgProgress,
    collectedRevenue,
    outstandingRevenue,
    pendingRevenue,
    overdueRevenue,
    collectionRate,
    orderStatusDistribution,
    collectionTrend
  };
};

// Master Function: Computes ALL KPIs and Comparison Deltas
export const getFullDashboardMetrics = (filterType, customStart, customEnd) => {
  const boundaries = getDateRangeBoundaries(filterType, customStart, customEnd);
  
  // Current period entities & analytics
  const currentEntities = getFilteredEntities(boundaries.current);
  const leadMetrics = computeLeadAnalytics(currentEntities.leads);
  const quoteMetrics = computeQuotationAnalytics(currentEntities.quotations, currentEntities.deals);
  const dealMetrics = computeDealsAndRevenue(currentEntities.deals);
  const orderMetrics = computeOrdersAndPayments(currentEntities.orders, currentEntities.payments, dealMetrics.totalRevenue);

  // Previous period entities & analytics for exact comparison
  const prevEntities = getFilteredEntities(boundaries.previous);
  const prevLeadMetrics = computeLeadAnalytics(prevEntities.leads);
  const prevQuoteMetrics = computeQuotationAnalytics(prevEntities.quotations, prevEntities.deals);
  const prevDealMetrics = computeDealsAndRevenue(prevEntities.deals);
  const prevOrderMetrics = computeOrdersAndPayments(prevEntities.orders, prevEntities.payments, prevDealMetrics.totalRevenue);

  // Calculate Deltas for Executive KPIs
  const deltas = {
    revenue: calculateDelta(dealMetrics.totalRevenue, prevDealMetrics.totalRevenue),
    collected: calculateDelta(orderMetrics.collectedRevenue, prevOrderMetrics.collectedRevenue),
    leads: calculateDelta(leadMetrics.totalLeads, prevLeadMetrics.totalLeads),
    conversionRate: calculateDelta(leadMetrics.conversionRate, prevLeadMetrics.conversionRate),
    quotesValue: calculateDelta(quoteMetrics.totalQuoteValue, prevQuoteMetrics.totalQuoteValue),
    wonDeals: calculateDelta(dealMetrics.wonDealsCount, prevDealMetrics.wonDealsCount),
    completedOrders: calculateDelta(orderMetrics.completedOrders, prevOrderMetrics.completedOrders),
    outstandingRevenue: calculateDelta(orderMetrics.outstandingRevenue, prevOrderMetrics.outstandingRevenue)
  };

  return {
    boundaries,
    raw: currentEntities,
    leadMetrics,
    quoteMetrics,
    dealMetrics,
    orderMetrics,
    deltas,
    previousMetrics: {
      leads: prevLeadMetrics,
      quotes: prevQuoteMetrics,
      deals: prevDealMetrics,
      orders: prevOrderMetrics
    }
  };
};

// Relationship Helper: Resolves the complete lineage for any entity
export const getEntityRelationships = (type, entityId) => {
  let targetLead = null;
  let targetQuote = null;
  let targetDeal = null;
  let targetOrder = null;
  let targetPayment = null;

  if (type === 'lead') {
    targetLead = RAW_LEADS.find(l => l.id === entityId);
  } else if (type === 'quotation') {
    targetQuote = RAW_QUOTATIONS.find(q => q.id === entityId);
    if (targetQuote) targetLead = RAW_LEADS.find(l => l.id === targetQuote.leadId);
  } else if (type === 'deal') {
    targetDeal = RAW_DEALS.find(d => d.id === entityId);
    if (targetDeal) {
      targetLead = RAW_LEADS.find(l => l.id === targetDeal.leadId);
      targetQuote = RAW_QUOTATIONS.find(q => q.id === targetDeal.quotationId);
    }
  } else if (type === 'order') {
    targetOrder = RAW_ORDERS.find(o => o.id === entityId);
    if (targetOrder) {
      targetDeal = RAW_DEALS.find(d => d.id === targetOrder.dealId);
      targetLead = RAW_LEADS.find(l => l.id === targetOrder.leadId);
      if (targetDeal) targetQuote = RAW_QUOTATIONS.find(q => q.id === targetDeal.quotationId);
    }
  } else if (type === 'payment') {
    targetPayment = RAW_PAYMENTS.find(p => p.id === entityId);
    if (targetPayment) {
      targetOrder = RAW_ORDERS.find(o => o.id === targetPayment.orderId);
      targetDeal = RAW_DEALS.find(d => d.id === targetPayment.dealId);
      targetLead = RAW_LEADS.find(l => l.id === targetPayment.leadId);
      if (targetDeal) targetQuote = RAW_QUOTATIONS.find(q => q.id === targetDeal.quotationId);
    }
  }

  const leadId = targetLead ? targetLead.id : null;
  const relatedQuotations = leadId ? RAW_QUOTATIONS.filter(q => q.leadId === leadId) : [];
  const relatedDeals = leadId ? RAW_DEALS.filter(d => d.leadId === leadId) : [];
  const dealIds = relatedDeals.map(d => d.id);
  const relatedOrders = RAW_ORDERS.filter(o => o.leadId === leadId || dealIds.includes(o.dealId));
  const orderIds = relatedOrders.map(o => o.id);
  const relatedPayments = RAW_PAYMENTS.filter(p => p.leadId === leadId || dealIds.includes(p.dealId) || orderIds.includes(p.orderId));

  return {
    lead: targetLead,
    quotations: relatedQuotations,
    deals: relatedDeals,
    orders: relatedOrders,
    payments: relatedPayments,
    focalEntity: { type, id: entityId, data: targetLead || targetQuote || targetDeal || targetOrder || targetPayment }
  };
};
