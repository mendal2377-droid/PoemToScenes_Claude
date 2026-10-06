/**
 * 鸟鸣涧 — Wang Wei. A spring night so still you can hear osmanthus fall.
 *
 * One unbroken take, 72 seconds, and slow: the poem is about noticing, so the
 * camera gives every place time to be lived in before it moves on.
 *
 *    0–20  人闲桂花落  under the osmanthus, looking up through it as the ink
 *                      drop opens; then down, slowly, to the man sitting idle
 *                      beneath it, the small gold flowers falling.
 *   20–35  夜静春山空  a slow turn and rise from the tree to the empty valley
 *                      and the dark mountain at its head.
 *   35–49  月出惊山鸟  almost still: the moon comes up over the ridge, and the
 *                      birds it wakes cross its face.
 *   49–61  时鸣春涧中  down into the ravine, to the brook; a call, and its echo.
 *   61–72  the crane up into the night, the poem written into the sky in
 *          silver, 王维之印, paper.
 */
window.__screenplays = window.__screenplays || {};

window.__screenplays.niaoming = {
  name: 'reel-niaoming',
  scene: 'niaoming',
  total: 72,
  seed: 715,
  paper: '#e2e3da',
  textInk: '#efeee6',
  cover: 64.6,
  author: '王维',
  title: { text: '鸟鸣涧', at: 2.8, dur: 2.0, out: 12.5, x: 846, y: 240, size: 100 },
  column: { x: 118, y: 300, size: 118 },
  lines: [
    { zh: '人闲桂花落', en: 'A man at rest; the osmanthus falls.', w: [6.2, 4.4], show: [6.2, 19.8] },
    { zh: '夜静春山空', en: 'The night is still; the spring hills, empty.', w: [21.4, 4.4], show: [21.4, 34.2] },
    { zh: '月出惊山鸟', en: 'The moon comes out and startles the mountain birds —', w: [35.6, 4.4], show: [35.6, 48.6] },
    { zh: '时鸣春涧中', en: 'now and then, a call in the spring ravine.', w: [50.2, 4.4], show: [50.2, 61.2] },
  ],
  final: { at: 61.8, sealAt: 64.8, out: 68.9, x0: 742, dx: 132, y: 300, size: 98, credit: 'Birdsong Ravine  ·  Wang Wei, 701–761' },
  end: { paper: 68.4, card: 69.4 },

  setup(F) {
    F.air({ wind: 0.1, mist: 0.55 });
    F.clock(19.3);
  },

  // The moon is below the ridge until the third line, then rises over it.
  world(F, t) {
    const k = Math.max(0, Math.min(1, (t - 33.5) / 12.5));
    const e = k * k * (3 - 2 * k);
    F.clock(19.3 + 1.3 * e);
  },

  // Lift the night just enough to see into it: moonlight, not murk.
  grade: (t) => 'brightness(1.34) contrast(1.16) saturate(1.05)',

  camera: ({ G }) => [
    // under the canopy, looking up through the leaves as the drop opens
    [0.0, [-23.5, 3.9, 44.5], [-27, 13, 31], 50],
    [6.5, [-22.8, 3.7, 45.6], [-26.5, 10, 32.5], 49],
    // down and back, slowly: the man sitting idle beneath it
    [14.5, [-17.5, 3.3, 47.8], [-23.5, 3.1, 40.5], 43],
    [19.5, [-15.6, 3.4, 48.6], [-21.6, 3.0, 40.0], 42],
    // a slow turn and rise to the empty valley and its mountain
    [26.5, [-10, 6.5, 54], [-4, 6, 8], 44],
    [33.5, [-6, 10.5, 58], [2, 12, -60], 46],
    // almost still; the gaze lifts to meet the moon coming over the ridge
    // (aimed from its measured direction, so it rises into the upper right)
    [39.5, [-4.5, 10.8, 55], [7.7, 39.4, -40.8], 46],
    [46.5, [-2.5, 10.6, 51.5], [9.7, 39.2, -44.3], 45],
    // down into the ravine, to the brook
    [52.5, [-0.5, 9, 46], [5, 3, 0], 44],
    [58.0, [3, 6.6, 36], [3, -1, 10], 42],
    [61.5, [3.4, 6.2, 33.5], [3, -1.6, 8], 41],
    // and up into the night for the poem: the moon low left, the sky above for the words
    [66.0, [4, 13, 46], [18.2, 58.9, -41.7], 46],
    [69.0, [6, 20, 52], [20.2, 65.9, -35.7], 46],
    [72.0, [6.4, 21, 53], [20.6, 66.9, -34.7], 46],
  ],

  // ------------------------------------------------------------- overlays
  // Drawn over the graded picture: the moon's glow, and the birds it wakes.
  drawWorld(A, t, pose) {
    const { ctx, F, skyPoint, span, ease, mix } = A;
    const m = F.sky().moon;
    const p = skyPoint(m, pose);
    const up = ease(span(m[1], 0.1, 0.32));
    if (p.z > 0 && up > 0) {
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 520);
      g.addColorStop(0, `rgba(236,234,220,${0.22 * up})`);
      g.addColorStop(0.35, `rgba(220,222,214,${0.08 * up})`);
      g.addColorStop(1, 'rgba(220,222,214,0)');
      ctx.fillStyle = g;
      ctx.fillRect(p.x - 520, p.y - 520, 1040, 1040);
    }
    // 惊山鸟 — six of them, up out of the trees and across the moon.
    if (t > 40 && t < 48.5 && p.z > 0) {
      for (let i = 0; i < 6; i++) {
        const k = span(t, 40.2 + i * 0.35, 46.2 + i * 0.4);
        if (k <= 0 || k >= 1) continue;
        const e = ease(k);
        const x = mix(p.x - 330 + i * 46, p.x + 300 + i * 70, e) + Math.sin(k * 7 + i) * 18;
        const y = mix(p.y + 520 - i * 30, p.y - 420 - i * 40, e) + Math.sin(k * 11 + i * 2) * 10;
        const s = mix(1.05, 0.45, e) * (0.85 + (i % 3) * 0.12);
        const flap = Math.sin(t * (13 + i) + i);
        ctx.save();
        ctx.globalAlpha = Math.min(1, k * 8) * (1 - ease(span(k, 0.8, 1)));
        ctx.translate(x, y); ctx.scale(s, s);
        ctx.strokeStyle = '#0c0e14'; ctx.lineCap = 'round'; ctx.lineWidth = 5;
        for (const side of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(side * 20, -14 - flap * 16, side * 42, -4 - flap * 24);
          ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(0, 2, 3.6, 0, 6.28); ctx.fillStyle = '#0c0e14'; ctx.fill();
        ctx.restore();
      }
    }
  },

  // 桂花 — the small gold flowers, falling past the lens all through the night;
  // thickest under the tree, a few always.
  drawNear(A, t, pose) {
    const { ctx, W, H, rng, mix, ease, span } = A;
    if (!this._flowers) {
      const r = rng(4417);
      this._flowers = Array.from({ length: 90 }, () => ({ x: r() * W, y: r() * H, z: Math.pow(r(), 1.5), ph: r() * 6.28, w: 0.3 + r() * 0.7, spin: (r() - 0.5) * 2 }));
      const mkS = (blur) => {
        const c = document.createElement('canvas'); c.width = c.height = 64;
        const x = c.getContext('2d');
        x.translate(32, 32);
        if (blur) {
          const g = x.createRadialGradient(0, 0, 0, 0, 0, 30);
          g.addColorStop(0, 'rgba(240,206,110,0.9)'); g.addColorStop(0.5, 'rgba(232,192,92,0.45)'); g.addColorStop(1, 'rgba(232,192,92,0)');
          x.fillStyle = g; x.fillRect(-32, -32, 64, 64);
        } else {
          x.shadowColor = 'rgba(255,214,120,0.9)'; x.shadowBlur = 10;
          x.fillStyle = '#efc764';
          for (let k = 0; k < 4; k++) { x.save(); x.rotate((k * Math.PI) / 2); x.beginPath(); x.ellipse(0, -9, 6, 9, 0, 0, 6.28); x.fill(); x.restore(); }
          x.fillStyle = '#c98f2a'; x.beginPath(); x.arc(0, 0, 3, 0, 6.28); x.fill();
        }
        return c;
      };
      this._sharp = mkS(false);
      this._soft = mkS(true);
    }
    // How many are falling: many under the tree, a few always, a last drift at the end.
    const density = mix(0.32, 1, 1 - ease(span(t, 18, 26))) * (1 - ease(span(t, 68.2, 69.4)));
    const opening = ease(span(t, 1.0, 3.2));
    ctx.save();
    this._flowers.forEach((f, i) => {
      if (i / this._flowers.length > density) return;
      const size = mix(10, 54, f.z * f.z);
      const fall = mix(22, 90, f.z);
      const y = ((f.y + t * fall) % (H + 120)) - 60;
      const x = ((f.x + Math.sin(t * f.w + f.ph) * mix(14, 60, f.z) + t * mix(4, 16, f.z)) % (W + 80) + W + 80) % (W + 80) - 40;
      ctx.globalAlpha = opening * (f.z > 0.7 ? 0.55 : 0.92);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(t * f.spin + f.ph);
      ctx.drawImage(f.z > 0.7 ? this._soft : this._sharp, -size / 2, -size / 2, size, size);
      ctx.restore();
    });
    ctx.restore();
  },

  // ---------------------------------------------------------------- score
  // Near-silence. A bamboo flute and a qin in the 宫 mode; the brook; one bird
  // and its echo; and, while the man sits idle, the sound of osmanthus landing —
  // tiny glassy pings, a sound too small to hear, heard.
  score(A) {
    const { noise, qin, fan, xiao, pad, drone, ping, rnd, oc, conv, master, TOTAL } = A;
    const N = { C2: 65.41, G2: 98, C3: 130.81, D3: 146.83, E3: 164.81, G3: 196, A3: 220, C4: 261.63, D4: 293.66, E4: 329.63, G4: 392, A4: 440, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99 };

    // The night: a breath of wind, the brook getting nearer as we go down to it.
    noise(0.1, TOTAL, 'bandpass', 320, 0.5, 0.035, 2, 3);
    const brook = noise(0.5, TOTAL, 'bandpass', 1700, 0.8, 0.012, 4, 3, master, 0.2);
    brook.g.gain.setValueAtTime(0.012, 46);
    brook.g.gain.linearRampToValueAtTime(0.05, 58);
    brook.g.gain.setValueAtTime(0.05, 62);
    brook.g.gain.linearRampToValueAtTime(0.02, 68);
    for (let t = 1; t < TOTAL; t += 0.35) brook.fl.frequency.setTargetAtTime(1400 + rnd() * 900, t, 0.12);

    // Osmanthus landing.
    const bells = [2093, 2349, 2637, 3136, 3520];
    for (let t = 4; t < 66; t += t < 22 ? 1.1 + rnd() * 1.6 : 3 + rnd() * 4) ping(t, bells[Math.floor(rnd() * bells.length)], t < 22 ? 0.03 : 0.018, (rnd() - 0.5) * 0.8);

    // Title.
    fan(2.8, N.G4, 0.7, 6); fan(3.7, N.D5, 0.45, 6);
    // 人闲桂花落
    qin(6.2, N.C3, 0.75, 7);
    xiao(8.2, N.E4, 2.4, 0.55, 1); xiao(10.7, N.G4, 1.6, 0.5); xiao(12.4, N.A4, 3.6, 0.5, 1); xiao(16.3, N.G4, 2.6, 0.38);
    // 夜静春山空 — long tones, and room between them.
    qin(21.4, N.G2, 0.65, 8);
    xiao(23.0, N.D4, 3.2, 0.48, 1); xiao(26.6, N.C4, 2.2, 0.42); xiao(29.2, N.A3, 4.4, 0.4, 1);
    // 月出惊山鸟 — the ground note under the rising moon, an opening chord,
    // and then the birds: wings, and one cry.
    drone(33.5, 62, N.C2, 0.06);
    pad(35.5, 49, [N.C3, N.G3, N.E4, N.G4], 0.045);
    qin(35.6, N.E3, 0.6, 6); fan(38.0, N.C5, 0.45, 6);
    for (let i = 0; i < 26; i++) {
      const t = 40.3 + rnd() * 2.6;
      noise(t, t + 0.06 + rnd() * 0.05, 'bandpass', 700 + rnd() * 600, 1.2, 0.05 * (1 - (t - 40.3) / 3), 0.005, 0.04, master, (rnd() - 0.5) * 0.8);
    }
    const call = (t, v, pan, wet = false) => {
      [[0, 2650, 2250], [0.22, 2380, 1950]].forEach(([dt, f0, f1]) => {
        const o = oc.createOscillator(); o.type = 'sine';
        o.frequency.setValueAtTime(f0, t + dt); o.frequency.exponentialRampToValueAtTime(f1, t + dt + 0.16);
        const vib = oc.createOscillator(); vib.frequency.value = 28;
        const vg = oc.createGain(); vg.gain.value = 60; vib.connect(vg); vg.connect(o.frequency);
        const g = oc.createGain(); g.gain.setValueAtTime(0, t + dt); g.gain.linearRampToValueAtTime(v, t + dt + 0.02); g.gain.exponentialRampToValueAtTime(0.0002, t + dt + 0.2);
        const p = oc.createStereoPanner(); p.pan.value = pan;
        o.connect(g); g.connect(p); p.connect(conv); if (!wet) p.connect(master);
        [o, vib].forEach((x) => { x.start(t + dt); x.stop(t + dt + 0.25); });
      });
    };
    call(41.1, 0.05, 0.3);
    qin(42.4, N.G3, 0.55, 6); qin(44.2, N.E3, 0.5, 7, 0.97);
    // 时鸣春涧中 — the call again, further off; its echo down the ravine.
    qin(50.2, N.E4, 0.6, 6);
    call(51.6, 0.035, -0.4);
    call(53.1, 0.02, 0.5, true);
    xiao(52.8, N.A4, 2.0, 0.42, 1); xiao(55.0, N.G4, 1.6, 0.4); xiao(56.8, N.E4, 3.4, 0.42, 1);
    call(58.4, 0.016, -0.2, true);
    // The poem whole, the seal, the end.
    fan(61.8, N.C5, 0.55, 7); qin(65.0, N.C3, 0.6, 7); fan(66.4, N.G5, 0.35, 6);
  },
};
