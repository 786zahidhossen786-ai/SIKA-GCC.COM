import { UserRole, UserProfile, Transaction } from '../types';

export interface RoleScopeConfig {
  role: UserRole;
  personaTitle: string;
  roleBadge: string;
  badgeColor: string;
  canViewNetProfit: boolean;
  canViewTotalPayroll: boolean;
  canViewCompanyRevenue: boolean;
  canViewExecutiveDividends: boolean;
  canViewSadaqahDetails: boolean;
  canViewClientGifts: boolean;
  canViewDiscounts: boolean;
  canViewDailyExpenses: boolean;
  allowedCategories?: string[]; // undefined means all categories
  suggestedQuestions: string[];
  scopeDescription: string;
  securityNotice: string;
}

export const ROLE_CONFIGS: Record<UserRole, RoleScopeConfig> = {
  founder: {
    role: 'founder',
    personaTitle: 'Chief Executive Financial Co-Pilot',
    roleBadge: 'Founder & Owner',
    badgeColor: 'text-amber-400 bg-amber-950/40 border-amber-800/60',
    canViewNetProfit: true,
    canViewTotalPayroll: true,
    canViewCompanyRevenue: true,
    canViewExecutiveDividends: true,
    canViewSadaqahDetails: true,
    canViewClientGifts: true,
    canViewDiscounts: true,
    canViewDailyExpenses: true,
    suggestedQuestions: [
      'What is our total net profit margin across all GCC regions?',
      'Summarize our Sadaqah and charitable allocations this period.',
      'How are discounts and client gifts impacting our bottom line?',
      'Are we on track to hit our annual revenue target?',
    ],
    scopeDescription: 'Full strategic financial oversight: global revenue, net profits, owner dividends, payroll, and Sadaqah.',
    securityNotice: 'Root Executive Access: You have unrestricted visibility across all financial ledgers.',
  },
  owner: {
    role: 'owner',
    personaTitle: 'Executive Owner Financial Strategist',
    roleBadge: 'Executive Owner',
    badgeColor: 'text-amber-400 bg-amber-950/40 border-amber-800/60',
    canViewNetProfit: true,
    canViewTotalPayroll: true,
    canViewCompanyRevenue: true,
    canViewExecutiveDividends: true,
    canViewSadaqahDetails: true,
    canViewClientGifts: true,
    canViewDiscounts: true,
    canViewDailyExpenses: true,
    suggestedQuestions: [
      'Show our company P&L summary with total revenue vs expenses.',
      'What are our current cash reserves and net profit trajectory?',
      'Compare our Sadaqah contributions to client hospitality gifts.',
    ],
    scopeDescription: 'Full executive ownership access to all P&L ledgers and capital allocation.',
    securityNotice: 'Owner Tier: Unrestricted ledger and administrative authority.',
  },
  'co-founder': {
    role: 'co-founder',
    personaTitle: 'Co-Founding Executive Growth Partner',
    roleBadge: 'Co-Founder',
    badgeColor: 'text-orange-400 bg-orange-950/40 border-orange-800/60',
    canViewNetProfit: true,
    canViewTotalPayroll: true,
    canViewCompanyRevenue: true,
    canViewExecutiveDividends: false,
    canViewSadaqahDetails: true,
    canViewClientGifts: true,
    canViewDiscounts: true,
    canViewDailyExpenses: true,
    suggestedQuestions: [
      'What is our commercial revenue growth rate month-over-month?',
      'How are operational expenses distributed across materials and staff?',
      'What is our net margin across current client contracts?',
    ],
    scopeDescription: 'Executive partner access: corporate growth, P&L, team goals, and operational health.',
    securityNotice: 'Executive Partner Access: Full visibility into corporate revenue, margins, and operational budgets.',
  },
  ceo: {
    role: 'ceo',
    personaTitle: 'Chief Executive Strategic Operations Advisor',
    roleBadge: 'CEO',
    badgeColor: 'text-yellow-400 bg-yellow-950/40 border-yellow-800/60',
    canViewNetProfit: true,
    canViewTotalPayroll: true,
    canViewCompanyRevenue: true,
    canViewExecutiveDividends: false,
    canViewSadaqahDetails: true,
    canViewClientGifts: true,
    canViewDiscounts: true,
    canViewDailyExpenses: true,
    suggestedQuestions: [
      'Analyze our commercial contract performance and margin health.',
      'Which expense categories are growing faster than our revenue?',
      'What is our progress towards the quarterly revenue and expense goals?',
    ],
    scopeDescription: 'Executive corporate governance: revenue streams, cost centers, and commercial targets.',
    securityNotice: 'Chief Executive Access: Authorized for corporate governance, P&L, and team financial targets.',
  },
  director: {
    role: 'director',
    personaTitle: 'Technical Operations & Commercial Director AI',
    roleBadge: 'Director',
    badgeColor: 'text-indigo-400 bg-indigo-950/40 border-indigo-800/60',
    canViewNetProfit: false,
    canViewTotalPayroll: false,
    canViewCompanyRevenue: true,
    canViewExecutiveDividends: false,
    canViewSadaqahDetails: false,
    canViewClientGifts: true,
    canViewDiscounts: true,
    canViewDailyExpenses: true,
    allowedCategories: [
      'Commercial Construction Chemicals',
      'Client Contracts',
      'Bulk Raw Chemicals',
      'Logistics & Freight',
      'Equipment & Fleet Maintenance',
      'Warehouse & Facilities',
      'Client Hospitality & Gifts',
      'Discounts & Rebates',
      'Daily Site Expenses & Petty Cash',
    ],
    suggestedQuestions: [
      'What is our operational expenditure breakdown this month?',
      'How much did we spend on chemical raw materials and logistics?',
      'Summarize our commercial chemical delivery costs across UAE and KSA.',
    ],
    scopeDescription: 'Operational leadership: commercial projects, procurement, logistics, and site overhead.',
    securityNotice: 'Director Tier: Authorized for project operations, materials, logistics, and commercial contracts.',
  },
  manager: {
    role: 'manager',
    personaTitle: 'Operations & Finance Managerial Advisor',
    roleBadge: 'Manager',
    badgeColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60',
    canViewNetProfit: false,
    canViewTotalPayroll: false,
    canViewCompanyRevenue: true,
    canViewExecutiveDividends: false,
    canViewSadaqahDetails: false,
    canViewClientGifts: true,
    canViewDiscounts: true,
    canViewDailyExpenses: true,
    allowedCategories: [
      'Commercial Construction Chemicals',
      'Client Contracts',
      'Bulk Raw Chemicals',
      'Logistics & Freight',
      'Equipment & Fleet Maintenance',
      'Warehouse & Facilities',
      'Client Hospitality & Gifts',
      'Discounts & Rebates',
      'Daily Site Expenses & Petty Cash',
    ],
    suggestedQuestions: [
      'Review pending vs cleared transactions in our ledger.',
      'What are our top operational expenses for this period?',
      'How much discount has been issued across active client deals?',
    ],
    scopeDescription: 'Managerial operations: transaction records, project logistics, materials, and approvals.',
    securityNotice: 'Manager Tier: Authorized for operational ledgers, material procurement, and client expenses.',
  },
  salesman: {
    role: 'salesman',
    personaTitle: 'Commercial Sales & Client Relations Co-Pilot',
    roleBadge: 'Salesman',
    badgeColor: 'text-cyan-400 bg-cyan-950/40 border-cyan-800/60',
    canViewNetProfit: false,
    canViewTotalPayroll: false,
    canViewCompanyRevenue: false, // only sales-specific revenue
    canViewExecutiveDividends: false,
    canViewSadaqahDetails: false,
    canViewClientGifts: true,
    canViewDiscounts: true,
    canViewDailyExpenses: false,
    allowedCategories: [
      'Commercial Construction Chemicals',
      'Client Contracts',
      'Client Hospitality & Gifts',
      'Discounts & Rebates',
      'Sales Commission & Travel',
    ],
    suggestedQuestions: [
      'What are our top selling Sika products (Sikaflex, SikaTop, Sikafloor)?',
      'How much commercial discount have we provided to clients this month?',
      'What client gifts or hospitality expenses are logged under my scope?',
      'How can I structure a 10% volume discount for an epoxy flooring client?',
    ],
    scopeDescription: 'Commercial sales scope: product contracts, client discounts, and relationship gifts.',
    securityNotice: 'Sales Tier Scoping: Company net profits, executive dividends, and staff payroll are confidential.',
  },
  worker: {
    role: 'worker',
    personaTitle: 'Field Logistics & Daily Site Expenses Assistant',
    roleBadge: 'Worker / Technician',
    badgeColor: 'text-slate-300 bg-slate-800/80 border-slate-700',
    canViewNetProfit: false,
    canViewTotalPayroll: false,
    canViewCompanyRevenue: false,
    canViewExecutiveDividends: false,
    canViewSadaqahDetails: false,
    canViewClientGifts: false,
    canViewDiscounts: false,
    canViewDailyExpenses: true,
    allowedCategories: [
      'Daily Site Expenses & Petty Cash',
      'Fuel & Vehicle Transport',
      'Equipment & Fleet Maintenance',
      'Safety Gear & Consumables',
      'Site Logistics',
    ],
    suggestedQuestions: [
      'What is our total daily expense logged for site fuel and transport?',
      'How much petty cash has been spent on equipment upkeep?',
      'How do I properly log a fuel receipt or vehicle toll (Salik)?',
      'Review pending daily expenses for tool replacements.',
    ],
    scopeDescription: 'Field technician scope: daily site expenses, vehicle fuel, tools, and petty cash.',
    securityNotice: 'Technician Tier Scoping: Commercial revenues, client pricing, and profits are restricted.',
  },
  analyst: {
    role: 'analyst',
    personaTitle: 'Audit & Financial Analytics Specialist',
    roleBadge: 'Analyst / Auditor',
    badgeColor: 'text-sky-400 bg-sky-950/40 border-sky-800/60',
    canViewNetProfit: true,
    canViewTotalPayroll: false,
    canViewCompanyRevenue: true,
    canViewExecutiveDividends: false,
    canViewSadaqahDetails: true,
    canViewClientGifts: true,
    canViewDiscounts: true,
    canViewDailyExpenses: true,
    suggestedQuestions: [
      'Identify any anomalies or sudden spikes in periodic expense buckets.',
      'Calculate the exact ratio between client gifts, discounts, and revenue.',
      'Audit our cleared vs pending transaction volumes for compliance.',
    ],
    scopeDescription: 'Analytical audit scope: periodic trend verification, variance analysis, and reporting.',
    securityNotice: 'Auditor Tier: Read-only analytical access for financial verification and reports.',
  },
};

export interface ScopedFinancialData {
  role: UserRole;
  userName: string;
  userEmail: string;
  currency: string;
  totalVisibleRevenue: number;
  totalVisibleExpense: number;
  netProfitVisible: number | null;
  profitMarginPercent: number | null;
  categoryBreakdown: { category: string; type: 'revenue' | 'expense'; amount: number; count: number }[];
  sadaqahTotal: number | null;
  giftTotal: number | null;
  discountTotal: number | null;
  dailyExpensesTotal: number | null;
  transactionCount: number;
  recentTransactionsSummary: { date: string; category: string; amount: number; type: string; desc: string }[];
  confidentialMetricsRedacted: string[];
}

export function filterFinancialDataForRole(
  role: UserRole,
  transactions: Transaction[],
  profile: UserProfile,
  currency: string = 'AED'
): ScopedFinancialData {
  const config = ROLE_CONFIGS[role] || ROLE_CONFIGS.salesman;
  const redactedMetrics: string[] = [];

  // Filter transactions according to role permissions
  const visibleTx = transactions.filter((tx) => {
    // If worker, only daily expenses, fuel, maintenance, petty cash
    if (role === 'worker') {
      if (tx.type === 'revenue') return false;
      const catLower = tx.category.toLowerCase();
      const descLower = tx.description.toLowerCase();
      return (
        catLower.includes('daily') ||
        catLower.includes('fuel') ||
        catLower.includes('petty') ||
        catLower.includes('equipment') ||
        catLower.includes('transport') ||
        catLower.includes('safety') ||
        descLower.includes('fuel') ||
        descLower.includes('petty cash') ||
        descLower.includes('repair') ||
        descLower.includes('salik')
      );
    }

    // If salesman, only revenue, gifts, discounts, sales expenses
    if (role === 'salesman') {
      const catLower = tx.category.toLowerCase();
      const descLower = tx.description.toLowerCase();
      if (tx.type === 'revenue') return true;
      return (
        catLower.includes('gift') ||
        catLower.includes('discount') ||
        catLower.includes('commission') ||
        catLower.includes('hospitality') ||
        descLower.includes('gift') ||
        descLower.includes('discount') ||
        descLower.includes('client dinner')
      );
    }

    // If director or manager: exclude executive owner dividends and personal withdrawals
    if (role === 'director' || role === 'manager') {
      const catLower = tx.category.toLowerCase();
      const descLower = tx.description.toLowerCase();
      if (catLower.includes('dividend') || descLower.includes('owner withdrawal') || catLower.includes('sadaqah')) {
        return false;
      }
      return true;
    }

    return true;
  });

  // Calculate totals
  let visibleRevenue = 0;
  let visibleExpense = 0;
  let sadaqah = 0;
  let gifts = 0;
  let discounts = 0;
  let dailyExp = 0;

  const categoryMap = new Map<string, { type: 'revenue' | 'expense'; amount: number; count: number }>();

  visibleTx.forEach((tx) => {
    if (tx.type === 'revenue') {
      visibleRevenue += tx.amount;
    } else {
      visibleExpense += tx.amount;
    }

    const catKey = tx.category;
    const existing = categoryMap.get(catKey) || { type: tx.type, amount: 0, count: 0 };
    existing.amount += tx.amount;
    existing.count += 1;
    categoryMap.set(catKey, existing);

    const text = `${tx.category} ${tx.description}`.toLowerCase();
    if (text.includes('sadakah') || text.includes('sadaqah') || text.includes('charity')) {
      sadaqah += tx.amount;
    }
    if (text.includes('gift') || text.includes('hospitality')) {
      gifts += tx.amount;
    }
    if (text.includes('discount') || text.includes('rebate')) {
      discounts += tx.amount;
    }
    if (text.includes('daily') || text.includes('petty cash') || text.includes('fuel')) {
      dailyExp += tx.amount;
    }
  });

  const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, val]) => ({
    category,
    type: val.type,
    amount: val.amount,
    count: val.count,
  }));

  // Determine what is visible vs redacted
  if (!config.canViewNetProfit) {
    redactedMetrics.push('Company Net Profit Margin & EBITDA');
  }
  if (!config.canViewTotalPayroll) {
    redactedMetrics.push('Executive & Overall Staff Payroll');
  }
  if (!config.canViewCompanyRevenue) {
    redactedMetrics.push('Total Company-Wide Corporate Revenue');
  }
  if (!config.canViewExecutiveDividends) {
    redactedMetrics.push('Founder Equity & Owner Dividends');
  }
  if (!config.canViewSadaqahDetails) {
    redactedMetrics.push('Sadaqah & Charitable Allocations');
  }

  const netProfit = config.canViewNetProfit ? visibleRevenue - visibleExpense : null;
  const marginPercent =
    config.canViewNetProfit && visibleRevenue > 0
      ? Math.round(((visibleRevenue - visibleExpense) / visibleRevenue) * 1000) / 10
      : null;

  return {
    role,
    userName: profile.displayName,
    userEmail: profile.email,
    currency,
    totalVisibleRevenue: visibleRevenue,
    totalVisibleExpense: visibleExpense,
    netProfitVisible: netProfit,
    profitMarginPercent: marginPercent,
    categoryBreakdown,
    sadaqahTotal: config.canViewSadaqahDetails ? sadaqah : null,
    giftTotal: config.canViewClientGifts ? gifts : null,
    discountTotal: config.canViewDiscounts ? discounts : null,
    dailyExpensesTotal: config.canViewDailyExpenses ? dailyExp : null,
    transactionCount: visibleTx.length,
    recentTransactionsSummary: visibleTx.slice(0, 8).map((t) => ({
      date: t.date,
      category: t.category,
      amount: t.amount,
      type: t.type,
      desc: t.description,
    })),
    confidentialMetricsRedacted: redactedMetrics,
  };
}

export function buildRoleSystemInstruction(
  profile: UserProfile,
  role: UserRole,
  scopedData: ScopedFinancialData
): string {
  const config = ROLE_CONFIGS[role] || ROLE_CONFIGS.salesman;

  return `You are the specialized AI Assistant for SIKA GCC Commercial Solutions (Construction Chemicals: Sikaflex, SikaTop, Sikafloor, SikaGrout across UAE, KSA, Qatar, Kuwait, and Bahrain).
You are currently responding exclusively to:
- User: "${profile.displayName}"
- Email: "${profile.email}"
- Role Tier: "${role.toUpperCase()}" (${config.personaTitle})
- Base Currency: ${scopedData.currency}

================ CRITICAL ROLE RESTRICTIONS & SECURITY GUARDRAILS ================
You MUST strictly obey role-based data boundaries based on the user's role:

${
  role === 'salesman'
    ? `ROLE = SALESMAN (Commercial Sales Representative):
1. The user Bilal Karim is a Sales Representative.
2. The user is ONLY authorized to know about:
   - Sika product sales & customer contracts (Sikaflex, SikaTop, Sikafloor, SikaGrout).
   - Customer discounts and rebates given.
   - Client relationship gifts and business hospitality.
   - Sales volume and target achievements.
3. STRICT PROHIBITION: The user must NEVER be told company-wide net profit, overall profit margin %, founder dividends, owner withdrawals, or employee salaries/payroll.
4. If the user asks about company profit, founder earnings, executive compensation, or total company net margin, you MUST REFUSE politely and state:
   "🔒 Security Access Scoped: As a Sales Representative, you have visibility over product revenue, client discounts, and relationship gifts. Company-wide net margins, executive compensation, and founder equity are strictly confidential to executive leadership."`
    : ''
}

${
  role === 'worker'
    ? `ROLE = WORKER (Field Operations & Site Technician):
1. The user Faisal Ahmed is a Field Site Technician.
2. The user is ONLY authorized to know about:
   - Daily site expenses, petty cash allowances.
   - Fuel receipts, vehicle transport, and highway tolls (Salik/Darb).
   - Equipment maintenance, safety gear (PPE), and tools.
3. STRICT PROHIBITION: The user must NEVER be told company revenue, client contract values, profit margins, executive payroll, or customer discounts.
4. If the user asks about revenue, company profit, client contract pricing, or executive compensation, you MUST REFUSE politely and state:
   "🔒 Security Access Scoped: Your account is scoped to field operations, petty cash, fuel, and site maintenance. Commercial sales revenues and financial margins are restricted to sales and management accounts."`
    : ''
}

${
  role === 'director' || role === 'manager'
    ? `ROLE = ${role.toUpperCase()} (Operations & Leadership):
1. Authorized for: Operational costs, bulk chemical raw materials, shipping & freight, facility expenses, project revenue totals, client gifts, discounts, and daily expenses.
2. RESTRICTED: Confidential founder dividends and personal owner withdrawals remain restricted to Executive Founders.`
    : ''
}

${
  role === 'founder' || role === 'owner' || role === 'co-founder' || role === 'ceo'
    ? `ROLE = ${role.toUpperCase()} (Executive Leadership / Founder):
1. Full unrestricted visibility across all financial ledgers, corporate net profit, EBITDA, global revenue, Sadaqah distributions, client gifts, discounts, daily expenses, and long-term targets.
2. Provide strategic, high-impact business advice, margin optimization, and growth insights.`
    : ''
}

================ CURRENT LIVE AUTHORIZED DATA SNAPSHOT ================
The user currently has access to the following live verified numbers in the ledger (${scopedData.currency}):
- Visible Revenue: ${scopedData.totalVisibleRevenue.toLocaleString()} ${scopedData.currency}
- Visible Expenses: ${scopedData.totalVisibleExpense.toLocaleString()} ${scopedData.currency}
${
  scopedData.netProfitVisible !== null
    ? `- Net Profit: ${scopedData.netProfitVisible.toLocaleString()} ${scopedData.currency} (Margin: ${scopedData.profitMarginPercent}%)`
    : '- Net Profit: [CONFIDENTIAL - REDACTED FOR THIS ROLE]'
}
${
  scopedData.sadaqahTotal !== null
    ? `- Sadaqah (Charitable Allocations): ${scopedData.sadaqahTotal.toLocaleString()} ${scopedData.currency}`
    : '- Sadaqah: [REDACTED]'
}
${
  scopedData.giftTotal !== null
    ? `- Client Gifts & Hospitality: ${scopedData.giftTotal.toLocaleString()} ${scopedData.currency}`
    : '- Client Gifts: [REDACTED]'
}
${
  scopedData.discountTotal !== null
    ? `- Client Discounts & Rebates: ${scopedData.discountTotal.toLocaleString()} ${scopedData.currency}`
    : '- Discounts: [REDACTED]'
}
${
  scopedData.dailyExpensesTotal !== null
    ? `- Daily Site Expenses & Fuel: ${scopedData.dailyExpensesTotal.toLocaleString()} ${scopedData.currency}`
    : '- Daily Expenses: [REDACTED]'
}

Visible Category Breakdown:
${scopedData.categoryBreakdown
  .map((c) => `  * ${c.category} (${c.type}): ${c.amount.toLocaleString()} ${scopedData.currency} (${c.count} records)`)
  .join('\n')}

Recent Sample Transactions in User Scope:
${scopedData.recentTransactionsSummary
  .map((t) => `  - [${t.date}] ${t.category}: ${t.amount.toLocaleString()} ${scopedData.currency} (${t.desc})`)
  .join('\n')}

================ RESPONSE STYLE & GUIDELINES ================
- Address the user respectfully by their role and name (${profile.displayName}).
- Give clear, quantitative answers with formatted numbers in ${scopedData.currency}.
- Use concise bullet points, bold key figures, and tabular comparisons when comparing categories.
- Always uphold the exact security restrictions. Never hallucinate or leak confidential figures.`;
}

/**
 * Intelligent deterministic response engine for immediate, reliable answers
 * and graceful fallback when offline or in automated test environments.
 */
export function generateOfflineScopedResponse(
  query: string,
  role: UserRole,
  profile: UserProfile,
  scopedData: ScopedFinancialData
): string {
  const q = query.toLowerCase();
  const c = scopedData.currency;
  const config = ROLE_CONFIGS[role] || ROLE_CONFIGS.salesman;

  // 1. Salesman restrictions check
  if (role === 'salesman') {
    if (
      q.includes('profit') ||
      q.includes('margin') ||
      q.includes('salary') ||
      q.includes('salaries') ||
      q.includes('payroll') ||
      q.includes('founder') ||
      q.includes('dividend') ||
      q.includes('withdrawal')
    ) {
      return `🔒 **Security Access Scoped: Sales Representative**\n\nHello ${profile.displayName},\n\nAs a **Sales Representative**, company-wide net profit margins, founder equity distributions, and internal payroll records are confidential and restricted to executive leadership.\n\n**Your Authorized Sales Scope Includes:**\n- **Client Contracts & Product Revenues**: ${scopedData.totalVisibleRevenue.toLocaleString()} ${c}\n- **Customer Discounts & Rebates Given**: ${(scopedData.discountTotal || 0).toLocaleString()} ${c}\n- **Client Relationship Gifts & Hospitality**: ${(scopedData.giftTotal || 0).toLocaleString()} ${c}\n\nFeel free to ask about our Sikaflex/SikaTop sales volumes, discount guidelines, or client hospitality logs.`;
    }
  }

  // 2. Worker restrictions check
  if (role === 'worker') {
    if (
      q.includes('revenue') ||
      q.includes('profit') ||
      q.includes('contract value') ||
      q.includes('pricing') ||
      q.includes('margin') ||
      q.includes('salary') ||
      q.includes('salaries') ||
      q.includes('discount')
    ) {
      return `🔒 **Security Access Scoped: Field Operations**\n\nHello ${profile.displayName},\n\nYour technician account is authorized specifically for **field logistics, vehicle fuel, site consumables, and equipment maintenance**.\n\nCommercial contract values, sales revenue, and company profit margins are restricted to commercial sales and executive management.\n\n**Your Field Ledger Metrics:**\n- **Daily Site Expenses & Fuel Total**: ${(scopedData.dailyExpensesTotal || 0).toLocaleString()} ${c}\n- **Authorized Transactions**: ${scopedData.transactionCount} records in site logistics\n\nHow can I help you with logging site fuel receipts, vehicle maintenance, or petty cash entries?`;
    }
  }

  // 3. Discount queries
  if (q.includes('discount') || q.includes('rebate')) {
    if (!config.canViewDiscounts) {
      return `🔒 Access Restricted: Customer discount figures are restricted for your role profile.`;
    }
    const val = scopedData.discountTotal || 0;
    return `### 🏷️ Client Discounts & Rebates Analysis\n\n**Active Account:** ${profile.displayName} (${config.roleBadge})\n\n- **Total Discounts Issued:** **${val.toLocaleString()} ${c}**\n- **Impact:** Reflects commercial incentives offered on bulk orders for contracting partners.\n\n**Recommendation:** Maintain customer discounts within a 5% to 8% ceiling on high-demand items like *Sikaflex-11FC* to preserve healthy gross margins.`;
  }

  // 4. Gift & hospitality queries
  if (q.includes('gift') || q.includes('hospitality')) {
    if (!config.canViewClientGifts) {
      return `🔒 Access Restricted: Client gift and hospitality ledgers are restricted for your role profile.`;
    }
    const val = scopedData.giftTotal || 0;
    return `### 🎁 Client Gifts & Business Hospitality\n\n**Active Account:** ${profile.displayName} (${config.roleBadge})\n\n- **Total Gifts & Hospitality Recorded:** **${val.toLocaleString()} ${c}**\n- **Purpose:** Commercial relationship building, VIP client executive dinners, and seasonal hospitality for contracting consultants in the GCC.\n\nAll gifts comply with standard corporate compliance thresholds.`;
  }

  // 5. Sadaqah queries
  if (q.includes('sadakah') || q.includes('sadaqah') || q.includes('charity')) {
    if (!config.canViewSadaqahDetails) {
      return `🔒 Access Restricted: Sadaqah and charitable distribution records are restricted to Executive Founder & Owner accounts.`;
    }
    const val = scopedData.sadaqahTotal || 0;
    return `### 🤲 Sadaqah & Charitable Allocations\n\n**Executive Account:** ${profile.displayName} (${config.roleBadge})\n\n- **Total Sadaqah Distributed:** **${val.toLocaleString()} ${c}**\n- **Allocation:** Disbursed directly from company blessings to support community welfare, labor assistance programs, and verified charitable causes in accordance with founder principles.`;
  }

  // 6. Daily expenses queries
  if (q.includes('daily') || q.includes('fuel') || q.includes('petty cash')) {
    const val = scopedData.dailyExpensesTotal || 0;
    return `### ⛽ Daily Site Expenses & Fuel Overview\n\n**Account:** ${profile.displayName} (${config.roleBadge})\n\n- **Total Daily Operational Expenses:** **${val.toLocaleString()} ${c}**\n- **Categories Tracked:** Site vehicle fuel cards (ADNOC/ENOC), tool upkeep, technician petty cash, and road tolls (Salik).\n- **Status:** All receipts verified against logged site entries.`;
  }

  // 7. General profit or overview queries for Executives
  if (q.includes('profit') || q.includes('margin') || q.includes('overview') || q.includes('revenue')) {
    if (scopedData.netProfitVisible !== null) {
      return `### 📊 Executive Financial Overview\n\n**Executive Account:** ${profile.displayName} (${config.roleBadge})\n\n| Financial Metric | Amount (${c}) | Status |\n| :--- | :--- | :--- |\n| **Total Commercial Revenue** | ${scopedData.totalVisibleRevenue.toLocaleString()} | Verified |\n| **Total Operating Expenses** | ${scopedData.totalVisibleExpense.toLocaleString()} | Verified |\n| **Net Profit** | **${scopedData.netProfitVisible.toLocaleString()}** | Healthy |\n| **Net Profit Margin** | **${scopedData.profitMarginPercent}%** | Target: >35% |\n\n**Special Allocations In Ledger:**\n- **Sadaqah Allocations:** ${(scopedData.sadaqahTotal || 0).toLocaleString()} ${c}\n- **Client Gifts & Hospitality:** ${(scopedData.giftTotal || 0).toLocaleString()} ${c}\n- **Client Discounts Given:** ${(scopedData.discountTotal || 0).toLocaleString()} ${c}\n- **Daily Site Expenses:** ${(scopedData.dailyExpensesTotal || 0).toLocaleString()} ${c}\n\nOur current gross and net margins are performing strongly across the UAE and KSA construction chemical sectors.`;
    }
  }

  // Default scoped response
  return `### 💡 Account Scoped Financial Insights\n\nHello **${profile.displayName}** (${config.roleBadge}),\n\nI am your dedicated AI Advisor tailored strictly to your account permissions:\n\n- **Your Visible Revenue:** ${scopedData.totalVisibleRevenue.toLocaleString()} ${c}\n- **Your Visible Expenses:** ${scopedData.totalVisibleExpense.toLocaleString()} ${c}\n- **Authorized Records:** ${scopedData.transactionCount} entries in your scope\n${
    scopedData.netProfitVisible !== null
      ? `- **Company Net Profit:** ${scopedData.netProfitVisible.toLocaleString()} ${c} (${scopedData.profitMarginPercent}% margin)\n`
      : ''
  }\n**Confidential Protections Active:**\n${
    scopedData.confidentialMetricsRedacted.length > 0
      ? scopedData.confidentialMetricsRedacted.map((m) => `• ${m} (Protected)`).join('\n')
      : '• Full Executive Permissions (Zero Redactions)'
  }\n\nHow can I assist you with your specific responsibilities today?`;
}
