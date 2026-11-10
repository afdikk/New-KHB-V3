"""Upload archive proyek ke KroomBoxPanel secara bertahap (chunked).

Endpoint MCP menolak body besar (HTTP 413), jadi zip dikirim per potongan
base64. Hasilnya `upload_id` yang dipakai kroombox_deploy_new_site.

  python scripts/panel_upload.py .deploy/khb-app.zip [chunk_mb]
"""
import base64
import json
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


def call(name: str, args: dict, timeout: int = 600) -> dict:
    body = json.dumps({"jsonrpc": "2.0", "id": 1, "method": "tools/call",
                       "params": {"name": name, "arguments": args}}).encode()
    req = urllib.request.Request(
        URL, data=body, method="POST",
        headers={"Authorization": f"Bearer {token()}", "Content-Type": "application/json",
                 "Accept": "application/json, text/event-stream", "User-Agent": "curl/8.4.0"})
    try:
        raw = urllib.request.urlopen(req, timeout=timeout).read().decode("utf-8", "replace")
    except urllib.error.HTTPError as exc:
        body_text = exc.read().decode("utf-8", "replace")[:400]
        raise SystemExit(f"HTTP {exc.code}: {body_text}")
    if raw.lstrip().startswith(("event:", "data:")):
        chunks = [l[5:].strip() for l in raw.splitlines() if l.startswith("data:")]
        raw = chunks[-1] if chunks else raw
    payload = json.loads(raw)
    if "error" in payload:
        raise SystemExit("RPC error: " + json.dumps(payload["error"])[:600])
    text = "".join(p.get("text", "") for p in payload.get("result", {}).get("content", []))
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {"raw": text}


def upload(path: Path, chunk_mb: float = 1.0) -> str:
    data = path.read_bytes()
    size = len(data)
    step = int(chunk_mb * 1024 * 1024)
    parts = [data[i:i + step] for i in range(0, size, step)]
    upload_id = None
    for index, part in enumerate(parts):
        args = {
            "chunk_base64": base64.b64encode(part).decode(),
            "chunk_index": index,
            "total_chunks": len(parts),
            "file_name": path.name,
            "file_size": size,
        }
        if upload_id:
            args["upload_id"] = upload_id
        result = call("kroombox_upload_site_archive", args)
        upload_id = result.get("upload_id") or upload_id
        print(f"  chunk {index + 1}/{len(parts)} ok ({len(part)/1024:.0f} KB) id={upload_id}")
    if not upload_id:
        raise SystemExit("upload_id tidak diterima")
    return upload_id


if __name__ == "__main__":
    path = Path(sys.argv[1])
    chunk_mb = float(sys.argv[2]) if len(sys.argv) > 2 else 1.0
    print(f"upload {path.name} {path.stat().st_size/1024/1024:.2f} MB, chunk {chunk_mb} MB")
    print("UPLOAD_ID:", upload(path, chunk_mb))
