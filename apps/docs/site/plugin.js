import { existsSync, readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { routes } from './routes.js';

const require = createRequire(import.meta.url);
const libEntry = require.resolve('@native-base/css');
const libDist = dirname(libEntry);

// Files the library build produces that the site serves verbatim: the registry over plain GET.
const PASSTHROUGH = /^\/(native-base\.css|llms\.txt|r\/[\w-]+\.(json|css))$/;
const TYPES = { '.css': 'text/css', '.json': 'application/json', '.txt': 'text/plain; charset=utf-8' };

/** Fresh import of the built library, so `rolldown --watch` output shows up without restarting Vite. */
async function loadSite() {
  const { mtimeMs } = statSync(libEntry);
  const { registry } = await import(`${pathToFileURL(libEntry).href}?t=${mtimeMs}`);
  return { registry, llms: readFileSync(join(libDist, 'llms.txt'), 'utf8') };
}

export function nativeBaseSite() {
  let root;
  let pages;

  const htmlPath = (url) => join(root, url, 'index.html');
  const urlFor = (id) => {
    if (!id.endsWith('index.html')) return;
    const url = `/${relative(root, dirname(id)).split('\\').join('/')}/`.replace(/^\/+\/?/, '/');
    return pages.has(url) ? url : undefined;
  };

  return {
    name: 'native-base-site',
    enforce: 'pre',

    async config(config) {
      root = resolve(config.root ?? process.cwd());
      pages = routes(await loadSite());
      const input = Object.fromEntries([...pages.keys()].map((url) => [url === '/' ? 'index' : url.slice(1, -1), htmlPath(url)]));
      return { build: { rolldownOptions: { input } } };
    },

    resolveId(id) {
      if (urlFor(id)) return id;
    },

    load(id) {
      const url = urlFor(id);
      if (url) return pages.get(url)();
    },

    configureServer(server) {
      server.watcher.add(libDist);
      server.watcher.on('change', (file) => {
        if (file.startsWith(libDist)) server.ws.send({ type: 'full-reload' });
      });

      server.middlewares.use(async (req, res, next) => {
        const { pathname } = new URL(req.url, 'http://localhost');

        if (PASSTHROUGH.test(pathname)) {
          const file = join(libDist, pathname);
          if (!existsSync(file)) return next();
          res.setHeader('content-type', TYPES[extname(file)]);
          res.setHeader('access-control-allow-origin', '*');
          return res.end(readFileSync(file));
        }

        const site = await loadSite();
        const current = routes(site);
        if (!pathname.endsWith('/') && current.has(`${pathname}/`)) {
          res.writeHead(301, { location: `${pathname}/` });
          return res.end();
        }
        const render = current.get(pathname);
        if (!render) return next();

        try {
          const html = await server.transformIndexHtml(req.url, render());
          res.setHeader('content-type', 'text/html');
          res.end(html);
        } catch (error) {
          next(error);
        }
      });
    },

    generateBundle() {
      const emit = (fileName) => this.emitFile({ type: 'asset', fileName, source: readFileSync(join(libDist, fileName)) });
      emit('native-base.css');
      emit('llms.txt');
      for (const item of JSON.parse(readFileSync(join(libDist, 'r/index.json'), 'utf8')).items) {
        emit(`r/${item.name}.json`);
        emit(`r/${item.name}.css`);
      }
      emit('r/index.json');
    },
  };
}
