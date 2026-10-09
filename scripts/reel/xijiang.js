/**
 * 西江月·夜行黄沙道中 — Xin Qiji. A summer night's walk, and the happiest poem
 * on the shelf: a magpie startled by moonlight, cicadas, the smell of rice
 * flowers, frogs talking about the harvest, a few stars, a few drops of rain —
 * and round the turn of the road, over the little bridge, the inn you had
 * forgotten was there.
 *
 * One unbroken take, 63 seconds, walked as the traveller. The lines do not sit
 * at the edge of the frame: each hangs in the air beside the thing it is about
 * and drifts as we pass it.
 *
 *    0–7   明月别枝惊鹊  under the trees, the moon through the branches; the
 *                        magpies go up across it.
 *    7–20  清风半夜鸣蝉 · 稻花香里说丰年  out over the rice in the breeze;
 *                        cicadas; fireflies over the fields.
 *   20–26  听取蛙声一片  down at the brook's edge, close on the frogs.
 *   26–38  七八个星天外 · 两三点雨山前  up at the few stars as the cloud comes
 *                        in; to the hills; two or three drops ringing the brook.
 *   38–50  旧时茅店社林边 · 路转溪桥忽见  along the bank, over the bridge, and
 *                        at the turn — the inn, its lamp lit.
 *   50–63  the poem whole above the inn, 辛弃疾印, paper.
 */
window.__screenplays = window.__screenplays || {};

window.__screenplays.xijiang = {
  name: 'reel-xijiang',
  scene: 'xijiang',
  total: 63,
  seed: 1181,
  paper: '#efe4c4',
  cover: 49.6,
  author: '辛弃疾',
  title: { text: '西江月', at: 1.0, dur: 1.6, out: 5.4, x: 846, y: 240, size: 100 },
  column: { x: 118, y: 300, size: 118 },
  lines: [
    { zh: '明月别枝惊鹊', en: 'The bright moon startles a magpie off its branch;', w: [3.2, 3.0], show: [3.2, 9.6], at: 'moon' },
    { zh: '清风半夜鸣蝉', en: 'a clear breeze at midnight, and the cicadas sing.', w: [9.2, 3.0], show: [9.2, 14.6], at: [-24, 9, 42], home: [800, 230] },
    { zh: '稻花香里说丰年', en: 'In the scent of rice flowers, talk of a good year —', w: [14.0, 3.4], show: [14.0, 20.4], at: [-46, 7, 26], home: [130, 200] },
    { zh: '听取蛙声一片', en: 'listen: it is the frogs, all of them at once.', w: [20.4, 3.0], show: [20.4, 26.6], at: [-35, 3.2, 29], home: [130, 230] },
    { zh: '七八个星天外', en: 'Seven or eight stars beyond the sky,', w: [26.6, 3.0], show: [26.6, 32.6], at: [4, 62, -60], home: [700, 260] },
    { zh: '两三点雨山前', en: 'two or three drops of rain before the hills.', w: [32.6, 3.0], show: [32.6, 38.6], at: [-2, 16, -50], home: [150, 240] },
    { zh: '旧时茅店社林边', en: 'The old thatched inn by the shrine wood —', w: [38.8, 3.4], show: [38.8, 45.4], at: [16, 8, 2], home: [110, 220] },
    { zh: '路转溪桥忽见', en: 'the road turns at the brook bridge, and there it is.', w: [46.4, 3.0], show: [46.4, 52.4], at: [36, 9, 30], home: [790, 220] },
  ],
  final: { at: 52.2, sealAt: 57.4, out: 60.4, x0: 800, dx: 96, y: 230, size: 78, ink: '#efeee6', credit: 'Moon over the West River  ·  Xin Qiji, 1140–1207' },
  end: { paper: 60.0, card: 60.8 },

  setup(F) {
    F.weather('clear');
    F.air({ wind: 0.45, mist: 0.22 });
  },
  // The sky follows the poem: clear moonlight, the cloud coming in for the few
  // stars and the few drops, and clearing again for the inn.
  world(F, t) {
    F.weather(t < 25.5 ? 'clear' : t < 41 ? 'cloudy' : 'clear');
  },
  grade: () => 'brightness(1.1) saturate(1.12) contrast(1.06)',

  camera: ({ G }) => {
    const B = Math.max(G(3, 10.6), G(-3, 1.4), G(0, 6)) + 0.6;
    return [
      // under the trees, the moon through the branches
      [0.0, [9, G(9, 72) + 2.2, 72], [-10, 34, -14], 54],
      [3.2, [9.4, G(9, 71) + 2.2, 71], [-11, 35, -15], 54],
      // the eye follows the magpies up, then out over the rice
      [6.6, [6, G(6, 68) + 4.2, 68], [-14, 30, -8], 54, -0.03],
      [10.2, [-6, G(-6, 56) + 2.6, 56], [-40, 2, 30], 52, -0.06],
      [14.0, [-20, G(-20, 48) + 2.1, 48], [-50, 1, 26], 54, 0.04],
      [17.4, [-31, G(-31, 40) + 1.5, 40], [-40, 0.8, 30], 50],
      // close on the frogs at the brook's edge
      [20.2, [-33.2, G(-33.2, 33.4) + 1.5, 33.4], [-39.2, G(-39.2, 30.3) + 0.2, 30.3], 40],
      [22.6, [-33.8, G(-33.8, 33.1) + 1.4, 33.1], [-39.25, G(-39.25, 30.3) + 0.2, 30.3], 38],
      [24.6, [-34.4, G(-34.4, 32.8) + 1.3, 32.8], [-39.3, G(-39.3, 30.3) + 0.2, 30.3], 36],
      // held, so the swing up to the stars does not reach back into the frogs
      [25.3, [-34.5, G(-34.5, 32.75) + 1.32, 32.75], [-39.3, G(-39.3, 30.3) + 0.4, 30.3], 36],
      // up, at the few stars, crossing the brook as we look
      [28.6, [-31, G(-31, 26) + 3.0, 26], [-10, 60, -60], 56],
      [31.8, [-24, G(-24, 16) + 2.2, 16], [8, 56, -70], 56],
      // to the hills; the rain
      [34.6, [-17, G(-17, 9) + 1.7, 9], [0, 6, -48], 50],
      [37.6, [-11, G(-11, 6) + 1.7, 6], [8, -0.4, 3], 48],
      // along the bank, and onto the bridge along its own line
      [41.0, [-5.6, G(-5.6, -2.4) + 1.7, -2.4], [2, B + 1.2, 9.6], 48],
      [43.2, [-3.4, B + 1.65, 1.0], [6.2, B + 1.5, 16], 50],
      [45.4, [0.9, B + 1.65, 7.6], [8.6, B + 1.5, 19.6], 50],
      // the turn — and there it is
      [47.6, [3.6, G(3.6, 11.6) + 1.7, 11.6], [36, 2.4, 30], 44],
      [50.6, [6.4, G(6.4, 13.2) + 1.7, 13.2], [36, 2.2, 30], 40],
      // a little up, for the poem whole above it
      [55.0, [8.4, G(8.4, 14.2) + 3.4, 14.2], [36, 7.5, 31], 44],
      [63.0, [9.0, G(9.0, 14.5) + 3.7, 14.5], [36, 7.9, 31], 44],
    ];
  },

  // ------------------------------------------------------------- overlays
  drawWorld(A, t, pose) {
    const { ctx, W, H, rng, mix, ease, span, F, G, project, skyPoint } = A;
    // 惊鹊 — magpies, black and white, up out of the boughs and across the moon.
    const m = skyPoint(F.sky().moon, pose);
    if (t > 2.2 && t < 9 && m.z > 0) {
      for (let i = 0; i < 4; i++) {
        const k = span(t, 2.4 + i * 0.3, 7.4 + i * 0.35);
        if (k <= 0 || k >= 1) continue;
        const e = ease(k);
        const x = mix(m.x + 260 - i * 70, m.x - 380 - i * 90, e) + Math.sin(k * 8 + i) * 16;
        const y = mix(m.y + 520 + i * 30, m.y - 260 - i * 50, e);
        const s = mix(1.25, 0.5, e);
        const flap = Math.sin(t * (11 + i) + i * 2);
        ctx.save();
        ctx.globalAlpha = Math.min(1, k * 8) * (1 - ease(span(k, 0.82, 1)));
        ctx.translate(x, y); ctx.scale(-s, s);
        ctx.fillStyle = '#17181d'; ctx.strokeStyle = '#17181d'; ctx.lineCap = 'round';
        ctx.lineWidth = 6;
        for (const side of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(side * 20, -16 - flap * 16, side * 44, -4 - flap * 24); ctx.stroke(); }
        ctx.beginPath(); ctx.ellipse(0, 2, 12, 6, 0, 0, 6.28); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-10, 2); ctx.lineTo(-40, 8); ctx.lineWidth = 4; ctx.stroke();
        ctx.fillStyle = '#f2efe4'; ctx.beginPath(); ctx.ellipse(2, 4, 5, 3, 0, 0, 6.28); ctx.fill();
        ctx.restore();
      }
    }
    // The lamp of the inn — the warmth the whole walk is going towards.
    const lamp = project([34.6, G(34.6, 30.2) + 1.9, 30.2], pose);
    const warm = ease(span(t, 46.6, 49.6));
    if (lamp.z > 0 && warm > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const r = 260 + 2400 / Math.max(6, lamp.z);
      const g = ctx.createRadialGradient(lamp.x, lamp.y, 0, lamp.x, lamp.y, r);
      g.addColorStop(0, `rgba(255,196,110,${0.6 * warm})`);
      g.addColorStop(0.25, `rgba(255,170,90,${0.22 * warm})`);
      g.addColorStop(1, 'rgba(255,170,90,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
    // 两三点雨 — two or three drops, each ringing the brook.
    const drops = [[35.6, -4, 7.5], [36.5, -6.5, 8.6], [37.2, -2, 6.6], [38.0, -5, 7.2]];
    ctx.save();
    for (const [t0, x, z] of drops) {
      const k = span(t, t0, t0 + 1.6);
      if (k <= 0 || k >= 1) continue;
      const y = G(x, z) + 0.5;
      for (const [lag, sc] of [[0, 1], [0.25, 0.6]]) {
        const kk = span(k, lag, 1);
        if (kk <= 0) continue;
        const r = 0.15 + kk * 1.6 * sc;
        const pts = [];
        for (let a = 0; a < 24; a++) { const p = project([x + Math.cos(a / 24 * 6.28) * r, y, z + Math.sin(a / 24 * 6.28) * r], pose); if (p.z <= 0.3) { pts.length = 0; break; } pts.push(p); }
        if (!pts.length) continue;
        ctx.globalAlpha = (1 - kk) * 0.8;
        ctx.strokeStyle = 'rgba(236,240,232,0.9)'; ctx.lineWidth = 2.2;
        ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.closePath(); ctx.stroke();
      }
      // and the drop itself, falling, just before
      const fall = span(t, t0 - 0.35, t0);
      if (fall > 0 && fall < 1) {
        const top = project([x, y + 4 * (1 - fall), z], pose), bot = project([x, y + 4 * (1 - fall) - 0.5, z], pose);
        if (top.z > 0.3) { ctx.globalAlpha = 0.7; ctx.beginPath(); ctx.moveTo(top.x, top.y); ctx.lineTo(bot.x, bot.y); ctx.stroke(); }
      }
    }
    ctx.restore();
  },

  // Fireflies, the colour of the lamp, over the rice and round the inn.
  drawNear(A, t) {
    const { ctx, W, H, rng, mix, ease, span } = A;
    if (!this._flies) {
      const r = rng(4410);
      this._flies = Array.from({ length: 46 }, () => ({ x: r() * W, y: mix(0.35, 0.95, r()) * H, ph: r() * 6.28, sp: 0.4 + r() * 0.9, s: 3 + r() * 9, blink: 0.6 + r() * 1.4 }));
    }
    const amt = mix(0.35, 1, ease(span(t, 9, 13)) * (1 - ease(span(t, 25, 28)))) * ease(span(t, 2, 4)) * (1 - ease(span(t, 59.6, 60.6)));
    const dim = t > 26 && t < 44 ? 0.4 : 1;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (const f of this._flies) {
      const blink = Math.pow(Math.max(0, Math.sin(t * f.blink + f.ph)), 3);
      if (blink < 0.05) continue;
      const x = (f.x + Math.sin(t * 0.3 * f.sp + f.ph) * 80 + W) % W;
      const y = f.y + Math.cos(t * 0.4 * f.sp + f.ph) * 50;
      const g = ctx.createRadialGradient(x, y, 0, x, y, f.s * 3);
      g.addColorStop(0, `rgba(240,255,170,${0.9 * blink * amt * dim})`);
      g.addColorStop(1, 'rgba(240,255,170,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - f.s * 3, y - f.s * 3, f.s * 6, f.s * 6);
    }
    ctx.restore();
  },

  // Each line hangs in the scene beside what it is about, and drifts as we pass.
  drawLines(A, t, LINES) {
    const { ctx, W, H, layers, strokesInto, blit, english, ease, span, mix, project, skyPoint, F, lum, INK, SILVER, pose, poseAt } = A;
    const la = layers[0], ax = la.getContext('2d');
    const size = 92;
    for (const l of LINES) {
      const [s0, s1] = l.show;
      if (t < s0 - 0.3 || t > s1) continue;
      const a = ease(span(t, s0 - 0.3, s0 + 0.3)) * (1 - ease(span(t, s1 - 1.2, s1)));
      const colH = [...l.zh].length * size * 1.08;
      let x, y;
      if (l.at === 'moon') {
        const p = skyPoint(F.sky().moon, pose);
        if (p.z <= 0) continue;
        x = p.x - 230; y = p.y - colH * 0.55;
      } else {
        // Each column has its place in the frame, and drifts from it the way the
        // thing it is about drifts as we pass — a third as far, so it never jumps.
        const p = project(l.at, pose), p0 = project(l.at, poseAt(s0));
        const d = (u, v) => (p.z > 0 && p0.z > 0 ? Math.max(-170, Math.min(170, (u - v) * 0.33)) : 0);
        x = l.home[0] + d(p.x, p0.x); y = l.home[1] + d(p.y, p0.y) * 0.6;
      }
      x = Math.max(70, Math.min(W - 190 - size, x));
      y = Math.max(170, Math.min(1260 - colH, y));
      const color = lum(x, y, size, colH) < 118 ? SILVER : INK;
      ax.clearRect(0, 0, W, H);
      strokesInto(ax, l.plan, x, y, size, t, color);
      blit(la, a, color, size);
      english(l.en, a * ease(span(t, l.w[0] + 1.2, l.w[0] + 2.4)));
    }
  },

  // ---------------------------------------------------------------- score
  // A playful folk tune in G, 92 to the minute: a plucked pipa, a dizi, a
  // woodblock; cicadas in the breeze; the frogs taking up the rhythm — they are
  // the ones talking about the harvest; a hush and two or three plinks of rain;
  // and warmth, all together, when the inn appears.
  score(A) {
    const { oc, noise, rnd, bus, master, conv, TOTAL } = A;
    const B = 60 / 92;
    const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
    const n = { G2: 43, D3: 50, G3: 55, A3: 57, B3: 59, C4: 60, D4: 62, E4: 64, Fs4: 66, G4: 67, A4: 69, B4: 71, C5: 72, D5: 74, E5: 76, G5: 79, A5: 81, B5: 83, D6: 86 };

    const pipa = (t, m, v = 0.5, trem = 0) => {
      const f = hz(m);
      const hits = trem ? Math.max(1, Math.round(trem / 0.07)) : 1;
      for (let i = 0; i < hits; i++) {
        const tt = t + i * 0.07;
        const vv = v * (trem ? 0.55 + 0.45 * Math.sin((i / hits) * Math.PI) : 1);
        const g = oc.createGain(); g.gain.setValueAtTime(0, tt); g.gain.linearRampToValueAtTime(vv * 0.11, tt + 0.003); g.gain.exponentialRampToValueAtTime(0.0004, tt + (trem ? 0.25 : 0.9));
        const lp = oc.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(f * 10, tt); lp.frequency.exponentialRampToValueAtTime(f * 2.5, tt + 0.3);
        [['sawtooth', 1, 0.6], ['triangle', 2, 0.4]].forEach(([type, mul, a]) => {
          const o = oc.createOscillator(); o.type = type; o.frequency.value = f * mul;
          const og = oc.createGain(); og.gain.value = a;
          o.connect(og); og.connect(lp); o.start(tt); o.stop(tt + 1);
        });
        const p = oc.createStereoPanner(); p.pan.value = -0.25;
        lp.connect(g); g.connect(p); p.connect(bus);
      }
    };
    const dizi = (t, m, d, v = 0.5) => {
      const f = hz(m);
      const o = oc.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(f * 0.985, t); o.frequency.linearRampToValueAtTime(f, t + 0.05);
      const vib = oc.createOscillator(); vib.frequency.value = 6.2;
      const vg = oc.createGain(); vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(f * 0.008, t + Math.min(d, 0.45));
      vib.connect(vg); vg.connect(o.frequency);
      const o2 = oc.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * 2; const g2 = oc.createGain(); g2.gain.value = 0.2;
      const g = oc.createGain();
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v * 0.085, t + 0.04);
      g.gain.setValueAtTime(v * 0.085, t + Math.max(0.05, d - 0.08)); g.gain.linearRampToValueAtTime(0, t + d);
      const p = oc.createStereoPanner(); p.pan.value = 0.2;
      o.connect(g); o2.connect(g2); g2.connect(g); g.connect(p); p.connect(bus);
      [o, o2, vib].forEach((x) => { x.start(t); x.stop(t + d + 0.05); });
      noise(t, t + Math.min(d, 0.25), 'bandpass', f * 3, 2, v * 0.01, 0.01, 0.15, bus);
    };
    const block = (t, v = 0.4, f = 900) => {
      const o = oc.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.8, t + 0.05);
      const g = oc.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v * 0.14, t + 0.002); g.gain.exponentialRampToValueAtTime(0.0003, t + 0.09);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.1);
    };
    // A frog: a throaty, pulsed croak.
    const croak = (t, f = 160, v = 0.4, pan = 0) => {
      const o = oc.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f, t); o.frequency.linearRampToValueAtTime(f * 0.85, t + 0.22);
      const am = oc.createGain(); am.gain.value = 0;
      const lfo = oc.createOscillator(); lfo.type = 'square'; lfo.frequency.value = 38;
      const lg = oc.createGain(); lg.gain.value = 0.5; lfo.connect(lg); lg.connect(am.gain);
      const bp = oc.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 650; bp.Q.value = 2.5;
      const g = oc.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v * 0.12, t + 0.02); g.gain.linearRampToValueAtTime(0, t + 0.24);
      const p = oc.createStereoPanner(); p.pan.value = pan;
      o.connect(am); am.connect(bp); bp.connect(g); g.connect(p); p.connect(master); p.connect(conv);
      [o, lfo].forEach((x) => { x.start(t); x.stop(t + 0.26); });
    };
    const plink = (t, f, v = 0.4) => {
      const o = oc.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(f * 1.6, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.03);
      const g = oc.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v * 0.18, t + 0.002); g.gain.exponentialRampToValueAtTime(0.0002, t + 0.5);
      o.connect(g); g.connect(bus); o.start(t); o.stop(t + 0.55);
    };
    const chord = (t0, t1, ms, gain) => ms.forEach((m) => {
      const o = oc.createOscillator(); o.type = 'triangle'; o.frequency.value = hz(m);
      const lp = oc.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400;
      const g = oc.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(gain / ms.length, t0 + 0.6); g.gain.setValueAtTime(gain / ms.length, t1 - 0.6); g.gain.linearRampToValueAtTime(0, t1);
      o.connect(lp); lp.connect(g); g.connect(bus); o.start(t0); o.stop(t1 + 0.05);
    });

    // Night air; a soft breeze; cicadas in it while the breeze line holds.
    noise(0.1, TOTAL, 'lowpass', 500, 0.6, 0.02, 2, 3);
    const cic = noise(8.6, 21, 'bandpass', 5200, 6, 0.01, 1.4, 3, master, 0.4);
    for (let t = 9; t < 21; t += 0.11) cic.g.gain.setValueAtTime(0.004 + 0.01 * (0.5 + 0.5 * Math.sin(t * 9)), t);

    // The opening: a pipa tremolo as the drop lands, the moon.
    pipa(0.5, n.D5, 0.5, 1.2);
    chord(0.5, 6.5, [n.G3, n.D4, n.B4], 0.05);

    // The harmony, two beats a chord: G – Em – C – D, all the way to the rain.
    const prog = [[n.G3, n.B3, n.D4], [n.E4 - 12, n.G3, n.B3], [n.C4, n.E4, n.G4], [n.D4, n.Fs4, n.A4]];
    const bar = 4 * B;
    const start = 6.6;
    for (let t = start, k = 0; t < 26; t += B / 2, k++) {
      const c = prog[Math.floor((t - start) / bar) % 4];
      pipa(t, c[[0, 2, 1, 2][k % 4]] + (k % 8 >= 4 ? 12 : 0), 0.4 * (k % 2 ? 0.7 : 1));
      if (k % 2 === 0) block(t + B / 4, 0.25, 1100);
    }
    for (let t = start; t < 26; t += bar) chord(t, t + bar, prog[Math.floor((t - start) / bar) % 4].map((m) => m - 12), 0.035);

    // The tune: [beat, note, beats].
    const tune = (t0, notes, v = 0.55) => notes.forEach(([b, m, d]) => dizi(t0 + b * B, m, d * B * 0.95, v));
    tune(start, [[0, n.D5, 1], [1, n.E5, 0.5], [1.5, n.D5, 0.5], [2, n.B4, 2], [4, n.A4, 1], [5, n.B4, 1], [6, n.D5, 2], [8, n.E5, 1], [9, n.G5, 1], [10, n.E5, 1], [11, n.D5, 1], [12, n.B4, 3]]);
    tune(start + 16 * B, [[0, n.D5, 1], [1, n.E5, 0.5], [1.5, n.G5, 0.5], [2, n.A5, 2], [4, n.G5, 1], [5, n.E5, 1], [6, n.D5, 1], [7, n.E5, 1], [8, n.D5, 4]]);
    // 听取蛙声一片 — the frogs take the rhythm: croaks on the off-beats, a chorus.
    for (let t = 20.4; t < 26.4; t += B / 2) {
      if (rnd() < 0.85) croak(t + (rnd() - 0.5) * 0.04, 140 + rnd() * 70, 0.5, (rnd() - 0.5) * 1.2);
      if (rnd() < 0.4) croak(t + B / 4, 200 + rnd() * 60, 0.3, (rnd() - 0.5) * 1.2);
    }
    // 七八个星 — the stars: a few high plinks, and the cloud coming in (the band thins).
    [[26.8, n.B5], [27.6, n.D6], [28.3, n.A5], [29.1, n.G5], [30.0, n.D6], [30.7, n.B5], [31.5, n.A5]].forEach(([t, m]) => plink(t, hz(m), 0.35));
    chord(26.6, 33, [n.E4 - 12, n.B3, n.G4], 0.04);
    dizi(28.4, n.E5, 2.6, 0.4); dizi(31.2, n.D5, 1.8, 0.38);
    // 两三点雨 — a hush, and two or three drops: the plinks of rain.
    chord(32.8, 39, [n.C4 - 12, n.G3, n.E4], 0.035);
    [35.6, 36.5, 37.2, 38.0].forEach((t, i) => plink(t, hz([n.G5, n.E5, n.D5, n.B4][i]), 0.5));
    noise(33, 38.4, 'highpass', 4500, 0.5, 0.006, 1, 1.2);
    // Along the bank to the bridge: the pipa walking again, quietly.
    for (let t = 38.8, k = 0; t < 46.4; t += B / 2, k++) pipa(t, [n.G3, n.D4, n.B3, n.D4][k % 4] + 12, 0.28);
    dizi(39.4, n.B4, 1.4, 0.4); dizi(40.9, n.D5, 1.4, 0.4); dizi(42.4, n.E5, 2.4, 0.42); dizi(45.0, n.D5, 1.2, 0.4);
    // 忽见 — the inn: everything at once, warm.
    pipa(46.4, n.G4, 0.55, 0.9);
    chord(46.4, 60.6, [n.G2, n.D3, n.B3, n.D4, n.G4], 0.09);
    tune(46.6, [[0, n.G5, 2], [2, n.E5, 1], [3, n.D5, 1], [4, n.B4, 1], [5, n.D5, 1], [6, n.E5, 2], [8, n.D5, 1], [9, n.B4, 1], [10, n.A4, 1], [11, n.B4, 1], [12, n.G4, 4]], 0.6);
    for (let t = 46.4, k = 0; t < 57; t += B / 2, k++) {
      pipa(t, [n.G3, n.B3, n.D4, n.B3][k % 4] + 12, 0.35);
      if (k % 2 === 0) block(t + B / 4, 0.22, 1000);
    }
    croak(48.6, 170, 0.25, -0.5); croak(49.9, 150, 0.2, 0.6);
    // The seal, and the last note.
    plink(57.5, hz(n.G5), 0.4); plink(57.8, hz(n.D6), 0.35);
    pipa(58.2, n.G4, 0.45, 0.8);
  },
};
