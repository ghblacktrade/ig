import { Injectable } from '@nestjs/common';
import { Payment } from '../entities/payment.entity';
import { PaymentGatewayPort } from '@src/domain/ports/paymentGateway.port';
import { AsyncResult, err } from '@src/common/wrappers/response.wrapper';
import { Currency } from '@src/domain/enums/currency.enum';
import { ERRORS } from '@src/domain/constants/errors';
import { SimpleException } from '@src/common/wrappers/types/simpleException.type';

@Injectable()
export class CreatePayInUseCase {
  public async exec(
    gateway: PaymentGatewayPort,
    params: { amount: number; currency: Currency.TRY; description?: string },
  ): AsyncResult<Payment> {
    if (params.amount <= 0) {
      return err(new SimpleException(ERRORS.VALIDATION_FAILED));
    }

    return gateway.createPayIn(params);
  }
}
