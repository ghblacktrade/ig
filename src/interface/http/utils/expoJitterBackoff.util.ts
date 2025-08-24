import { timer, Observable, throwError } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

export function expoJitterBackoff(maxRetries = 3, baseMs = 300, maxMs = 5000) {
  return (errors: Observable<any>) =>
    errors.pipe(
      mergeMap((error, attempt) => {
        if (attempt >= maxRetries) {
          return throwError(() => error);
        }

        const exp = Math.min(baseMs * Math.pow(2, attempt), maxMs);
        const jitter = Math.floor(Math.random() * (exp / 2));
        const delay = exp + jitter;
        return timer(delay);
      }),
    );
}
