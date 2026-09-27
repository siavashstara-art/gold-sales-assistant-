import React, { useEffect, useRef, useState } from 'react';
import { Download, Image as ImageIcon, LayoutTemplate, Sparkles } from 'lucide-react';
import {
  GlobalCurrency,
  GoldKarat,
  JewelryProduct,
  Language,
  MarketMode,
  MarketRatesState,
} from '../types/gold';
import { calculateProductPrice, formatMoney } from '../utils/goldPricing';

interface StoryMakerSectionProps {
  products: JewelryProduct[];
  selectedProductForStory: JewelryProduct | null;
  rates: MarketRatesState;
  marketMode: MarketMode;
  globalCurrency: GlobalCurrency;
  lang: Language;
  themeMode: 'light' | 'dark';
}

export const StoryMakerSection: React.FC<StoryMakerSectionProps> = ({
  products,
  selectedProductForStory,
  rates,
  marketMode,
  globalCurrency,
  lang,
  themeMode,
}) => {
  const [posterMode, setPosterMode] = useState<'BOARD' | 'PRODUCT'>('BOARD');
  const [posterTheme, setPosterTheme] = useState<'ROYAL_DARK' | 'CLEAN_WHITE'>('ROYAL_DARK');
  const [activeProductId, setActiveProductId] = useState<string>(
    selectedProductForStory?.id || products[0]?.id || 'prod-1'
  );
  const [showWholesaleOnPoster, setShowWholesaleOnPoster] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (selectedProductForStory) {
      setActiveProductId(selectedProductForStory.id);
      setPosterMode('PRODUCT');
    }
  }, [selectedProductForStory]);

  const activeProduct = products.find((p) => p.id === activeProductId) || products[0];
  const isLight = themeMode === 'light';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1080;
    const H = 1920;
    canvas.width = W;
    canvas.height = H;

    const drawFrameAndBackground = () => {
      if (posterTheme === 'ROYAL_DARK') {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
        bgGrad.addColorStop(0, '#020617');
        bgGrad.addColorStop(0.5, '#0f172a');
        bgGrad.addColorStop(1, '#020617');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);
      } else {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
        bgGrad.addColorStop(0, '#ffffff');
        bgGrad.addColorStop(0.5, '#f8fafc');
        bgGrad.addColorStop(1, '#f1f5f9');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);
      }

      // Outer & Inner Royal Gold Frame
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 6;
      ctx.strokeRect(48, 48, W - 96, H - 96);

      ctx.strokeStyle = posterTheme === 'ROYAL_DARK' ? 'rgba(251, 191, 36, 0.35)' : 'rgba(180, 83, 9, 0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(68, 68, W - 136, H - 136);

      // Header Brand Crown
      ctx.textAlign = 'center';
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 34px Vazirmatn, sans-serif';
      ctx.fillText(
        lang === 'fa' ? '✦ طلایار جهانی | TALAYAR GLOBAL VIP ✦' : '✦ TALAYAR GLOBAL VIP SHOWCASE ✦',
        W / 2,
        150
      );

      ctx.fillStyle = posterTheme === 'ROYAL_DARK' ? '#f8fafc' : '#0f172a';
      ctx.font = 'bold 54px Vazirmatn, sans-serif';
      ctx.fillText(rates.galleryName, W / 2, 235);

      ctx.fillStyle = posterTheme === 'ROYAL_DARK' ? '#94a3b8' : '#475569';
      ctx.font = '28px Vazirmatn, sans-serif';
      const dateStr = new Date().toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      ctx.fillText(
        lang === 'fa' ? `بروزرسانی زنده: ${dateStr}` : `Live Market Snapshot · ${dateStr}`,
        W / 2,
        295
      );
    };

    const drawFooter = () => {
      ctx.fillStyle = posterTheme === 'ROYAL_DARK' ? '#0f172a' : '#e2e8f0';
      ctx.fillRect(88, H - 230, W - 176, 120);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.strokeRect(88, H - 230, W - 176, 120);

      ctx.textAlign = 'center';
      ctx.fillStyle = posterTheme === 'ROYAL_DARK' ? '#fbbf24' : '#b45309';
      ctx.font = 'bold 34px JetBrains Mono, Vazirmatn, sans-serif';
      ctx.fillText(`${rates.galleryPhone}  |  ${rates.galleryInstagram}`, W / 2, H - 170);

      ctx.fillStyle = posterTheme === 'ROYAL_DARK' ? '#94a3b8' : '#475569';
      ctx.font = '24px Vazirmatn, sans-serif';
      ctx.fillText(
        'اکوسیستم آفرینش | شهر جدید نیومتاورسیتی جهان | توان استیج FBNM',
        W / 2,
        H - 128
      );
    };

    drawFrameAndBackground();

    if (posterMode === 'BOARD') {
      // Mode A: Daily Gold, Coin & Ounce Rate Board
      const rows = [
        {
          label: lang === 'fa' ? 'گرم طلای ۱۸ عیار (۷۵۰)' : '18K Gold Gram (750)',
          value: `${rates.gram18kToman.toLocaleString('en-US')} تومان`,
          accent: true,
        },
        {
          label: lang === 'fa' ? 'گرم طلای ۲۴ عیار خالص' : '24K Pure Gold Gram',
          value: `${rates.gram24kToman.toLocaleString('en-US')} تومان`,
          accent: false,
        },
        {
          label: lang === 'fa' ? 'گرم طلای ۲۱ عیار (۸۷۵)' : '21K Gold Gram (875)',
          value: `${rates.gram21kToman.toLocaleString('en-US')} تومان`,
          accent: false,
        },
        {
          label: lang === 'fa' ? 'مظنه مثقال ۱۷ عیار' : 'Iranian Mithqal (4.3318g)',
          value: `${rates.mithqalToman.toLocaleString('en-US')} تومان`,
          accent: false,
        },
        {
          label: lang === 'fa' ? 'انس جهانی طلا (XAU/USD)' : 'Global Spot Gold (XAU)',
          value: `$${rates.ounceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          accent: true,
        },
        {
          label: lang === 'fa' ? 'سکه تمام بهار آزادی امامی' : 'Emami Full Gold Coin',
          value: `${rates.coinEmamiToman.toLocaleString('en-US')} تومان`,
          accent: true,
        },
        {
          label: lang === 'fa' ? 'نیم سکه بانکی' : 'Half Azadi Gold Coin',
          value: `${rates.coinHalfToman.toLocaleString('en-US')} تومان`,
          accent: false,
        },
        {
          label: lang === 'fa' ? 'ربع سکه بانکی' : 'Quarter Azadi Gold Coin',
          value: `${rates.coinQuarterToman.toLocaleString('en-US')} تومان`,
          accent: false,
        },
      ];

      let y = 360;
      for (const row of rows) {
        ctx.fillStyle = row.accent
          ? posterTheme === 'ROYAL_DARK'
            ? 'rgba(245, 158, 11, 0.16)'
            : 'rgba(245, 158, 11, 0.14)'
          : posterTheme === 'ROYAL_DARK'
          ? 'rgba(30, 41, 59, 0.75)'
          : '#ffffff';
        ctx.fillRect(96, y, W - 192, 130);

        ctx.strokeStyle = row.accent ? '#f59e0b' : 'rgba(148, 163, 184, 0.35)';
        ctx.lineWidth = row.accent ? 3 : 1.5;
        ctx.strokeRect(96, y, W - 192, 130);

        ctx.textAlign = 'right';
        ctx.fillStyle = posterTheme === 'ROYAL_DARK' ? '#f8fafc' : '#0f172a';
        ctx.font = 'bold 34px Vazirmatn, sans-serif';
        ctx.fillText(row.label, W - 135, y + 78);

        ctx.textAlign = 'left';
        ctx.fillStyle = row.accent
          ? posterTheme === 'ROYAL_DARK'
            ? '#fbbf24'
            : '#b45309'
          : posterTheme === 'ROYAL_DARK'
          ? '#34d399'
          : '#047857';
        ctx.font = 'bold 42px JetBrains Mono, Vazirmatn, sans-serif';
        ctx.fillText(row.value, 135, y + 80);

        y += 152;
      }

      drawFooter();
    } else {
      // Mode B: Product Showcase Story Poster
      const breakdown = calculateProductPrice({
        weightGrams: activeProduct.weightGrams,
        karat: activeProduct.defaultKarat as GoldKarat,
        retailMakingChargePercent: activeProduct.retailMakingChargePercent,
        wholesaleMakingChargePercent: activeProduct.wholesaleMakingChargePercent,
        profitPercent: rates.defaultProfitPercent,
        taxPercent: rates.defaultTaxPercent,
        rates,
        marketMode,
        globalCurrency,
      });

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        drawFrameAndBackground();

        // Draw product photo container
        const imgX = 110;
        const imgY = 340;
        const imgW = W - 220;
        const imgH = 640;

        ctx.save();
        ctx.beginPath();
        ctx.rect(imgX, imgY, imgW, imgH);
        ctx.clip();
        // Cover fit
        const scale = Math.max(imgW / img.width, imgH / img.height);
        const dW = img.width * scale;
        const dH = img.height * scale;
        ctx.drawImage(img, imgX + (imgW - dW) / 2, imgY + (imgH - dH) / 2, dW, dH);
        ctx.restore();

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 4;
        ctx.strokeRect(imgX, imgY, imgW, imgH);

        // Product Title & Specs
        ctx.textAlign = 'center';
        ctx.fillStyle = posterTheme === 'ROYAL_DARK' ? '#fbbf24' : '#b45309';
        ctx.font = 'bold 30px Vazirmatn, sans-serif';
        ctx.fillText(
          `${lang === 'fa' ? activeProduct.categoryLabelFa : activeProduct.categoryLabelEn} · CODE: ${activeProduct.code}`,
          W / 2,
          1050
        );

        ctx.fillStyle = posterTheme === 'ROYAL_DARK' ? '#ffffff' : '#0f172a';
        ctx.font = 'bold 44px Vazirmatn, sans-serif';
        ctx.fillText(
          lang === 'fa' ? activeProduct.nameFa : activeProduct.nameEn,
          W / 2,
          1120
        );

        // Specs Grid Box
        ctx.fillStyle = posterTheme === 'ROYAL_DARK' ? 'rgba(15, 23, 42, 0.9)' : '#ffffff';
        ctx.fillRect(110, 1170, W - 220, 240);
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(110, 1170, W - 220, 240);

        ctx.font = 'bold 34px Vazirmatn, sans-serif';
        ctx.fillStyle = posterTheme === 'ROYAL_DARK' ? '#e2e8f0' : '#1e293b';
        ctx.fillText(
          lang === 'fa'
            ? `وزن خالص: ${activeProduct.weightGrams} گرم   |   عیار: ${activeProduct.defaultKarat === 925 ? 'نقره ۹۲۵' : `${activeProduct.defaultKarat} عیار`}`
            : `Net Weight: ${activeProduct.weightGrams}g   |   Purity: ${activeProduct.defaultKarat}K`,
          W / 2,
          1245
        );

        ctx.fillStyle = '#10b981';
        ctx.fillText(
          showWholesaleOnPoster
            ? lang === 'fa'
              ? `اجرت عمده بنکداری: ${activeProduct.wholesaleMakingChargePercent}٪  (تسویه طلا به طلا: ${breakdown.wholesaleGoldSettlementGrams} گرم)`
              : `B2B Making: ${activeProduct.wholesaleMakingChargePercent}%  (Gold Settlement: ${breakdown.wholesaleGoldSettlementGrams}g)`
            : lang === 'fa'
            ? `اجرت ساخت: ${activeProduct.retailMakingChargePercent}٪   |   ضمانت اصالت و فاکتور رسمی`
            : `Making Charge: ${activeProduct.retailMakingChargePercent}%   |   Certified Hallmarked`,
          W / 2,
          1335
        );

        // Price Highlight Box
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(110, 1445, W - 220, 180);

        ctx.fillStyle = '#020617';
        ctx.font = 'bold 30px Vazirmatn, sans-serif';
        ctx.fillText(
          showWholesaleOnPoster
            ? lang === 'fa'
              ? 'معادل نقدی بنکداری همکار (به نرخ لحظه‌ای تابلو):'
              : 'Wholesale Cash Equivalent (Live Rate):'
            : lang === 'fa'
            ? 'قیمت تک‌فروشی روز (محاسبه لحظه‌ای با نرخ تابلو):'
            : 'Live Retail Price Today:',
          W / 2,
          1505
        );

        ctx.font = 'bold 56px JetBrains Mono, Vazirmatn, sans-serif';
        const displayPrice = showWholesaleOnPoster
          ? breakdown.wholesaleCashEquivalent
          : breakdown.retailTotalPrice;
        ctx.fillText(
          formatMoney(displayPrice, marketMode, globalCurrency, lang),
          W / 2,
          1585
        );

        drawFooter();
      };
      img.src = activeProduct.imageUrl;
    }
  }, [
    posterMode,
    posterTheme,
    activeProduct,
    showWholesaleOnPoster,
    rates,
    marketMode,
    globalCurrency,
    lang,
  ]);

  const handleDownloadPoster = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download =
      posterMode === 'BOARD'
        ? `TalaYar-RateBoard-${Date.now()}.png`
        : `TalaYar-${activeProduct.code}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <section
      id="story-maker"
      className={`rounded-3xl border p-6 md:p-10 transition-colors ${
        isLight
          ? 'bg-white border-slate-200 shadow-sm text-slate-900'
          : 'bg-slate-900/70 border-slate-800 text-slate-100'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-amber-500/20">
        <div>
          <span className="text-xs font-semibold text-amber-500 tracking-wide">
            {lang === 'fa'
              ? '۰۳. استوری‌ساز ۱ کلیکی طلافروش (HTML5 Canvas HD 1080×1920)'
              : '03. 1-Click HTML5 Canvas HD Story Maker (1080×1920)'}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mt-1">
            {lang === 'fa'
              ? 'تولید آنی پوستر اینستاگرام و واتساپ در ۲ حالت «تابلوی نرخ روز» و «معرفی محصول»'
              : 'Instant 1080×1920 HD Story Generator for Rate Boards & Jewelry Showcases'}
          </h2>
        </div>

        <button
          onClick={handleDownloadPoster}
          className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base shadow-md transition-colors cursor-pointer"
        >
          <Download className="w-5 h-5" />
          <span>
            {lang === 'fa'
              ? 'دانلود فوری پوستر استوری HD (1080×1920)'
              : 'Download HD Story Poster (1080×1920)'}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2">
              {lang === 'fa' ? '۱. انتخاب نوع پوستر استوری:' : '1. Select Story Poster Mode:'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setPosterMode('BOARD')}
                className={`flex items-center gap-2.5 p-4 rounded-xl border font-bold text-sm cursor-pointer transition-colors ${
                  posterMode === 'BOARD'
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
                }`}
              >
                <LayoutTemplate className="w-5 h-5 shrink-0" />
                <span>
                  {lang === 'fa'
                    ? 'الف) پوستر تابلوی نرخ روز طلا و سکه'
                    : 'A) Daily Gold & Coin Rate Board'}
                </span>
              </button>

              <button
                onClick={() => setPosterMode('PRODUCT')}
                className={`flex items-center gap-2.5 p-4 rounded-xl border font-bold text-sm cursor-pointer transition-colors ${
                  posterMode === 'PRODUCT'
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
                }`}
              >
                <ImageIcon className="w-5 h-5 shrink-0" />
                <span>
                  {lang === 'fa'
                    ? 'ب) پوستر معرفی محصول طلا با قیمت روز'
                    : 'B) Product Showcase Story Poster'}
                </span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">
              {lang === 'fa'
                ? '۲. رنگ پس‌زمینه پوستر (مشکی-طلایی سلطنتی یا سفید مرمرین روشن):'
                : '2. Poster Color Theme (Royal Dark Gold or Clean Ivory White):'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPosterTheme('ROYAL_DARK')}
                className={`p-3.5 rounded-xl border font-semibold text-sm cursor-pointer ${
                  posterTheme === 'ROYAL_DARK'
                    ? 'border-amber-500 bg-slate-950 text-amber-400 ring-2 ring-amber-500/30'
                    : 'border-slate-500/30 opacity-75'
                }`}
              >
                {lang === 'fa' ? '🌙 مشکی-طلایی سلطنتی' : '🌙 Royal Black & 24K Gold'}
              </button>

              <button
                onClick={() => setPosterTheme('CLEAN_WHITE')}
                className={`p-3.5 rounded-xl border font-semibold text-sm cursor-pointer ${
                  posterTheme === 'CLEAN_WHITE'
                    ? 'border-amber-500 bg-white text-slate-900 ring-2 ring-amber-500/30'
                    : 'border-slate-500/30 opacity-75'
                }`}
              >
                {lang === 'fa' ? '☀️ سفید روشن و طلایی' : '☀️ Clean White & Gold'}
              </button>
            </div>
          </div>

          {posterMode === 'PRODUCT' && (
            <div className="space-y-4 pt-2 border-t border-amber-500/20">
              <div>
                <label className="block text-sm font-bold mb-1.5">
                  {lang === 'fa' ? 'انتخاب محصول جهت درج در پوستر:' : 'Select Product for Story:'}
                </label>
                <select
                  value={activeProductId}
                  onChange={(e) => setActiveProductId(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border font-semibold text-base ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {lang === 'fa'
                        ? `${p.nameFa} (${p.weightGrams} گرم)`
                        : `${p.nameEn} (${p.weightGrams}g)`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <span className="text-sm font-semibold">
                  {lang === 'fa'
                    ? 'نمایش قیمت عمده بنکداری (طلا به طلا) روی پوستر:'
                    : 'Display B2B Wholesale Settlement on Poster:'}
                </span>
                <input
                  type="checkbox"
                  checked={showWholesaleOnPoster}
                  onChange={(e) => setShowWholesaleOnPoster(e.target.checked)}
                  className="w-5 h-5 accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          <div
            className={`p-4 rounded-2xl border text-sm leading-relaxed ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-600'
                : 'bg-slate-950/80 border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-amber-500 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>
                {lang === 'fa' ? 'مزیت رقابتی استوری‌ساز طلایار:' : 'Why Jewelers Love This:'}
              </span>
            </div>
            {lang === 'fa'
              ? 'بدون نیاز به فتوشاپ یا اینشات! با هر تغییر نرخ طلا در تابلو، قیمت درج‌شده روی پوسترهای معرفی محصول و تابلوی روز به صورت خودکار بروزرسانی شده و با کیفیت ۱۰۸۰×۱۹۲۰ آماده انتشار در استوری اینستاگرام و وضعیت واتساپ است.'
              : 'Zero Photoshop needed! Whenever gold spot rates move, your 1080×1920 product and rate board stories automatically recalculate and export in crisp HD PNG.'}
          </div>
        </div>

        {/* Live HTML5 Canvas Preview Column */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full max-w-[360px] rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-2xl bg-slate-950">
            <canvas
              ref={canvasRef}
              className="w-full h-auto block"
              aria-label="1080x1920 HD Story Canvas Preview"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
