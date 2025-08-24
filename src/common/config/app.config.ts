import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  name: process.env.APP_NAME!,
  port: parseInt(process.env.PORT ?? '3000', 10),
  hmacAlgo: process.env.APP_HMAC_ALGO || 'sha256',
  signHeader: process.env.APP_SIGN_HEADER || 'X-Signature',
  tsHeader: process.env.APP_TS_HEADER || 'X-Timestamp',
}));
