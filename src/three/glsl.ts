/**
 * Shared GLSL. Everything in this scene is painted rather than lit: there are no
 * light sources, only colour ramps, hatching and brush-shaped alpha. Keeping the
 * chunks in one place is what makes the pines, the bamboo and the mountains look
 * like they came off the same brush.
 */

export const GLSL_NOISE = /* glsl */ `
float hash21(vec2 p){
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm2(vec2 p){
  float s = 0.0;
  float a = 0.5;
  for(int i = 0; i < 5; i++){
    s += vnoise(p) * a;
    p = p * 2.03 + vec2(17.1, 9.7);
    a *= 0.5;
  }
  return s / 0.96875;
}
`;

/** Brush-shaped alpha masks. All take uv in [0,1] and return coverage in [0,1]. */
export const GLSL_BRUSH = /* glsl */ `
// A single tapered stroke running along +x, with a frayed, un-inked edge.
float brushStroke(vec2 uv, float seed){
  vec2 p = uv * 2.0 - 1.0;
  float taper = 1.0 - pow(abs(p.x), 2.3);
  float fray = (fbm2(uv * vec2(7.0, 3.0) + seed * 13.7) - 0.5) * 0.9;
  float a = taper * (0.9 + fray * 0.35) - abs(p.y) * 1.05;
  return smoothstep(0.0, 0.22, a);
}

// A radiating fan of pine needles — the 车轮针 the old masters drew.
float pineNeedles(vec2 uv, float seed){
  vec2 p = uv * 2.0 - 1.0;
  p.y += 0.55;
  float r = length(p);
  float ang = atan(p.y, p.x);
  float streak = fbm2(vec2(ang * 9.0, r * 2.2) + seed * 21.3);
  float body = 1.0 - smoothstep(0.35, 1.05, r);
  float a = body * (0.55 + streak * 0.85) - 0.34;
  return smoothstep(0.0, 0.14, a);
}

// A bamboo leaf: pointed at both ends, thickest a third of the way along.
float bambooLeaf(vec2 uv){
  vec2 p = uv * 2.0 - 1.0;
  float w = pow(max(0.0, 1.0 - p.x * p.x), 0.72);
  float belly = 1.0 - 0.22 * (p.x + 1.0);
  float a = w * 0.46 * belly - abs(p.y - p.x * 0.12);
  return smoothstep(0.0, 0.05, a);
}

// A rounded, soft-edged dab — broadleaf canopies, moss, lily pads.
float inkDab(vec2 uv, float seed){
  vec2 p = uv * 2.0 - 1.0;
  float wobble = fbm2(p * 2.4 + seed * 9.1) - 0.5;
  float r = length(p) * (1.0 + wobble * 0.5);
  return smoothstep(1.0, 0.72, r);
}
`;

/**
 * 皴法 — the hatching that gives rock its texture. Lines follow the slope, break
 * up near the crest, and pool darker in the creases.
 */
export const GLSL_CUN = /* glsl */ `
float cunTexture(vec3 pos, vec3 nrm, float density){
  vec2 q = vec2(pos.x * 0.5 + pos.y * 0.22, pos.y * 0.9 - pos.z * 0.18);
  float lines = fbm2(q * density + vec2(0.0, pos.z * 0.08));
  float fine = fbm2(q * density * 2.7 + 31.0);
  float strokes = smoothstep(0.42, 0.62, lines) * 0.75 + smoothstep(0.55, 0.8, fine) * 0.25;
  // Slopes facing away from the viewer carry more ink.
  float facing = 1.0 - clamp(nrm.z * 0.5 + 0.5, 0.0, 1.0);
  return strokes * (0.45 + facing * 0.75);
}
`;

/** Wind. One field drives every blade, leaf and cloud so the scene breathes together. */
export const GLSL_WIND = /* glsl */ `
uniform float uTime;
uniform float uWind;

vec3 windSway(vec3 worldPos, float stiffness, float phase){
  float t = uTime * 0.85;
  float gust = fbm2(worldPos.xz * 0.045 + vec2(t * 0.22, 0.0));
  float amp = uWind * (0.35 + gust * 1.25) * stiffness;
  float s = sin(t * 1.7 + worldPos.x * 0.35 + worldPos.z * 0.21 + phase);
  float c = cos(t * 1.15 + worldPos.z * 0.29 + phase * 1.7);
  return vec3(s * amp, -abs(s) * amp * 0.18, c * amp * 0.55);
}
`;

/** Mineral pigment grain — 石青/石绿 are ground stone, and it shows. */
export const GLSL_PIGMENT = /* glsl */ `
vec3 pigmentGrain(vec3 col, vec3 pos, float amount){
  float g = fbm2(pos.xz * 3.1 + pos.y * 0.7);
  float speck = step(0.82, hash21(floor(pos.xz * 14.0) + floor(pos.y * 9.0)));
  col *= 1.0 + (g - 0.5) * amount;
  col += speck * amount * 0.09;
  return col;
}
`;

/** Every shader in the scene starts from the same prelude. */
export const PRELUDE = GLSL_NOISE + GLSL_BRUSH + GLSL_CUN + GLSL_PIGMENT;
