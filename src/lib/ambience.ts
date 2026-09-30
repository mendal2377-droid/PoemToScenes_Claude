'use client';

import { clamp, distToPath } from './noise';
import { riverWidth } from './terrain';
import type { PoemScene } from './types';

/**
 * The sound of the place, synthesised.
 *
 * 竹喧 literally means *noise in the bamboo*, and 清泉石上流 is a line you hear
 * before you see — half of this poem is sound, and the scene was silent. Rather
 * than ship audio files, every layer is filtered noise built in the Web Audio
 * graph: a bed of wind, 松风 through the pines, 泉声 over the stones, the hollow
 * clatter of a bamboo grove, and water lapping at the lotus pond.
 *
 * Layer gains follow the listener, so walking towards the stream brings it up
 * the way it would if you were actually walking towards it. Nothing starts until
 * the reader asks for it, both because browsers forbid it and because silence is
 * a legitimate way to read a poem.
 */

type Layer = {
  gain: GainNode;
  /** How loud this layer is when you are standing on top of it. */
  peak: number;
};

class Ambience {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private layers: Record<string, Layer> = {};
  private knockAt = 0;
  /** When each living sound next speaks, in seconds. */
  private next: Record<string, number> = { frogs: 0, birdsong: 0, gibbon: 2, poultry: 0 };
  private knockFilter: BiquadFilterNode | null = null;

  get running() {
    return this.ctx !== null && this.ctx.state === 'running';
  }

  /** Two seconds of white noise, looped. Every layer is a filter over this. */
  private noiseSource(ctx: AudioContext): AudioBufferSourceNode {
    const frames = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    return src;
  }

  private addLayer(
    ctx: AudioContext,
    name: string,
    peak: number,
    build: (src: AudioNode) => AudioNode
  ) {
    const src = this.noiseSource(ctx);
    const shaped = build(src);
    const gain = ctx.createGain();
    gain.gain.value = 0;
    shaped.connect(gain);
    gain.connect(this.master!);
    src.start();
    this.layers[name] = { gain, peak };
  }

  /** Must be called from a user gesture — browsers will not start audio otherwise. */
  async start() {
    if (this.ctx) {
      await this.ctx.resume();
      return;
    }
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor();
    this.ctx = ctx;

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    this.master = master;

    // A low bed of moving air, always faintly present.
    this.addLayer(ctx, 'bed', 0.1, (src) => {
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 340;
      src.connect(lp);
      return lp;
    });

    // 松风 — wind in pine needles is a broad, breathy hiss, not a whistle.
    this.addLayer(ctx, 'pine', 0.24, (src) => {
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 760;
      bp.Q.value = 0.7;
      src.connect(bp);
      return bp;
    });

    // 泉声 — bright, narrow, and constant: water over stone.
    this.addLayer(ctx, 'stream', 0.2, (src) => {
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 900;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 2300;
      bp.Q.value = 0.9;
      src.connect(hp);
      hp.connect(bp);
      return bp;
    });

    // 竹喧 — the grove's own rustle, under the knocks scheduled separately.
    this.addLayer(ctx, 'bamboo', 0.17, (src) => {
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 1700;
      bp.Q.value = 2.2;
      src.connect(bp);
      return bp;
    });

    // Open water, lapping.
    this.addLayer(ctx, 'water', 0.15, (src) => {
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 480;
      bp.Q.value = 1.4;
      src.connect(bp);
      return bp;
    });

    // Rain: a broad bright hiss, the sound of a great many small impacts, with a
    // lower patter under it for the drops landing on leaves and earth.
    this.addLayer(ctx, 'rain', 0.3, (src) => {
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 2800;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 6200;
      bp.Q.value = 0.35;
      src.connect(hp);
      hp.connect(bp);
      return bp;
    });
    this.addLayer(ctx, 'patter', 0.2, (src) => {
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 1500;
      bp.Q.value = 0.6;
      src.connect(bp);
      return bp;
    });

    // 蝉 — a saw-tooth held high and chopped fast: the sound of a cicada is a
    // buzz that is really a rattle. The LFO is what makes it a cicada.
    {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 3700;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 3900;
      bp.Q.value = 7;
      const chop = ctx.createGain();
      chop.gain.value = 0.5;
      const lfo = ctx.createOscillator();
      lfo.type = 'square';
      lfo.frequency.value = 27;
      const depth = ctx.createGain();
      depth.gain.value = 0.5;
      lfo.connect(depth);
      depth.connect(chop.gain);
      osc.connect(bp);
      bp.connect(chop);
      const layer = ctx.createGain();
      layer.gain.value = 0;
      chop.connect(layer);
      layer.connect(master);
      osc.start();
      lfo.start();
      this.layers['cicada'] = { gain: layer, peak: 0.055 };
    }

    // A resonator the knocks are fired through — hollow, like a struck culm.
    const knock = ctx.createBiquadFilter();
    knock.type = 'bandpass';
    knock.frequency.value = 900;
    knock.Q.value = 9;
    knock.connect(master);
    this.knockFilter = knock;

    await ctx.resume();
    master.gain.setTargetAtTime(0.85, ctx.currentTime, 1.2);
  }

  stop() {
    const ctx = this.ctx;
    if (!ctx) return;
    this.master?.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
    // Let the fade finish before tearing the graph down.
    window.setTimeout(() => {
      void ctx.close();
      this.ctx = null;
      this.master = null;
      this.layers = {};
      this.knockFilter = null;
    }, 900);
  }

  /**
   * Thunder: a long low rumble that swells and rolls off. Built from a buffer
   * whose envelope has a sharp crack at the front and a slow, uneven tail — a
   * single smooth decay sounds like a door closing, not weather.
   */
  thunder() {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const seconds = 3.6;
    const frames = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    const phase = Math.random() * 6.28;
    for (let i = 0; i < frames; i++) {
      const t = i / ctx.sampleRate;
      const crack = Math.exp(-t * 14) * 0.7;
      const roll = Math.exp(-t * 0.95) * (0.62 + 0.38 * Math.sin(t * 5.2 + phase)) * (1 - Math.exp(-t * 9));
      data[i] = (Math.random() * 2 - 1) * (crack + roll);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 190;
    lp.Q.value = 0.9;
    const g = ctx.createGain();
    g.gain.value = 1.35;
    src.connect(lp);
    lp.connect(g);
    g.connect(this.master);
    src.start();
  }

  /** A single pitched note that glides from one frequency to another. */
  private tone(f0: number, f1: number, dur: number, gain: number, type: OscillatorType = 'sine', delay = 0) {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(f1, 20), t + dur);
    const g = ctx.createGain();
    // A fast attack and a fall to nothing: a note, not a tone.
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(gain, 0.0002), t + Math.min(0.012, dur * 0.3));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  /** A short burst of filtered noise: a frog's click, a dog's bark. */
  private click(freq: number, q: number, dur: number, gain: number, delay = 0) {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const t = ctx.currentTime + delay;
    const frames = Math.max(8, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, frames, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < frames; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / frames, 2);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = freq;
    bp.Q.value = q;
    const g = ctx.createGain();
    g.gain.value = gain;
    src.connect(bp);
    bp.connect(g);
    g.connect(this.master);
    src.start(t);
  }

  /** 蛙声一片 — a run of croaks, each on its own pitch, tumbling over the last. */
  private frogs(amount: number) {
    const n = 3 + Math.floor(Math.random() * 4);
    const base = 620 + Math.random() * 500;
    for (let i = 0; i < n; i++) {
      this.click(base * (1 + Math.random() * 0.5), 9, 0.05 + Math.random() * 0.03, 0.55 * amount, i * (0.05 + Math.random() * 0.05));
      this.tone(base * 0.7, base * 0.55, 0.06, 0.05 * amount, 'triangle', i * 0.07);
    }
  }

  /** 时鸣春涧中 — a few notes, sweeping up, then a pause. */
  private birdsong(amount: number) {
    const notes = 2 + Math.floor(Math.random() * 3);
    let t = 0;
    const f = 2300 + Math.random() * 1200;
    for (let i = 0; i < notes; i++) {
      const up = Math.random() < 0.65;
      this.tone(f * (up ? 0.86 : 1.1), f * (up ? 1.18 : 0.8), 0.07 + Math.random() * 0.06, 0.11 * amount, 'sine', t);
      t += 0.1 + Math.random() * 0.09;
    }
  }

  /** 猿啸哀 — a rising whoop and a long, trembling fall. */
  private gibbon(amount: number) {
    this.tone(520, 1450, 0.42, 0.16 * amount, 'sine', 0);
    // The fall carries a vibrato, made by stepping the pitch rather than a second oscillator.
    let f = 1350;
    for (let i = 0; i < 10; i++) {
      const wob = i % 2 === 0 ? 1.06 : 0.94;
      this.tone(f * wob, f * 0.93 * wob, 0.11, 0.14 * amount * (1 - i * 0.07), 'sine', 0.42 + i * 0.1);
      f *= 0.955;
    }
  }

  /** 鸡犬相闻 — clucking, and now and then a dog. */
  private poultry(amount: number) {
    if (Math.random() < 0.28) {
      // a bark: a rough low tone and a burst of breath
      this.tone(230, 130, 0.16, 0.13 * amount, 'sawtooth', 0);
      this.click(700, 1.2, 0.1, 0.4 * amount, 0);
      return;
    }
    const n = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) this.tone(340 + Math.random() * 90, 210, 0.07, 0.09 * amount, 'triangle', i * 0.12);
  }

  /** One bamboo culm knocking against another. */
  private knock() {
    const ctx = this.ctx;
    if (!ctx || !this.knockFilter) return;
    const src = ctx.createBufferSource();
    const frames = Math.floor(ctx.sampleRate * 0.09);
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) {
      // A sharp attack with a fast decay reads as a strike rather than a hiss.
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / frames, 5);
    }
    src.buffer = buffer;
    const g = ctx.createGain();
    g.gain.value = 0.16 + Math.random() * 0.12;
    this.knockFilter.frequency.setValueAtTime(620 + Math.random() * 700, ctx.currentTime);
    src.connect(g);
    g.connect(this.knockFilter);
    src.start();
  }

  /**
   * Follow the listener. Called every frame, so every parameter change is a
   * smoothed approach rather than a jump — stepping a gain directly at frame
   * rate is audible as zipper noise.
   */
  update(x: number, z: number, scene: PoemScene, wind: number, dt: number, rain = 0) {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const now = ctx.currentTime;

    const falloff = (dist: number, reach: number) => 1 - clamp(dist / reach, 0, 1);

    // Nearest pine cluster.
    let pine = 0;
    for (const c of scene.flora.pines.clusters) {
      pine = Math.max(pine, falloff(Math.hypot(x - c.x, z - c.z) - c.r, c.r * 2.4));
    }

    // Nearest bamboo grove.
    let bamboo = 0;
    for (const g of scene.flora.bamboo.groves) {
      bamboo = Math.max(bamboo, falloff(Math.hypot(x - g.x, z - g.z) - g.r, g.r * 2));
    }

    // The stream, measured against the channel it runs in.
    let stream = 0;
    for (const ch of scene.terrain.channels) {
      stream = Math.max(stream, falloff(distToPath(x, z, ch.path).dist, 34));
    }

    // A river is water from a long way off.
    let river = 0;
    for (const rv of scene.terrain.rivers ?? []) {
      const near = distToPath(x, z, rv.path);
      river = Math.max(river, falloff(near.dist - riverWidth(rv, near.t) * 0.5, 60));
    }

    // Open water.
    let water = 0;
    for (const b of scene.terrain.basins) {
      water = Math.max(water, falloff(Math.hypot(x - b.x, z - b.z) - b.r, b.r * 0.9));
    }
    water = Math.max(water, river);

    // Gusting: the wind slider sets how hard it blows, and a slow drift keeps
    // it from sitting at one level.
    const gust = 0.55 + 0.45 * Math.sin(now * 0.21) * Math.sin(now * 0.07 + 1.3);
    const breath = clamp(wind, 0, 1.6);

    const set = (name: string, amount: number) => {
      const layer = this.layers[name];
      if (!layer) return;
      layer.gain.gain.setTargetAtTime(layer.peak * clamp(amount, 0, 1), now, 0.35);
    };

    set('bed', 0.35 + breath * 0.4);
    set('pine', pine * (0.3 + breath * gust));
    set('stream', stream);
    set('bamboo', bamboo * (0.35 + breath * 0.7));
    set('water', water * (0.45 + breath * 0.4));

    // Rain is everywhere, so it does not depend on where the listener stands.
    set('rain', rain);
    set('patter', rain * (0.35 + rain * 0.65));

    // 竹喧 — knocks get more frequent the harder the wind and the deeper in the
    // grove you stand.
    // The sounds a scene names for itself. Each is loudest at its source and
    // gone at twice its radius; the continuous ones ride a gain, the living
    // ones speak now and then, more often the closer you stand.
    const near = (kind: string) => {
      let best = 0;
      for (const src of scene.sounds ?? []) {
        if (src.kind !== kind) continue;
        best = Math.max(best, falloff(Math.hypot(x - src.x, z - src.z), src.r * 2));
      }
      return best;
    };
    set('cicada', near('cicada'));
    const speak = (kind: 'frogs' | 'birdsong' | 'gibbon' | 'poultry', gap: [number, number], fn: (a: number) => void) => {
      const amount = near(kind);
      if (amount < 0.06) return;
      this.next[kind] -= dt;
      if (this.next[kind] <= 0) {
        fn(amount);
        this.next[kind] = (gap[0] + Math.random() * (gap[1] - gap[0])) / (0.4 + amount);
      }
    };
    speak('frogs', [0.06, 0.4], (a) => this.frogs(a));
    speak('birdsong', [1.4, 5.0], (a) => this.birdsong(a));
    speak('gibbon', [6, 11], (a) => this.gibbon(a));
    speak('poultry', [0.9, 3.2], (a) => this.poultry(a));

    this.knockAt -= dt;
    if (bamboo > 0.25 && this.knockAt <= 0) {
      this.knock();
      this.knockAt = 0.12 + Math.random() * (1.6 - bamboo * 0.9) / (0.4 + breath);
    }
  }
}

export const ambience = new Ambience();
