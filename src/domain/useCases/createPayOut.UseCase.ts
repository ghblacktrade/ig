import { Injectable } from '@nestjs/common';
import { PaymentGatewayPort } from '@src/domain/ports/paymentGateway.port';
import { Currency } from '@src/domain/enums/currency.enum';
import { AsyncResult, err, ok } from '@src/common/wrappers/response.wrapper';
import { Payment } from '@src/domain/entities/payment.entity';
import { SimpleException } from '@src/common/wrappers/types/simpleException.type';
import { ERRORS } from '@src/domain/constants/errors';

@Injectable()
export class CreatePayOutUseCase {
  public async exec(
    gateway: PaymentGatewayPort,
    params: {
      amount: number;
      currency: Currency.TRY;
      receiver: { iban?: string; paparaAccountNo?: string; email?: string; phone?: string };
      description?: string;
    },
  ): AsyncResult<Payment> {
    if (params.amount <= 0) {
      return err(new SimpleException(ERRORS.VALIDATION_FAILED));
    }

    return gateway.createPayOut(params);
  }
}
