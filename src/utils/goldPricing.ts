import {
  GlobalCurrency,
  GoldKarat,
  MarketMode,
  MarketRatesState,
  PriceBreakdown,
} from '../types/gold';

const TROY_OUNCE_GRAMS = 31.1034768;

export function getKaratPurityRatio(karat: GoldKarat): number {
  switch (karat) {
    case 24:
      return 0.9999;
    case 22:
      return 22 / 24; // 0.9166
    case 21:
      return 21 / 24; // 0.875
    case 18:
      return 18 / 24; // 0.750
    case 925:
      return 0.925;
  }
}

export function getUnitGramRate(
  rates: MarketRatesState,
  marketMode: MarketMode,
  globalCurrency: GlobalCurrency,
  karat: GoldKarat
): number {
  if (marketMode === 'IR') {
    if (karat === 925) {
      return rates.silver925GramToman;
    }
    if (karat === 18) return rates.gram18kToman;
    if (karat === 21) return rates.gram21kToman;
    if (karat === 22) return Math.round((rates.gram18kToman * 22) / 18);
    return rates.gram24kToman;
  }

  // GLOBAL Market (USD, AED, EUR) based on Spot Ounce (XAU / XAG)
  const fxMultiplier =
    globalCurrency === 'USD'
      ? 1
      : globalCurrency === 'AED'
      ? rates.usdToAed
      : rates.usdToEur;

  if (karat === 925) {
    const pureSilverGramUsd = rates.silverOunceUsd / TROY_OUNCE_GRAMS;
    return Number((pureSilverGramUsd * 0.925 * fxMultiplier).toFixed(2));
  }

  const pure24kGramUsd = rates.ounceUsd / TROY_OUNCE_GRAMS;
  const karatFactor = karat / 24;
  return Number((pure24kGramUsd * karatFactor * fxMultiplier).toFixed(2));
}

export function calculateProductPrice(params: {
  weightGrams: number;
  karat: GoldKarat;
  retailMakingChargePercent: number;
  wholesaleMakingChargePercent: number;
  profitPercent: number;
  taxPercent: number;
  rates: MarketRatesState;
  marketMode: MarketMode;
  globalCurrency: GlobalCurrency;
}): PriceBreakdown {
  const {
    weightGrams,
    karat,
    retailMakingChargePercent,
    wholesaleMakingChargePercent,
    profitPercent,
    taxPercent,
    rates,
    marketMode,
    globalCurrency,
  } = params;

  const unitGramRate = getUnitGramRate(rates, marketMode, globalCurrency, karat);
  const rawGoldValue = weightGrams * unitGramRate;
  const makingChargeAmount = rawGoldValue * (retailMakingChargePercent / 100);
  const basePlusMaking = rawGoldValue + makingChargeAmount;
  const sellerProfitAmount = basePlusMaking * (profitPercent / 100);

  // Official Iran Gold & Jewelry Union Rule:
  // Tax (VAT) applies strictly to (Making Charge + Seller Profit), NOT the raw gold principal!
  // In Global Mode, VAT (e.g. 5% UAE VAT) is also calculated transparently on making+margin or total.
  const taxableBase = makingChargeAmount + sellerProfitAmount;
  const taxAmount = taxableBase * (taxPercent / 100);

  const retailTotalRaw = rawGoldValue + makingChargeAmount + sellerProfitAmount + taxAmount;
  const retailTotalPrice =
    marketMode === 'IR'
      ? Math.round(retailTotalRaw / 1000) * 1000
      : Number(retailTotalRaw.toFixed(2));

  // B2B Wholesale (بنکداری / کیفی همکار - طلا به طلا):
  // Weight + Workshop Making Charge % settled in standard gold weight
  const wholesaleGoldSettlementGrams = Number(
    (weightGrams * (1 + wholesaleMakingChargePercent / 100)).toFixed(3)
  );
  const wholesaleCashRaw = wholesaleGoldSettlementGrams * unitGramRate;
  const wholesaleCashEquivalent =
    marketMode === 'IR'
      ? Math.round(wholesaleCashRaw / 1000) * 1000
      : Number(wholesaleCashRaw.toFixed(2));

  const currencySymbol =
    marketMode === 'IR'
      ? 'تومان'
      : globalCurrency === 'USD'
      ? '$'
      : globalCurrency === 'AED'
      ? 'AED '
      : '€';

  return {
    netWeightGrams: weightGrams,
    karat,
    unitGramRate,
    rawGoldValue: marketMode === 'IR' ? Math.round(rawGoldValue) : Number(rawGoldValue.toFixed(2)),
    makingChargeAmount:
      marketMode === 'IR' ? Math.round(makingChargeAmount) : Number(makingChargeAmount.toFixed(2)),
    sellerProfitAmount:
      marketMode === 'IR' ? Math.round(sellerProfitAmount) : Number(sellerProfitAmount.toFixed(2)),
    taxAmount: marketMode === 'IR' ? Math.round(taxAmount) : Number(taxAmount.toFixed(2)),
    retailTotalPrice,
    wholesaleGoldSettlementGrams,
    wholesaleCashEquivalent,
    currencySymbol,
    currencyCode: marketMode === 'IR' ? 'TOMAN' : globalCurrency,
  };
}

export function formatMoney(
  amount: number,
  marketMode: MarketMode,
  globalCurrency: GlobalCurrency,
  lang: 'fa' | 'en'
): string {
  if (marketMode === 'IR') {
    const formatted = Math.round(amount).toLocaleString('en-US');
    return lang === 'fa' ? `${formatted} تومان` : `${formatted} Toman`;
  }
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (globalCurrency === 'USD') return `$${formatted}`;
  if (globalCurrency === 'AED') return `${formatted} AED`;
  return `€${formatted}`;
}
