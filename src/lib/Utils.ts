export function clamp(a: number, min: number, max: number) {
  return Math.max(min, Math.min(max, a));
}

export function clamp01(a: number) {
  return Math.max(0, Math.min(1, a));
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function smoothstep(a: number, b: number, t: number) {
  const x = clamp01((t - a) / (b - a));
  return x * x * (3 - 2 * x);
}

export function smoothstep01(t: number) {
  t = clamp01(t);
  return t * t * (3 - 2 * t);
}

export function smootherstep(a: number, b: number, t: number) {
  const x = clamp01((t - a) / (b - a));
  return x * x * x * (x * (x * 6 - 15) + 10);
}
