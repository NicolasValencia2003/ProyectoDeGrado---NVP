import type { Recommendation } from '../types';

let cache: Recommendation | null = null;

export const dashboardCache = {
  get: () => cache,
  set: (v: Recommendation) => { cache = v; },
  clear: () => { cache = null; },
};
