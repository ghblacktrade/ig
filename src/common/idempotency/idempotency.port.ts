import { AsyncResult } from '@src/common/wrappers/response.wrapper';

export interface IdempotencyPort {
  /**
   * Пытается сохранить ключ и TTL, если ключа ещё нет.
   * @return true — успешно записали (обрабатывать событие), false — уже было (пропустить).
   */
  saveIfNotExists(key: string, ttlSec: number): AsyncResult<boolean>;
}

export const IdempotencyPort = Symbol.for('IdempotencyPort');
