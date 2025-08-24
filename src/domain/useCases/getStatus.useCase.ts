import { Injectable } from '@nestjs/common';
import { PaymentGatewayPort } from '@src/domain/ports/paymentGateway.port';
import { AsyncResult } from '@src/common/wrappers/response.wrapper';
import { Payment } from '@src/domain/entities/payment.entity';

@Injectable()
export class GetStatusUseCase {
  exec(gateway: PaymentGatewayPort, externalId: string): AsyncResult<Payment> {
    return gateway.getStatus(externalId);
  }
}