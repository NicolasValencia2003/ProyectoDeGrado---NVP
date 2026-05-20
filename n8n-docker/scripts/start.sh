#!/bin/sh
set -e
echo "[start] Installing CA certificates..."
apk add --no-cache ca-certificates openssl > /dev/null 2>&1
echo "[start] Installing Python dependencies..."
pip install --quiet --no-cache-dir certifi --upgrade
pip install --quiet --no-cache-dir yfinance==0.2.38 supabase==2.4.6 requests==2.31.0 python-dotenv==1.0.0
echo "[start] Starting HTTP runner on port 8888..."
exec python /scripts/runner.py 8888
