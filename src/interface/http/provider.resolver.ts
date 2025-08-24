import { Injectable } from '@nestjs/common';
import { PaparaAdapter } from '@src/infrastructure/adapters/papara/papara.adapter';
import { DeCardAdapter } from '@src/infrastructure/adapters/decard/decard.adapter';
import { ConfigService } from '@nestjs/config';
import { MockGatewayAdapter } from '@src/infrastructure/mock/mock.adapter';

@Injectable()
export class ProviderResolver {
  constructor(
    private readonly papara: PaparaAdapter,
    private readonly decard: DeCardAdapter,
    private readonly mock: MockGatewayAdapter,
    private readonly config: ConfigService,
  ) {}

  resolve(name?: string) {
    const def = (name || this.config.get('DEFAULT_PROVIDER') || 'papara').toLowerCase();
    const useMock =
      (def === 'decard' && (this.config.get('DECARD_MOCK') === 'true')) ||
      (def === 'papara' && (this.config.get('PAPARA_MOCK') === 'true'));

    if (useMock) return this.mock;
    return def === 'decard' ? this.decard : this.papara;
  }
}
