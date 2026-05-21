#!/usr/bin/env python3
"""
FinVise — C4 Diagram Generator
Genera los tres diagramas de arquitectura C4 del proyecto de tesis.
Run: python3.11 generate_diagrams.py
"""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import matplotlib.patheffects as pe
import numpy as np

# ── Paleta de colores ──────────────────────────────────────────────────────────
BG_DARK    = '#0d1117'
BG_SURFACE = '#161b22'
BG_CARD    = '#1c2128'
BG_CARD2   = '#21262d'

GOLD       = '#d4a843'
GOLD_DIM   = '#8a6d2a'
CYAN       = '#58a6ff'
CYAN_DIM   = '#1f4e79'
GREEN      = '#3fb950'
GREEN_DIM  = '#1a4a25'
PURPLE     = '#bc8cff'
PURPLE_DIM = '#3d2060'
AMBER      = '#e3b341'
AMBER_DIM  = '#5a4010'
RED        = '#f85149'
RED_DIM    = '#4a1515'
TEAL       = '#39c5cf'
TEAL_DIM   = '#0d3d42'
PINK       = '#f778ba'
PINK_DIM   = '#4a1535'

TEXT_PRI   = '#e6edf3'
TEXT_SEC   = '#8b949e'
TEXT_MUT   = '#484f58'
BORDER     = '#30363d'

# ── Helpers ────────────────────────────────────────────────────────────────────
def box(ax, x, y, w, h, label, sublabel='', color=CYAN, fill=BG_CARD,
        fontsize=8, label_fontsize=9, style='round,pad=0.1', alpha=0.92,
        bold=True, border_lw=1.4):
    rect = FancyBboxPatch((x, y), w, h,
                           boxstyle=style, linewidth=border_lw,
                           edgecolor=color, facecolor=fill, alpha=alpha, zorder=3)
    ax.add_patch(rect)
    ty = y + h / 2 + (0.12 if sublabel else 0)
    ax.text(x + w/2, ty, label,
            ha='center', va='center', fontsize=label_fontsize, color=TEXT_PRI,
            fontweight='bold' if bold else 'normal', zorder=4,
            wrap=True)
    if sublabel:
        ax.text(x + w/2, y + h/2 - 0.18, sublabel,
                ha='center', va='center', fontsize=fontsize - 0.5,
                color=TEXT_SEC, zorder=4, style='italic')

def container_box(ax, x, y, w, h, title, tech='', color=CYAN, fill=BG_SURFACE,
                  fontsize=7.5, title_fontsize=10, lw=1.6):
    rect = FancyBboxPatch((x, y), w, h,
                           boxstyle='round,pad=0.12', linewidth=lw,
                           edgecolor=color, facecolor=fill, alpha=0.6, zorder=2)
    ax.add_patch(rect)
    ax.text(x + w/2, y + h - 0.22, title,
            ha='center', va='top', fontsize=title_fontsize, color=color,
            fontweight='bold', zorder=4)
    if tech:
        ax.text(x + w/2, y + h - 0.44, f'[{tech}]',
                ha='center', va='top', fontsize=fontsize, color=TEXT_SEC,
                style='italic', zorder=4)

def arrow(ax, x1, y1, x2, y2, label='', color=TEXT_SEC, lw=1.2,
          style='->', fontsize=6.5, label_offset=(0, 0.08), zorder=5):
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle=style, color=color,
                                lw=lw, connectionstyle='arc3,rad=0.0'),
                zorder=zorder)
    if label:
        mx, my = (x1 + x2) / 2 + label_offset[0], (y1 + y2) / 2 + label_offset[1]
        ax.text(mx, my, label, ha='center', va='bottom',
                fontsize=fontsize, color=color, zorder=zorder + 1,
                bbox=dict(boxstyle='round,pad=0.15', fc=BG_DARK, ec='none', alpha=0.85))

def curved_arrow(ax, x1, y1, x2, y2, label='', color=TEXT_SEC, lw=1.2,
                 rad=0.2, fontsize=6.5, label_offset=(0, 0.08)):
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle='->', color=color, lw=lw,
                                connectionstyle=f'arc3,rad={rad}'),
                zorder=5)
    if label:
        mx = (x1 + x2) / 2 + label_offset[0]
        my = (y1 + y2) / 2 + label_offset[1]
        ax.text(mx, my, label, ha='center', va='bottom',
                fontsize=fontsize, color=color, zorder=6,
                bbox=dict(boxstyle='round,pad=0.15', fc=BG_DARK, ec='none', alpha=0.85))

def section_label(ax, x, y, text, color=TEXT_MUT, fontsize=7):
    ax.text(x, y, text, ha='left', va='bottom', fontsize=fontsize,
            color=color, fontweight='bold', zorder=4)

def legend_entry(ax, x, y, color, label, fontsize=7.5):
    rect = FancyBboxPatch((x, y), 0.25, 0.18,
                           boxstyle='round,pad=0.04', linewidth=1.2,
                           edgecolor=color, facecolor=BG_CARD, zorder=6)
    ax.add_patch(rect)
    ax.text(x + 0.32, y + 0.09, label, ha='left', va='center',
            fontsize=fontsize, color=TEXT_SEC, zorder=7)

# ══════════════════════════════════════════════════════════════════════════════
#  DIAGRAMA 1 — Sistema Completo (C4 Contenedores)
# ══════════════════════════════════════════════════════════════════════════════
def make_diagram1():
    fig, ax = plt.subplots(figsize=(22, 14))
    fig.patch.set_facecolor(BG_DARK)
    ax.set_facecolor(BG_DARK)
    ax.set_xlim(0, 22)
    ax.set_ylim(0, 14)
    ax.axis('off')

    # Title
    ax.text(11, 13.6, 'FinVise — Arquitectura General del Sistema',
            ha='center', va='top', fontsize=16, color=TEXT_PRI,
            fontweight='bold', fontfamily='DejaVu Serif')
    ax.text(11, 13.2, 'Diagrama C4 · Nivel Contenedores · Proyecto de Grado — PUJ Cali 2025',
            ha='center', va='top', fontsize=8, color=TEXT_SEC, style='italic')

    # ── ACTOR: Usuario ──────────────────────────────────────────────────────
    # Person icon (circle head + body)
    ax.add_patch(plt.Circle((1.25, 8.0), 0.28, color=GOLD, zorder=5, linewidth=0))
    ax.plot([1.25, 1.25], [7.72, 7.1], color=GOLD, lw=2, zorder=5)
    ax.plot([0.85, 1.65], [7.5, 7.5], color=GOLD, lw=2, zorder=5)
    ax.plot([1.25, 0.9], [7.1, 6.7], color=GOLD, lw=2, zorder=5)
    ax.plot([1.25, 1.6], [7.1, 6.7], color=GOLD, lw=2, zorder=5)
    ax.text(1.25, 6.48, 'Usuario', ha='center', fontsize=9, color=TEXT_PRI,
            fontweight='bold', zorder=5)
    ax.text(1.25, 6.22, 'Inversor / Estudiante', ha='center', fontsize=7,
            color=TEXT_SEC, zorder=5)

    # ── FRONTEND CONTAINER ─────────────────────────────────────────────────
    container_box(ax, 2.6, 5.5, 5.2, 7.8, 'Frontend SPA',
                  'React 18 + Vite + TypeScript + Tailwind CSS', color=CYAN, fill='#0d1e2e')

    box(ax, 2.85, 12.0, 4.7, 0.72, 'BrowserRouter + ProtectedRoute',
        'React Router v6 · Guarda auth/disclaimer/risk_score', color=CYAN, fill=BG_CARD2,
        fontsize=7, label_fontsize=7.8)

    box(ax, 2.85, 10.95, 4.7, 0.82, 'AuthContext (React Context API)',
        'user · profile · loading · signOut\nsupabase.auth.onAuthStateChange()', color=CYAN, fill=BG_CARD2,
        fontsize=6.5, label_fontsize=7.8)

    box(ax, 2.85, 9.95, 4.7, 0.75, 'Páginas (Routes)',
        'Landing · Disclaimer · Onboarding · Survey\nDashboard · Trayectoria · Chat · Glosario · Perfil',
        color=PURPLE, fill=BG_CARD2, fontsize=6.2, label_fontsize=7.5)

    box(ax, 2.85, 8.9, 4.7, 0.78, 'Componentes Reutilizables',
        'RecommendationCard · PortfolioSimulator · ScenarioTabs\nBiasAlert · LiveStrip · PersonalizationProgress · NotificationBell',
        color=PURPLE, fill=BG_CARD2, fontsize=6, label_fontsize=7.5)

    box(ax, 2.85, 7.9, 4.7, 0.75, 'Capa de Servicios',
        'api.ts (axios, timeout 35s) · supabase.ts\ndashboardCache.ts (TTL 5 min) · useEventLogger.ts',
        color=GREEN, fill=BG_CARD2, fontsize=6.2, label_fontsize=7.5)

    box(ax, 2.85, 6.95, 2.25, 0.72, 'Mock / Types',
        'TypeScript interfaces\nDatos de demostración', color=AMBER, fill=BG_CARD2,
        fontsize=6.2, label_fontsize=7.2)
    box(ax, 5.3, 6.95, 2.25, 0.72, 'Vite Build',
        'dist/ bundle · HMR\ndev: puerto 5173', color=AMBER, fill=BG_CARD2,
        fontsize=6.2, label_fontsize=7.2)

    box(ax, 2.85, 5.75, 4.7, 0.95, 'LiveStrip + Precios en Vivo',
        'Polling /api/market/prices · /api/market/sentiment\nFear & Greed · Treasury 10Y · Headlines',
        color=TEAL, fill=BG_CARD2, fontsize=6.2, label_fontsize=7.5)

    # ── BACKEND CONTAINER ──────────────────────────────────────────────────
    container_box(ax, 8.2, 4.0, 5.5, 9.3, 'Backend API',
                  'NestJS · TypeScript · Puerto 3000', color=GREEN, fill='#0a1f12')

    box(ax, 8.45, 12.1, 5.0, 0.72, 'RecommendationsModule',
        'POST /api/recommendations/generate\nMotor UCB Bandit + Claude AI + buildCandidates()',
        color=GREEN, fill=BG_CARD2, fontsize=6.2, label_fontsize=7.8)

    box(ax, 8.45, 11.15, 5.0, 0.72, 'BanditModule (UCB1)',
        'GET /api/bandit/profile\nscore(i) = μᵢ + C·√(ln(N)/nᵢ)  ·  rank() · getScores()',
        color=GREEN, fill=BG_CARD2, fontsize=6.2, label_fontsize=7.8)

    box(ax, 8.45, 10.2, 5.0, 0.72, 'MarketModule',
        'GET /api/market/prices  ·  GET /api/market/sentiment\nMarketDataFetcherService · caché en Supabase',
        color=GREEN, fill=BG_CARD2, fontsize=6.2, label_fontsize=7.8)

    box(ax, 8.45, 9.25, 5.0, 0.72, 'BiasModule',
        'GET /api/bias/analysis\nBiasDetectionService · detección sesgos cognitivos',
        color=GREEN, fill=BG_CARD2, fontsize=6.2, label_fontsize=7.8)

    box(ax, 8.45, 8.3, 5.0, 0.72, 'ChatModule',
        'POST /api/chat\nChatService · Asistente IA educativo · Claude Sonnet 4.6',
        color=GREEN, fill=BG_CARD2, fontsize=6.2, label_fontsize=7.8)

    box(ax, 8.45, 7.35, 2.4, 0.72, 'SurveyModule',
        'GET/POST /api/survey\npre-test · post-test · comparación',
        color=GREEN, fill=BG_CARD2, fontsize=6.0, label_fontsize=7.2)
    box(ax, 11.05, 7.35, 2.4, 0.72, 'HistoryModule',
        'GET /api/history\nrecommendation_history · JSON',
        color=GREEN, fill=BG_CARD2, fontsize=6.0, label_fontsize=7.2)

    box(ax, 8.45, 6.4, 2.4, 0.72, 'AlertsModule',
        'GET/PATCH /api/alerts\nNotificaciones push · umbral precio',
        color=GREEN, fill=BG_CARD2, fontsize=6.0, label_fontsize=7.2)
    box(ax, 11.05, 6.4, 2.4, 0.72, 'EventsModule',
        'POST /api/events\nview · rate_up · rate_down · save · dismiss',
        color=GREEN, fill=BG_CARD2, fontsize=6.0, label_fontsize=7.2)

    box(ax, 8.45, 4.25, 5.0, 0.88, 'SupabaseModule (isGlobal: true)',
        'SupabaseService · @nestjs/config · ConfigModule\nSUPABASE_URL · SUPABASE_SERVICE_KEY · ANTHROPIC_API_KEY',
        color=AMBER, fill=BG_CARD2, fontsize=6.2, label_fontsize=7.8)

    # ── SUPABASE DB CONTAINER ───────────────────────────────────────────────
    container_box(ax, 14.2, 5.5, 5.0, 7.8, 'Base de Datos',
                  'Supabase · PostgreSQL + Auth + RLS', color=AMBER, fill='#1a1400')

    box(ax, 14.45, 12.2, 4.5, 0.6, 'profiles',
        'id · age_group · occupation_type · education_level\nfamily_context · primary_goal · risk_score · motivation',
        color=AMBER, fill=BG_CARD2, fontsize=5.8, label_fontsize=7.2)

    box(ax, 14.45, 11.35, 4.5, 0.6, 'user_events',
        'user_id · event_type · asset_ticker · asset_class\nsector · dwell_seconds · metadata (jsonb)',
        color=AMBER, fill=BG_CARD2, fontsize=5.8, label_fontsize=7.2)

    box(ax, 14.45, 10.5, 4.5, 0.6, 'user_preferences',
        'sector_weights · asset_weights · avoided_tickers\npreferred_tickers · detected_biases · event_count',
        color=AMBER, fill=BG_CARD2, fontsize=5.8, label_fontsize=7.2)

    box(ax, 14.45, 9.65, 4.5, 0.6, 'recommendation_history',
        'user_id · risk_score_used · payload (jsonb)\nmarket_snapshot (jsonb) · created_at',
        color=AMBER, fill=BG_CARD2, fontsize=5.8, label_fontsize=7.2)

    box(ax, 14.45, 8.8, 4.5, 0.6, 'prices_cache',
        'ticker · name · price · change_1d_pct\nasset_class · sector · risk_level · updated_at',
        color=AMBER, fill=BG_CARD2, fontsize=5.8, label_fontsize=7.2)

    box(ax, 14.45, 7.95, 4.5, 0.6, 'sentiment_cache',
        'fear_greed · fear_greed_label · treasury_10y\ntop_headlines (jsonb) · updated_at',
        color=AMBER, fill=BG_CARD2, fontsize=5.8, label_fontsize=7.2)

    box(ax, 14.45, 7.1, 4.5, 0.6, 'survey_responses',
        'survey_type (pre/post) · sections A-D scores\nsection_a/b/c/d_answers (jsonb)',
        color=AMBER, fill=BG_CARD2, fontsize=5.8, label_fontsize=7.2)

    box(ax, 14.45, 6.25, 4.5, 0.6, 'bias_interventions',
        'bias_type · strength · acknowledged\nsector_diversity_before/after',
        color=AMBER, fill=BG_CARD2, fontsize=5.8, label_fontsize=7.2)

    box(ax, 14.45, 5.75, 4.5, 0.28, 'Supabase Auth + Row Level Security',
        '', color=RED, fill=BG_CARD2, fontsize=6, label_fontsize=6.5, bold=False)

    # ── PIPELINE CONTAINER ─────────────────────────────────────────────────
    container_box(ax, 2.6, 0.4, 8.5, 3.3, 'Pipeline de Datos',
                  'n8n Orchestrator + Python Runner · Docker Compose', color=PURPLE, fill='#100d1f')

    box(ax, 2.85, 2.85, 3.8, 0.7, 'n8n Orchestrator',
        'Workflows JSON · Cron: cada 15 min (horario mercado)\nfetch-prices.json · fetch-sentiment.json · update-preferences.json',
        color=PURPLE, fill=BG_CARD2, fontsize=6.0, label_fontsize=7.5)

    box(ax, 2.85, 1.95, 3.8, 0.68, 'Python Runner (puerto 8888)',
        'HTTP server · scripts ejecutables · runner.py\nALLOWED: fetch_prices · fetch_sentiment · update_preferences',
        color=PURPLE, fill=BG_CARD2, fontsize=6.0, label_fontsize=7.5)

    box(ax, 2.85, 0.65, 1.75, 1.1, 'fetch_prices.py',
        'yfinance + CoinGecko\nSPY·AAPL·BND·GLD·BTC\n→ INSERT prices_cache',
        color=PURPLE, fill=BG_CARD2, fontsize=5.8, label_fontsize=7.0)
    box(ax, 4.75, 0.65, 1.95, 1.1, 'fetch_sentiment.py',
        'NewsAPI · FRED API\nFear & Greed Index\n→ INSERT sentiment_cache',
        color=PURPLE, fill=BG_CARD2, fontsize=5.8, label_fontsize=7.0)
    box(ax, 6.85, 0.65, 3.9, 1.1, 'update_preferences.py · update_all_preferences.py\nsignal_weights.py · bias_detector.py · universe.py',
        '', color=PURPLE, fill=BG_CARD2, fontsize=6.0, label_fontsize=6.5, bold=False)

    # ── EXTERNAL APIS CONTAINER ─────────────────────────────────────────────
    container_box(ax, 14.2, 0.4, 5.0, 4.75, 'APIs Externas',
                  'Servicios de Terceros', color=RED, fill='#1a0d0d')

    box(ax, 14.45, 4.05, 4.5, 0.72, 'Anthropic Claude API',
        'claude-sonnet-4-6 · Recomendaciones educativas\nChat AI conversacional · Timeout 20s',
        color=RED, fill=BG_CARD2, fontsize=6.0, label_fontsize=7.5)

    box(ax, 14.45, 3.1, 4.5, 0.72, 'FRED API (Federal Reserve)',
        'Treasury 10Y yield · Indicadores macroeconómicos\nHTTP fetch directo desde Backend',
        color=RED, fill=BG_CARD2, fontsize=6.0, label_fontsize=7.5)

    box(ax, 14.45, 2.15, 2.1, 0.72, 'NewsAPI',
        'Headlines financieros\nglobales (top_headlines)',
        color=RED, fill=BG_CARD2, fontsize=5.8, label_fontsize=7.0)
    box(ax, 16.65, 2.15, 2.3, 0.72, 'Fear & Greed Index\n(CNN Money)',
        'Sentimiento de mercado\n0–100 · label', color=RED, fill=BG_CARD2,
        fontsize=5.8, label_fontsize=6.8)

    box(ax, 14.45, 0.65, 2.1, 1.18, 'yfinance\n(Yahoo Finance)',
        'Precios acciones/ETFs\nSPY·AAPL·BND·GLD…\n50+ tickers',
        color=RED, fill=BG_CARD2, fontsize=5.8, label_fontsize=7.0)
    box(ax, 16.65, 0.65, 2.3, 1.18, 'CoinGecko API',
        'Precios crypto\nBTC·ETH·SOL\nSin API key',
        color=RED, fill=BG_CARD2, fontsize=5.8, label_fontsize=7.0)

    # ── ARROWS ──────────────────────────────────────────────────────────────
    # User → Frontend
    arrow(ax, 1.8, 8.0, 2.6, 8.3, 'HTTPS\nNavegador Web', color=GOLD, lw=1.5,
          fontsize=6, label_offset=(0.1, 0.05))

    # Frontend → Backend (REST API)
    arrow(ax, 7.8, 9.3, 8.2, 9.5, 'REST API / JWT\naxios timeout 35s', color=CYAN, lw=1.5,
          fontsize=6, label_offset=(0, 0.12))

    # Frontend → Supabase (Auth direct)
    curved_arrow(ax, 7.8, 10.8, 14.2, 11.0, 'Auth directo\nsupabase-js', color=CYAN, lw=1.3,
                 rad=-0.15, fontsize=6, label_offset=(0, 0.15))

    # Backend → Supabase DB
    arrow(ax, 13.7, 9.0, 14.2, 9.3, 'PostgreSQL\nsupabase-js', color=GREEN, lw=1.5,
          fontsize=6, label_offset=(0, 0.15))

    # Backend → Claude API (route through gap below DB container)
    arrow(ax, 13.45, 4.9, 14.45, 4.41, 'Claude API\nclaude-sonnet-4-6', color=RED, lw=1.3,
          fontsize=6, label_offset=(0.1, 0.12))

    # Backend → FRED (route through gap below DB container)
    arrow(ax, 13.45, 4.45, 14.45, 3.46, 'HTTP GET\ntreasury_10y', color=RED, lw=1.1,
          fontsize=6, label_offset=(0.1, 0.12))

    # Pipeline → Supabase (two-segment: right through gap below Backend, then up through x=13.9 corridor)
    arrow(ax, 11.1, 2.0, 13.9, 2.0, '', color=PURPLE, lw=1.3)
    arrow(ax, 13.9, 2.0, 14.2, 8.4, 'INSERT precios\ncada 15 min', color=PURPLE, lw=1.3,
          fontsize=6, label_offset=(0.3, 0.1))

    # Pipeline → Yahoo Finance
    arrow(ax, 11.1, 1.1, 14.45, 1.2, 'yfinance\nHTTP fetch', color=PURPLE, lw=1.1,
          fontsize=6, label_offset=(0, 0.12))

    # Pipeline → NewsAPI
    arrow(ax, 7.8, 1.2, 14.45, 2.5, 'HTTP fetch\nheadlines', color=PURPLE, lw=1.1,
          fontsize=6, label_offset=(0.2, 0.08))

    # n8n → Python Runner
    arrow(ax, 4.75, 2.85, 4.75, 2.63, 'HTTP POST /run\n{script: ...}', color=PURPLE, lw=1.1,
          fontsize=5.5, label_offset=(0.3, 0))

    # ── LEGEND ──────────────────────────────────────────────────────────────
    ax.text(19.6, 13.5, 'Leyenda', ha='left', va='top', fontsize=8.5,
            color=TEXT_PRI, fontweight='bold')
    legend_entry(ax, 19.6, 13.0, CYAN,   'Frontend React SPA')
    legend_entry(ax, 19.6, 12.7, GREEN,  'Backend API NestJS')
    legend_entry(ax, 19.6, 12.4, AMBER,  'Base de Datos Supabase')
    legend_entry(ax, 19.6, 12.1, PURPLE, 'Pipeline n8n + Python')
    legend_entry(ax, 19.6, 11.8, RED,    'APIs Externas')

    ax.text(11, 0.05, 'FinVise · Proyecto de Grado · Pontificia Universidad Javeriana Cali · 2025',
            ha='center', va='bottom', fontsize=7, color=TEXT_MUT)

    plt.tight_layout(pad=0.3)
    plt.savefig('diagram_01_system_architecture.png', dpi=150, bbox_inches='tight',
                facecolor=BG_DARK, edgecolor='none')
    plt.close()
    print('✓ diagram_01_system_architecture.png')


# ══════════════════════════════════════════════════════════════════════════════
#  DIAGRAMA 2 — Frontend: Arquitectura React SPA
# ══════════════════════════════════════════════════════════════════════════════
def make_diagram2():
    fig, ax = plt.subplots(figsize=(22, 15))
    fig.patch.set_facecolor(BG_DARK)
    ax.set_facecolor(BG_DARK)
    ax.set_xlim(0, 22)
    ax.set_ylim(0, 15)
    ax.axis('off')

    ax.text(11, 14.65, 'FinVise — Arquitectura del Frontend',
            ha='center', va='top', fontsize=16, color=TEXT_PRI,
            fontweight='bold', fontfamily='DejaVu Serif')
    ax.text(11, 14.25, 'Diagrama C4 · Nivel Componentes Frontend · React 18 · TypeScript · Vite · Tailwind CSS · Supabase Auth',
            ha='center', va='top', fontsize=8, color=TEXT_SEC, style='italic')

    # ── Capa 1: Router + Auth ─────────────────────────────────────────────
    section_label(ax, 0.4, 13.65, '[ Navegador Web — Single Page Application (SPA) ]', color=CYAN, fontsize=8)

    container_box(ax, 0.4, 6.5, 21.2, 7.1, '', '', color=CYAN, fill='#040f1a', lw=1.0)

    box(ax, 0.65, 12.9, 20.7, 0.75,
        'BrowserRouter + ProtectedRoute · React Router v6',
        'Guards: !user → "/" · !disclaimer_accepted → "/disclaimer" · !risk_score → "/onboarding" · → "/dashboard"',
        color=CYAN, fill=BG_CARD2, fontsize=7, label_fontsize=9)

    box(ax, 0.65, 11.85, 20.7, 0.82,
        'AuthContext (React Context API)',
        'Estado global: { user, profile, loading, signOut }\nsupabase.auth.onAuthStateChange() · Supabase session management',
        color=CYAN, fill=BG_CARD2, fontsize=7, label_fontsize=9)

    box(ax, 0.65, 10.95, 20.7, 0.65,
        'Layout Shell · Sidebar 240px · Header sticky 56px · NotificationBell · Área de contenido',
        '', color=CYAN_DIM, fill=BG_CARD2, fontsize=7.5, label_fontsize=8, bold=False)

    # ── Capa 2: Páginas ───────────────────────────────────────────────────
    section_label(ax, 0.4, 10.7, 'Páginas (Routes)', color=PURPLE, fontsize=7.5)

    pages = [
        ('Landing\n/', 'Autenticación\nOnboarding público', PURPLE),
        ('AcademicDisclaimer\n/disclaimer', 'Acepta términos\nacadémicos PUJ', PURPLE),
        ('Onboarding\n/onboarding', 'Perfil inversor\nrisk_score 1-10', PURPLE),
        ('Survey\n/encuesta', 'Pre-test / Post-test\nFinancial literacy', PURPLE),
        ('Dashboard\n/dashboard', 'Recomendaciones\nBandit · LiveStrip', PURPLE),
        ('LearningJourney\n/trayectoria', 'Historial · UCB\nPersonalización %', PURPLE),
        ('Chat\n/chat', 'Asistente IA\nClaude API', PURPLE),
        ('Glosario\n/glosario', 'Educación\nfinanciera', PURPLE),
        ('Perfil\n/profile', 'ía_score\nexclusiones', PURPLE),
    ]

    pw = 2.2
    gap = 0.12
    sx = 0.65
    for i, (name, sub, col) in enumerate(pages):
        box(ax, sx + i*(pw + gap), 9.3, pw, 1.15, name, sub,
            color=col, fill=BG_CARD2, fontsize=6.3, label_fontsize=7.5)

    # ── Capa 3: Componentes ───────────────────────────────────────────────
    section_label(ax, 0.4, 9.05, 'Componentes Reutilizables', color=GREEN, fontsize=7.5)

    comps = [
        ('RecommendationCard', 'Ticker · Allocación\nRationale · key_risk\nlogEvent(view/rate)', GREEN),
        ('PortfolioSimulator', 'Simulación\nde escenarios\nChart barras', GREEN),
        ('ScenarioTabs', 'Pesimista · Neutro\nOptimista\nProjection view', GREEN),
        ('BiasAlert', 'Advertencia\nsesgos cognitivos\ndetected_biases{}', GREEN),
        ('LiveStrip', 'Precios en vivo\nPrecio · Δ1d%\nPolling 60s', GREEN),
        ('PersonalizationPrg', '% adaptación\nUCB1 progress\nfeedback_count', GREEN),
        ('NotificationBell', 'Alertas push\numbral precio\nbadge contador', GREEN),
        ('AcademicBanner', 'Disclaimer PUJ\nMaterial educativo\nsiempre visible', GREEN),
    ]

    cw = 2.5
    cgap = 0.1
    csx = 0.65
    for i, (name, sub, col) in enumerate(comps):
        box(ax, csx + i*(cw + cgap), 7.75, cw, 1.1, name, sub,
            color=col, fill=BG_CARD2, fontsize=6.0, label_fontsize=7.2)

    # ── Capa 4: Servicios + Infraestructura ──────────────────────────────
    section_label(ax, 0.4, 7.45, 'Capa de Servicios e Infraestructura', color=AMBER, fontsize=7.5)

    box(ax, 0.65, 6.65, 4.1, 0.65,
        'api.ts (axios)',
        'baseURL: localhost:3000/api · timeout: 35s\nInterceptor JWT: supabase.auth.getSession() 3s race',
        color=AMBER, fill=BG_CARD2, fontsize=6.0, label_fontsize=7.5)

    box(ax, 4.9, 6.65, 3.8, 0.65,
        'supabase.ts',
        'Auth client directo · createClient()\nRealtime subscriptions · onAuthStateChange',
        color=AMBER, fill=BG_CARD2, fontsize=6.0, label_fontsize=7.5)

    box(ax, 8.85, 6.65, 3.8, 0.65,
        'dashboardCache.ts',
        'Caché en memoria · TTL 5 minutos\nEvita re-fetches innecesarios al navegar',
        color=AMBER, fill=BG_CARD2, fontsize=6.0, label_fontsize=7.5)

    box(ax, 12.8, 6.65, 3.8, 0.65,
        'useEventLogger.ts',
        'Hook: view / rate_up / rate_down / save / dismiss\nlogEvent() → POST /api/events · logBehaviorEvent()',
        color=AMBER, fill=BG_CARD2, fontsize=6.0, label_fontsize=7.5)

    box(ax, 16.75, 6.65, 4.6, 0.65,
        'types/index.ts · mock/data.ts',
        'Interfaces TypeScript: Recommendation · MarketAlert\nHistoryEntry · PriceCache · SurveyResponse · BanditProfile',
        color=AMBER, fill=BG_CARD2, fontsize=6.0, label_fontsize=7.5)

    # ── Abajo: Backend + Supabase externos ────────────────────────────────
    section_label(ax, 0.4, 5.9, 'Conexiones Externas', color=TEXT_MUT, fontsize=7.5)

    box(ax, 0.65, 4.5, 9.5, 1.15,
        'NestJS Backend API (localhost:3000)',
        'POST /recommendations/generate · GET /market/prices · GET /market/sentiment\n'
        'POST /chat · GET /bias/analysis · GET /bandit/profile\n'
        'GET/POST /survey · GET /history · GET/PATCH /alerts · POST /events',
        color=GREEN, fill='#0a1f12', fontsize=6.2, label_fontsize=8)

    box(ax, 10.35, 4.5, 6.0, 1.15,
        'Supabase (Auth + PostgreSQL)',
        'supabase.auth.signIn/signUp/signOut · onAuthStateChange\n'
        'getSession() → JWT para headers API · profiles (risk_score)\n'
        'Realtime: eventos en tiempo real',
        color=AMBER, fill='#1a1400', fontsize=6.2, label_fontsize=8)

    box(ax, 16.55, 4.5, 4.9, 1.15,
        'Anthropic Claude API',
        'sendChatMessage() → POST /api/chat\nclaude-sonnet-4-6 · Asistente educativo\n'
        'Contexto: perfil usuario + glosario',
        color=RED, fill='#1a0d0d', fontsize=6.2, label_fontsize=8)

    # ── Flechas de flujo ─────────────────────────────────────────────────
    # Auth flow
    arrow(ax, 11, 11.85, 11, 11.5, '', color=CYAN, lw=1.2)
    arrow(ax, 11, 11.5, 11, 10.95, 'sesión activa', color=CYAN, lw=1.0, fontsize=6)

    # Pages → Components
    for xi in [1.65, 3.95, 6.25, 8.55, 10.85, 13.15, 15.45, 17.75, 20.05]:
        arrow(ax, xi, 9.3, xi, 8.85, '', color=PURPLE, lw=0.8)

    # Services → Backend
    arrow(ax, 2.7, 6.65, 2.7, 5.65, 'REST + JWT', color=AMBER, lw=1.2, fontsize=6)
    arrow(ax, 6.8, 6.65, 10.5, 5.65, 'Auth directa', color=AMBER, lw=1.2, fontsize=6,
          label_offset=(0.2, 0.08))
    arrow(ax, 19.0, 6.65, 19.0, 5.65, 'via /api/chat', color=AMBER, lw=1.0, fontsize=6)

    # ── Leyenda y flujo de autenticación ─────────────────────────────────
    container_box(ax, 0.4, 0.3, 21.2, 3.9, '', '', color=TEXT_MUT, fill=BG_SURFACE, lw=0.8)
    section_label(ax, 0.65, 4.0, 'Flujo de Autenticación y Navegación', color=TEXT_SEC, fontsize=7.5)

    steps = [
        ('1. Landing\n/login', CYAN),
        ('2. Supabase Auth\nsignIn / signUp', AMBER),
        ('3. AcademicDisclaimer\naceptación PUJ', PURPLE),
        ('4. Onboarding\nrisk_score 1-10', PURPLE),
        ('5. Survey Pre-test\nFinancial Literacy', GREEN),
        ('6. Dashboard\n(Acceso completo)', GREEN),
    ]

    sw = 3.3
    ssx = 0.65
    for i, (s, c) in enumerate(steps):
        box(ax, ssx + i * (sw + 0.1), 2.6, sw, 0.9, s, '', color=c, fill=BG_CARD2,
            fontsize=7, label_fontsize=7.5)
        if i < len(steps) - 1:
            arrow(ax, ssx + i*(sw+0.1) + sw, 3.05, ssx + (i+1)*(sw+0.1), 3.05,
                  '', color=c, lw=1.3)

    ax.text(11, 2.25, 'ProtectedRoute verifica: autenticado ∧ disclaimer_accepted = true ∧ risk_score ≠ null',
            ha='center', va='top', fontsize=7.5, color=TEXT_SEC)

    # Endpoints mapeados
    endpoints = [
        ('Dashboard usa:', 'getRecommendation() · getAlerts() · getPrices() · getSentiment() · getBanditProfile()', GREEN),
        ('Trayectoria usa:', 'getHistory() · getBanditProfile() · getSurveyComparison()', PURPLE),
        ('Chat usa:', 'sendChatMessage() → streaming educativo', RED),
        ('Survey usa:', 'saveSurvey() · getSurvey(pre/post) · getSurveyComparison()', AMBER),
        ('Eventos:', 'logEvent(view/rate_up/rate_down/save/dismiss) → bandit UCB feedback loop', CYAN),
    ]
    for i, (lbl, detail, c) in enumerate(endpoints):
        y = 1.85 - i * 0.3
        ax.text(0.65, y, lbl, ha='left', va='center', fontsize=7, color=c, fontweight='bold')
        ax.text(3.8, y, detail, ha='left', va='center', fontsize=6.8, color=TEXT_SEC)

    ax.text(11, 0.08, 'FinVise · Proyecto de Grado · Pontificia Universidad Javeriana Cali · 2025',
            ha='center', va='bottom', fontsize=7, color=TEXT_MUT)

    plt.tight_layout(pad=0.3)
    plt.savefig('diagram_02_frontend_architecture.png', dpi=150, bbox_inches='tight',
                facecolor=BG_DARK, edgecolor='none')
    plt.close()
    print('✓ diagram_02_frontend_architecture.png')


# ══════════════════════════════════════════════════════════════════════════════
#  DIAGRAMA 3 — Backend: NestJS + Flujo Recomendaciones + Bandit
# ══════════════════════════════════════════════════════════════════════════════
def make_diagram3():
    fig, ax = plt.subplots(figsize=(24, 16))
    fig.patch.set_facecolor(BG_DARK)
    ax.set_facecolor(BG_DARK)
    ax.set_xlim(0, 24)
    ax.set_ylim(0, 16)
    ax.axis('off')

    ax.text(12, 15.65, 'FinVise — Backend: Arquitectura NestJS + Flujo de Recomendaciones',
            ha='center', va='top', fontsize=15, color=TEXT_PRI,
            fontweight='bold', fontfamily='DejaVu Serif')
    ax.text(12, 15.25, 'Diagrama C4 · Nivel Componentes Backend · NestJS · TypeScript · Claude Sonnet 4.6 · Supabase PostgreSQL · UCB1 Bandit',
            ha='center', va='top', fontsize=8, color=TEXT_SEC, style='italic')

    # ── MÓDULOS NESTJS ────────────────────────────────────────────────────
    container_box(ax, 0.3, 3.8, 9.8, 11.1, 'NestJS Application — Puerto 3000',
                  'TypeScript · @nestjs/common · Algoritmo UCB1 Bandit · Supabase Auth JWT',
                  color=GREEN, fill='#0a1f12', lw=1.8)

    # RecommendationsModule
    box(ax, 0.55, 13.85, 9.3, 0.85,
        'RecommendationsModule',
        'RecommendationsService: generate() → buildCandidates() → generateWithClaude() | generateMock()\n'
        'POST /api/recommendations/generate  { risk_override?, excluded_tickers? }',
        color=GREEN, fill=BG_CARD2, fontsize=6.3, label_fontsize=8.2)

    box(ax, 0.55, 12.85, 9.3, 0.78,
        'BanditModule (Multi-Armed Bandit UCB1)',
        'BanditService: getScores(userId) · rank(tickers, ucbScores) · getBanditProfile(userId)\n'
        'GET /api/bandit/profile — Perfil de aprendizaje personalizado del usuario',
        color=GREEN, fill=BG_CARD2, fontsize=6.3, label_fontsize=8.2)

    box(ax, 0.55, 11.85, 9.3, 0.78,
        'MarketModule',
        'MarketDataFetcherService: getPricesWithRefresh() · getSentimentWithRefresh()\n'
        'GET /api/market/prices  ·  GET /api/market/sentiment  ·  50+ tickers TICKER_META',
        color=GREEN, fill=BG_CARD2, fontsize=6.3, label_fontsize=8.2)

    box(ax, 0.55, 10.85, 9.3, 0.78,
        'BiasModule',
        'BiasDetectionService: detectBiases() — análisis sesgos cognitivos del portafolio\n'
        'GET /api/bias/analysis  →  { scores: {}, active: [], last_updated }',
        color=GREEN, fill=BG_CARD2, fontsize=6.3, label_fontsize=8.2)

    box(ax, 0.55, 9.85, 9.3, 0.78,
        'ChatModule',
        'ChatService: conversación educativa con historial de mensajes\n'
        'POST /api/chat  { messages: [{role, content}] }  →  { reply: string }',
        color=GREEN, fill=BG_CARD2, fontsize=6.3, label_fontsize=8.2)

    box(ax, 0.55, 9.0, 4.5, 0.65,
        'SurveyModule',
        'SurveyService: save · get · comparison\nGET/POST /api/survey?type=pre|post',
        color=GREEN, fill=BG_CARD2, fontsize=6.0, label_fontsize=7.5)
    box(ax, 5.2, 9.0, 4.65, 0.65,
        'HistoryModule',
        'HistoryService: recommendation_history\nGET /api/history  →  HistoryEntry[]',
        color=GREEN, fill=BG_CARD2, fontsize=6.0, label_fontsize=7.5)

    box(ax, 0.55, 8.15, 4.5, 0.65,
        'AlertsModule',
        'AlertsService: notificaciones push\nGET/PATCH /api/alerts/:id/read',
        color=GREEN, fill=BG_CARD2, fontsize=6.0, label_fontsize=7.5)
    box(ax, 5.2, 8.15, 4.65, 0.65,
        'EventsModule',
        'EventsService: log comportamiento usuario\nPOST /api/events — alimenta el Bandit UCB1',
        color=GREEN, fill=BG_CARD2, fontsize=6.0, label_fontsize=7.5)

    box(ax, 0.55, 7.3, 9.3, 0.65,
        'MockAuthGuard + CurrentUser Decorator',
        'Extrae JWT de Supabase · decode token → { id, email, risk_score, ... }\n'
        'Todas las rutas protegidas usan @UseGuards(MockAuthGuard)',
        color=AMBER, fill=BG_CARD2, fontsize=6.2, label_fontsize=7.8)

    box(ax, 0.55, 4.05, 9.3, 1.05,
        'SupabaseModule (isGlobal: true)',
        'SupabaseService · isConfigured() · this.db (SupabaseClient)\n'
        'ConfigModule: SUPABASE_URL · SUPABASE_SERVICE_KEY · ANTHROPIC_API_KEY\n'
        'Compartido por todos los módulos · nestjs Singleton',
        color=AMBER, fill=BG_CARD2, fontsize=6.3, label_fontsize=8.2)

    # ── ALGORITMO BANDIT ─────────────────────────────────────────────────
    container_box(ax, 0.3, 0.3, 9.8, 3.5, 'Algoritmo Multi-Armed Bandit UCB1',
                  '', color=PURPLE, fill='#100d1f', lw=1.6)

    ax.text(5.2, 3.4, r'score(i)  =  μᵢ  +  C · √( ln(N) / nᵢ )',
            ha='center', va='center', fontsize=13, color=PURPLE,
            fontweight='bold', fontstyle='italic')

    formula_details = [
        ('μᵢ', '= recompensa media del ticker i'),
        ('nᵢ', '= veces mostrado al usuario'),
        ('N', '= total de interacciones'),
        ('C', '= √2 (constante exploración)'),
    ]
    for i, (sym, desc) in enumerate(formula_details):
        ax.text(1.2, 2.9 - i*0.4, sym, ha='left', fontsize=9, color=PURPLE, fontweight='bold')
        ax.text(2.0, 2.9 - i*0.4, desc, ha='left', fontsize=8, color=TEXT_SEC)

    rewards_data = [
        ('rate_up', '+1.0'), ('save', '+0.8'),
        ('rate_down', '−1.0'), ('dismiss', '−0.5'),
    ]
    for i, (ev, r) in enumerate(rewards_data):
        col = GREEN if '+' in r else RED
        x = 5.5 + (i % 2) * 2.1
        y = 2.9 - (i // 2) * 0.5
        box(ax, x, y - 0.2, 1.9, 0.38, f'{ev}: {r}', '', color=col, fill=BG_CARD2,
            fontsize=6.5, label_fontsize=7.5, border_lw=1.0)

    box(ax, 0.55, 0.5, 9.3, 0.78,
        'rank(tickers, ucbScores)',
        'Tickers nunca mostrados → score = +∞ (exploración forzada)\n'
        'sort() descendente por UCB · slice(0,2) por asset_class → buildCandidates()',
        color=PURPLE, fill=BG_CARD2, fontsize=6.2, label_fontsize=7.8)

    # ── FLUJO DE RECOMENDACIONES ─────────────────────────────────────────
    section_label(ax, 10.5, 15.1, 'Flujo: Generación de Recomendaciones', color=CYAN, fontsize=9)

    steps_flow = [
        (10.5, 14.1, 14.4, 0.75, '① Request',
         'POST /api/recommendations/generate\n'
         'MockAuthGuard → extrae user de JWT Supabase\n'
         '{ risk_override?: number, excluded_tickers?: string[] }',
         CYAN),
        (10.5, 12.85, 14.4, 0.95, '② Datos Paralelos  (timeout 28s total)',
         'Promise.all con timeouts individuales:\n'
         '• getPricesWithRefresh()  [timeout 10s] → prices_cache | FRED/CoinGecko/yfinance\n'
         '• getSentimentWithRefresh()  [timeout 5s] → sentiment_cache | Fear&Greed+NewsAPI\n'
         '• bandit.getScores(userId)  [timeout 5s] → UCB scores por ticker de user_events',
         CYAN),
        (10.5, 11.5, 14.4, 1.1, '③ buildCandidates()',
         'band = risk_score → conservative|balanced|growth|aggressive\n'
         'ALLOCATION_RULES: { etf:40%, bond:25%, stock:15%, reit:10%, comm:5%, cash:5% }\n'
         'Filtra: risk_level ∈ [score−3, score+3] · excluye sectors/tickers evitados\n'
         'bandit.rank() por UCB → slice(0,2) por clase → normaliza 100%',
         CYAN),
        (10.5, 10.15, 14.4, 1.0, '④ Claude Sonnet 4.6  (timeout 20s)',
         'Prompt en español: contexto educativo + perfil de vida (age_group, occupation_type,\n'
         'family_context, primary_goal) + bias instructions + datos mercado + candidatos pre-calculados\n'
         'Respuesta JSON: recommendations[] + market_summary + educational_insight + disclaimer PUJ',
         GREEN),
        (10.5, 9.0, 14.4, 0.85, '⑤ Persist + Response',
         'INSERT recommendation_history { user_id, risk_score_used, payload, market_snapshot }\n'
         'market_snapshot: { fear_greed, fear_greed_label, treasury_10y }\n'
         'Post-filter: excluye excluded_tickers · Fallback si Claude devuelve vacío',
         AMBER),
    ]

    for (fx, fy, fw, fh, ftitle, ftext, fc) in steps_flow:
        box(ax, fx, fy, fw, fh, ftitle, ftext, color=fc, fill=BG_CARD2,
            fontsize=6.3, label_fontsize=8.5)
        # Down arrow between steps
        if fy > 9.0:
            next_y = fy - 0.15
            arrow(ax, fx + fw/2, fy, fx + fw/2, fy - 0.12, '', color=fc, lw=1.4)

    # ── BASE DE DATOS SUPABASE ─────────────────────────────────────────────
    container_box(ax, 15.3, 4.5, 8.4, 10.9, 'Supabase PostgreSQL — Row Level Security',
                  '', color=AMBER, fill='#1a1400', lw=1.8)

    db_tables = [
        ('prices_cache', 'ticker(PK) · name · price · change_1d_pct\nasset_class · sector · risk_level', AMBER),
        ('sentiment_cache', 'id=1 · fear_greed · fear_greed_label\ntreasury_10y · top_headlines(jsonb)', AMBER),
        ('user_preferences', 'user_id(PK) · sector_weights · asset_weights\navoided_tickers[] · detected_biases · event_count', AMBER),
        ('recommendation_history', 'id · user_id · risk_score_used\npayload(jsonb) · market_snapshot(jsonb)', AMBER),
        ('profiles', 'id · age_group · occupation_type\nfamily_context · primary_goal · risk_score', AMBER),
        ('user_events', 'id · user_id · event_type · asset_ticker\nasset_class · sector · dwell_seconds · metadata', AMBER),
        ('survey_responses', 'user_id · survey_type(pre/post)\nsections A/B/C/D scores+answers(jsonb)', AMBER),
        ('bias_interventions', 'user_id · bias_type · strength\nacknowledged · sector_diversity_before/after', AMBER),
    ]

    tw = 7.8
    tsx = 15.55
    for i, (tname, tcols, tc) in enumerate(db_tables):
        ty = 14.05 - i * 1.18
        box(ax, tsx, ty, tw, 0.9, tname, tcols, color=tc, fill=BG_CARD2,
            fontsize=6.0, label_fontsize=7.8)

    # ── APIs Externas ─────────────────────────────────────────────────────
    container_box(ax, 10.5, 0.3, 13.2, 3.35, 'APIs Externas Consumidas por el Backend',
                  '', color=RED, fill='#1a0d0d', lw=1.5)

    ext_apis = [
        (10.75, 2.6, 4.0, 0.75,
         'Anthropic Claude API\nclaude-sonnet-4-6',
         'Recommendations: timeout 20s · max_tokens 1800\nChat: conversacional educativo en español',
         RED),
        (14.9, 2.6, 4.2, 0.75,
         'FRED API (Federal Reserve)',
         'GET series/FEDFUNDS + DGS10\nTreasury 10Y yield para sentiment_cache',
         RED),
        (10.75, 1.55, 2.0, 0.82,
         'NewsAPI',
         'Financial\nheadlines\ntop_headlines',
         RED),
        (12.9, 1.55, 2.0, 0.82,
         'Fear & Greed\nIndex',
         'CNN Money\nfear_greed\n0–100 score',
         RED),
        (15.05, 1.55, 2.0, 0.82,
         'yfinance\n(Yahoo Finance)',
         '50+ tickers\nStocks/ETFs\n2d period',
         RED),
        (17.2, 1.55, 2.1, 0.82,
         'CoinGecko\nAPI',
         'BTC·ETH·SOL\nSin API key\nvía requests',
         RED),
        (10.75, 0.55, 8.55, 0.75,
         'TICKER_META (interno): 50+ tickers pre-clasificados',
         'asset_class: etf|stock|bond|reit|commodity|cash|crypto · sector · risk_level (1-10)',
         AMBER),
    ]

    for (ex, ey, ew, eh, etitle, esub, ec) in ext_apis:
        box(ax, ex, ey, ew, eh, etitle, esub, color=ec, fill=BG_CARD2,
            fontsize=5.8, label_fontsize=6.8)

    # ── FLECHAS BACKEND ───────────────────────────────────────────────────
    # RecommendationsModule uses BanditModule
    arrow(ax, 5.2, 13.85, 5.2, 13.63, '', color=GREEN, lw=1.0)
    arrow(ax, 5.2, 12.85, 5.2, 12.63, 'UCB scores', color=GREEN_DIM, lw=0.9, fontsize=5.5,
          label_offset=(0.4, 0))

    # RecommendationsModule uses MarketModule
    arrow(ax, 5.2, 12.85, 5.2, 12.63, '', color=GREEN, lw=1.0)
    arrow(ax, 5.2, 11.85, 5.2, 11.63, 'precios+sentiment', color=GREEN_DIM, lw=0.9, fontsize=5.5,
          label_offset=(0.5, 0))

    # EventsModule → Bandit
    curved_arrow(ax, 9.85, 8.48, 9.85, 12.85, 'alimenta\nBandit', color=GREEN, lw=1.1,
                 rad=-0.3, fontsize=5.5, label_offset=(0.35, 0))

    # Backend → DB (route from SupabaseModule bottom, below all flow steps)
    arrow(ax, 9.85, 4.575, 15.3, 4.75, 'supabase-js\nPostgreSQL', color=AMBER, lw=1.4,
          fontsize=6, label_offset=(0, 0.12))

    # Flow → DB (persist)
    arrow(ax, 24.9 - 9.7, 9.0, 15.3, 9.5, 'INSERT\nrecommendation_history', color=AMBER, lw=1.2,
          fontsize=6, label_offset=(0.1, 0.1))

    # SupabaseModule → Claude API (diagonal por espacio limpio, bajo todos los flow steps)
    arrow(ax, 9.85, 5.0, 12.75, 2.975, 'Claude Sonnet 4.6\ntimeout 20s', color=RED, lw=1.2,
          fontsize=6, label_offset=(0.3, 0.12))

    # SupabaseModule → FRED/Fear&Greed/NewsAPI (diagonal por espacio limpio)
    arrow(ax, 9.85, 4.3, 17.0, 2.975, 'FRED 10Y · Fear&Greed · NewsAPI', color=RED, lw=1.0,
          fontsize=5.5, label_offset=(0.5, 0.12))

    ax.text(12, 0.08, 'FinVise · Proyecto de Grado · Pontificia Universidad Javeriana Cali · 2025',
            ha='center', va='bottom', fontsize=7, color=TEXT_MUT)

    plt.tight_layout(pad=0.3)
    plt.savefig('diagram_03_backend_architecture.png', dpi=150, bbox_inches='tight',
                facecolor=BG_DARK, edgecolor='none')
    plt.close()
    print('✓ diagram_03_backend_architecture.png')


if __name__ == '__main__':
    import os
    os.chdir('/Users/nicolasvalencia/Desktop/Tesis/investment-recommender')
    make_diagram1()
    make_diagram2()
    make_diagram3()
    print('\n✅ Los 3 diagramas C4 han sido regenerados.')
