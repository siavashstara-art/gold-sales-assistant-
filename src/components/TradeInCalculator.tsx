import React, { useState } from 'react';
import { Scale, ArrowLeftRight, Send, Copy, Check, Volume2 } from 'lucide-react';
import {
  GlobalCurrency,
  GoldKarat,
  JewelryProduct,
  Language,
  MarketMode,
  MarketRatesState,
} from '../types/gold';
import { calculateProductPrice, formatMoney, getUnitGramRate } from '../utils/goldPricing';

interface TradeInCalculatorProps {
  products: JewelryProduct[];
  rates: MarketRatesState;
  marketMode: MarketMode;
  globalCurrency: GlobalCurrency;
  lang: Language;
  themeMode: 'light' | 'dark';
  onSpeak: (text: string) => void;
}

export const TradeInCalculator: React.FC<TradeInCalculatorProps> = ({
  products,
  rates,
  marketMode,
  globalCurrency,
  lang,
  themeMode,
  onSpeak,
}) => {
  const [oldWeightGrams, setOldWeightGrams] = useState<number>(14.25);
  const [stoneDeductionGrams, setStoneDeductionGrams] = useState<number>(0.35);
  const [oldAssayPurity, setOldAssayPurity] = useState<number>(750); // 750 standard, or 740/735/875
  const [selectedNewProductId, setSelectedNewProductId] = useState<string>(products[0]?.id || 'prod-1');
  const [customNewWeight, setCustomNewWeight] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState<string>('');
  const [copiedReceipt, setCopiedReceipt] = useState(false);

  const isLight = themeMode === 'light';

  const selectedProduct = products.find((p) => p.id === selectedNewProductId) || products[0];
  const newWeight = customNewWeight !== null ? customNewWeight : selectedProduct.weightGrams;

  // 1. Calculate Used/Scrap Gold Value (طلای کهنه / شکسته مشتری)
  const netOldGoldWeight = Math.max(0, Number((oldWeightGrams - stoneDeductionGrams).toFixed(3)));
  // Convert to 750 equivalent weight:
  const standardized750Weight = Number(((netOldGoldWeight * oldAssayPurity) / 750).toFixed(3));
  const base18kRate = getUnitGramRate(rates, marketMode, globalCurrency, 18);
  const buybackUnitRate =
    marketMode === 'IR'
      ? Math.round(base18kRate * (1 - rates.usedGoldDeductionPercent / 100))
      : Number((base18kRate * (1 - rates.usedGoldDeductionPercent / 100)).toFixed(2));
  const totalOldGoldCredit =
    marketMode === 'IR'
      ? Math.round((standardized750Weight * buybackUnitRate) / 1000) * 1000
      : Number((standardized750Weight * buybackUnitRate).toFixed(2));

  // 2. Calculate New Gold Product Price (سرویس طلای نو انتخابی)
  const newPriceBreakdown = calculateProductPrice({
    weightGrams: newWeight,
    karat: selectedProduct.defaultKarat as GoldKarat,
    retailMakingChargePercent: selectedProduct.retailMakingChargePercent,
    wholesaleMakingChargePercent: selectedProduct.wholesaleMakingChargePercent,
    profitPercent: rates.defaultProfitPercent,
    taxPercent: rates.defaultTaxPercent,
    rates,
    marketMode,
    globalCurrency,
  });

  // 3. Calculate Net Payable Difference (مابه‌التفاوت قابل پرداخت)
  const netDifference = newPriceBreakdown.retailTotalPrice - totalOldGoldCredit;
  const customerMustPay = netDifference >= 0;

  const receiptText =
    lang === 'fa'
      ? `🧾 *فاکتور رسمی تعویض طلای کهنه با نو — ${rates.galleryName}*\n` +
        (customerName ? `👤 نام مشتری: ${customerName}\n` : '') +
        `────────────────────\n` +
        `♻️ *مشخصات طلای کهنه/شکسته تحویلی مشتری:*\n` +
        `• وزن ترازو: ${oldWeightGrams} گرم (کسر نگین/فنر: ${stoneDeductionGrams} گرم)\n` +
        `• وزن خالص: ${netOldGoldWeight} گرم با عیار ${oldAssayPurity}\n` +
        `• وزن معادل عیار ۷۵۰: ${standardized750Weight} گرم\n` +
        `• نرخ خرید هر گرم طلای کهنه: ${formatMoney(buybackUnitRate, marketMode, globalCurrency, lang)}\n` +
        `✅ *بستانکاری کل طلای کهنه:* ${formatMoney(totalOldGoldCredit, marketMode, globalCurrency, lang)}\n` +
        `────────────────────\n` +
        `✨ *مشخصات طلای نو انتخابی:*\n` +
        `• نام کالا: ${selectedProduct.nameFa} (کد ${selectedProduct.code})\n` +
        `• وزن خالص: ${newWeight} گرم | عیار: ${selectedProduct.defaultKarat} | اجرت: ${selectedProduct.retailMakingChargePercent}٪\n` +
        `💎 *مبلغ کل طلای نو (با سود و مالیات قانونی):* ${formatMoney(newPriceBreakdown.retailTotalPrice, marketMode, globalCurrency, lang)}\n` +
        `────────────────────\n` +
        `💰 *${customerMustPay ? 'مابه‌التفاوت قابل پرداخت توسط مشتری' : 'مبلغ بستانکاری مشتری از گالری'}:*\n` +
        `👈 *${formatMoney(Math.abs(netDifference), marketMode, globalCurrency, lang)}*\n` +
        `📞 تلفن گالری: ${rates.galleryPhone}`
      : `🧾 *Official Gold Trade-In Invoice — ${rates.galleryName}*\n` +
        (customerName ? `👤 Customer: ${customerName}\n` : '') +
        `• Scrap Gold Net Weight (750 eq.): ${standardized750Weight}g\n` +
        `• Old Gold Total Credit: ${formatMoney(totalOldGoldCredit, marketMode, globalCurrency, lang)}\n` +
        `• Selected New Item: ${selectedProduct.nameEn} (${newWeight}g, ${selectedProduct.defaultKarat}K)\n` +
        `• New Item Total Price: ${formatMoney(newPriceBreakdown.retailTotalPrice, marketMode, globalCurrency, lang)}\n` +
        `👉 *${customerMustPay ? 'Net Balance Payable by Customer' : 'Credit Payable to Customer'}:* ${formatMoney(Math.abs(netDifference), marketMode, globalCurrency, lang)}`;

  const handleCopyReceipt = async () => {
    await navigator.clipboard.writeText(receiptText);
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2500);
  };

  const whatsappUrl = `https://wa.me/${rates.galleryPhone.replace(/^0/, '98').replace(/\D/g, '')}?text=${encodeURIComponent(receiptText)}`;

  return (
    <section
      id="trade-in"
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
              ? '۰۲. ماشین‌حساب هوشمند تعویض طلای کهنه / شکسته با طلای نو'
              : '02. Smart Gold Trade-In & Scrap Exchange Calculator'}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mt-1">
            {lang === 'fa'
              ? 'محاسبه آنی طلای کارکرده مشتری و کسر خودکار از سرویس طلای جدید'
              : 'Instant Scrap Gold Valuation & Automated New Jewelry Offset'}
          </h2>
        </div>

        <button
          onClick={() =>
            onSpeak(
              lang === 'fa'
                ? `ارزش طلای کهنه مشتری: ${formatMoney(totalOldGoldCredit, marketMode, globalCurrency, lang)}. قیمت طلای نو: ${formatMoney(newPriceBreakdown.retailTotalPrice, marketMode, globalCurrency, lang)}. مابه‌التفاوت قابل پرداخت: ${formatMoney(Math.abs(netDifference), marketMode, globalCurrency, lang)}.`
                : `Customer old gold credit is ${formatMoney(totalOldGoldCredit, marketMode, globalCurrency, lang)}. New jewelry price is ${formatMoney(newPriceBreakdown.retailTotalPrice, marketMode, globalCurrency, lang)}. Net payable difference is ${formatMoney(Math.abs(netDifference), marketMode, globalCurrency, lang)}.`
            )
          }
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-500 font-semibold text-sm hover:bg-amber-500/25 cursor-pointer"
        >
          <Volume2 className="w-4 h-4" />
          <span>{lang === 'fa' ? 'گوینده صوتی مابه‌التفاوت' : 'Speak Trade-In Summary'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        {/* Step 1: Customer Old / Broken Gold Inputs */}
        <div
          className={`lg:col-span-4 rounded-2xl border p-6 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2.5 text-lg font-bold mb-4 text-amber-500">
            <Scale className="w-5 h-5" />
            <h3>
              {lang === 'fa'
                ? '۱. مشخصات طلای کهنه / شکسته مشتری'
                : '1. Customer Used / Scrap Gold'}
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">
                {lang === 'fa' ? 'وزن ناخالص روی ترازو (گرم)' : 'Gross Scale Weight (Grams)'}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={oldWeightGrams}
                onChange={(e) => setOldWeightGrams(Math.max(0, Number(e.target.value)))}
                className={`w-full px-4 py-3 rounded-xl border font-tabular text-lg font-bold ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-900'
                    : 'bg-slate-900 border-slate-700 text-amber-400'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                {lang === 'fa'
                  ? 'کسر وزن نگین اتمی، فنر قفل و چسب (گرم)'
                  : 'Stone / Clasp Spring Deduction (Grams)'}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={stoneDeductionGrams}
                onChange={(e) => setStoneDeductionGrams(Math.max(0, Number(e.target.value)))}
                className={`w-full px-4 py-3 rounded-xl border font-tabular text-base font-semibold ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-900'
                    : 'bg-slate-900 border-slate-700 text-white'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                {lang === 'fa'
                  ? 'عیار طلای کهنه (ری‌گیری / حک استاندارد)'
                  : 'Assay Purity / Hallmark'}
              </label>
              <select
                value={oldAssayPurity}
                onChange={(e) => setOldAssayPurity(Number(e.target.value))}
                className={`w-full px-4 py-3 rounded-xl border font-tabular text-base font-semibold ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-900'
                    : 'bg-slate-900 border-slate-700 text-white'
                }`}
              >
                <option value={750}>
                  {lang === 'fa' ? 'عیار ۷۵۰ استاندارد ایران (18K)' : '750 Standard (18K)'}
                </option>
                <option value={740}>
                  {lang === 'fa' ? 'عیار ۷۴۰ کارگاهی / متفرقه' : '740 Non-Standard Assay'}
                </option>
                <option value={735}>
                  {lang === 'fa' ? 'عیار ۷۳۵ قدیمی / بدون کد' : '735 Vintage / Unmarked'}
                </option>
                <option value={875}>
                  {lang === 'fa' ? 'عیار ۸۷۵ عربی / کویتی (21K)' : '875 Arabic / Gulf (21K)'}
                </option>
                <option value={916}>
                  {lang === 'fa' ? 'عیار ۹۱۶ هندی / اماراتی (22K)' : '916 Indian / 22K'}
                </option>
                <option value={999.9}>
                  {lang === 'fa' ? 'عیار ۹۹۹.۹ شمش ۲۴ عیار' : '999.9 Pure 24K Bullion'}
                </option>
              </select>
            </div>

            <div className="pt-4 border-t border-amber-500/20 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="opacity-75">
                  {lang === 'fa' ? 'وزن خالص استاندارد (۷۵۰):' : 'Standardized 750 Weight:'}
                </span>
                <span className="font-tabular font-bold">{standardized750Weight} g</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-75">
                  {lang === 'fa'
                    ? `نرخ خرید هر گرم (کسر ${rates.usedGoldDeductionPercent}٪):`
                    : `Buyback Rate (-${rates.usedGoldDeductionPercent}%):`}
                </span>
                <span className="font-tabular font-bold">
                  {formatMoney(buybackUnitRate, marketMode, globalCurrency, lang)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 text-emerald-500 font-bold text-base">
                <span>{lang === 'fa' ? 'اعتبار کل طلای کهنه مشتری:' : 'Total Old Gold Credit:'}</span>
                <span className="font-tabular text-lg">
                  {formatMoney(totalOldGoldCredit, marketMode, globalCurrency, lang)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Select New Jewelry Item */}
        <div
          className={`lg:col-span-4 rounded-2xl border p-6 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2.5 text-lg font-bold mb-4 text-amber-500">
            <ArrowLeftRight className="w-5 h-5" />
            <h3>
              {lang === 'fa' ? '۲. انتخاب طلای نو از ویترین' : '2. Select New Showcase Jewelry'}
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">
                {lang === 'fa' ? 'انتخاب محصول جدید' : 'Choose Showcase Product'}
              </label>
              <select
                value={selectedNewProductId}
                onChange={(e) => {
                  setSelectedNewProductId(e.target.value);
                  setCustomNewWeight(null);
                }}
                className={`w-full px-4 py-3 rounded-xl border text-base font-semibold ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-900'
                    : 'bg-slate-900 border-slate-700 text-white'
                }`}
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {lang === 'fa'
                      ? `${p.nameFa} (${p.weightGrams} گرم - اجرت ${p.retailMakingChargePercent}٪)`
                      : `${p.nameEn} (${p.weightGrams}g - ${p.retailMakingChargePercent}% Making)`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                {lang === 'fa'
                  ? 'وزن طلای نو (امکان تغییر بر اساس سایز مشتری - گرم)'
                  : 'New Item Weight (Adjustable - Grams)'}
              </label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                value={newWeight}
                onChange={(e) => setCustomNewWeight(Math.max(0.1, Number(e.target.value)))}
                className={`w-full px-4 py-3 rounded-xl border font-tabular text-lg font-bold ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-900'
                    : 'bg-slate-900 border-slate-700 text-amber-400'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                {lang === 'fa' ? 'نام مشتری (اختیاری جهت درج در رسید)' : 'Customer Name (Optional)'}
              </label>
              <input
                type="text"
                placeholder={lang === 'fa' ? 'مثلاً: سرکار خانم محمدی' : 'e.g. Mrs. Al-Maktoum'}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border text-base ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-900'
                    : 'bg-slate-900 border-slate-700 text-white'
                }`}
              />
            </div>

            <div className="pt-4 border-t border-amber-500/20 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="opacity-75">
                  {lang === 'fa' ? 'قیمت طلای خام کالا:' : 'Raw Gold Value:'}
                </span>
                <span className="font-tabular font-semibold">
                  {formatMoney(newPriceBreakdown.rawGoldValue, marketMode, globalCurrency, lang)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-75">
                  {lang === 'fa'
                    ? `اجرت ساخت (${selectedProduct.retailMakingChargePercent}٪) + سود (${rates.defaultProfitPercent}٪):`
                    : `Making (${selectedProduct.retailMakingChargePercent}%) + Margin (${rates.defaultProfitPercent}%):`}
                </span>
                <span className="font-tabular font-semibold">
                  {formatMoney(
                    newPriceBreakdown.makingChargeAmount + newPriceBreakdown.sellerProfitAmount,
                    marketMode,
                    globalCurrency,
                    lang
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-75">
                  {lang === 'fa'
                    ? `مالیات بر اجرت و سود (${rates.defaultTaxPercent}٪):`
                    : `Tax on Making+Margin (${rates.defaultTaxPercent}%):`}
                </span>
                <span className="font-tabular font-semibold">
                  {formatMoney(newPriceBreakdown.taxAmount, marketMode, globalCurrency, lang)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 text-amber-500 font-bold text-base">
                <span>{lang === 'fa' ? 'قیمت نهایی سرویس طلای نو:' : 'New Jewelry Total:'}</span>
                <span className="font-tabular text-lg">
                  {formatMoney(newPriceBreakdown.retailTotalPrice, marketMode, globalCurrency, lang)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Final Settlement & WhatsApp Invoice */}
        <div
          className={`lg:col-span-4 rounded-2xl border-2 border-amber-500 p-6 flex flex-col justify-between ${
            isLight ? 'bg-amber-50/50' : 'bg-slate-950'
          }`}
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
              {lang === 'fa' ? '۳. خلاصه تسویه و مابه‌التفاوت نهایی' : '3. Final Trade-In Settlement'}
            </span>

            <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <div className="text-sm font-medium opacity-85">
                {customerMustPay
                  ? lang === 'fa'
                    ? 'مابه‌التفاوت قابل پرداخت توسط مشتری:'
                    : 'Net Balance Payable by Customer:'
                  : lang === 'fa'
                  ? 'مبلغ بستانکاری مشتری (پرداختی گالری به مشتری):'
                  : 'Net Credit Payable to Customer:'}
              </div>
              <div className="text-2xl md:text-3xl font-bold text-amber-500 font-tabular mt-1">
                {formatMoney(Math.abs(netDifference), marketMode, globalCurrency, lang)}
              </div>
              <div className="text-xs opacity-75 mt-2 font-tabular">
                {lang === 'fa'
                  ? `اختلاف وزن طلا به طلا: ${(newWeight - standardized750Weight).toFixed(2)} گرم`
                  : `Net Gold Weight Delta: ${(newWeight - standardized750Weight).toFixed(2)}g`}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold mb-1.5 opacity-75">
                {lang === 'fa' ? 'پیش‌نمایش متن رسید رسمی واتساپ:' : 'WhatsApp Official Receipt Preview:'}
              </label>
              <pre
                className={`text-xs p-3 rounded-xl border overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48 ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-700'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                {receiptText}
              </pre>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base transition-colors"
            >
              <Send className="w-5 h-5" />
              <span>
                {lang === 'fa'
                  ? 'ارسال مستقیم رسید به واتساپ طلافروش / مشتری'
                  : 'Send Official Receipt via WhatsApp'}
              </span>
            </a>

            <button
              onClick={handleCopyReceipt}
              className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl border font-semibold text-sm transition-colors cursor-pointer ${
                isLight
                  ? 'bg-white border-slate-300 hover:bg-slate-100 text-slate-800'
                  : 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200'
              }`}
            >
              {copiedReceipt ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-500">
                    {lang === 'fa' ? 'متن فاکتور کپی شد!' : 'Receipt Copied!'}
                  </span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{lang === 'fa' ? 'کپی متن فاکتور تعویض' : 'Copy Trade-In Receipt'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
