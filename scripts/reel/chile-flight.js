/**
 * 敕勒歌 — the flight. The same song as `chile.js`, filmed the other way: not
 * a slow walk but a bird's flight through the painting, the way the "inside the
 * painting" films fly — open on the picture, dive into it, skim, bank, rush,
 * slow right down for the one moment that matters, and pull back out to the
 * picture again. Light, bright, happy: it is a song about open country.
 *
 * One unbroken take, 47 seconds, with real motion blur when it moves fast.
 *
 *    0–3   the painting: big sky, low horizon, the range, the sun.
 *    3–9   敕勒川 · 阴山下   down into the grass tips and away across them.
 *    9–15  天似穹庐 · 笼盖四野  a spiral up into the dome of the sky.
 *   15–24  天苍苍 · 野茫茫   a dive to the river; skimming the shining water.
 *   24–33  风吹草低见牛羊   up out of the river into tall grass, slowing —
 *                             the gust — the herd; between a sheep and two
 *                             oxen to the herdsman and his dog.
 *   33–47  the pull back out to the painting, the herd now in it; the whole
 *          song, 敕勒川印, paper.
 *
 * Load after chile.js: the couplets are laid out and torn away the same way.
 */
window.__screenplays = window.__screenplays || {};

window.__screenplays.chileFlight = {
  name: 'reel-chile-flight',
  scene: 'chile',
  total: 47,
  seed: 2205,
  paper: '#efe8d2',
  cover: 30.2,
  author: '佚名',
  sealChars: '敕勒川印',
  title: { text: '敕勒歌', at: 0.7, dur: 1.4, out: 3.6, x: 846, y: 240, size: 100 },
  column: { x: 118, y: 300, size: 118 },
  motionBlur: { shutter: 0.6, max: 6, perMetre: 0.32, perRadian: 5 },
  lines: [
    { zh: '敕勒川', en: 'The Chile plain, beneath the Yin Mountains.', w: [3.8, 1.8], show: [3.8, 9.4] },
    { zh: '阴山下', en: '', w: [5.6, 1.8], show: [3.8, 9.4] },
    { zh: '天似穹庐', en: 'The sky, a felt tent, covers the wilds on every side.', w: [9.8, 2.0], show: [9.8, 15.4] },
    { zh: '笼盖四野', en: '', w: [11.8, 2.0], show: [9.8, 15.4] },
    { zh: '天苍苍', en: 'Blue, blue the sky; wide, wide the plain —', w: [16.0, 1.8], show: [16.0, 23.0] },
    { zh: '野茫茫', en: '', w: [17.8, 1.8], show: [16.0, 23.0] },
    { zh: '风吹草低见牛羊', en: 'the wind bows the grass, and there are the cattle and sheep.', w: [26.8, 3.0], show: [26.8, 33.0] },
  ],
  final: { at: 34.6, sealAt: 38.4, out: 43.0, x0: 848, dx: 118, y: 250, size: 92, credit: 'Song of the Chile  ·  Northern Dynasties, 5th–6th c.' },
  end: { paper: 42.6, card: 43.6 },

  gust(t) {
    const k = Math.max(0, Math.min(1, (t - 26.2) / 3.6));
    const front = -70 + 170 * k;
    const amt = t < 26.2 ? 0 : t < 33 ? 1 : 1 - 0.6 * Math.min(1, (t - 33) / 4);
    return { front, amt, k };
  },
  setup(F) {
    F.air({ wind: 1.1, mist: 0.12 });
  },
  world(F, t) {
    const g = this.gust(t);
    F.bow(g.amt * 0.95, g.front);
    F.air({ wind: t > 25.6 && t < 31 ? 1.9 : 1.1 });
  },
  // Bright, warm, clean: noon on the steppe.
  grade: () => 'brightness(1.06) saturate(1.2) contrast(1.05)',

  camera: () => {
    const I = [[-36, 2.9, 4], [24, 32, -120], 56];
    return [
      // the painting
      [0.0, I[0], I[1], I[2]],
      [2.6, [-35.2, 2.85, 3.0], I[1], 55],
      // down into the grass tips, banking away north-east across them
      [5.0, [-28, 2.5, 18], [10, 2.0, 46], 62, -0.12],
      [8.0, [-6, 2.6, 40], [40, 3.0, 50], 64, 0.08],
      // a spiral up into the dome of the sky
      [10.8, [14, 10, 42], [30, 50, 0], 64, 0.22],
      [13.2, [10, 24, 22], [-30, 60, -40], 62, 0.3],
      [15.0, [-12, 26, 0], [-50, 20, -60], 58, 0.12],
      // the dive, round the herd's western edge, to the river
      [17.6, [-42, 9, -40], [-50, 0, -88], 60, -0.18],
      [19.4, [-52, -0.2, -88.5], [-10, -0.6, -84], 64, -0.06],
      // skimming the shining water, east
      [22.6, [-22, -0.25, -86], [20, -0.7, -91], 64, 0.06],
      // up the bank into the tall grass, and settling in it, almost still
      [24.4, [-18, 1.6, -71], [-6, 1.0, -40], 54, 0.08],
      [25.8, [-19.2, 1.45, -63.5], [-5, 1.0, -37], 50],
      [28.4, [-18.6, 1.45, -61.6], [-5, 1.0, -37], 50],
      // then on, between a sheep and two oxen, to the herdsman and his dog
      [30.6, [-11, 1.6, -46], [4, 1.2, -32], 50, -0.04],
      [32.4, [-1, 1.75, -39], [14, 1.6, -21], 50],
      // and out: back and up to the painting, the herd standing in it now
      [35.0, [-20, 7, -14], [10, 18, -100], 54],
      [38.0, I[0], I[1], I[2]],
      [47.0, [-36.6, 2.95, 4.6], I[1], 56],
    ];
  },

  // ------------------------------------------------------------- overlays
  drawWorld(A, t, pose) {
    const { ctx, W, H, rng, mix, ease, span, F, skyPoint } = A;
    // The sun's warmth spilling into the picture.
    const sun = F.sky().sun;
    const p = skyPoint(sun, pose);
    if (p.z > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 900);
      g.addColorStop(0, 'rgba(255,236,170,0.42)');
      g.addColorStop(0.3, 'rgba(255,220,150,0.14)');
      g.addColorStop(1, 'rgba(255,220,150,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
    // Sun on the river: glints, twinkling, while we skim it.
    const water = ease(span(t, 18.8, 19.8)) * (1 - ease(span(t, 23.2, 24.2)));
    if (water > 0) {
      if (!this._glints) {
        const r = rng(91);
        this._glints = Array.from({ length: 70 }, () => ({ x: r() * W, y: mix(0.56, 0.98, r() * r()) * H, ph: r() * 6.28, s: 6 + r() * 22, v: 0.6 + r() * 1.4 }));
      }
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (const gl of this._glints) {
        const tw = Math.max(0, Math.sin(t * 6 * gl.v + gl.ph));
        const a = water * tw * tw;
        if (a < 0.02) continue;
        const x = (gl.x - t * 260 * gl.v) % W;
        const xx = x < 0 ? x + W : x;
        const s = gl.s * (0.6 + tw * 0.6);
        ctx.globalAlpha = a;
        ctx.fillStyle = 'rgba(255,250,225,0.95)';
        ctx.beginPath();
        ctx.moveTo(xx - s, gl.y); ctx.lineTo(xx, gl.y - s * 0.12); ctx.lineTo(xx + s, gl.y); ctx.lineTo(xx, gl.y + s * 0.12); ctx.closePath(); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(xx, gl.y - s * 0.5); ctx.lineTo(xx + s * 0.08, gl.y); ctx.lineTo(xx, gl.y + s * 0.5); ctx.lineTo(xx - s * 0.08, gl.y); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }
    // Seed fluff riding the wind.
    if (!this._fluff) {
      const r = rng(55);
      this._fluff = Array.from({ length: 50 }, () => ({ x: r() * W, y: r() * H, s: 2 + r() * 5, v: 60 + r() * 160, ph: r() * 6.28 }));
    }
    const gust = t > 26 && t < 31 ? 2.6 : 1;
    ctx.save();
    ctx.fillStyle = 'rgba(255,250,232,0.75)';
    const a = ease(span(t, 1.5, 3)) * (1 - ease(span(t, 42, 43)));
    for (const f of this._fluff) {
      const x = ((f.x + t * f.v * gust) % (W + 60) + W + 60) % (W + 60) - 30;
      const yy = (((f.y + Math.sin(t * 0.9 + f.ph) * 40 - t * 6) % H) + H) % H;
      ctx.globalAlpha = a * 0.7;
      ctx.beginPath(); ctx.arc(x, yy, f.s, 0, 6.28); ctx.fill();
    }
    ctx.restore();
  },

  // The tall grass right at the lens, for the slow moment before the gust and
  // the glide after it. It belongs to the world, not to the glass: it rises
  // into the frame as we settle into the field, slides with every turn of the
  // head, streams past as we move forward — the nearer the blade, the faster —
  // and the wind lays it down as it goes over.
  drawNear(A, t, pose) {
    const { ctx, W, H, rng, mix, ease, span } = A;
    const present = ease(span(t, 23.6, 25.0)) * (1 - ease(span(t, 32.4, 34.0)));
    if (!this._blades) {
      const r = rng(812);
      // Near blades, and behind them a dense stand of thinner, farther ones whose
      // tips make a soft ragged horizon of grass — that is what hides the herd.
      const near = Array.from({ length: 150 }, () => {
        const z = 0.35 + r() * 0.65; // 0 far … 1 nearest
        return { x: r() * (W + 600) - 300, base: H * mix(0.66, 1.04, r()), h: H * mix(0.24, 0.6, Math.pow(r(), 0.8)) * mix(0.7, 1.2, z), w: mix(6, 28, z), lean: (r() - 0.35) * 0.3, curl: (r() - 0.5) * 0.5, z, ph: r() * 6.28, hue: r() };
      });
      const far = Array.from({ length: 520 }, () => {
        const z = r() * 0.3;
        return { x: r() * (W + 600) - 300, base: H * mix(0.54, 0.8, r()), h: H * mix(0.16, 0.4, r()), w: mix(3, 9, r()), lean: (r() - 0.4) * 0.35, curl: (r() - 0.5) * 0.6, z, ph: r() * 6.28, hue: r() * 0.7 + 0.15 };
      });
      this._blades = [...far, ...near].sort((a, b) => a.z - b.z);
    }
    // Follow the camera: how far it has come forward and how far it has turned
    // since it entered the grass (frames are rendered in order; a jump back resets).
    const yawOf = (p) => Math.atan2(p.look[0] - p.pos[0], p.look[2] - p.pos[2]);
    const tiltOf = (p) => Math.atan2(p.look[1] - p.pos[1], Math.hypot(p.look[0] - p.pos[0], p.look[2] - p.pos[2]));
    if (!this._track || t < this._track.t || t < 24.0) this._track = { t, pos: pose.pos, yaw: yawOf(pose), tilt: tiltOf(pose), go: 0, turn: 0, rise: 0 };
    const tr = this._track;
    let dy = yawOf(pose) - tr.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    tr.go += Math.hypot(pose.pos[0] - tr.pos[0], pose.pos[2] - tr.pos[2]);
    tr.turn += dy;
    tr.rise += tiltOf(pose) - tr.tilt;
    tr.t = t; tr.pos = pose.pos; tr.yaw = yawOf(pose); tr.tilt = tiltOf(pose);
    if (present <= 0.01) return;
    const focal = H / 2 / Math.tan(((pose.fov ?? 50) * Math.PI) / 360);
    // Before the front reaches us the grass stands; behind it, it lies down.
    const g = this.gust(t);
    const sweep = ease(span(t, 26.2, 29.8));
    const screenFront = mix(-500, W + 500, sweep);
    // Settling into the field: everything comes up from below the frame.
    const settle = ease(span(t, 23.6, 25.0));
    ctx.save();
    for (const b of this._blades) {
      // Parallax: nearer blades rise further, slide further, stream faster.
      const depth = 0.35 + b.z * 1.3;
      const flow = tr.go * 34 * depth;
      const cx = b.x - tr.turn * focal * 0.95 + (b.x - W / 2) * Math.min(1.5, tr.go * 0.02 * depth);
      const base = b.base + flow + (1 - settle) * H * 0.85 * depth - tr.rise * focal * 0.6;
      if (base - b.h > H + 40 || cx < -200 || cx > W + 200) continue;
      const bow = g.amt * ease(span(screenFront - cx, -60, 380)) * 0.94;
      const sway = Math.sin(t * (0.8 + b.z * 0.6) + b.ph) * b.h * 0.06 + Math.sin(t * 2.3 + b.ph * 2) * b.h * 0.012;
      const h = b.h * (1 - 0.74 * bow) * (1 + b.z * Math.min(0.6, tr.go * 0.015));
      const tipX = cx + b.lean * b.h + sway + bow * b.h * 0.8;
      const tipY = base - h;
      const midX = cx + (tipX - cx) * 0.3 + b.curl * b.h * 0.18, midY = base - h * 0.55;
      const grad = ctx.createLinearGradient(0, base, 0, tipY);
      grad.addColorStop(0, `rgba(${Math.round(mix(52, 84, b.hue))},${Math.round(mix(66, 90, b.hue))},${Math.round(mix(28, 42, b.hue))},${0.95 * present})`);
      grad.addColorStop(1, `rgba(${Math.round(mix(176, 210, b.hue))},${Math.round(mix(172, 198, b.hue))},${Math.round(mix(86, 114, b.hue))},${0.9 * present})`);
      ctx.fillStyle = grad;
      ctx.filter = b.z > 0.86 ? 'blur(3px)' : b.z < 0.3 ? 'blur(0.8px)' : 'none';
      ctx.beginPath();
      ctx.moveTo(cx - b.w / 2, base);
      ctx.quadraticCurveTo(midX - b.w * 0.25, midY, tipX, tipY);
      ctx.quadraticCurveTo(midX + b.w * 0.25, midY, cx + b.w / 2, base);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  },

  // Couplets in the sky, torn away by the wind — as in chile.js.
  drawLines(A, t, LINES) {
    return window.__screenplays.chile.drawLines(A, t, LINES);
  },

  // ---------------------------------------------------------------- score
  // Light and bright, in D major at 100 beats a minute: a guzheng's arpeggios,
  // a dizi singing over them, glockenspiel sparkle, a hand drum and a shaker
  // that come in as we fly, a hush before the gust, and the whole band at once
  // when the grass goes down.
  score(A) {
    const { oc, noise, rnd, bus, master, conv, TOTAL } = A;
    const B = 0.6; // one beat
    const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
    const n = { D3: 50, Fs3: 54, G3: 55, A3: 57, B3: 59, D4: 62, E4: 64, Fs4: 66, G4: 67, A4: 69, B4: 71, Cs5: 73, D5: 74, E5: 76, Fs5: 78, G5: 79, A5: 81, B5: 83, D6: 86 };

    const zheng = (t, m, v = 0.5) => {
      const f = hz(m);
      const g = oc.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v * 0.12, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0004, t + 1.4);
      const lp = oc.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(f * 9, t); lp.frequency.exponentialRampToValueAtTime(f * 2.2, t + 0.5);
      [['triangle', 1, 1], ['sine', 2, 0.5], ['sine', 3, 0.22]].forEach(([type, mul, a]) => {
        const o = oc.createOscillator(); o.type = type;
        o.frequency.setValueAtTime(f * mul * 1.012, t); o.frequency.exponentialRampToValueAtTime(f * mul, t + 0.05);
        const og = oc.createGain(); og.gain.value = a;
        o.connect(og); og.connect(lp); o.start(t); o.stop(t + 1.5);
      });
      const p = oc.createStereoPanner(); p.pan.value = (m % 7) / 7 - 0.4;
      lp.connect(g); g.connect(p); p.connect(bus);
    };
    const dizi = (t, m, d, v = 0.5) => {
      const f = hz(m);
      const o = oc.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(f * 0.985, t); o.frequency.linearRampToValueAtTime(f, t + 0.06);
      const vib = oc.createOscillator(); vib.frequency.value = 6;
      const vg = oc.createGain(); vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(f * 0.009, t + Math.min(d, 0.5));
      vib.connect(vg); vg.connect(o.frequency);
      const o2 = oc.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * 2; const g2 = oc.createGain(); g2.gain.value = 0.18;
      const o3 = oc.createOscillator(); o3.type = 'sine'; o3.frequency.value = f * 3; const g3 = oc.createGain(); g3.gain.value = 0.07;
      const g = oc.createGain();
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v * 0.09, t + 0.04);
      g.gain.setValueAtTime(v * 0.09, t + Math.max(0.05, d - 0.08)); g.gain.linearRampToValueAtTime(0, t + d);
      o.connect(g); o2.connect(g2); g2.connect(g); o3.connect(g3); g3.connect(g); g.connect(bus);
      [o, o2, o3, vib].forEach((x) => { x.start(t); x.stop(t + d + 0.05); });
      noise(t, t + Math.min(d, 0.3), 'bandpass', f * 3, 2, v * 0.012, 0.01, 0.2, bus);
    };
    const glock = (t, m, v = 0.4) => {
      const f = hz(m);
      [[1, 1, 1.6], [2.76, 0.3, 0.5], [5.4, 0.1, 0.25]].forEach(([mul, a, d]) => {
        const o = oc.createOscillator(); o.type = 'sine'; o.frequency.value = f * mul;
        const g = oc.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v * a * 0.06, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0002, t + d);
        o.connect(g); g.connect(bus); o.start(t); o.stop(t + d + 0.05);
      });
    };
    const drum = (t, v = 0.5) => {
      const o = oc.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(62, t + 0.18);
      const g = oc.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v * 0.5, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0003, t + 0.32);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.35);
      noise(t, t + 0.05, 'bandpass', 900, 1, v * 0.05, 0.002, 0.045);
    };
    const shaker = (t, v = 0.3) => noise(t, t + 0.07, 'highpass', 7000, 0.7, v * 0.05, 0.01, 0.05, master, (rnd() - 0.5) * 0.4);
    const chord = (t0, t1, ms, gain) => {
      ms.forEach((m) => {
        const o = oc.createOscillator(); o.type = 'triangle'; o.frequency.value = hz(m);
        const lp = oc.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1600;
        const g = oc.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(gain / ms.length, t0 + 0.5); g.gain.setValueAtTime(gain / ms.length, t1 - 0.6); g.gain.linearRampToValueAtTime(0, t1);
        o.connect(lp); lp.connect(g); g.connect(bus); o.start(t0); o.stop(t1 + 0.05);
      });
    };

    // Wind under it all; the gust a real rush.
    const wind = noise(0.05, TOTAL, 'lowpass', 600, 0.6, 0.03, 1.2, 3);
    wind.g.gain.setTargetAtTime(0.012, 23.8, 0.4);
    wind.g.gain.setTargetAtTime(0.13, 26.0, 0.5);
    wind.fl.frequency.setTargetAtTime(1100, 26.0, 0.6);
    wind.g.gain.setTargetAtTime(0.03, 30.0, 1.2);
    wind.fl.frequency.setTargetAtTime(600, 30.0, 1.2);
    // A whoosh on each big move of the camera.
    [[3.0, 2.2], [9.4, 2.2], [15.2, 3.0], [32.6, 3.4]].forEach(([t, d]) => {
      const w = noise(t, t + d, 'bandpass', 500, 0.8, 0.07, d * 0.6, d * 0.4);
      w.fl.frequency.setValueAtTime(400, t); w.fl.frequency.exponentialRampToValueAtTime(1800, t + d * 0.6); w.fl.frequency.exponentialRampToValueAtTime(700, t + d);
    });

    // Intro: sparkle, and the first breath of the song.
    [n.D5, n.Fs5, n.A5, n.D6].forEach((m, i) => glock(0.4 + i * 0.15, m, 0.6));
    chord(0.3, 3.8, [n.D3, n.A3, n.Fs4], 0.05);

    // The harmony, a bar (four beats) per chord: D – Bm – G – A, round and round.
    const prog = [
      [n.D4, n.Fs4, n.A4, n.D5],
      [n.B3, n.D4, n.Fs4, n.B4],
      [n.G3, n.B3, n.D4, n.G4],
      [n.A3, n.Cs5 - 12, n.E4, n.A4],
    ];
    const bar = 4 * B;
    // Guzheng eighths through the flight; thinning in the hush; back for the herd.
    const arp = (t0, t1, vel) => {
      for (let t = t0, k = 0; t < t1 - 0.01; t += B / 2, k++) {
        const c = prog[Math.floor((t - 3.6) / bar + 400) % 4];
        const pat = [0, 2, 3, 2, 1, 2, 3, 2];
        zheng(t, c[pat[k % 8]], vel * (k % 2 ? 0.7 : 1));
      }
    };
    arp(3.6, 23.8, 0.55);
    arp(26.4, 38.4, 0.65);
    for (let t = 3.6; t < 23.8; t += bar) chord(t, t + bar, prog[Math.floor((t - 3.6) / bar) % 4].map((m) => m - 12), 0.04);
    for (let t = 26.4; t < 38.4; t += bar) chord(t, t + bar, prog[Math.floor((t - 3.6) / bar + 400) % 4].map((m) => m - 12), 0.06);

    // Percussion comes in as we fly up; out for the hush; back, full, for the herd.
    for (let t = 9.6; t < 23.6; t += B) { drum(t, (Math.round((t - 9.6) / B) % 4 === 0) ? 0.5 : 0.25); shaker(t + B / 2, 0.3); }
    for (let t = 26.4; t < 38.4; t += B) { drum(t, (Math.round((t - 26.4) / B) % 4 === 0) ? 0.65 : 0.3); shaker(t + B / 2, 0.35); shaker(t + B / 4, 0.18); }

    // The dizi tune: [beat offset, note, beats].
    const tune = (t0, notes, v = 0.55) => notes.forEach(([b, m, d]) => dizi(t0 + b * B, m, d * B * 0.95, v));
    const A1 = [[0, n.Fs5, 1], [1, n.A5, 1], [2, n.B5, 2], [4, n.A5, 1], [5, n.Fs5, 1], [6, n.E5, 2], [8, n.D5, 1], [9, n.E5, 1], [10, n.Fs5, 1], [11, n.A5, 1], [12, n.E5, 4]];
    const A2 = [[0, n.Fs5, 1], [1, n.A5, 1], [2, n.B5, 1.5], [3.5, n.D6, 0.5], [4, n.B5, 1], [5, n.A5, 1], [6, n.Fs5, 2], [8, n.E5, 1], [9, n.Fs5, 1], [10, n.E5, 1], [11, n.Cs5, 1], [12, n.D5, 4]];
    tune(3.6, A1);
    tune(3.6 + 16 * B, A2);
    // The river: higher, brighter.
    tune(3.6 + 32 * B - 0.0, [[0, n.A5, 1], [1, n.B5, 1], [2, n.D6, 2], [4, n.B5, 1], [5, n.A5, 1], [6, n.Fs5, 2]]);
    // The hush before the gust: one long held note.
    dizi(23.9, n.A5, 2.3, 0.4);
    // The herd: the tune, full, then home.
    tune(26.4, A1, 0.65);
    tune(26.4 + 16 * B, [[0, n.Fs5, 1], [1, n.A5, 1], [2, n.B5, 2], [4, n.A5, 1], [5, n.Fs5, 1], [6, n.E5, 1], [7, n.Fs5, 1], [8, n.D5, 6]], 0.6);
    // Sparkle at the reveal, and on the seal.
    [n.A5, n.D6, n.Fs5, n.A5, n.D6].forEach((m, i) => glock(26.4 + i * 0.12, m, 0.7));
    noise(26.2, 27.6, 'highpass', 5000, 0.6, 0.05, 0.05, 1.2);
    [n.D5, n.Fs5, n.A5, n.D6].forEach((m, i) => glock(38.4 + i * 0.14, m, 0.6));
    // The close: the song whole, a last chord, a last sparkle.
    chord(38.4, 44.6, [n.D3, n.A3, n.D4, n.Fs4, n.A4], 0.08);
    zheng(38.4, n.D4, 0.6); zheng(38.7, n.A4, 0.5); zheng(39.0, n.D5, 0.5); zheng(39.3, n.Fs5, 0.45);
    dizi(39.6, n.A5, 1.2, 0.45); dizi(40.8, n.Fs5, 1.2, 0.45); dizi(42.0, n.D5, 2.6, 0.45);
    glock(44.0, n.D6, 0.4);
  },
};
