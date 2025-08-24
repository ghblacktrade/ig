import type { ZodError } from 'zod';
import { EnvConfigSchema } from '../env.schema';

export function validateEnv(env: Record<string, unknown>) {
  const parsed = EnvConfigSchema.safeParse(env);
  if (!parsed.success) {
    const e = parsed.error as ZodError;
    const msg = e.issues.map((i) => `${i.path.join('.') || '<root>'}: ${i.message}`).join('; ');
    throw new Error(`Invalid ENV: ${msg}`);
  }
  return parsed.data;
}