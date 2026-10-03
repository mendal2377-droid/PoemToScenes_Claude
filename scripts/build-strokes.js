/**
 * Collects the stroke data for every character the poems use, one file per
 * scene, so a line can be written onto the painting stroke by stroke.
 *
 *   node scripts/build-strokes.js [path/to/hanzi-writer-data]
 *
 * The data comes from hanzi-writer-data (Make Me a Hanzi, after the Arphic
 * 楷书 — see its ARPHICPL licence). Each character is its strokes' outlines and
 * medians, in a 1024 box with y up. Only the characters a scene needs are kept,
 * so a scene loads a few hundred kilobytes rather than thirty megabytes.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
let data = process.argv[2];
if (!data) {
  try {
    data = path.dirname(require.resolve('hanzi-writer-data/package.json'));
  } catch {
    console.error('Pass the hanzi-writer-data folder, or npm i --no-save hanzi-writer-data');
    process.exit(1);
  }
}

const out = path.join(root, 'public', 'strokes');
fs.mkdirSync(out, { recursive: true });

// The Arphic licence travels with the data it covers.
fs.copyFileSync(path.join(data, 'ARPHICPL.TXT'), path.join(out, 'ARPHICPL.TXT'));

const dir = path.join(root, 'src', 'lib', 'scenes');
for (const file of fs.readdirSync(dir)) {
  if (file === 'index.ts') continue;
  const src = fs.readFileSync(path.join(dir, file), 'utf8');
  const id = /id: '([^']+)'/.exec(src)[1];
  const texts = [...src.matchAll(/\{ text: '([^']+)'/g)].map((m) => m[1]);
  const author = /author: '([^']+)'/.exec(src)[1];
  // The seal reads 〈name〉之印 or 〈name〉印, so those two are always wanted too.
  const chars = new Set([...texts.join(''), ...author, '之', '印']);
  const glyphs = {};
  const missing = [];
  for (const ch of chars) {
    const f = path.join(data, `${ch}.json`);
    if (!fs.existsSync(f)) {
      if (/\p{Script=Han}/u.test(ch)) missing.push(ch);
      continue;
    }
    const g = JSON.parse(fs.readFileSync(f, 'utf8'));
    glyphs[ch] = { s: g.strokes, m: g.medians };
  }
  const json = JSON.stringify(glyphs);
  fs.writeFileSync(path.join(out, `${id}.json`), json);
  console.log(`${id}: ${Object.keys(glyphs).length} characters, ${(json.length / 1024).toFixed(0)} KB${missing.length ? `, missing ${missing.join('')}` : ''}`);
}
