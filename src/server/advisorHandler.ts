import { GoogleGenAI } from '@google/genai';
import {
  filterFinancialDataForRole,
  buildRoleSystemInstruction,
  generateOfflineScopedResponse,
  ROLE_CONFIGS,
} from '../utils/aiRoleScopingEngine';
import { UserRole, UserProfile, Transaction } from '../types';

let genAIClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

export interface AdvisorRequestBody {
  message: string;
  role: UserRole;
  profile: UserProfile;
  transactions?: Transaction[];
  currency?: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

export interface AdvisorResponseBody {
  success: boolean;
  answer: string;
  source: 'gemini-3.8-flash' | 'scoped-deterministic-engine';
  role: UserRole;
  personaTitle: string;
  securityNotice: string;
  scopedMetrics: {
    totalRevenue: number;
    totalExpense: number;
    netProfit: number | null;
    profitMargin: number | null;
    sadaqah: number | null;
    gifts: number | null;
    discounts: number | null;
    dailyExpenses: number | null;
    currency: string;
    confidentialRedactions: string[];
  };
}

export async function handleAdvisorQuery(body: AdvisorRequestBody): Promise<AdvisorResponseBody> {
  const { message, role, profile, transactions = [], currency = 'AED', history = [] } = body;
  const config = ROLE_CONFIGS[role] || ROLE_CONFIGS.salesman;

  const scopedData = filterFinancialDataForRole(role, transactions, profile, currency);
  const systemInstruction = buildRoleSystemInstruction(profile, role, scopedData);

  const client = getGeminiClient();

  if (client) {
    try {
      // Build contents array for gemini-3.8-flash
      const contents = [
        ...history.slice(-6).map((h) => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content }],
        })),
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ];

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.3,
        },
      });

      const answer = response.text || generateOfflineScopedResponse(message, role, profile, scopedData);

      return {
        success: true,
        answer,
        source: 'gemini-3.8-flash',
        role,
        personaTitle: config.personaTitle,
        securityNotice: config.securityNotice,
        scopedMetrics: {
          totalRevenue: scopedData.totalVisibleRevenue,
          totalExpense: scopedData.totalVisibleExpense,
          netProfit: scopedData.netProfitVisible,
          profitMargin: scopedData.profitMarginPercent,
          sadaqah: scopedData.sadaqahTotal,
          gifts: scopedData.giftTotal,
          discounts: scopedData.discountTotal,
          dailyExpenses: scopedData.dailyExpensesTotal,
          currency: scopedData.currency,
          confidentialRedactions: scopedData.confidentialMetricsRedacted,
        },
      };
    } catch (apiError: any) {
      console.warn('Gemini API call failed or rate-limited; falling back to scoped engine:', apiError?.message || apiError);
    }
  }

  // Scoped deterministic fallback
  const fallbackAnswer = generateOfflineScopedResponse(message, role, profile, scopedData);

  return {
    success: true,
    answer: fallbackAnswer,
    source: 'scoped-deterministic-engine',
    role,
    personaTitle: config.personaTitle,
    securityNotice: config.securityNotice,
    scopedMetrics: {
      totalRevenue: scopedData.totalVisibleRevenue,
      totalExpense: scopedData.totalVisibleExpense,
      netProfit: scopedData.netProfitVisible,
      profitMargin: scopedData.profitMarginPercent,
      sadaqah: scopedData.sadaqahTotal,
      gifts: scopedData.giftTotal,
      discounts: scopedData.discountTotal,
      dailyExpenses: scopedData.dailyExpensesTotal,
      currency: scopedData.currency,
      confidentialRedactions: scopedData.confidentialMetricsRedacted,
    },
  };
}
