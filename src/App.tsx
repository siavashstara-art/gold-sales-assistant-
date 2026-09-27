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
import { calculateProductPrice, formatMoney } from './utils/goldPricing';
import { usePWAInstall } from './hooks/usePWAInstall';
import { QuickRateAdjustModal, TvDisplayModal } from './components/TvDisplayModal';
import { TradeInCalculator } from './components/TradeInCalculator';
import { StoryMakerSection } from './components/StoryMakerSection';
import { QrPassportSection } from './components/QrPassportSection';
import { AndroidGithubSection } from './components/AndroidGithubSection';
import { AiVipClubSection } from './components/AiVipClubSection';

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
  galleryName: 'گالری طلا و جواهرات سلطنتی طلایار',
  galleryPhone: '09120000000',
  galleryInstagram: '@TalaYar.Global.VIP',
  updatedAt: new Date().toISOString(),
};

export default function App() {
  const [marketMode, setMarketMode] = useState<MarketMode>('IR');
  const [lang, setLang] = useState<Language>('fa');
  const [globalCurrency, setGlobalCurrency] = useState<GlobalCurrency>('USD');
  const [selectedGlobalKarat, setSelectedGlobalKarat] = useState<GoldKarat>(18);

  // Theme & Accessibility (White Light / Royal Dark + Large Fonts + ADHD Zen Mode)
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');
  const [fontScale, setFontScale] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [adhdFocus, setAdhdFocus] = useState<boolean>(false);

  // Live Market Rates & Products
  const [rates, setRates] = useState<MarketRatesState>(DEFAULT_RATES);
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

  // Sync HTML dir, lang, font-scale, and ADHD attributes
  useEffect(() => {
    const html = document.documentElement;
    html.dir = lang === 'fa' ? 'rtl' : 'ltr';
    html.lang = lang === 'fa' ? 'fa-IR' : 'en-US';
    html.setAttribute('data-font-scale', fontScale);
    html.setAttribute('data-adhd', adhdFocus ? 'true' : 'false');
    if (themeMode === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [lang, fontScale, adhdFocus, themeMode]);

  // Fetch initial rates from Express backend
  useEffect(() => {
    fetch('/api/rates')
      .then((r) => r.json())
      .then((data) => {
        if (data?.gram18kToman) setRates(data);
      })
      .catch(() => {});
  }, []);

  const handleSaveRates = async (partial: Partial<MarketRatesState>) => {
    try {
      const res = await fetch('/api/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partial),
      });
      const data = await res.json();
      if (data?.gram18kToman) setRates(data);
    } catch {
      setRates((prev) => ({ ...prev, ...partial }));
    }
  };

  const handleSimulateTick = async () => {
    try {
      const res = await fetch('/api/rates/tick', { method: 'POST' });
      const data = await res.json();
      if (data?.gram18kToman) setRates(data);
    } catch {}
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

  // Voice Reader for Accessibility (Visually Impaired & ADHD Support)
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'fa' ? 'fa-IR' : 'en-US';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const isLight = themeMode === 'light';

  const categories: Array<{ id: ProductCategory; labelFa: string; labelEn: string }> = [
    { id: 'ALL', labelFa: 'همه جواهرات (۱۰)', labelEn: 'All Collection (10)' },
    { id: 'BRIDAL_SET', labelFa: 'سرویس عروس', labelEn: 'Bridal Sets' },
    { id: 'BANGLE_CUFF', labelFa: 'النگو و تک‌پوش', labelEn: 'Bangles & Cuffs' },
    { id: 'NECKLACE', labelFa: 'گردنبند', labelEn: 'Necklaces' },
    { id: 'RING', labelFa: 'انگشتر', labelEn: 'Rings' },
    { id: 'CARTIER_BRACELET', labelFa: 'دستبند کارتیه', labelEn: 'Cartier Bracelets' },
    { id: 'EARRINGS', labelFa: 'گوشواره', labelEn: 'Earrings' },
    { id: 'BULLION_COIN', labelFa: 'شمش سوئیسی و سکه', labelEn: 'Bullion & Coins' },
    { id: 'SILVER_925', labelFa: 'نقره ۹۲۵', labelEn: '925 Silver' },
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

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
      }`}
    >
      {/* Top Bar Contract: Strictly 3 Zones (Brand Wordmark — 5 Clean Nav Links — Primary Actions) */}
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
            {lang === 'fa'
              ? 'طلایار جهانی | TalaYar (AurumMate) VIP'
              : 'AurumMate | TalaYar Global VIP'}
          </a>

          {/* Zone 2: 6 Clean Text Navigation Links */}
          <nav className="hidden xl:flex items-center gap-6 text-sm font-semibold">
            <a
              href="#showcase"
              className="hover:text-amber-500 hover:underline underline-offset-8 transition-colors whitespace-nowrap"
            >
              {lang === 'fa' ? 'ویترین و قیمت‌گذاری' : 'Showcase & Pricing'}
            </a>
            <a
              href="#trade-in"
              className="hover:text-amber-500 hover:underline underline-offset-8 transition-colors whitespace-nowrap"
            >
              {lang === 'fa' ? 'تعویض طلای کهنه' : 'Gold Trade-In'}
            </a>
            <a
              href="#qr-passport"
              className="hover:text-amber-500 hover:underline underline-offset-8 transition-colors whitespace-nowrap"
            >
              {lang === 'fa' ? 'شناسنامه QR اصالت' : 'QR Gold Passport'}
            </a>
            <a
              href="#story-maker"
              className="hover:text-amber-500 hover:underline underline-offset-8 transition-colors whitespace-nowrap"
            >
              {lang === 'fa' ? 'استوری‌ساز HD' : 'HD Story Maker'}
            </a>
            <a
              href="#ai-vip"
              className="hover:text-amber-500 hover:underline underline-offset-8 transition-colors whitespace-nowrap"
            >
              {lang === 'fa' ? 'دستیار هوشمند و VIP' : 'AI Advisor & VIP'}
            </a>
            <a
              href="#android-github"
              className="hover:text-amber-500 hover:underline underline-offset-8 transition-colors whitespace-nowrap"
            >
              {lang === 'fa' ? 'اندروید و گیت‌هاب' : 'Android & GitHub'}
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
                  ? lang === 'fa'
                    ? '🇮🇷 بازار ایران (تومان) ⇄ جهانی'
                    : '🇮🇷 Iran Market ⇄ Global'
                  : lang === 'fa'
                  ? '🌍 بازار جهانی (USD/AED) ⇄ ایران'
                  : '🌍 Global Market ⇄ Iran'}
              </span>
            </button>

            <button
              onClick={triggerInstall}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs md:text-sm whitespace-nowrap cursor-pointer transition-colors"
            >
              <Smartphone className="w-4 h-4 shrink-0" />
              <span>{lang === 'fa' ? '📲 نصب آنی (PWA)' : '📲 Install PWA'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Accessibility, White/Dark Theme & ADHD Focus Bar + Bilingual & Global Currency Controls */}
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
              {isLight ? <Moon className="w-4 h-4 text-slate-800" /> : <Sun className="w-4 h-4 text-amber-400" />}
              <span>
                {isLight
                  ? lang === 'fa'
                    ? 'تم فعلی: سفید روشن ⇄ سوییچ به مشکی-طلایی'
                    : 'Theme: Clean White ⇄ Switch to Royal Dark'
                  : lang === 'fa'
                  ? 'تم فعلی: مشکی-طلایی ⇄ سوییچ به سفید روشن'
                  : 'Theme: Royal Dark ⇄ Switch to Clean White'}
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
                {lang === 'fa' ? 'فونت عادی' : 'A'}
              </button>
              <button
                onClick={() => setFontScale('large')}
                className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer ${
                  fontScale === 'large' ? 'bg-amber-500 text-slate-950' : 'opacity-75'
                }`}
              >
                {lang === 'fa' ? 'فونت بزرگ (A+)' : 'A+'}
              </button>
              <button
                onClick={() => setFontScale('xlarge')}
                className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer ${
                  fontScale === 'xlarge' ? 'bg-amber-500 text-slate-950' : 'opacity-75'
                }`}
              >
                {lang === 'fa' ? 'فوق‌بزرگ کم‌بینایان (A++)' : 'A++'}
              </button>
            </div>

            {/* ADHD Focus Mode */}
            <button
              onClick={() => setAdhdFocus(!adhdFocus)}
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
                {lang === 'fa'
                  ? `تمرکز ویژه ADHD: ${adhdFocus ? 'فعال (بدون حواس‌پرتی)' : 'غیرفعال'}`
                  : `ADHD Focus: ${adhdFocus ? 'ON' : 'OFF'}`}
              </span>
            </button>

            {/* Voice Screen Reader */}
            <button
              onClick={() =>
                speakText(
                  lang === 'fa'
                    ? `خوش آمدید به طلایار جهانی. نرخ لحظه‌ای هر گرم طلای هجده عیار ${rates.gram18kToman.toLocaleString('en-US')} تومان و انس جهانی ${rates.ounceUsd} دلار است.`
                    : `Welcome to TalaYar Global VIP. Live 18 Karat gold is ${rates.gram18kToman.toLocaleString('en-US')} Toman per gram, and global spot ounce is ${rates.ounceUsd} dollars.`
                )
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer whitespace-nowrap ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
                  : 'bg-slate-950 border-slate-800 text-amber-400 hover:bg-slate-900'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{lang === 'fa' ? 'گوینده صوتی (ویژه نابینایان)' : 'Voice Reader'}</span>
            </button>
          </div>

          {/* Language (FA RTL / EN LTR) & Global Currency / Karat Quick Switch */}
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

            <button
              onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer whitespace-nowrap ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-800'
                  : 'bg-slate-950 border-slate-800 text-slate-200'
              }`}
            >
              {lang === 'fa' ? '🇬🇧 English (LTR)' : '🇮🇷 فارسی (RTL)'}
            </button>
          </div>
        </div>
      </div>

      {/* Live Gold Ticker Bar (تابلوی زنده نرخ طلا برای مانیتور مغازه و موبایل) */}
      <div
        className={`border-b transition-colors ${
          isLight
            ? 'bg-amber-50/70 border-amber-200 text-slate-900'
            : 'bg-slate-900/60 border-amber-500/20 text-slate-100'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-5 md:gap-7 text-sm">
            <div>
              <span className="opacity-70 text-xs block">
                {lang === 'fa' ? 'گرم طلای ۱۸ عیار (۷۵۰)' : '18K Gold (750)'}
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
                {lang === 'fa' ? 'گرم ۲۱ عیار (۸۷۵ دبی)' : '21K Gold (875)'}
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
                {lang === 'fa' ? 'گرم ۲۴ عیار خالص (۹۹۹.۹)' : '24K Pure Gold'}
              </span>
              <span className="font-tabular font-bold text-base">
                {marketMode === 'IR'
                  ? `${rates.gram24kToman.toLocaleString('en-US')} تومان`
                  : formatMoney(
                      (rates.ounceUsd / 31.1034768) *
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
                {lang === 'fa' ? 'انس جهانی (Ounce XAU)' : 'Global Spot (XAU)'}
              </span>
              <span className="font-tabular font-bold text-base text-emerald-500">
                ${rates.ounceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <span aria-hidden="true" className="opacity-25">
              ·
            </span>

            <div>
              <span className="opacity-70 text-xs block">
                {lang === 'fa' ? 'مثقال ۱۷ عیار' : 'Mithqal (4.33g)'}
              </span>
              <span className="font-tabular font-bold text-base">
                {rates.mithqalToman.toLocaleString('en-US')}{' '}
                {lang === 'fa' ? 'تومان' : 'Toman'}
              </span>
            </div>

            <span aria-hidden="true" className="opacity-25">
              ·
            </span>

            <div>
              <span className="opacity-70 text-xs block">
                {lang === 'fa' ? 'سکه تمام امامی' : 'Emami Gold Coin'}
              </span>
              <span className="font-tabular font-bold text-base text-amber-500">
                {rates.coinEmamiToman.toLocaleString('en-US')}{' '}
                {lang === 'fa' ? 'تومان' : 'Toman'}
              </span>
            </div>
          </div>

          {/* TV Mode & Quick Jeweler Rate Adjuster Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleSimulateTick}
              title={lang === 'fa' ? 'بروزرسانی زنده نوسان بازار' : 'Refresh Live Tick'}
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
                {lang === 'fa'
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
                {lang === 'fa'
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
                {lang === 'fa'
                  ? 'اکوسیستم آفرینش | شهر جدید نیومتاورسیتی جهان | توان استیج FBNM'
                  : 'Creation Ecosystem | New Metaversity World | FBNM Stage'}
              </div>

              <h1
                className="text-3xl md:text-5xl font-bold leading-tight tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                {lang === 'fa'
                  ? 'طلایار جهانی | سامانه هوشمند ویترین زنده، بنکداری و محاسبه‌گر لحظه‌ای طلا، جواهر و سکه ایران و جهان'
                  : 'TalaYar Global VIP — Live Gold Showcase, B2B Wholesale & Real-Time Jewelry Pricing Engine'}
              </h1>

              <p className="text-base md:text-lg opacity-85 leading-relaxed max-w-2xl">
                {lang === 'fa'
                  ? 'طراحی‌شده برای طلافروشان، بنکداران و گالری‌های جواهر در سراسر ایران، دبی، ترکیه، اروپا و کانادا. با قابلیت تغییر آنی بین فرمول اتحادیه طلا و جواهر ایران (تومان / عیار ۷۵۰) و بازار جهانی (USD, AED, EUR / 18K–24K) به همراه رابط کاربری ویژه دسترس‌پذیری معلولان و تمرکز ADHD.'
                  : 'Engineered for jewelers and gold wholesalers across Iran, Dubai, Turkey, Europe, and Canada. Instant 1-click switching between Iran Union Toman/750 rules and Global Spot XAU (18K, 21K, 22K, 24K) with full WCAG accessibility and ADHD Focus Mode.'}
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
                    {lang === 'fa'
                      ? '🇮🇷 حالت بازار ایران (تومان / عیار ۷۵۰)'
                      : '🇮🇷 Iran Market Mode (Toman / 750)'}
                  </div>
                  <div className="text-xs opacity-80 mt-1">
                    {lang === 'fa'
                      ? 'فرمول رسمی اتحادیه طلا (سود ۷٪ + مالیات ۱۰٪ صرفاً روی سود و اجرت) + مظنه مثقال و سکه امامی'
                      : 'Official Iran Union Formula + Mithqal & Emami Coin'}
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
                    {lang === 'fa'
                      ? '🌍 حالت بازار جهانی (USD, AED, EUR / 18K–24K)'
                      : '🌍 Global Market Mode (USD, AED, EUR / 18K–24K)'}
                  </div>
                  <div className="text-xs opacity-80 mt-1">
                    {lang === 'fa'
                      ? 'بر پایه انس جهانی XAU برای طلافروشان دبی، استانبول، اروپا و کانادا با عیارهای ۱۸، ۲۱، ۲۲ و ۲۴'
                      : 'Live XAU Spot pricing for Dubai, Istanbul, Europe & Canada'}
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
                    {lang === 'fa'
                      ? 'ماشین‌حساب آنی وزن و اجرت (تک‌فروشی و بنکداری)'
                      : 'Instant Weight & Making Charge Calculator'}
                  </span>
                </div>
                <button
                  onClick={() =>
                    speakText(
                      lang === 'fa'
                        ? `برای وزن ${calcWeight} گرم با عیار ${calcKarat} و اجرت ${calcRetailOjrat} درصد، قیمت تک‌فروشی به مشتری ${formatMoney(customCalcResult.retailTotalPrice, marketMode, globalCurrency, lang)} و وزن تسویه بنکداری همکار ${customCalcResult.wholesaleGoldSettlementGrams} گرم طلا می‌باشد.`
                        : `For ${calcWeight} grams of ${calcKarat} karat gold with ${calcRetailOjrat}% making charge, retail price is ${formatMoney(customCalcResult.retailTotalPrice, marketMode, globalCurrency, lang)} and wholesale settlement weight is ${customCalcResult.wholesaleGoldSettlementGrams} grams.`
                    )
                  }
                  className="p-2 rounded-lg bg-amber-500/15 text-amber-500 hover:bg-amber-500/25 cursor-pointer"
                  title={lang === 'fa' ? 'قرائت صوتی محاسبه' : 'Speak Calculation'}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-bold mb-1">
                    {lang === 'fa' ? 'وزن خالص طلا (گرم)' : 'Net Weight (Grams)'}
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
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">
                    {lang === 'fa' ? 'انتخاب عیار طلا / نقره' : 'Select Karat / Purity'}
                  </label>
                  <select
                    value={calcKarat}
                    onChange={(e) => setCalcKarat(Number(e.target.value) as GoldKarat)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-tabular text-base font-bold ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900'
                        : 'bg-slate-900 border-slate-700 text-white'
                    }`}
                  >
                    <option value={18}>18K (عیار ۷۵۰ ایران/اروپا)</option>
                    <option value={21}>21K (عیار ۸۷۵ دبی/عربی)</option>
                    <option value={22}>22K (عیار ۹۱۶ امارات/هند)</option>
                    <option value={24}>24K (عیار ۹۹۹.۹ شمش خالص)</option>
                    <option value={925}>Silver 925 (نقره ۹۲۵)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">
                    {lang === 'fa' ? 'اجرت ساخت تک‌فروشی (%)' : 'Retail Making Charge (%)'}
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
                    {lang === 'fa' ? 'اجرت عمده بنکداری (%)' : 'B2B Workshop Making (%)'}
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
                    {lang === 'fa'
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
                    {lang === 'fa'
                      ? 'قیمت عمده بنکداری / کیفی همکار (تسویه طلا به طلا: وزن + درصد کارگاه):'
                      : 'B2B Wholesale Settlement (Gold-for-Gold Weight + Cash Eq.):'}
                  </div>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mt-1 font-tabular">
                    <span className="text-lg font-bold text-emerald-500">
                      {customCalcResult.wholesaleGoldSettlementGrams}{' '}
                      {lang === 'fa' ? 'گرم طلای معادل' : 'g Fine Settlement'}
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

        {/* Section 01: Live Jewelry Showcase & Automatic Weight/Making Charge Pricing Engine (10 Real Products) */}
        <section id="showcase" className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-amber-500/20 pb-5">
            <div>
              <span className="text-xs font-semibold text-amber-500 tracking-wide">
                {lang === 'fa'
                  ? '۰۱. ویترین زنده و موتور قیمت‌گذاری خودکار لحظه‌ای روی وزن و اجرت (۱۰ محصول استاندارد)'
                  : '01. Live Jewelry Showcase & Automated Weight / Making Charge Pricing Engine'}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold mt-1">
                {lang === 'fa'
                  ? 'نمایش همزمان «قیمت تک‌فروشی به مشتری» و «قیمت عمده بنکداری / کیفی همکار (طلا به طلا)»'
                  : 'Simultaneous Customer Retail Price & B2B Wholesale Gold-for-Gold Settlement'}
              </h2>
            </div>

            {/* Global Karat Override when in Global Mode */}
            {marketMode === 'GLOBAL' && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold">
                  {lang === 'fa' ? 'عیار پیش‌فرض بازار جهانی:' : 'Global Showcase Karat:'}
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
                {lang === 'fa' ? cat.labelFa : cat.labelEn}
              </button>
            ))}
          </div>

          {/* 3-Column Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredProducts.map((product) => {
              const effectiveKarat: GoldKarat =
                product.defaultKarat === 925
                  ? 925
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

              const whatsappOrderText =
                lang === 'fa'
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
                        alt={lang === 'fa' ? product.nameFa : product.nameEn}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                      <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-xs text-slate-200 font-tabular">
                        <span>
                          {lang === 'fa' ? product.categoryLabelFa : product.categoryLabelEn} ·{' '}
                          {product.code}
                        </span>
                        <span className="font-bold text-amber-400">
                          {effectiveKarat === 925 ? 'Silver 925' : `${effectiveKarat}K`}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-4">
                      <div>
                        <div className="text-xs opacity-65 flex items-center gap-1.5">
                          <span>
                            {lang === 'fa' ? product.craftOriginFa : product.craftOriginEn}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{lang === 'fa' ? 'موجود در ویترین' : 'In Stock'}</span>
                        </div>
                        <h3 className="text-lg font-bold mt-1 leading-snug">
                          {lang === 'fa' ? product.nameFa : product.nameEn}
                        </h3>
                        <p className="text-xs opacity-75 mt-1">
                          {lang === 'fa' ? product.specsFa : product.specsEn}
                        </p>
                      </div>

                      {/* Interactive Weight & Making Charge Inputs on Card */}
                      <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-amber-500/15">
                        <div>
                          <label className="block text-xs opacity-75 mb-1">
                            {lang === 'fa' ? 'وزن خالص (گرم):' : 'Net Weight (g):'}
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
                            {lang === 'fa' ? 'اجرت ساخت (%):' : 'Making Charge (%):'}
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
                            {lang === 'fa'
                              ? 'قیمت تک‌فروشی به مشتری:'
                              : 'Customer Retail Price:'}
                          </span>
                          <span className="font-tabular">
                            {lang === 'fa'
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

                      {/* Price Display 2: B2B Wholesale (بنکداری / کیفی طلا به طلا) */}
                      <div
                        className={`p-3 rounded-xl border ${
                          isLight
                            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                            : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold">
                            {lang === 'fa'
                              ? `عمده بنکداری/کیفی (اجرت کارگاه ${product.wholesaleMakingChargePercent}٪):`
                              : `B2B Wholesale (${product.wholesaleMakingChargePercent}% Making):`}
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between font-tabular mt-1">
                          <span className="text-sm font-bold text-emerald-500">
                            {lang === 'fa'
                              ? `طلا به طلا: ${breakdown.wholesaleGoldSettlementGrams} گرم`
                              : `Gold-for-Gold: ${breakdown.wholesaleGoldSettlementGrams}g`}
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
                      <span>{lang === 'fa' ? 'استوری' : 'Story'}</span>
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
                      <span>{lang === 'fa' ? 'شناسنامه QR' : 'QR Cert'}</span>
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
                      <span>{lang === 'fa' ? 'واتساپ' : 'WhatsApp'}</span>
                    </a>

                    <button
                      onClick={() =>
                        speakText(
                          lang === 'fa'
                            ? `${product.nameFa}، وزن ${product.weightGrams} گرم، قیمت تک‌فروشی به مشتری ${formatMoney(breakdown.retailTotalPrice, marketMode, globalCurrency, lang)}، و تسویه عمده بنکداری همکار ${breakdown.wholesaleGoldSettlementGrams} گرم طلا.`
                            : `${product.nameEn}, weight ${product.weightGrams} grams, customer retail price ${formatMoney(breakdown.retailTotalPrice, marketMode, globalCurrency, lang)}, wholesale gold settlement ${breakdown.wholesaleGoldSettlementGrams} grams.`
                        )
                      }
                      className={`p-2.5 rounded-xl border cursor-pointer ${
                        isLight
                          ? 'bg-slate-100 border-slate-300 text-slate-800'
                          : 'bg-slate-950 border-slate-700 text-amber-400'
                      }`}
                      title={lang === 'fa' ? 'قرائت صوتی قیمت محصول' : 'Speak Product Price'}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Section 02: Smart Gold Trade-In Calculator */}
        <TradeInCalculator
          products={products}
          rates={rates}
          marketMode={marketMode}
          globalCurrency={globalCurrency}
          lang={lang}
          themeMode={themeMode}
          onSpeak={speakText}
        />

        {/* Exclusive Creative Feature: Digital Gold QR Certificate & Customer Asset Loyalty Passport */}
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

        {/* Section 03: 1-Click HTML5 Canvas HD Story Maker */}
        <StoryMakerSection
          products={products}
          selectedProductForStory={selectedProductForStory}
          rates={rates}
          marketMode={marketMode}
          globalCurrency={globalCurrency}
          lang={lang}
          themeMode={themeMode}
        />

        {/* Section 04: PWA + Native /android Project & Direct GitHub Push */}
        <AndroidGithubSection
          lang={lang}
          themeMode={themeMode}
          onTriggerPWAInstall={triggerInstall}
        />

        {/* Section 05, 06, 07: AI Assistant + Competitive Edge Matrix + VIP & Affiliate Club */}
        <AiVipClubSection
          rates={rates}
          marketMode={marketMode}
          lang={lang}
          themeMode={themeMode}
          onSpeak={speakText}
        />
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
              طلایار جهانی | TalaYar Global VIP
            </div>
            <div className="mt-1">
              اکوسیستم آفرینش | شهر جدید نیومتاورسیتی جهان | توان استیج FBNM
            </div>
          </div>
          <div className="font-tabular text-xs">
            Package: com.talayar.global · PWA Ready · WCAG AAA & ADHD Accessible
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
                  {lang === 'fa'
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
                  {lang === 'fa' ? '🍎 نصب روی آیفون و آیپد (Safari):' : '🍎 iPhone & iPad (Safari):'}
                </div>
                <p>
                  {lang === 'fa'
                    ? '۱. در نوار پایین مرورگر سافاری دکمه Share (مربع با فلش رو به بالا) را لمس کنید.\n۲. گزینه «Add to Home Screen» را انتخاب و دکمه Add را بزنید.'
                    : '1. Tap the Share button in Safari toolbar.\n2. Select "Add to Home Screen" and tap Add.'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="font-bold text-emerald-500 mb-1">
                  {lang === 'fa'
                    ? '🤖 نصب روی اندروید و کروم (Chrome):'
                    : '🤖 Android & Desktop Chrome:'}
                </div>
                <p>
                  {lang === 'fa'
                    ? '۱. منوی سه‌نقطه بالای مرورگر کروم را بزنید.\n۲. گزینه «Install App» یا «Add to Home Screen» را انتخاب کنید تا آیکون طلایار روی صفحه اصلی گوشی نصب شود.'
                    : '1. Tap the three-dot menu in Chrome.\n2. Select "Install App" or "Add to Home Screen".'}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs opacity-80">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  {lang === 'fa'
                    ? 'فایل manifest.json و آیکون‌های استاندارد ۱۹۲ و ۵۱۲ پیکسل فعال هستند.'
                    : 'Web App Manifest & 192/512px icons are active and verified.'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="mt-6 w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm cursor-pointer"
            >
              {lang === 'fa' ? 'متوجه شدم' : 'Got It'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
