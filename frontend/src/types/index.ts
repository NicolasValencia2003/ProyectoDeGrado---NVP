export interface RecommendationItem {
  ticker: string;
  name: string;
  allocation_pct: number;
  rationale: string;
  key_risk: string;
  asset_class: string;
  sector: string;
  current_price: number | null;
  change_1d_pct: number | null;
}

export interface Recommendation {
  recommendations: RecommendationItem[];
  market_summary: string;
  disclaimer: string;
}

export interface PriceCache {
  ticker: string;
  name: string;
  price: number;
  change_1d_pct: number;
  asset_class: string;
  sector: string;
  risk_level: number;
  updated_at: string;
}

export interface MarketAlert {
  id: number;
  condition_name: string;
  severity: 'info' | 'warning' | 'danger';
  message: string;
  created_at: string;
  read_by: string[];
}

export interface HistoryRecommendationItem extends RecommendationItem {
  price_at_rec?: number;
  performance_pct: number | null;
}

export interface HistoryEntry {
  id: number;
  risk_score_used: number;
  created_at: string;
  market_snapshot: { fear_greed: number; fear_greed_label: string; treasury_10y: number };
  payload: {
    recommendations: HistoryRecommendationItem[];
    market_summary: string;
    disclaimer: string;
  };
}

export interface UserEvent {
  event_type: 'view' | 'dwell' | 'save' | 'unsave' | 'dismiss' | 'rate_up' | 'rate_down';
  asset_ticker: string;
  asset_class: string;
  sector: string;
  dwell_seconds?: number;
}

export interface LifeProfile {
  age_group?: string;
  occupation_type?: string;
  education_level?: string;
  family_context?: string;
  primary_goal?: string;
  motivation?: string;
}

export interface SurveyResponse {
  user_id: string;
  survey_type: 'pre' | 'post';
  section_a_score: number;
  section_b_score: number;
  section_c_score: number;
  overall_rating: number;
  open_feedback?: string;
  would_recommend?: boolean;
  completed_at: string;
}

export interface DetectedBias {
  type: string;
  strength: number;
  message_es: string;
  example_tickers?: string[];
}

export interface ActiveBias {
  key: string;
  score: number;
  name: string;
  icon: string;
  description: string;
  intervention: string;
  tip: string;
  evidence: string;
  prompt_instruction: string;
}

export interface BiasAnalysisResult {
  scores: Record<string, number>;
  active: ActiveBias[];
  last_updated: string;
}
