import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Megaphone,
  PlusCircle,
  Send,
  Volume2,
  Scale,
  CheckCircle2,
  Coins,
  Crown,
} from 'lucide-react';
import {
  EconomicAdItem,
  GlobalCurrency,
  GoldKarat,
  Language,
  MarketMode,
  MarketRatesState,
  RelatedJobSector,
} from '../types/gold';
import { calculateProductPrice, formatMoney, getUnitGramRate } from '../utils/goldPricing';
import { isRtlLanguage } from '../utils/i18n';

interface SilverAndAdsHubProps {
  rates: MarketRatesState;
  marketMode: MarketMode;
  globalCurrency: GlobalCurrency;
  lang: Language;
  themeMode: 'light' | 'dark';
  onSpeak: (text: string) => void;
}

export const SilverAndAdsHub: React.FC<SilverAndAdsHubProps> = ({
  rates,
  marketMode,
  globalCurrency,
  lang,
  themeMode,
  onSpeak,
}) => {
  // Silverware & Vessels Calculator State
  const [vesselType, setVesselType] = useState<string>('SAMOVAR_SET');
  const [silverWeightGrams, setSilverWeightGrams] = useState<number>(1850);
  const [silverKarat, setSilverKarat] = useState<GoldKarat>(840);
  const [engravingMakingPct, setEngravingMakingPct] = useState<number>(35);
  const [wholesaleSilverMakingPct, setWholesaleSilverMakingPct] = useState<number>(18);

  // Economic & Related Professions Advertising Hub State
  const [ads, setAds] = useState<EconomicAdItem[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [showNewAdForm, setShowNewAdForm] = useState<boolean>(false);
  const [newAdSector, setNewAdSector] = useState<RelatedJobSector>('SILVER_VESSELS');
  const [newAdTariff, setNewAdTariff] = useState<string>('VIP_PINNED');
  const [newAdTitle, setNewAdTitle] = useState('');
  const [newAdBusiness, setNewAdBusiness] = useState('');
  const [newAdCity, setNewAdCity] = useState('');
  const [newAdOffer, setNewAdOffer] = useState('');
  const [newAdDesc, setNewAdDesc] = useState('');
  const [newAdPhone, setNewAdPhone] = useState('');
  const [adSubmitted, setAdSubmitted] = useState(false);

  const isLight = themeMode === 'light';
  const isRtl = isRtlLanguage(lang);

  useEffect(() => {
    fetch('/api/ads')
      .then((r) => r.json())
      .then((data) => {
        if (data?.ads) setAds(data.ads);
      })
      .catch(() => {});
  }, []);

  const vesselPresets: Array<{
    id: string;
    labelFa: string;
    labelEn: string;
    weight: number;
    karat: GoldKarat;
    retailMaking: number;
    wholesaleMaking: number;
  }> = [
    {
      id: 'SAMOVAR_SET',
      labelFa: 'سرویس سماور ذغالی، قوری، جام و سینی نقره قلم‌زنی اصفهان',
      labelEn: 'Engraved Isfahan Silver Samovar, Tea Set & Tray',
      weight: 1850,
      karat: 840,
      retailMaking: 35,
      wholesaleMaking: 18,
    },
    {
      id: 'MIRROR_CANDELABRA',
      labelFa: 'آینه و شمعدان سلطنتی و جفت گلاب‌پاش نقره تبریز',
      labelEn: 'Royal Silver Bridal Mirror, Candelabra & Rosewater Set',
      weight: 2420,
      karat: 900,
      retailMaking: 32,
      wholesaleMaking: 16.5,
    },
    {
      id: 'ZANJAN_FILIGREE',
      labelFa: 'کشکول، شکلات‌خوری و سینی نقره ملیله‌کاری دست‌ساز زنجان',
      labelEn: 'Zanjan Handcrafted Filigree Silver Fruit & Sweet Bowl',
      weight: 640,
      karat: 925,
      retailMaking: 28,
      wholesaleMaking: 14,
    },
    {
      id: 'SILVER_BULLION_1KG',
      labelFa: 'شمش نقره ۱ کیلوگرمی و ساچمه نقره خالص ۹۹۹.۹ سرمایه‌گذاری',
      labelEn: '1kg Fine Silver Bullion Bar & 999.9 Silver Shot Granules',
      weight: 1000,
      karat: 999,
      retailMaking: 3,
      wholesaleMaking: 1.2,
    },
  ];

  // Official Advertising Tariff Packages for Related Professions (تعرفه‌های رسمی تبلیغات مشاغل مرتبط)
  const adTariffPackages = [
    {
      id: 'STANDARD',
      titleFa: 'پکیج ۱: آگهی استاندارد صنفی (ماهانه)',
      titleEn: 'Tier 1: Standard Trade Listing (Monthly)',
      priceToman: '۱,۵۰۰,۰۰۰ تومان / ماه',
      priceUsd: '$25 / month',
      featuresFa: [
        'ثبت در تالار مشاغل مرتبط طلا و نقره',
        'دکمه تماس و سفارش مستقیم واتساپ',
        'نمایش به طلافروشان و خریداران در ۸ زبان',
      ],
      featuresEn: [
        'Listed in Related Professions Directory',
        'Direct WhatsApp & Phone CTA button',
        'Visible across all 8 languages',
      ],
    },
    {
      id: 'VIP_PINNED',
      titleFa: 'پکیج ۲: آگهی ویژه سنجاق‌شده طلایی (پیشنهادی)',
      titleEn: 'Tier 2: VIP Pinned Gold Listing (Popular)',
      priceToman: '۳,۹۰۰,۰۰۰ تومان / ماه',
      priceUsd: '$65 / month',
      highlighted: true,
      featuresFa: [
        'سنجاق در صدر تالار تبلیغات با نشان تایید طلایی',
        'نمایش اولویت‌دار به بنکداران و گالری‌ها',
        'طراحی رایگان ۱ پوستر استوری ۱۰۸۰×۱۹۲۰ معرفی کسب‌وکار شما',
      ],
      featuresEn: [
        'Pinned at top of directory with VIP Gold Badge',
        'Priority exposure to B2B jewelers & galleries',
        'Includes 1 custom 1080x1920 HD Story ad design',
      ],
    },
    {
      id: 'MASTER_SPONSOR',
      titleFa: 'پکیج ۳: اسپانسر ویژه ویترین و تابلوی زنده (ماهانه)',
      titleEn: 'Tier 3: Master Showcase & Ticker Sponsor',
      priceToman: '۸,۵۰۰,۰۰۰ تومان / ماه',
      priceUsd: '$140 / month',
      featuresFa: [
        'نمایش ویژه به عنوان اسپانسر رسمی صنف (کارگاه/بنکداری/تجهیزات)',
        'معرفی مستقیم به تمام گالری‌های عضو باشگاه طلایار',
        'امکان درج لینک کاتالوگ و پیج اینستاگرام',
      ],
      featuresEn: [
        'Featured Sponsor badge across B2B showcase',
        'Direct promotion to member jewelry galleries',
        'Full catalog & Instagram integration',
      ],
    },
    {
      id: 'ANNUAL_PARTNER',
      titleFa: 'پکیج ۴: قرارداد سالانه طلایی همکاران صنعت (۴ ماه رایگان)',
      titleEn: 'Tier 4: Annual Industry Partner (4 Months Free)',
      priceToman: '۴۵,۰۰۰,۰۰۰ تومان / سال',
      priceUsd: '$750 / year',
      featuresFa: [
        'حضور دائمی ۱ ساله در صدر تمام دسته‌بندی‌های مرتبط',
        'شامل ۴ ماه هدیه رایگان + دریافت نسخه شخصی‌سازی‌شده برنامه',
        'ویژه بنکداران بزرگ، کارگاه‌های نقره و گاوصندوق‌سازان',
      ],
      featuresEn: [
        '12-month top placement across all categories',
        '4 months free + complimentary White-Label profile',
        'Ideal for major wholesalers, assay labs & vault makers',
      ],
    },
  ];

  const relatedJobSectors: Array<{ id: string; fa: string; en: string }> = [
    { id: 'ALL', fa: 'همه مشاغل مرتبط طلا و نقره', en: 'All Related Professions' },
    { id: 'SILVER_VESSELS', fa: 'نقره‌سراها و ظروف نقره قلم‌زنی/ملیله', en: 'Silverware & Vessels' },
    { id: 'GOLD_WHOLESALE', fa: 'بنکداران و پخش عمده طلا و زنجیر', en: 'Gold B2B Wholesale' },
    { id: 'SILVER_BULLION', fa: 'شمش، سکه و ساچمه نقره/طلا', en: 'Bullion, Coins & Shot' },
    { id: 'WORKSHOP_CASTING', fa: 'کارگاه طلاسازی، جواهرسازی و مخراج‌کاری', en: 'Manufacturing & Setting' },
    { id: 'ASSAY_PLATING', fa: 'ری‌گیری (تعیین عیار)، آبکاری و تعمیرات', en: 'Assay Labs & Plating' },
    { id: 'SECURITY_PACKAGING', fa: 'گاوصندوق، ترازو، جعبه و دکوراسیون طلافروشی', en: 'Vaults, Scales & Boxes' },
    { id: 'ACADEMY_DESIGN', fa: 'آموزشگاه طلاسازی و طراحی ۳ بعدی (Matrix)', en: 'CAD Design & Academies' },
    { id: 'GOLD_GALLERY', fa: 'گالری‌ها و ویترین‌های طلا و جواهر', en: 'Gold & Jewelry Galleries' },
  ];

  const handleSelectPreset = (presetId: string) => {
    setVesselType(presetId);
    const found = vesselPresets.find((p) => p.id === presetId);
    if (found) {
      setSilverWeightGrams(found.weight);
      setSilverKarat(found.karat);
      setEngravingMakingPct(found.retailMaking);
      setWholesaleSilverMakingPct(found.wholesaleMaking);
    }
  };

  const silverBreakdown = calculateProductPrice({
    weightGrams: silverWeightGrams,
    karat: silverKarat,
    retailMakingChargePercent: engravingMakingPct,
    wholesaleMakingChargePercent: wholesaleSilverMakingPct,
    profitPercent: rates.defaultProfitPercent,
    taxPercent: rates.defaultTaxPercent,
    rates,
    marketMode,
    globalCurrency,
  });

  const pure999SachmehSettlementGrams = Number(
    (
      silverBreakdown.wholesaleGoldSettlementGrams *
      (silverKarat === 840
        ? 0.84
        : silverKarat === 900
        ? 0.9
        : silverKarat === 925
        ? 0.925
        : 1)
    ).toFixed(2)
  );

  const handlePostNewAd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sector: newAdSector,
          tariffPlan: newAdTariff,
          titleFa: newAdTitle,
          titleEn: newAdTitle,
          businessNameFa: newAdBusiness,
          businessNameEn: newAdBusiness,
          cityFa: newAdCity,
          cityEn: newAdCity,
          offerBadgeFa: newAdOffer || 'تخفیف ویژه همکار و مشتری',
          offerBadgeEn: newAdOffer || 'Special Trade Offer',
          descriptionFa: newAdDesc,
          descriptionEn: newAdDesc,
          contactPhone: newAdPhone || rates.galleryPhone,
        }),
      });
      const data = await res.json();
      if (data?.ads) {
        setAds(data.ads);
        setAdSubmitted(true);
        setNewAdTitle('');
        setNewAdDesc('');
        setTimeout(() => {
          setAdSubmitted(false);
          setShowNewAdForm(false);
        }, 2500);
      }
    } catch {}
  };

  const filteredAds =
    selectedSector === 'ALL' ? ads : ads.filter((a) => a.sector === selectedSector);

  return (
    <div id="silver-ads" className="space-y-12">
      {/* Part A: Dedicated Silverware, Handcrafted Silver Vessels & Bullion Calculator */}
      <section
        className={`rounded-3xl border p-6 md:p-10 transition-colors ${
          isLight
            ? 'bg-white border-slate-200 shadow-sm text-slate-900'
            : 'bg-slate-900/70 border-slate-800 text-slate-100'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-amber-500/20">
          <div>
            <span className="text-xs font-semibold text-amber-500 tracking-wide">
              {isRtl
                ? '۰۱-ب. تالار تخصصی نقره‌سرا: ظروف و وسایل ساخته‌شده با نقره (قلم‌زنی، آینه و شمعدان، سماور، ملیله و شمش نقره)'
                : '01-B. Dedicated Silverware, Handcrafted Silver Vessels & 999 Silver Bullion Studio'}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mt-1">
              {isRtl
                ? 'محاسبه‌گر تخصصی ظروف نقره (عیار ۸۴، ۹۰، ۹۲۵) و شمش/ساچمه نقره (۹۹۹.۹) + تسویه ساچمه به ظرف'
                : 'Artisan Silverware (840/900/925) & Fine Silver (999.9) Pricing & B2B Granule Settlement'}
            </h2>
          </div>

          <button
            onClick={() =>
              onSpeak(
                isRtl
                  ? `بخش تخصصی ظروف و وسایل نقره. برای وزن ${silverWeightGrams} گرم نقره با عیار ${silverKarat} و اجرت قلم‌زنی ${engravingMakingPct} درصد، قیمت تک‌فروشی به مشتری ${formatMoney(silverBreakdown.retailTotalPrice, marketMode, globalCurrency, lang)} و تسویه عمده کارگاهی معادل ${pure999SachmehSettlementGrams} گرم ساچمه نقره خالص می‌باشد.`
                  : `Silverware calculator: For ${silverWeightGrams} grams of ${silverKarat} purity silver with ${engravingMakingPct}% artisan making charge, customer retail price is ${formatMoney(silverBreakdown.retailTotalPrice, marketMode, globalCurrency, lang)}, and B2B workshop settlement is ${pure999SachmehSettlementGrams} grams of pure 999 silver granules.`
              )
            }
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-500 font-bold text-sm cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            <span>{isRtl ? 'گوینده صوتی نقره‌سرا' : 'Speak Silver Calculation'}</span>
          </button>
        </div>

        {/* Live Silver Rates Banner (840, 900, 925, 999 & Global XAG Ounce) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 my-6">
          {([840, 900, 925, 999] as GoldKarat[]).map((k) => {
            const rate = getUnitGramRate(rates, marketMode, globalCurrency, k);
            return (
              <div
                key={k}
                className={`p-3.5 rounded-2xl border ${
                  silverKarat === k
                    ? 'border-2 border-amber-500 bg-amber-500/10'
                    : isLight
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-slate-950/80 border-slate-800'
                }`}
              >
                <span className="text-xs opacity-75 block font-semibold">
                  {k === 840
                    ? isRtl
                      ? 'گرم نقره عیار ۸۴ (ظروف اصفهان)'
                      : '840 Silver (Vessels)'
                    : k === 900
                    ? isRtl
                      ? 'گرم نقره عیار ۹۰ (ظروف تبریز)'
                      : '900 Silverware'
                    : k === 925
                    ? isRtl
                      ? 'گرم نقره ۹۲۵ استرلینگ'
                      : '925 Sterling Silver'
                    : isRtl
                    ? 'گرم نقره خالص ۹۹۹.۹ (ساچمه/شمش)'
                    : '999.9 Pure Silver'}
                </span>
                <span className="font-tabular font-bold text-base md:text-lg text-amber-500 mt-1 block">
                  {formatMoney(rate, marketMode, globalCurrency, lang)}
                </span>
              </div>
            );
          })}

          <div
            className={`p-3.5 rounded-2xl border ${
              isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-950/30 border-emerald-500/30'
            }`}
          >
            <span className="text-xs opacity-75 block font-semibold">
              {isRtl ? 'انس جهانی نقره (XAG/USD)' : 'Global Silver Ounce (XAG)'}
            </span>
            <span className="font-tabular font-bold text-base md:text-lg text-emerald-500 mt-1 block">
              ${rates.silverOunceUsd.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Preset Selector Buttons for Silver Vessels & Utensils */}
        <div className="mb-6">
          <label className="block text-xs font-bold mb-2 opacity-80">
            {isRtl
              ? 'انتخاب سریع نوع ظرف یا کالای نقره (امکان تغییر دستی وزن و اجرت):'
              : 'Quick Select Silverware Vessel / Item Type:'}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {vesselPresets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p.id)}
                className={`p-3.5 rounded-xl border text-right font-bold text-xs md:text-sm cursor-pointer transition-colors ${
                  vesselType === p.id
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : isLight
                    ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                    : 'bg-slate-950 border-slate-800 hover:bg-slate-900 text-slate-200'
                }`}
              >
                <div>{isRtl ? p.labelFa : p.labelEn}</div>
                <div className="font-tabular text-xs opacity-80 mt-1">
                  {p.weight}g · {p.karat} · {isRtl ? `اجرت ${p.retailMaking}٪` : `${p.retailMaking}% Making`}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Calculator Grid with Large Accessibility Touch Buttons */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div
            className={`lg:col-span-7 p-6 rounded-2xl border space-y-5 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/90 border-slate-800'
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1.5">
                  {isRtl
                    ? 'وزن ظرف / وسیله نقره روی ترازو (گرم):'
                    : 'Silver Vessel / Object Weight (Grams):'}
                </label>
                <input
                  type="number"
                  step="5"
                  min="1"
                  value={silverWeightGrams}
                  onChange={(e) => setSilverWeightGrams(Math.max(1, Number(e.target.value)))}
                  className={`w-full px-4 py-3 rounded-xl border font-tabular text-xl font-bold ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900'
                      : 'bg-slate-900 border-slate-700 text-amber-400'
                  }`}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {[-100, -50, +50, +100, +500].map((step) => (
                    <button
                      key={step}
                      type="button"
                      onClick={() =>
                        setSilverWeightGrams((prev) => Math.max(5, Number((prev + step).toFixed(1))))
                      }
                      className={`px-3 py-1.5 rounded-lg border font-tabular text-xs font-bold cursor-pointer ${
                        isLight
                          ? 'bg-white border-slate-300 hover:bg-amber-50'
                          : 'bg-slate-900 border-slate-700 hover:border-amber-400 text-amber-400'
                      }`}
                    >
                      {step > 0 ? `+${step}g` : `${step}g`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5">
                  {isRtl ? 'عیار ظرف یا شمش نقره:' : 'Silver Purity Standard:'}
                </label>
                <select
                  value={silverKarat}
                  onChange={(e) => setSilverKarat(Number(e.target.value) as GoldKarat)}
                  className={`w-full px-4 py-3 rounded-xl border font-tabular text-base font-bold ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900'
                      : 'bg-slate-900 border-slate-700 text-white'
                  }`}
                >
                  <option value={840}>
                    {isRtl
                      ? 'عیار ۸۴ سنتی ایران (۸۴۰ - ظروف قلم‌زنی اصفهان)'
                      : '840 Persian Traditional Silverware'}
                  </option>
                  <option value={900}>
                    {isRtl
                      ? 'عیار ۹۰ ظروف نقره (۹۰۰ - ظروف تبریز و صادراتی)'
                      : '900 Classic Export Silverware'}
                  </option>
                  <option value={925}>
                    {isRtl
                      ? 'عیار ۹۲۵ استرلینگ (ملیله زنجان و جواهرات نقره)'
                      : '925 Sterling Silver (Filigree & Jewelry)'}
                  </option>
                  <option value={999}>
                    {isRtl
                      ? 'عیار ۹۹۹.۹ نقره خالص (شمش و ساچمه کارگاهی)'
                      : '999.9 Pure Silver Bullion / Shot'}
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5">
                  {isRtl
                    ? 'اجرت قلم‌زنی و ساخت تک‌فروشی (%):'
                    : 'Artisan Engraving & Making Charge (%):'}
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={engravingMakingPct}
                  onChange={(e) => setEngravingMakingPct(Math.max(0, Number(e.target.value)))}
                  className={`w-full px-4 py-3 rounded-xl border font-tabular text-lg font-bold ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900'
                      : 'bg-slate-900 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5">
                  {isRtl
                    ? 'اجرت عمده بنکداری نقره (%):'
                    : 'B2B Workshop Silver Making (%):'}
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={wholesaleSilverMakingPct}
                  onChange={(e) => setWholesaleSilverMakingPct(Math.max(0, Number(e.target.value)))}
                  className={`w-full px-4 py-3 rounded-xl border font-tabular text-lg font-bold ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900'
                      : 'bg-slate-900 border-slate-700 text-emerald-400'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Right: Silverware Price Output */}
          <div
            className={`lg:col-span-5 p-6 rounded-2xl border-2 border-amber-500 space-y-4 ${
              isLight ? 'bg-amber-50/50' : 'bg-slate-950'
            }`}
          >
            <div className="flex items-center gap-2 text-amber-500 font-bold text-base">
              <Scale className="w-5 h-5" />
              <span>
                {isRtl
                  ? 'خروجی قیمت ظرف / کالای نقره (تک‌فروشی و عمده کارگاهی)'
                  : 'Silverware Retail & B2B Workshop Settlement'}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="opacity-75">
                  {isRtl ? 'ارزش نقره خام ظرف:' : 'Raw Silver Value:'}
                </span>
                <span className="font-tabular font-bold">
                  {formatMoney(
                    silverBreakdown.rawGoldValue,
                    marketMode,
                    globalCurrency,
                    lang
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-75">
                  {isRtl
                    ? `اجرت استادکار قلم‌زن (${engravingMakingPct}٪) + سود:`
                    : `Artisan Making (${engravingMakingPct}%) + Margin:`}
                </span>
                <span className="font-tabular font-bold">
                  {formatMoney(
                    silverBreakdown.makingChargeAmount + silverBreakdown.sellerProfitAmount,
                    marketMode,
                    globalCurrency,
                    lang
                  )}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-500 text-slate-950">
              <div className="text-xs font-bold">
                {isRtl
                  ? 'قیمت نهایی تک‌فروشی ظرف نقره به مشتری:'
                  : 'Customer Retail Price (Silverware):'}
              </div>
              <div className="text-2xl md:text-3xl font-bold font-tabular mt-1">
                {formatMoney(
                  silverBreakdown.retailTotalPrice,
                  marketMode,
                  globalCurrency,
                  lang
                )}
              </div>
            </div>

            <div
              className={`p-3.5 rounded-xl border ${
                isLight
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              }`}
            >
              <div className="text-xs font-bold">
                {isRtl
                  ? 'تسویه عمده کارگاهی (ساچمه ۹۹۹ به ظرف نقره):'
                  : 'B2B Workshop Settlement (Pure 999 Silver Shot):'}
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-2 mt-1 font-tabular">
                <span className="text-base font-bold text-emerald-500">
                  {pure999SachmehSettlementGrams}{' '}
                  {isRtl ? 'گرم ساچمه ۹۹۹ خالص' : 'g Pure 999 Shot'}
                </span>
                <span className="text-xs font-semibold">
                  ≈{' '}
                  {formatMoney(
                    silverBreakdown.wholesaleCashEquivalent,
                    marketMode,
                    globalCurrency,
                    lang
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Part B: Related Gold & Silver Professions Advertising Hub + Official Tariff Rate Card */}
      <section
        className={`rounded-3xl border p-6 md:p-10 transition-colors ${
          isLight
            ? 'bg-white border-slate-200 shadow-sm text-slate-900'
            : 'bg-slate-900/70 border-slate-800 text-slate-100'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-amber-500/20">
          <div>
            <span className="text-xs font-semibold text-emerald-500 tracking-wide">
              {isRtl
                ? '۰۱-ج. تالار جامع تبلیغات مشاغل مرتبط طلا، جواهر و نقره + جدول رسمی تعرفه‌های تبلیغاتی'
                : '01-C. Related Gold & Silver Professions Ad Network & Official Advertising Rate Card'}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mt-1">
              {isRtl
                ? 'تبلیغات بنکداران، کارگاه‌های طلاسازی، ظروف نقره، ری‌گیری، گاوصندوق، ترازو، جعبه و آموزشگاه‌ها'
                : 'Advertise Wholesalers, Silverware Ateliers, Assay Labs, Vaults, Packaging & CAD Academies'}
            </h2>
          </div>

          <button
            onClick={() => setShowNewAdForm(!showNewAdForm)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md cursor-pointer transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            <span>
              {isRtl
                ? 'ثبت آگهی شغل مرتبط و انتخاب تعرفه تبلیغاتی'
                : 'Post Related Profession Ad & Select Tariff'}
            </span>
          </button>
        </div>

        {/* Official Advertising Tariff Rate Card (جدول رسمی تعرفه‌های تبلیغات شغل‌های مرتبط) */}
        <div className="my-8">
          <div className="flex items-center gap-2 text-amber-500 font-bold text-base mb-4">
            <Coins className="w-5 h-5" />
            <h3>
              {isRtl
                ? 'جدول رسمی تعرفه‌های تبلیغات مشاغل مرتبط با طلا، جواهر، سکه و نقره:'
                : 'Official Advertising Tariffs for Related Gold, Jewelry & Silver Professions:'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {adTariffPackages.map((pkg) => (
              <div
                key={pkg.id}
                className={`rounded-2xl border p-5 flex flex-col justify-between ${
                  pkg.highlighted
                    ? 'border-2 border-amber-500 bg-amber-500/10'
                    : isLight
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-slate-950/90 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-amber-500">
                      {isRtl ? pkg.titleFa : pkg.titleEn}
                    </span>
                    {pkg.highlighted && <Crown className="w-4 h-4 text-amber-500 shrink-0" />}
                  </div>

                  <div className="text-lg font-bold text-emerald-500 font-tabular my-2">
                    {marketMode === 'IR' ? pkg.priceToman : pkg.priceUsd}
                  </div>

                  <ul className="space-y-1.5 text-xs mt-3">
                    {(isRtl ? pkg.featuresFa : pkg.featuresEn).map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setNewAdTariff(pkg.id);
                    setShowNewAdForm(true);
                  }}
                  className={`mt-5 w-full py-2.5 px-3 rounded-xl font-bold text-xs cursor-pointer transition-colors ${
                    pkg.highlighted
                      ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                      : 'bg-emerald-600 text-white hover:bg-emerald-500'
                  }`}
                >
                  {isRtl ? 'انتخاب این تعرفه و ثبت آگهی' : 'Select Tariff & Post Ad'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* New Economic Ad Submission Drawer */}
        {showNewAdForm && (
          <form
            onSubmit={handlePostNewAd}
            className={`my-6 p-6 rounded-2xl border-2 border-amber-500 space-y-4 ${
              isLight ? 'bg-amber-50/40' : 'bg-slate-950'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-amber-500 text-lg">
              <Megaphone className="w-5 h-5" />
              <span>
                {isRtl
                  ? 'درج آگهی جدید شغل مرتبط با صنعت طلا و نقره'
                  : 'Publish Related Gold & Silver Profession Advertisement'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1">
                  {isRtl ? 'رسته شغلی مرتبط:' : 'Related Profession Sector:'}
                </label>
                <select
                  value={newAdSector}
                  onChange={(e) => setNewAdSector(e.target.value as RelatedJobSector)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-semibold text-xs ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                  }`}
                >
                  {relatedJobSectors
                    .filter((s) => s.id !== 'ALL')
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {isRtl ? s.fa : s.en}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  {isRtl ? 'پکیج تعرفه انتخابی:' : 'Selected Ad Tariff:'}
                </label>
                <select
                  value={newAdTariff}
                  onChange={(e) => setNewAdTariff(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-semibold text-xs text-amber-500 ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                  }`}
                >
                  {adTariffPackages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {isRtl ? `${p.titleFa} (${p.priceToman})` : `${p.titleEn} (${p.priceUsd})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  {isRtl ? 'نام واحد صنفی / شرکت / کارگاه:' : 'Business / Workshop Name:'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isRtl ? 'مثلاً: گاوصندوق و ویترین‌سازی ایمن‌طلا' : 'e.g. Royal Silver Atelier'}
                  value={newAdBusiness}
                  onChange={(e) => setNewAdBusiness(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  {isRtl ? 'شهر و محدوده خدمات:' : 'City & Coverage:'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isRtl ? 'تهران / اصفهان / تبریز / سراسر کشور' : 'Tehran / Isfahan / Global'}
                  value={newAdCity}
                  onChange={(e) => setNewAdCity(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold mb-1">
                  {isRtl ? 'عنوان آگهی تبلیغاتی:' : 'Advertisement Headline:'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    isRtl
                      ? 'مثلاً: فروش مستقیم ترازوی ۰.۰۰۱ گرمی، جعبه مخمل طلاکوب و ظروف نقره قلم‌زنی'
                      : 'e.g. Direct Wholesale of Precision Scales, Velvet Boxes & Silverware'
                  }
                  value={newAdTitle}
                  onChange={(e) => setNewAdTitle(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  {isRtl ? 'شماره تماس / واتساپ:' : 'WhatsApp / Phone:'}
                </label>
                <input
                  type="tel"
                  required
                  placeholder="09120000000"
                  value={newAdPhone}
                  onChange={(e) => setNewAdPhone(e.target.value)}
                  dir="ltr"
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-tabular text-sm ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold mb-1">
                  {isRtl ? 'توضیحات کامل خدمات یا محصولات:' : 'Full Offer Details:'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    isRtl
                      ? 'توضیح درباره شرایط فروش، ضمانت، ارسال به شهرستان و مزایای همکاری...'
                      : 'Describe B2B/B2C terms, warranty, and delivery...'
                  }
                  value={newAdDesc}
                  onChange={(e) => setNewAdDesc(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  {isRtl ? 'شعار / تخفیف ویژه همکاران:' : 'Special Offer Highlight:'}
                </label>
                <input
                  type="text"
                  placeholder={isRtl ? 'مثلاً: ۱۰٪ تخفیف ویژه اعضای طلایار' : 'e.g. 10% Discount for Members'}
                  value={newAdOffer}
                  onChange={(e) => setNewAdOffer(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowNewAdForm(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-500/40 text-xs font-bold cursor-pointer"
              >
                {isRtl ? 'انصراف' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
              >
                {isRtl ? 'انتشار فوری آگهی در تالار مشاغل مرتبط' : 'Publish Profession Ad Now'}
              </button>
            </div>

            {adSubmitted && (
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isRtl
                    ? 'آگهی شغل مرتبط شما با موفقیت در تالار منتشر شد!'
                    : 'Your Related Profession Ad is now live!'}
                </span>
              </div>
            )}
          </form>
        )}

        {/* Filter Tabs for All 8 Related Professions */}
        <div className="flex items-center gap-2 overflow-x-auto my-6 pb-1">
          {relatedJobSectors.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedSector(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                selectedSector === tab.id
                  ? 'bg-amber-500 text-slate-950'
                  : isLight
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-900'
              }`}
            >
              {isRtl ? tab.fa : tab.en}
            </button>
          ))}
        </div>

        {/* Economic Ads Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAds.map((ad) => (
            <div
              key={ad.id}
              className={`rounded-2xl border p-6 flex flex-col justify-between ${
                isLight
                  ? 'bg-slate-50 border-slate-200 hover:border-amber-400'
                  : 'bg-slate-950/90 border-slate-800 hover:border-amber-500/50'
              }`}
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-amber-500 font-bold mb-2">
                  <span>{isRtl ? ad.businessNameFa : ad.businessNameEn}</span>
                  <span>{isRtl ? ad.cityFa : ad.cityEn}</span>
                </div>

                <h3 className="text-lg font-bold leading-snug">
                  {isRtl ? ad.titleFa : ad.titleEn}
                </h3>

                <div className="my-3 text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>{isRtl ? ad.offerBadgeFa : ad.offerBadgeEn}</span>
                </div>

                <p className="text-xs md:text-sm opacity-85 leading-relaxed">
                  {isRtl ? ad.descriptionFa : ad.descriptionEn}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-amber-500/15 flex flex-wrap items-center justify-between gap-3">
                <div className="font-tabular text-xs opacity-75">
                  {ad.contactPhone} · {ad.instagramHandle}
                </div>

                <a
                  href={`https://wa.me/${ad.contactPhone.replace(/^0/, '98').replace(/\D/g, '')}?text=${encodeURIComponent(
                    `سلام، آگهی «${ad.titleFa}» شما را در تالار مشاغل مرتبط طلایار جهانی دیدم و جهت همکاری/سفارش پیام می‌دهم.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {isRtl ? 'ارتباط مستقیم و سفارش در واتساپ' : 'Contact Advertiser on WhatsApp'}
                  </span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
