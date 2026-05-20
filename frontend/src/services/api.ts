import axios from 'axios';
import type { UserEvent, Recommendation, MarketAlert, HistoryEntry, PriceCache, SurveyResponse, BiasAnalysisResult } from '../types';
import { supabase } from '../lib/supabase';

const api = axios.create({ baseURL: 'http://localhost:3000/api', timeout: 35000 });

// Attach Supabase JWT to every request
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export const getRecommendation = (riskOverride?: number, opts?: { excludedTickers?: string[] }): Promise<Recommendation> =>
  api.post('/recommendations/generate', { risk_override: riskOverride, excluded_tickers: opts?.excludedTickers }).then(r => r.data);

export const logEvent = (event: UserEvent): Promise<{ ok: boolean }> =>
  api.post('/events', event).then(r => r.data);

export const getAlerts = (): Promise<MarketAlert[]> =>
  api.get('/alerts').then(r => r.data);

export const markAlertRead = (id: number): Promise<void> =>
  api.patch(`/alerts/${id}/read`).then(r => r.data);

export const getHistory = (): Promise<HistoryEntry[]> =>
  api.get('/history').then(r => r.data);

export const getPrices = (): Promise<Record<string, PriceCache>> =>
  api.get('/market/prices').then(r => r.data);

export const getSentiment = (): Promise<any> =>
  api.get('/market/sentiment').then(r => r.data);

export const saveSurvey = (data: Partial<SurveyResponse>): Promise<{ ok: boolean }> =>
  api.post('/survey', data).then(r => r.data);

export const getSurvey = (type: 'pre' | 'post'): Promise<SurveyResponse | null> =>
  api.get(`/survey?type=${type}`).then(r => r.data).catch(() => null);

export const getSurveyComparison = (): Promise<{ pre: SurveyResponse | null; post: SurveyResponse | null }> =>
  api.get('/survey/comparison').then(r => r.data).catch(() => ({ pre: null, post: null }));

export const sendChatMessage = (
  messages: { role: 'user' | 'assistant'; content: string }[],
): Promise<{ reply: string }> =>
  api.post('/chat', { messages }).then(r => r.data);

export const getBiasAnalysis = (): Promise<BiasAnalysisResult> =>
  api.get('/bias/analysis').then(r => r.data).catch(() => ({ scores: {}, active: [], last_updated: '' }));

export interface BanditProfile {
  top_liked:             Array<{ ticker: string; net_reward: number; feedback_count: number }>;
  top_disliked:          Array<{ ticker: string; net_reward: number; feedback_count: number }>;
  total_feedback_events: number;
  total_tickers_seen:    number;
  personalization_pct:   number;
  positive_rate:         number;
}

export const getBanditProfile = (): Promise<BanditProfile> =>
  api.get('/bandit/profile').then(r => r.data).catch(() => ({
    top_liked: [], top_disliked: [], total_feedback_events: 0,
    total_tickers_seen: 0, personalization_pct: 0, positive_rate: 0,
  }));

export const logBehaviorEvent = (
  event_type: string,
  opts: { asset_class?: string; sector?: string; asset_ticker?: string; metadata?: Record<string, any> } = {},
): void => {
  api.post('/events', { event_type, ...opts }).catch(() => {});
};
