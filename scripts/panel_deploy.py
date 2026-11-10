"""Deploy New-KHB-V3 (frontend + backend Node) ke site KroomBoxPanel halalbandung.com.

Membaca kredensial dari server/.env (tidak pernah mencetak nilai rahasia) dan
mengirim archive zip sebagai base64 ke kroombox_deploy_new_site.

  python scripts/panel_deploy.py --dry-run          # lihat rencana saja
  python scripts/panel_deploy.py                    # deploy sungguhan
"""
import base64
import json
import os
import re
import secrets
import sys
import urllib.error
import urllib.request
from pathlib import Path

URL = "https://panel.kroombox.com/api/mcp"
SITE_ID = "s_1794302139890_6q56f"
ENV_PATH = Path.home() / "AppData" / "Local" / "hermes" / ".env"
ENV_KEY = "MCP_KROOMBOXPANEL_KHB_API_KEY"
ARCHIVE = Path(".deploy/khb-app.zip")

DATABASE_URL = "mysql://sql_pkm:kp_PKM_a7ef8fcdb3_!@192.168.100.185:3310/pkm_khb_chatbot"


def token() -> str:
    for line in ENV_PATH.read_text(encoding="utf-8", errors="ignore").splitlines():
        if line.startswith(ENV_KEY + "="):
            return line.split("=", 1)[1].strip()
    raise SystemExit(f"{ENV_KEY} tidak ditemukan")


def server_env() -> dict[str, str]:
    """Baca server/.env jadi dict."""
    out: dict[str, str] = {}
    for line in Path("server/.env").read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        out[key.strip()] = value.strip().strip('"').strip("'")
    return out


def build_env() -> dict[str, str]:
    local = server_env()
    session_secret = Path(".deploy/session.secret")
    if session_secret.exists():
        secret = session_secret.read_text().strip()
    else:
        secret = secrets.token_hex(32)
        session_secret.write_text(secret)
    env = {
        "NODE_ENV": "production",
        "DATABASE_URL": DATABASE_URL,
        "PUBLIC_BASE_URL": "https://halalbandung.com",
        "CORS_ORIGINS": "https://halalbandung.com,https://www.halalbandung.com",
        "SESSION_SECRET": secret,
        "SESSION_TTL_HOURS": "12",
        "ADMIN_EMAIL": local.get("ADMIN_EMAIL", "admin@khb.or.id"),
        "ADMIN_NAME": local.get("ADMIN_NAME", "Admin KHB"),
        "ADMIN_PASSWORD": local.get("ADMIN_PASSWORD", "khb-admin"),
        "LOG_LEVEL": "info",
        "APP_NAME": "khb-halal-assistant",
    }
    for key in (
        "RAG_CHAT_API_URL", "RAG_CHAT_API_KEY", "RAG_CHAT_KNOWLEDGE_BASE_ID",
        "RAG_API_URL", "RAG_API_KEY", "KMS_ORGANIZATION_ID", "KMS_DOCUMENT_CATEGORY",
        "KMS_OWNER_EMAIL", "KMS_OWNER_NAME",
        "LLM_API_URL", "LLM_API_KEY", "LLM_MODEL", "LLM_TIMEOUT_MS", "LLM_TEMPERATURE",
    ):
        if local.get(key):
            env[key] = local[key]
    return env


def call(name: str, args: dict, timeout: int = 900) -> dict:
    body = json.dumps({"jsonrpc": "2.0", "id": 1, "method": "tools/call",
                       "params": {"name": name, "arguments": args}}).encode()
    req = urllib.request.Request(
        URL, data=body, method="POST",
        headers={"Authorization": f"Bearer {token()}", "Content-Type": "application/json",
                 "Accept": "application/json, text/event-stream", "User-Agent": "curl/8.4.0"})
    try:
        raw = urllib.request.urlopen(req, timeout=timeout).read().decode("utf-8", "replace")
    except urllib.error.HTTPError as exc:
        raise SystemExit(f"HTTP {exc.code}: {exc.read().decode('utf-8', 'replace')[:1200]}")
    if raw.lstrip().startswith(("event:", "data:")):
        chunks = [l[5:].strip() for l in raw.splitlines() if l.startswith("data:")]
        raw = chunks[-1] if chunks else raw
    payload = json.loads(raw)
    if "error" in payload:
        raise SystemExit("RPC error: " + json.dumps(payload["error"])[:1200])
    text = "".join(p.get("text", "") for p in payload.get("result", {}).get("content", []))
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {"raw": text}


if __name__ == "__main__":
    dry = "--dry-run" in sys.argv
    env = build_env()
    new_site = "--new" in sys.argv
    payload = {
        "name": "khb-app" if new_site else "halalbandung",
        "framework": "nodejs",
        "source_type": "upload" if any(a.startswith("--upload-id=") for a in sys.argv) else "archive",
        "subdomain": "app.halalbandung.com" if new_site else "halalbandung.com",
        "custom_domain": "app.halalbandung.com" if new_site else "halalbandung.com",
        "build_command": (
            "npm install && npm run build && cd server && npm install && "
            "npm run build && npx prisma generate"
        ),
        "start_command": "npm --prefix server run start",
        "build_workdir": "/",
        "backend_enabled": True,
        "backend_dir": "server",
        "exposure_mode": "path",
        "api_prefix": "/api",
        "env_variables": env,
        "dry_run": dry,
    }
    upload_id = None
    for arg in sys.argv:
        if arg.startswith("--upload-id="):
            upload_id = arg.split("=", 1)[1]
    if upload_id:
        payload["upload_id"] = upload_id
        print(f"pakai upload_id {upload_id}")
    if not new_site:
        payload["site_id"] = SITE_ID
    if not dry:
        raw = ARCHIVE.read_bytes()
        print(f"archive {ARCHIVE.name}: {len(raw)/1024/1024:.2f} MB")
        payload["archive_base64"] = base64.b64encode(raw).decode()
    result = call("kroombox_deploy_new_site", payload)
    for key in ("env_variables", "archive_base64"):
        result.pop(key, None)
    print(json.dumps(result, indent=2, ensure_ascii=False)[:4000])
