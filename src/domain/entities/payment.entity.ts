import { PaymentStatus } from '@src/domain/enums/paymentsStatus.enum';

export class Payment {
  constructor(
    readonly id: string,
    readonly provider: string,
    readonly status: PaymentStatus,
    readonly amount: number,
    readonly currency: string,
    readonly externalId?: string,
  ) {}
}
