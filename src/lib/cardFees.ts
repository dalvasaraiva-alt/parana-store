export type CardBrand = 'visa_mastercard' | 'elo_amex';

const VISA_MASTERCARD_FEES = {
  debit: 0.0079,
  credit: {
    1: 0.0269,
    2: 0.0369,
    3: 0.0469,
    4: 0.0629,
    5: 0.0679,
    6: 0.0739,
    7: 0.0759,
    8: 0.0829,
    9: 0.0899,
    10: 0.0988,
    11: 0.1149,
    12: 0.1169,
  },
};

const ELO_AMEX_FEES = {
  debit: 0.0134,
  credit: {
    1: 0.0324,
    2: 0.0434,
    3: 0.0534,
    4: 0.0694,
    5: 0.0744,
    6: 0.0804,
    7: 0.0824,
    8: 0.0894,
    9: 0.0964,
    10: 0.1014,
    11: 0.1214,
    12: 0.1234,
  },
};

export function getCardFeeRate(
  paymentMethod: string,
  cardBrand: string | null,
  installments: number
): number {
  if (paymentMethod === 'debit_card') {
    if (cardBrand === 'elo_amex') {
      return ELO_AMEX_FEES.debit;
    }
    return VISA_MASTERCARD_FEES.debit;
  }

  if ((paymentMethod === 'credit_card' || paymentMethod === 'payment_link') && installments > 0) {
    const numInstallments = Math.min(Math.max(installments, 1), 12) as keyof typeof VISA_MASTERCARD_FEES.credit;

    if (cardBrand === 'elo_amex') {
      return ELO_AMEX_FEES.credit[numInstallments];
    }
    return VISA_MASTERCARD_FEES.credit[numInstallments];
  }

  return 0;
}

export function calculateCardFee(
  amount: number,
  paymentMethod: string,
  cardBrand: string | null,
  installments: number
): number {
  const feeRate = getCardFeeRate(paymentMethod, cardBrand, installments);
  return amount * feeRate;
}

export function getCardBrandLabel(cardBrand: string | null): string {
  if (cardBrand === 'visa_mastercard') return 'Visa / Mastercard';
  if (cardBrand === 'elo_amex') return 'Elo / Amex';
  return '';
}

export function getFeePercentageLabel(
  paymentMethod: string,
  cardBrand: string | null,
  installments: number
): string {
  const rate = getCardFeeRate(paymentMethod, cardBrand, installments);
  return `${(rate * 100).toFixed(2)}%`;
}