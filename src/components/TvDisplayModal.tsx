import React, { useState } from 'react';
import { X, Tv, Sliders, Volume2, RefreshCw, Check } from 'lucide-react';
import { GlobalCurrency, Language, MarketMode, MarketRatesState } from '../types/gold';

interface TvDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  rates: MarketRatesState;
  marketMode: MarketMode;
  globalCurrency: GlobalCurrency;
  lang: Language;
  themeMode: 'light' | 'dark';
  onSpeak: (text: string) => void;
}

export const TvDisplayModal: React.FC<TvDisplayModalProps> = ({
  isOpen,
  onClose,
  rates,
  marketMode,
  lang,
  onSpeak,
}) => {
  if (!isOpen) return null;

  const buy18k = Math.round(rates.gram18kToman * (1 - rates.boardSpreadPercent / 100));
  const sell18k = rates.gram18kToman;

  const handleVoiceReadBoard = () => {
    const msg =
      lang === 'fa'
        ? `تابلوی زنده ${rates.galleryName}. نرخ فروش هر گرم طلای هجده عیار: ${sell18k.toLocaleString('en-US')} تومان. نرخ خرید طلای متفرقه: ${buy18k.toLocaleString('en-US')} تومان. سکه تمام امامی: ${rates.coinEmamiToman.toLocaleString('en-US')} تومان. انس جهانی طلا: ${rates.ounceUsd} دلار.`
        : `Live Gold Board at ${rates.galleryName}. 18 Karat Gold Sell Rate: ${sell18k.toLocaleString('en-US')} Toman. Buyback Rate: ${buy18k.toLocaleString('en-US')} Toman. Global Spot Ounce: ${rates.ounceUsd} US Dollars.`;
    onSpeak(msg);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950 text-slate-50 flex flex-col justify-between p-6 md:p-10 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={lang === 'fa' ? 'نمایشگر تمام‌صفحه تلویزیون طلافروشی' : 'Showroom TV Display Mode'}
    >
      {/* Top TV Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-500/30 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-400/15 border-2 border-amber-400 flex items-center justify-center text-amber-400">
            <Tv className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl md:text-4xl font-bold text-amber-400 tracking-tight">
              {rates.galleryName}
            </h2>
            <p className="text-sm md:text-base text-slate-300 mt-1">
              {lang === 'fa'
                ? 'تابلوی رسمی نرخ لحظه‌ای طلا، جواهر، سکه و انس جهانی — سامانه طلایار جهانی VIP'
                : 'Official Live Gold, Bullion, Coin & Global XAU Spot Board — TalaYar Global VIP'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleVoiceReadBoard}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 hover:bg-emerald-500/30 font-semibold text-base transition-colors cursor-pointer"
          >
            <Volume2 className="w-5 h-5" />
            <span>{lang === 'fa' ? 'قرائت صوتی نرخ تابلو' : 'Read Board Aloud'}</span>
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 font-semibold text-base transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
            <span>{lang === 'fa' ? 'خروج از حالت تلویزیون' : 'Exit TV Mode'}</span>
          </button>
        </div>
      </div>

      {/* Main Giant Digital Rate Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-8">
        {/* 18K Sell & Buyback */}
        <div className="rounded-2xl bg-slate-900/90 border-2 border-amber-400 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-300 text-lg font-semibold">
            <span>{lang === 'fa' ? 'گرم طلای ۱۸ عیار (۷۵۰)' : '18K Gold Gram (750)'}</span>
            <span>750</span>
          </div>
          <div className="my-4">
            <div className="text-xs text-slate-400 mb-1">
              {lang === 'fa' ? 'نرخ فروش تابلو (تومان)' : 'Board Sell Rate (Toman)'}
            </div>
            <div className="text-4xl md:text-5xl font-bold text-amber-400 font-tabular">
              {sell18k.toLocaleString('en-US')}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-base">
            <span className="text-emerald-400 font-medium">
              {lang === 'fa' ? 'خرید طلای متفرقه/کهنه:' : 'Scrap Buyback:'}
            </span>
            <span className="font-tabular font-bold text-emerald-400 text-xl">
              {buy18k.toLocaleString('en-US')}
            </span>
          </div>
        </div>

        {/* 24K & 21K */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-700 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-200 text-lg font-semibold">
            <span>{lang === 'fa' ? 'گرم طلای ۲۴ عیار خالص' : '24K Fine Gold Gram'}</span>
            <span>999.9</span>
          </div>
          <div className="my-4">
            <div className="text-xs text-slate-400 mb-1">
              {lang === 'fa' ? 'شمش و طلای خالص (تومان)' : '24K Pure Rate (Toman)'}
            </div>
            <div className="text-4xl md:text-5xl font-bold text-white font-tabular">
              {rates.gram24kToman.toLocaleString('en-US')}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-base">
            <span className="text-slate-300">
              {lang === 'fa' ? 'گرم طلای ۲۱ عیار (۸۷۵):' : '21K Gold (875):'}
            </span>
            <span className="font-tabular font-bold text-amber-300 text-xl">
              {rates.gram21kToman.toLocaleString('en-US')}
            </span>
          </div>
        </div>

        {/* Global Ounce & Mithqal */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-700 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400 text-lg font-semibold">
            <span>{lang === 'fa' ? 'انس جهانی طلا (XAU/USD)' : 'Global Spot Ounce (XAU)'}</span>
            <span>USD</span>
          </div>
          <div className="my-4">
            <div className="text-xs text-slate-400 mb-1">
              {lang === 'fa' ? 'بازار جهانی لندن و نیویورک' : 'International Spot Market'}
            </div>
            <div className="text-4xl md:text-5xl font-bold text-emerald-400 font-tabular">
              ${rates.ounceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-base">
            <span className="text-slate-300">
              {lang === 'fa' ? 'مظنه مثقال ۱۷ عیار:' : 'Iranian Mithqal:'}
            </span>
            <span className="font-tabular font-bold text-white text-xl">
              {rates.mithqalToman.toLocaleString('en-US')}
            </span>
          </div>
        </div>

        {/* Coins Board */}
        <div className="rounded-2xl bg-slate-900/90 border border-amber-500/40 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-300 text-lg font-semibold">
            <span>{lang === 'fa' ? 'سکه تمام بهار آزادی امامی' : 'Emami Full Gold Coin'}</span>
            <span>8.133g</span>
          </div>
          <div className="my-4">
            <div className="text-xs text-slate-400 mb-1">
              {lang === 'fa' ? 'ضرب جدید بانکی (تومان)' : 'Central Bank Mint (Toman)'}
            </div>
            <div className="text-4xl md:text-5xl font-bold text-amber-400 font-tabular">
              {rates.coinEmamiToman.toLocaleString('en-US')}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-slate-400 block">{lang === 'fa' ? 'نیم سکه:' : 'Half Coin:'}</span>
              <span className="font-tabular font-bold text-white">
                {rates.coinHalfToman.toLocaleString('en-US')}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">{lang === 'fa' ? 'ربع سکه:' : 'Quarter Coin:'}</span>
              <span className="font-tabular font-bold text-white">
                {rates.coinQuarterToman.toLocaleString('en-US')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Row: Global Currencies & Silver */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
        <div>
          <span className="text-sm text-slate-400 block">
            {lang === 'fa' ? 'گرم ۱۸ عیار به دلار (USD)' : '18K Gram in USD'}
          </span>
          <span className="text-2xl font-bold text-white font-tabular">
            ${((rates.ounceUsd / 31.1034768) * 0.75).toFixed(2)}
          </span>
        </div>
        <div>
          <span className="text-sm text-slate-400 block">
            {lang === 'fa' ? 'گرم ۲۱ عیار دبی به درهم (AED)' : '21K Gram in Dubai AED'}
          </span>
          <span className="text-2xl font-bold text-amber-400 font-tabular">
            {((rates.ounceUsd / 31.1034768) * (21 / 24) * rates.usdToAed).toFixed(2)} AED
          </span>
        </div>
        <div>
          <span className="text-sm text-slate-400 block">
            {lang === 'fa' ? 'گرم ۱۸ عیار اروپا به یورو (EUR)' : '18K Gram in EUR'}
          </span>
          <span className="text-2xl font-bold text-emerald-400 font-tabular">
            €{((rates.ounceUsd / 31.1034768) * 0.75 * rates.usdToEur).toFixed(2)}
          </span>
        </div>
        <div>
          <span className="text-sm text-slate-400 block">
            {lang === 'fa' ? 'هر گرم نقره ۹۲۵ ایتالیا' : '925 Silver Gram'}
          </span>
          <span className="text-2xl font-bold text-slate-200 font-tabular">
            {marketMode === 'IR'
              ? `${rates.silver925GramToman.toLocaleString('en-US')} تومان`
              : `$${((rates.silverOunceUsd / 31.1034768) * 0.925).toFixed(2)}`}
          </span>
        </div>
      </div>

      {/* Bottom Footer in TV Mode */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800 text-sm text-slate-400">
        <div>
          {lang === 'fa'
            ? `قانون مالیات اتحادیه: اصل طلا معاف از مالیات بوده و ${rates.defaultTaxPercent}٪ مالیات صرفاً به اجرت و سود تعلق می‌گیرد.`
            : `Union Tax Rule: Raw gold principal is tax-exempt; ${rates.defaultTaxPercent}% VAT applies solely to making charge + margin.`}
        </div>
        <div className="font-tabular text-amber-400 font-semibold">
          {rates.galleryPhone} · {rates.galleryInstagram}
        </div>
      </div>
    </div>
  );
};

interface QuickRateAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  rates: MarketRatesState;
  onSaveRates: (updated: Partial<MarketRatesState>) => Promise<void>;
  lang: Language;
  themeMode: 'light' | 'dark';
}

export const QuickRateAdjustModal: React.FC<QuickRateAdjustModalProps> = ({
  isOpen,
  onClose,
  rates,
  onSaveRates,
  lang,
  themeMode,
}) => {
  const [gram18k, setGram18k] = useState(String(rates.gram18kToman));
  const [ounceUsd, setOunceUsd] = useState(String(rates.ounceUsd));
  const [coinEmami, setCoinEmami] = useState(String(rates.coinEmamiToman));
  const [profitPct, setProfitPct] = useState(String(rates.defaultProfitPercent));
  const [taxPct, setTaxPct] = useState(String(rates.defaultTaxPercent));
  const [usedDeduction, setUsedDeduction] = useState(String(rates.usedGoldDeductionPercent));
  const [galleryName, setGalleryName] = useState(rates.galleryName);
  const [galleryPhone, setGalleryPhone] = useState(rates.galleryPhone);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const isLight = themeMode === 'light';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSaveRates({
      gram18kToman: Number(gram18k) || rates.gram18kToman,
      ounceUsd: Number(ounceUsd) || rates.ounceUsd,
      coinEmamiToman: Number(coinEmami) || rates.coinEmamiToman,
      defaultProfitPercent: Number(profitPct) || 7,
      defaultTaxPercent: Number(taxPct) || 10,
      usedGoldDeductionPercent: Number(usedDeduction) || 1.5,
      galleryName,
      galleryPhone,
    });
    setSaving(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full max-w-2xl rounded-2xl border p-6 md:p-8 shadow-2xl ${
          isLight
            ? 'bg-white border-amber-500/40 text-slate-900'
            : 'bg-slate-900 border-amber-400/40 text-slate-100'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-amber-500/20">
          <div className="flex items-center gap-3">
            <Sliders className="w-6 h-6 text-amber-500" />
            <h3 className="text-xl font-bold">
              {lang === 'fa'
                ? 'تنظیم سریع نرخ تابلو و مشخصات گالری توسط طلافروش'
                : 'Jeweler Quick Board Rate & Gallery Calibration'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-amber-500/10 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">
                {lang === 'fa' ? 'نرخ گرم ۱۸ عیار (تومان)' : '18K Gram Rate (Toman)'}
              </label>
              <input
                type="number"
                value={gram18k}
                onChange={(e) => setGram18k(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border font-tabular text-lg font-bold ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-slate-950 border-slate-700 text-amber-400'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">
                {lang === 'fa' ? 'انس جهانی طلا (XAU $)' : 'Global Spot Ounce ($)'}
              </label>
              <input
                type="number"
                step="0.01"
                value={ounceUsd}
                onChange={(e) => setOunceUsd(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border font-tabular text-lg font-bold ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-slate-950 border-slate-700 text-emerald-400'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">
                {lang === 'fa' ? 'سکه تمام امامی (تومان)' : 'Emami Coin (Toman)'}
              </label>
              <input
                type="number"
                value={coinEmami}
                onChange={(e) => setCoinEmami(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border font-tabular text-lg font-bold ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-slate-950 border-slate-700 text-white'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">
                {lang === 'fa' ? 'سود پیش‌فرض طلافروش (%)' : 'Default Seller Profit (%)'}
              </label>
              <input
                type="number"
                step="0.5"
                value={profitPct}
                onChange={(e) => setProfitPct(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border font-tabular text-base font-bold ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-slate-950 border-slate-700 text-white'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">
                {lang === 'fa' ? 'مالیات بر اجرت و سود (%)' : 'Tax on Profit+Making (%)'}
              </label>
              <input
                type="number"
                step="0.5"
                value={taxPct}
                onChange={(e) => setTaxPct(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border font-tabular text-base font-bold ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-slate-950 border-slate-700 text-white'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">
                {lang === 'fa' ? 'کسر خرید طلای کهنه (%)' : 'Scrap Buyback Deduction (%)'}
              </label>
              <input
                type="number"
                step="0.1"
                value={usedDeduction}
                onChange={(e) => setUsedDeduction(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border font-tabular text-base font-bold ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-slate-950 border-slate-700 text-white'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">
                {lang === 'fa' ? 'نام گالری طلافروشی (جهت تابلو و استوری)' : 'Gallery Name'}
              </label>
              <input
                type="text"
                value={galleryName}
                onChange={(e) => setGalleryName(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border text-base font-semibold ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-slate-950 border-slate-700 text-white'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">
                {lang === 'fa' ? 'شماره واتساپ / تماس گالری' : 'Gallery WhatsApp / Phone'}
              </label>
              <input
                type="text"
                value={galleryPhone}
                onChange={(e) => setGalleryPhone(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border font-tabular text-base font-semibold ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-slate-950 border-slate-700 text-white'
                }`}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-amber-500/20">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl border border-slate-500/40 font-semibold cursor-pointer"
            >
              {lang === 'fa' ? 'انصراف' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer transition-colors"
            >
              {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              <span>
                {lang === 'fa'
                  ? 'ذخیره و بروزرسانی آنی تمام قیمت‌های ویترین'
                  : 'Save & Recalculate All Showcase Prices'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
