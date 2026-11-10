"""Panggil tool MCP KroomBoxPanel akun KHB (pkm@gmail.com) lewat JSON-RPC mentah.

Dipakai karena tool `mcp__kroomboxpanel_khb__*` baru aktif setelah Hermes restart.
Token dibaca dari .env profil Hermes (tidak pernah dicetak).

Contoh:
  python scripts/panel_call.py kroombox_list_sites
  python scripts/panel_call.py kroombox_list_files '{"siteId":"s_1794302139890_6q56f","path":"/"}'
  python scripts/panel_call.py kroombox_get_site_health '{"siteId":"s_1794302139890_6q56f"}' --raw
"""
import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

URL = "https://panel.kroombox.com/api/mcp"
ENV_KEY = "MCP_KROOMBOXPANEL_KHB_API_KEY"
ENV_PATH = Path(os.environ.get("HERMES_HOME", Path.home() / "AppData/Local/hermes")) / ".env"


def token() -> str:
    for line in ENV_PATH.read_text(encoding="utf-8", errors="ignore").splitlines():
        if line.startswith(ENV_KEY + "="):
            return line.split("=", 1)[1].strip()
    raise SystemExit(f"{ENV_KEY} tidak ada di {ENV_PATH}")


def call(name: str, args: dict | None = None) -> str:
    body = json.dumps(
        {"jsonrpc": "2.0", "id": 1, "method": "tools/call",
         "params": {"name": name, "arguments": args or {}}}
    ).encode()
    req = urllib.request.Request(
        URL, data=body, method="POST",
        headers={
            "Authorization": f"Bearer {token()}",
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
            "User-Agent": "curl/8.4.0",  # UA lain kena Cloudflare 1010
        },
    )
    try:
        raw = urllib.request.urlopen(req, timeout=180).read().decode("utf-8", "replace")
    except urllib.error.HTTPError as exc:
        raise SystemExit(f"HTTP {exc.code}: {exc.read().decode('utf-8', 'replace')[:500]}")
    if raw.lstrip().startswith(("event:", "data:")):
        chunks = [l[5:].strip() for l in raw.splitlines() if l.startswith("data:")]
        raw = chunks[-1] if chunks else raw
    payload = json.loads(raw)
    if "error" in payload:
        raise SystemExit("RPC error: " + json.dumps(payload["error"])[:800])
    content = payload.get("result", {}).get("content", [])
    return "".join(part.get("text", "") for part in content)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    tool = sys.argv[1]
    args = json.loads(sys.argv[2]) if len(sys.argv) > 2 and sys.argv[2].startswith("{") else {}
    text = call(tool, args)
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        print(text)
    else:
        print(json.dumps(data, indent=2, ensure_ascii=False))
