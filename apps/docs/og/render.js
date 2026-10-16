// Renders the share card and app icons into public/. The PNGs are committed, so this only runs when card.html or icon.html change.
// Needs Google Chrome (or CHROME=/path/to/chrome) and macOS `sips` for resizing.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const pub = join(here, '../public');
const chrome = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

function screenshot(file, out, [width, height]) {
  execFileSync(chrome, [
    '--headless=new',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--default-background-color=00000000',
    `--window-size=${width},${height}`,
    `--screenshot=${out}`,
    pathToFileURL(join(here, file)).href,
  ], { stdio: 'ignore' });
}

const resize = (from, to, size) => execFileSync('sips', ['-z', size, size, from, '--out', to], { stdio: 'ignore' });

/** A one-image .ico that wraps a PNG, which every browser since IE has read. */
function ico(png) {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // one image
  header.writeUInt8(png.readUInt32BE(16), 6); // width (from the PNG's IHDR)
  header.writeUInt8(png.readUInt32BE(20), 7); // height
  header.writeUInt16LE(1, 10); // color planes
  header.writeUInt16LE(32, 12); // bits per pixel
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(22, 18); // image offset
  return Buffer.concat([header, png]);
}

screenshot('card.html', join(pub, 'og.png'), [1200, 630]);

const tmp = mkdtempSync(join(tmpdir(), 'nb-icon-'));
const icon = join(tmp, 'icon.png');
screenshot('icon.html', icon, [512, 512]);
resize(icon, join(pub, 'icon-512.png'), 512);
resize(icon, join(pub, 'icon-192.png'), 192);
resize(icon, join(pub, 'apple-touch-icon.png'), 180);
// The tab icon keeps favicon.svg's rounded corners; the transparent background survives the screenshot.
const favicon = join(tmp, 'favicon.png');
screenshot('../public/favicon.svg', favicon, [512, 512]);
resize(favicon, favicon, 32);
writeFileSync(join(pub, 'favicon.ico'), ico(readFileSync(favicon)));
rmSync(tmp, { recursive: true });

console.log('Wrote og.png, apple-touch-icon.png, icon-192.png, icon-512.png and favicon.ico to public/');
