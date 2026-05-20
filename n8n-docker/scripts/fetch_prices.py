#!/usr/bin/env python3
"""
Fetches real market prices using yfinance.
Called by n8n every 15 minutes during market hours.
Writes to Supabase prices_cache table.
"""
import os, sys, json
from datetime import datetime
import yfinance as yf
from supabase import create_client
from universe import UNIVERSE, ALL_TICKERS

def main():
    sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])

    try:
        data = yf.download(
            tickers=" ".join(ALL_TICKERS),
            period="2d",
            interval="1d",
            progress=False,
            threads=True,
            auto_adjust=True
        )
    except Exception as e:
        print(f"ERROR downloading prices: {e}", file=sys.stderr)
        sys.exit(1)

    rows = []
    now  = datetime.utcnow().isoformat()

    for ticker in ALL_TICKERS:
        try:
            closes = data["Close"][ticker].dropna()
            if len(closes) < 2:
                continue
            price  = float(closes.iloc[-1])
            prev   = float(closes.iloc[-2])
            change = round((price - prev) / prev * 100, 4)
            meta   = UNIVERSE[ticker]
            rows.append({
                "ticker":        ticker,
                "name":          meta["name"],
                "price":         round(price, 4),
                "change_1d_pct": change,
                "asset_class":   meta["asset_class"],
                "sector":        meta["sector"],
                "risk_level":    meta["risk_level"],
                "updated_at":    now
            })
        except Exception as err:
            print(f"SKIP {ticker}: {err}", file=sys.stderr)
            continue

    if rows:
        sb.table("prices_cache").upsert(rows, on_conflict="ticker").execute()
        print(f"Upserted {len(rows)} price rows at {now}")
    else:
        print("WARNING: No price rows to upsert", file=sys.stderr)

if __name__ == "__main__":
    main()
