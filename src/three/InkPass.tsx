'use client';

import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { PaintStyle, PoemScene } from '@/lib/types';
import { film } from './Film';

/**
 * 水墨 — the whole picture, painted.
 *
 * The scene is drawn into an off-screen target and then laid down a second time
 * as a painting would be:
 *
 * - **The line.** Edges are found where the depth jumps (a silhouette) and where
 *   the colour does (a fold, a canopy's edge). The line is drawn through a slightly
 *   wobbling sample, so it is not ruled; its width swells and thins along the
 *   screen, the way pressure on a brush does; and it breaks into 飞白, the dry
 *   streaks a brush leaves when the ink runs low. Near things get a firm line,
 *   far things a faint one, and the farthest none at all.
 * - **The wash.** Colour pools a little darker at its own borders, as watercolour
 *   does where it dries; here and there it bleeds soft; and pigment settles into
 *   the grain.
 * - **The paper.** Fibre and mottling show through everything, so the sky, the
 *   water and the ink are all on the same sheet.
 *
 * It replaces R3F's own render (a frame callback with a priority takes it over),
 * so it costs one extra full-screen pass. `?ink=0` turns it off, for comparison.
 */

/**
 * Things that fall — snow, rain, petals — are added after the painting is done,
 * the way a painter flicks snow on last: they live on this layer and are drawn
 * straight over the finished picture, so the ink pass never outlines a flake.
 */
export const OVERLAY_LAYER = 1;

export const ink = {
  enabled: true,
  /** Phones and small GPUs get a lighter wash filter. */
  light: false,
};
if (typeof window !== 'undefined') {
  ink.enabled = new URLSearchParams(window.location.search).get('ink') !== '0';
  const cores = navigator.hardwareConcurrency ?? 8;
  ink.light = window.matchMedia('(max-width: 820px)').matches || cores <= 4;
}

/**
 * The painting traditions a scene can be laid down in.
 *
 * - **淡彩** light colour over ink: the default, for most of the poems.
 * - **水墨** ink alone, in its five tones.
 * - **一角** Ma Yuan's corner: ink, and most of the sheet left empty.
 * - **青绿** blue-green: mineral azurite and malachite, the colours of a paradise.
 * - **浅绛** pale crimson: ochre washes and a light ink, the colours of autumn.
 * - **没骨** boneless: colour with no outline at all, soft and wet.
 * - **夜墨** ink at night: almost all dark, the moon left as bare paper.
 */
const STYLES: Record<PaintStyle, {
  sat: number;
  ramp: [string, string, string];
  rampAmt: number;
  line: number;
  lineColor?: string;
  aerial: number;
  bleed: number;
  corner?: [number, number, number];
  farTint?: [string, number];
}> = {
  dancai: { sat: 0.86, ramp: ['#000000', '#808080', '#ffffff'], rampAmt: 0, line: 1, aerial: 0.45, bleed: 1 },
  ink: { sat: 0.08, ramp: ['#202126', '#7d7c78', '#ebe6d8'], rampAmt: 0.5, line: 1.05, lineColor: '#16161b', aerial: 0.55, bleed: 1.2 },
  'ink-corner': { sat: 0.06, ramp: ['#1e1f24', '#7a7975', '#ede8da'], rampAmt: 0.5, line: 1.1, lineColor: '#141419', aerial: 0.6, bleed: 1.2, corner: [0.62, 0.78, 0.75] },
  qinglv: { sat: 0.85, ramp: ['#1b3940', '#3b7a7a', '#d4ddc6'], rampAmt: 0.55, line: 0.8, lineColor: '#2c2318', aerial: 0.36, bleed: 0.9, farTint: ['#5d8ea8', 0.42] },
  qianjiang: { sat: 0.7, ramp: ['#3a2e24', '#a07c56', '#ecdcbd'], rampAmt: 0.45, line: 1, lineColor: '#2a2019', aerial: 0.48, bleed: 1.1, farTint: ['#7d93a0', 0.45] },
  mogu: { sat: 1.0, ramp: ['#000000', '#808080', '#ffffff'], rampAmt: 0, line: 0.14, aerial: 0.5, bleed: 1.8 },
  night: { sat: 0.32, ramp: ['#12141b', '#4b5263', '#ddd9cb'], rampAmt: 0.45, line: 0.85, lineColor: '#0c0d12', aerial: 0.22, bleed: 1.1 },
};

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D tColor;
  uniform sampler2D tDepth;
  uniform vec2 uRes;         // target size in pixels
  uniform float uNear, uFar;
  uniform vec3 uPaper, uInk, uVeilColor;
  uniform float uVeil;
  uniform float uLine;       // line strength, 0–1
  uniform float uScale;      // device pixel ratio, so strokes keep their width
  uniform float uAerial;     // how far distance fades to paper (遠 → 淡)
  // The painting tradition (see STYLES): saturation, a pigment ramp by value,
  // the colour of the line, how much the wash bleeds, and an empty corner.
  uniform float uSat, uRampAmt, uBleed;
  uniform vec3 uRamp0, uRamp1, uRamp2, uLineColor;
  uniform vec3 uCorner;      // xy: the direction of the emptiness; z: how empty
  uniform vec3 uFarTint;     // the colour distance turns: 花青 for 浅绛, 石青 for 青绿
  uniform float uFarTintAmt;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
    return v;
  }
  float linDepth(vec2 uv) {
    float z = texture2D(tDepth, uv).x * 2.0 - 1.0;
    return (2.0 * uNear * uFar) / (uFar + uNear - z * (uFar - uNear));
  }
  float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

  // One quadrant of a Kuwahara window: its mean colour, and how much it varies.
  const int R = KUWAHARA_R;
  vec4 quadrant(vec2 uv, vec2 st, vec2 sgn) {
    vec3 m = vec3(0.0), q = vec3(0.0);
    for (int j = 0; j <= R; j++) {
      for (int i = 0; i <= R; i++) {
        vec3 c = texture2D(tColor, uv + vec2(float(i), float(j)) * sgn * st).rgb;
        m += c; q += c * c;
      }
    }
    float n = float((R + 1) * (R + 1));
    m /= n;
    vec3 v = abs(q / n - m * m);
    return vec4(m, v.r + v.g + v.b);
  }
  // Kuwahara: each pixel takes the calmest of its four neighbourhoods, which
  // flattens shading into patches of wash and keeps the edges between them crisp.
  vec3 wash(vec2 uv, vec2 st) {
    vec4 a = quadrant(uv, st, vec2(-1.0, -1.0));
    vec4 b = quadrant(uv, st, vec2(1.0, -1.0));
    vec4 c = quadrant(uv, st, vec2(1.0, 1.0));
    vec4 d = quadrant(uv, st, vec2(-1.0, 1.0));
    vec4 best = a;
    if (b.w < best.w) best = b;
    if (c.w < best.w) best = c;
    if (d.w < best.w) best = d;
    return best.rgb;
  }

  // A silhouette, and the direction the depth falls away in (so the dry streaks
  // can run along the stroke, not across it).
  //
  // The test is on inverse depth, which is exactly linear across any flat surface
  // on screen: ground seen at a grazing angle changes depth fast but never bends,
  // so it draws no line, while a real silhouette is a kink.
  vec3 edgeAt(vec2 uv, vec2 o) {
    float dc = linDepth(uv);
    float dl = linDepth(uv - vec2(o.x, 0.0)), dr = linDepth(uv + vec2(o.x, 0.0));
    float dd = linDepth(uv - vec2(0.0, o.y)), du = linDepth(uv + vec2(0.0, o.y));
    float ic = 1.0 / dc;
    float kink = (abs(1.0 / dl + 1.0 / dr - 2.0 * ic) + abs(1.0 / dd + 1.0 / du - 2.0 * ic)) / ic;
    vec2 g = vec2(dr - dl, du - dd);
    // Only a real gap gets a line: the masses are outlined, not every leaf in them.
    return vec3(smoothstep(0.12, 0.4, kink), normalize(g + vec2(1e-5)));
  }

  void main() {
    vec2 px = 1.0 / uRes;
    vec2 aspect = vec2(uRes.x / uRes.y, 1.0);

    // A hand that is not quite steady.
    vec2 wob = vec2(noise(vUv * aspect * 7.0), noise(vUv * aspect * 7.0 + 17.3)) - 0.5;
    vec2 uv = vUv + wob * px * 4.0 * uScale;

    // Pressure: the stroke swells and thins along its length.
    float press = mix(1.0, 2.9, smoothstep(0.2, 0.8, fbm(vUv * aspect * 4.0 + 3.1)));
    vec2 o = px * press * uScale;

    float d0 = linDepth(uv);
    float near = 1.0 - smoothstep(18.0, 320.0, d0);
    float far = smoothstep(500.0, 1500.0, d0);

    // --- the line: silhouettes from depth, and a wider halo where ink bleeds out ---
    vec3 e = edgeAt(uv, o);
    float sil = e.x;

    // --- the wash ------------------------------------------------------------------
    vec2 st = px * uScale * 1.3;
    vec3 col = wash(vUv, st);
    // Folds: where the wash changes sharply, the pigment dried darker.
    float fl = luma(texture2D(tColor, vUv - vec2(st.x * 2.5, 0.0)).rgb), fr = luma(texture2D(tColor, vUv + vec2(st.x * 2.5, 0.0)).rgb);
    float fd = luma(texture2D(tColor, vUv - vec2(0.0, st.y * 2.5)).rgb), fu = luma(texture2D(tColor, vUv + vec2(0.0, st.y * 2.5)).rgb);
    float fold = smoothstep(0.08, 0.24, length(vec2(fr - fl, fu - fd)));
    // Only an edge that holds at twice the reach is a real fold; a speck — a
    // moss dot, a flake — vanishes between the wider samples and draws no line.
    float gl2 = luma(texture2D(tColor, vUv - vec2(st.x * 5.0, 0.0)).rgb), gr2 = luma(texture2D(tColor, vUv + vec2(st.x * 5.0, 0.0)).rgb);
    float gd2 = luma(texture2D(tColor, vUv - vec2(0.0, st.y * 5.0)).rgb), gu2 = luma(texture2D(tColor, vUv + vec2(0.0, st.y * 5.0)).rgb);
    fold = min(fold, smoothstep(0.08, 0.24, length(vec2(gr2 - gl2, gu2 - gd2))));

    // Here and there it bleeds soft.
    float bleed = smoothstep(0.5, 0.85, fbm(vUv * aspect * 3.0 + 9.7));
    vec2 bb = px * 4.0 * uScale;
    vec3 soft = 0.25 * (texture2D(tColor, vUv + bb).rgb + texture2D(tColor, vUv - bb).rgb
      + texture2D(tColor, vUv + vec2(bb.x, -bb.y)).rgb + texture2D(tColor, vUv + vec2(-bb.x, bb.y)).rgb);
    col = mix(col, soft, min(1.0, 0.5 * bleed * uBleed));

    // Pigment, not paint: a little less saturated, and the paper lifting through.
    float isSky = smoothstep(uFar * 0.6, uFar * 0.9, d0);
    // What is bright and saturated — a torch, a lantern, peach blossom — keeps its
    // colour whatever the tradition, the way a painter keeps the one red seal.
    vec3 orig = texture2D(tColor, vUv).rgb;
    float chroma = max(max(orig.r, orig.g), orig.b) - min(min(orig.r, orig.g), orig.b);
    float keep = smoothstep(0.12, 0.36, chroma) * smoothstep(0.25, 0.6, luma(orig));
    vec3 accent = col;
    col = mix(vec3(luma(col)), col, uSat);
    // The tradition's own pigments, laid by value: 石青石绿 for blue-green, 赭石
    // for pale crimson-ochre, nothing but ink for 水墨.
    float lum = luma(col);
    vec3 ramp = lum < 0.5 ? mix(uRamp0, uRamp1, lum * 2.0) : mix(uRamp1, uRamp2, (lum - 0.5) * 2.0);
    col = mix(col, ramp, uRampAmt * (1.0 - 0.5 * isSky));
    // Distance turns cool before it turns to paper.
    col = mix(col, uFarTint, smoothstep(40.0, 520.0, d0) * uFarTintAmt * (1.0 - isSky));
    col = mix(col, accent, keep * 0.85);
    col = mix(uPaper, col, 0.84);
    col *= 1.0 - 0.14 * fold;
    col *= 0.97 + 0.05 * noise(vUv * uRes / (3.5 * uScale));   // grain

    // 远则淡: the farther, the more it gives way to the paper, as in a scroll where
    // the far ranges are only a breath of colour.
    // The sky keeps its own colour (a moonlit blue is the whole of some poems).
    col = mix(col, uPaper, smoothstep(22.0, 420.0, d0) * uAerial * (1.0 - 0.85 * isSky));

    // 一角: Ma Yuan's corner — the picture gathered to one side, the rest left as
    // paper. Near things hold; the far and the sky give way.
    float cm = smoothstep(-0.1, 0.55, dot(vUv - 0.5, uCorner.xy)) * uCorner.z * (1.0 - near * 0.7);
    col = mix(col, uPaper, cm);

    // --- ink on top ----------------------------------------------------------------
    // 飞白: the brush running dry, in streaks.
    vec2 t = vec2(-e.z, e.y);
    vec2 p = vUv * aspect;
    float streak = noise(vec2(dot(p, t) * 30.0, dot(p, e.yz) * 380.0));
    float dry = mix(0.45, 1.0, smoothstep(0.25, 0.7, streak));
    float line = sil * dry * mix(0.35, 1.0, near) * (1.0 - far);
    line = max(line, fold * 0.4 * near);
    col = mix(col, uLineColor, clamp(line * uLine, 0.0, 1.0) * 0.76);

    // --- the paper -------------------------------------------------------------------
    float fibre = noise(vUv * aspect * vec2(520.0, 140.0)) * 0.6 + noise(vUv * aspect * vec2(140.0, 520.0)) * 0.4;
    float mottle = fbm(vUv * aspect * 6.0);
    col *= 0.965 + 0.04 * fibre;
    col *= 0.94 + 0.08 * mottle;

    // The picture does not run to the edge of the sheet: it dissolves into paper.
    float r = length((vUv - 0.5) * vec2(1.15, 1.0));
    float edge = smoothstep(0.5, 1.0, r + 0.08 * (fbm(vUv * aspect * 4.0) - 0.5));
    col = mix(col, uPaper * 0.985, edge * 0.6);

    col = mix(col, uVeilColor, uVeil);
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function InkPass({ scene }: { scene: PoemScene }) {
  const { gl, size, camera, scene: world } = useThree();

  const target = useMemo(() => {
    const rt = new THREE.WebGLRenderTarget(1, 1, {
      samples: 4,
      depthBuffer: true,
      depthTexture: new THREE.DepthTexture(1, 1, THREE.UnsignedIntType),
    });
    rt.texture.minFilter = THREE.LinearFilter;
    rt.texture.magFilter = THREE.LinearFilter;
    rt.texture.generateMipmaps = false;
    return rt;
  }, []);

  const post = useMemo(() => {
    const style = STYLES[scene.paint ?? 'dancai'];
    const mat = new THREE.ShaderMaterial({
      defines: { KUWAHARA_R: ink.light ? 2 : 3 },
      vertexShader: VERT,
      fragmentShader: FRAG,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        tColor: { value: target.texture },
        tDepth: { value: target.depthTexture },
        uRes: { value: new THREE.Vector2(1, 1) },
        uNear: { value: 0.4 },
        uFar: { value: 1600 },
        uPaper: { value: new THREE.Color(scene.palette.paper) },
        uInk: { value: new THREE.Color(scene.palette.ink) },
        uVeilColor: { value: new THREE.Color(scene.palette.paper) },
        uVeil: { value: 0 },
        uScale: { value: 1 },
        uAerial: { value: style.aerial },
        uLine: { value: style.line },
        uSat: { value: style.sat },
        uRampAmt: { value: style.rampAmt },
        uBleed: { value: style.bleed },
        uRamp0: { value: new THREE.Color(style.ramp[0]) },
        uRamp1: { value: new THREE.Color(style.ramp[1]) },
        uRamp2: { value: new THREE.Color(style.ramp[2]) },
        uLineColor: { value: new THREE.Color(style.lineColor ?? scene.palette.ink) },
        uCorner: { value: new THREE.Vector3(...(style.corner ?? [0, 0, 0])) },
        uFarTint: { value: new THREE.Color(style.farTint?.[0] ?? '#000000') },
        uFarTintAmt: { value: style.farTint?.[1] ?? 0 },
      },
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    quad.frustumCulled = false;
    const s = new THREE.Scene();
    s.add(quad);
    return { mat, quad, scene: s, cam: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1) };
  }, [target, scene]);

  useEffect(() => {
    const dpr = gl.getPixelRatio();
    const w = Math.max(1, Math.floor(size.width * dpr));
    const h = Math.max(1, Math.floor(size.height * dpr));
    target.setSize(w, h);
    post.mat.uniforms.uRes.value.set(w, h);
    post.mat.uniforms.uScale.value = dpr;
  }, [gl, size, target, post]);

  useEffect(() => {
    film.inkVeil = true;
    return () => {
      film.inkVeil = false;
      target.dispose();
      post.mat.dispose();
      post.quad.geometry.dispose();
    };
  }, [target, post]);

  // A priority above zero takes the render over from R3F.
  useFrame(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const u = post.mat.uniforms;
    u.uNear.value = cam.near;
    u.uFar.value = cam.far;
    const f = film.active ? film.fade * film.fade * (3 - 2 * film.fade) : 0;
    u.uVeil.value = f;

    camera.layers.disable(OVERLAY_LAYER);
    gl.setRenderTarget(target);
    gl.clear();
    gl.render(world, camera);
    gl.setRenderTarget(null);
    gl.render(post.scene, post.cam);

    // Then what falls, over the top — unless the film's paper veil is down.
    if (u.uVeil.value > 0.6) {
      camera.layers.enable(OVERLAY_LAYER);
      return;
    }
    const mask = camera.layers.mask;
    camera.layers.set(OVERLAY_LAYER);
    const auto = gl.autoClear;
    gl.autoClear = false;
    gl.render(world, camera);
    gl.autoClear = auto;
    camera.layers.mask = mask;
    camera.layers.enable(OVERLAY_LAYER);
  }, 1);

  return null;
}
