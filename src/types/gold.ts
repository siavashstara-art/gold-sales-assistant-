export type MarketMode = 'IR' | 'GLOBAL';
export type Language = 'fa' | 'en' | 'ar' | 'ku' | 'tr' | 'az' | 'hy' | 'es';
export type GlobalCurrency = 'USD' | 'AED' | 'EUR';
export type GoldKarat = 18 | 21 | 22 | 24 | 840 | 900 | 925 | 999;

export type ProductCategory =
  | 'ALL'
  | 'BRIDAL_SET'
  | 'BANGLE_CUFF'
  | 'NECKLACE'
  | 'RING'
  | 'CARTIER_BRACELET'
  | 'EARRINGS'
  | 'BULLION_COIN'
  | 'SILVER_VESSELS'
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
  retailMakingChargePercent: number;
  wholesaleMakingChargePercent: number;
  fixedMakingChargeUsdPerGram?: number;
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
  wholesaleGoldSettlementGrams: number;
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

export type RelatedJobSector =
  | 'GOLD_GALLERY'
  | 'GOLD_WHOLESALE'
  | 'SILVER_VESSELS'
  | 'SILVER_BULLION'
  | 'WORKSHOP_CASTING'
  | 'ASSAY_PLATING'
  | 'SECURITY_PACKAGING'
  | 'ACADEMY_DESIGN';

export interface EconomicAdItem {
  id: string;
  sector: RelatedJobSector;
  tariffPlan?: string;
  titleFa: string;
  titleEn: string;
  businessNameFa: string;
  businessNameEn: string;
  cityFa: string;
  cityEn: string;
  offerBadgeFa: string;
  offerBadgeEn: string;
  descriptionFa: string;
  descriptionEn: string;
  contactPhone: string;
  instagramHandle: string;
  createdAt: string;
}
