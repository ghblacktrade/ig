import { PaymentStatus } from '@src/domain/enums/paymentsStatus.enum';

export function mapDecardStatus(s: any): PaymentStatus {
  const v = String(s ?? '').toLowerCase();
  if (['success'].includes(v)) {
    return PaymentStatus.SUCCESS;
  }

  if (['reversal', 'refund'].includes(v)) {
    return PaymentStatus.FAILED;
  }
  // bkb или все остальное
  return PaymentStatus.PENDING;
}

export function mapPaparaStatus(s: any): PaymentStatus {
  const v = String(s ?? '').toLowerCase();
  if (['completed', 'success', 'succeeded'].includes(v)) {
    return PaymentStatus.SUCCESS;
  }

  if (['failed', 'rejected', 'cancelled'].includes(v)) {
    return PaymentStatus.FAILED;
  }

  return PaymentStatus.PENDING;
}
