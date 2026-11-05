#!/usr/bin/env node
/**
 * Satu perintah untuk menjalankan frontend + backend KHB.
 *
 *   npm run dev              → Vite (port 3000, otomatis pindah bila terpakai) + API :4000
 *   npm run dev -- --port 3100
 *   npm run dev -- --api-port 4100
 *
 * Pola sama dengan `scripts/dev.mjs` di AiOnesCare: dua proses anak, keluaran
 * diberi prefiks, dan Ctrl+C mematikan keduanya (termasuk di Windows).
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const serverDir = path.join(root, 'server');
const isWindows = process.platform === 'win32';

const args = process.argv.slice(2);
const readFlag = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};

const webPort = Number(readFlag('--port') ?? 3000);
const apiPort = Number(readFlag('--api-port') ?? 4000);

const colors = { web: '\x1b[36m', api: '\x1b[32m', sys: '\x1b[35m', dim: '\x1b[2m', reset: '\x1b[0m' };
const log = (tag, message) => {
  const color = colors[tag] ?? colors.sys;
  console.log(`${color}[${tag}]${colors.reset} ${message}`);
};

/**
 * Cek port terpakai dengan MENCOBA KONEKSI, bukan mencoba bind.
 * Di Windows, dua proses masih bisa bind port yang sama (SO_REUSEADDR),
 * sehingga uji bind memberi hasil "bebas" padahal sudah ada yang melayani.
 */
function isPortBusy(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host: '127.0.0.1' });
    const finish = (busy) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(busy);
    };
    socket.setTimeout(800);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(true));
    socket.once('error', () => finish(false));
  });
}

/** Cari port bebas mulai dari `start` (3000 → 3100 → 3200 …). */
async function pickPort(start, label) {
  const candidates = [start, start + 100, start + 200, start + 300, start + 400];
  for (const port of candidates) {
    if (!(await isPortBusy(port))) {
      if (port !== start) log('sys', `${label}: port ${start} terpakai, memakai ${port}`);
      return port;
    }
  }
  log('sys', `${label}: port ${candidates.join(', ')} semuanya terpakai. Hentikan proses lain dulu.`);
  process.exit(1);
}

async function ensureServerDeps() {
  if (existsSync(path.join(serverDir, 'node_modules'))) {
    // Prisma Client tidak selalu dibuat ulang oleh `npm install`.
    if (!existsSync(path.join(serverDir, 'node_modules', '.prisma', 'client', 'index.js'))) {
      log('sys', 'Prisma Client belum dibuat — menjalankan prisma generate…');
      const gen = spawnSync('npx', ['prisma', 'generate'], {
        cwd: serverDir,
        stdio: 'inherit',
        shell: isWindows,
      });
      if (gen.status !== 0) {
        log('sys', 'prisma generate gagal. Jalankan manual: npm --prefix server exec prisma generate');
        process.exit(1);
      }
    }
    return;
  }
  log('sys', 'server/node_modules belum ada — menjalankan npm install di server…');
  const install = spawnSync('npm', ['install', '--no-audit', '--no-fund'], {
    cwd: serverDir,
    stdio: 'inherit',
    shell: isWindows,
  });
  if (install.status !== 0) {
    log('sys', 'Gagal install dependensi backend. Jalankan manual: npm --prefix server install');
    process.exit(1);
  }
}

function run(command, commandArgs, { cwd, tag, extraEnv }) {
  const child = spawn(command, commandArgs, {
    cwd,
    shell: isWindows,
    env: { ...process.env, ...extraEnv },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const pump = (stream, isError) => {
    let buffer = '';
    stream.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (line.trim().length === 0) continue;
        console.log(`${colors[tag] ?? colors.sys}[${tag}]${colors.reset} ${isError ? `${colors.dim}${line}${colors.reset}` : line}`);
      }
    });
  };

  pump(child.stdout, false);
  pump(child.stderr, true);
  return child;
}

function killTree(child) {
  if (!child || child.killed || child.exitCode !== null) return;
  if (isWindows) {
    spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
  } else {
    child.kill('SIGTERM');
  }
}

/** Poll /health sampai API siap (maks 20 detik). */
async function waitForApi(port) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/health`);
      if (response.ok) {
        log('sys', 'backend siap');
        return;
      }
    } catch {
      // belum siap — ulangi
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  log('sys', 'backend belum merespons /health. Cek pesan [api] di atas (mungkin DATABASE_URL salah).');
}

const main = async () => {
  await ensureServerDeps();

  if (!existsSync(path.join(serverDir, '.env'))) {
    log('sys', 'server/.env belum ada. Salin dari server/.env.example lalu isi DATABASE_URL + LLM_*.');
  }

  const freeWebPort = await pickPort(webPort, 'frontend');
  const freeApiPort = await pickPort(apiPort, 'backend');

  log('sys', `frontend → http://localhost:${freeWebPort}`);
  log('sys', `backend  → http://localhost:${freeApiPort}/health`);

  const api = run('npm', ['run', 'dev'], {
    cwd: serverDir,
    tag: 'api',
    extraEnv: { PORT: String(freeApiPort), PUBLIC_BASE_URL: `http://localhost:${freeApiPort}` },
  });

  // Tunggu API benar-benar melayani /health sebelum frontend dinyalakan.
  await waitForApi(freeApiPort);

  const web = run('npx', ['vite', '--port', String(freeWebPort), '--host'], {
    cwd: root,
    tag: 'web',
    extraEnv: { KHB_API_PORT: String(freeApiPort) },
  });

  const shutdown = (signal) => {
    log('sys', `${signal} diterima — menghentikan frontend & backend…`);
    killTree(web);
    killTree(api);
    setTimeout(() => process.exit(0), 400);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGHUP', () => shutdown('SIGHUP'));

  const watch = (child, name) => {
    child.on('exit', (code) => {
      if (code === 0 || code === null) return;
      log('sys', `${name} berhenti dengan kode ${code}. Menghentikan proses lainnya.`);
      killTree(web);
      killTree(api);
      process.exit(code);
    });
  };

  watch(web, 'frontend');
  watch(api, 'backend');
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
