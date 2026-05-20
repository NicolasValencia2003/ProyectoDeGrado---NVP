#!/usr/bin/env python3
"""
Nightly ML preference update with bias detection.
Usage: python3 update_preferences.py --user_id=UUID
Called by n8n at midnight for every active user.
"""
import argparse, os
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from supabase import create_client
from signal_weights import WEIGHTS, RECENCY
from bias_detector import detect_all_biases

sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])


def recency_mult(ts):
    age = (datetime.now(timezone.utc) -
           datetime.fromisoformat(ts.replace("Z", "+00:00"))).days
    if age <= 7:  return RECENCY["7d"]
    if age <= 30: return RECENCY["30d"]
    return RECENCY["90d"]


def normalize(d):
    if not d:
        return {}
    m = max(abs(v) for v in d.values()) or 1
    return {k: round(v / m, 4) for k, v in d.items()}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--user_id", required=True)
    args = parser.parse_args()

    cutoff = (datetime.now(timezone.utc) - timedelta(days=90)).isoformat()

    events = sb.table("user_events").select("*") \
               .eq("user_id", args.user_id) \
               .gte("created_at", cutoff).execute().data
    if not events:
        print(f"No events for {args.user_id}")
        return

    user = sb.table("users").select("horizon,age_group,occupation_type") \
              .eq("id", args.user_id).execute().data
    user = user[0] if user else {}
    horizon = user.get("horizon", "3-5y")

    ss, ac, ts = defaultdict(float), defaultdict(float), defaultdict(float)
    for e in events:
        w = WEIGHTS.get(e["event_type"], 0)
        if e["event_type"] == "dwell":
            w *= min((e.get("dwell_seconds") or 0) / 60, 2.0)
        w *= recency_mult(e["created_at"])
        if e.get("sector"):       ss[e["sector"]]       += w
        if e.get("asset_class"):  ac[e["asset_class"]]  += w
        if e.get("asset_ticker"): ts[e["asset_ticker"]] += w

    prices_data = sb.table("prices_cache").select("*").execute().data
    prices_map  = {p["ticker"]: p for p in prices_data}

    asset_scores = {
        t: round(min(10, max(0,
            (10 - p.get("risk_level", 5)) * 0.2 +
            min(10, max(0, 5 + p.get("change_1d_pct", 0) * 2)) * 0.4 +
            5 * 0.4
        )), 3)
        for t, p in prices_map.items()
    }

    detected_biases = detect_all_biases(events, prices_map, horizon, asset_scores)

    sb.table("user_preferences").upsert({
        "user_id":           args.user_id,
        "sector_weights":    normalize(dict(ss)),
        "asset_weights":     normalize(dict(ac)),
        "avoided_tickers":   [t for t, s in ts.items() if s < -0.3],
        "preferred_tickers": [t for t, s in ts.items() if s > 0.5],
        "event_count":       len(events),
        "detected_biases":   detected_biases,
        "updated_at":        datetime.now(timezone.utc).isoformat(),
    }).execute()

    if detected_biases:
        print(f"Biases detected for {args.user_id}: {list(detected_biases.keys())}")
        for bias_type, data in detected_biases.items():
            if data.get("detected"):
                sb.table("bias_interventions").insert({
                    "user_id":   args.user_id,
                    "bias_type": bias_type,
                    "strength":  data.get("strength", 0),
                }).execute()
    else:
        print(f"No biases detected for {args.user_id}")


if __name__ == "__main__":
    main()
