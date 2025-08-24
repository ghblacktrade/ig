import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

/**
 * Строит Apisign = sha256(secret + concatenated(values_sorted_by_key)
 * Значения берутся из payload/params; вложенные объекты форматируются
 */
@Injectable()
export class DeCardSignatureService {
  private pythonLikeStringify(obj: Record<string, any>): string {
    const entries = Object.entries(obj).sort(([a], [b]) => a.localeCompare(b));
    const parts = entries.map(([k, v]) => {
      const vs = v && !Array.isArray(v)
        ? this.pythonLikeStringify(v)
        : String(v);

      return `'${k}': '${vs}'`;
    });
    return `{${parts.join(', ')}}`;
  }

  private collectValuesSorted(payload: Record<string, any>): string[] {
    return Object.entries(payload)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([_, v]) => {
        if (v && !Array.isArray(v)) {
          return this.pythonLikeStringify(v);
        }

        return String(v);
      });
  }

  public buildApiSign(secret: string, data: Record<string, any>): string {
    const values = this.collectValuesSorted(data);
    const signStr = secret + values.join('');
    return createHash('sha256').update(signStr).digest('hex');
  }
}
