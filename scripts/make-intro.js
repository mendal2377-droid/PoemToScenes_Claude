/**
 * The film about the app (public/film/intro.mp4).
 *
 * Paste into the console of a page on the site's own origin (the home page, on a
 * production build), with mp4-muxer loaded as a classic script so `Mp4Muxer` is a
 * global, then `await __makeIntro('/api/film?name=')` (any endpoint that accepts
 * a POSTed body; or leave it out and take `window.__intro`).
 *
 * Everything in it is made from the app: each scene is loaded in a hidden frame in
 * film mode (see src/three/Film.tsx) and stepped frame by frame; typography,
 * bilingual subtitles and the poem inscription are drawn over it in ink on a 2D
 * canvas; the music is synthesised offline with Web Audio. Video is encoded with
 * WebCodecs (H.264), audio with AAC, and the two are muxed into one mp4.
 */
window.__makeIntro = async (upload) => {
  const W = 1280, H = 720, FPS = 30, SR = 48000;
  const PAPER = '#efe4c8', INK = '#26262e', SEAL = '#b4523c';
  const KAI = '"Kaiti SC","STKaiti","KaiTi","楷体","Noto Serif CJK SC",serif';
  const LATIN = '"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif';
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const clamp01 = (t) => Math.max(0, Math.min(1, t));
  const ease = (t) => { t = clamp01(t); return t * t * (3 - 2 * t); };
  const job = (window.__job = { done: false, err: null, frames: 0, total: 0, phase: '', encErr: null });

  // ------------------------------------------------------------- the timeline
  const P = { title: 7, s1: 12.8, s2: 9.4, s3: 6.8, s4: 12.4, montage: 9.45, end: 6.5 };
  const starts = {};
  let acc = 0;
  for (const k of Object.keys(P)) { starts[k] = acc; acc += P[k]; }
  const TOTAL = acc;
  job.total = Math.round(TOTAL * FPS);

  // -------------------------------------------------------------- the canvas
  const off = document.createElement('canvas');
  off.width = W; off.height = H;
  const ctx = off.getContext('2d');

  function text(str, x, y, o = {}) {
    const { font = KAI, size = 30, color = INK, align = 'center', alpha = 1, spacing = 0, shadow = null, italic = false, base = 'alphabetic', weight = '' } = o;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.font = `${italic ? 'italic ' : ''}${weight} ${size}px ${font}`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = base;
    ctx.letterSpacing = spacing + 'px';
    if (shadow) { ctx.shadowColor = shadow.c; ctx.shadowBlur = shadow.b; ctx.shadowOffsetY = shadow.y || 0; }
    ctx.fillText(str, align === 'center' ? x + spacing / 2 : x, y);
    ctx.restore();
  }
  function vertical(str, x, y, size, color, step, alpha = 1, weight = '') {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.font = `${weight} ${size}px ${KAI}`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    [...str].forEach((c, i) => ctx.fillText(c, x, y + i * step));
    ctx.restore();
  }
  function paper() {
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.95);
    g.addColorStop(0, 'rgba(200,180,140,0)');
    g.addColorStop(1, 'rgba(170,148,105,0.4)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
  function dip(a) {
    if (a <= 0) return;
    ctx.fillStyle = `rgba(239,228,200,${ease(a)})`;
    ctx.fillRect(0, 0, W, H);
  }
  function subtitle(zh, en, a) {
    if (a <= 0) return;
    const g = ctx.createLinearGradient(0, H - 250, 0, H);
    g.addColorStop(0, 'rgba(18,16,12,0)');
    g.addColorStop(1, `rgba(18,16,12,${0.62 * a})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, H - 250, W, 250);
    text(zh, W / 2, H - 108, { size: 46, color: '#f8f1de', spacing: 8, alpha: a, shadow: { c: 'rgba(0,0,0,.55)', b: 10, y: 2 } });
    text(en, W / 2, H - 62, { font: LATIN, size: 23, italic: true, color: '#f1e9d2', alpha: a * 0.92, spacing: 0.4, shadow: { c: 'rgba(0,0,0,.6)', b: 8, y: 1 } });
  }
  function chapter(n, zh, en, a) {
    if (a <= 0) return;
    const numerals = ['壹', '贰', '叁', '肆', '伍', '陆'];
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = SEAL;
    ctx.fillRect(56, 48, 34, 34);
    ctx.restore();
    text(numerals[n - 1], 73, 66, { size: 22, color: '#f6ecd6', alpha: a, base: 'middle' });
    text(zh, 108, 74, { size: 32, color: '#f8f1de', align: 'left', spacing: 5, alpha: a, shadow: { c: 'rgba(0,0,0,.6)', b: 10, y: 1 } });
    text(en, 108, 104, { font: LATIN, size: 18, color: '#f1e9d2', align: 'left', spacing: 1.2, italic: true, alpha: a * 0.95, shadow: { c: 'rgba(0,0,0,.6)', b: 8 } });
  }
  function inscription(title, author, lines, cur, a) {
    if (a <= 0) return;
    const x0 = W - 44 - 372, y0 = 46, w = 372, h = 272;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.fillStyle = 'rgba(239,228,200,0.8)';
    ctx.fillRect(x0, y0, w, h);
    ctx.restore();
    const right = x0 + w;
    vertical(title, right - 34, y0 + 60, 30, INK, 40, a);
    ctx.save(); ctx.globalAlpha *= a * 0.5; ctx.strokeStyle = 'rgba(38,38,46,.4)'; ctx.beginPath(); ctx.moveTo(right - 68, y0 + 24); ctx.lineTo(right - 68, y0 + h - 24); ctx.stroke(); ctx.restore();
    lines.forEach((ln, k) => {
      const x = right - 98 - k * 38;
      const on = k === cur;
      vertical(ln, x, y0 + 52, 23, on ? SEAL : INK, 30, a * (on ? 1 : 0.45), on ? 'bold' : '');
    });
    text(author, right - 34, y0 + h - 34, { size: 15, color: 'rgba(38,38,46,.65)', alpha: a, spacing: 2 });
  }
  function pills(labels, cur, x, y, a) {
    labels.forEach((lb, i) => {
      const w = 62, gap = 8, x0 = x - (labels.length - i) * (w + gap) + gap;
      const on = i === cur;
      ctx.save();
      ctx.globalAlpha *= a;
      ctx.fillStyle = on ? INK : 'rgba(239,228,200,0.86)';
      ctx.beginPath(); ctx.roundRect(x0, y, w, 34, 17); ctx.fill();
      ctx.restore();
      text(lb, x0 + w / 2, y + 23, { size: 17, color: on ? '#f6ecd6' : INK, alpha: a, spacing: 2 });
    });
  }
  const SHICHEN = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  function shichen(c) {
    c = ((c % 24) + 24) % 24;
    const n = SHICHEN[Math.floor(((c + 1) % 24) / 2)] + '时';
    const into = (((c + 1) % 24) % 2) / 2;
    return n + (into < 0.34 ? '初' : into < 0.67 ? '正' : '末');
  }
  const hhmm = (c) => { const h = Math.floor(c), m = Math.floor((c - h) * 60); return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'); };

  // ---------------------------------------------------------------- encoding
  const S = { frame: 0 };
  if (!window.Mp4Muxer) throw new Error('load mp4-muxer first');
  const muxer = new Mp4Muxer.Muxer({
    target: new Mp4Muxer.ArrayBufferTarget(),
    video: { codec: 'avc', width: W, height: H },
    audio: { codec: 'aac', numberOfChannels: 2, sampleRate: SR },
    fastStart: 'in-memory',
  });
  const venc = new VideoEncoder({ output: (c, m) => muxer.addVideoChunk(c, m), error: (e) => { job.encErr = String(e); } });
  venc.configure({ codec: 'avc1.4d0020', width: W, height: H, bitrate: 1800000, framerate: FPS });

  // ------------------------------------------------------------------- audio
  job.phase = 'score';
  const aChunks = [];
  {
    const sr = SR, len = Math.ceil((TOTAL + 1) * sr);
    const oc = new OfflineAudioContext(2, len, sr);
    let seed = 20240921;
    const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    const master = oc.createGain();
    const comp = oc.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 3;
    master.connect(comp); comp.connect(oc.destination);
    master.gain.setValueAtTime(0, 0);
    master.gain.linearRampToValueAtTime(1.5, 2);
    master.gain.setValueAtTime(1.5, TOTAL - 3.2);
    master.gain.linearRampToValueAtTime(0, TOTAL + 0.6);

    const irLen = Math.floor(sr * 2.8), ir = oc.createBuffer(2, irLen, sr);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < irLen; i++) d[i] = (rnd() * 2 - 1) * Math.pow(1 - i / irLen, 2.6); }
    const conv = oc.createConvolver(); conv.buffer = ir;
    const wet = oc.createGain(); wet.gain.value = 0.5; conv.connect(wet); wet.connect(master);
    const dl = oc.createDelay(1); dl.delayTime.value = 0.42;
    const fb = oc.createGain(); fb.gain.value = 0.3; dl.connect(fb); fb.connect(dl);
    const dlOut = oc.createGain(); dlOut.gain.value = 0.28; dl.connect(dlOut); dlOut.connect(conv); dlOut.connect(master);
    const bus = oc.createGain(); const dry = oc.createGain(); dry.gain.value = 0.85;
    bus.connect(dry); dry.connect(master); bus.connect(conv); bus.connect(dl);

    const nb = oc.createBuffer(1, sr * 2, sr); { const d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = rnd() * 2 - 1; }
    const noise = (t0, t1, type, freq, q, gain, fi = 1, fo = 1, dest = master) => {
      const s = oc.createBufferSource(); s.buffer = nb; s.loop = true;
      const f = oc.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
      const g = oc.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(gain, t0 + fi); g.gain.setValueAtTime(gain, Math.max(t0 + fi, t1 - fo)); g.gain.linearRampToValueAtTime(0, t1);
      s.connect(f); f.connect(g); g.connect(dest); s.start(t0); s.stop(t1 + 0.05);
      return g;
    };
    const pluck = (t, f, v = 0.6, d = 3.2) => {
      const o = oc.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f;
      const o2 = oc.createOscillator(); o2.type = 'triangle'; o2.frequency.value = f * 2.004;
      const g2 = oc.createGain(); g2.gain.value = 0.3;
      const lp = oc.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 0.7;
      lp.frequency.setValueAtTime(Math.min(9000, f * 10), t); lp.frequency.exponentialRampToValueAtTime(f * 1.5, t + 0.6);
      const g = oc.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v * 0.2, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0007, t + d);
      o.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(g); g.connect(bus);
      o.start(t); o2.start(t); o.stop(t + d + 0.1); o2.stop(t + d + 0.1);
      // the pick
      const n = oc.createBufferSource(); n.buffer = nb;
      const hp = oc.createBiquadFilter(); hp.type = 'bandpass'; hp.frequency.value = Math.min(5000, f * 6); hp.Q.value = 1;
      const ng = oc.createGain(); ng.gain.setValueAtTime(v * 0.12, t); ng.gain.exponentialRampToValueAtTime(0.0005, t + 0.05);
      n.connect(hp); hp.connect(ng); ng.connect(bus); n.start(t); n.stop(t + 0.08);
    };
    const bell = (t, f, v = 0.5) => {
      [[1, 0.5, 5.5], [2.76, 0.22, 3.6], [5.4, 0.1, 2.2], [8.93, 0.05, 1.4]].forEach(([m, a, d]) => {
        const o = oc.createOscillator(); o.type = 'sine'; o.frequency.value = f * m;
        const g = oc.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v * a * 0.3, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0005, t + d);
        o.connect(g); g.connect(bus); o.start(t); o.stop(t + d + 0.1);
      });
    };
    const drone = (f, gain) => {
      const o = oc.createOscillator(); o.type = 'triangle'; o.frequency.value = f;
      const lp = oc.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420;
      const g = oc.createGain(); g.gain.setValueAtTime(0, 0); g.gain.linearRampToValueAtTime(gain, 4);
      for (let t = 4; t < TOTAL; t += 6) { g.gain.linearRampToValueAtTime(gain * (0.6 + rnd() * 0.5), t + 3); g.gain.linearRampToValueAtTime(gain, t + 6); }
      o.connect(lp); lp.connect(g); g.connect(master); o.start(0); o.stop(TOTAL + 1);
    };

    // D pentatonic: D E F# A B, three octaves.
    const N = { D2: 73.42, A2: 110, B2: 123.47, D3: 146.83, E3: 164.81, Fs3: 185, A3: 220, B3: 246.94, D4: 293.66, E4: 329.63, Fs4: 369.99, A4: 440, B4: 493.88, D5: 587.33, E5: 659.25, Fs5: 739.99 };
    const scale = [N.D3, N.E3, N.Fs3, N.A3, N.B3, N.D4, N.E4, N.Fs4, N.A4, N.B4, N.D5, N.E5, N.Fs5];

    drone(N.D2, 0.05); drone(N.A2, 0.03);
    noise(0.5, TOTAL, 'bandpass', 520, 0.6, 0.02, 4, 4);                            // wind
    noise(starts.s1, starts.s1 + P.s1 + 1, 'bandpass', 1900, 1.4, 0.014, 2, 2);      // a stream, in the first landscape
    // title
    bell(0.5, N.D4, 0.7); pluck(2.3, N.A3, 0.5); pluck(3.7, N.D4, 0.5); pluck(5.1, N.Fs4, 0.5); pluck(6.2, N.E4, 0.45);
    // walking melody through the chapters
    const seg = (a, b, step, lo, hi, vel) => {
      let idx = Math.floor((lo + hi) / 2);
      for (let t = a; t < b; t += step * (0.85 + rnd() * 0.35)) {
        if (rnd() < 0.14) continue;
        idx += [-2, -1, -1, 0, 1, 1, 2][Math.floor(rnd() * 7)];
        idx = Math.max(lo, Math.min(hi, idx));
        pluck(t, scale[idx], vel * (0.7 + rnd() * 0.5), 2.6 + rnd());
      }
    };
    seg(starts.s1, starts.s1 + P.s1, 1.15, 3, 8, 0.7);
    seg(starts.s2, starts.s2 + P.s2, 1.3, 3, 9, 0.7);
    seg(starts.s3, starts.s3 + P.s3, 1.05, 4, 9, 0.75);
    seg(starts.s4, starts.s4 + P.s4, 0.62, 4, 11, 0.8);    // the day turning: quicker, rising
    seg(starts.montage, starts.montage + P.montage, 0.5, 5, 12, 0.85);
    for (let t = 7; t < starts.end - 1; t += 4.4) pluck(t, [N.D2, N.A2, N.B2, N.A2][Math.floor((t - 7) / 4.4) % 4], 0.7, 4);
    // weather
    const stormAt = starts.s4 + 6.5, snowAt = starts.s4 + 9.4;
    noise(stormAt, snowAt + 1.5, 'highpass', 2600, 0.7, 0.05, 1.4, 1.4);
    noise(stormAt + 0.7, stormAt + 4.5, 'lowpass', 130, 0.7, 0.35, 0.05, 3.2);       // thunder
    noise(snowAt, starts.montage, 'bandpass', 900, 0.4, 0.012, 1.5, 1.5);
    // the ending: a chord opened out, then a bell
    const e0 = starts.end;
    pluck(e0 + 0.3, N.D3, 0.8, 5); pluck(e0 + 0.55, N.A3, 0.7, 5); pluck(e0 + 0.8, N.D4, 0.7, 5);
    pluck(e0 + 2.2, N.Fs4, 0.6, 4); pluck(e0 + 3.0, N.A4, 0.55, 4); pluck(e0 + 3.9, N.D5, 0.5, 5);
    bell(e0 + 3.6, N.D4, 0.6);

    const buf = await oc.startRendering();
    job.phase = 'audio-encode';
    const aenc = new AudioEncoder({ output: (c, m) => aChunks.push([c, m]), error: (e) => { job.encErr = String(e); } });
    aenc.configure({ codec: 'mp4a.40.2', sampleRate: SR, numberOfChannels: 2, bitrate: 128000 });
    const L = buf.getChannelData(0), R = buf.getChannelData(1);
    for (let i = 0; i < L.length; i += 4800) {
      const m = Math.min(4800, L.length - i);
      const data = new Float32Array(m * 2);
      data.set(L.subarray(i, i + m), 0); data.set(R.subarray(i, i + m), m);
      aenc.encode(new AudioData({ format: 'f32-planar', sampleRate: SR, numberOfFrames: m, numberOfChannels: 2, timestamp: Math.round((i / SR) * 1e6), data }));
      if (aenc.encodeQueueSize > 8) await sleep(2);
    }
    await aenc.flush();
  }
  let ai = 0;

  async function emit(draw) {
    draw();
    const ts = Math.round((S.frame * 1e6) / FPS);
    const vf = new VideoFrame(off, { timestamp: ts, duration: Math.round(1e6 / FPS) });
    venc.encode(vf, { keyFrame: S.frame % 60 === 0 });
    vf.close();
    while (ai < aChunks.length && aChunks[ai][0].timestamp <= ts + 300000) { muxer.addAudioChunk(aChunks[ai][0], aChunks[ai][1]); ai++; }
    S.frame++; job.frames = S.frame;
    if (venc.encodeQueueSize > 6) await sleep(4); else if (S.frame % 4 === 0) await sleep(0);
    if (job.encErr) throw new Error(job.encErr);
  }

  // ------------------------------------------------------------------ phases
  // Every scene the film visits starts loading at once, at the very start, so the
  // slow part happens while the score is being made and the title card drawn.
  const pre = {};
  function startLoad(id) {
    pre[id] = (async () => {
      const f = document.createElement('iframe');
      f.className = '__s'; f.src = '/scene/' + id + '?film';
      f.style.cssText = `position:fixed;left:0;top:0;width:${W}px;height:${H}px;border:0;pointer-events:none;z-index:-1`;
      document.body.appendChild(f);
      const t0 = performance.now();
      while (!(f.contentWindow && f.contentWindow.__film && f.contentDocument && f.contentDocument.querySelector('canvas')) && performance.now() - t0 < 1800000) await sleep(250);
      if (!f.contentWindow.__film) throw new Error('scene ' + id + ' did not load');
      const F = f.contentWindow.__film;
      F.fadeTo(0, 0.05); F.walk = 0.5;
      return { F, canvas: f.contentDocument.querySelector('canvas'), frame: f };
    })();
    pre[id].catch(() => {});
  }
  const loadScene = (id) => pre[id];

  async function scenePhase(id, shots) {
    job.phase = id;
    const sc = await loadScene(id);
    for (const shot of shots) {
      sc.F.focus(shot.id, true);
      if (shot.setup) shot.setup(sc.F);
      for (let i = 0; i < 5; i++) { sc.F.step(); await sleep(30); }   // let the eye arrive, off camera
      const n = Math.round(shot.secs * FPS);
      for (let i = 0; i < n; i++) {
        const u = i / FPS;
        sc.F.step();
        if (shot.tick) shot.tick(sc.F, u, shot.secs);
        await emit(() => {
          ctx.drawImage(sc.canvas, 0, 0, W, H);
          const fin = clamp01(u / 0.45), fout = clamp01((shot.secs - u) / 0.45);
          const vis = Math.min(fin, fout);
          if (shot.panel) inscription(shot.panel.title, shot.panel.author, shot.panel.lines, shot.panel.cur, ease(vis));
          if (shot.extra) shot.extra(u, ease(vis));
          if (shot.chapter) chapter(shot.chapter.n, shot.chapter.zh, shot.chapter.en, ease(Math.min(clamp01((u - 0.3) / 0.5), clamp01((shot.secs - 0.2 - u) / 0.5))));
          if (shot.zh) subtitle(shot.zh, shot.en, ease(Math.min(clamp01((u - 0.55) / 0.45), clamp01((shot.secs - 0.5 - u) / 0.4))));
          dip(1 - vis);
        });
      }
    }
    sc.frame.remove();
  }

  async function titlePhase() {
    job.phase = 'title';
    const n = Math.round(P.title * FPS);
    for (let i = 0; i < n; i++) {
      const u = i / FPS;
      const out = 1 - ease((u - 6.35) / 0.6);
      await emit(() => {
        paper();
        const a = ease((u - 0.5) / 1.6) * out;
        ctx.save();
        ctx.filter = `blur(${(1 - ease((u - 0.5) / 1.6)) * 12}px)`;
        text('卧游', W / 2, H / 2 - 24, { size: 200, spacing: 56, alpha: a });
        ctx.restore();
        text('WANDERING IN THE LANDSCAPE', W / 2, H / 2 + 56, { font: LATIN, size: 20, spacing: 11, color: 'rgba(38,38,46,.62)', alpha: ease((u - 1.7) / 0.9) * out });
        const A = ease(Math.min((u - 2.6) / 0.5, (4.6 - u) / 0.5));
        const B = ease(Math.min((u - 4.7) / 0.5, (6.7 - u) / 0.5));
        text('宗炳老病，画山水于四壁，卧而游之。', W / 2, H / 2 + 146, { size: 36, spacing: 5, color: 'rgba(38,38,46,.8)', alpha: A * out });
        text('Zong Bing, old and ill, painted mountains on his walls and travelled them lying down.', W / 2, H / 2 + 188, { font: LATIN, size: 21, italic: true, color: 'rgba(38,38,46,.6)', alpha: A * out });
        text('诗亦一境 — 一句一步，入此山中。', W / 2, H / 2 + 146, { size: 36, spacing: 5, color: 'rgba(38,38,46,.8)', alpha: B * out });
        text('A poem is a place too — one line, one step, into the mountains.', W / 2, H / 2 + 188, { font: LATIN, size: 21, italic: true, color: 'rgba(38,38,46,.6)', alpha: B * out });
      });
    }
  }

  async function grab(name, t) {
    const v = document.createElement('video'); v.muted = true; v.src = '/film/' + name + '.mp4';
    await new Promise((res, rej) => { v.onloadeddata = res; v.onerror = () => rej(new Error('clip ' + name)); });
    v.currentTime = t; await new Promise((r) => (v.onseeked = r)); await sleep(500);
    const bmp = await createImageBitmap(v); v.removeAttribute('src'); v.load();
    return bmp;
  }

  async function montagePhase() {
    job.phase = 'montage';
    const cuts = [
      ['shanju', '山居秋暝', '王维', 'Autumn Dusk in the Mountains', 'Wang Wei', 6.2],
      ['jiangxue', '江雪', '柳宗元', 'River Snow', 'Liu Zongyuan', 6.2],
      ['niaoming', '鸟鸣涧', '王维', 'Birdsong Ravine', 'Wang Wei', 2.4],
      ['chunjiang', '春江花月夜', '张若虚', 'Spring River, Flowers, Moonlit Night', 'Zhang Ruoxu', 2.4],
      ['xijiang', '西江月', '辛弃疾', 'Moon on the West River', 'Xin Qiji', 2.6],
      ['yinjiu', '饮酒·其五', '陶渊明', 'Drinking Wine, V', 'Tao Yuanming', 2.6],
      ['denggao', '登高', '杜甫', 'Ascending the Heights', 'Du Fu', 6.2],
      ['chile', '敕勒歌', '佚名', 'Song of the Chile', 'Anonymous', 2.6],
      ['taohuayuan', '桃花源记', '陶渊明', 'Peach Blossom Spring', 'Tao Yuanming', 6.2],
    ];
    const imgs = [];
    for (const c of cuts) imgs.push(await grab(c[0], c[5]));
    const per = P.montage / cuts.length;
    const total = Math.round(P.montage * FPS);
    for (let i = 0; i < total; i++) {
      const u = i / FPS;
      const k = Math.min(cuts.length - 1, Math.floor(u / per));
      const lu = (u - k * per) / per;
      await emit(() => {
        const still = (idx, p, alpha) => {
          const s = 1.03 + 0.07 * p, w = W * s, h = H * s;
          ctx.save(); ctx.globalAlpha = alpha;
          ctx.drawImage(imgs[idx], (W - w) / 2 - p * 14, (H - h) / 2, w, h);
          ctx.restore();
        };
        if (k > 0 && lu < 0.25) still(k - 1, 1, 1);
        still(k, lu, k > 0 ? ease(lu / 0.25) : 1);
        const c = cuts[k];
        const g = ctx.createLinearGradient(0, H - 230, 0, H);
        g.addColorStop(0, 'rgba(18,16,12,0)'); g.addColorStop(1, 'rgba(18,16,12,.6)');
        ctx.fillStyle = g; ctx.fillRect(0, H - 230, W, 230);
        const ta = ease(Math.min(lu / 0.2, (1 - lu) / 0.12 + 0.2));
        text(c[1], 64, H - 92, { size: 56, align: 'left', color: '#f8f1de', spacing: 10, alpha: ta, shadow: { c: 'rgba(0,0,0,.5)', b: 10 } });
        text(c[2], 64 + 56 * c[1].length + 24 + 10 * c[1].length, H - 92, { size: 26, align: 'left', color: 'rgba(248,241,222,.85)', spacing: 4, alpha: ta });
        text(c[3] + ' — ' + c[4], 66, H - 50, { font: LATIN, size: 22, align: 'left', italic: true, color: '#f1e9d2', alpha: ta * 0.9, shadow: { c: 'rgba(0,0,0,.6)', b: 8 } });
        chapter(6, '十首诗，十重山水。', 'Ten poems, ten landscapes.', ease(Math.min(clamp01(u / 0.5), clamp01((P.montage - 0.6 - u) / 0.5))));
        dip(clamp01((u - (P.montage - 0.5)) / 0.5));
      });
    }
  }

  async function endPhase() {
    job.phase = 'end';
    const n = Math.round(P.end * FPS);
    for (let i = 0; i < n; i++) {
      const u = i / FPS;
      const out = 1 - ease((u - 5.9) / 0.6);
      await emit(() => {
        paper();
        ctx.save(); ctx.filter = `blur(${(1 - ease((u - 0.2) / 1.4)) * 10}px)`;
        text('卧游', W / 2, H / 2 - 74, { size: 168, spacing: 50, alpha: ease((u - 0.2) / 1.4) * out });
        ctx.restore();
        text('WANDERING IN THE LANDSCAPE', W / 2, H / 2 - 4, { font: LATIN, size: 19, spacing: 10, color: 'rgba(38,38,46,.62)', alpha: ease((u - 1.0) / 0.7) * out });
        text('十首古诗，十重山水，走进去，一句一句读。', W / 2, H / 2 + 76, { size: 34, spacing: 4, color: 'rgba(38,38,46,.82)', alpha: ease((u - 1.6) / 0.7) * out });
        text('Ten Chinese poems as walkable landscapes — read them line by line, in your browser.', W / 2, H / 2 + 116, { font: LATIN, size: 20, italic: true, color: 'rgba(38,38,46,.62)', alpha: ease((u - 1.9) / 0.7) * out });
        text('自由观看 · 漫游 · 落笔 · 天时 · 闻声', W / 2, H / 2 + 176, { size: 22, spacing: 6, color: 'rgba(38,38,46,.6)', alpha: ease((u - 2.6) / 0.7) * out });
        text('Free view · Roam · Compose · Time & weather · Sound', W / 2, H / 2 + 204, { font: LATIN, size: 16, spacing: 1.5, color: 'rgba(38,38,46,.5)', alpha: ease((u - 2.8) / 0.7) * out });
        text('poemtoscenesclaude.vercel.app', W / 2, H / 2 + 262, { font: LATIN, size: 24, spacing: 3, color: SEAL, alpha: ease((u - 3.6) / 0.7) * out });
        ctx.save(); ctx.globalAlpha = ease((u - 3.3) / 0.6) * out; ctx.fillStyle = SEAL; ctx.fillRect(W - 128, H - 118, 44, 44); ctx.restore();
        text('游', W - 106, H - 96, { size: 30, color: '#f6ecd6', base: 'middle', alpha: ease((u - 3.3) / 0.6) * out });
      });
    }
  }

  // ------------------------------------------------------------------- the run
  try {
    ['shanju-qiuming', 'chunjiang', 'taohuayuan', 'chile'].forEach(startLoad);
    await titlePhase();

    const p1 = { title: '山居秋暝', author: '王维', lines: ['空山新雨后', '天气晚来秋', '明月松间照', '清泉石上流', '竹喧归浣女', '莲动下渔舟', '随意春芳歇', '王孙自可留'] };
    await scenePhase('shanju-qiuming', [
      { id: 'kongshan', secs: 3.0, panel: { ...p1, cur: 0 }, chapter: { n: 1, zh: '选一首诗，走进去。', en: 'Choose a poem, and walk in.' }, zh: '空山新雨后', en: 'After fresh rain, the empty mountain' },
      { id: 'songjian', secs: 3.0, panel: { ...p1, cur: 2 }, chapter: { n: 1, zh: '选一首诗，走进去。', en: 'Choose a poem, and walk in.' }, zh: '明月松间照', en: 'Bright moon shining through the pines' },
      { id: 'zhuxuan', secs: 3.4, panel: { ...p1, cur: 4 }, chapter: { n: 2, zh: '站在诗人站过的地方。', en: 'Stand where the poet stood.' }, zh: '竹喧归浣女', en: 'Bamboo rustles — the washerwomen head home' },
      { id: 'liandong', secs: 3.4, panel: { ...p1, cur: 5 }, chapter: { n: 2, zh: '站在诗人站过的地方。', en: 'Stand where the poet stood.' }, zh: '莲动下渔舟', en: 'Lotus leaves stir — a fishing boat slips down' },
    ]);
    await scenePhase('chunjiang', [
      { id: 'chaosheng', secs: 3.2, chapter: { n: 3, zh: '一句，一步，一境。', en: 'One line, one step, one world.' }, zh: '海上明月共潮生', en: 'Over the sea a bright moon rises with the tide' },
      { id: 'hualin', secs: 3.0, zh: '月照花林皆似霰', en: 'Moonlight on the blossoms, like sleet' },
      { id: 'baisha', secs: 3.2, zh: '汀上白沙看不见', en: 'White sand on the bar, lost in the light' },
    ]);
    await scenePhase('taohuayuan', [
      { id: 'qianmo', secs: 3.4, chapter: { n: 4, zh: '画中有人，有鸡犬相闻。', en: 'And in the picture, people — hens and dogs heard.' }, zh: '阡陌交通，鸡犬相闻', en: 'Paths criss-cross; hens and dogs are heard' },
      { id: 'huangfa', secs: 3.4, zh: '黄发垂髫，并怡然自乐', en: 'Old and young, all happily at ease' },
    ]);
    const CHIPS = ['晴', '多云', '阴', '细雨', '雷雨', '雪', '雾', '大风'];
    const hourAt = (u) => (u < 6.3 ? 5.4 + (17.8 - 5.4) * ease(u / 6.3) : 17.8 + (u - 6.3) * 0.12);
    await scenePhase('chile', [
      {
        id: 'niuyang', secs: P.s4,
        chapter: { n: 5, zh: '昼夜，风雨，四时。', en: 'Day and night, wind and rain, the turning year.' },
        zh: '风吹草低见牛羊', en: 'Wind bows the grass, and cattle and sheep appear',
        setup: (F) => { F.weather('scene'); F.clock(5.4); },
        tick: (F, u) => {
          F.clock(hourAt(u));
          if (Math.abs(u - 6.5) < 1 / 60) F.weather('storm');
          if (Math.abs(u - 9.4) < 1 / 60) F.weather('snow');
        },
        extra: (u, a) => {
          const h = hourAt(u);
          text(shichen(h), W - 92, 108, { size: 62, color: '#f8f1de', alpha: a, spacing: 8, shadow: { c: 'rgba(0,0,0,.55)', b: 12 }, align: 'right' });
          text(hhmm(h), W - 60, 146, { font: LATIN, size: 26, color: '#f1e9d2', alpha: a, spacing: 3, align: 'right', shadow: { c: 'rgba(0,0,0,.55)', b: 8 } });
          pills(CHIPS, u < 6.5 ? 0 : u < 9.4 ? 4 : 5, W - 56 + 8, 168, a);
        },
      },
    ]);
    await montagePhase();
    await endPhase();

    job.phase = 'finish';
    await venc.flush();
    while (ai < aChunks.length) { muxer.addAudioChunk(aChunks[ai][0], aChunks[ai][1]); ai++; }
    muxer.finalize();
    const blob = new Blob([muxer.target.buffer], { type: 'video/mp4' });
    window.__intro = blob;
    if (upload) job.msg = await (await fetch(upload + 'intro.mp4', { method: 'POST', body: blob })).text();
  } catch (e) {
    job.err = String((e && e.stack) || e);
  }
  job.done = true;
};
