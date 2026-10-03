/**
 * 江雪 — a vertical film for Douyin, Reels and X (1080×1920, 30 fps, ~48 s).
 *
 * Paste into the console of a page on the site's own origin (a production
 * build), with mp4-muxer loaded as a classic script so `Mp4Muxer` is a global:
 *
 *   await __makeReel({ upload: '/api/film?name=' })          // the film
 *   await __makeReel({ upload: '/api/film?name=', preview: [3, 12.5, 26] })  // stills
 *
 * The picture is the scene itself in film mode (src/three/Film.tsx), driven by a
 * scripted camera and rendered frame by frame; everything laid over it — the
 * ink dissolves, the footprints, the falling snow, the bird, the calligraphy
 * written stroke by stroke from the same stroke data as the 题跋, the subtitles
 * and the seal — is drawn here on a 2D canvas. The score is synthesised offline.
 *
 * The cut:
 *   0–10   千山鸟飞绝  paper; a drop of ink blooms into the mountains as the eye
 *                       comes down out of a snowing sky; the last bird goes.
 *   10–18  万径人踪灭  low over the snowfield: one line of footprints, filling
 *                       with snow, the oldest first, until there is nothing.
 *   18–29  孤舟蓑笠翁  across the dark river to the boat; the old man, side-on.
 *   29–40  独钓寒江雪  his line in the water; then the long crane up and away,
 *                       the world going back into the paper until only the boat
 *                       is left.
 *   40–48  the poem whole, the seal, paper.
 *
 * `take: 'single'` (the default) films all of it as one unbroken shot — 一镜到底 —
 * the eye travelling from the peaks down to the footprints, along them to the
 * water, across it to the boat and up into the sky; `take: 'cut'` is the
 * version in shots, with ink dissolves between them.
 */
window.__makeReel = async ({ upload = null, preview = null, take = 'single' } = {}) => {
  const W = 1080, H = 1920, FPS = 30, SR = 48000;
  const TOTAL = 48.5;
  const PAPER = '#e9e7de', INK = '#1d1e23', SEAL = '#b5302a';
  const LATIN = '"Palatino Linotype","Iowan Old Style",Palatino,"Book Antiqua",Georgia,serif';
  const KAI = '"Kaiti SC","STKaiti","KaiTi","楷体",serif';
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const clamp01 = (t) => Math.max(0, Math.min(1, t));
  const ease = (t) => { t = clamp01(t); return t * t * (3 - 2 * t); };
  const ease5 = (t) => { t = clamp01(t); return t * t * t * (t * (t * 6 - 15) + 10); };
  const span = (t, a, b) => clamp01((t - a) / (b - a));
  const mix = (a, b, k) => a + (b - a) * k;
  const mix3 = (a, b, k) => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)];
  const job = (window.__job = { done: false, err: null, frames: 0, total: Math.round(TOTAL * FPS), phase: 'load', encErr: null });

  // ---------------------------------------------------------------- the scene
  document.querySelectorAll('iframe.__reel').forEach((x) => x.remove());
  const frame = document.createElement('iframe');
  frame.className = '__reel';
  // 720×1280 at the canvas's 1.5 pixel ratio is a 1080×1920 picture.
  frame.src = '/scene/jiang-xue?film&ink=full';
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
  const glyphs = await (await fetch('/strokes/jiang-xue.json')).json();

  F.walk = 0;
  F.fadeTo(0, 0.05);
  F.weather('snow');
  F.air({ snow: 0.9, mist: 0.5, wind: 0.22 });
  // Settle the weather and compile everything before the first frame counts.
  F.bloom(0);
  F.pose({ pos: [-22, 30, 78], look: [-12, 78, -150], fov: 46 });
  for (let i = 0; i < 90; i++) { F.step(); if (i % 10 === 0) await sleep(0); }

  // ---------------------------------------------------------------- the shots
  // Each shot is a camera as a function of the film's time, and an optional
  // overlay drawn onto that shot's own picture.
  const boat = [28, WATER, 14];
  const footY = (x, z) => G(x, z) + 0.03;
  const shots = [
    {
      id: 'qianshan', a: 0, b: 10.6,
      pose: (t) => {
        const k = ease5(span(t, 0.3, 9.4));
        return { pos: mix3([-22, 30, 78], [-24, 26.5, 73], k), look: mix3([-12, 78, -150], [-16, 21, -150], k), fov: 46 - 3 * k };
      },
    },
    {
      id: 'wanjing', a: 9.8, b: 18.8,
      pose: (t) => {
        // From above and behind, the track running away down to the river —
        // where he went. A slow drift along it.
        const k = ease(span(t, 9.8, 18.8));
        return { pos: [mix(-47, -43, k), mix(15.5, 13.5, k), mix(93, 87, k)], look: [mix(-27, -25, k), G(-26, 50), mix(46, 43, k)], fov: 40 };
      },
      overlay: (ctx, t, pose) => footprints(ctx, t, pose),
    },
    {
      id: 'guzhou', a: 18.0, b: 24.4,
      pose: (t) => {
        const k = ease(span(t, 18.0, 24.4));
        return { pos: mix3([47, 5.4, 64], [40.5, 3.2, 44], k), look: [28, WATER + 0.4, 13], fov: mix(32, 22, k) };
      },
    },
    {
      id: 'weng', a: 23.6, b: TOTAL,
      pose: (t) => {
        // The old man, side-on; a slow push in; then the crane, slow out and slow
        // in, up and back until he is one mark on the river.
        const a0 = { pos: [34.2, WATER + 0.95, 10.2], look: [28.6, WATER + 1.75, 12.6], fov: 31 };
        const a1 = { pos: [33.8, WATER + 0.98, 11.2], look: [28.6, WATER + 1.72, 12.6], fov: 27 };
        const top = { pos: [66, 86, 104], look: [21, WATER, -4], fov: 40 };
        const kp = ease(span(t, 23.6, 32.6));
        const near = { pos: mix3(a0.pos, a1.pos, kp), look: mix3(a0.look, a1.look, kp), fov: mix(a0.fov, a1.fov, kp) };
        const k = ease5(span(t, 32.6, 41.4));
        if (k <= 0) return near;
        const up = Math.sin((k * Math.PI) / 2);
        const pos = [mix(near.pos[0], top.pos[0], k), mix(near.pos[1], top.pos[1], up), mix(near.pos[2], top.pos[2], k)];
        const drift = Math.max(0, t - 41.4) * 0.22;
        pos[0] += drift;
        pos[1] += drift * 0.5;
        return { pos, look: mix3(near.look, top.look, ease(span(t, 32.6, 39.5))), fov: mix(near.fov, top.fov, k) };
      },
      grade: (t) => ease(span(t, 34.5, 41.0)),
    },
  ];
  const DISSOLVES = [
    [9.8, 10.6],
    [18.0, 18.8],
    [23.6, 24.4],
  ];

  // 一镜到底 — one unbroken take. A camera path through keyframes, each with
  // where the lens is, what it looks at and its field of view, joined by a
  // Hermite spline whose tangents respect the time between keys, so the eye
  // never stops dead and never lurches.
  if (take === 'single') {
    const K = [
      // the ink drop on the peaks; the ranges settling in
      [0.0, [-22, 30, 78], [-12, 78, -150], 46],
      [8.6, [-24, 26.5, 73], [-16, 21, -150], 43],
      // down and back: the footprints, under us
      [12.4, [-46, 15.5, 92], [-27, G(-26, 50), 47], 40],
      // along them, to the water's edge
      [17.6, [-36, 10.5, 74], [-20, G(-20, 38), 36], 40],
      // at the bank the eye lifts, and there is the boat
      [20.6, [-18, 6.5, 50], [28, WATER + 0.5, 13], 34],
      // low over the river, round by the bow, never through it
      [24.4, [16, 2.2, 27], [28.5, WATER + 1.0, 13], 32],
      [26.2, [33, WATER + 2.6, 22], [28.6, WATER + 1.5, 12.8], 31],
      // beside the old man
      [27.6, [34.2, WATER + 0.95, 10.2], [28.6, WATER + 1.75, 12.6], 31],
      [32.6, [33.8, WATER + 0.98, 11.2], [28.6, WATER + 1.72, 12.6], 27],
      // and the crane: up and away until the river is paper
      [36.4, [44, 22, 40], [27, WATER + 0.4, 10], 32],
      [41.4, [66, 86, 104], [21, WATER, -4], 40],
      [TOTAL, [68, 87.5, 105.5], [21, WATER, -4], 40],
    ];
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
    shots.length = 0;
    shots.push({
      id: 'one',
      a: 0,
      b: TOTAL + 1,
      pose: (t) => {
        const pos = curve(t, (k) => k[1]);
        // Never below the snow or the water.
        const floor = Math.max(G(pos[0], pos[2]), WATER) + 0.7;
        if (pos[1] < floor) pos[1] = floor;
        return { pos, look: curve(t, (k) => k[2]), fov: curve(t, (k) => [k[3]])[0] };
      },
      overlay: (ctx, t, pose) => {
        if (t < 18.5) footprints(ctx, t, pose);
      },
      grade: (t) => ease(span(t, 34.5, 41.0)),
    });
    DISSOLVES.length = 0;
  }

  // ----------------------------------------------------------- the projection
  // The same pinhole the scene's camera uses, so drawn things sit in the world.
  function project(X, pose) {
    const [px, py, pz] = pose.pos;
    let fx = pose.look[0] - px, fy = pose.look[1] - py, fz = pose.look[2] - pz;
    const fl = Math.hypot(fx, fy, fz); fx /= fl; fy /= fl; fz /= fl;
    const roll = pose.roll ?? 0;
    const ux0 = Math.sin(roll), uy0 = Math.cos(roll), uz0 = 0;
    let rx = fy * uz0 - fz * uy0, ry = fz * ux0 - fx * uz0, rz = fx * uy0 - fy * ux0;
    const rl = Math.hypot(rx, ry, rz); rx /= rl; ry /= rl; rz /= rl;
    const ux = ry * fz - rz * fy, uy = rz * fx - rx * fz, uz = rx * fy - ry * fx;
    const dx = X[0] - px, dy = X[1] - py, dz = X[2] - pz;
    const zc = dx * fx + dy * fy + dz * fz;
    const s = H / 2 / Math.tan(((pose.fov ?? 52) * Math.PI) / 360);
    return { x: W / 2 + ((dx * rx + dy * ry + dz * rz) / zc) * s, y: H / 2 - ((dx * ux + dy * uy + dz * uz) / zc) * s, z: zc };
  }

  // ---------------------------------------------------------------- footprints
  // One person's track, walking away from us towards the river. The oldest
  // prints — the nearest — fill with snow first, and the eye follows the
  // vanishing line out into the white until there is nothing in it.
  const prints = [];
  {
    const path = [[-44.5, 84], [-41, 77], [-37.5, 71], [-35, 64], [-31, 57], [-27.5, 50], [-22, 42], [-17, 34], [-13, 27]];
    let acc = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const [ax, az] = path[i], [bx, bz] = path[i + 1];
      const L = Math.hypot(bx - ax, bz - az);
      const dx = (bx - ax) / L, dz = (bz - az) / L;
      for (let d = 0; d < L; d += 0.72) {
        const side = prints.length % 2 ? 1 : -1;
        const wob = Math.sin((acc + d) * 0.23) * 0.5;
        const x = ax + dx * d - dz * (side * 0.17 + wob), z = az + dz * d + dx * (side * 0.17 + wob);
        prints.push({ x, z, dx, dz, n: prints.length });
      }
      acc += L;
    }
  }
  function footprints(ctx, t, pose) {
    const n = prints.length;
    for (let i = n - 1; i >= 0; i--) {
      const f = prints[i];
      // Filled from the near end: each print goes over 1.8 s, the whole line in about six.
      const t0 = 11.0 + (i / n) * 5.0;
      const a = 1 - ease(span(t, t0, t0 + 1.8));
      if (a <= 0.01) continue;
      const y = footY(f.x, f.z);
      const pts = [];
      for (let k = 0; k < 10; k++) {
        const ang = (k / 10) * Math.PI * 2;
        const ax = Math.cos(ang) * 0.13, al = Math.sin(ang) * 0.19 + (Math.sin(ang) > 0 ? 0.03 : 0);
        const wx = f.x + f.dx * al - f.dz * ax, wz = f.z + f.dz * al + f.dx * ax;
        const p = project([wx, y, wz], pose);
        if (p.z <= 0.3) return;
        pts.push(p);
      }
      ctx.save();
      ctx.beginPath();
      pts.forEach((p, k) => (k ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.closePath();
      ctx.fillStyle = `rgba(80,84,92,${0.5 * a})`;
      ctx.fill();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = `rgba(42,44,50,${0.42 * a})`;
      ctx.stroke();
      ctx.restore();
    }
  }

  // ---------------------------------------------------------- ink dissolve
  // Between shots the new picture comes up through the old like ink soaking
  // through wet paper: a noise field thresholded, soft at its front.
  const MW = 216, MH = 384;
  const noiseField = new Float32Array(MW * MH);
  {
    let seed = 806;
    const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    const grids = [6, 12, 24, 48].map((g) => ({ g, v: Array.from({ length: (g + 1) * (Math.ceil((g * MH) / MW) + 1) }, rnd) }));
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
      let v = 0, amp = 0.55, sum = 0;
      for (const { g, v: arr } of grids) {
        const gw = g + 1, fx = (x / MW) * g, fy = (y / MW) * g;
        const ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy;
        const at = (i, j) => arr[(j * gw + i) % arr.length];
        const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
        v += amp * mix(mix(at(ix, iy), at(ix + 1, iy), sx), mix(at(ix, iy + 1), at(ix + 1, iy + 1), sx), sy);
        sum += amp; amp *= 0.5;
      }
      // Bias from the centre outwards, so the bloom opens like a drop.
      const r = Math.hypot(x / MW - 0.5, (y / MH - 0.5) * 1.6);
      noiseField[y * MW + x] = (v / sum) * 0.7 + r * 0.45;
    }
  }
  const maskC = document.createElement('canvas'); maskC.width = MW; maskC.height = MH;
  const maskX = maskC.getContext('2d');
  const maskImg = maskX.createImageData(MW, MH);
  function mask(p) {
    // p 0: none of the new shot; 1: all of it.
    const th = mix(-0.05, 1.12, p);
    const d = maskImg.data;
    for (let i = 0; i < MW * MH; i++) {
      const a = 1 - ease((noiseField[i] - th + 0.06) / 0.12);
      d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = 0;
      d[i * 4 + 3] = a * 255;
    }
    maskX.putImageData(maskImg, 0, 0);
    return maskC;
  }

  // ---------------------------------------------------------------- canvases
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  const out = mk(), ctx = out.getContext('2d');
  const layA = mk(), layAx = layA.getContext('2d');
  const layB = mk(), layBx = layB.getContext('2d');
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

  /** Render a shot at time t into a layer: pose, frame, grade, overlay. */
  function renderShot(shot, t, layer, lx, fresh) {
    const pose = shot.pose(t);
    F.pose(pose);
    if (fresh) F.step(); else F.again();
    lx.save();
    lx.filter = 'contrast(1.13) brightness(1.035) saturate(0.85)';
    lx.drawImage(gl, 0, 0, W, H);
    // 留白 — Ma Yuan's river: the water goes back to paper, the boat and a few
    // ripples stay in ink. A high-key grade of the same picture, brought up over it.
    const hk = shot.grade ? shot.grade(t) : 0;
    if (hk > 0) {
      lx.globalAlpha = hk;
      lx.filter = 'grayscale(1) brightness(1.9) contrast(2.2)';
      lx.drawImage(gl, 0, 0, W, H);
      lx.filter = 'none';
      lx.globalAlpha = hk * 0.55;
      lx.globalCompositeOperation = 'multiply';
      lx.fillStyle = PAPER;
      lx.fillRect(0, 0, W, H);
      lx.globalCompositeOperation = 'source-over';
      const g = lx.createRadialGradient(W / 2, H * 0.55, H * 0.3, W / 2, H / 2, H * 0.75);
      g.addColorStop(0, 'rgba(233,231,222,0)');
      g.addColorStop(1, `rgba(233,231,222,${0.85 * hk})`);
      lx.globalAlpha = 1;
      lx.fillStyle = g;
      lx.fillRect(0, 0, W, H);
    }
    lx.restore();
    if (shot.overlay) shot.overlay(lx, t, pose);
  }

  // ------------------------------------------------------------- snow (near)
  // The scene snows on its own; this is the snow right in front of the lens —
  // big, soft, a little out of focus — which is what makes it feel like being there.
  const flakes = [];
  {
    let seed = 1225;
    const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    for (let i = 0; i < 150; i++) {
      const z = Math.pow(rnd(), 1.6); // 0 far … 1 near
      flakes.push({ x: rnd() * W, y: rnd() * H, z, ph: rnd() * 6.28, w: 0.4 + rnd() * 0.8 });
    }
  }
  const sprites = [0, 1, 2, 3].map((k) => {
    const s = 64, c = document.createElement('canvas'); c.width = c.height = s;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    const core = [0.5, 0.35, 0.22, 0.12][k];
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(core, 'rgba(255,255,255,0.9)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, s, s);
    return c;
  });
  function snow(t, a) {
    if (a <= 0) return;
    ctx.save();
    for (const f of flakes) {
      const size = mix(5, 46, f.z * f.z);
      const fall = mix(60, 260, f.z);
      const y = ((f.y + t * fall) % (H + 120)) - 60;
      const x = ((f.x + Math.sin(t * f.w + f.ph) * mix(10, 55, f.z) + t * mix(6, 30, f.z)) % (W + 80) + W + 80) % (W + 80) - 40;
      ctx.globalAlpha = a * mix(0.55, 0.42, f.z);
      ctx.drawImage(sprites[Math.min(3, Math.floor(f.z * 4))], x - size / 2, y - size / 2, size, size);
    }
    ctx.restore();
  }

  // -------------------------------------------------------------------- bird
  // 鸟飞绝: the last one, gliding off over the ranges and gone.
  function bird(t) {
    const k = span(t, 6.2, 10.4);
    if (k <= 0 || k >= 1) return;
    const x = mix(-30, 760, ease(k) * 0.4 + k * 0.6), y = mix(1010, 640, k) + Math.sin(k * 9) * 12;
    const s = mix(1.15, 0.22, ease(k));
    const flap = Math.sin(t * 9.5) * (k < 0.55 ? 1 : 0.35);
    ctx.save();
    ctx.globalAlpha = Math.min(1, k * 6) * (1 - ease(span(k, 0.65, 1)));
    ctx.translate(x, y); ctx.scale(s, s);
    ctx.strokeStyle = INK; ctx.lineCap = 'round';
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(side * 22, -18 - flap * 14, side * 46, -6 - flap * 22);
      ctx.lineWidth = 4.5; ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(0, 2, 3.4, 0, 6.28); ctx.fillStyle = INK; ctx.fill();
    ctx.restore();
  }

  // ------------------------------------------------------------ calligraphy
  // Written stroke by stroke: a wide brush drawn along each stroke's median,
  // clipped to its outline (the same data and method as the 题跋 in the app).
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
      return { outline: new Path2D(d), median: path, len: L + 80 };
    }));
  }
  /** A column, written from `start` over `dur` seconds; returns the stroke start times (for the brush sounds). */
  function planColumn(text, start, dur) {
    const chars = [...text];
    const all = chars.map((ch) => glyphStrokes(ch));
    let total = 0;
    all.forEach((ss) => ss.forEach((s) => (total += s.len)));
    const gaps = all.reduce((n, ss) => n + ss.length, 0) * 0.05 + chars.length * 0.12;
    const speed = total / Math.max(0.5, dur - gaps);
    let t = start;
    const plan = all.map((ss) => {
      const r = ss.map((s) => { const p = { s, t0: t, t1: t + s.len / speed }; t = p.t1 + 0.05; return p; });
      t += 0.12;
      return r;
    });
    return plan;
  }
  function drawColumn(plan, x, y, size, t, alpha = 1, color = INK) {
    if (alpha <= 0) return;
    const k = size / 1024;
    tmpx.clearRect(0, 0, W, H);
    plan.forEach((strokes, ci) => {
      strokes.forEach(({ s, t0, t1 }) => {
        const p = clamp01((t - t0) / (t1 - t0));
        if (p <= 0) return;
        tmpx.save();
        tmpx.setTransform(k, 0, 0, -k, x, y + ci * size * 1.08 + 900 * k);
        tmpx.clip(s.outline);
        tmpx.strokeStyle = color;
        tmpx.lineWidth = 190;
        tmpx.lineCap = 'round';
        tmpx.lineJoin = 'round';
        tmpx.setLineDash([s.len, s.len]);
        tmpx.lineDashOffset = s.len * (1 - p);
        tmpx.stroke(s.median);
        tmpx.restore();
      });
    });
    ctx.save();
    ctx.globalAlpha = alpha * 0.93;
    ctx.filter = 'blur(0.5px)';
    ctx.shadowColor = color === INK ? 'rgba(238,236,228,0.95)' : 'rgba(8,10,14,0.8)';
    ctx.shadowBlur = Math.max(10, size * 0.16);
    ctx.drawImage(tmp, 0, 0);
    ctx.shadowBlur = 0;
    ctx.drawImage(tmp, 0, 0);
    ctx.restore();
  }
  /** A soft breath of paper behind writing, so ink reads over anything. */
  function halo(x, y, w, h, a) {
    if (a <= 0) return;
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.scale(1, h / w);
    const R = w * 1.25;
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
    g.addColorStop(0, `rgba(236,234,226,${0.5 * a})`);
    g.addColorStop(0.55, `rgba(236,234,226,${0.28 * a})`);
    g.addColorStop(1, 'rgba(236,234,226,0)');
    ctx.fillStyle = g;
    ctx.fillRect(-R, -R, 2 * R, 2 * R);
    ctx.restore();
  }
  /** How light the picture is under a rectangle, 0–255. */
  const probe = document.createElement('canvas');
  probe.width = 16;
  probe.height = 16;
  const probeX = probe.getContext('2d', { willReadFrequently: true });
  function lum(x, y, w, h) {
    probeX.drawImage(out, x, y, w, h, 0, 0, 16, 16);
    const d = probeX.getImageData(0, 0, 16, 16).data;
    let s = 0;
    for (let i = 0; i < d.length; i += 4) s += d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11;
    return s / 256;
  }
  function english(str, a, y = 1452) {
    if (a <= 0) return;
    const dark = lum(140, y - 50, W - 280, 70) < 128;
    ctx.save();
    ctx.globalAlpha = a;
    // A feathered wash behind the words: ink under light words, paper under dark.
    ctx.save();
    ctx.translate(W / 2, y - 12);
    ctx.scale(1, 0.15);
    const wash = ctx.createRadialGradient(0, 0, 0, 0, 0, 470);
    const c = dark ? '12,14,18' : '238,236,228';
    wash.addColorStop(0, `rgba(${c},${dark ? 0.42 : 0.6})`);
    wash.addColorStop(0.6, `rgba(${c},${dark ? 0.24 : 0.36})`);
    wash.addColorStop(1, `rgba(${c},0)`);
    ctx.fillStyle = wash;
    ctx.fillRect(-470, -470, 940, 940);
    ctx.restore();
    ctx.font = `italic 40px ${LATIN}`;
    ctx.textAlign = 'center';
    ctx.letterSpacing = '0.5px';
    ctx.shadowColor = dark ? 'rgba(10,12,16,0.75)' : 'rgba(240,238,230,0.95)';
    ctx.shadowBlur = 18;
    ctx.fillStyle = dark ? '#f1efe7' : '#26272c';
    ctx.fillText(str, W / 2, y);
    ctx.shadowBlur = 0;
    ctx.fillText(str, W / 2, y);
    ctx.restore();
  }
  function seal(x, y, size, t, t0) {
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
    // 柳宗元印 — right column 柳宗, left column 元印; white characters cut into the red.
    ctx.globalCompositeOperation = 'destination-out';
    [...'柳宗元印'].forEach((ch, i) => {
      const q = size * 0.4, pad = size * 0.07;
      const cx = i < 2 ? size - pad - q : pad, cy = pad + (i % 2) * (q + size * 0.06);
      const kk = q / 1024;
      ctx.save();
      ctx.translate(cx, cy + 900 * kk); ctx.scale(kk, -kk);
      for (const s of glyphStrokes(ch)) ctx.fill(s.outline);
      ctx.restore();
    });
    // Worn: flecks where the paste did not take.
    let seed = 773;
    const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    for (let i = 0; i < 70; i++) { ctx.beginPath(); ctx.arc(rnd() * size, rnd() * size, rnd() * size * 0.018, 0, 6.28); ctx.fill(); }
    ctx.restore();
  }

  // The lines: when each is written, where, and how long it stays.
  const COL = { x: 118, y: 300, size: 118 };
  const LINES = [
    { zh: '千山鸟飞绝', en: 'A thousand mountains — not a bird in flight.', w: [5.6, 3.6], show: [5.6, 10.2] },
    { zh: '万径人踪灭', en: 'Ten thousand paths — not a footprint left.', w: [11.0, 3.6], show: [11.0, 18.3] },
    { zh: '孤舟蓑笠翁', en: 'One boat. An old man in straw cape and hat,', w: [19.4, 3.6], show: [19.4, 29.3] },
    { zh: '独钓寒江雪', en: 'fishing alone in the cold river snow.', w: [29.9, 3.6], show: [29.9, 36.6] },
  ];
  LINES.forEach((l) => (l.plan = planColumn(l.zh, l.w[0], l.w[1])));
  const TITLE = { plan: planColumn('江雪', 2.9, 1.6), x: 846, y: 250, size: 104 };
  const AUTHOR = { plan: planColumn('柳宗元', 4.4, 1.3), x: 876, y: 500, size: 46 };
  // The whole poem at the end: four columns, right to left, in the emptiness.
  const FINAL = { x0: 742, dx: 132, y: 280, size: 98, at: 40.6 };
  LINES.forEach((l, i) => (l.final = planColumn(l.zh, FINAL.at + i * 0.9, 0.01)));

  // ------------------------------------------------------------------- audio
  job.phase = 'score';
  const strokeTimes = [];
  [TITLE, AUTHOR, ...LINES].forEach((c) => c.plan.forEach((ss) => ss.forEach((p) => strokeTimes.push([p.t0, p.t1 - p.t0]))));

  async function score() {
    const len = Math.ceil(TOTAL * SR);
    const oc = new OfflineAudioContext(2, len, SR);
    let seed = 806806;
    const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    const master = oc.createGain();
    const comp = oc.createDynamicsCompressor(); comp.threshold.value = -26; comp.ratio.value = 3; comp.knee.value = 12; comp.attack.value = 0.01; comp.release.value = 0.4;
    const makeup = oc.createGain(); makeup.gain.value = 1.1;
    const limit = oc.createDynamicsCompressor(); limit.threshold.value = -3; limit.knee.value = 0; limit.ratio.value = 20; limit.attack.value = 0.002; limit.release.value = 0.12;
    master.connect(comp); comp.connect(makeup); makeup.connect(limit); limit.connect(oc.destination);
    master.gain.value = 1.5;

    // A long cold hall of a reverb, and a slow echo for the plucked notes.
    const irLen = Math.floor(SR * 4.2), ir = oc.createBuffer(2, irLen, SR);
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
    const noise = (t0, t1, type, f, q, gain, fi, fo, dest = master, pan = 0) => {
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

    // 古琴 — a plucked string with the wood in it: partials that die at their own
    // rates, a breath of pitch at the attack, and sometimes a slide (吟猱).
    const qin = (t, f, v = 0.6, d = 4.5, slide = 0) => {
      const out = oc.createGain(); out.gain.value = v * 0.16;
      const p = oc.createStereoPanner(); p.pan.value = (rnd() - 0.5) * 0.5;
      out.connect(p); p.connect(bus);
      [[1, 1, d], [2, 0.52, d * 0.7], [3, 0.3, d * 0.5], [4, 0.16, d * 0.35], [5, 0.1, d * 0.25], [6.02, 0.05, d * 0.18]].forEach(([m, a, dd]) => {
        const o = oc.createOscillator(); o.type = 'sine';
        o.frequency.setValueAtTime(f * m * 1.006, t);
        o.frequency.exponentialRampToValueAtTime(f * m, t + 0.08);
        if (slide) { o.frequency.setValueAtTime(f * m, t + 0.9); o.frequency.exponentialRampToValueAtTime(f * m * slide, t + 1.6); }
        const g = oc.createGain();
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(a, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0004, t + dd);
        o.connect(g); g.connect(out); o.start(t); o.stop(t + dd + 0.1);
      });
      const n = oc.createBufferSource(); n.buffer = nb;
      const bp = oc.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = Math.min(4000, f * 5); bp.Q.value = 1.4;
      const ng = oc.createGain(); ng.gain.setValueAtTime(v * 0.05, t); ng.gain.exponentialRampToValueAtTime(0.0003, t + 0.06);
      n.connect(bp); bp.connect(ng); ng.connect(bus); n.start(t, rnd()); n.stop(t + 0.1);
    };
    // 泛音 — a harmonic, glassy and sustained.
    const fan = (t, f, v = 0.5, d = 5) => {
      [[1, 1], [2, 0.25], [3, 0.08]].forEach(([m, a]) => {
        const o = oc.createOscillator(); o.type = 'sine'; o.frequency.value = f * m;
        const g = oc.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v * a * 0.13, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0003, t + d * (1 / m));
        o.connect(g); g.connect(bus); o.start(t); o.stop(t + d + 0.1);
      });
    };
    const pad = (t0, t1, freqs, gain) => {
      freqs.forEach((f, i) => {
        [-4, 4].forEach((det) => {
          const o = oc.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = det + i;
          const lp = oc.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520; lp.Q.value = 0.4;
          const g = oc.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(gain / freqs.length, t0 + (t1 - t0) * 0.45); g.gain.linearRampToValueAtTime(0, t1);
          o.connect(lp); lp.connect(g); g.connect(conv); g.connect(master); o.start(t0); o.stop(t1 + 0.1);
        });
      });
    };
    const drone = (t0, t1, f, gain) => {
      const o = oc.createOscillator(); o.type = 'sine'; o.frequency.value = f;
      const o2 = oc.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * 1.5;
      const g2 = oc.createGain(); g2.gain.value = 0.35;
      const g = oc.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(gain, t0 + 3); g.gain.setValueAtTime(gain, t1 - 3); g.gain.linearRampToValueAtTime(0, t1);
      o.connect(g); o2.connect(g2); g2.connect(g); g.connect(master); o.start(t0); o2.start(t0); o.stop(t1 + 0.1); o2.stop(t1 + 0.1);
    };

    // Notes: 羽 mode on D — D F G A C, the cold one.
    const N = { D2: 73.42, A2: 110, D3: 146.83, F3: 174.61, G3: 196, A3: 220, C4: 261.63, D4: 293.66, F4: 349.23, G4: 392, A4: 440, C5: 523.25, D5: 587.33, A5: 880 };

    // The world: wind all through, rising in the empty places; the hiss of snow.
    const wind = noise(0.05, TOTAL + 1, 'bandpass', 380, 0.5, 0.05, 1.5, 3.5);
    wind.g.gain.setValueAtTime(0.05, 10); wind.g.gain.linearRampToValueAtTime(0.085, 14); wind.g.gain.linearRampToValueAtTime(0.05, 19);
    wind.g.gain.setValueAtTime(0.05, 34); wind.g.gain.linearRampToValueAtTime(0.09, 40); wind.g.gain.linearRampToValueAtTime(0.03, 46);
    for (let t = 0; t < TOTAL; t += 2.5) wind.fl.frequency.linearRampToValueAtTime(300 + rnd() * 260, t + 2.5);
    noise(1.6, TOTAL - 1.5, 'highpass', 5200, 0.6, 0.012, 3, 3, master, -0.3);
    noise(1.6, TOTAL - 1.5, 'highpass', 6200, 0.6, 0.009, 3, 3, master, 0.3);
    // Water against the hull, near the boat.
    const lap = noise(18.6, 41, 'lowpass', 260, 0.9, 0.06, 3, 4);
    for (let t = 19; t < 41; t += 0.9 + rnd() * 0.8) { lap.g.gain.setTargetAtTime(0.03 + rnd() * 0.07, t, 0.25); }

    // The drop of ink, and the paper drinking it.
    {
      const t = 0.35;
      const o = oc.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(1550, t); o.frequency.exponentialRampToValueAtTime(620, t + 0.07);
      const g = oc.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.32, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0003, t + 0.32);
      o.connect(g); g.connect(bus); o.start(t); o.stop(t + 0.4);
      const lo = oc.createOscillator(); lo.type = 'sine'; lo.frequency.setValueAtTime(70, t + 0.05); lo.frequency.exponentialRampToValueAtTime(42, t + 3);
      const lg = oc.createGain(); lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(0.32, t + 0.4); lg.gain.exponentialRampToValueAtTime(0.0005, t + 4.2);
      lo.connect(lg); lg.connect(master); lo.start(t); lo.stop(t + 4.4);
    }
    // Title.
    fan(2.9, N.D5, 0.8, 6); fan(3.7, N.A4, 0.55, 6);
    // 千山鸟飞绝 — and the last bird's cry, far off, swallowed by the hall.
    qin(5.6, N.D3, 0.8, 6); qin(7.2, N.A3, 0.55, 5, 0.94);
    {
      const t = 6.9;
      for (const [dt, f0] of [[0, 2900], [0.26, 3300]]) {
        const o = oc.createOscillator(); o.type = 'sine';
        o.frequency.setValueAtTime(f0, t + dt); o.frequency.exponentialRampToValueAtTime(f0 * 0.72, t + dt + 0.18);
        const g = oc.createGain(); g.gain.setValueAtTime(0, t + dt); g.gain.linearRampToValueAtTime(0.03, t + dt + 0.02); g.gain.exponentialRampToValueAtTime(0.0002, t + dt + 0.2);
        const p = oc.createStereoPanner(); p.pan.value = 0.45;
        o.connect(g); g.connect(p); p.connect(conv); o.start(t + dt); o.stop(t + dt + 0.25);
      }
    }
    // 万径人踪灭 — almost nothing: two notes, and the wind.
    qin(11.0, N.F3, 0.6, 6); qin(14.2, N.D3, 0.5, 7, 0.97);
    // 孤舟蓑笠翁 — the ground note comes in under the boat.
    drone(18.2, 44, N.D2, 0.075);
    qin(19.4, N.A3, 0.7, 5.5); qin(20.6, N.G3, 0.55, 5); qin(22.0, N.D4, 0.6, 6, 0.95); qin(24.5, N.C4, 0.5, 5); qin(26.2, N.A3, 0.55, 7);
    // 独钓寒江雪 — a falling line, then the crane: the harmonics open out.
    qin(29.9, N.D4, 0.75, 6); qin(30.8, N.C4, 0.6, 5); qin(31.6, N.A3, 0.6, 5); qin(32.6, N.G3, 0.55, 6); qin(33.8, N.D3, 0.8, 9);
    pad(33.0, 44.5, [N.D3, N.A3, N.D4, N.F4], 0.05);
    fan(35.5, N.A4, 0.5, 6); fan(37.0, N.D5, 0.55, 7); fan(38.6, N.A5, 0.35, 7);
    // The poem whole, and the seal.
    fan(40.6, N.D5, 0.6, 7);
    {
      const t = 43.1;
      const o = oc.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(70, t + 0.12);
      const g = oc.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.45, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0003, t + 0.35);
      o.connect(g); g.connect(master); o.connect(conv); o.start(t); o.stop(t + 0.4);
      noise(t, t + 0.09, 'lowpass', 900, 0.7, 0.25, 0.004, 0.08);
    }
    qin(44.0, N.D3, 0.6, 7); fan(45.2, N.D5, 0.45, 6);
    // The brush: every stroke, a dry whisper of hair on paper.
    for (const [t, d] of strokeTimes) {
      const dd = Math.max(0.08, Math.min(0.5, d));
      const b = noise(t, t + dd + 0.05, 'bandpass', 2600 + rnd() * 1400, 1.1, 0.026, Math.min(0.03, dd * 0.3), dd * 0.6, master, -0.25);
      b.fl.frequency.linearRampToValueAtTime(1800 + rnd() * 800, t + dd);
    }
    // Paper at the end: master out.
    master.gain.setValueAtTime(1.5, TOTAL - 2.6);
    master.gain.linearRampToValueAtTime(0, TOTAL - 0.05);
    return oc.startRendering();
  }

  // ----------------------------------------------------------------- a frame
  function compose(t, fresh) {
    // Which shots are on screen.
    const live = shots.filter((s) => t >= s.a && t < s.b);
    const dis = DISSOLVES.find(([a, b]) => t >= a && t < b);
    F.bloom(t < 0.35 ? 0 : ease(span(t, 0.35, 3.3)));

    paperFill(ctx);
    if (dis && live.length > 1) {
      const [oldS, newS] = live;
      renderShot(oldS, t, layA, layAx, fresh);
      renderShot(newS, t, layB, layBx, false);
      ctx.drawImage(layA, 0, 0);
      const m = mask(ease(span(t, dis[0], dis[1])));
      tmpx.clearRect(0, 0, W, H);
      tmpx.drawImage(layB, 0, 0);
      tmpx.globalCompositeOperation = 'destination-in';
      tmpx.imageSmoothingQuality = 'high';
      tmpx.drawImage(m, 0, 0, W, H);
      tmpx.globalCompositeOperation = 'source-over';
      ctx.drawImage(tmp, 0, 0);
    } else if (live.length) {
      renderShot(live[live.length - 1], t, layA, layAx, fresh);
      ctx.drawImage(layA, 0, 0);
    }

    // Before the drop there is only paper; the scene's own bloom does the rest.
    paperFill(ctx, 1 - ease(span(t, 0.15, 0.4)));

    // Near snow, everywhere the world is.
    const world = ease(span(t, 1.2, 3.4)) * (1 - ease(span(t, 44.6, 46.4)));
    snow(t, world * 0.9);
    bird(t);

    // Title and author, then the lines.
    const tA = ease(span(t, 2.6, 3.4)) * (1 - ease(span(t, 8.8, 10.0)));
    drawColumn(TITLE.plan, TITLE.x, TITLE.y, TITLE.size, t, tA);
    drawColumn(AUTHOR.plan, AUTHOR.x, AUTHOR.y, AUTHOR.size, t, tA * 0.85);
    LINES.forEach((l) => {
      const a = ease(span(t, l.show[0] - 0.3, l.show[0] + 0.2)) * (1 - ease(span(t, l.show[1] - 0.8, l.show[1])));
      if (a <= 0) return;
      const dk = lum(COL.x, COL.y, COL.size, COL.size * 5.4) < 120;
      drawColumn(l.plan, COL.x, COL.y, COL.size, t, a, dk ? '#f1efe7' : INK);
      english(l.en, a * ease(span(t, l.w[0] + 1.2, l.w[0] + 2.2)));
    });

    // The poem whole, written into the emptiness above the boat, and sealed.
    const fA = ease(span(t, FINAL.at - 0.4, FINAL.at + 0.4)) * (1 - ease(span(t, 45.2, 46.6)));
    if (fA > 0) {
      LINES.forEach((l, i) => {
        const ap = ease(span(t, FINAL.at + i * 0.55, FINAL.at + i * 0.55 + 1.1));
        // The ink comes up through the paper rather than being written again.
        ctx.save();
        ctx.globalAlpha = 1;
        drawColumn(l.final, FINAL.x0 - i * FINAL.dx, FINAL.y, FINAL.size, t + 100, fA * ap);
        ctx.restore();
      });
      seal(FINAL.x0 - 3 * FINAL.dx + 8, FINAL.y + FINAL.size * 5.6, 88, t, 43.0);
      english('River Snow  ·  Liu Zongyuan, 773–819', fA * ease(span(t, 42.2, 43.4)), 1452);
    }

    // To paper, and the house mark.
    paperFill(ctx, ease(span(t, 45.0, 46.6)));
    const eA = ease(span(t, 46.0, 46.9)) * (1 - ease(span(t, 47.8, 48.5)));
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
      // Walk the scene's clock to the moment, so the weather is where it would be.
      for (let i = 0; i < 4; i++) { compose(t, true); await sleep(5); }
      const b = await new Promise((r) => out.toBlob(r, 'image/jpeg', 0.88));
      const name = `reel-${String(t).replace('.', '_')}.jpg`;
      if (upload) await fetch(upload + name, { method: 'POST', body: b });
      names.push(name);
    }
    job.done = true;
    return names;
  }

  // ----------------------------------------------------------------- the film
  try {
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
    window.__reel = blob;
    const base = take === 'single' ? 'reel-jiangxue-oneshot' : 'reel-jiangxue';
    if (upload) job.msg = await (await fetch(upload + base + '.mp4', { method: 'POST', body: blob })).text();
    // A cover for the platforms: the poem whole, the seal, and the boat alone.
    compose(44.2, true);
    const cover = await new Promise((r) => out.toBlob(r, 'image/jpeg', 0.92));
    if (upload) await fetch(upload + base + '-cover.jpg', { method: 'POST', body: cover });
  } catch (e) {
    job.err = String((e && e.stack) || e);
  }
  job.done = true;
};
