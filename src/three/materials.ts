import * as THREE from 'three';
import type { Palette } from '@/lib/types';
import { GLSL_NOISE, GLSL_BRUSH, GLSL_CUN, GLSL_PIGMENT } from './glsl';

/**
 * One uniform block, shared by reference across every material in the scene.
 * Three reads `uniform.value` at draw time, so writing here once per frame moves
 * the wind through the grass, the bamboo and the clouds in the same gust.
 */
export const shared = {
  uTime: { value: 0 },
  uWind: { value: 0.5 },
  uHour: { value: 0.8 },
  uMist: { value: 0.4 },
  uSnow: { value: 0 },
  /** How much of uSnow settles on surfaces — petals and leaves do not. */
  uAccum: { value: 1 },
  /** How overcast, 0–1. Greys and flattens everything; dims the sun and moon. */
  uCloud: { value: 0.2 },
  /** Snow actually lying on surfaces: ambient snow that settles, or the snow weather. */
  uCover: { value: 0 },
  /** Intensity of falling rain, and of falling snow weather. */
  uRain: { value: 0 },
  uWSnow: { value: 0 },
  /** A lightning flash, 0–1, decaying. */
  uFlash: { value: 0 },
  /** How far into a cave the viewer is, 0–1. The world goes dark; the torch stays lit. */
  uCave: { value: 0 },
  /** 1 when the traveller carries a torch, 0 otherwise. */
  uTorch: { value: 0 },
  /**
   * 风吹草低 — a gust that lays the grass down. How hard (0–1), and where its
   * front has got to along +x: grass behind the front is bowed, ahead of it stands.
   */
  uBow: { value: 0 },
  uBowFront: { value: -1e4 },
};

/**
 * The sun and moon, as vectors every material can hold a reference to. Written
 * once per frame from the clock; three reads the values at draw time, so the
 * pools of moonlight under the pines and the silver on the needles follow the
 * moon across the sky without anything being rebuilt.
 */
export const bodies = {
  sun: new THREE.Vector3(0, 1, 0),
  moon: new THREE.Vector3(0, 1, 0),
};

const c = (hex: string) => new THREE.Color(hex);

const PRELUDE = GLSL_NOISE + GLSL_BRUSH + GLSL_CUN + GLSL_PIGMENT;

/** Wind helper, declared after the shared uniforms so it can read them. */
const WIND_FN = /* glsl */ `
uniform float uTime;
uniform float uWind;

vec3 windSway(vec3 wp, float stiffness, float phase){
  float t = uTime * 0.85;
  float gust = fbm2(wp.xz * 0.045 + vec2(t * 0.22, 0.0));
  float amp = uWind * (0.35 + gust * 1.25) * stiffness;
  float s = sin(t * 1.7 + wp.x * 0.35 + wp.z * 0.21 + phase);
  float cs = cos(t * 1.15 + wp.z * 0.29 + phase * 1.7);
  return vec3(s * amp, -abs(s) * amp * 0.16, cs * amp * 0.5);
}
`;

/** Dusk / night tinting, applied at the end of every fragment shader. */
const ATMOS_FN = /* glsl */ `
uniform vec3 uMistColor;
uniform float uHour;
uniform float uMist;
uniform float uCloud;
uniform float uFlash;
uniform float uCave;
uniform float uTorch;

// uHour: 0 dawn, 0.5 noon, 1 night.
vec3 applyHour(vec3 col){
  float night = smoothstep(0.62, 1.0, uHour);
  float dawn = 1.0 - smoothstep(0.0, 0.34, uHour);
  vec3 cool = vec3(0.46, 0.53, 0.72);
  vec3 warm = vec3(1.06, 0.92, 0.74);
  col = mix(col, col * cool + cool * 0.1, night * 0.56);
  col = mix(col, col * warm, dawn * 0.5);

  // Overcast: the colour drains out of everything and the value drops a little,
  // which is most of what makes a grey day read as one without any lighting.
  float luma = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(col, vec3(luma) * 0.94, uCloud * 0.52);
  col *= 1.0 - uCloud * 0.16;

  // Lightning lights the whole valley at once, and only for a moment.
  col += vec3(0.62, 0.68, 0.86) * uFlash * 0.55;
  return col;
}

vec3 applyMist(vec3 col, float dist, float strength){
  // Tuned so the near range (~150) stays legible and the far range (~430) sits
  // back in the haze. Anything stronger and the mountains vanish entirely.
  float f = 1.0 - exp(-dist * 0.0011 * (0.4 + uMist * 1.6) * strength);
  // Fog at dusk is not a bright white sheet — it goes down with the light.
  float night = smoothstep(0.62, 1.0, uHour);
  vec3 fogCol = mix(uMistColor, uMistColor * vec3(0.38, 0.44, 0.62), night * 0.8);
  // Fog under cloud is a cold grey, not the warm paper of a clear morning.
  fogCol = mix(fogCol, vec3(dot(fogCol, vec3(0.333))) * 0.9, uCloud * 0.5);
  vec3 fogged = mix(col, fogCol, clamp(f, 0.0, 0.88));

  // Inside a cave the daylight is simply gone. Everything drops to near black,
  // and the only thing that stays visible is what the torch reaches — warm,
  // and falling off within a few paces. Distance is measured from the camera,
  // which follows the figure carrying it.
  float reach = exp(-dist * 0.115) * uTorch;
  vec3 lit = col * vec3(1.18, 0.9, 0.62) + vec3(0.07, 0.032, 0.0);
  vec3 black = fogged * vec3(0.03, 0.034, 0.055);
  return mix(fogged, mix(black, lit, reach * 0.94), uCave);
}
`;

const COMMON_UNIFORMS = (p: Palette) => ({
  uTime: shared.uTime,
  uWind: shared.uWind,
  uHour: shared.uHour,
  uMist: shared.uMist,
  uSnow: shared.uSnow,
  uAccum: shared.uAccum,
  uCloud: shared.uCloud,
  uCover: shared.uCover,
  uFlash: shared.uFlash,
  uCave: shared.uCave,
  uTorch: shared.uTorch,
  uMistColor: { value: c(p.mist) },
});

/* ------------------------------------------------------------------ terrain */

export function makeTerrainMaterial(p: Palette) {
  return new THREE.ShaderMaterial({
    uniforms: {
      ...COMMON_UNIFORMS(p),
      uHigh: { value: c(p.groundHigh) },
      uLow: { value: c(p.groundLow) },
      uOchre: { value: c(p.ochre) },
      uInk: { value: c(p.ink) },
      uWater: { value: c(p.waterDeep) },
      uMask: { value: null as THREE.Texture | null },
      uPaperField: { value: null as THREE.Texture | null },
      uExtent: { value: 1 },
      uPaper: { value: c(p.paper) },
      uMoonDir: { value: new THREE.Vector3(0, 1, 0) },
      uMoonColor: { value: c(p.moon) },
      uGrove: { value: new THREE.Vector2(0, 0) },
      uGroveR: { value: 1 },
      uGrassTip: { value: c(p.grassTip) },
      uGrassStroke: { value: 0.4 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vW;
      varying vec3 vN;
      void main(){
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vW = wp.xyz;
        vN = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader:
      PRELUDE +
      ATMOS_FN +
      /* glsl */ `
      uniform vec3 uHigh, uLow, uOchre, uInk, uWater, uPaper, uMoonColor, uMoonDir, uGrassTip;
      uniform float uSnow, uAccum, uCover, uExtent, uGroveR, uGrassStroke;
      uniform float uTime;
      uniform vec2 uGrove;
      uniform sampler2D uMask;
      uniform sampler2D uPaperField;
      varying vec3 vW;
      varying vec3 vN;

      void main(){
        vec2 maskUv = vW.xz / (uExtent * 2.0) + 0.5;
        vec3 mask = texture2D(uMask, maskUv).rgb;
        float vTrail = mask.r;
        float vWet = mask.g;
        float vSand = mask.b;
        float slope = clamp(1.0 - vN.y, 0.0, 1.0);
        float h = clamp(vW.y * 0.045 + 0.45, 0.0, 1.0);

        vec3 col = mix(uLow, uHigh, h);

        // 点苔 — moss dots. A landscape painter never draws every blade; they
        // dot the ground and let the eye fill it in.
        // Each dot is a disc measured from a jittered centre, not a shape drawn
        // into the cell's uv — the latter left the cell's square edge visible
        // wherever the blob ran past it. Jitter and radius are kept small enough
        // that a dot never crosses into the neighbouring cell.
        vec2 cell = floor(vW.xz * 2.3);
        vec2 jit = (vec2(hash21(cell), hash21(cell + 19.0)) - 0.5) * 0.4;
        vec2 centre = (cell + 0.5 + jit) / 2.3;
        float dd = distance(vW.xz, centre) * 2.3;
        float dots = step(0.79, hash21(cell + 3.0));
        float dotShape = smoothstep(0.28, 0.08, dd) * (0.7 + hash21(cell + 5.0) * 0.5);
        col = mix(col, uInk * 0.8 + uLow * 0.3, dots * dotShape * 0.34);

        // Broad washes so the ground is not a flat field of one green.
        float wash = fbm2(vW.xz * 0.035);
        col *= 0.86 + wash * 0.34;

        // Grass brushed into the ground.
        //
        // No number of 3D blades makes a steppe read as a sea of grass — 42,000
        // of them over a hundred-metre radius is about one per square metre.
        // A painter would not have modelled them either: they are combed into
        // the ground in long strokes that follow the lie of the land, and the
        // blades that do exist are accents on top.
        float lay = 0.7 + fbm2(vW.xz * 0.009) * 1.9;
        vec2 dir = vec2(cos(lay), sin(lay));
        vec2 gq = vec2(dot(vW.xz, dir), dot(vW.xz, vec2(-dir.y, dir.x)));
        float streak = fbm2(vec2(gq.x * 0.42, gq.y * 8.5));
        float blades = smoothstep(0.44, 0.74, streak) * uGrassStroke;
        col = mix(col, mix(col, uGrassTip, 0.62), blades * 0.55);
        col = mix(col, uLow * 0.82, smoothstep(0.34, 0.1, streak) * uGrassStroke * 0.3);

        // 皴 on anything steep enough to read as rock.
        float cun = cunTexture(vW, vN, 0.55);
        col = mix(col, uInk, cun * slope * 0.5);

        // 留白. Large patches where the brush simply never went — the ground
        // washes back to bare paper and everything else stops there too.
        float bai = smoothstep(0.58, 0.86, texture2D(uPaperField, maskUv).r);
        col = mix(col, uPaper * 1.02, bai * 0.72);

        // The trail the poem walks you along — but 万径人踪灭: once the snow
        // comes down, the paths go under it.
        float trail = smoothstep(0.24, 0.78, vTrail) * (1.0 - uCover * 0.8);
        float trailEdge = fbm2(vW.xz * 1.1) * 0.3;
        col = mix(col, uOchre * (0.92 + trailEdge), trail * 0.62);
        // Grit underfoot, so the path is not a flat band of colour.
        float grit = step(0.88, hash21(floor(vW.xz * 5.5)));
        col = mix(col, uInk, trail * grit * 0.16);

        // 汀上白沙 — a sandbar or a shingle bank: the ground gone pale.
        col = mix(col, vec3(0.94, 0.92, 0.84), smoothstep(0.22, 0.62, vSand) * 0.92);

        // Damp ground beside the water.
        col = mix(col, uWater, smoothstep(0.2, 1.0, vWet) * 0.4);

        // Snow settles on the flat, clings less to the steep.
        float snow = uCover * smoothstep(0.55, 0.15, slope);
        col = mix(col, vec3(0.96, 0.97, 0.95), snow * (0.72 + wash * 0.3));

        // 明月松间照 — pools of moonlight on the ground beneath the pines,
        // stretched along the moon's bearing and drifting as the branches move.
        // Without this the scene has the moon and the pines but not the 照.
        float night = smoothstep(0.46, 1.0, uHour);
        float grove = 1.0 - smoothstep(uGroveR * 0.3, uGroveR * 1.7, distance(vW.xz, uGrove));
        vec2 md = normalize(uMoonDir.xz + vec2(1e-4));
        vec2 q = vec2(dot(vW.xz, md), dot(vW.xz, vec2(-md.y, md.x)));
        float dapple = fbm2(q * vec2(0.13, 0.52) + vec2(uTime * 0.016, 0.0));
        float shafts = smoothstep(0.46, 0.78, dapple);
        col = mix(col, uMoonColor, grove * shafts * night * 0.5);

        col = pigmentGrain(col, vW, 0.2);
        col = applyHour(col);
        float d = length(vW - cameraPosition);
        col = applyMist(col, d, 1.0);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

/* ---------------------------------------------------------------- mountains */

/**
 * The painted ranges. Built as rings around the valley: `vTop` carries the
 * ridge height so the ink contour stays an even thickness no matter how tall
 * the peak is, and the inner contour lines fall at fixed drops below it —
 * which is how the striations in a 青绿山水 range are actually drawn.
 */
export function makeMountainMaterial(p: Palette, far: boolean) {
  return new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    transparent: false,
    uniforms: {
      ...COMMON_UNIFORMS(p),
      uFar: { value: c(p.mountainFar) },
      uNear: { value: c(p.mountainNear) },
      uInk: { value: c(p.ink) },
      uPaper: { value: c(p.paper) },
      uFarness: { value: far ? 1 : 0 },
    },
    vertexShader: /* glsl */ `
      attribute float aTop;
      attribute float aSeed;
      varying vec3 vW;
      varying float vTop;
      varying float vSeed;
      void main(){
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vW = wp.xyz;
        vTop = aTop;
        vSeed = aSeed;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader:
      PRELUDE +
      ATMOS_FN +
      /* glsl */ `
      uniform vec3 uFar, uNear, uInk, uPaper;
      uniform float uFarness, uSnow, uAccum, uCover;
      varying vec3 vW;
      varying float vTop;
      varying float vSeed;

      void main(){
        // Distance below the ridge line, in world units.
        float drop = vTop - vW.y;

        vec3 base = mix(uNear, uFar, uFarness);

        // Value runs light at the crest and deep at the root, which is what
        // separates one range from the one behind it without any lighting.
        float g = clamp(drop / 58.0, 0.0, 1.0);
        vec3 crest = mix(base, uPaper, 0.1);
        vec3 root = base * 0.72;
        vec3 col = mix(crest, root, pow(g, 0.8));

        // Contour striations that follow the ridge, warped so they are drawn
        // rather than ruled. This is the 皴 that models the rock face.
        float warp = fbm2(vec2(vW.x * 0.022 + vW.z * 0.02, vW.y * 0.05)) * 7.0;
        float band = fract((drop + warp) * 0.105);
        float stria = smoothstep(0.0, 0.08, band) * smoothstep(0.24, 0.1, band);
        col = mix(col, base * 0.46, stria * 0.34 * (1.0 - uFarness * 0.72));

        // A coarser grain over the body.
        float cun = fbm2(vec2(vW.x * 0.12 + vW.y * 0.05, vW.y * 0.17));
        col = mix(col, base * 0.55, smoothstep(0.55, 0.82, cun) * 0.22 * (1.0 - uFarness * 0.75));

        // 留白 — a pale band just under the crest, where the brush lifted.
        col = mix(col, mix(base, uPaper, 0.42), smoothstep(5.5, 0.9, drop) * 0.34);

        // The ink outline along the crest itself.
        col = mix(col, uInk, smoothstep(1.3, 0.0, drop) * 0.85);

        // Snow caps.
        float snowCap = uCover * smoothstep(9.0, 0.5, drop);
        col = mix(col, vec3(0.97, 0.98, 0.97), snowCap * 0.85);

        // Far ranges wash out into the paper — 远山无皴.
        col = mix(col, uPaper, uFarness * 0.16);

        col = pigmentGrain(col, vW * 0.35, 0.16);
        col = applyHour(col);
        float d = length(vW - cameraPosition);
        col = applyMist(col, d, 0.75 + uFarness * 0.7);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

/* ---------------------------------------------------------------- foliage */

export type FoliageKind = 'needle' | 'leaf' | 'dab';

/**
 * Every leafy thing in the scene draws from this: pre-baked quads carrying their
 * own anchor and height fraction, bent by the shared wind, masked into a brush
 * shape in the fragment stage.
 */
export function makeFoliageMaterial(p: Palette, kind: FoliageKind, stiffness = 1) {
  const maskCall =
    kind === 'needle'
      ? 'pineNeedles(vUv, vSeed)'
      : kind === 'leaf'
        ? 'bambooLeaf(vUv)'
        : 'inkDab(vUv, vSeed)';

  return new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    // Opaque on purpose: the fragment stage discards outside the brush mask, so
    // there is nothing to blend and nothing to sort.
    transparent: false,
    uniforms: {
      ...COMMON_UNIFORMS(p),
      uDark: { value: c(p.foliageDark) },
      uLight: { value: c(p.foliageLight) },
      uInk: { value: c(p.ink) },
      uStiffness: { value: stiffness },
      uStrokeCurl: { value: 0.35 },
      uInkTone: { value: 0.5 },
      uMoonDir: { value: new THREE.Vector3(0, 1, 0) },
      uMoonColor: { value: c(p.moon) },
    },
    vertexShader:
      PRELUDE +
      WIND_FN +
      /* glsl */ `
      attribute vec3 aBase;
      attribute float aUp;
      attribute float aSeed;
      attribute vec3 aTint;
      uniform float uStiffness;
      uniform float uStrokeCurl;
      varying vec2 vUv;
      varying float vSeed;
      varying vec3 vTint;
      varying vec3 vW;
      varying float vUp;
      varying vec3 vN;
      void main(){
        vN = normalize(mat3(modelMatrix) * normal);
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vec3 anchor = (modelMatrix * vec4(aBase, 1.0)).xyz;
        float bend = aUp * aUp;
        wp.xyz += windSway(anchor, uStiffness, aSeed * 6.283) * bend;
        // A little curl so the stroke is never a straight stick.
        wp.x += sin(aUp * 3.1 + aSeed * 6.0) * uStrokeCurl * aUp * 0.35;
        vUv = uv;
        vSeed = aSeed;
        vTint = aTint;
        vUp = aUp;
        vW = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader:
      PRELUDE +
      ATMOS_FN +
      /* glsl */ `
      uniform vec3 uDark, uLight, uInk, uMoonColor, uMoonDir;
      uniform float uSnow, uAccum, uCover, uInkTone;
      varying vec2 vUv;
      varying float vSeed;
      varying vec3 vTint;
      varying vec3 vW;
      varying float vUp;
      varying vec3 vN;

      void main(){
        float a = ${maskCall};
        if(a < 0.36) discard;

        vec3 col = mix(uDark, uLight, vSeed * 0.55 + vUp * 0.45);
        col = mix(col, vTint, 0.75);

        // Darker at the root of the stroke, where the brush pressed down.
        col = mix(col * 0.72, col, smoothstep(0.0, 0.5, vUv.x));
        col = mix(col, uInk, (1.0 - uInkTone) * 0.45);

        // A dry-brush edge, so the leaf does not look die-cut.
        float edge = smoothstep(0.36, 0.62, a);
        col = mix(uInk * 0.85 + col * 0.35, col, edge);

        col = mix(col, vec3(0.95, 0.96, 0.95), uCover * 0.55 * smoothstep(0.3, 1.0, vUp));

        // Leaves turned toward the moon catch a silver edge.
        float night = smoothstep(0.46, 1.0, uHour);
        float facing = max(0.0, dot(normalize(vN), normalize(uMoonDir)));
        col += uMoonColor * pow(facing, 1.5) * night * 0.34;

        col = applyHour(col);
        float d = length(vW - cameraPosition);
        col = applyMist(col, d, 1.0);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

/* ------------------------------------------------------------------- grass */

export function makeGrassMaterial(p: Palette) {
  return new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    depthWrite: false,
    uniforms: {
      ...COMMON_UNIFORMS(p),
      uDark: { value: c(p.groundLow) },
      uLight: { value: c(p.grassTip) },
      uBow: shared.uBow,
      uBowFront: shared.uBowFront,
      uInk: { value: c(p.ink) },
      uAccent: { value: c(p.accent) },
    },
    vertexShader:
      PRELUDE +
      WIND_FN +
      /* glsl */ `
      attribute vec3 aBase;
      attribute float aUp;
      attribute float aSeed;
      uniform float uBow, uBowFront;
      varying float vUp;
      varying float vSeed;
      varying vec3 vW;
      void main(){
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vec3 anchor = (modelMatrix * vec4(aBase, 1.0)).xyz;
        // A gust laying the grass down: it leans along +x and sinks to a third of
        // its height, behind a ragged front that travels across the plain.
        float front = uBowFront + (fbm2(anchor.xz * 0.06) - 0.5) * 22.0;
        float bow = uBow * smoothstep(front, front - 14.0, anchor.x) * (0.8 + 0.2 * aSeed);
        float h = wp.y - anchor.y;
        wp.y = anchor.y + h * (1.0 - 0.68 * bow);
        wp.x += h * 1.05 * bow;
        wp.xyz += windSway(anchor, 1.35 * (1.0 - 0.6 * bow), aSeed * 6.283) * aUp * aUp;
        vUp = aUp;
        vSeed = aSeed;
        vW = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader:
      PRELUDE +
      ATMOS_FN +
      /* glsl */ `
      uniform vec3 uDark, uLight, uInk, uAccent;
      uniform float uSnow, uAccum, uCover;
      varying float vUp;
      varying float vSeed;
      varying vec3 vW;
      void main(){
        // Sitting close to the ground in value is what stops each blade reading
        // as a separate prop stuck in the lawn.
        vec3 col = mix(uDark * 0.95, uLight, vUp * 0.8 + vSeed * 0.2);
        // A few tufts go autumn-coloured.
        col = mix(col, uAccent, step(0.95, vSeed) * vUp * 0.45);
        col = mix(col, uInk, (1.0 - vUp) * 0.16);
        col = mix(col, vec3(0.95, 0.96, 0.94), uCover * vUp * 0.7);
        col = applyHour(col);
        float d = length(vW - cameraPosition);
        col = applyMist(col, d, 1.0);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

/* ------------------------------------------------------------------- bark */

export function makeBarkMaterial(p: Palette) {
  return new THREE.ShaderMaterial({
    uniforms: {
      ...COMMON_UNIFORMS(p),
      uTrunk: { value: c(p.trunk) },
      uInk: { value: c(p.ink) },
    },
    vertexShader:
      PRELUDE +
      WIND_FN +
      /* glsl */ `
      attribute vec3 aBase;
      attribute float aUp;
      attribute float aSeed;
      varying vec3 vW;
      varying vec3 vN;
      varying float vUp;
      varying float vSeed;
      void main(){
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vec3 anchor = (modelMatrix * vec4(aBase, 1.0)).xyz;
        wp.xyz += windSway(anchor, 0.35, aSeed * 6.283) * aUp * aUp;
        vW = wp.xyz;
        vN = normalize(mat3(modelMatrix) * normal);
        vUp = aUp;
        vSeed = aSeed;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader:
      PRELUDE +
      ATMOS_FN +
      /* glsl */ `
      uniform vec3 uTrunk, uInk;
      uniform float uSnow, uAccum, uCover;
      varying vec3 vW;
      varying vec3 vN;
      varying float vUp;
      varying float vSeed;
      void main(){
        vec3 col = uTrunk;
        // Bark drawn in long dragged strokes up the trunk.
        float grain = fbm2(vec2(vW.x * 6.0 + vW.z * 6.0, vW.y * 1.1));
        col = mix(col, uInk, smoothstep(0.45, 0.75, grain) * 0.34);
        // Rim of ink on the shaded side.
        float rim = 1.0 - abs(dot(normalize(vN), normalize(cameraPosition - vW)));
        col = mix(col, uInk, pow(clamp(rim, 0.0, 1.0), 1.8) * 0.48);
        col = mix(col, vec3(0.94, 0.95, 0.94), uCover * 0.3 * clamp(vN.y, 0.0, 1.0));
        col = applyHour(col);
        col = applyMist(col, length(vW - cameraPosition), 1.0);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

/* ------------------------------------------------------------------- rock */

export function makeRockMaterial(p: Palette) {
  return new THREE.ShaderMaterial({
    uniforms: {
      ...COMMON_UNIFORMS(p),
      uInk: { value: c(p.ink) },
      uBase: { value: c(p.mountainNear) },
      uPaper: { value: c(p.paper) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vW;
      varying vec3 vN;
      void main(){
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vW = wp.xyz;
        vN = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader:
      PRELUDE +
      ATMOS_FN +
      /* glsl */ `
      uniform vec3 uInk, uBase, uPaper;
      uniform float uSnow, uAccum, uCover;
      varying vec3 vW;
      varying vec3 vN;
      void main(){
        vec3 col = mix(uPaper * 0.62, uBase, 0.6);
        float cun = cunTexture(vW * 1.6, vN, 1.6);
        col = mix(col, uInk, cun * 0.62);
        float rim = 1.0 - abs(dot(normalize(vN), normalize(cameraPosition - vW)));
        col = mix(col, uInk, pow(clamp(rim, 0.0, 1.0), 2.0) * 0.8);
        col = mix(col, vec3(0.96, 0.97, 0.96), uCover * clamp(vN.y, 0.0, 1.0) * 0.8);
        col = applyHour(col);
        col = applyMist(col, length(vW - cameraPosition), 1.0);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

/* ------------------------------------------------------------------ water */

export function makeWaterMaterial(p: Palette) {
  return new THREE.ShaderMaterial({
    transparent: true,
    // Ribbons of water (a brook, a river) are wound so their faces point down,
    // which culled them from above — the brook was never actually drawn, only
    // the wet ground beside it. Water is seen from either side.
    side: THREE.DoubleSide,
    uniforms: {
      ...COMMON_UNIFORMS(p),
      uWater: { value: c(p.water) },
      uDeep: { value: c(p.waterDeep) },
      uPaper: { value: c(p.paper) },
      uInk: { value: c(p.ink) },
      uMoon: { value: c(p.moon) },
      uSun: { value: c('#fff0c4') },
      uSunDir: { value: bodies.sun },
      uMoonDir: { value: bodies.moon },
    },
    vertexShader: /* glsl */ `
      varying vec3 vW;
      varying vec2 vUv;
      void main(){
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vW = wp.xyz;
        vUv = uv;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader:
      PRELUDE +
      ATMOS_FN +
      /* glsl */ `
      uniform vec3 uWater, uDeep, uPaper, uInk, uMoon, uSun, uSunDir, uMoonDir;
      uniform float uTime;
      varying vec3 vW;
      varying vec2 vUv;

      // The reflection of a light in a level surface is a column lying along the
      // bearing of that light as the viewer sees it. It widens as it recedes,
      // breaks into glitter on the small waves, and runs longer the lower the
      // light sits — which is why moonlight on a river is a road across it.
      float column(vec3 P, vec3 L, float t){
        vec2 rel = P.xz - cameraPosition.xz;
        vec2 dir = normalize(L.xz + vec2(1e-4));
        float along = dot(rel, dir);
        float across = abs(rel.x * dir.y - rel.y * dir.x);
        float wid = 2.0 + max(along, 0.0) * 0.06;
        float body = smoothstep(wid, 0.0, across) * step(0.0, along);
        float glitter = 0.45 + 0.55 * smoothstep(0.38, 0.8, fbm2(P.xz * 0.7 + vec2(t * 2.2, -t * 1.4)));
        float low = 1.0 - smoothstep(0.0, 0.85, L.y);
        return body * glitter * (0.35 + 0.65 * low);
      }

      void main(){
        float t = uTime * 0.28;
        // 留白 — the water is mostly bare paper with a few drawn ripple lines.
        float flow = fbm2(vec2(vW.x * 0.12, vW.z * 0.12 - t));
        float ripple = fract(flow * 4.0 + vW.z * 0.06 - t * 1.4);
        float line = smoothstep(0.0, 0.045, ripple) * smoothstep(0.14, 0.06, ripple);

        vec3 col = mix(uDeep, uWater, 0.35 + flow * 0.6);
        // Water in this tradition is nearly colourless — mostly paper, with a
        // few ripple lines drawn over it and a little ink pooled in the depths.
        col = mix(col, uPaper, 0.24);
        // Ripple lines are drawn near the viewer and let go with distance; over a
        // river a hundred metres across they otherwise read as contour lines.
        float near = 1.0 - smoothstep(40.0, 200.0, length(vW - cameraPosition)) * 0.85;
        col = mix(col, uPaper, line * 0.5 * near);
        col = mix(col, uInk, smoothstep(0.7, 0.95, flow) * 0.12);

        // The moon by night, the sun by day, each only while above the horizon
        // and fading under cloud.
        float night = smoothstep(0.55, 0.85, uHour);
        float moonUp = clamp(uMoonDir.y * 4.0, 0.0, 1.0);
        float sunUp = clamp(uSunDir.y * 4.0, 0.0, 1.0);
        col = mix(col, uMoon, column(vW, uMoonDir, t) * night * moonUp * (1.0 - uCloud * 0.8) * 0.8);
        col = mix(col, uSun, column(vW, uSunDir, t) * (1.0 - night) * sunUp * (1.0 - uCloud * 0.85) * 0.6);

        col = applyHour(col);
        col = applyMist(col, length(vW - cameraPosition), 0.85);
        gl_FragColor = vec4(col, 0.93);
      }
    `,
  });
}

/* -------------------------------------------------------------------- sky */

export function makeSkyMaterial(p: Palette, luminary: { x: number; y: number; z: number; size: number; kind: 'moon' | 'sun' }) {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      ...COMMON_UNIFORMS(p),
      uHigh: { value: c(p.skyHigh) },
      uLow: { value: c(p.skyLow) },
      uPaper: { value: c(p.paper) },
      uMoon: { value: c(p.moon) },
      uSun: { value: c('#fff0c4') },
      uInk: { value: c(p.ink) },
      // The vectors are shared with every other material that needs to know
      // where the light is; they are moved in place, never replaced.
      uSunDir: { value: bodies.sun },
      uMoonDir: { value: bodies.moon },
      // The authored body keeps the size the poem's composition gave it.
      uSunSize: { value: luminary.kind === 'sun' ? luminary.size : 0.078 },
      uMoonSize: { value: luminary.kind === 'moon' ? luminary.size : 0.1 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main(){
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader:
      PRELUDE +
      /* glsl */ `
      uniform vec3 uHigh, uLow, uPaper, uMoon, uSun, uInk, uSunDir, uMoonDir;
      uniform float uSunSize, uMoonSize, uHour, uMist, uTime, uCloud, uFlash, uCave;
      varying vec3 vDir;

      // A disc with a soft rim, and a halo whose reach is set by its size.
      float disc(vec3 d, vec3 dir, float size){
        float ang = dot(d, normalize(dir));
        return smoothstep(1.0 - size * size * 0.5, 1.0 - size * size * 0.42, ang);
      }

      void main(){
        vec3 d = normalize(vDir);
        vec3 sd = normalize(uSunDir);
        vec3 md = normalize(uMoonDir);

        float up = clamp(d.y * 1.25 + 0.14, 0.0, 1.0);
        vec3 col = mix(uLow, uHigh, pow(up, 0.72));

        // Night cools and darkens the whole sky, the zenith first.
        float night = smoothstep(0.62, 1.0, uHour);
        col = mix(col, col * vec3(0.44, 0.5, 0.72), night * 0.72 * smoothstep(-0.04, 0.46, d.y));

        // Sunrise and sunset: the horizon warms on the side the sun is on.
        // Strongest while the sun is low, gone once it has climbed.
        float sunLow = smoothstep(-0.14, 0.05, sd.y) * (1.0 - smoothstep(0.16, 0.5, sd.y));
        float toward = pow(max(dot(d.xz, normalize(sd.xz + 1e-4)), 0.0), 2.2);
        float glow = sunLow * toward * (1.0 - smoothstep(0.0, 0.55, d.y));
        col = mix(col, vec3(1.0, 0.62, 0.36), glow * 0.55 * (1.0 - uCloud * 0.6));
        col += vec3(0.32, 0.14, 0.05) * glow * 0.4 * (1.0 - uCloud);

        // Stars, on a clear night, once the moon has left them room.
        vec2 sg = vec2(atan(d.z, d.x) * 230.0, d.y * 230.0);
        float star = step(0.9968, hash21(floor(sg)));
        float twinkle = 0.55 + 0.45 * sin(uTime * (1.4 + hash21(floor(sg) + 3.0) * 2.5) + hash21(floor(sg)) * 6.28);
        float sky = night * smoothstep(0.08, 0.4, d.y) * (1.0 - uCloud) * (1.0 - 0.75 * max(md.y, 0.0));
        col += vec3(0.95, 0.95, 1.0) * star * twinkle * sky;

        // Painted cloud bands. Cover follows uCloud: a clear sky keeps a few
        // streaks, and a full overcast closes the whole dome.
        // Mapped onto a plane above the viewer rather than by compass angle: an
        // angle wraps from +π to −π, and the clouds broke along a seam there.
        vec2 cp = d.xz / max(d.y + 0.28, 0.06) * 0.55 + vec2(0.0, -uTime * 0.008);
        float cloud = fbm2(cp * vec2(1.0, 2.2) + vec2(uTime * 0.012, 0.0));
        float lo = mix(0.54, 0.16, uCloud);
        float band = smoothstep(lo, lo + 0.26, cloud) * smoothstep(0.0, 0.2, d.y + uCloud * 0.12);
        band *= mix(smoothstep(0.95, 0.5, d.y), 1.0, uCloud);
        vec3 cloudCol = mix(uPaper, uMoon, 0.45);
        // Storm cloud is slate, and darker still at night.
        cloudCol = mix(cloudCol, vec3(0.5, 0.53, 0.58), uCloud * 0.6);
        cloudCol *= 1.0 - night * 0.5;
        col = mix(col, cloudCol, band * (0.55 - night * 0.2 + uCloud * 0.42));
        // A thin ink edge along the top of each bank, the way clouds are outlined.
        float cedge = smoothstep(0.74, 0.8, cloud) * smoothstep(0.86, 0.8, cloud);
        col = mix(col, uInk, cedge * 0.1 * (1.0 - uCloud * 0.5));

        // Overcast greys the sky itself and pulls it toward the paper.
        float luma = dot(col, vec3(0.299, 0.587, 0.114));
        col = mix(col, vec3(luma) * 0.96, uCloud * 0.5);

        // The sun and the moon, each fading under cloud and below the horizon.
        float seen = 1.0 - uCloud * 0.9;
        float sunUp = smoothstep(-0.05, 0.05, sd.y);
        float moonUp = smoothstep(-0.05, 0.05, md.y);
        float sunHalo = pow(clamp(dot(d, sd), 0.0, 1.0), 60.0);
        float moonHalo = pow(clamp(dot(d, md), 0.0, 1.0), 130.0);
        col = mix(col, uSun, sunHalo * 0.5 * sunUp * seen);
        col = mix(col, uSun, disc(d, sd, uSunSize) * sunUp * seen);
        col = mix(col, uMoon, moonHalo * 0.45 * moonUp * seen * night);
        col = mix(col, uMoon, disc(d, md, uMoonSize) * moonUp * seen * smoothstep(0.55, 0.8, uHour));

        // Haze piling up on the horizon.
        col = mix(col, uPaper, (1.0 - smoothstep(-0.06, 0.34, d.y)) * (0.3 + uMist * 0.5));

        col = pigmentGrain(col, d * 40.0, 0.07);
        col += vec3(0.62, 0.68, 0.86) * uFlash * 0.7;
        col *= 1.0 - uCave * 0.95;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

/* ------------------------------------------------------------------- mist */

export function makeMistMaterial(p: Palette) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
    uniforms: {
      ...COMMON_UNIFORMS(p),
      uColor: { value: c(p.mist) },
    },
    vertexShader:
      PRELUDE +
      /* glsl */ `
      attribute float aSeed;
      attribute vec3 aAnchor;
      uniform float uTime;
      uniform float uWind;
      varying vec2 vUv;
      varying float vSeed;
      varying vec3 vW;
      void main(){
        vec3 anchor = (modelMatrix * vec4(aAnchor, 1.0)).xyz;
        // Turn to face the camera, but only about Y — mist lies flat on the land.
        vec3 toCam = cameraPosition - anchor;
        float a = atan(toCam.x, toCam.z);
        float s = sin(a);
        float cc = cos(a);
        vec3 local = position;
        vec3 wp = anchor + vec3(local.x * cc + local.z * s, local.y, -local.x * s + local.z * cc);
        wp += vec3(sin(uTime * 0.07 + aSeed * 6.0) * 6.0, 0.0, cos(uTime * 0.05 + aSeed * 4.0) * 4.0) * uWind;
        vUv = uv;
        vSeed = aSeed;
        vW = wp;
        gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
      }
    `,
    fragmentShader:
      PRELUDE +
      /* glsl */ `
      uniform vec3 uColor;
      uniform float uMist, uHour, uTime;
      varying vec2 vUv;
      varying float vSeed;
      varying vec3 vW;
      void main(){
        vec2 p = vUv * 2.0 - 1.0;
        float body = smoothstep(1.0, 0.1, length(p * vec2(0.62, 1.6)));
        float wisp = fbm2(vUv * vec2(4.0, 2.0) + vec2(uTime * 0.03 + vSeed * 9.0, vSeed * 3.0));
        float a = body * smoothstep(0.32, 0.72, wisp) * uMist * 0.55;
        if(a < 0.01) discard;
        vec3 col = mix(uColor, uColor * vec3(0.6, 0.66, 0.82), smoothstep(0.62, 1.0, uHour));
        gl_FragColor = vec4(col, a);
      }
    `,
  });
}

/* ------------------------------------------------------------------- snow */

/**
 * Whatever is drifting down: 雪, 桂花 or 落木.
 *
 * One shader for all three because the difference is only in weight — snow
 * falls fast and straight and is round; a petal is lighter, wanders further and
 * tumbles; a leaf is heavier than a petal but broader, so it swings hardest of
 * all. `uFall` selects between them.
 */
export function makeFallMaterial(
  p: Palette,
  fall: { kind: string; color: string; size: number },
  /** Which shared uniform sets how much of this is falling. */
  amount: { value: number }
) {
  const kindIndex = fall.kind === 'petal' ? 1 : fall.kind === 'leaf' ? 2 : fall.kind === 'rain' ? 3 : 0;
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      ...COMMON_UNIFORMS(p),
      uColor: { value: c(fall.color) },
      uSize: { value: fall.size },
      uFall: { value: kindIndex },
      uAmount: amount,
    },
    vertexShader: /* glsl */ `
      attribute float aSeed;
      uniform float uTime, uWind, uAmount, uSize, uFall;
      varying float vSeed;
      varying float vA;
      varying float vSpin;
      void main(){
        vec3 pos = position;
        // Heavier things fall faster and wander less.
        float speed = uFall < 0.5 ? 1.4 : (uFall < 1.5 ? 0.62 : (uFall < 2.5 ? 0.85 : 15.0));
        float wander = uFall < 0.5 ? 1.0 : (uFall < 1.5 ? 2.6 : (uFall < 2.5 ? 2.0 : 0.0));
        float drop = mod(uTime * (speed + aSeed * speed * (uFall > 2.5 ? 0.25 : 1.1)) + aSeed * 90.0, 46.0);
        pos.y = 42.0 - drop;
        pos.x += sin(uTime * 0.7 + aSeed * 30.0) * 2.4 * wander * (0.4 + uWind);
        pos.z += cos(uTime * 0.55 + aSeed * 21.0) * 1.8 * wander * (0.4 + uWind);
        // Rain is driven sideways by the wind, more the further it has fallen.
        if(uFall > 2.5) pos.x += drop * uWind * 0.11;
        vSeed = aSeed;
        vA = uAmount;
        // Petals and leaves turn over as they go; snow does not.
        vSpin = uFall < 0.5 ? 0.0 : uTime * (0.8 + aSeed * 2.2) + aSeed * 6.283;
        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        float base = uFall > 2.5 ? 22.0 + aSeed * 10.0 : 6.0 + aSeed * 9.0;
        gl_PointSize = base * uSize * (26.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uFall;
      varying float vSeed;
      varying float vA;
      varying float vSpin;
      void main(){
        vec2 q = gl_PointCoord * 2.0 - 1.0;
        float a;
        if(uFall < 0.5){
          a = smoothstep(1.0, 0.2, length(q));
        } else if(uFall > 2.5){
          // A streak: a hair-thin vertical line, brighter at its head.
          a = smoothstep(0.1, 0.02, abs(q.x)) * smoothstep(1.0, 0.7, abs(q.y)) * (0.5 + 0.5 * (q.y * 0.5 + 0.5));
        } else {
          // A tumbling blade: the spin squashes it as it turns edge-on.
          float s = sin(vSpin), cc = cos(vSpin);
          vec2 r = vec2(q.x * cc - q.y * s, q.x * s + q.y * cc);
          r.x /= max(0.25, abs(cos(vSpin * 0.7)));
          a = smoothstep(1.0, 0.25, length(r * vec2(1.0, 2.1)));
        }
        a *= vA * (0.4 + vSeed * 0.6);
        if(a < 0.02) discard;
        gl_FragColor = vec4(uColor, a);
      }
    `,
  });
}

/* ------------------------------------------------------------------ thatch */

export function makeThatchMaterial(p: Palette) {
  return new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: {
      ...COMMON_UNIFORMS(p),
      uOchre: { value: c(p.ochre) },
      uInk: { value: c(p.ink) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vW;
      varying vec3 vN;
      void main(){
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vW = wp.xyz;
        vN = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader:
      PRELUDE +
      ATMOS_FN +
      /* glsl */ `
      uniform vec3 uOchre, uInk;
      uniform float uSnow, uAccum, uCover;
      varying vec3 vW;
      varying vec3 vN;
      void main(){
        vec3 col = uOchre;
        float straw = fbm2(vec2(vW.x * 9.0 + vW.z * 9.0, vW.y * 22.0));
        col = mix(col, uInk, smoothstep(0.48, 0.8, straw) * 0.5);
        col *= 0.8 + clamp(vN.y, 0.0, 1.0) * 0.35;
        col = mix(col, vec3(0.95, 0.96, 0.95), uCover * clamp(vN.y, 0.0, 1.0) * 0.7);
        col = applyHour(col);
        col = applyMist(col, length(vW - cameraPosition), 1.0);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

/* ------------------------------------------------------------- flat ink --- */

/** Solid ink, for the boat hull, the figure, the pavilion posts. */
export function makeInkMaterial(p: Palette, tint?: string) {
  return new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: {
      ...COMMON_UNIFORMS(p),
      uInk: { value: c(tint ?? p.ink) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vW;
      varying vec3 vN;
      void main(){
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vW = wp.xyz;
        vN = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader:
      PRELUDE +
      ATMOS_FN +
      /* glsl */ `
      uniform vec3 uInk;
      varying vec3 vW;
      varying vec3 vN;
      void main(){
        vec3 col = uInk * (0.72 + clamp(vN.y, 0.0, 1.0) * 0.5);
        float grain = fbm2(vW.xz * 7.0 + vW.y * 3.0);
        col *= 0.86 + grain * 0.3;
        col = applyHour(col);
        col = applyMist(col, length(vW - cameraPosition), 1.0);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

/** The herd: cattle in the herd's colour, sheep in pale wool (`aWool`). */
export function makeHerdMaterial(p: Palette, tint: string) {
  return new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: {
      ...COMMON_UNIFORMS(p),
      uInk: { value: c(tint) },
      uWool: { value: c('#e6dcc4') },
    },
    vertexShader: /* glsl */ `
      attribute float aWool;
      varying vec3 vW;
      varying vec3 vN;
      varying float vWool;
      void main(){
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vW = wp.xyz;
        vN = normalize(mat3(modelMatrix) * normal);
        vWool = aWool;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader:
      PRELUDE +
      ATMOS_FN +
      /* glsl */ `
      uniform vec3 uInk, uWool;
      varying vec3 vW;
      varying vec3 vN;
      varying float vWool;
      void main(){
        vec3 base = mix(uInk, uWool, vWool);
        vec3 col = base * (0.72 + clamp(vN.y, 0.0, 1.0) * 0.5);
        float grain = fbm2(vW.xz * 7.0 + vW.y * 3.0);
        col *= 0.86 + grain * 0.3;
        col = applyHour(col);
        col = applyMist(col, length(vW - cameraPosition), 1.0);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

/* ----------------------------------------------------------------- shadow */

/** A soft ink pool under a standing figure. */
export function makeContactShadowMaterial(p: Palette) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uInk: { value: c(p.ink) } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main(){
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk;
      varying vec2 vUv;
      void main(){
        float d = length(vUv * 2.0 - 1.0);
        float a = smoothstep(1.0, 0.1, d) * 0.3;
        if(a < 0.01) discard;
        gl_FragColor = vec4(uInk, a);
      }
    `,
  });
}

/* ------------------------------------------------------------------- glow */

/**
 * A soft point of light: a lamp in a window, a torch, the glimmer at the far end
 * of a passage. Additive, so it lights nothing but reads as light, and depth
 * tested, so a hill hides it the way it would hide a real one.
 *
 * `aAlways` marks the ones that burn in daylight too — the light at the mouth of
 * the cave is meant to be seen at any hour, a lamp in a window only after dark.
 */
export function makeGlowMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: shared.uTime, uHour: shared.uHour, uCave: shared.uCave },
    vertexShader: /* glsl */ `
      attribute float aSize;
      attribute float aAlways;
      attribute vec3 aColor;
      attribute float aSeed;
      uniform float uTime, uHour, uCave;
      varying vec3 vColor;
      varying float vA;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float night = smoothstep(0.5, 0.86, uHour);
        // Always-on lights, and every light once the world has gone dark.
        float on = max(max(aAlways, night), uCave);
        // Fire never holds still.
        float flicker = 0.78 + 0.22 * sin(uTime * 7.0 + aSeed * 40.0) * sin(uTime * 3.1 + aSeed * 13.0);
        vA = on * flicker;
        vColor = aColor;
        gl_PointSize = clamp(aSize * 300.0 / max(-mv.z, 1.0), 2.0, 260.0);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      varying float vA;
      void main(){
        float d = length(gl_PointCoord * 2.0 - 1.0);
        // A hot core inside a wide, fast-falling halo.
        float a = pow(max(1.0 - d, 0.0), 2.2) + pow(max(1.0 - d * 1.6, 0.0), 3.0) * 0.8;
        a *= vA;
        if(a < 0.01) discard;
        gl_FragColor = vec4(vColor * a, a);
      }
    `,
  });
}

/* ------------------------------------------------------------------- birds */

export function makeBirdMaterial(p: Palette) {
  return new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: {
      ...COMMON_UNIFORMS(p),
      uInk: { value: c(p.ink) },
      uPale: { value: c('#f2f0e8') },
    },
    vertexShader: /* glsl */ `
      attribute vec3 aCenter;
      attribute vec4 aParams;   // radius, angular speed, phase, size
      attribute float aPale;
      uniform float uTime;
      varying vec3 vW;
      varying float vPale;
      void main(){
        float r = aParams.x;
        float sp = aParams.y;
        float ph = aParams.z;
        float sz = aParams.w;
        float a = uTime * sp + ph;
        // Every bird flies its own circuit: a slightly different radius, and
        // rising and sinking a little on its own rhythm.
        float rr = r * (0.55 + 0.45 * fract(ph * 7.31));
        vec3 orb = aCenter + vec3(
          cos(a) * rr,
          sin(uTime * 0.9 + ph * 5.0) * 1.3 + fract(ph * 3.7) * 3.2,
          sin(a) * rr
        );
        vec3 tang = normalize(vec3(-sin(a), 0.0, cos(a)) * sign(sp));
        vec3 right = vec3(-tang.z, 0.0, tang.x);
        float flap = sin(uTime * (9.0 + fract(ph * 5.3) * 4.0) + ph * 20.0);
        vec3 wp = orb
          + right * position.x * sz
          + tang * position.z * sz
          + vec3(0.0, abs(position.x) * flap * 0.55 * sz, 0.0);
        vW = wp;
        vPale = aPale;
        gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
      }
    `,
    fragmentShader:
      PRELUDE +
      ATMOS_FN +
      /* glsl */ `
      uniform vec3 uInk, uPale;
      varying vec3 vW;
      varying float vPale;
      void main(){
        vec3 col = mix(uInk, uPale, vPale);
        col = applyHour(col);
        col = applyMist(col, length(vW - cameraPosition), 1.0);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}
