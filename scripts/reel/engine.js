/**
 * The film engine: one unbroken take of a poem's scene, for Douyin, Reels and X.
 *
 * A screenplay (see the other files in this folder) says which scene, where the
 * camera is at which moment, what happens in the world as it moves (the clock,
 * the weather), what is drawn over the picture, when each line is written, and
 * what is heard. This turns it into a 1080×1920, 30 fps mp4 with AAC sound.
 *
 * Paste `engine.js` and a screenplay into the console of a page on the site's own
 * origin (a production build) with mp4-muxer loaded as a classic script, then
 *
 *   await __reel(__screenplays.niaoming, { upload: '/api/film?name=' })
 *   await __reel(__screenplays.niaoming, { upload, preview: [4, 20, 41] })   // stills
 *
 * The picture is the scene itself in film mode (src/three/Film.tsx), rendered
 * frame by frame under a scripted camera (`__film.pose`). Over it, on a 2D
 * canvas: whatever the screenplay draws, the lines written stroke by stroke
 * from the stroke data the app's 题跋 uses, English beneath, the poem whole at
 * the end with the poet's seal, and the house mark. The score is synthesised
 * offline from the screenplay's cues with the instruments here.
 */
window.__screenplays = window.__screenplays || {};

window.__reel = async (sp, { upload = null, preview = null } = {}) => {
  const W = 1080, H = 1920, FPS = 30, SR = 48000;
  const TOTAL = sp.total;
  const PAPER = sp.paper || '#e9e7de';
  const INK = '#1d1e23', SILVER = '#efeee6', SEAL = '#b5302a';
  const LATIN = '"Palatino Linotype","Iowan Old Style",Palatino,"Book Antiqua",Georgia,serif';
  const KAI = '"Kaiti SC","STKaiti","KaiTi","楷体",serif';
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const clamp01 = (t) => Math.max(0, Math.min(1, t));
  const ease = (t) => { t = clamp01(t); return t * t * (3 - 2 * t); };
  const ease5 = (t) => { t = clamp01(t); return t * t * t * (t * (t * 6 - 15) + 10); };
  const span = (t, a, b) => clamp01((t - a) / (b - a));
  const mix = (a, b, k) => a + (b - a) * k;
  const mix3 = (a, b, k) => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)];
  const rng = (seed) => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const job = (window.__job = { done: false, err: null, frames: 0, total: Math.round(TOTAL * FPS), phase: 'load', encErr: null });

  // ---------------------------------------------------------------- the scene
  document.querySelectorAll('iframe.__reel').forEach((x) => x.remove());
  const frame = document.createElement('iframe');
  frame.className = '__reel';
  // 720×1280 at the canvas's 1.5 pixel ratio is a 1080×1920 picture.
  frame.src = `/scene/${sp.scene}?film&ink=full`;
  frame.style.cssText = 'position:fixed;left:0;top:0;width:720px;height:1280px;border:0;pointer-events:none;z-index:-1';
  document.body.appendChild(frame);
  {
    const t0 = performance.now();
    const ready = () => frame.contentWindow && frame.contentWindow.__film && frame.contentDocument.querySelector('canvas');
    while (!ready() && performance.now() - t0 < 1800000) await sleep(250);
    await sleep(1500);
    while (!ready()) await sleep(250);
  }
  const F = frame.contentWindow.__film;
  const gl = frame.contentDocument.querySelector('canvas');
  const G = (x, z) => F.ground(x, z);
  const WATER = F.water;
  const glyphs = await (await fetch(`/strokes/${sp.scene}.json`)).json();

  F.walk = 0;
  F.fadeTo(0, 0.05);
  F.bloom(0);
  if (sp.setup) sp.setup(F);

  // ------------------------------------------------------------- the camera
  // One take: keyframes of where the lens is, what it looks at and its field of
  // view, joined by a Hermite spline whose tangents respect the time between
  // keys — so the eye glides, settles, and never lurches. A key may repeat its
  // neighbour to hold.
  const K = sp.camera({ G, WATER });
  const tan = (i, get) => {
    if (i === 0 || i === K.length - 1) return get(K[i]).map(() => 0);
    const a = get(K[i - 1]), b = get(K[i + 1]);
    const dt = K[i + 1][0] - K[i - 1][0];
    return a.map((v, j) => (b[j] - v) / dt);
  };
  const curve = (t, get) => {
    let i = 0;
    while (i < K.length - 2 && t > K[i + 1][0]) i++;
    const t0 = K[i][0], t1 = K[i + 1][0], h = t1 - t0;
    const u = clamp01((t - t0) / h);
    const u2 = u * u, u3 = u2 * u;
    const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
    const p0 = get(K[i]), p1 = get(K[i + 1]), m0 = tan(i, get), m1 = tan(i + 1, get);
    return p0.map((v, j) => h00 * v + h10 * h * m0[j] + h01 * p1[j] + h11 * h * m1[j]);
  };
  const poseAt = (t) => {
    const pos = curve(t, (k) => k[1]);
    const floor = Math.max(G(pos[0], pos[2]), WATER) + 0.7;
    if (pos[1] < floor) pos[1] = floor;
    return { pos, look: curve(t, (k) => k[2]), fov: curve(t, (k) => [k[3]])[0] };
  };

  // The same pinhole the scene's camera uses, so drawn things sit in the world.
  function project(X, pose) {
    const [px, py, pz] = pose.pos;
    let fx = pose.look[0] - px, fy = pose.look[1] - py, fz = pose.look[2] - pz;
    const fl = Math.hypot(fx, fy, fz); fx /= fl; fy /= fl; fz /= fl;
    // right = forward × up(0,1,0); up' = right × forward.
    let rx = -fz, ry = 0, rz = fx;
    const rl = Math.hypot(rx, ry, rz); rx /= rl; ry /= rl; rz /= rl;
    const ux = ry * fz - rz * fy, uy = rz * fx - rx * fz, uz = rx * fy - ry * fx;
    const dx = X[0] - px, dy = X[1] - py, dz = X[2] - pz;
    const zc = dx * fx + dy * fy + dz * fz;
    const s = H / 2 / Math.tan(((pose.fov ?? 52) * Math.PI) / 360);
    return { x: W / 2 + ((dx * rx + dy * ry + dz * rz) / zc) * s, y: H / 2 - ((dx * ux + dy * uy + dz * uz) / zc) * s, z: zc };
  }
  /** Where a body in the sky (a unit direction) lands on the screen. */
  const skyPoint = (dir, pose) => project([pose.pos[0] + dir[0] * 600, pose.pos[1] + dir[1] * 600, pose.pos[2] + dir[2] * 600], pose);

  // ---------------------------------------------------------------- canvases
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  const out = mk(), ctx = out.getContext('2d');
  const tmp = mk(), tmpx = tmp.getContext('2d');

  function paperFill(c, a = 1) {
    if (a <= 0) return;
    c.save();
    c.globalAlpha = a;
    c.fillStyle = PAPER;
    c.fillRect(0, 0, W, H);
    const g = c.createRadialGradient(W / 2, H * 0.45, H * 0.25, W / 2, H / 2, H * 0.8);
    g.addColorStop(0, 'rgba(255,255,250,0.0)');
    g.addColorStop(1, 'rgba(150,146,130,0.22)');
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    c.restore();
  }

  const probe = document.createElement('canvas'); probe.width = 16; probe.height = 16;
  const probeX = probe.getContext('2d', { willReadFrequently: true });
  /** How light the picture is under a rectangle, 0–255. */
  function lum(x, y, w, h) {
    probeX.drawImage(out, x, y, w, h, 0, 0, 16, 16);
    const d = probeX.getImageData(0, 0, 16, 16).data;
    let s = 0;
    for (let i = 0; i < d.length; i += 4) s += d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11;
    return s / 256;
  }

  // ------------------------------------------------------------ calligraphy
  // Written stroke by stroke: a wide brush drawn along each stroke's median,
  // clipped to its outline — the same data and method as the app's 题跋.
  const strokeCache = {};
  function glyphStrokes(ch) {
    if (strokeCache[ch]) return strokeCache[ch];
    const g = glyphs[ch];
    if (!g) return (strokeCache[ch] = []);
    return (strokeCache[ch] = g.s.map((d, i) => {
      const m = g.m[i];
      let L = 0;
      for (let k = 1; k < m.length; k++) L += Math.hypot(m[k][0] - m[k - 1][0], m[k][1] - m[k - 1][1]);
      const path = new Path2D();
      m.forEach((p, k) => (k ? path.lineTo(p[0], p[1]) : path.moveTo(p[0], p[1])));
      return { outline: new Path2D(d), median: path, len: L + 80, pts: m };
    }));
  }
  function planColumn(text, start, dur) {
    const chars = [...text];
    const all = chars.map((ch) => glyphStrokes(ch));
    let total = 0;
    all.forEach((ss) => ss.forEach((s) => (total += s.len)));
    const gaps = all.reduce((n, ss) => n + ss.length, 0) * 0.05 + chars.length * 0.14;
    const speed = total / Math.max(0.5, dur - gaps);
    let t = start;
    return all.map((ss) => {
      const r = ss.map((s) => { const p = { s, t0: t, t1: t + s.len / speed }; t = p.t1 + 0.05; return p; });
      t += 0.14;
      return r;
    });
  }
  /** Brush a column's strokes, as far as they have got at time t, into a canvas. */
  function strokesInto(cx, plan, x, y, size, t, color) {
    const k = size / 1024;
    plan.forEach((strokes, ci) => {
      strokes.forEach(({ s, t0, t1 }) => {
        const p = clamp01((t - t0) / (t1 - t0));
        if (p <= 0) return;
        cx.save();
        cx.setTransform(k, 0, 0, -k, x, y + ci * size * 1.08 + 900 * k);
        cx.clip(s.outline);
        cx.strokeStyle = color;
        cx.lineWidth = 190;
        cx.lineCap = 'round';
        cx.lineJoin = 'round';
        cx.setLineDash([s.len, s.len]);
        cx.lineDashOffset = s.len * (1 - p);
        cx.stroke(s.median);
        cx.restore();
      });
    });
  }
  /** Lay a layer of writing onto the picture, with its breath of paper (or shadow). */
  function blit(layer, alpha, color, size = 110) {
    if (alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = alpha * 0.94;
    ctx.filter = 'blur(0.5px)';
    ctx.shadowColor = color === INK ? 'rgba(238,236,228,0.95)' : 'rgba(6,8,14,0.85)';
    ctx.shadowBlur = Math.max(10, size * 0.16);
    ctx.drawImage(layer, 0, 0);
    ctx.shadowBlur = 0;
    ctx.drawImage(layer, 0, 0);
    ctx.restore();
  }
  function drawColumn(plan, x, y, size, t, alpha = 1, color = INK) {
    if (alpha <= 0) return;
    tmpx.clearRect(0, 0, W, H);
    strokesInto(tmpx, plan, x, y, size, t, color);
    blit(tmp, alpha, color, size);
  }
  function english(str, a, y = 1452) {
    if (a <= 0) return;
    const dark = lum(140, y - 50, W - 280, 70) < 128;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.save();
    ctx.translate(W / 2, y - 12);
    ctx.scale(1, 0.15);
    const wash = ctx.createRadialGradient(0, 0, 0, 0, 0, 470);
    const c = dark ? '8,10,16' : '238,236,228';
    wash.addColorStop(0, `rgba(${c},${dark ? 0.42 : 0.6})`);
    wash.addColorStop(0.6, `rgba(${c},${dark ? 0.24 : 0.36})`);
    wash.addColorStop(1, `rgba(${c},0)`);
    ctx.fillStyle = wash;
    ctx.fillRect(-470, -470, 940, 940);
    ctx.restore();
    ctx.font = `italic 40px ${LATIN}`;
    ctx.textAlign = 'center';
    ctx.letterSpacing = '0.5px';
    ctx.shadowColor = dark ? 'rgba(6,8,14,0.8)' : 'rgba(240,238,230,0.95)';
    ctx.shadowBlur = 18;
    ctx.fillStyle = dark ? '#f1efe7' : '#26272c';
    ctx.fillText(str, W / 2, y);
    ctx.shadowBlur = 0;
    ctx.fillText(str, W / 2, y);
    ctx.restore();
  }
  function seal(chars, x, y, size, t, t0) {
    const k = span(t, t0, t0 + 0.45);
    if (k <= 0) return;
    const sc = mix(1.45, 1, ease(k));
    ctx.save();
    ctx.globalAlpha = Math.min(1, k * 2) * 0.95;
    ctx.translate(x + size / 2, y + size / 2);
    ctx.rotate(-0.03);
    ctx.scale(sc, sc);
    ctx.translate(-size / 2, -size / 2);
    ctx.fillStyle = SEAL;
    ctx.beginPath(); ctx.roundRect(0, 0, size, size, size * 0.06); ctx.fill();
    // Right column first, top to bottom; the characters cut white into the red.
    ctx.globalCompositeOperation = 'destination-out';
    [...chars].forEach((ch, i) => {
      const q = size * 0.4, pad = size * 0.07;
      const cx = i < 2 ? size - pad - q : pad, cy = pad + (i % 2) * (q + size * 0.06);
      const kk = q / 1024;
      ctx.save();
      ctx.translate(cx, cy + 900 * kk); ctx.scale(kk, -kk);
      for (const s of glyphStrokes(ch)) ctx.fill(s.outline);
      ctx.restore();
    });
    const r = rng(773);
    for (let i = 0; i < 70; i++) { ctx.beginPath(); ctx.arc(r() * size, r() * size, r() * size * 0.018, 0, 6.28); ctx.fill(); }
    ctx.restore();
  }

  // Lines, title, the poem whole.
  const COL = sp.column;
  const LINES = sp.lines.map((l) => ({ ...l, plan: planColumn(l.zh, l.w[0], l.w[1]) }));
  const TITLE = sp.title && { ...sp.title, plan: planColumn(sp.title.text, sp.title.at, sp.title.dur ?? 1.6) };
  const AUTHOR = sp.title && { plan: planColumn(sp.author, sp.title.at + 1.5, 1.3) };
  const FIN = sp.final;
  LINES.forEach((l, i) => (l.final = planColumn(l.zh, FIN.at + i * 0.9, 0.01)));
  const sealChars = sp.sealChars ?? (sp.author.length === 2 ? `${sp.author}之印` : `${sp.author}印`.slice(0, 4));
  const longest = Math.max(...LINES.map((l) => [...l.zh].length));

  const layerA = mk(), layerB = mk();
  const api = {
    ctx, W, H, project, skyPoint, ease, ease5, span, mix, mix3, clamp01, rng, lum, INK, SILVER, PAPER, F, G, WATER,
    layers: [layerA, layerB], strokesInto, blit, english, drawColumn,
  };

  // ----------------------------------------------------------------- a frame
  function compose(t, fresh) {
    const pose = poseAt(t);
    F.bloom(t < 0.35 ? 0 : ease(span(t, 0.35, 3.3)));
    if (sp.world) sp.world(F, t);
    F.pose(pose);
    if (fresh) F.step(); else F.again();

    paperFill(ctx);
    ctx.save();
    ctx.filter = sp.grade ? sp.grade(t) : 'contrast(1.12) brightness(1.03)';
    ctx.drawImage(gl, 0, 0, W, H);
    ctx.restore();
    if (sp.drawWorld) sp.drawWorld(api, t, pose);

    // Before the drop there is only paper.
    paperFill(ctx, 1 - ease(span(t, 0.15, 0.4)));
    if (sp.drawNear) sp.drawNear(api, t, pose);

    const textInk = sp.textInk ?? INK;
    if (TITLE) {
      const a = ease(span(t, TITLE.at - 0.3, TITLE.at + 0.5)) * (1 - ease(span(t, TITLE.out - 1.2, TITLE.out)));
      drawColumn(TITLE.plan, TITLE.x, TITLE.y, TITLE.size, t, a, textInk);
      drawColumn(AUTHOR.plan, TITLE.x + TITLE.size * 0.28, TITLE.y + TITLE.size * ([...TITLE.text].length * 1.08 + 0.3), TITLE.size * 0.44, t, a * 0.85, textInk);
    }
    if (sp.drawLines) sp.drawLines(api, t, LINES);
    else LINES.forEach((l) => {
      const a = ease(span(t, l.show[0] - 0.3, l.show[0] + 0.2)) * (1 - ease(span(t, l.show[1] - 1.4, l.show[1])));
      if (a <= 0) return;
      let color = textInk;
      if (!sp.textInk) color = lum(COL.x, COL.y, COL.size, COL.size * 5.4) < 120 ? SILVER : INK;
      drawColumn(l.plan, COL.x, COL.y, COL.size, t, a, color);
      english(l.en, a * ease(span(t, l.w[0] + 1.4, l.w[0] + 2.6)));
    });

    // The poem whole, and the seal.
    const fA = ease(span(t, FIN.at - 0.4, FIN.at + 0.4)) * (1 - ease(span(t, FIN.out - 1.4, FIN.out)));
    if (fA > 0) {
      LINES.forEach((l, i) => {
        const ap = ease(span(t, FIN.at + i * 0.6, FIN.at + i * 0.6 + 1.3));
        drawColumn(l.final, FIN.x0 - i * FIN.dx, FIN.y, FIN.size, t + 100, fA * ap, FIN.ink ?? textInk);
      });
      seal(sealChars, FIN.x0 - (LINES.length - 1) * FIN.dx + 6, FIN.y + FIN.size * (longest * 1.08 + 0.5), 88, t, FIN.sealAt);
      english(FIN.credit, fA * ease(span(t, FIN.sealAt - 0.8, FIN.sealAt + 0.4)), 1452);
    }

    // To paper, and the house mark.
    paperFill(ctx, ease(span(t, sp.end.paper, sp.end.paper + 1.6)));
    const eA = ease(span(t, sp.end.card, sp.end.card + 0.9)) * (1 - ease(span(t, TOTAL - 0.7, TOTAL)));
    if (eA > 0) {
      ctx.save();
      ctx.globalAlpha = eA;
      ctx.fillStyle = INK;
      ctx.textAlign = 'center';
      ctx.font = `96px ${KAI}`;
      ctx.letterSpacing = '24px';
      ctx.fillText('卧游', W / 2 + 12, H * 0.47);
      ctx.font = `italic 34px ${LATIN}`;
      ctx.letterSpacing = '6px';
      ctx.fillStyle = '#4a4a50';
      ctx.fillText('WANDERING IN THE LANDSCAPE', W / 2 + 3, H * 0.47 + 74);
      ctx.font = `26px ${LATIN}`;
      ctx.letterSpacing = '2px';
      ctx.fillText('poemtoscenesclaude.vercel.app', W / 2 + 1, H * 0.47 + 132);
      ctx.restore();
    }
  }

  // ------------------------------------------------------------------ previews
  if (preview) {
    const names = [];
    for (const t of preview) {
      for (let i = 0; i < 4; i++) { compose(t, true); await sleep(5); }
      const b = await new Promise((r) => out.toBlob(r, 'image/jpeg', 0.88));
      const name = `${sp.name}-${String(t).replace('.', '_')}.jpg`;
      if (upload) await fetch(upload + name, { method: 'POST', body: b });
      names.push(name);
    }
    job.done = true;
    return names;
  }

  // ------------------------------------------------------------------- score
  // The instruments; the screenplay says what plays when.
  async function score() {
    const oc = new OfflineAudioContext(2, Math.ceil(TOTAL * SR), SR);
    const rnd = rng(sp.seed ?? 99);
    const master = oc.createGain();
    const comp = oc.createDynamicsCompressor(); comp.threshold.value = -26; comp.ratio.value = 3; comp.knee.value = 12; comp.attack.value = 0.01; comp.release.value = 0.4;
    const makeup = oc.createGain(); makeup.gain.value = sp.makeup ?? 1.1;
    const limit = oc.createDynamicsCompressor(); limit.threshold.value = -3; limit.knee.value = 0; limit.ratio.value = 20; limit.attack.value = 0.002; limit.release.value = 0.12;
    master.connect(comp); comp.connect(makeup); makeup.connect(limit); limit.connect(oc.destination);
    master.gain.value = 1.5;
    master.gain.setValueAtTime(1.5, TOTAL - 2.6);
    master.gain.linearRampToValueAtTime(0, TOTAL - 0.05);

    const irLen = Math.floor(SR * (sp.reverb ?? 4.2)), ir = oc.createBuffer(2, irLen, SR);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < irLen; i++) d[i] = (rnd() * 2 - 1) * Math.pow(1 - i / irLen, 3.2) * (i < 400 ? i / 400 : 1); }
    const conv = oc.createConvolver(); conv.buffer = ir;
    const wet = oc.createGain(); wet.gain.value = 0.62; conv.connect(wet); wet.connect(master);
    const dl = oc.createDelay(1.5); dl.delayTime.value = 0.61;
    const fb = oc.createGain(); fb.gain.value = 0.28; dl.connect(fb); fb.connect(dl);
    const dlo = oc.createGain(); dlo.gain.value = 0.22; dl.connect(dlo); dlo.connect(conv);
    const bus = oc.createGain(); const dry = oc.createGain(); dry.gain.value = 0.8;
    bus.connect(dry); dry.connect(master); bus.connect(conv); bus.connect(dl);

    const nb = oc.createBuffer(1, SR * 3, SR);
    { const d = nb.getChannelData(0); let b = 0; for (let i = 0; i < d.length; i++) { const w = rnd() * 2 - 1; b = 0.985 * b + 0.015 * w; d[i] = w * 0.6 + b * 6; } }
    const A = { oc, rnd, master, bus, conv, TOTAL };
    A.noise = (t0, t1, type, f, q, gain, fi, fo, dest = master, pan = 0) => {
      const s = oc.createBufferSource(); s.buffer = nb; s.loop = true;
      const fl = oc.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q;
      const g = oc.createGain();
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(gain, t0 + fi);
      g.gain.setValueAtTime(gain, Math.max(t0 + fi, t1 - fo)); g.gain.linearRampToValueAtTime(0, t1);
      const p = oc.createStereoPanner(); p.pan.value = pan;
      s.connect(fl); fl.connect(g); g.connect(p); p.connect(dest);
      s.start(t0, rnd() * 2); s.stop(t1 + 0.1);
      return { g, fl };
    };
    // 古琴: partials dying at their own rates, a breath of pitch, sometimes a slide.
    A.qin = (t, f, v = 0.6, d = 4.5, slide = 0) => {
      const o0 = oc.createGain(); o0.gain.value = v * 0.16;
      const p = oc.createStereoPanner(); p.pan.value = (rnd() - 0.5) * 0.5;
      o0.connect(p); p.connect(bus);
      [[1, 1, d], [2, 0.52, d * 0.7], [3, 0.3, d * 0.5], [4, 0.16, d * 0.35], [5, 0.1, d * 0.25], [6.02, 0.05, d * 0.18]].forEach(([m, a, dd]) => {
        const o = oc.createOscillator(); o.type = 'sine';
        o.frequency.setValueAtTime(f * m * 1.006, t);
        o.frequency.exponentialRampToValueAtTime(f * m, t + 0.08);
        if (slide) { o.frequency.setValueAtTime(f * m, t + 0.9); o.frequency.exponentialRampToValueAtTime(f * m * slide, t + 1.6); }
        const g = oc.createGain();
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(a, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0004, t + dd);
        o.connect(g); g.connect(o0); o.start(t); o.stop(t + dd + 0.1);
      });
      const n = oc.createBufferSource(); n.buffer = nb;
      const bp = oc.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = Math.min(4000, f * 5); bp.Q.value = 1.4;
      const ng = oc.createGain(); ng.gain.setValueAtTime(v * 0.05, t); ng.gain.exponentialRampToValueAtTime(0.0003, t + 0.06);
      n.connect(bp); bp.connect(ng); ng.connect(bus); n.start(t, rnd()); n.stop(t + 0.1);
    };
    // 泛音: a harmonic, glassy and sustained.
    A.fan = (t, f, v = 0.5, d = 5) => {
      [[1, 1], [2, 0.25], [3, 0.08]].forEach(([m, a]) => {
        const o = oc.createOscillator(); o.type = 'sine'; o.frequency.value = f * m;
        const g = oc.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v * a * 0.13, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0003, t + d * (1 / m));
        o.connect(g); g.connect(bus); o.start(t); o.stop(t + d + 0.1);
      });
    };
    // 箫: a breathy bamboo flute — a sine with its breath, a slow vibrato that comes in late.
    A.xiao = (t, f, d = 2.4, v = 0.5, bend = 0) => {
      const o = oc.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(f * (bend ? 0.97 : 1), t);
      if (bend) o.frequency.linearRampToValueAtTime(f, t + 0.25);
      const vib = oc.createOscillator(); vib.frequency.value = 4.6;
      const vg = oc.createGain(); vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(f * 0.012, t + d * 0.6);
      vib.connect(vg); vg.connect(o.frequency);
      const o2 = oc.createOscillator(); o2.type = 'triangle'; o2.frequency.value = f * 2;
      const g2 = oc.createGain(); g2.gain.value = 0.08;
      const g = oc.createGain();
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v * 0.1, t + 0.18);
      g.gain.setValueAtTime(v * 0.1, t + d * 0.7); g.gain.linearRampToValueAtTime(0, t + d);
      o.connect(g); o2.connect(g2); g2.connect(g); g.connect(bus);
      [o, o2, vib].forEach((x) => { x.start(t); x.stop(t + d + 0.1); });
      const b = A.noise(t, t + d, 'bandpass', f * 2.2, 2.5, v * 0.018, 0.12, d * 0.4, bus);
      return b;
    };
    A.pad = (t0, t1, freqs, gain) => {
      freqs.forEach((f, i) => {
        [-4, 4].forEach((det) => {
          const o = oc.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = det + i;
          const lp = oc.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520; lp.Q.value = 0.4;
          const g = oc.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(gain / freqs.length, t0 + (t1 - t0) * 0.45); g.gain.linearRampToValueAtTime(0, t1);
          o.connect(lp); lp.connect(g); g.connect(conv); g.connect(master); o.start(t0); o.stop(t1 + 0.1);
        });
      });
    };
    A.drone = (t0, t1, f, gain) => {
      const o = oc.createOscillator(); o.type = 'sine'; o.frequency.value = f;
      const o2 = oc.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * 1.5;
      const g2 = oc.createGain(); g2.gain.value = 0.35;
      const g = oc.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(gain, t0 + 4); g.gain.setValueAtTime(gain, t1 - 4); g.gain.linearRampToValueAtTime(0, t1);
      o.connect(g); o2.connect(g2); g2.connect(g); g.connect(master); o.start(t0); o2.start(t0); o.stop(t1 + 0.1); o2.stop(t1 + 0.1);
    };
    /** A tiny glassy ping — a sound too small to hear, heard. */
    A.ping = (t, f, v = 0.05, pan = 0) => {
      const o = oc.createOscillator(); o.type = 'sine'; o.frequency.value = f;
      const g = oc.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0002, t + 0.9);
      const p = oc.createStereoPanner(); p.pan.value = pan;
      o.connect(g); g.connect(p); p.connect(conv); p.connect(master); o.start(t); o.stop(t + 1);
    };
    /** The ink drop on paper. */
    A.drop = (t) => {
      const o = oc.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(1550, t); o.frequency.exponentialRampToValueAtTime(620, t + 0.07);
      const g = oc.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.32, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0003, t + 0.32);
      o.connect(g); g.connect(bus); o.start(t); o.stop(t + 0.4);
      const lo = oc.createOscillator(); lo.type = 'sine'; lo.frequency.setValueAtTime(70, t + 0.05); lo.frequency.exponentialRampToValueAtTime(42, t + 3);
      const lg = oc.createGain(); lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(0.32, t + 0.4); lg.gain.exponentialRampToValueAtTime(0.0005, t + 4.2);
      lo.connect(lg); lg.connect(master); lo.start(t); lo.stop(t + 4.4);
    };
    /** The seal coming down. */
    A.thock = (t) => {
      const o = oc.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(70, t + 0.12);
      const g = oc.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.45, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0003, t + 0.35);
      o.connect(g); g.connect(master); o.connect(conv); o.start(t); o.stop(t + 0.4);
      A.noise(t, t + 0.09, 'lowpass', 900, 0.7, 0.25, 0.004, 0.08);
    };
    A.drop(0.35);
    // The brush: every stroke, a dry whisper of hair on paper.
    const strokes = [];
    [TITLE, AUTHOR, ...LINES].filter(Boolean).forEach((c) => c.plan.forEach((ss) => ss.forEach((p) => strokes.push([p.t0, p.t1 - p.t0]))));
    for (const [t, d] of strokes) {
      const dd = Math.max(0.08, Math.min(0.5, d));
      const b = A.noise(t, t + dd + 0.05, 'bandpass', 2600 + rnd() * 1400, 1.1, 0.024, Math.min(0.03, dd * 0.3), dd * 0.6, master, -0.25);
      b.fl.frequency.linearRampToValueAtTime(1800 + rnd() * 800, t + dd);
    }
    A.thock(FIN.sealAt + 0.05);
    sp.score(A);
    return oc.startRendering();
  }

  // ----------------------------------------------------------------- the film
  try {
    job.phase = 'score';
    const muxer = new Mp4Muxer.Muxer({
      target: new Mp4Muxer.ArrayBufferTarget(),
      video: { codec: 'avc', width: W, height: H, frameRate: FPS },
      audio: { codec: 'aac', numberOfChannels: 2, sampleRate: SR },
      fastStart: 'in-memory',
    });
    const venc = new VideoEncoder({ output: (c, m) => muxer.addVideoChunk(c, m), error: (e) => (job.encErr = String(e)) });
    venc.configure({ codec: 'avc1.640028', width: W, height: H, bitrate: 14000000, framerate: FPS, latencyMode: 'quality' });

    const buf = await score();
    job.phase = 'audio-encode';
    const aChunks = [];
    const aenc = new AudioEncoder({ output: (c, m) => aChunks.push([c, m]), error: (e) => (job.encErr = String(e)) });
    aenc.configure({ codec: 'mp4a.40.2', sampleRate: SR, numberOfChannels: 2, bitrate: 192000 });
    const L = buf.getChannelData(0), R = buf.getChannelData(1);
    for (let i = 0; i < L.length; i += 4800) {
      const m = Math.min(4800, L.length - i);
      const data = new Float32Array(m * 2);
      data.set(L.subarray(i, i + m), 0); data.set(R.subarray(i, i + m), m);
      aenc.encode(new AudioData({ format: 'f32-planar', sampleRate: SR, numberOfFrames: m, numberOfChannels: 2, timestamp: Math.round((i / SR) * 1e6), data }));
      if (aenc.encodeQueueSize > 8) await sleep(2);
    }
    await aenc.flush();

    job.phase = 'picture';
    // Warm the scene up under the first frame's camera.
    for (let i = 0; i < 60; i++) { compose(0, true); if (i % 10 === 0) await sleep(0); }
    let ai = 0;
    for (let i = 0; i < job.total; i++) {
      const t = i / FPS;
      compose(t, true);
      const ts = Math.round((i * 1e6) / FPS);
      const vf = new VideoFrame(out, { timestamp: ts, duration: Math.round(1e6 / FPS) });
      venc.encode(vf, { keyFrame: i % 60 === 0 });
      vf.close();
      while (ai < aChunks.length && aChunks[ai][0].timestamp <= ts + 300000) { muxer.addAudioChunk(aChunks[ai][0], aChunks[ai][1]); ai++; }
      job.frames = i + 1;
      if (venc.encodeQueueSize > 4) await sleep(6); else if (i % 3 === 0) await sleep(0);
      if (job.encErr) throw new Error(job.encErr);
    }
    job.phase = 'finish';
    await venc.flush();
    while (ai < aChunks.length) { muxer.addAudioChunk(aChunks[ai][0], aChunks[ai][1]); ai++; }
    muxer.finalize();
    const blob = new Blob([muxer.target.buffer], { type: 'video/mp4' });
    window.__reelBlob = blob;
    if (upload) job.msg = await (await fetch(upload + sp.name + '.mp4', { method: 'POST', body: blob })).text();
    compose(sp.cover, true);
    const cover = await new Promise((r) => out.toBlob(r, 'image/jpeg', 0.92));
    if (upload) await fetch(upload + sp.name + '-cover.jpg', { method: 'POST', body: cover });
  } catch (e) {
    job.err = String((e && e.stack) || e);
  }
  job.done = true;
};
