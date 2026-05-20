#!/usr/bin/env python3
"""
Fetches market sentiment data from multiple free APIs:
- Fear & Greed index: api.alternative.me
- Financial news:     newsapi.org
- Treasury 10Y yield: FRED API (api.stlouisfed.org)
Called by n8n every 6 hours.
"""
import os, sys, json, requests
from datetime import datetime
from supabase import create_client

def fetch_fear_greed():
    try:
        r = requests.get(
            "https://api.alternative.me/fng/?limit=1",
            timeout=10
        ).json()
        value = int(r["data"][0]["value"])
        label = r["data"][0]["value_classification"]
        return value, label
    except Exception as e:
        print(f"Fear&Greed error: {e}", file=sys.stderr)
        return 50, "Neutral"

def fetch_treasury_10y():
    try:
        fred_key = os.environ.get("FRED_API_KEY", "")
        if not fred_key:
            return 4.5
        r = requests.get(
            "https://api.stlouisfed.org/fred/series/observations",
            params={
                "series_id":     "DGS10",
                "api_key":       fred_key,
                "file_type":     "json",
                "sort_order":    "desc",
                "limit":         5,
                "observation_start": "2020-01-01"
            },
            timeout=10
        ).json()
        for obs in r.get("observations", []):
            if obs["value"] != ".":
                return round(float(obs["value"]), 4)
        return 4.5
    except Exception as e:
        print(f"FRED error: {e}", file=sys.stderr)
        return 4.5

def fetch_headlines():
    try:
        news_key = os.environ.get("NEWS_API_KEY", "")
        if not news_key:
            return []
        r = requests.get(
            "https://newsapi.org/v2/top-headlines",
            params={
                "category": "business",
                "pageSize": 5,
                "language": "en",
                "apiKey":   news_key
            },
            timeout=10
        ).json()
        return [
            {"title": a["title"], "url": a.get("url", "#")}
            for a in r.get("articles", [])[:5]
            if a.get("title")
        ]
    except Exception as e:
        print(f"NewsAPI error: {e}", file=sys.stderr)
        return []

def main():
    sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])

    fear_greed, fg_label = fetch_fear_greed()
    treasury_10y         = fetch_treasury_10y()
    headlines            = fetch_headlines()

    row = {
        "id":               1,
        "fear_greed":       fear_greed,
        "fear_greed_label": fg_label,
        "treasury_10y":     treasury_10y,
        "top_headlines":    json.dumps(headlines),
        "updated_at":       datetime.utcnow().isoformat()
    }

    sb.table("sentiment_cache").upsert(row, on_conflict="id").execute()
    print(f"Sentiment updated: Fear&Greed={fear_greed} ({fg_label}), T10Y={treasury_10y}%")
    print(f"Headlines: {len(headlines)} fetched")

if __name__ == "__main__":
    main()
