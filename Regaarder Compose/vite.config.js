import { defineConfig, loadEnv } from 'vite';
import path from 'path';
import fs from 'fs';

function apiDevMiddlewarePlugin() {
  return {
    name: 'api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        const pathname = parsedUrl.pathname;

        const routeMap = {
          '/api/ai-status': './api/ai-status.js',
          '/api/gemini': './api/gemini.js',
          '/api/claude': './api/claude.js',
          '/api/math': './api/math.js',
        };

        const targetRelPath = routeMap[pathname];
        if (!targetRelPath) {
          return next();
        }

        try {
          let body = {};
          if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            const chunks = [];
            for await (const chunk of req) {
              chunks.push(chunk);
            }
            const rawBody = Buffer.concat(chunks).toString('utf8');
            if (rawBody.trim()) {
              try {
                body = JSON.parse(rawBody);
              } catch (_e) {
                body = rawBody;
              }
            }
          }

          req.body = body;
          req.query = Object.fromEntries(parsedUrl.searchParams.entries());

          res.status = (code) => {
            res.statusCode = code;
            return res;
          };
          res.json = (payload) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(payload));
            return res;
          };

          const targetFullPath = path.resolve(import.meta.dirname, targetRelPath);
          const imported = await import(`${targetFullPath}?t=${Date.now()}`);
          const handler = imported.default;

          if (typeof handler === 'function') {
            await handler(req, res);
          } else {
            res.status(500).json({ ok: false, error: `Handler not found in ${targetRelPath}` });
          }
        } catch (err) {
          console.error(`[apiDevMiddleware] Error processing ${pathname}:`, err);
          if (!res.writableEnded) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: false, error: err.message || 'Internal Server Error' }));
          }
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [apiDevMiddlewarePlugin()],
    resolve: {
      alias: {
        '@regaarder/ui': fs.existsSync(path.resolve(import.meta.dirname, 'packages/ui/src/index.js'))
          ? path.resolve(import.meta.dirname, 'packages/ui/src/index.js')
          : path.resolve(import.meta.dirname, '../packages/ui/src/index.js'),
        canvg: path.resolve(import.meta.dirname, 'src/mock-canvg.js'),
      },
    },
    server: {
      proxy: {
        '/api/auth': 'http://localhost:3001',
        '/api/events': 'http://localhost:3001',
        '/api/mcp': 'http://localhost:3001',
        '/yjs': {
          target: 'ws://localhost:3001',
          ws: true,
        },
      },
    },
    optimizeDeps: {
      include: ['canvg'],
    },
    build: {
      minify: true,
      chunkSizeWarningLimit: 3000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('exceljs')) return 'vendor-exceljs';
              if (id.includes('pdfjs-dist')) return 'vendor-pdfjs';
              if (id.includes('katex')) return 'vendor-katex';
              if (id.includes('lucide-react')) return 'vendor-lucide';
              if (id.includes('socket.io-client')) return 'vendor-socketio';
            }
          },
        },
        onwarn(warning, warn) {
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes('use client')) {
            return;
          }
          warn(warning);
        },
      },
    },
  };
});
