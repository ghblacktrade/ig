import { timingSafeEqual } from 'crypto';

export function safeEqualUtil(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) {
    return false;
  }

  return timingSafeEqual(ab, bb);
}
