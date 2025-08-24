import { z } from 'zod';

export const EnvConfigSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3000),

    APP_NAME: z.string().default('try-payments'),

    DEFAULT_PROVIDER: z.enum(['papara', 'decard']).default('decard'),

    PAPARA_MOCK: z.string().optional(),
    DECARD_MOCK: z.string().optional(),

    DECARD_BASE_URL: z.string().url().default('https://decard.me'),
    DECARD_API_KEY: z.string().optional(),
    DECARD_API_SECRET: z.string().optional(),

    PAPARA_BASE_URL: z.string().url().optional(),
    PAPARA_API_KEY: z.string().optional(),

    APP_HMAC_ALGO: z.enum(['sha256', 'sha512']).default('sha256'),
    APP_SIGN_HEADER: z.string().default('X-Signature'),
    APP_TS_HEADER: z.string().default('X-Timestamp'),
  })
  .superRefine((env, ctx) => {
    const isPaparaRequired = env.DEFAULT_PROVIDER === 'papara' && env.PAPARA_MOCK !== 'true';
    const isDecardRequired = env.DEFAULT_PROVIDER === 'decard' && env.DECARD_MOCK !== 'true';

    if (isPaparaRequired) {
      if (!env.PAPARA_BASE_URL)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'PAPARA_BASE_URL is required',
          path: ['PAPARA_BASE_URL'],
        });
      if (!env.PAPARA_API_KEY)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'PAPARA_API_KEY is required',
          path: ['PAPARA_API_KEY'],
        });
    }
    if (isDecardRequired) {
      if (!env.DECARD_API_KEY)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'DECARD_API_KEY (shop_key) is required',
          path: ['DECARD_API_KEY'],
        });
      if (!env.DECARD_API_SECRET)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'DECARD_API_SECRET (secret_key) is required',
          path: ['DECARD_API_SECRET'],
        });
    }
  });
