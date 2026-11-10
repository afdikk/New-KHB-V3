"""Impor dump .sql lokal ke database KroomBoxPanel (akun KHB).

Membaca file dump langsung (bukan lewat argumen CLI) supaya tidak kena
batas panjang command line Windows.

  python scripts/panel_import_db.py .deploy/khb_chatbot.sql khb_chatbot
"""
import json
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

URL = "https://panel.kroombox.com/api/mcp"
ENV_PATH = Path.home() / "AppData" / "Local" / "hermes" / ".env"
ENV_KEY = "MCP_KROOMBOXPANEL_KHB_API_KEY"


def token() -> str:
    for line in ENV_PATH.read_text(encoding="utf-8", errors="ignore").splitlines():
        if line.startswith(ENV_KEY + "="):
            return line.split("=", 1)[1].strip()
    raise SystemExit(f"{ENV_KEY} tidak ditemukan")


def call(name: str, args: dict) -> dict:
    body = json.dumps({"jsonrpc": "2.0", "id": 1, "method": "tools/call",
                       "params": {"name": name, "arguments": args}}).encode()
    req = urllib.request.Request(
        URL, data=body, method="POST",
        headers={"Authorization": f"Bearer {token()}", "Content-Type": "application/json",
                 "Accept": "application/json, text/event-stream", "User-Agent": "curl/8.4.0"})
    try:
        raw = urllib.request.urlopen(req, timeout=600).read().decode("utf-8", "replace")
    except urllib.error.HTTPError as exc:
        raise SystemExit(f"HTTP {exc.code}: {exc.read().decode('utf-8', 'replace')[:800]}")
    if raw.lstrip().startswith(("event:", "data:")):
        chunks = [l[5:].strip() for l in raw.splitlines() if l.startswith("data:")]
        raw = chunks[-1] if chunks else raw
    payload = json.loads(raw)
    if "error" in payload:
        raise SystemExit("RPC error: " + json.dumps(payload["error"])[:800])
    text = "".join(p.get("text", "") for p in payload.get("result", {}).get("content", []))
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {"raw": text}


if __name__ == "__main__":
    dump_path = Path(sys.argv[1])
    db_name = sys.argv[2]
    sql = dump_path.read_text(encoding="utf-8")
    print(f"dump {dump_path.name}: {len(sql)/1024:.1f} KB")
    result = call("kroombox_import_database",
                  {"database_name": db_name, "engine": "mysql", "sql_content": sql})
    print(json.dumps(result, indent=2, ensure_ascii=False)[:2000])
