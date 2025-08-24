import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { validateEnv } from '@src/common/config/utils/env.valadate';
import { HmacService } from '@src/hmacService/hmac.service';
import { HttpModule } from '@nestjs/axios';
import { WebhooksController } from '@src/interface/http/webhooks.controller';
import { PaymentsController } from '@src/interface/http/payments.controller';
import { decard, papara } from '@src/common/config/providers.config';
import { CreatePayInUseCase } from '@src/domain/useCases/createPayIn.useCase';
import { CreatePayOutUseCase } from '@src/domain/useCases/createPayOut.UseCase';
import { ProviderResolver } from '@src/interface/http/provider.resolver';
import { PaparaAdapter } from '@src/infrastructure/adapters/papara/papara.adapter';
import { DeCardAdapter } from '@src/infrastructure/adapters/decard/decard.adapter';
import { GetStatusUseCase } from '@src/domain/useCases/getStatus.useCase';
import { InMemoryIdempotencyAdapter } from '@src/common/idempotency/adapters/inMemory.adapter';
import { IdempotencyPort } from '@src/common/idempotency/idempotency.port'
import { DeCardSignatureService } from '@src/infrastructure/adapters/decard/decardSignature.service';
import { MockGatewayAdapter } from '@src/infrastructure/mock/mock.adapter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv, load: [papara, decard] }),
    HttpModule.register({ timeout: 15_000, maxRedirects: 5 }),
  ],
  controllers: [AppController, WebhooksController, PaymentsController],
  providers: [
    HmacService,
    CreatePayInUseCase,
    CreatePayOutUseCase,
    GetStatusUseCase,
    ProviderResolver,
    PaparaAdapter,
    DeCardAdapter,
    DeCardSignatureService,
    MockGatewayAdapter,
    { provide: IdempotencyPort, useClass: InMemoryIdempotencyAdapter },
  ],
})
export class AppModule {}
