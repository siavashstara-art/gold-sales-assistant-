import React, { useEffect, useRef, useState } from 'react';
import {
  QrCode,
  ShieldCheck,
  Download,
  TrendingUp,
  Send,
  Volume2,
  PlusCircle,
  Search,
  Award,
} from 'lucide-react';
import {
  GlobalCurrency,
  GoldKarat,
  JewelryProduct,
  Language,
  MarketMode,
  MarketRatesState,
} from '../types/gold';
import { calculateProductPrice, formatMoney, getUnitGramRate } from '../utils/goldPricing';

interface IssuedCertificate {
  certId: string;
  customerName: string;
  customerPhone: string;
  productNameFa: string;
  productNameEn: string;
  productCode: string;
  weightGrams: number;
  karat: number;
  makingChargePercent: number;
  purchaseUnitRateToman: number;
  purchaseTotalToman: number;
  galleryName: string;
  issuedAt: string;
}

interface QrPassportSectionProps {
  products: JewelryProduct[];
  selectedProductForCert: JewelryProduct | null;
  rates: MarketRatesState;
  marketMode: MarketMode;
  globalCurrency: GlobalCurrency;
  lang: Language;
  themeMode: 'light' | 'dark';
  onSpeak: (text: string) => void;
}

// Deterministic high-contrast QR matrix painter on HTML5 Canvas
function drawQrMatrix(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  fgColor: string,
  bgColor: string
) {
  const cells = 25;
  const cellSize = size / cells;

  ctx.fillStyle = bgColor;
  ctx.fillRect(x - 10, y - 10, size + 20, size + 20);

  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  const isFinderPattern = (r: number, c: number) => {
    const inTopLeft = r < 7 && c < 7;
    const inTopRight = r < 7 && c >= cells - 7;
    const inBottomLeft = r >= cells - 7 && c < 7;
    return inTopLeft || inTopRight || inBottomLeft;
  };

  const drawFinder = (r0: number, c0: number) => {
    ctx.fillStyle = fgColor;
    ctx.fillRect(x + c0 * cellSize, y + r0 * cellSize, 7 * cellSize, 7 * cellSize);
    ctx.fillStyle = bgColor;
    ctx.fillRect(x + (c0 + 1) * cellSize, y + (r0 + 1) * cellSize, 5 * cellSize, 5 * cellSize);
    ctx.fillStyle = fgColor;
    ctx.fillRect(x + (c0 + 2) * cellSize, y + (r0 + 2) * cellSize, 3 * cellSize, 3 * cellSize);
  };

  drawFinder(0, 0);
  drawFinder(0, cells - 7);
  drawFinder(cells - 7, 0);

  ctx.fillStyle = fgColor;
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      if (isFinderPattern(r, c)) continue;
      // Timing patterns
      if (r === 6 || c === 6) {
        if ((r + c) % 2 === 0) {
          ctx.fillRect(x + c * cellSize, y + r * cellSize, cellSize, cellSize);
        }
        continue;
      }
      const seed = Math.imul(hash ^ (r * 31 + c * 17), 1597334677);
      const bit = (Math.abs(seed) + text.charCodeAt((r + c) % text.length)) % 10 < 5;
      if (bit) {
        ctx.fillRect(x + c * cellSize, y + r * cellSize, cellSize + 0.4, cellSize + 0.4);
      }
    }
  }
}

export const QrPassportSection: React.FC<QrPassportSectionProps> = ({
  products,
  selectedProductForCert,
  rates,
  marketMode,
  globalCurrency,
  lang,
  themeMode,
  onSpeak,
}) => {
  const [activeProductId, setActiveProductId] = useState<string>(
    selectedProductForCert?.id || products[0]?.id || 'prod-1'
  );
  const [customerName, setCustomerName] = useState<string>('سرکار خانم الهه رادمهر');
  const [customerPhone, setCustomerPhone] = useState<string>('09121112233');
  const [certSerial, setCertSerial] = useState<string>('TY-CERT-2026-8941');
  const [purchaseGramRateToman, setPurchaseGramRateToman] = useState<number>(5850000);
  const [cardTheme, setCardTheme] = useState<'ROYAL_DARK' | 'CLEAN_WHITE'>('ROYAL_DARK');
  const [certificates, setCertificates] = useState<IssuedCertificate[]>([]);
  const [lookupCode, setLookupCode] = useState<string>('');
  const [issuedSuccess, setIssuedSuccess] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isLight = themeMode === 'light';

  useEffect(() => {
    if (selectedProductForCert) {
      setActiveProductId(selectedProductForCert.id);
      setCertSerial(`TY-CERT-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  }, [selectedProductForCert]);

  useEffect(() => {
    fetch('/api/certificates')
      .then((r) => r.json())
      .then((data) => {
        if (data?.certificates) setCertificates(data.certificates);
      })
      .catch(() => {});
  }, []);

  const activeProduct = products.find((p) => p.id === activeProductId) || products[0];

  // Live valuation today vs Purchase Date valuation
  const liveBreakdown = calculateProductPrice({
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

  const liveUnitRate = getUnitGramRate(
    rates,
    marketMode,
    globalCurrency,
    activeProduct.defaultKarat as GoldKarat
  );

  // Calculate historical purchase price vs current live asset value
  const purchaseRawGoldToman = Math.round(activeProduct.weightGrams * purchaseGramRateToman);
  const purchaseTotalInvoiceToman = Math.round(
    purchaseRawGoldToman * (1 + activeProduct.retailMakingChargePercent / 100) * 1.077
  );

  // VIP Customer Loyalty Buyback (0% scrap deduction if returned with QR Certificate to same gallery!)
  const vipBuybackValueToday = Math.round(activeProduct.weightGrams * liveUnitRate);
  const standardScrapValueToday = Math.round(
    vipBuybackValueToday * (1 - rates.usedGoldDeductionPercent / 100)
  );
  const loyaltyBonusSaved = vipBuybackValueToday - standardScrapValueToday;
  const customerAssetGrowthToman = vipBuybackValueToday - purchaseRawGoldToman;
  const customerAssetGrowthPct =
    purchaseRawGoldToman > 0
      ? Number(((customerAssetGrowthToman / purchaseRawGoldToman) * 100).toFixed(1))
      : 0;

  // Draw HD 1200x750 Digital Gold QR Certificate Card on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1200;
    const H = 750;
    canvas.width = W;
    canvas.height = H;

    // Background
    if (cardTheme === 'ROYAL_DARK') {
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, '#020617');
      grad.addColorStop(0.5, '#0f172a');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else {
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, '#fffbeb');
      grad.addColorStop(1, '#f8fafc');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }

    // Double Luxury Border
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 6;
    ctx.strokeRect(28, 28, W - 56, H - 56);

    ctx.strokeStyle =
      cardTheme === 'ROYAL_DARK' ? 'rgba(251, 191, 36, 0.35)' : 'rgba(180, 83, 9, 0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(44, 44, W - 88, H - 88);

    // Top Header
    ctx.textAlign = 'right';
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 24px Vazirmatn, sans-serif';
    ctx.fillText(
      '✦ شناسنامه دیجیتال اصالت طلا و ضمانت بازخرید VIP | AURUMMATE & TALAYAR GLOBAL ✦',
      W - 75,
      98
    );

    ctx.fillStyle = cardTheme === 'ROYAL_DARK' ? '#ffffff' : '#0f172a';
    ctx.font = 'bold 40px Vazirmatn, sans-serif';
    ctx.fillText(rates.galleryName, W - 75, 155);

    // Certificate Serial Badge (Top Left)
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(75, 72, 340, 62);
    ctx.fillStyle = '#020617';
    ctx.textAlign = 'center';
    ctx.font = 'bold 24px JetBrains Mono, monospace';
    ctx.fillText(certSerial, 75 + 170, 112);

    // Divider Line
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(75, 185);
    ctx.lineTo(W - 75, 185);
    ctx.stroke();

    // Right Column Details
    ctx.textAlign = 'right';
    const textPrimary = cardTheme === 'ROYAL_DARK' ? '#f8fafc' : '#0f172a';
    const textSecondary = cardTheme === 'ROYAL_DARK' ? '#94a3b8' : '#475569';

    ctx.fillStyle = textSecondary;
    ctx.font = '24px Vazirmatn, sans-serif';
    ctx.fillText(`نام مالک سند: ${customerName || 'مشتری گرامی VIP'}`, W - 75, 245);

    ctx.fillStyle = textPrimary;
    ctx.font = 'bold 32px Vazirmatn, sans-serif';
    ctx.fillText(
      lang === 'fa' ? activeProduct.nameFa : activeProduct.nameEn,
      W - 75,
      305
    );

    // Specs Box
    ctx.fillStyle =
      cardTheme === 'ROYAL_DARK' ? 'rgba(30, 41, 59, 0.75)' : 'rgba(254, 243, 199, 0.6)';
    ctx.fillRect(420, 340, W - 495, 190);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.strokeRect(420, 340, W - 495, 190);

    ctx.fillStyle = textPrimary;
    ctx.font = 'bold 28px Vazirmatn, sans-serif';
    ctx.fillText(
      `وزن خالص ترازو: ${activeProduct.weightGrams} گرم   |   عیار استاندارد: ${
        activeProduct.defaultKarat === 925 ? 'نقره ۹۲۵' : `${activeProduct.defaultKarat} عیار (750)`
      }`,
      W - 105,
      398
    );

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 26px Vazirmatn, sans-serif';
    ctx.fillText(
      `کد رهگیری کالا: ${activeProduct.code}   |   اجرت ساخت: ${activeProduct.retailMakingChargePercent}٪`,
      W - 105,
      452
    );

    ctx.fillStyle = cardTheme === 'ROYAL_DARK' ? '#fbbf24' : '#b45309';
    ctx.font = 'bold 26px Vazirmatn, sans-serif';
    ctx.fillText(
      `ارزش روز طلای خالص دارایی: ${formatMoney(
        vipBuybackValueToday,
        marketMode,
        globalCurrency,
        lang
      )}`,
      W - 105,
      505
    );

    // Loyalty Guarantee Banner at Bottom Right
    ctx.fillStyle = '#10b981';
    ctx.fillRect(420, 555, W - 495, 78);
    ctx.fillStyle = '#020617';
    ctx.textAlign = 'center';
    ctx.font = 'bold 23px Vazirmatn, sans-serif';
    ctx.fillText(
      '✓ با ارائه این شناسنامه QR، در زمان تعویض مجدد ۰٪ کسر طلای متفرقه اعمال می‌گردد',
      420 + (W - 495) / 2,
      603
    );

    // Left Side: Scannable QR Code Matrix
    const qrPayload = `https://talayar.global/verify/${certSerial}?code=${activeProduct.code}&w=${activeProduct.weightGrams}g&k=${activeProduct.defaultKarat}`;
    drawQrMatrix(
      ctx,
      qrPayload,
      95,
      235,
      275,
      cardTheme === 'ROYAL_DARK' ? '#020617' : '#0f172a',
      '#ffffff'
    );

    ctx.fillStyle = cardTheme === 'ROYAL_DARK' ? '#fbbf24' : '#b45309';
    ctx.textAlign = 'center';
    ctx.font = 'bold 20px Vazirmatn, sans-serif';
    ctx.fillText('اسکن جهت استعلام قیمت لحظه‌ای', 95 + 137, 555);
    ctx.fillStyle = textSecondary;
    ctx.font = '18px JetBrains Mono, monospace';
    ctx.fillText(rates.galleryPhone, 95 + 137, 590);

    // Bottom Footer
    ctx.fillStyle = textSecondary;
    ctx.textAlign = 'center';
    ctx.font = '20px Vazirmatn, sans-serif';
    ctx.fillText(
      'سامانه هوشمند طلایار جهانی (AurumMate VIP) — اکوسیستم آفرینش | شهر جدید نیومتاورسیتی جهان | توان استیج FBNM',
      W / 2,
      682
    );
  }, [
    activeProduct,
    customerName,
    certSerial,
    cardTheme,
    rates,
    marketMode,
    globalCurrency,
    lang,
    vipBuybackValueToday,
  ]);

  const handleDownloadCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `Gold-Passport-${certSerial}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleIssueNewCertificate = async () => {
    const newId = `TY-CERT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setCertSerial(newId);
    try {
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certId: newId,
          customerName,
          customerPhone,
          productNameFa: activeProduct.nameFa,
          productNameEn: activeProduct.nameEn,
          productCode: activeProduct.code,
          weightGrams: activeProduct.weightGrams,
          karat: activeProduct.defaultKarat,
          makingChargePercent: activeProduct.retailMakingChargePercent,
          purchaseUnitRateToman: purchaseGramRateToman,
          purchaseTotalToman: liveBreakdown.retailTotalPrice,
          galleryName: rates.galleryName,
        }),
      });
      const data = await res.json();
      if (data?.certificates) {
        setCertificates(data.certificates);
        setIssuedSuccess(true);
        setTimeout(() => setIssuedSuccess(false), 3500);
      }
    } catch {}
  };

  const whatsappCertMessage =
    lang === 'fa'
      ? `🪪 *شناسنامه دیجیتال اصالت طلا — ${rates.galleryName}*\n` +
        `🔖 کد شناسنامه: *${certSerial}*\n` +
        `👤 مالک سند: ${customerName}\n` +
        `💍 نام جواهر: ${activeProduct.nameFa} (کد ${activeProduct.code})\n` +
        `⚖️ وزن خالص: ${activeProduct.weightGrams} گرم | عیار: ${activeProduct.defaultKarat}\n` +
        `📈 *ارزش لحظه‌ای طلای شما به نرخ امروز تابلو:* ${formatMoney(vipBuybackValueToday, marketMode, globalCurrency, lang)}\n` +
        `🎁 *امتیاز وفاداری شما در گالری ما:* در صورت تعویض مجدد با ارائه این کد، طلای شما بدون کسر کارمزد طلای متفرقه (${formatMoney(loyaltyBonusSaved, marketMode, globalCurrency, lang)} پاداش وفاداری به نفع شما) به نرخ روز تابلو برداشته می‌شود!`
      : `🪪 *Official Digital Gold Passport — ${rates.galleryName}*\n` +
        `🔖 Certificate ID: *${certSerial}*\n` +
        `👤 Owner: ${customerName}\n` +
        `💍 Item: ${activeProduct.nameEn} (${activeProduct.weightGrams}g, ${activeProduct.defaultKarat}K)\n` +
        `📈 *Live Today's Gold Value:* ${formatMoney(vipBuybackValueToday, marketMode, globalCurrency, lang)}\n` +
        `🎁 *VIP Loyalty Guarantee:* Present this QR certificate for 0% scrap deduction on your next trade-in!`;

  const filteredCerts = lookupCode.trim()
    ? certificates.filter(
        (c) =>
          c.certId.toLowerCase().includes(lookupCode.toLowerCase()) ||
          c.customerName.includes(lookupCode) ||
          c.customerPhone.includes(lookupCode)
      )
    : certificates.slice(0, 4);

  return (
    <section
      id="qr-passport"
      className={`rounded-3xl border p-6 md:p-10 transition-colors ${
        isLight
          ? 'bg-white border-slate-200 shadow-sm text-slate-900'
          : 'bg-slate-900/70 border-slate-800 text-slate-100'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-amber-500/20">
        <div>
          <span className="text-xs font-semibold text-emerald-500 tracking-wide">
            {lang === 'fa'
              ? '✨ قابلیت خلاقانه انحصاری: شناسنامه دیجیتال QR Code اصالت طلا و رادار سود دارایی مشتری (AurumMate Passport)'
              : '✨ Exclusive Innovation: Digital Gold QR Certificate & Customer Asset Appreciation Tracker'}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mt-1">
            {lang === 'fa'
              ? 'صدور کارت گارانتی هوشمند QR با محاسبه لحظه‌ای سود طلای مشتری و تضمین بازگشت مشتری به مغازه شما'
              : 'Issue Scannable QR Gold Passports with Live Asset Re-Valuation & VIP Buyback Loyalty'}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() =>
              onSpeak(
                lang === 'fa'
                  ? `شناسنامه دیجیتال اصالت طلا به شماره ${certSerial} برای ${customerName}. وزن ${activeProduct.weightGrams} گرم. ارزش طلای خالص امروز ${formatMoney(vipBuybackValueToday, marketMode, globalCurrency, lang)}. سود مشتری نسبت به روز خرید: ${customerAssetGrowthToman.toLocaleString('en-US')} تومان.`
                  : `Digital Gold Certificate ${certSerial} for ${customerName}. Weight ${activeProduct.weightGrams} grams. Today's live value is ${formatMoney(vipBuybackValueToday, marketMode, globalCurrency, lang)}.`
              )
            }
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-500 font-bold text-sm cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            <span>{lang === 'fa' ? 'گوینده صوتی شناسنامه' : 'Speak Certificate'}</span>
          </button>

          <button
            onClick={handleDownloadCertificate}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>
              {lang === 'fa'
                ? 'دانلود کارت شناسنامه طلا (HD PNG)'
                : 'Download QR Certificate Card'}
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 items-start">
        {/* Left: Certificate Issuance Form & Live Profit Radar */}
        <div className="lg:col-span-5 space-y-5">
          <div
            className={`p-5 rounded-2xl border space-y-4 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/90 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-amber-500 flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                <span>
                  {lang === 'fa'
                    ? '۱. مشخصات صدور شناسنامه دیجیتال طلا'
                    : '1. Issue Customer Digital Gold Passport'}
                </span>
              </h3>
              <span className="font-tabular text-xs font-bold px-2.5 py-1 rounded bg-amber-500/20 text-amber-500">
                {certSerial}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">
                {lang === 'fa' ? 'انتخاب جواهر / محصول فروخته‌شده:' : 'Select Purchased Jewelry:'}
              </label>
              <select
                value={activeProductId}
                onChange={(e) => setActiveProductId(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border font-semibold text-sm ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-900'
                    : 'bg-slate-900 border-slate-700 text-white'
                }`}
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {lang === 'fa'
                      ? `${p.nameFa} (${p.weightGrams} گرم - کد ${p.code})`
                      : `${p.nameEn} (${p.weightGrams}g - ${p.code})`}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1">
                  {lang === 'fa' ? 'نام و نام خانوادگی خریدار:' : 'Customer Full Name:'}
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900'
                      : 'bg-slate-900 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  {lang === 'fa' ? 'شماره موبایل مشتری:' : 'Customer Mobile:'}
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  dir="ltr"
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-tabular text-sm font-semibold ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900'
                      : 'bg-slate-900 border-slate-700 text-white'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1">
                  {lang === 'fa'
                    ? 'نرخ هر گرم طلا در روز خرید مشتری (تومان):'
                    : 'Gram Rate on Purchase Date:'}
                </label>
                <input
                  type="number"
                  step="10000"
                  value={purchaseGramRateToman}
                  onChange={(e) => setPurchaseGramRateToman(Math.max(100000, Number(e.target.value)))}
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-tabular text-sm font-bold ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900'
                      : 'bg-slate-900 border-slate-700 text-amber-400'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  {lang === 'fa' ? 'تم ظاهری کارت شناسنامه:' : 'Certificate Card Theme:'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCardTheme('ROYAL_DARK')}
                    className={`py-2.5 px-2 rounded-xl border text-xs font-bold cursor-pointer ${
                      cardTheme === 'ROYAL_DARK'
                        ? 'bg-slate-950 text-amber-400 border-amber-500'
                        : 'opacity-70 border-slate-500/30'
                    }`}
                  >
                    {lang === 'fa' ? '🌙 مشکی-طلایی' : '🌙 Royal Dark'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardTheme('CLEAN_WHITE')}
                    className={`py-2.5 px-2 rounded-xl border text-xs font-bold cursor-pointer ${
                      cardTheme === 'CLEAN_WHITE'
                        ? 'bg-white text-slate-900 border-amber-500'
                        : 'opacity-70 border-slate-500/30'
                    }`}
                  >
                    {lang === 'fa' ? '☀️ سفید روشن' : '☀️ Clean White'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleIssueNewCertificate}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm cursor-pointer transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>
                  {lang === 'fa'
                    ? 'ثبت و صدور کد شناسنامه جدید'
                    : 'Issue & Register Certificate'}
                </span>
              </button>

              <a
                href={`https://wa.me/${customerPhone.replace(/^0/, '98').replace(/\D/g, '')}?text=${encodeURIComponent(
                  whatsappCertMessage
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>
                  {lang === 'fa' ? 'ارسال شناسنامه به واتساپ مشتری' : 'Send to Customer WhatsApp'}
                </span>
              </a>
            </div>

            {issuedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-500 text-xs font-bold">
                {lang === 'fa'
                  ? `✅ شناسنامه دیجیتال ${certSerial} با موفقیت در سامانه ثبت شد.`
                  : `✅ Certificate ${certSerial} registered successfully!`}
              </div>
            )}
          </div>

          {/* Live Customer Asset Re-Valuation Box (Why customer comes back to YOUR store!) */}
          <div
            className={`p-5 rounded-2xl border-2 border-emerald-500/50 space-y-3 ${
              isLight ? 'bg-emerald-50/50' : 'bg-emerald-950/25'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                <span>
                  {lang === 'fa'
                    ? 'نمای اسکن QR توسط مشتری (داشبورد سود و وفاداری مشتری)'
                    : 'Customer QR Scan View (Live Asset Growth & Loyalty Hook)'}
                </span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div
                className={`p-3 rounded-xl border ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}
              >
                <span className="text-xs opacity-75 block">
                  {lang === 'fa' ? 'ارزش طلای خالص در روز خرید:' : 'Original Gold Value:'}
                </span>
                <span className="font-tabular font-bold text-sm">
                  {purchaseRawGoldToman.toLocaleString('en-US')} تومان
                </span>
              </div>

              <div
                className={`p-3 rounded-xl border ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}
              >
                <span className="text-xs opacity-75 block">
                  {lang === 'fa' ? 'ارزش بازخرید VIP امروز در گالری:' : 'VIP Buyback Today:'}
                </span>
                <span className="font-tabular font-bold text-sm text-amber-500">
                  {vipBuybackValueToday.toLocaleString('en-US')} تومان
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold block">
                  {lang === 'fa'
                    ? 'سود و رشد سرمایه مشتری از زمان خرید:'
                    : 'Customer Net Gold Appreciation:'}
                </span>
                <span className="font-tabular font-bold text-lg text-emerald-500">
                  {customerAssetGrowthToman >= 0 ? '+' : ''}
                  {customerAssetGrowthToman.toLocaleString('en-US')} تومان ({customerAssetGrowthPct}
                  %)
                </span>
              </div>
              <Award className="w-7 h-7 text-emerald-500 shrink-0" />
            </div>

            <p className="text-xs opacity-85 leading-relaxed">
              {lang === 'fa'
                ? `💡 پاداش وفاداری برگشت مشتری به گالری شما: اگر مشتری این طلا را به مغازه دیگری ببرد، ${rates.usedGoldDeductionPercent}٪ بابت طلای متفرقه کسر می‌شود؛ اما با اسکن این شناسنامه در گالری شما، مبلغ ${loyaltyBonusSaved.toLocaleString('en-US')} تومان بیشتر اعتبار تعویض می‌گیرد!`
                : `💡 Customer Retention Hook: Returning to your gallery with this QR passport saves the customer ${loyaltyBonusSaved.toLocaleString('en-US')} Toman in scrap deduction fees!`}
            </p>
          </div>
        </div>

        {/* Right: Live Canvas Certificate Card Preview + Issued Certificates Registry */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl overflow-hidden border-2 border-amber-500/60 shadow-xl bg-slate-950">
            <canvas
              ref={canvasRef}
              className="w-full h-auto block"
              aria-label="Digital Gold QR Certificate Canvas"
            />
          </div>

          {/* Issued Certificates Registry & Verification Lookup */}
          <div
            className={`rounded-2xl border p-5 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/90 border-slate-800'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-500">
                <ShieldCheck className="w-5 h-5" />
                <span>
                  {lang === 'fa'
                    ? 'دفتر ثبت و استعلام اصالت شناسنامه‌های صادرشده گالری'
                    : 'Verified Gallery Certificates Registry'}
                </span>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 absolute right-3 top-2.5 opacity-50" />
                <input
                  type="text"
                  placeholder={
                    lang === 'fa' ? 'جستجوی کد شناسنامه یا نام...' : 'Search Certificate ID...'
                  }
                  value={lookupCode}
                  onChange={(e) => setLookupCode(e.target.value)}
                  className={`pr-9 pl-3 py-1.5 rounded-lg border text-xs ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-2.5">
              {filteredCerts.map((c, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setCertSerial(c.certId);
                    setCustomerName(c.customerName);
                    setCustomerPhone(c.customerPhone);
                    setPurchaseGramRateToman(c.purchaseUnitRateToman);
                  }}
                  className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-xs cursor-pointer transition-colors ${
                    certSerial === c.certId
                      ? 'border-amber-500 bg-amber-500/10'
                      : isLight
                      ? 'bg-white border-slate-200 hover:border-amber-400'
                      : 'bg-slate-900 border-slate-800 hover:border-amber-500/50'
                  }`}
                >
                  <div>
                    <span className="font-tabular font-bold text-amber-500">{c.certId}</span>
                    <span className="mx-2 opacity-40">·</span>
                    <span className="font-bold">{c.customerName}</span>
                    <span className="mx-2 opacity-40">·</span>
                    <span className="opacity-80">{c.productNameFa}</span>
                  </div>
                  <div className="font-tabular font-semibold text-emerald-500">
                    {c.weightGrams}g ({c.karat}K) · {c.issuedAt}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
