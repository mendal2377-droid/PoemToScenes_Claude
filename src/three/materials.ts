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

// uHour: 0 dawn, 0.5 noon, 1 night.
vec3 applyHour(vec3 col){
  float night = smoothstep(0.62, 1.0, uHour);
  float dawn = 1.0 - smoothstep(0.0, 0.34, uHour);
  vec3 cool = vec3(0.46, 0.53, 0.72);
  vec3 warm = vec3(1.06, 0.92, 0.74);
  col = mix(col, col * cool + cool * 0.1, night * 0.56);
  col = mix(col, col * warm, dawn * 0.5);
  return col;
}

vec3 applyMist(vec3 col, float dist, float strength){
  // Tuned so the near range (~150) stays legible and the far range (~430) sits
  // back in the haze. Anything stronger and the mountains vanish entirely.
  float f = 1.0 - exp(-dist * 0.0011 * (0.4 + uMist * 1.6) * strength);
  // Fog at dusk is not a bright white sheet — it goes down with the light.
  float night = smoothstep(0.62, 1.0, uHour);
  vec3 fogCol = mix(uMistColor, uMistColor * vec3(0.38, 0.44, 0.62), night * 0.8);
  return mix(col, fogCol, clamp(f, 0.0, 0.88));
}
`;

const COMMON_UNIFORMS = (p: Palette) => ({
  uTime: shared.uTime,
  uWind: shared.uWind,
  uHour: shared.uHour,
  uMist: shared.uMist,
  uSnow: shared.uSnow,
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
      uniform vec3 uHigh, uLow, uOchre, uInk, uWater, uPaper, uMoonColor, uMoonDir;
      uniform float uSnow, uExtent, uGroveR;
      uniform float uTime;
      uniform vec2 uGrove;
      uniform sampler2D uMask;
      uniform sampler2D uPaperField;
      varying vec3 vW;
      varying vec3 vN;

      void main(){
        vec2 maskUv = vW.xz / (uExtent * 2.0) + 0.5;
        vec2 mask = texture2D(uMask, maskUv).rg;
        float vTrail = mask.r;
        float vWet = mask.g;
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

        // 皴 on anything steep enough to read as rock.
        float cun = cunTexture(vW, vN, 0.55);
        col = mix(col, uInk, cun * slope * 0.5);

        // 留白. Large patches where the brush simply never went — the ground
        // washes back to bare paper and everything else stops there too.
        float bai = smoothstep(0.58, 0.86, texture2D(uPaperField, maskUv).r);
        col = mix(col, uPaper * 1.02, bai * 0.72);

        // The trail the poem walks you along — but 万径人踪灭: once the snow
        // comes down, the paths go under it.
        float trail = smoothstep(0.24, 0.78, vTrail) * (1.0 - uSnow * 0.8);
        float trailEdge = fbm2(vW.xz * 1.1) * 0.3;
        col = mix(col, uOchre * (0.92 + trailEdge), trail * 0.62);
        // Grit underfoot, so the path is not a flat band of colour.
        float grit = step(0.88, hash21(floor(vW.xz * 5.5)));
        col = mix(col, uInk, trail * grit * 0.16);

        // Damp ground beside the water.
        col = mix(col, uWater, smoothstep(0.2, 1.0, vWet) * 0.4);

        // Snow settles on the flat, clings less to the steep.
        float snow = uSnow * smoothstep(0.55, 0.15, slope);
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
      uniform float uFarness, uSnow;
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
        float snowCap = uSnow * smoothstep(9.0, 0.5, drop);
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
      uniform float uSnow, uInkTone;
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

        col = mix(col, vec3(0.95, 0.96, 0.95), uSnow * 0.55 * smoothstep(0.3, 1.0, vUp));

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
    uniforms: {
      ...COMMON_UNIFORMS(p),
      uDark: { value: c(p.groundLow) },
      uLight: { value: c(p.grassTip) },
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
      varying float vUp;
      varying float vSeed;
      varying vec3 vW;
      void main(){
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vec3 anchor = (modelMatrix * vec4(aBase, 1.0)).xyz;
        wp.xyz += windSway(anchor, 1.35, aSeed * 6.283) * aUp * aUp;
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
      uniform float uSnow;
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
        col = mix(col, vec3(0.95, 0.96, 0.94), uSnow * vUp * 0.7);
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
      uniform float uSnow;
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
        col = mix(col, vec3(0.94, 0.95, 0.94), uSnow * 0.3 * clamp(vN.y, 0.0, 1.0));
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
      uniform float uSnow;
      varying vec3 vW;
      varying vec3 vN;
      void main(){
        vec3 col = mix(uPaper * 0.62, uBase, 0.6);
        float cun = cunTexture(vW * 1.6, vN, 1.6);
        col = mix(col, uInk, cun * 0.62);
        float rim = 1.0 - abs(dot(normalize(vN), normalize(cameraPosition - vW)));
        col = mix(col, uInk, pow(clamp(rim, 0.0, 1.0), 2.0) * 0.8);
        col = mix(col, vec3(0.96, 0.97, 0.96), uSnow * clamp(vN.y, 0.0, 1.0) * 0.8);
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
    uniforms: {
      ...COMMON_UNIFORMS(p),
      uWater: { value: c(p.water) },
      uDeep: { value: c(p.waterDeep) },
      uPaper: { value: c(p.paper) },
      uInk: { value: c(p.ink) },
      uMoon: { value: c(p.moon) },
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
      uniform vec3 uWater, uDeep, uPaper, uInk, uMoon;
      uniform float uTime;
      varying vec3 vW;
      varying vec2 vUv;
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
        col = mix(col, uPaper, line * 0.5);
        col = mix(col, uInk, smoothstep(0.7, 0.95, flow) * 0.12);

        // A streak of moonlight lying on the surface.
        float glint = smoothstep(7.0, 0.0, abs(vW.x + 4.0)) * (0.5 + 0.5 * sin(vW.z * 0.5 + t * 2.0));
        col = mix(col, uMoon, glint * smoothstep(0.62, 1.0, uHour) * 0.4);

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
      uInk: { value: c(p.ink) },
      uDir: { value: new THREE.Vector3(luminary.x, luminary.y, luminary.z).normalize() },
      uSize: { value: luminary.size },
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
      uniform vec3 uHigh, uLow, uPaper, uMoon, uInk, uDir;
      uniform float uSize, uHour, uMist, uTime;
      varying vec3 vDir;

      void main(){
        vec3 d = normalize(vDir);
        float up = clamp(d.y * 1.25 + 0.14, 0.0, 1.0);
        vec3 col = mix(uLow, uHigh, pow(up, 0.72));

        // Night cools and darkens the whole sky.
        float night = smoothstep(0.62, 1.0, uHour);
        col = mix(col, col * vec3(0.44, 0.5, 0.72), night * 0.72 * smoothstep(-0.04, 0.46, d.y));

        // Painted cloud bands — long horizontal fbm smears, kept off the zenith.
        vec2 cp = vec2(atan(d.z, d.x) * 1.6, d.y * 3.4 - uTime * 0.008);
        float cloud = fbm2(cp * vec2(1.0, 2.2) + vec2(uTime * 0.012, 0.0));
        float band = smoothstep(0.52, 0.78, cloud) * smoothstep(0.02, 0.28, d.y) * smoothstep(0.95, 0.5, d.y);
        vec3 cloudCol = mix(uPaper, uMoon, 0.45);
        col = mix(col, cloudCol, band * (0.55 - night * 0.2));
        // A thin ink edge along the top of each bank, the way clouds are outlined.
        float cedge = smoothstep(0.74, 0.8, cloud) * smoothstep(0.86, 0.8, cloud);
        col = mix(col, uInk, cedge * 0.1);

        // The moon (or a low sun) with a soft halo.
        float ang = dot(d, normalize(uDir));
        float disc = smoothstep(1.0 - uSize * uSize * 0.5, 1.0 - uSize * uSize * 0.42, ang);
        float halo = pow(clamp(ang, 0.0, 1.0), 130.0);
        col = mix(col, uMoon, halo * 0.45);
        col = mix(col, uMoon, disc);

        // Haze piling up on the horizon.
        col = mix(col, uPaper, (1.0 - smoothstep(-0.06, 0.34, d.y)) * (0.3 + uMist * 0.5));

        col = pigmentGrain(col, d * 40.0, 0.07);
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

export function makeSnowMaterial(p: Palette) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      ...COMMON_UNIFORMS(p),
      uColor: { value: c('#ffffff') },
    },
    vertexShader: /* glsl */ `
      attribute float aSeed;
      uniform float uTime, uWind, uSnow;
      varying float vSeed;
      varying float vA;
      void main(){
        vec3 pos = position;
        float fall = mod(uTime * (1.4 + aSeed * 1.6) + aSeed * 90.0, 46.0);
        pos.y = 42.0 - fall;
        pos.x += sin(uTime * 0.7 + aSeed * 30.0) * 2.4 * (0.4 + uWind);
        pos.z += cos(uTime * 0.55 + aSeed * 21.0) * 1.8 * (0.4 + uWind);
        vSeed = aSeed;
        vA = uSnow;
        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = (6.0 + aSeed * 9.0) * (26.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      varying float vSeed;
      varying float vA;
      void main(){
        vec2 p = gl_PointCoord * 2.0 - 1.0;
        float a = smoothstep(1.0, 0.2, length(p)) * vA * (0.4 + vSeed * 0.6);
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
      uniform float uSnow;
      varying vec3 vW;
      varying vec3 vN;
      void main(){
        vec3 col = uOchre;
        float straw = fbm2(vec2(vW.x * 9.0 + vW.z * 9.0, vW.y * 22.0));
        col = mix(col, uInk, smoothstep(0.48, 0.8, straw) * 0.5);
        col *= 0.8 + clamp(vN.y, 0.0, 1.0) * 0.35;
        col = mix(col, vec3(0.95, 0.96, 0.95), uSnow * clamp(vN.y, 0.0, 1.0) * 0.7);
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
