export function lerp(start: number, end: number, t: number) {
  return start * (1 - t) + end * t;
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
