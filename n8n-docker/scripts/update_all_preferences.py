#!/usr/bin/env python3
"""
Runs update_preferences for every user that has events in the last 90 days.
Called nightly by n8n — no arguments needed.
"""
import os, sys, subprocess
from supabase import create_client

def main():
    sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])

    result = sb.table("user_events") \
        .select("user_id") \
        .execute()

    user_ids = list({row["user_id"] for row in result.data if row.get("user_id")})
    print(f"[update_all] Found {len(user_ids)} users with events")

    for uid in user_ids:
        print(f"[update_all] Processing user {uid}")
        r = subprocess.run(
            [sys.executable, "/scripts/update_preferences.py", "--user_id", uid],
            capture_output=True, text=True, timeout=60
        )
        if r.returncode != 0:
            print(f"[update_all] ERROR for {uid}: {r.stderr[-300:]}")
        else:
            print(f"[update_all] OK for {uid}")

if __name__ == "__main__":
    main()
