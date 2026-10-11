/**
 * 登高 — Du Fu, 767, the Double Ninth, at Kuizhou on the Yangtze. Fifty-five,
 * sick, far from home, and climbing alone to a terrace over the river in a gale.
 *
 * One unbroken take, and it is the climb: up from the river's edge, past a red
 * tree being stripped, up the face of the shoulder and over the lip of the
 * terrace, the eye on the crag and the river. The first four lines are what is
 * seen from there — and at 独登台 the camera draws back and finds whose view it
 * was: one old man at the edge, on his stick. The last four lines are him.
 *
 * Every line is written, and then the wind takes it: the ink breaks into leaves
 * and they go down the wind with the rest. 无边落木 — the poem too.
 *
 *    0–16  the climb, without words: the river, the stripped tree, the cliff face
 *   17–29  风急天高猿啸哀 · 渚清沙白鸟飞回  the apes on the crag, the birds over the bar
 *   29–41  无边落木萧萧下 · 不尽长江滚滚来  the leaves below, the river coming on
 *   41–54  万里悲秋常作客 · 百年多病独登台  the far gorge; and the man, alone
 *   54–67  艰难苦恨繁霜鬓 · 潦倒新停浊酒杯  his white hair; the jar set down
 *   67–79  the poem whole, 杜甫之印, paper.
 */
window.__screenplays = window.__screenplays || {};

window.__screenplays.denggao = {
  name: 'reel-denggao',
  scene: 'denggao',
  total: 79,
  seed: 767,
  aim: 40,
  paper: '#e6dcc4',
  cover: 48.5,
  author: '杜甫',
  title: { text: '登高', at: 1.2, dur: 1.4, out: 7.5, x: 846, y: 250, size: 104 },
  column: { x: 118, y: 300, size: 110 },
  // Couplets: each pair is written right to left and then blown away together.
  lines: [
    { zh: '风急天高猿啸哀', en: 'Wind sharp, sky high, the gibbons cry their grief;', w: [19.0, 3.4], show: [19.0, 28.6] },
    { zh: '渚清沙白鸟飞回', en: 'the shoals clear, the sand white, birds wheel back.', w: [23.6, 3.4], show: [19.0, 28.6] },
    { zh: '无边落木萧萧下', en: 'Without end the leaves come rustling down;', w: [29.6, 3.4], show: [29.6, 41.0] },
    { zh: '不尽长江滚滚来', en: 'without end the Long River comes rolling on.', w: [34.4, 3.4], show: [29.6, 41.0] },
    { zh: '万里悲秋常作客', en: 'Ten thousand li from home, a guest in every autumn;', w: [41.8, 3.4], show: [41.8, 54.0] },
    { zh: '百年多病独登台', en: 'a lifetime of sickness, I climb the height alone.', w: [47.0, 3.6], show: [41.8, 54.0] },
    { zh: '艰难苦恨繁霜鬓', en: 'Hard times and bitter grief have frosted my temples;', w: [54.8, 3.4], show: [54.8, 66.4] },
    { zh: '潦倒新停浊酒杯', en: 'worn out, I have just put down the cup of cloudy wine.', w: [59.6, 3.6], show: [54.8, 66.4] },
  ],
  // Where each couplet hangs: its first line's column, the second to its left.
  couplets: [
    { ids: [0, 1], x: 812 },
    { ids: [2, 3], x: 262 },
    { ids: [4, 5], x: 812 },
    { ids: [6, 7], x: 262 },
  ],
  final: { at: 67.2, sealAt: 72.2, out: 76.0, x0: 800, dx: 96, y: 230, size: 78, ink: '#efeee6', credit: 'Climbing High  ·  Du Fu, 712–770' },
  end: { paper: 75.6, card: 76.4 },

  setup(F) {
    F.air({ wind: 1.7, mist: 0.42 });
    // The film draws its own birds over the bar (below), so they are always
    // the size they should be for where they are.
    F.birds(false);
  },
  grade: () => 'brightness(1.22) contrast(1.3) saturate(1.15)',

  camera: ({ G, WATER }) => {
    const T = 29; // the terrace floor
    const W = WATER;
    const eye = T + 1.75;
    // Him: his head, the way he faces (up the river), and places behind him
    // and past him along that line.
    const H = [-72.8, T + 1.55, -27], f = [Math.cos(0.33), -Math.sin(0.33)];
    const behind = (d, up) => [H[0] - f[0] * d, H[1] + up, H[2] - f[1] * d];
    const past = (lift) => [H[0] + f[0] * 30, H[1] + lift, H[2] + f[1] * 30];
    return [
      // on the shore below the shoulder, the river coming down the gorge
      [0.0, [-28, G(-28, -2) + 1.4, -2], [10, -2, -110], 58],
      [4.0, [-30, G(-30, -8) + 1.6, -8], [-10, 10, -110], 58],
      // and turn to the climb, the red trees being stripped to the left
      [8.4, [-40, G(-40, -22) + 2.0, -22], [-50, 14, -60], 56],
      // up the face of the shoulder
      [13.6, [-60, G(-60, -35) + 2.4, -35], [-78, 33, -40], 54],
      // over the lip, the eye already lifting to the crag: the terrace is
      // empty, it seems — the view is all there is
      [18.0, [-71.5, G(-71.5, -36) + 1.9, -36], [-72, 40, -80], 52],
      [20.0, [-72.8, eye, -35.6], [-70.5, 52, -99], 50],
      // 风急天高猿啸哀: up at the crag, the gibbons on it, the sky over it
      [22.8, [-73.6, eye, -35], [-69, 66, -99], 50],
      // 渚清沙白鸟飞回: down to the bar and the birds over the water
      [26.2, [-73, eye, -35], [-40, 4, -62], 44],
      // 无边落木萧萧下: off the edge and slowly down the slope among the red
      // trees, the leaves going past
      [30.0, [-70.4, T + 1.6, -34], [-50, 4, -14], 52],
      [34.4, [-63.5, G(-63.5, -33) + 3.0, -33], [-45, 3, -15], 54],
      // 不尽长江滚滚来: and the eye lifts from the trees to the river, coming down
      // the gorge at us
      [38.8, [-58.5, G(-58.5, -31) + 3.2, -31], [30, 0, -60], 58],
      // 万里悲秋常作客: up into the air over the drop, the ranges going on and on
      [43.4, [-58, T - 2, -40], [100, 30, 60], 50],
      // 百年多病独登台: turn — and there on the edge of the terrace, one man
      [49.6, [-61, T + 5.5, -35], [-72.8, T + 1.1, -27], 40],
      [52.6, [-65.5, T + 3, -31], [-72.8, T + 1.3, -27], 40],
      // 艰难苦恨繁霜鬓: closer — the white head in the wind
      [56.6, [-69.2, T + 2.2, -29.3], [-72.8, T + 1.5, -27], 40],
      // 潦倒新停浊酒杯: the jar set down beside him; up over him, looking down
      // on the two of them —
      [60.4, [-70, T + 4.5, -27], [-73.2, T + 0.4, -26.5], 46],
      [64.0, [-73.4, T + 10, -26.4], [-72.6, T, -27.3], 50],
      // — and down behind him, rising and drawing away: one man at the edge,
      // the river going on past him, for the poem whole
      // (low enough behind him that he stays in the lower third of the frame)
      [68.4, behind(10, 6), past(-12.5), 50],
      [79.0, behind(17, 11), past(-11.5), 50],
    ];
  },

  // 鸟飞回 — seven birds wheeling over the white bar, blown about in the gale:
  // each on its own ring and rhythm, placed in the world and drawn at the size
  // a bird that far off would be.
  drawWorld(A, t, pose) {
    const { ctx, H, project, rng, G } = A;
    if (!this._birds) {
      const r = rng(4242);
      this._birds = Array.from({ length: 7 }, () => ({ rr: 6 + r() * 9, w: (0.42 + r() * 0.3) * (r() < 0.3 ? -1 : 1), ph: r() * 6.28, y: 8 + r() * 5, flap: 5 + r() * 3, span: 1.5 + r() * 0.4 }));
    }
    const C = [-42, G(-42, -60), -60];
    const s = H / 2 / Math.tan((pose.fov * Math.PI) / 360);
    ctx.save();
    ctx.strokeStyle = '#1e1b17'; ctx.fillStyle = '#1e1b17'; ctx.lineCap = 'round';
    for (const b of this._birds) {
      const a = t * b.w + b.ph;
      // the gale pushes the ring downwind and back, so they wheel and return
      const gust = Math.sin(t * 0.7 + b.ph) * 3;
      const P = [C[0] + Math.cos(a) * b.rr + gust, C[1] + b.y + Math.sin(t * 1.3 + b.ph * 3) * 1.2, C[2] + Math.sin(a) * b.rr];
      const p = project(P, pose);
      if (p.z < 2) continue;
      const half = (b.span / 2) * s / p.z;
      if (half < 1.2) continue;
      const f = Math.sin(t * b.flap + b.ph * 7);
      ctx.globalAlpha = Math.max(0.25, 1 - p.z / 160);
      ctx.lineWidth = Math.max(1.4, half * 0.16);
      ctx.beginPath();
      ctx.moveTo(p.x - half, p.y - half * 0.35 * f);
      ctx.quadraticCurveTo(p.x - half * 0.45, p.y - half * (0.45 + 0.3 * f), p.x, p.y);
      ctx.quadraticCurveTo(p.x + half * 0.45, p.y - half * (0.45 + 0.3 * f), p.x + half, p.y - half * 0.35 * f);
      ctx.stroke();
      ctx.beginPath(); ctx.ellipse(p.x, p.y + half * 0.05, half * 0.13, half * 0.08, 0, 0, 6.28); ctx.fill();
    }
    ctx.restore();
  },

  // Each couplet is written, held, and then the gale takes it: the ink breaks
  // into leaves, top first, and they tumble away down the wind, turning from
  // ink to the colour of the leaves as they go.
  drawLines(A, t, LINES) {
    const { ctx, W, H, layers, strokesInto, blit, english, ease, span, mix, rng, lum, INK, SILVER } = A;
    const size = 104, y = 236, gap = 118;
    const la = layers[0], ax = la.getContext('2d');
    const LEAF = ['#a84e28', '#b07a45', '#c39a4a', '#8e5a2e'];
    this._leaves = this._leaves || {};
    for (const c of this.couplets) {
      const [s0, s1] = LINES[c.ids[0]].show;
      const blowAt = s1 - 2.2;
      if (t < s0 - 0.3 || t > s1 + 2.4) continue;
      const cols = c.ids.map((id, j) => ({ l: LINES[id], x: c.x - j * gap }));
      const colH = 7 * size * 1.08;
      const left = Math.min(...cols.map((q) => q.x));
      const color = lum(left, y, gap * 2, colH) < 118 ? SILVER : INK;
      // The leaves, once per couplet: points along every stroke's spine.
      const key = c.ids.join();
      if (!this._leaves[key]) {
        const r = rng(c.ids[0] * 97 + 13), k = size / 1024, out = [];
        cols.forEach((q) => q.l.plan.forEach((strokes, ci) => strokes.forEach(({ s }) => {
          for (let i = 1; i < s.pts.length; i++) {
            const [ax0, ay0] = s.pts[i - 1], [ax1, ay1] = s.pts[i];
            const n = Math.max(1, Math.ceil(Math.hypot(ax1 - ax0, ay1 - ay0) / 46));
            for (let j = 0; j < n; j++) {
              const u = j / n, px = mix(ax0, ax1, u), py = mix(ay0, ay1, u);
              const x0 = q.x + px * k, y0 = y + ci * size * 1.08 + (900 - py) * k;
              out.push({
                x0, y0,
                // the gust comes down the columns from the top, a little ragged
                at: blowAt + 1.5 * ((y0 - y) / colH) * 0.75 + r() * 0.5,
                dur: 1.8 + r() * 1.4, dx: 320 + r() * 560, dy: 260 + r() * 520, lift: r(),
                spin: (r() - 0.5) * 14, flip: 4 + r() * 9, ph: r() * 6.28, len: 9 + r() * 9,
                c: LEAF[Math.floor(r() * LEAF.length)],
              });
            }
          }
        })));
        this._leaves[key] = out;
      }
      const leaves = this._leaves[key];
      const a = ease(span(t, s0 - 0.3, s0 + 0.3));
      if (t < s1) {
        ax.clearRect(0, 0, W, H);
        cols.forEach((q) => strokesInto(ax, q.l.plan, q.x, y, size, t, color));
        // the ink a leaf has left is gone from the column
        if (t > blowAt) {
          ax.save();
          ax.globalCompositeOperation = 'destination-out';
          ax.fillStyle = '#000';
          ax.beginPath();
          for (const f of leaves) if (t > f.at) { ax.moveTo(f.x0 + 11, f.y0); ax.arc(f.x0, f.y0, 11, 0, 6.28); }
          ax.fill();
          ax.restore();
        }
        blit(la, a, color, size);
      }
      // and the leaves, going
      ctx.save();
      for (const f of leaves) {
        const q = (t - f.at) / f.dur;
        if (q <= 0 || q >= 1) continue;
        const x = f.x0 + Math.pow(q, 1.25) * f.dx + Math.sin(q * 9 + f.ph) * 22 * q;
        const yy = f.y0 + q * q * f.dy - Math.sin(q * 3.1) * 70 * f.lift;
        const tone = ease(span(q, 0, 0.5));
        ctx.globalAlpha = (1 - ease(span(q, 0.6, 1))) * 0.95;
        ctx.translate(x, yy);
        ctx.rotate(f.ph + q * f.spin);
        ctx.scale(1, Math.cos(q * f.flip + f.ph) * 0.85 + 0.15);
        ctx.fillStyle = tone < 0.5 ? color : f.c;
        ctx.beginPath();
        ctx.moveTo(-f.len, 0);
        ctx.quadraticCurveTo(0, -f.len * 0.42, f.len, 0);
        ctx.quadraticCurveTo(0, f.len * 0.42, -f.len, 0);
        ctx.fill();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
      ctx.restore();
      // the English for whichever line is being read
      const on = t < cols[1].l.w[0] ? cols[0].l : cols[1].l;
      const ea = ease(span(t, on.w[0] + 1.2, on.w[0] + 2.4)) * (1 - ease(span(t, blowAt, blowAt + 0.8)));
      const pre = on === cols[1].l ? 1 - ease(span(t, cols[1].l.w[0], cols[1].l.w[0] + 0.6)) : 1;
      if (on === cols[1].l && pre > 0) english(cols[0].l.en, pre * ea);
      english(on.en, ea * (on === cols[1].l ? 1 - pre : 1));
    }
  },

  // ---------------------------------------------------------------- score
  // D, in the old 羽 mode — D F G A C — and slow. A gale under everything that
  // never lets up; the qin walking down; a low drone. The gibbons, three times,
  // far up the gorge. 萧萧: the rustle; 滚滚: the deep roll. And at 独 — almost
  // nothing: one xiao note. The jar set down: a clay knock.
  score(A) {
    const { oc, noise, qin, fan, xiao, pad, drone, ping, rnd, bus, master, conv, TOTAL } = A;
    const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
    const D2 = 38, D3 = 50, F3 = 53, G3 = 55, A3 = 57, C4 = 60, D4 = 62, F4 = 65, G4 = 67, A4 = 69, C5 = 72, D5 = 74, F5 = 77;

    // The gale: a bed that never stops, gusting.
    const gale = noise(0.2, TOTAL, 'bandpass', 420, 0.5, 0.2, 2.5, 3.5);
    // At 独 the wind falls away for a few breaths — he is alone with it gone —
    // and comes back.
    const lull = (t) => 1 - 0.75 * Math.min(1, Math.max(0, (t - 46.2) / 1.6), Math.max(0, (53.4 - t) / 1.8));
    for (let t = 0.5; t < TOTAL - 3; t += 0.25) gale.g.gain.setValueAtTime(lull(t) * (0.16 + 0.14 * Math.pow(0.5 + 0.5 * Math.sin(t * 0.9) * Math.sin(t * 0.37 + 1), 2)), t);
    for (let t = 0.5; t < TOTAL - 3; t += 0.5) gale.fl.frequency.setValueAtTime(300 + 260 * (0.5 + 0.5 * Math.sin(t * 0.61)), t);
    const howl = noise(3, TOTAL, 'bandpass', 900, 6, 0.024, 4, 4, master, -0.3);
    for (let t = 3.5; t < TOTAL - 4; t += 0.3) howl.fl.frequency.setValueAtTime(700 + 400 * Math.sin(t * 0.43) * Math.sin(t * 0.17), t);
    for (let t = 4; t < TOTAL - 4.5; t += 0.3) howl.g.gain.setValueAtTime(0.024 * lull(t), t);

    // The ground under it all: D and A — and at 独 it goes out from under him
    // for a few breaths, with the wind, and comes back.
    drone(0.4, 47.6, hz(D2), 0.026);
    drone(51.2, TOTAL, hz(D2), 0.026);
    pad(1, 19, [hz(D3), hz(A3), hz(D4)], 0.035);
    pad(18, 30, [hz(D3), hz(F3), hz(C4)], 0.035);
    pad(29, 42, [hz(G3 - 12), hz(D3), hz(A3)], 0.04);
    pad(41, 55, [hz(D3), hz(A3), hz(F4)], 0.032);
    pad(54, 68, [hz(F3 - 12), hz(C4 - 12), hz(A3)], 0.034);
    pad(66, TOTAL, [hz(D3), hz(A3), hz(D4)], 0.04);

    // The qin, walking: [time, note, weight, slide].
    const walk = (t0, notes) => notes.forEach(([dt, m, v = 0.55, sl = 0]) => qin(t0 + dt, hz(m), v, 4.6, sl));
    walk(0.6, [[0, D4, 0.6], [2.2, A3], [3.6, C4], [5.6, D4, 0.5], [7.4, F4], [8.4, G4, 0.5, 0.94], [10.6, D4], [12.2, C4], [13.6, A3, 0.6], [15.6, D4, 0.6]]);
    // the climb ends: a harmonic, the terrace
    fan(18.4, hz(A4), 0.5, 6);
    // 风急天高猿啸哀 — the gibbons: a long rising call, falling away, three times, far off.
    const gibbon = (t, f0, pan) => {
      const o = oc.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * 1.9, t + 0.9); o.frequency.exponentialRampToValueAtTime(f0 * 1.15, t + 2.1);
      const vib = oc.createOscillator(); vib.frequency.value = 7; const vg = oc.createGain(); vg.gain.value = f0 * 0.03; vib.connect(vg); vg.connect(o.frequency);
      const o2 = oc.createOscillator(); o2.type = 'triangle'; o2.frequency.setValueAtTime(f0 * 2, t); o2.frequency.exponentialRampToValueAtTime(f0 * 3.8, t + 0.9); o2.frequency.exponentialRampToValueAtTime(f0 * 2.3, t + 2.1);
      const g2 = oc.createGain(); g2.gain.value = 0.18;
      const g = oc.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.05, t + 0.5); g.gain.linearRampToValueAtTime(0.04, t + 1.4); g.gain.linearRampToValueAtTime(0, t + 2.2);
      const p = oc.createStereoPanner(); p.pan.value = pan;
      const wet = oc.createGain(); wet.gain.value = 1.4;
      o.connect(g); o2.connect(g2); g2.connect(g); g.connect(p); p.connect(master); p.connect(wet); wet.connect(conv);
      [o, o2, vib].forEach((x) => { x.start(t); x.stop(t + 2.3); });
    };
    gibbon(19.6, 520, -0.4); gibbon(21.4, 600, -0.2); gibbon(23.0, 470, -0.5);
    walk(19.2, [[0, D5, 0.5], [1.8, C5], [3.0, A4, 0.5, 0.94], [5.2, G4], [6.6, A4, 0.45], [8.0, D4, 0.55]]);
    // 鸟飞回 — the birds, small, carried on the wind.
    [24.6, 25.1, 26.3, 27.0].forEach((t, i) => ping(t, hz(F5 + (i % 2) * 5), 0.035, 0.3 - i * 0.2));
    // the gust that takes a couplet: a rush of air through dry leaves
    const gust = (t) => { const b = noise(t - 0.4, t + 2.6, 'bandpass', 2400, 0.8, 0.05, 0.6, 1.8, master, 0.35); b.fl.frequency.linearRampToValueAtTime(1100, t + 2.4); };
    gust(26.4); gust(38.8); gust(51.8); gust(64.2);
    // 无边落木萧萧下 — the rustle, falling, and the qin coming down with it.
    for (let i = 0; i < 9; i++) { const t = 29.8 + i * 0.6 + rnd() * 0.2; noise(t, t + 0.5, 'highpass', 3200 + rnd() * 2000, 0.6, 0.012, 0.05, 0.4, master, (rnd() - 0.5) * 1.2); }
    walk(29.8, [[0, A4, 0.55], [1.2, G4], [2.4, F4], [3.6, D4, 0.55], [4.6, C4, 0.5, 0.94]]);
    // 不尽长江滚滚来 — the river: deep rolling drums, and the drone opens up.
    const roll = (t, v) => {
      const o = oc.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(44, t + 0.9);
      const g = oc.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0004, t + 1.6);
      o.connect(g); g.connect(master); g.connect(conv); o.start(t); o.stop(t + 1.7);
      noise(t, t + 0.4, 'lowpass', 260, 0.7, v * 0.5, 0.01, 0.35);
    };
    [34.4, 35.6, 36.4, 37.6, 38.2, 39.4].forEach((t, i) => roll(t, 0.22 + 0.05 * (i % 2)));
    noise(34, 41, 'lowpass', 160, 0.6, 0.06, 1.5, 2.5);
    walk(34.6, [[0, D4, 0.6], [1.6, F4], [2.6, G4], [3.8, A4, 0.6], [5.4, D5, 0.55, 0.94]]);
    // 万里悲秋常作客 — the xiao, far, alone over the drone.
    xiao(41.8, hz(A4), 3.4, 0.5, 1);
    xiao(45.4, hz(G4), 1.6, 0.45);
    qin(42.4, hz(D4), 0.4, 5);
    // 百年多病独登台 — 独: almost nothing. One long low xiao note, one harmonic.
    xiao(47.2, hz(D4), 5.8, 0.55, 1);
    fan(49.4, hz(D5), 0.45, 7);
    qin(52.6, hz(A3), 0.45, 5);
    // 艰难苦恨繁霜鬓 — the qin again, slower, the slide down at 恨.
    walk(55.0, [[0, F4, 0.5], [1.4, D4], [2.6, C4, 0.5, 0.89], [4.4, A3, 0.55]]);
    xiao(56.4, hz(C5), 2.4, 0.38);
    // 潦倒新停浊酒杯 — the jar set down: a dull clay knock, and the qin's last walk.
    const clay = (t) => {
      const o = oc.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(240, t); o.frequency.exponentialRampToValueAtTime(150, t + 0.08);
      const g = oc.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.28, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0003, t + 0.25);
      o.connect(g); g.connect(master); g.connect(conv); o.start(t); o.stop(t + 0.3);
    };
    clay(61.4);
    walk(60.2, [[0, D4, 0.5], [1.8, A3], [3.0, G3, 0.5], [4.6, D3, 0.6]]);
    // The poem whole: the qin plays the opening again, with harmonics; the seal.
    walk(67.4, [[0, D4, 0.55], [1.6, A3], [2.8, C4], [4.2, D4, 0.5]]);
    fan(70.6, hz(A4), 0.45, 6); fan(72.4, hz(D5), 0.4, 6);
    qin(73.8, hz(D3), 0.6, 6);
  },
};
