/**
 * 敕勒歌 — the song of the Chile, Northern Dynasties. Daylight, colour, wind.
 *
 * One unbroken take, 74 seconds. Six lines of emptiness and one of revelation,
 * so the film is built for its last line: the camera stays down in the grass
 * where the herd cannot be seen, and then the wind comes across the plain in a
 * visible wave, lays the grass down, and there they are.
 *
 *    0–18  敕勒川 · 阴山下   the ink drop opens on a world of grass, at grass
 *                             height, blades crossing the lens; slowly through
 *                             it towards the far range.
 *   18–34  天似穹庐 · 笼盖四野  up out of the grass into the dome of the sky
 *                             and its sun, and round it.
 *   34–46  天苍苍 · 野茫茫   out over grass to every horizon; larks.
 *   46–62  风吹草低见牛羊   down into the grass again, facing nothing — the gust —
 *                             the grass lies down, and the cattle and sheep, the
 *                             herdsman and his dog.
 *   62–74  up; the whole song across the sky, 敕勒川印, paper.
 *
 * The lines arrive large, as couplets in the sky, and leave the way everything
 * here leaves: the wind takes them, the ink streaming off in shreds and specks.
 */
window.__screenplays = window.__screenplays || {};

window.__screenplays.chile = {
  name: 'reel-chile',
  scene: 'chile',
  total: 74,
  seed: 205,
  paper: '#efe8d2',
  cover: 57.0,
  author: '佚名',
  sealChars: '敕勒川印',
  column: { x: 118, y: 300, size: 118 },
  lines: [
    { zh: '敕勒川', en: 'The Chile plain, beneath the Yin Mountains.', w: [5.0, 2.6], show: [5.0, 17.4] },
    { zh: '阴山下', en: '', w: [8.2, 2.6], show: [5.0, 17.4] },
    { zh: '天似穹庐', en: 'The sky, a felt tent, covers the wilds on every side.', w: [20.4, 3.0], show: [20.4, 33.4] },
    { zh: '笼盖四野', en: '', w: [24.0, 3.0], show: [20.4, 33.4] },
    { zh: '天苍苍', en: 'Blue, blue the sky; wide, wide the plain —', w: [35.2, 2.6], show: [35.2, 46.0] },
    { zh: '野茫茫', en: '', w: [38.4, 2.6], show: [35.2, 46.0] },
    { zh: '风吹草低见牛羊', en: 'the wind bows the grass, and there are the cattle and sheep.', w: [51.8, 4.6], show: [51.8, 62.4] },
  ],
  final: { at: 63.2, sealAt: 66.8, out: 70.4, x0: 848, dx: 118, y: 250, size: 92, credit: 'Song of the Chile  ·  Northern Dynasties, 5th–6th c.' },
  end: { paper: 70.0, card: 71.0 },

  // The gust: its front runs across the plain along +x, and the grass behind it
  // lies down and stays down while the wind holds; then lifts a little.
  gust(t) {
    const k = Math.max(0, Math.min(1, (t - 51.4) / 4.2));
    const front = -70 + 170 * k;
    let amt = t < 51.4 ? 0 : t < 62 ? 1 : 1 - 0.7 * Math.min(1, (t - 62) / 5);
    return { front, amt, k };
  },

  setup(F) {
    F.air({ wind: 1.25, mist: 0.18 });
  },
  world(F, t) {
    const g = this.gust(t);
    F.bow(g.amt * 0.95, g.front);
    F.air({ wind: t > 50.5 && t < 58 ? 1.9 : 1.25 });
  },

  grade: () => 'contrast(1.06) saturate(1.12) brightness(1.03)',

  camera: () => [
    // in the grass, at grass height, looking across to the range
    [0.0, [0, 1.3, 34], [-165, 6, -120], 48],
    [14.0, [-4, 1.35, 27], [-165, 8, -120], 47],
    // up out of it, into the dome of the sky and its sun
    [20.0, [-5, 4, 26], [-120, 40, -110], 52],
    [26.0, [-6, 9, 26], [14, 59, -49], 58],
    // round the sky
    [32.0, [-4, 14, 30], [80, 60, -40], 56],
    // out over the grass to the eastern horizon
    [38.0, [2, 16, 40], [150, 12, 60], 50],
    [44.0, [-8, 8, 22], [60, 4, 60], 48],
    // down into the grass again, sweeping round as it sinks
    [48.5, [-16, 2.2, 6], [40, 1.5, 10], 46],
    // at grass height, facing where the herd is and cannot be seen
    [50.6, [-17, 1.35, 4], [18, 1.0, -34], 44],
    [57.0, [-15.6, 1.4, 2.6], [18, 0.9, -34], 42],
    [62.0, [-14.6, 1.55, 1.6], [18, 0.9, -34], 42],
    // up, for the whole song across the sky
    [69.0, [-11, 16, 18], [22, 26, -100], 50],
    [74.0, [-10.4, 17, 18.6], [22, 26.5, -100], 50],
  ],

  // ------------------------------------------------------------- overlays
  // Seed fluff on the wind, through everything.
  drawWorld(A, t) {
    const { ctx, W, H, rng, mix, ease, span } = A;
    if (!this._fluff) {
      const r = rng(55);
      this._fluff = Array.from({ length: 60 }, () => ({ x: r() * W, y: r() * H, s: 2 + r() * 5, v: 60 + r() * 160, ph: r() * 6.28 }));
    }
    const gust = t > 51 && t < 58 ? 2.6 : 1;
    ctx.save();
    ctx.fillStyle = 'rgba(255,250,232,0.75)';
    const a = ease(span(t, 2, 4)) * (1 - ease(span(t, 69.6, 70.6)));
    for (const f of this._fluff) {
      const x = ((f.x + t * f.v * gust) % (W + 60) + W + 60) % (W + 60) - 30;
      const y = f.y + Math.sin(t * 0.9 + f.ph) * 40 - t * 6;
      const yy = ((y % H) + H) % H;
      ctx.globalAlpha = a * 0.7;
      ctx.beginPath(); ctx.arc(x, yy, f.s, 0, 6.28); ctx.fill();
    }
    ctx.restore();
  },

  // The grass right in front of the lens: tall blades brushed in, swaying, and
  // laid down by the gust as it passes from left to right across the frame.
  drawNear(A, t, pose) {
    const { ctx, W, H, rng, mix, ease, span, G } = A;
    const above = pose.pos[1] - G(pose.pos[0], pose.pos[2]);
    const near = 1 - ease(span(above, 1.7, 3.6));
    // The curtain closes as we come down for the last line, and is laid down by the gust.
    const curtain = ease(span(t, 46.4, 48.6)) * (1 - ease(span(t, 61.5, 64)));
    if (near <= 0.01 && curtain <= 0.01) return;
    // The grass comes with the world, as the ink drop opens it.
    const opened = ease(span(t, 0.6, 2.8));
    if (opened <= 0) return;
    if (!this._blades) {
      const r = rng(812);
      const make = (n, baseLo, baseHi, hLo, hHi, wLo, wHi, kind) =>
        Array.from({ length: n }, () => {
          const z = r();
          return {
            x: r() * (W + 240) - 120,
            base: H * mix(baseLo, baseHi, r()),
            h: H * mix(hLo, hHi, Math.pow(r(), 0.8)) * mix(0.75, 1.15, z),
            w: mix(wLo, wHi, z),
            lean: (r() - 0.35) * 0.32,
            curl: (r() - 0.5) * 0.5,
            z, ph: r() * 6.28, hue: r(), kind,
          };
        });
      this._blades = [
        ...make(64, 0.84, 1.08, 0.2, 0.55, 6, 22, 'meadow'),
        ...make(170, 0.66, 1.06, 0.26, 0.62, 7, 26, 'curtain'),
      ].sort((a, b) => a.z - b.z);
    }
    const g = this.gust(t);
    const screenFront = mix(-300, W + 300, ease(span(t, 51.6, 54.6)));
    ctx.save();
    // Deep grass: a wash of it across the horizon behind the blades, so nothing
    // beyond can be made out — dissolving from the left as the gust goes over.
    if (curtain > 0.01) {
      const y0 = H * 0.38, y1 = H * 0.7;
      const band = ctx.createLinearGradient(0, y0, 0, y1);
      band.addColorStop(0, 'rgba(150,160,84,0)');
      band.addColorStop(0.28, `rgba(124,138,70,${0.95 * curtain})`);
      band.addColorStop(0.75, `rgba(96,112,56,${0.97 * curtain})`);
      band.addColorStop(1, `rgba(84,98,48,${0.6 * curtain})`);
      ctx.fillStyle = band;
      ctx.save();
      // Only ahead of the gust's front: a soft-edged wipe made by drawing in strips.
      for (let x = 0; x < W; x += 24) {
        const k = ease(span(x, screenFront - 40, screenFront + 340));
        if (k <= 0.01) continue;
        ctx.globalAlpha = k;
        ctx.fillRect(x, y0, 24, y1 - y0);
      }
      ctx.restore();
    }
    for (const b of this._blades) {
      const vis = (b.kind === 'meadow' ? Math.max(near, curtain) : curtain) * opened;
      if (vis <= 0.01) continue;
      const bow = g.amt * ease(span(screenFront - b.x, 0, 320)) * 0.94;
      const sway = Math.sin(t * (0.8 + b.z * 0.6) + b.ph) * b.h * 0.06 + Math.sin(t * 2.3 + b.ph * 2) * b.h * 0.012;
      const h = b.h * (1 - 0.74 * bow);
      const tipX = b.x + b.lean * b.h + sway + bow * b.h * 0.8;
      const tipY = b.base - h;
      // A blade bends: its middle sits off the line from root to tip.
      const midX = b.x + (tipX - b.x) * 0.3 + b.curl * b.h * 0.18, midY = b.base - h * 0.55;
      const grad = ctx.createLinearGradient(0, b.base, 0, tipY);
      const dark = `rgba(${Math.round(mix(52, 84, b.hue))},${Math.round(mix(66, 90, b.hue))},${Math.round(mix(28, 42, b.hue))},${0.95 * vis})`;
      const tip = `rgba(${Math.round(mix(170, 206, b.hue))},${Math.round(mix(168, 194, b.hue))},${Math.round(mix(84, 112, b.hue))},${0.9 * vis})`;
      grad.addColorStop(0, dark);
      grad.addColorStop(1, tip);
      ctx.fillStyle = grad;
      ctx.filter = b.z > 0.86 ? 'blur(3px)' : 'none';
      ctx.beginPath();
      ctx.moveTo(b.x - b.w / 2, b.base);
      ctx.quadraticCurveTo(midX - b.w * 0.25, midY, tipX, tipY);
      ctx.quadraticCurveTo(midX + b.w * 0.25, midY, b.x + b.w / 2, b.base);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  },

  // The lines: couplets in the sky, right column first; the wind takes them.
  drawLines(A, t, LINES) {
    const { ctx, W, H, layers, strokesInto, blit, english, ease, span, mix, rng, INK } = A;
    const groups = [
      { ids: [0, 1], size: 150 },
      { ids: [2, 3], size: 128 },
      { ids: [4, 5], size: 150 },
      { ids: [6], size: 112 },
    ];
    const [la, lb] = layers;
    const ax = la.getContext('2d'), bx = lb.getContext('2d');
    for (const g of groups) {
      const first = LINES[g.ids[0]];
      const [s0, s1] = first.show;
      if (t < s0 - 0.3 || t > s1) continue;
      const blowAt = s1 - 1.7;
      const p = ease(span(t, blowAt, s1));
      const a = ease(span(t, s0 - 0.3, s0 + 0.2));
      const y = 230;
      const cols = g.ids.length === 2
        ? [{ l: LINES[g.ids[0]], x: W / 2 + 24 }, { l: LINES[g.ids[1]], x: W / 2 - 24 - g.size }]
        : [{ l: LINES[g.ids[0]], x: W / 2 - g.size / 2 }];
      ax.clearRect(0, 0, W, H);
      cols.forEach((c) => strokesInto(ax, c.l.plan, c.x, y, g.size, t, INK));
      if (p <= 0) {
        blit(la, a, INK, g.size);
      } else {
        // Torn by the wind: strips of ink sheared off to the right, the top first.
        bx.clearRect(0, 0, W, H);
        const top = y - 20, bottom = y + g.size * 1.08 * 7 + 40;
        for (let sy = top; sy < bottom; sy += 6) {
          const n = 0.5 + 0.5 * Math.sin(sy * 0.031) * Math.cos(sy * 0.017 + 1.3);
          const n2 = 0.5 + 0.5 * Math.sin(sy * 0.053 + 2.1);
          const local = span(p, 0.1 * (1 - (sy - top) / (bottom - top)), 1);
          const dx = Math.pow(local, 1.7) * (240 + 560 * n);
          const al = 1 - ease(span(local, 0.15 + 0.5 * n2, 1));
          if (al <= 0) continue;
          bx.globalAlpha = al;
          bx.drawImage(la, 0, sy, W, 6, dx, sy - local * 30 * n2, W, 6);
        }
        bx.globalAlpha = 1;
        blit(lb, a, INK, g.size);
        // and specks of it, flying.
        const r = rng(Math.floor(s0 * 100));
        const k = g.size / 1024;
        ctx.save();
        ctx.fillStyle = INK;
        cols.forEach((c) => c.l.plan.forEach((strokes, ci) => strokes.forEach(({ s }) => {
          for (let i = 0; i < s.pts.length; i += 2) {
            const [px, py] = s.pts[i];
            const rel = r() * 0.55, sp2 = r(), up = r();
            const q = span(p, rel, 1);
            if (q <= 0 || q >= 1) continue;
            const x0 = c.x + px * k, y0 = y + ci * g.size * 1.08 + (900 - py) * k;
            const x = x0 + Math.pow(q, 1.4) * (320 + 480 * sp2);
            const yy = y0 - q * 140 * up + Math.sin(q * 7 + sp2 * 6) * 18;
            ctx.globalAlpha = (1 - q) * 0.85;
            ctx.beginPath(); ctx.arc(x, yy, 1.6 + 3.2 * (1 - q) * sp2, 0, 6.28); ctx.fill();
          }
        })));
        ctx.restore();
      }
      english(first.en, a * ease(span(t, first.w[0] + 1.6, first.w[0] + 2.8)) * (1 - p));
    }
  },

  // ---------------------------------------------------------------- score
  // The wind is the lead voice. Under it a horsehead fiddle, a throat-sung
  // drone with its whistling overtone, larks high up in the blue; and at the
  // reveal, cattle and sheep far off, and the bells of the herd.
  score(A) {
    const { oc, noise, fan, pad, drone, ping, rnd, conv, master, bus, TOTAL } = A;
    const N = { D2: 73.42, A2: 110, D3: 146.83, E3: 164.81, Fs3: 185, A3: 220, B3: 246.94, D4: 293.66, E4: 329.63, Fs4: 369.99, A4: 440, B4: 493.88, D5: 587.33 };

    // 马头琴 — a bowed string with a wooden body: a sawtooth through three formants,
    // a slow bow, and a vibrato that blooms.
    const khuur = (t, f, d, v = 0.5, slide = 0) => {
      const out = oc.createGain(); out.gain.value = 1;
      const env = oc.createGain();
      env.gain.setValueAtTime(0, t); env.gain.linearRampToValueAtTime(v * 0.05, t + 0.4);
      env.gain.setValueAtTime(v * 0.05, t + d - 0.7); env.gain.linearRampToValueAtTime(0, t + d);
      const o = oc.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f, t);
      if (slide) { o.frequency.setValueAtTime(f, t + d * 0.6); o.frequency.exponentialRampToValueAtTime(f * slide, t + d * 0.85); }
      const o2 = oc.createOscillator(); o2.type = 'sawtooth'; o2.frequency.value = f * 1.003;
      const vib = oc.createOscillator(); vib.frequency.value = 5.2;
      const vg = oc.createGain(); vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(f * 0.011, t + d * 0.7);
      vib.connect(vg); vg.connect(o.frequency); vg.connect(o2.frequency);
      const mixg = oc.createGain(); mixg.gain.value = 0.5;
      o.connect(mixg); o2.connect(mixg);
      [[720, 2.2, 1], [1480, 3, 0.6], [2700, 4, 0.3]].forEach(([fq, q, gn]) => {
        const bp = oc.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = fq; bp.Q.value = q;
        const g = oc.createGain(); g.gain.value = gn;
        mixg.connect(bp); bp.connect(g); g.connect(env);
      });
      const lp = oc.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1200;
      mixg.connect(lp); lp.connect(env);
      env.connect(out); out.connect(bus);
      [o, o2, vib].forEach((x) => { x.start(t); x.stop(t + d + 0.1); });
      noise(t, t + d, 'bandpass', 2400, 1.5, v * 0.006, 0.3, 0.6, bus);
    };
    // 呼麦 — a throat-sung drone, and the whistle that rides on its harmonics.
    const khoomei = (t0, t1, f, harmonics, gain) => {
      const o = oc.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f;
      const lp = oc.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 380;
      const dg = oc.createGain();
      dg.gain.setValueAtTime(0, t0); dg.gain.linearRampToValueAtTime(gain, t0 + 2); dg.gain.setValueAtTime(gain, t1 - 2); dg.gain.linearRampToValueAtTime(0, t1);
      o.connect(lp); lp.connect(dg); dg.connect(master); dg.connect(conv);
      const bp = oc.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 32;
      const step = (t1 - t0 - 2) / harmonics.length;
      harmonics.forEach((h, i) => bp.frequency.setTargetAtTime(f * h, t0 + 1 + i * step, 0.25));
      bp.frequency.setValueAtTime(f * harmonics[0], t0);
      const wg = oc.createGain();
      wg.gain.setValueAtTime(0, t0); wg.gain.linearRampToValueAtTime(gain * 2.2, t0 + 3); wg.gain.setValueAtTime(gain * 2.2, t1 - 2); wg.gain.linearRampToValueAtTime(0, t1);
      o.connect(bp); bp.connect(wg); wg.connect(bus);
      o.start(t0); o.stop(t1 + 0.1);
    };
    const lark = (t, n = 9, pan = 0.4) => {
      for (let i = 0; i < n; i++) {
        const tt = t + i * (0.07 + rnd() * 0.06);
        const o = oc.createOscillator(); o.type = 'sine';
        const f0 = 3600 + rnd() * 2400;
        o.frequency.setValueAtTime(f0, tt); o.frequency.exponentialRampToValueAtTime(f0 * (0.8 + rnd() * 0.5), tt + 0.05);
        const g = oc.createGain(); g.gain.setValueAtTime(0, tt); g.gain.linearRampToValueAtTime(0.012, tt + 0.008); g.gain.exponentialRampToValueAtTime(0.0002, tt + 0.07);
        const p = oc.createStereoPanner(); p.pan.value = pan;
        o.connect(g); g.connect(p); p.connect(conv); p.connect(master);
        o.start(tt); o.stop(tt + 0.09);
      }
    };
    const moo = (t, v = 0.05, pan = 0.3) => {
      const o = oc.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(112, t); o.frequency.linearRampToValueAtTime(118, t + 0.4); o.frequency.exponentialRampToValueAtTime(92, t + 1.5);
      const f1 = oc.createBiquadFilter(); f1.type = 'bandpass'; f1.frequency.value = 340; f1.Q.value = 2.5;
      const lp = oc.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700;
      const g = oc.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.3); g.gain.setValueAtTime(v, t + 1.1); g.gain.linearRampToValueAtTime(0, t + 1.6);
      const p = oc.createStereoPanner(); p.pan.value = pan;
      o.connect(f1); f1.connect(lp); lp.connect(g); g.connect(p); p.connect(conv); p.connect(master);
      o.start(t); o.stop(t + 1.7);
    };
    const baa = (t, v = 0.03, pan = -0.3) => {
      const o = oc.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(360, t); o.frequency.linearRampToValueAtTime(330, t + 0.7);
      const trem = oc.createOscillator(); trem.frequency.value = 17;
      const tg = oc.createGain(); tg.gain.value = 0.5;
      const g = oc.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.06); g.gain.linearRampToValueAtTime(0, t + 0.75);
      const am = oc.createGain(); am.gain.value = 0.5;
      trem.connect(tg); tg.connect(am.gain);
      const bp = oc.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 950; bp.Q.value = 1.8;
      const p = oc.createStereoPanner(); p.pan.value = pan;
      o.connect(bp); bp.connect(am); am.connect(g); g.connect(p); p.connect(conv); p.connect(master);
      [o, trem].forEach((x) => { x.start(t); x.stop(t + 0.8); });
    };

    // The wind: always; a great gust at the reveal.
    const wind = noise(0.05, TOTAL, 'lowpass', 520, 0.6, 0.06, 1.5, 3);
    const grass = noise(0.3, TOTAL, 'highpass', 3800, 0.5, 0.014, 2, 3, master, 0.2);
    for (let t = 1; t < TOTAL; t += 1.6 + rnd() * 1.4) {
      const lv = 0.04 + rnd() * 0.04;
      if (t > 49 && t < 58) continue;
      wind.g.gain.setTargetAtTime(lv, t, 0.6);
      wind.fl.frequency.setTargetAtTime(380 + rnd() * 380, t, 0.5);
      grass.g.gain.setTargetAtTime(0.008 + rnd() * 0.012, t, 0.5);
    }
    wind.g.gain.setTargetAtTime(0.03, 49, 0.4);              // the hush before it
    wind.g.gain.setTargetAtTime(0.17, 51.2, 0.7);            // and here it comes
    wind.fl.frequency.setTargetAtTime(900, 51.2, 0.8);
    grass.g.gain.setTargetAtTime(0.055, 51.4, 0.6);
    wind.g.gain.setTargetAtTime(0.07, 56.5, 1.2);
    wind.fl.frequency.setTargetAtTime(520, 56.5, 1.2);
    grass.g.gain.setTargetAtTime(0.016, 57, 1.2);

    // 敕勒川 · 阴山下 — the fiddle alone, wide intervals, the plain.
    drone(1.0, 18.5, N.D2, 0.045);
    khuur(4.6, N.D4, 3.6, 0.6); khuur(8.4, N.A3, 2.6, 0.55); khuur(11.2, N.B3, 2.2, 0.5); khuur(13.6, N.A3, 3.8, 0.55, 0.89);
    // 天似穹庐 · 笼盖四野 — the voice under the sky, its whistle climbing.
    khoomei(18.5, 34.5, N.D2, [8, 9, 10, 12, 10, 12, 13.5, 12, 10, 9, 8], 0.03);
    fan(20.4, N.A4, 0.5, 6); fan(24.0, N.D5, 0.45, 6);
    // 天苍苍 · 野茫茫 — the fiddle high; larks.
    khuur(35.0, N.Fs4, 2.4, 0.5); khuur(37.6, N.A4, 1.8, 0.48); khuur(39.6, N.B4, 3.0, 0.5); khuur(42.8, N.A4, 3.2, 0.45, 0.89);
    for (let t = 34.5; t < 46; t += 1.4 + rnd() * 1.8) lark(t, 6 + Math.floor(rnd() * 8), (rnd() - 0.5) * 1.2);
    // 风吹草低见牛羊 — the hush, the gust, and the herd.
    drone(50.5, 70, N.D2, 0.06);
    pad(52.8, 68, [N.D3, N.A3, N.D4, N.Fs4], 0.06);
    khuur(53.6, N.D4, 2.0, 0.6); khuur(55.6, N.E4, 1.6, 0.55); khuur(57.2, N.Fs4, 2.2, 0.6); khuur(59.4, N.A4, 3.4, 0.62, 0.89);
    moo(56.4, 0.05, 0.35); baa(57.9, 0.028, -0.4); moo(60.6, 0.035, -0.2); baa(61.4, 0.02, 0.5);
    const bells = [1760, 2093, 2349, 2637];
    for (let t = 54.5; t < 68; t += 0.6 + rnd() * 1.6) ping(t, bells[Math.floor(rnd() * bells.length)], 0.02, (rnd() - 0.5) * 0.9);
    // The whole song, the seal.
    fan(63.2, N.D5, 0.55, 7);
    khuur(64.0, N.D4, 2.4, 0.5); khuur(66.6, N.A3, 2.2, 0.48); khuur(68.8, N.D3, 4.2, 0.52);
  },
};
