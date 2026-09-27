export type MarketMode = 'IR' | 'GLOBAL';
export type Language = 'fa' | 'en';
export type GlobalCurrency = 'USD' | 'AED' | 'EUR';
export type GoldKarat = 18 | 21 | 22 | 24 | 925;

export type ProductCategory =
  | 'ALL'
  | 'BRIDAL_SET'
  | 'BANGLE_CUFF'
  | 'NECKLACE'
  | 'RING'
  | 'CARTIER_BRACELET'
  | 'EARRINGS'
  | 'BULLION_COIN'
  | 'SILVER_925';

export interface JewelryProduct {
  id: string;
  code: string;
  category: Exclude<ProductCategory, 'ALL'>;
  nameFa: string;
  nameEn: string;
  categoryLabelFa: string;
  categoryLabelEn: string;
  weightGrams: number;
  defaultKarat: GoldKarat;
  retailMakingChargePercent: number; // اجرت ساخت تک‌فروشی (%)
  wholesaleMakingChargePercent: number; // اجرت بنکداری/کیفی همکار (%)
  fixedMakingChargeUsdPerGram?: number; // Global market making charge $/g
  imageUrl: string;
  craftOriginFa: string;
  craftOriginEn: string;
  specsFa: string;
  specsEn: string;
  inStock: boolean;
}

export interface MarketRatesState {
  gram18kToman: number;
  gram21kToman: number;
  gram24kToman: number;
  mithqalToman: number;
  coinEmamiToman: number;
  coinBaharToman: number;
  coinHalfToman: number;
  coinQuarterToman: number;
  coinGeramiToman: number;
  silver925GramToman: number;
  ounceUsd: number;
  silverOunceUsd: number;
  usdToToman: number;
  aedToToman: number;
  eurToToman: number;
  usdToAed: number;
  usdToEur: number;
  boardSpreadPercent: number;
  defaultProfitPercent: number;
  defaultTaxPercent: number;
  usedGoldDeductionPercent: number;
  galleryName: string;
  galleryPhone: string;
  galleryInstagram: string;
  updatedAt: string;
}

export interface PriceBreakdown {
  netWeightGrams: number;
  karat: GoldKarat;
  unitGramRate: number;
  rawGoldValue: number;
  makingChargeAmount: number;
  sellerProfitAmount: number;
  taxAmount: number;
  retailTotalPrice: number;
  // Wholesale B2B (بنکداری / کیفی طلا به طلا)
  wholesaleGoldSettlementGrams: number; // وزن طلا + درصد اجرت کارگاه به گرم طلای ۷۵۰
  wholesaleCashEquivalent: number;
  currencySymbol: string;
  currencyCode: 'TOMAN' | GlobalCurrency;
}

export interface VipTier {
  level: number;
  titleFa: string;
  titleEn: string;
  monthlyToman: string;
  monthlyGlobalUsd: string;
  audienceFa: string;
  audienceEn: string;
  featuresFa: string[];
  featuresEn: string[];
  highlighted?: boolean;
}

export interface AndroidFileItem {
  path: string;
  size: number;
  content: string;
}
