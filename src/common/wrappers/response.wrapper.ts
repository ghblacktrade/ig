import { SimpleException } from './types/simpleException.type';

export type Result<T, E = SimpleException> = Ok<T, E> | Err<T, E>;
export type AsyncResult<T, E = SimpleException> = Promise<Result<T, E>>;

export class Ok<T, E> {
  constructor(protected value: T) {}

  public isOk(): this is Ok<T, E> {
    return true;
  }

  public isErr(): this is Err<T, E> {
    return false;
  }

  public ok(): T {
    return this.value;
  }

  public map<U>(fn: (value: T) => U): Result<U, E> {
    return ok(fn(this.value));
  }
}

export class Err<T, E> {
  constructor(protected error: E) {}

  public isOk(): this is Ok<T, E> {
    return false;
  }

  public isErr(): this is Err<T, E> {
    return true;
  }

  public err(): E {
    return this.error;
  }

  public map<U>(_fn: (value: T) => U): Result<U, E> {
    return err(this.error);
  }
}

export function ok<T, E>(value: T): Result<T, E> {
  return new Ok(value);
}

export function err<T, E>(value: E): Result<T, E> {
  return new Err(value);
}
