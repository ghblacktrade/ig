import { Result } from '@src/common/wrappers/response.wrapper';

export interface HmacServiceUseCase {

  signRaw(raw: Buffer | string, secret: string): Result<string>

  signWithTs(raw: Buffer | string, ts: string, secret: string): Result<string>
}