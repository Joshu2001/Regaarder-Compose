import { spawn } from 'node:child_process';

const port = process.env.REGAARDER_VITE_PORT || '5176';
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const electronCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';

const vite = spawn(npmCommand, ['run', 'dev', '--', '--host', '127.0.0.1', '--port', port], {
  stdio: 'inherit',
  shell: false,
  env: { ...process.env, BROWSER: 'none' },
});

const stopVite = () => {
  if (!vite.killed) {
    vite.kill();
  }
};

process.on('exit', stopVite);
process.on('SIGINT', () => {
  stopVite();
  process.exit(130);
});
process.on('SIGTERM', () => {
  stopVite();
  process.exit(143);
});

const waitForVite = async () => {
  const url = `http://127.0.0.1:${port}`;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return url;
    } catch (_error) {
      // Vite is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Vite did not become available at ${url}`);
};

try {
  const viteUrl = await waitForVite();
  const electron = spawn(electronCommand, ['electron', '.'], {
    stdio: 'inherit',
    shell: false,
    env: { ...process.env, NODE_ENV: 'development', VITE_DEV_SERVER_URL: viteUrl },
  });

  electron.on('exit', (code, signal) => {
    stopVite();
    process.exit(code ?? (signal ? 1 : 0));
  });
} catch (error) {
  stopVite();
  console.error(`[dev:electron] ${error.message}`);
  process.exit(1);
}
