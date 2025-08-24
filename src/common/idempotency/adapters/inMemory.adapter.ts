import { Injectable } from '@nestjs/common';
import { IdempotencyPort } from '../idempotency.port';
import { AsyncResult, ok } from '@src/common/wrappers/response.wrapper';

@Injectable()
export class InMemoryIdempotencyAdapter implements IdempotencyPort {
  private readonly store = new Map<string, number>();

  constructor() {
    setInterval(() => {
      const now = Date.now();
      for (const [k, exp] of this.store.entries()) {
        if (exp <= now) {
          this.store.delete(k);
        }
      }
    }, 60_000).unref();
  }

  public async saveIfNotExists(key: string, ttlSec: number): AsyncResult<boolean> {
    const now = Date.now();
    const expAt = now + ttlSec * 1000;
    const exists = this.store.get(key);
    if (exists && exists > now) {
      return ok(false);
    }

    this.store.set(key, expAt);
    return ok(true);
  }
}
