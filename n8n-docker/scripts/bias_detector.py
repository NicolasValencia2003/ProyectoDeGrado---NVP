#!/usr/bin/env python3
"""
Detects cognitive financial biases in user behavior.
Imported by update_preferences.py.
Based on: Kahneman & Tversky (1979), De Bondt & Thaler (1985),
          Huberman (2001), Shefrin & Statman (1985).
"""
from collections import defaultdict
import math

RECENCY_MIN_EVENTS       = 5
RECENCY_MOMENTUM_SAVES   = 1.2
RECENCY_STRENGTH_MIN     = 1.5
FAMILIARITY_MIN_SAVES    = 5
FAMILIARITY_THRESHOLD    = 0.68
LOSS_AVERSION_MIN_EVENTS = 6
LOSS_AVERSION_THRESHOLD  = 0.72
LOSS_AVERSION_HORIZONS   = ["5-10y", "10y+"]
DISPOSITION_MIN_SAVES    = 5
DISPOSITION_SCORE_LOW    = 5.5

SECTOR_NAMES_ES = {
    "technology":    "tecnología",
    "bonds":         "renta fija",
    "crypto":        "criptoactivos",
    "broad_market":  "mercado amplio",
    "commodities":   "materias primas",
    "real_estate":   "inmobiliario",
    "healthcare":    "salud",
    "energy":        "energía",
    "financials":    "financiero",
    "dividend":      "dividendos",
    "utilities":     "servicios públicos",
    "staples":       "consumo básico",
    "cash":          "conservador",
    "international": "internacional",
}


def detect_all_biases(events, prices_map, user_horizon, asset_scores):
    biases = {}
    rb = _recency_bias(events, prices_map)
    if rb:
        biases["recency_bias"] = rb
    fb = _familiarity_bias(events, prices_map)
    if fb:
        biases["familiarity_bias"] = fb
    la = _loss_aversion(events, prices_map, user_horizon)
    if la:
        biases["loss_aversion"] = la
    de = _disposition_effect(events, prices_map, asset_scores)
    if de:
        biases["disposition_effect"] = de
    return biases


def _recency_bias(events, prices_map):
    pos = {"save", "rate_up"}
    neg = {"dismiss", "rate_down"}
    saves_m, dismiss_m = [], []
    for e in events:
        t = e.get("asset_ticker")
        if t not in prices_map:
            continue
        ch = prices_map[t].get("change_1d_pct", 0)
        if e["event_type"] in pos:
            saves_m.append(ch)
        elif e["event_type"] in neg:
            dismiss_m.append(ch)
    if len(saves_m) < RECENCY_MIN_EVENTS:
        return None
    avg_s = sum(saves_m) / len(saves_m)
    avg_d = sum(dismiss_m) / len(dismiss_m) if dismiss_m else 0
    strength = round(avg_s - avg_d, 3)
    if avg_s < RECENCY_MOMENTUM_SAVES or strength < RECENCY_STRENGTH_MIN:
        return None
    examples = list({
        e["asset_ticker"] for e in events
        if e["event_type"] in pos
        and prices_map.get(e["asset_ticker"], {}).get("change_1d_pct", 0) > 1.0
    })[:3]
    return {
        "detected": True,
        "strength": strength,
        "example_tickers": examples,
        "message_es": (
            f"Has guardado principalmente activos que subieron recientemente "
            f"({', '.join(examples) if examples else 'varios'}). "
            "El rendimiento de un día no predice el futuro. "
            "Este es el sesgo de recencia — uno de los más comunes en inversores principiantes."
        ),
        "prompt_instruction": (
            f"RECENCY BIAS DETECTED (strength {strength}): user saves assets based on "
            f"recent price increases (examples: {', '.join(examples)}). "
            "Include in your market_summary one natural sentence reminding that "
            "short-term daily performance does not predict long-term returns. "
            "Frame it as educational context, not a correction."
        ),
    }


def _familiarity_bias(events, prices_map):
    pos = {"save", "rate_up"}
    sector_counts = defaultdict(int)
    total = 0
    for e in events:
        if e["event_type"] not in pos:
            continue
        t = e.get("asset_ticker")
        if t not in prices_map:
            continue
        sector_counts[prices_map[t].get("sector", "unknown")] += 1
        total += 1
    if total < FAMILIARITY_MIN_SAVES or not sector_counts:
        return None
    top = max(sector_counts, key=sector_counts.get)
    pct = sector_counts[top] / total
    if pct < FAMILIARITY_THRESHOLD:
        return None
    diversity = _shannon(sector_counts, total)
    sector_es = SECTOR_NAMES_ES.get(top, top)
    return {
        "detected": True,
        "strength": round(pct, 3),
        "dominant_sector": top,
        "diversity_score": round(diversity, 3),
        "message_es": (
            f"El {round(pct*100)}% de tus interacciones positivas se concentran "
            f"en el sector {sector_es}. Explorar otros sectores te dará una visión "
            "más completa de cómo funciona la diversificación."
        ),
        "prompt_instruction": (
            f"FAMILIARITY BIAS DETECTED: user concentrates {round(pct*100)}% of "
            f"positive interactions in {top} sector. When explaining assets from "
            "OTHER sectors, add one sentence about how sector diversification "
            "reduces portfolio risk. Keep it educational and natural."
        ),
    }


def _loss_aversion(events, prices_map, user_horizon):
    if user_horizon not in LOSS_AVERSION_HORIZONS:
        return None
    neg = {"dismiss", "rate_down"}
    on_neg, total = 0, 0
    for e in events:
        if e["event_type"] not in neg:
            continue
        t = e.get("asset_ticker")
        if t not in prices_map:
            continue
        total += 1
        if prices_map[t].get("change_1d_pct", 0) < 0:
            on_neg += 1
    if total < LOSS_AVERSION_MIN_EVENTS:
        return None
    rate = on_neg / total
    if rate < LOSS_AVERSION_THRESHOLD:
        return None
    h_label = "5 a 10 años" if user_horizon == "5-10y" else "más de 10 años"
    return {
        "detected": True,
        "strength": round(rate, 3),
        "dismissal_rate": round(rate * 100, 1),
        "message_es": (
            f"Con un horizonte de {h_label}, una variación de -0.3% en un día "
            "es ruido estadístico normal, no una señal de peligro. "
            "Descartar activos por pequeñas caídas diarias es la aversión a la "
            "pérdida en acción — un sesgo documentado por Kahneman y Tversky."
        ),
        "prompt_instruction": (
            f"LOSS AVERSION DETECTED: user dismisses {round(rate*100)}% of assets "
            f"with negative daily change despite {user_horizon} horizon. "
            "For any asset with negative change_1d_pct in this recommendation, "
            "proactively mention in its rationale that daily volatility is normal "
            "for long-term investors and irrelevant for their time horizon."
        ),
    }


def _disposition_effect(events, prices_map, asset_scores):
    pos = {"save", "rate_up"}
    saves = []
    for e in events:
        if e["event_type"] not in pos:
            continue
        t = e.get("asset_ticker")
        if t not in prices_map or t not in asset_scores:
            continue
        saves.append({
            "ticker":   t,
            "change":   prices_map[t].get("change_1d_pct", 0),
            "score":    asset_scores.get(t, 5.0),
            "positive": prices_map[t].get("change_1d_pct", 0) > 0,
        })
    if len(saves) < DISPOSITION_MIN_SAVES:
        return None
    risky = [s for s in saves if s["positive"] and s["score"] < DISPOSITION_SCORE_LOW]
    if len(risky) < 3:
        return None
    rate = len(risky) / len(saves)
    if rate < 0.50:
        return None
    examples = list({s["ticker"] for s in risky})[:3]
    return {
        "detected": True,
        "strength": round(rate, 3),
        "example_tickers": examples,
        "message_es": (
            "Has tendido a guardar activos que subieron recientemente aunque "
            "su puntuación cuantitativa no es la más alta. "
            "Esto es el efecto de disposición: favorecer ganadores recientes "
            "sobre activos de mejor calidad fundamental."
        ),
        "prompt_instruction": (
            "DISPOSITION EFFECT DETECTED: user saves assets based on recent gains "
            "regardless of fundamental quality score. Include in market_summary "
            "one educational sentence: rising price today does not equal "
            "investment quality. The recommendation is based on risk-adjusted "
            "metrics, not on recent performance alone."
        ),
    }


def _shannon(counts, total):
    if total == 0 or len(counts) <= 1:
        return 0.0
    h = -sum((c / total) * math.log(c / total) for c in counts.values() if c > 0)
    return h / math.log(len(counts)) if len(counts) > 1 else 0.0
