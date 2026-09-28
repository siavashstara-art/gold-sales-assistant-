import React, { useEffect, useState } from 'react';
import {
  Globe,
  Smartphone,
  Tv,
  Sliders,
  Sun,
  Moon,
  Eye,
  Volume2,
  RefreshCw,
  Calculator,
  Camera,
  Send,
  X,
  CheckCircle2,
  QrCode,
  Sparkles,
  Layers,
} from 'lucide-react';
import { INITIAL_PRODUCTS } from './data/products';
import {
  GlobalCurrency,
  GoldKarat,
  JewelryProduct,
  Language,
  MarketMode,
  MarketRatesState,
  ProductCategory,
} from './types/gold';
import { calculateProductPrice, formatMoney, isSilverKarat } from './utils/goldPricing';
import { getLocalizedHeroStrings, isRtlLanguage, LANGUAGES_LIST } from './utils/i18n';
import { usePWAInstall } from './hooks/usePWAInstall';
import { QuickRateAdjustModal, TvDisplayModal } from './components/TvDisplayModal';
import { SilverAndAdsHub } from './components/SilverAndAdsHub';
import { TradeInCalculator } from './components/TradeInCalculator';
import { StoryMakerSection } from './components/StoryMakerSection';
import { QrPassportSection } from './components/QrPassportSection';
import { AndroidGithubSection } from './components/AndroidGithubSection';
import { AiVipClubSection } from './components/AiVipClubSection';
import {
  getInitialCachedRatesSync,
  loadLastKnownRatesFromCache,
  saveRatesToOfflineCache,
} from './utils/offlineRatesCache';

const DEFAULT_RATES: MarketRatesState = {
  gram18kToman: 6485000,
  gram21kToman: 7565800,
  gram24kToman: 8646600,
  mithqalToman: 28091000,
  coinEmamiToman: 74800000,
  coinBaharToman: 71200000,
  coinHalfToman: 42900000,
  coinQuarterToman: 24600000,
  coinGeramiToman: 11400000,
  silver925GramToman: 98500,
  ounceUsd: 2942.5,
  silverOunceUsd: 33.4,
  usdToToman: 91400,
  aedToToman: 24950,
  eurToToman: 98900,
  usdToAed: 3.6725,
  usdToEur: 0.924,
  boardSpreadPercent: 1.2,
  defaultProfitPercent: 7,
  defaultTaxPercent: 10,
  usedGoldDeductionPercent: 1.5,
  galleryName: 'گالری طلا، جواهر و نقره‌سرای سلطنتی طلایار',
  galleryPhone: '09120000000',
  galleryInstagram: '@TalaYar.Global.VIP',
  updatedAt: new Date().toISOString(),
};

type ActiveSectionFocus =
  | 'ALL'
  | 'SHOWCASE'
  | 'SILVER_ADS'
  | 'TRADE_IN'
  | 'QR_PASS'
  | 'STORY'
  | 'ANDROID'
  | 'MONETIZE';

export default function App() {
  const [marketMode, setMarketMode] = useState<MarketMode>('IR');
  const [lang, setLang] = useState<Language>('fa');
  const [globalCurrency, setGlobalCurrency] = useState<GlobalCurrency>('USD');
  const [selectedGlobalKarat, setSelectedGlobalKarat] = useState<GoldKarat>(18);

  // Theme & Accessibility (White Light / Royal Dark + Large Fonts + ADHD Zen Single-Task Mode)
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');
  const [fontScale, setFontScale] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [adhdFocus, setAdhdFocus] = useState<boolean>(false);
  const [adhdActiveSection, setAdhdActiveSection] = useState<ActiveSectionFocus>('ALL');

  // Live Market Rates & Products (Hydrated from Service Worker / localStorage cache for instant offline availability)
  const [rates, setRates] = useState<MarketRatesState>(() =>
    getInitialCachedRatesSync(DEFAULT_RATES)
  );
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );
  const [products, setProducts] = useState<JewelryProduct[]>(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('ALL');
  const [selectedProductForStory, setSelectedProductForStory] = useState<JewelryProduct | null>(
    null
  );
  const [selectedProductForCert, setSelectedProductForCert] = useState<JewelryProduct | null>(
    null
  );

  // Modals
  const [isTvModeOpen, setIsTvModeOpen] = useState(false);
  const [isRateAdjustOpen, setIsRateAdjustOpen] = useState(false);

  // Instant Custom Calculator State
  const [calcWeight, setCalcWeight] = useState<number>(12.5);
  const [calcKarat, setCalcKarat] = useState<GoldKarat>(18);
  const [calcRetailOjrat, setCalcRetailOjrat] = useState<number>(14);
  const [calcWholesaleOjrat, setCalcWholesaleOjrat] = useState<number>(6.5);

  const { showGuideModal, setShowGuideModal, triggerInstall } = usePWAInstall();

  const isRtl = isRtlLanguage(lang);
  const t = getLocalizedHeroStrings(lang);

  // Sync HTML dir, lang, font-scale, and ADHD attributes for full 6-language & WCAG support
  useEffect(() => {
    const html = document.documentElement;
    const langMeta = LANGUAGES_LIST.find((l) => l.code === lang) || LANGUAGES_LIST[0];
    html.dir = langMeta.dir;
    html.lang = langMeta.speechLang;
    html.setAttribute('data-font-scale', fontScale);
    html.setAttribute('data-adhd', adhdFocus ? 'true' : 'false');
    if (themeMode === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [lang, fontScale, adhdFocus, themeMode]);

  // Fetch initial rates from Express backend (or Service Worker offline cache) & apply custom White-Label branding
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlBrand = params.get('brand');
    const urlPhone = params.get('phone');
    const urlInsta = params.get('insta');

    let savedBrand: Partial<MarketRatesState> = {};
    try {
      const raw = localStorage.getItem('talayar_custom_brand');
      if (raw) savedBrand = JSON.parse(raw);
    } catch {}

    const applyBranding = (baseRates: MarketRatesState): MarketRatesState => ({
      ...baseRates,
      ...savedBrand,
      ...(urlBrand ? { galleryName: urlBrand } : {}),
      ...(urlPhone ? { galleryPhone: urlPhone } : {}),
      ...(urlInsta ? { galleryInstagram: urlInsta } : {}),
    });

    const syncRatesFromNetworkOrSwCache = async () => {
      try {
        const response = await fetch('/api/rates');
        const cacheSource = response.headers.get('X-TalaYar-Cache');
        if (cacheSource === 'OFFLINE-SW-CACHE' || cacheSource === 'OFFLINE-MUTATED-SW-CACHE') {
          setIsOfflineMode(true);
        } else if (navigator.onLine) {
          setIsOfflineMode(false);
        }

        const data = await response.json();
        if (data?.gram18kToman) {
          const merged = applyBranding(data);
          setRates(merged);
          await saveRatesToOfflineCache(merged);
          return;
        }
      } catch {
        setIsOfflineMode(true);
      }

      // Fallback to Service Worker Cache Storage or localStorage if fetch failed before SW took control
      const cached = await loadLastKnownRatesFromCache();
      if (cached?.gram18kToman) {
        setRates(applyBranding(cached));
      }
    };

    syncRatesFromNetworkOrSwCache();

    const handleOnline = () => {
      setIsOfflineMode(false);
      syncRatesFromNetworkOrSwCache();
    };
    const handleOffline = () => {
      setIsOfflineMode(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSaveRates = async (partial: Partial<MarketRatesState>) => {
    try {
      const res = await fetch('/api/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partial),
      });
      const data = await res.json();
      if (data?.gram18kToman) {
        setRates(data);
        await saveRatesToOfflineCache(data);
      }
    } catch {
      setRates((prev) => {
        const next = { ...prev, ...partial, updatedAt: new Date().toISOString() };
        saveRatesToOfflineCache(next);
        return next;
      });
    }
  };

  const handleSimulateTick = async () => {
    try {
      const res = await fetch('/api/rates/tick', { method: 'POST' });
      const cacheSource = res.headers.get('X-TalaYar-Cache');
      if (cacheSource === 'OFFLINE-SW-CACHE') {
        setIsOfflineMode(true);
      }
      const data = await res.json();
      if (data?.gram18kToman) {
        setRates(data);
        await saveRatesToOfflineCache(data);
      }
    } catch {
      setIsOfflineMode(true);
      const cached = await loadLastKnownRatesFromCache();
      if (cached?.gram18kToman) setRates(cached);
    }
  };

  // 1-Click Switch between Iran Market (Toman / 750) and Global Market (USD, AED, EUR / 18K-24K)
  const handleToggleMarketMode = () => {
    if (marketMode === 'IR') {
      setMarketMode('GLOBAL');
      setSelectedGlobalKarat(21);
      setCalcKarat(21);
    } else {
      setMarketMode('IR');
      setSelectedGlobalKarat(18);
      setCalcKarat(18);
    }
  };

  // Voice Reader for Accessibility (Visually Impaired & ADHD Support across 6 languages)
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langMeta = LANGUAGES_LIST.find((l) => l.code === lang) || LANGUAGES_LIST[0];
    utterance.lang = langMeta.speechLang;
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const isLight = themeMode === 'light';

  const categories: Array<{ id: ProductCategory; labelFa: string; labelEn: string }> = [
    { id: 'ALL', labelFa: 'همه طلا و نقره (۱۲)', labelEn: 'All Gold & Silver (12)' },
    { id: 'BRIDAL_SET', labelFa: 'سرویس عروس طلا', labelEn: 'Bridal Gold Sets' },
    { id: 'BANGLE_CUFF', labelFa: 'النگو و تک‌پوش', labelEn: 'Bangles & Cuffs' },
    { id: 'NECKLACE', labelFa: 'گردنبند طلا', labelEn: 'Gold Necklaces' },
    { id: 'RING', labelFa: 'انگشتر جواهر', labelEn: 'Diamond Rings' },
    { id: 'CARTIER_BRACELET', labelFa: 'دستبند کارتیه', labelEn: 'Cartier Bracelets' },
    { id: 'EARRINGS', labelFa: 'گوشواره طلا', labelEn: 'Gold Earrings' },
    { id: 'BULLION_COIN', labelFa: 'شمش و سکه', labelEn: 'Bullion & Coins' },
    { id: 'SILVER_VESSELS', labelFa: 'ظروف و وسایل نقره قلم‌زنی', labelEn: 'Silverware & Vessels' },
    { id: 'SILVER_925', labelFa: 'نقره ۹۲۵ و ملیله', labelEn: '925 Silver & Filigree' },
  ];

  const filteredProducts =
    selectedCategory === 'ALL'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const customCalcResult = calculateProductPrice({
    weightGrams: calcWeight,
    karat: calcKarat,
    retailMakingChargePercent: calcRetailOjrat,
    wholesaleMakingChargePercent: calcWholesaleOjrat,
    profitPercent: rates.defaultProfitPercent,
    taxPercent: rates.defaultTaxPercent,
    rates,
    marketMode,
    globalCurrency,
  });

  const handleUpdateProductField = (
    id: string,
    field: 'weightGrams' | 'retailMakingChargePercent' | 'defaultKarat',
    value: number
  ) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const shouldShowSection = (sec: ActiveSectionFocus) => {
    if (!adhdFocus || adhdActiveSection === 'ALL') return true;
    return adhdActiveSection === sec;
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
      }`}
    >
      {/* Top Bar Contract: Strictly 3 Zones (Brand Wordmark — Clean Nav Links — Primary Actions) */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
          isLight
            ? 'bg-white/95 border-slate-200 text-slate-900'
            : 'bg-slate-950/95 border-slate-800 text-slate-100'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Single Text Element Brand Wordmark */}
          <a
            href="#"
            className="text-lg md:text-xl font-bold tracking-tight text-amber-500 whitespace-nowrap shrink-0"
          >
            {t.brand}
          </a>

          {/* Zone 2: Clean Text Navigation Links */}
          <nav className="hidden xl:flex items-center gap-5 text-sm font-semibold">
            <a
              href="#showcase"
              className="hover:text-amber-500 hover:underline underline-offset-8 transition-colors whitespace-nowrap"
            >
              {t.navShowcase}
            </a>
            <a
              href="#silver-ads"
              className="hover:text-amber-500 hover:underline underline-offset-8 transition-colors whitespace-nowrap text-emerald-500"
            >
              {t.navSilverAds}
            </a>
            <a
              href="#trade-in"
              className="hover:text-amber-500 hover:underline underline-offset-8 transition-colors whitespace-nowrap"
            >
              {t.navTradeIn}
            </a>
            <a
              href="#qr-passport"
              className="hover:text-amber-500 hover:underline underline-offset-8 transition-colors whitespace-nowrap"
            >
              {t.navQr}
            </a>
            <a
              href="#story-maker"
              className="hover:text-amber-500 hover:underline underline-offset-8 transition-colors whitespace-nowrap"
            >
              {t.navStory}
            </a>
            <a
              href="#monetization-reseller"
              className="hover:text-amber-500 hover:underline underline-offset-8 transition-colors whitespace-nowrap"
            >
              {t.navMonetize}
            </a>
          </nav>

          {/* Zone 3: 2 Primary Actions (1-Click Market Switcher + Instant PWA Install) */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleToggleMarketMode}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs md:text-sm whitespace-nowrap cursor-pointer transition-colors"
            >
              <Globe className="w-4 h-4 shrink-0" />
              <span>
                {marketMode === 'IR'
                  ? isRtl
                    ? '🇮🇷 بازار ایران (تومان) ⇄ جهانی'
                    : '🇮🇷 Iran Market ⇄ Global'
                  : isRtl
                  ? '🌍 بازار جهانی (USD/AED) ⇄ ایران'
                  : '🌍 Global Market ⇄ Iran'}
              </span>
            </button>

            <button
              onClick={triggerInstall}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs md:text-sm whitespace-nowrap cursor-pointer transition-colors"
            >
              <Smartphone className="w-4 h-4 shrink-0" />
              <span>{isRtl ? '📲 نصب آنی (PWA)' : '📲 Install PWA'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Accessibility (Disabilities & ADHD Focus Mode), White/Dark Theme & 6-Language Switcher Bar */}
      <div
        className={`border-b transition-colors ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/90 border-slate-800'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Left/Right Group: Theme (Clean White vs Royal Dark) + Accessibility Font Size + ADHD Mode + Voice */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 1-Click White vs Dark Gold Theme */}
            <button
              onClick={() => setThemeMode(isLight ? 'dark' : 'light')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${
                isLight
                  ? 'bg-white border-amber-500 text-slate-900 shadow-xs'
                  : 'bg-slate-950 border-amber-400/60 text-amber-400'
              }`}
            >
              {isLight ? (
                <Moon className="w-4 h-4 text-slate-800" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
              <span>
                {isLight
                  ? isRtl
                    ? 'تم: سفید روشن ⇄ مشکی-طلایی'
                    : 'Theme: Clean White ⇄ Royal Dark'
                  : isRtl
                  ? 'تم: مشکی-طلایی ⇄ سفید روشن'
                  : 'Theme: Royal Dark ⇄ Clean White'}
              </span>
            </button>

            {/* Large Font Accessibility Controls */}
            <div
              className={`flex items-center gap-1 p-1 rounded-lg border ${
                isLight ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-800'
              }`}
              role="group"
              aria-label="Font size accessibility"
            >
              <button
                onClick={() => setFontScale('normal')}
                className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer ${
                  fontScale === 'normal' ? 'bg-amber-500 text-slate-950' : 'opacity-75'
                }`}
              >
                {isRtl ? 'عادی' : 'A'}
              </button>
              <button
                onClick={() => setFontScale('large')}
                className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer ${
                  fontScale === 'large' ? 'bg-amber-500 text-slate-950' : 'opacity-75'
                }`}
              >
                {isRtl ? 'بزرگ (A+)' : 'A+'}
              </button>
              <button
                onClick={() => setFontScale('xlarge')}
                className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer ${
                  fontScale === 'xlarge' ? 'bg-amber-500 text-slate-950' : 'opacity-75'
                }`}
              >
                {isRtl ? 'درشت کم‌بینایان (A++)' : 'A++'}
              </button>
            </div>

            {/* ADHD Focus Mode */}
            <button
              onClick={() => {
                const next = !adhdFocus;
                setAdhdFocus(next);
                if (!next) setAdhdActiveSection('ALL');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${
                adhdFocus
                  ? 'bg-emerald-600 border-emerald-500 text-white'
                  : isLight
                  ? 'bg-white border-slate-300 text-slate-700'
                  : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>
                {isRtl
                  ? `تمرکز ADHD و کم‌توجهی: ${adhdFocus ? 'فعال (تک‌وظیفه‌ای)' : 'غیرفعال'}`
                  : `ADHD Focus Mode: ${adhdFocus ? 'ON (Single-Task)' : 'OFF'}`}
              </span>
            </button>

            {/* Voice Screen Reader */}
            <button
              onClick={() =>
                speakText(
                  isRtl
                    ? `خوش آمدید به طلایار جهانی. نرخ لحظه‌ای هر گرم طلای هجده عیار ${rates.gram18kToman.toLocaleString('en-US')} تومان، نقره استرلینگ ۹۲۵ هر گرم ${rates.silver925GramToman.toLocaleString('en-US')} تومان و انس جهانی طلا ${rates.ounceUsd} دلار است.`
                    : `Welcome to TalaYar Global VIP. Live 18 Karat gold is ${rates.gram18kToman.toLocaleString('en-US')} Toman per gram, 925 Silver is ${rates.silver925GramToman.toLocaleString('en-US')} Toman, and global spot gold ounce is ${rates.ounceUsd} dollars.`
                )
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer whitespace-nowrap ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
                  : 'bg-slate-950 border-slate-800 text-amber-400 hover:bg-slate-900'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{isRtl ? 'گوینده صوتی (ویژه نابینایان)' : 'Voice Screen Reader'}</span>
            </button>
          </div>

          {/* Right Group: 6 Languages Selector (FA, EN, AR, KU, TR, ES) & Global Currency */}
          <div className="flex flex-wrap items-center gap-2">
            {marketMode === 'GLOBAL' && (
              <div className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/40 rounded-lg p-1">
                {(['USD', 'AED', 'EUR'] as GlobalCurrency[]).map((cur) => (
                  <button
                    key={cur}
                    onClick={() => setGlobalCurrency(cur)}
                    className={`px-2.5 py-1 rounded text-xs font-tabular font-bold cursor-pointer ${
                      globalCurrency === cur ? 'bg-amber-500 text-slate-950' : 'text-amber-500'
                    }`}
                  >
                    {cur === 'USD' ? '$ USD' : cur === 'AED' ? 'AED دبی' : '€ EUR'}
                  </button>
                ))}
              </div>
            )}

            {/* 6-Language Instant Selector */}
            <div
              className={`flex flex-wrap items-center gap-1 p-1 rounded-xl border ${
                isLight ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-800'
              }`}
              role="group"
              aria-label="Language selector (6 languages)"
            >
              {LANGUAGES_LIST.map((item) => (
                <button
                  key={item.code}
                  onClick={() => setLang(item.code)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    lang === item.code
                      ? 'bg-amber-500 text-slate-950'
                      : isLight
                      ? 'text-slate-700 hover:bg-slate-100'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ADHD Single-Task Section Isolator Bar (Appears when ADHD Mode is active to eliminate cognitive overload) */}
        {adhdFocus && (
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-2.5 border-t border-emerald-500/30 bg-emerald-500/10 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
              <Layers className="w-4 h-4" />
              <span>
                {isRtl
                  ? 'حالت تمرکز عمیق ADHD فعال است (حذف حواس‌پرتی — فقط بخش مورد نظر خود را انتخاب کنید):'
                  : 'ADHD Single-Task Focus Active (Select one workspace at a time):'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'ALL', fa: 'نمایش همه بخش‌ها', en: 'Show All' },
                { id: 'SHOWCASE', fa: '۱. ویترین و ماشین‌حساب طلا', en: '1. Gold Showcase' },
                { id: 'SILVER_ADS', fa: '۲. ظروف نقره و تالار تبلیغات', en: '2. Silverware & Ads' },
                { id: 'TRADE_IN', fa: '۳. تعویض طلای کهنه', en: '3. Gold Trade-In' },
                { id: 'QR_PASS', fa: '۴. شناسنامه QR اصالت', en: '4. QR Passport' },
                { id: 'STORY', fa: '۵. استوری‌ساز HD', en: '5. Story Maker' },
                { id: 'ANDROID', fa: '۶. گرادل اندروید و ریلیز گیت‌هاب', en: '6. Android & GitHub' },
                { id: 'MONETIZE', fa: '۷. درآمدزایی و پورسانت بازاریابان', en: '7. Monetization & Resellers' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setAdhdActiveSection(s.id as ActiveSectionFocus)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    adhdActiveSection === s.id
                      ? 'bg-emerald-600 text-white'
                      : isLight
                      ? 'bg-white text-slate-800 border border-slate-300'
                      : 'bg-slate-900 text-slate-200 border border-slate-700'
                  }`}
                >
                  {isRtl ? s.fa : s.en}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Live Gold & Silver Ticker Bar (تابلوی زنده نرخ طلا، نقره و سکه برای مانیتور مغازه و موبایل) */}
      <div
        className={`border-b transition-colors ${
          isLight
            ? 'bg-amber-50/70 border-amber-200 text-slate-900'
            : 'bg-slate-900/60 border-amber-500/20 text-slate-100'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm">
            <div>
              <span className="opacity-70 text-xs block">
                {isRtl ? 'گرم طلای ۱۸ عیار (۷۵۰)' : '18K Gold (750)'}
              </span>
              <span className="font-tabular font-bold text-base text-amber-500">
                {marketMode === 'IR'
                  ? `${rates.gram18kToman.toLocaleString('en-US')} تومان`
                  : formatMoney(
                      (rates.ounceUsd / 31.1034768) *
                        0.75 *
                        (globalCurrency === 'USD'
                          ? 1
                          : globalCurrency === 'AED'
                          ? rates.usdToAed
                          : rates.usdToEur),
                      'GLOBAL',
                      globalCurrency,
                      lang
                    )}
              </span>
            </div>

            <span aria-hidden="true" className="opacity-25">
              ·
            </span>

            <div>
              <span className="opacity-70 text-xs block">
                {isRtl ? 'گرم ۲۱ عیار (۸۷۵ عربی/کُردی)' : '21K Gold (875)'}
              </span>
              <span className="font-tabular font-bold text-base">
                {marketMode === 'IR'
                  ? `${rates.gram21kToman.toLocaleString('en-US')} تومان`
                  : formatMoney(
                      (rates.ounceUsd / 31.1034768) *
                        (21 / 24) *
                        (globalCurrency === 'USD'
                          ? 1
                          : globalCurrency === 'AED'
                          ? rates.usdToAed
                          : rates.usdToEur),
                      'GLOBAL',
                      globalCurrency,
                      lang
                    )}
              </span>
            </div>

            <span aria-hidden="true" className="opacity-25">
              ·
            </span>

            <div>
              <span className="opacity-70 text-xs block">
                {isRtl ? 'گرم نقره ۹۲۵ و ظروف نقره' : '925 Silver Gram'}
              </span>
              <span className="font-tabular font-bold text-base text-emerald-500">
                {marketMode === 'IR'
                  ? `${rates.silver925GramToman.toLocaleString('en-US')} تومان`
                  : formatMoney(
                      (rates.silverOunceUsd / 31.1034768) *
                        0.925 *
                        (globalCurrency === 'USD'
                          ? 1
                          : globalCurrency === 'AED'
                          ? rates.usdToAed
                          : rates.usdToEur),
                      'GLOBAL',
                      globalCurrency,
                      lang
                    )}
              </span>
            </div>

            <span aria-hidden="true" className="opacity-25">
              ·
            </span>

            <div>
              <span className="opacity-70 text-xs block">
                {isRtl ? 'انس طلا (XAU) / نقره (XAG)' : 'Spot XAU / XAG'}
              </span>
              <span className="font-tabular font-bold text-base text-emerald-500">
                ${rates.ounceUsd.toFixed(1)} / ${rates.silverOunceUsd.toFixed(2)}
              </span>
            </div>

            <span aria-hidden="true" className="opacity-25">
              ·
            </span>

            <div>
              <span className="opacity-70 text-xs block">
                {isRtl ? 'سکه تمام امامی' : 'Emami Gold Coin'}
              </span>
              <span className="font-tabular font-bold text-base text-amber-500">
                {rates.coinEmamiToman.toLocaleString('en-US')}{' '}
                {isRtl ? 'تومان' : 'Toman'}
              </span>
            </div>
          </div>

          {/* TV Mode & Quick Jeweler Rate Adjuster Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {isOfflineMode && (
              <span className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-500 text-xs font-bold font-tabular">
                {isRtl
                  ? `⚡ حالت آفلاین (نرخ کش‌شده در سرویس‌ورکر: ${new Date(
                      rates.updatedAt
                    ).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })})`
                  : `⚡ Offline Cache (${new Date(rates.updatedAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })})`}
              </span>
            )}

            <button
              onClick={handleSimulateTick}
              title={isRtl ? 'بروزرسانی زنده نوسان بازار' : 'Refresh Live Tick'}
              className={`p-2 rounded-xl border cursor-pointer ${
                isLight
                  ? 'bg-white border-slate-300 hover:bg-slate-100'
                  : 'bg-slate-950 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <RefreshCw className="w-4 h-4 text-emerald-500" />
            </button>

            <button
              onClick={() => setIsRateAdjustOpen(true)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold cursor-pointer whitespace-nowrap transition-colors ${
                isLight
                  ? 'bg-white border-amber-500 text-slate-900 hover:bg-amber-50'
                  : 'bg-slate-950 border-amber-400/50 text-amber-400 hover:bg-slate-900'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>
                {isRtl
                  ? 'تنظیم سریع نرخ تابلو توسط طلافروش'
                  : 'Quick Board Rate Setup'}
              </span>
            </button>

            <button
              onClick={() => setIsTvModeOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer whitespace-nowrap transition-colors"
            >
              <Tv className="w-4 h-4" />
              <span>
                {isRtl
                  ? 'حالت نمایشگر تمام‌صفحه تلویزیون طلافروشی (TV Mode)'
                  : 'Showroom TV Display Mode'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <main className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 md:py-12 space-y-14">
        {/* Hero & Instant Making Charge Calculator Section */}
        {shouldShowSection('SHOWCASE') && (
          <section
            className={`rounded-3xl border p-6 md:p-10 transition-colors ${
              isLight
                ? 'bg-white border-slate-200 shadow-sm'
                : 'bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-slate-800'
            }`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="text-xs md:text-sm font-bold text-amber-500 tracking-wide">
                  {t.subtitle}
                </div>

                <h1
                  className="text-3xl md:text-5xl font-bold leading-tight tracking-tight"
                  style={{ textWrap: 'balance' }}
                >
                  {t.heroTitle}
                </h1>

                <p className="text-base md:text-lg opacity-85 leading-relaxed max-w-2xl">
                  {t.heroDesc}
                </p>

                {/* Quick Mode Switch Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => setMarketMode('IR')}
                    className={`p-4 rounded-2xl border text-right transition-colors cursor-pointer ${
                      marketMode === 'IR'
                        ? 'border-2 border-amber-500 bg-amber-500/10'
                        : isLight
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div className="font-bold text-base text-amber-500">
                      {isRtl
                        ? '🇮🇷 حالت بازار ایران (تومان / طلا ۷۵۰ و نقره ۸۴-۹۲۵)'
                        : '🇮🇷 Iran Market Mode (Toman / 750 Gold & Silverware)'}
                    </div>
                    <div className="text-xs opacity-80 mt-1">
                      {isRtl
                        ? 'فرمول رسمی اتحادیه طلا و جواهر + ظروف نقره قلم‌زنی اصفهان و تبریز + سکه امامی'
                        : 'Official Iran Union Formula + Handcrafted Silverware & Emami Coin'}
                    </div>
                  </button>

                  <button
                    onClick={() => setMarketMode('GLOBAL')}
                    className={`p-4 rounded-2xl border text-right transition-colors cursor-pointer ${
                      marketMode === 'GLOBAL'
                        ? 'border-2 border-emerald-500 bg-emerald-500/10'
                        : isLight
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div className="font-bold text-base text-emerald-500">
                      {isRtl
                        ? '🌍 حالت بازار جهانی (USD, AED, EUR / 18K–24K & XAG)'
                        : '🌍 Global Market Mode (USD, AED, EUR / 18K–24K & Silver)'}
                    </div>
                    <div className="text-xs opacity-80 mt-1">
                      {isRtl
                        ? 'بر پایه انس جهانی XAU و نقره XAG به ۶ زبان برای دبی، اربیل، استانبول، مادرید و لندن'
                        : 'Live XAU & XAG Spot pricing in 6 languages for global jewelers'}
                    </div>
                  </button>
                </div>
              </div>

              {/* Instant Live Weight & Making Charge Calculator Box */}
              <div
                className={`lg:col-span-5 rounded-2xl border-2 border-amber-500/60 p-6 ${
                  isLight ? 'bg-amber-50/40' : 'bg-slate-950/95'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 font-bold text-lg text-amber-500">
                    <Calculator className="w-5 h-5" />
                    <span>
                      {isRtl
                        ? 'ماشین‌حساب آنی طلا، جواهر و ظروف نقره'
                        : 'Instant Gold & Silverware Calculator'}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      speakText(
                        isRtl
                          ? `برای وزن ${calcWeight} گرم با عیار ${calcKarat} و اجرت ${calcRetailOjrat} درصد، قیمت تک‌فروشی به مشتری ${formatMoney(customCalcResult.retailTotalPrice, marketMode, globalCurrency, lang)} و وزن تسویه بنکداری همکار ${customCalcResult.wholesaleGoldSettlementGrams} گرم می‌باشد.`
                          : `For ${calcWeight} grams of ${calcKarat} purity with ${calcRetailOjrat}% making charge, retail price is ${formatMoney(customCalcResult.retailTotalPrice, marketMode, globalCurrency, lang)} and wholesale settlement weight is ${customCalcResult.wholesaleGoldSettlementGrams} grams.`
                      )
                    }
                    className="p-2 rounded-lg bg-amber-500/15 text-amber-500 hover:bg-amber-500/25 cursor-pointer"
                    title={isRtl ? 'قرائت صوتی محاسبه' : 'Speak Calculation'}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">
                      {isRtl ? 'وزن خالص (گرم)' : 'Net Weight (Grams)'}
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.1"
                      value={calcWeight}
                      onChange={(e) => setCalcWeight(Math.max(0.1, Number(e.target.value)))}
                      className={`w-full px-3.5 py-2.5 rounded-xl border font-tabular text-lg font-bold ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-900'
                          : 'bg-slate-900 border-slate-700 text-amber-400'
                      }`}
                    />
                    {/* Motor-Accessible Quick Weight Buttons */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {[-5, -1, +1, +5, +50].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() =>
                            setCalcWeight((w) => Math.max(0.1, Number((w + st).toFixed(2))))
                          }
                          className="px-2 py-0.5 rounded border border-amber-500/40 text-xs font-tabular font-bold cursor-pointer"
                        >
                          {st > 0 ? `+${st}g` : `${st}g`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">
                      {isRtl ? 'عیار طلا یا ظرف نقره' : 'Select Gold / Silver Purity'}
                    </label>
                    <select
                      value={calcKarat}
                      onChange={(e) => setCalcKarat(Number(e.target.value) as GoldKarat)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border font-tabular text-sm font-bold ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-900'
                          : 'bg-slate-900 border-slate-700 text-white'
                      }`}
                    >
                      <option value={18}>18K Gold (طلای ۱۸ عیار - ۷۵۰)</option>
                      <option value={21}>21K Gold (طلای ۲۱ عیار عربی/کُردی - ۸۷۵)</option>
                      <option value={22}>22K Gold (طلای ۲۲ عیار - ۹۱۶)</option>
                      <option value={24}>24K Pure Gold (شمش ۲۴ عیار - ۹۹۹.۹)</option>
                      <option value={840}>Silver 840 (ظروف نقره قلم‌زنی عیار ۸۴)</option>
                      <option value={900}>Silver 900 (ظروف نقره تبریز عیار ۹۰)</option>
                      <option value={925}>Silver 925 (نقره استرلینگ و ملیله ۹۲۵)</option>
                      <option value={999}>Silver 999.9 (شمش و ساچمه نقره خالص)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">
                      {isRtl ? 'اجرت ساخت تک‌فروشی (%)' : 'Retail Making Charge (%)'}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={calcRetailOjrat}
                      onChange={(e) => setCalcRetailOjrat(Math.max(0, Number(e.target.value)))}
                      className={`w-full px-3.5 py-2.5 rounded-xl border font-tabular text-base font-bold ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-900'
                          : 'bg-slate-900 border-slate-700 text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">
                      {isRtl ? 'اجرت عمده بنکداری (%)' : 'B2B Workshop Making (%)'}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={calcWholesaleOjrat}
                      onChange={(e) => setCalcWholesaleOjrat(Math.max(0, Number(e.target.value)))}
                      className={`w-full px-3.5 py-2.5 rounded-xl border font-tabular text-base font-bold ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-900'
                          : 'bg-slate-900 border-slate-700 text-emerald-400'
                      }`}
                    />
                  </div>
                </div>

                {/* Dual Output: Retail vs Wholesale */}
                <div className="space-y-2.5 pt-3 border-t border-amber-500/20">
                  <div className="p-3.5 rounded-xl bg-amber-500 text-slate-950">
                    <div className="text-xs font-bold">
                      {isRtl
                        ? `قیمت تک‌فروشی به مشتری (با سود ${rates.defaultProfitPercent}٪ و مالیات ${rates.defaultTaxPercent}٪):`
                        : `Customer Retail Total (incl. ${rates.defaultProfitPercent}% Profit & ${rates.defaultTaxPercent}% VAT):`}
                    </div>
                    <div className="text-2xl font-bold font-tabular mt-0.5">
                      {formatMoney(
                        customCalcResult.retailTotalPrice,
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
                        ? 'قیمت عمده بنکداری / کارگاهی (تسویه وزنی + معادل نقدی):'
                        : 'B2B Wholesale Settlement (Weight + Cash Eq.):'}
                    </div>
                    <div className="flex flex-wrap items-baseline justify-between gap-2 mt-1 font-tabular">
                      <span className="text-lg font-bold text-emerald-500">
                        {customCalcResult.wholesaleGoldSettlementGrams}{' '}
                        {isRtl ? 'گرم تسویه همکار' : 'g Fine Settlement'}
                      </span>
                      <span className="text-sm font-semibold opacity-90">
                        ≈{' '}
                        {formatMoney(
                          customCalcResult.wholesaleCashEquivalent,
                          marketMode,
                          globalCurrency,
                          lang
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Section 01: Live Gold, Jewelry & Silverware Showcase (12 Authentic Products) */}
        {shouldShowSection('SHOWCASE') && (
          <section id="showcase" className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-amber-500/20 pb-5">
              <div>
                <span className="text-xs font-semibold text-amber-500 tracking-wide">
                  {isRtl
                    ? '۰۱. ویترین زنده طلا، جواهر، سکه و ظروف نقره قلم‌زنی (۱۲ محصول واقعی با محاسبه خودکار وزن و اجرت)'
                    : '01. Live Gold, Jewelry, Bullion & Handcrafted Silverware Showcase'}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold mt-1">
                  {isRtl
                    ? 'نمایش همزمان «قیمت تک‌فروشی به مشتری» و «قیمت عمده بنکداری / کارگاهی (طلا و نقره)»'
                    : 'Simultaneous Customer Retail Price & B2B Wholesale Settlement'}
                </h2>
              </div>

              {/* Global Karat Override when in Global Mode */}
              {marketMode === 'GLOBAL' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold">
                    {isRtl ? 'عیار پیش‌فرض طلا در بازار جهانی:' : 'Global Gold Karat:'}
                  </span>
                  {([18, 21, 22, 24] as GoldKarat[]).map((k) => (
                    <button
                      key={k}
                      onClick={() => setSelectedGlobalKarat(k)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-tabular font-bold cursor-pointer ${
                        selectedGlobalKarat === k
                          ? 'bg-amber-500 text-slate-950'
                          : 'border border-amber-500/40 text-amber-500'
                      }`}
                    >
                      {k}K
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Interactive Category Filter Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : isLight
                      ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {isRtl ? cat.labelFa : cat.labelEn}
                </button>
              ))}
            </div>

            {/* 3-Column Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredProducts.map((product) => {
                const effectiveKarat: GoldKarat = isSilverKarat(product.defaultKarat)
                  ? product.defaultKarat
                  : marketMode === 'GLOBAL'
                  ? selectedGlobalKarat
                  : product.defaultKarat;

                const breakdown = calculateProductPrice({
                  weightGrams: product.weightGrams,
                  karat: effectiveKarat,
                  retailMakingChargePercent: product.retailMakingChargePercent,
                  wholesaleMakingChargePercent: product.wholesaleMakingChargePercent,
                  profitPercent: rates.defaultProfitPercent,
                  taxPercent: rates.defaultTaxPercent,
                  rates,
                  marketMode,
                  globalCurrency,
                });

                const whatsappOrderText = isRtl
                  ? `سلام، جهت سفارش محصول «${product.nameFa}» (کد ${product.code} - وزن ${product.weightGrams} گرم) به قیمت روز ${formatMoney(breakdown.retailTotalPrice, marketMode, globalCurrency, lang)} پیام می‌دهم.`
                  : `Hello, I would like to inquire about "${product.nameEn}" (Code: ${product.code}, Weight: ${product.weightGrams}g) priced at ${formatMoney(breakdown.retailTotalPrice, marketMode, globalCurrency, lang)}.`;

                return (
                  <article
                    key={product.id}
                    className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5 ${
                      isLight
                        ? 'bg-white border-slate-200 shadow-sm'
                        : 'bg-slate-900/80 border-slate-800'
                    }`}
                  >
                    <div>
                      {/* Product Image Container (4:3 ratio) */}
                      <div className="relative aspect-4/3 w-full bg-slate-950 overflow-hidden">
                        <img
                          src={product.imageUrl}
                          alt={isRtl ? product.nameFa : product.nameEn}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                        <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-xs text-slate-200 font-tabular">
                          <span>
                            {isRtl ? product.categoryLabelFa : product.categoryLabelEn} ·{' '}
                            {product.code}
                          </span>
                          <span className="font-bold text-amber-400">
                            {isSilverKarat(effectiveKarat)
                              ? `Silver ${effectiveKarat}`
                              : `${effectiveKarat}K`}
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 space-y-4">
                        <div>
                          <div className="text-xs opacity-65 flex items-center gap-1.5">
                            <span>
                              {isRtl ? product.craftOriginFa : product.craftOriginEn}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{isRtl ? 'موجود در ویترین' : 'In Stock'}</span>
                          </div>
                          <h3 className="text-lg font-bold mt-1 leading-snug">
                            {isRtl ? product.nameFa : product.nameEn}
                          </h3>
                          <p className="text-xs opacity-75 mt-1">
                            {isRtl ? product.specsFa : product.specsEn}
                          </p>
                        </div>

                        {/* Interactive Weight & Making Charge Inputs on Card */}
                        <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-amber-500/15">
                          <div>
                            <label className="block text-xs opacity-75 mb-1">
                              {isRtl ? 'وزن خالص (گرم):' : 'Net Weight (g):'}
                            </label>
                            <input
                              type="number"
                              step="0.05"
                              min="0.1"
                              value={product.weightGrams}
                              onChange={(e) =>
                                handleUpdateProductField(
                                  product.id,
                                  'weightGrams',
                                  Math.max(0.1, Number(e.target.value))
                                )
                              }
                              className={`w-full px-3 py-1.5 rounded-lg border font-tabular font-bold text-sm ${
                                isLight
                                  ? 'bg-slate-50 border-slate-300 text-slate-900'
                                  : 'bg-slate-950 border-slate-700 text-amber-400'
                              }`}
                            />
                          </div>

                          <div>
                            <label className="block text-xs opacity-75 mb-1">
                              {isRtl ? 'اجرت ساخت (%):' : 'Making Charge (%):'}
                            </label>
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              value={product.retailMakingChargePercent}
                              onChange={(e) =>
                                handleUpdateProductField(
                                  product.id,
                                  'retailMakingChargePercent',
                                  Math.max(0, Number(e.target.value))
                                )
                              }
                              className={`w-full px-3 py-1.5 rounded-lg border font-tabular font-bold text-sm ${
                                isLight
                                  ? 'bg-slate-50 border-slate-300 text-slate-900'
                                  : 'bg-slate-950 border-slate-700 text-white'
                              }`}
                            />
                          </div>
                        </div>

                        {/* Price Display 1: Customer Retail Price */}
                        <div
                          className={`p-3.5 rounded-xl border ${
                            isLight
                              ? 'bg-amber-50/90 border-amber-300 text-slate-900'
                              : 'bg-amber-500/10 border-amber-500/40 text-slate-100'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs opacity-85">
                            <span className="font-bold">
                              {isRtl
                                ? 'قیمت تک‌فروشی به مشتری:'
                                : 'Customer Retail Price:'}
                            </span>
                            <span className="font-tabular">
                              {isRtl
                                ? `سود ${rates.defaultProfitPercent}٪ + مالیات ${rates.defaultTaxPercent}٪`
                                : `+${rates.defaultProfitPercent}% Margin`}
                            </span>
                          </div>
                          <div className="text-xl font-bold text-amber-500 font-tabular mt-1">
                            {formatMoney(
                              breakdown.retailTotalPrice,
                              marketMode,
                              globalCurrency,
                              lang
                            )}
                          </div>
                        </div>

                        {/* Price Display 2: B2B Wholesale (بنکداری / کارگاهی) */}
                        <div
                          className={`p-3 rounded-xl border ${
                            isLight
                              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                              : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold">
                              {isRtl
                                ? `عمده بنکداری/کارگاه (اجرت ${product.wholesaleMakingChargePercent}٪):`
                                : `B2B Wholesale (${product.wholesaleMakingChargePercent}% Making):`}
                            </span>
                          </div>
                          <div className="flex items-baseline justify-between font-tabular mt-1">
                            <span className="text-sm font-bold text-emerald-500">
                              {isRtl
                                ? `تسویه وزنی: ${breakdown.wholesaleGoldSettlementGrams} گرم`
                                : `Weight Settlement: ${breakdown.wholesaleGoldSettlementGrams}g`}
                            </span>
                            <span className="text-xs opacity-85">
                              ≈{' '}
                              {formatMoney(
                                breakdown.wholesaleCashEquivalent,
                                marketMode,
                                globalCurrency,
                                lang
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Action Buttons */}
                    <div className="px-5 pb-5 pt-2 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedProductForStory(product);
                          document
                            .getElementById('story-maker')
                            ?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer transition-colors whitespace-nowrap"
                      >
                        <Camera className="w-4 h-4 shrink-0" />
                        <span>{isRtl ? 'استوری' : 'Story'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedProductForCert(product);
                          document
                            .getElementById('qr-passport')
                            ?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2.5 rounded-xl border font-bold text-xs cursor-pointer transition-colors whitespace-nowrap ${
                          isLight
                            ? 'bg-slate-900 text-amber-400 border-slate-900 hover:bg-slate-800'
                            : 'bg-amber-500/15 text-amber-400 border-amber-500/40 hover:bg-amber-500/25'
                        }`}
                      >
                        <QrCode className="w-4 h-4 shrink-0" />
                        <span>{isRtl ? 'شناسنامه QR' : 'QR Cert'}</span>
                      </button>

                      <a
                        href={`https://wa.me/${rates.galleryPhone.replace(/^0/, '98').replace(/\D/g, '')}?text=${encodeURIComponent(
                          whatsappOrderText
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors whitespace-nowrap"
                      >
                        <Send className="w-4 h-4 shrink-0" />
                        <span>{isRtl ? 'واتساپ' : 'WhatsApp'}</span>
                      </a>

                      <button
                        onClick={() =>
                          speakText(
                            isRtl
                              ? `${product.nameFa}، وزن ${product.weightGrams} گرم، قیمت تک‌فروشی به مشتری ${formatMoney(breakdown.retailTotalPrice, marketMode, globalCurrency, lang)}، و تسویه عمده بنکداری همکار ${breakdown.wholesaleGoldSettlementGrams} گرم.`
                              : `${product.nameEn}, weight ${product.weightGrams} grams, customer retail price ${formatMoney(breakdown.retailTotalPrice, marketMode, globalCurrency, lang)}, wholesale settlement ${breakdown.wholesaleGoldSettlementGrams} grams.`
                          )
                        }
                        className={`p-2.5 rounded-xl border cursor-pointer ${
                          isLight
                            ? 'bg-slate-100 border-slate-300 text-slate-800'
                            : 'bg-slate-950 border-slate-700 text-amber-400'
                        }`}
                        title={isRtl ? 'قرائت صوتی قیمت محصول' : 'Speak Product Price'}
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* Section 01-B & 01-C: Dedicated Silverware & Silver Vessels Studio + Gold & Silver Economic Advertising Hub */}
        {shouldShowSection('SILVER_ADS') && (
          <SilverAndAdsHub
            rates={rates}
            marketMode={marketMode}
            globalCurrency={globalCurrency}
            lang={lang}
            themeMode={themeMode}
            onSpeak={speakText}
          />
        )}

        {/* Section 02: Smart Gold Trade-In Calculator */}
        {shouldShowSection('TRADE_IN') && (
          <TradeInCalculator
            products={products}
            rates={rates}
            marketMode={marketMode}
            globalCurrency={globalCurrency}
            lang={lang}
            themeMode={themeMode}
            onSpeak={speakText}
          />
        )}

        {/* Exclusive Creative Feature: Digital Gold & Silver QR Certificate & Customer Asset Loyalty Passport */}
        {shouldShowSection('QR_PASS') && (
          <QrPassportSection
            products={products}
            selectedProductForCert={selectedProductForCert}
            rates={rates}
            marketMode={marketMode}
            globalCurrency={globalCurrency}
            lang={lang}
            themeMode={themeMode}
            onSpeak={speakText}
          />
        )}

        {/* Section 03: 1-Click HTML5 Canvas HD Story Maker */}
        {shouldShowSection('STORY') && (
          <StoryMakerSection
            products={products}
            selectedProductForStory={selectedProductForStory}
            rates={rates}
            marketMode={marketMode}
            globalCurrency={globalCurrency}
            lang={lang}
            themeMode={themeMode}
          />
        )}

        {/* Section 04: PWA + Native /android Gradle 8.5 Project & Secure Zero-Touch GitHub Release API Automation */}
        {shouldShowSection('ANDROID') && (
          <AndroidGithubSection
            lang={lang}
            themeMode={themeMode}
            onTriggerPWAInstall={triggerInstall}
          />
        )}

        {/* Section 05, 06, 07: AI Assistant + Facilitation Guide + Live Personalization Studio + Official Purchase Invoice + 25% Visitor Club */}
        {shouldShowSection('MONETIZE') && (
          <AiVipClubSection
            rates={rates}
            marketMode={marketMode}
            lang={lang}
            themeMode={themeMode}
            onSpeak={speakText}
            onUpdateRates={handleSaveRates}
          />
        )}
      </main>

      {/* Clean Footer */}
      <footer
        className={`border-t mt-16 py-10 transition-colors ${
          isLight
            ? 'bg-white border-slate-200 text-slate-600'
            : 'bg-slate-950 border-slate-800 text-slate-400'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 flex flex-wrap items-center justify-between gap-4 text-sm">
          <div>
            <div className="font-bold text-amber-500 text-base">
              {t.brand} — {rates.galleryName}
            </div>
            <div className="mt-1">
              {t.subtitle}
            </div>
          </div>
          <div className="font-tabular text-xs">
            Package: com.talayar.global · 8 Languages (FA/EN/AR/KU/TR/AZ/HY/ES) · WCAG AAA & ADHD Accessible
          </div>
        </div>
      </footer>

      {/* Modals: TV Display Mode, Quick Rate Adjuster, and PWA Install Guide */}
      <TvDisplayModal
        isOpen={isTvModeOpen}
        onClose={() => setIsTvModeOpen(false)}
        rates={rates}
        marketMode={marketMode}
        globalCurrency={globalCurrency}
        lang={lang}
        themeMode={themeMode}
        onSpeak={speakText}
      />

      <QuickRateAdjustModal
        isOpen={isRateAdjustOpen}
        onClose={() => setIsRateAdjustOpen(false)}
        rates={rates}
        onSaveRates={handleSaveRates}
        lang={lang}
        themeMode={themeMode}
      />

      {/* Interactive PWA Install Guide Modal (iOS Safari / Android Chrome / Desktop) */}
      {showGuideModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
              isLight
                ? 'bg-white border-amber-500 text-slate-900'
                : 'bg-slate-900 border-amber-400 text-slate-100'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
              <div className="flex items-center gap-2 font-bold text-lg text-amber-500">
                <Smartphone className="w-5 h-5" />
                <span>
                  {isRtl
                    ? 'راهنمای نصب آنی روی آیفون و اندروید (PWA)'
                    : 'Instant iOS & Android PWA Installation'}
                </span>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-lg hover:bg-amber-500/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm leading-relaxed">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <div className="font-bold text-amber-500 mb-1">
                  {isRtl ? '🍎 نصب روی آیفون و آیپد (Safari):' : '🍎 iPhone & iPad (Safari):'}
                </div>
                <p>
                  {isRtl
                    ? '۱. در نوار پایین مرورگر سافاری دکمه Share (مربع با فلش رو به بالا) را لمس کنید.\n۲. گزینه «Add to Home Screen» را انتخاب و دکمه Add را بزنید.'
                    : '1. Tap the Share button in Safari toolbar.\n2. Select "Add to Home Screen" and tap Add.'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="font-bold text-emerald-500 mb-1">
                  {isRtl
                    ? '🤖 نصب روی اندروید و کروم (Chrome):'
                    : '🤖 Android & Desktop Chrome:'}
                </div>
                <p>
                  {isRtl
                    ? '۱. منوی سه‌نقطه بالای مرورگر کروم را بزنید.\n۲. گزینه «Install App» یا «Add to Home Screen» را انتخاب کنید تا آیکون طلایار روی صفحه اصلی گوشی نصب شود.'
                    : '1. Tap the three-dot menu in Chrome.\n2. Select "Install App" or "Add to Home Screen".'}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs opacity-80">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  {isRtl
                    ? 'فایل manifest.json و آیکون‌های استاندارد ۱۹۲ و ۵۱۲ پیکسل فعال هستند.'
                    : 'Web App Manifest & 192/512px icons are active and verified.'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="mt-6 w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm cursor-pointer"
            >
              {isRtl ? 'متوجه شدم' : 'Got It'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
