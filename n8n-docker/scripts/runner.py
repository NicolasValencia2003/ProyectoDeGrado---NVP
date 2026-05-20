#!/usr/bin/env python3
"""
Minimal HTTP runner for n8n to trigger Python scripts via HTTP POST.
n8n calls: POST /run  { "script": "fetch_prices" }
"""
import json
import subprocess
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer

ALLOWED = {"fetch_prices", "fetch_sentiment", "update_preferences", "update_all_preferences"}

class Handler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        print(f"[runner] {self.address_string()} - {format % args}", flush=True)

    def do_POST(self):
        if self.path != "/run":
            self._respond(404, {"error": "not found"})
            return
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length) or b"{}")
        script = body.get("script", "")
        if script not in ALLOWED:
            self._respond(400, {"error": f"unknown script: {script}"})
            return
        try:
            result = subprocess.run(
                [sys.executable, f"/scripts/{script}.py"],
                capture_output=True, text=True, timeout=120
            )
            self._respond(200, {
                "ok": result.returncode == 0,
                "stdout": result.stdout[-2000:],
                "stderr": result.stderr[-1000:],
            })
        except subprocess.TimeoutExpired:
            self._respond(500, {"error": "timeout"})
        except Exception as e:
            self._respond(500, {"error": str(e)})

    def do_GET(self):
        if self.path == "/health":
            self._respond(200, {"status": "ok"})
        else:
            self._respond(404, {"error": "not found"})

    def _respond(self, code, data):
        body = json.dumps(data).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", len(body))
        self.end_headers()
        self.wfile.write(body)

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8888
    print(f"[runner] Listening on port {port}", flush=True)
    HTTPServer(("0.0.0.0", port), Handler).serve_forever()
