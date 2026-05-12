/**
 * Figma Token Sync Server
 *
 * Receives DTCG JSON from the Figma plugin via HTTP POST,
 * runs sync + build inside packages/tokens.
 *
 * Usage: node tools/figma-token-exporter/server.mjs
 *    or: pnpm run dev:figma
 */

import { createServer } from 'node:http';
import { writeFileSync, existsSync, unlinkSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const TOKENS_PKG = resolve(ROOT, 'packages/tokens');

const PORT = 3456;

function log(msg) {
  const ts = new Date().toLocaleTimeString('en-US');
  console.log(`[${ts}] ${msg}`);
}

const server = createServer(async (req, res) => {
  // CORS headers for Figma plugin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/sync') {
    let body = '';
    for await (const chunk of req) body += chunk;

    const buildLog = [];
    const addLog = msg => {
      log(msg);
      buildLog.push(msg);
    };

    try {
      const exportPath = resolve(ROOT, 'takeoff-tokens-dtcg.json');
      writeFileSync(exportPath, body);

      // Sync
      execSync(`node scripts/sync-figma.mjs "${exportPath}"`, { cwd: TOKENS_PKG, encoding: 'utf-8', timeout: 30000 });
      addLog('sync complete');

      // Build
      const buildOut = execSync('node scripts/build-tokens.mjs', { cwd: TOKENS_PKG, encoding: 'utf-8', timeout: 60000 });
      buildOut
        .split('\n')
        .filter(Boolean)
        .forEach(l => addLog(l.trim()));

      // Cleanup
      if (existsSync(exportPath)) unlinkSync(exportPath);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, log: buildLog }));
    } catch (err) {
      addLog('ERROR: ' + err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          success: false,
          error: err.message,
          stderr: err.stderr?.toString() || '',
          log: buildLog,
        }),
      );
    }
    return;
  }

  // Health check
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', message: 'Takeoff Token Sync Server' }));
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  log(`token-sync listening on :${PORT}`);
});
