import React, { useState } from 'react';
import {
  Send,
  Crown,
  Users,
  CheckCircle2,
  Volume2,
  Lightbulb,
  ShieldAlert,
  TrendingUp,
  Briefcase,
  Coins,
  Copy,
  Check,
  Sparkles,
  FileText,
  Wand2,
  Share2,
} from 'lucide-react';
import { COMPETITOR_ANALYSIS, VIP_TIERS } from '../data/products';
import { Language, MarketMode, MarketRatesState } from '../types/gold';
import { isRtlLanguage } from '../utils/i18n';

interface AiVipClubSectionProps {
  rates: MarketRatesState;
  marketMode: MarketMode;
  lang: Language;
  themeMode: 'light' | 'dark';
  onSpeak: (text: string) => void;
  onUpdateRates?: (partial: Partial<MarketRatesState>) => void;
}

export const AiVipClubSection: React.FC<AiVipClubSectionProps> = ({
  rates,
  marketMode,
  lang,
  themeMode,
  onSpeak,
  onUpdateRates,
}) => {
  const isRtl = isRtlLanguage(lang);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState<
    Array<{ role: 'user' | 'assistant'; text: string; source?: string }>
  >([
    {
      role: 'assistant',
      text: isRtl
        ? `سلام! من دستیار هوشمند «طلایار جهانی | AurumMate VIP» هستم. بر اساس نرخ لحظه‌ای تابلو (گرم ۱۸ عیار: ${rates.gram18kToman.toLocaleString('en-US')} تومان | نقره ۹۲۵: ${rates.silver925GramToman.toLocaleString('en-US')} تومان | انس جهانی: $${rates.ounceUsd})، هر سوالی درباره تسهیلات برنامه در طلافروشی، صورت خرید برنامه، شخصی‌سازی اختصاصی یا پورسانت ۲۵٪ ویزیتورها دارید بپرسید.`
        : `Welcome! I am the TalaYar Global (AurumMate VIP) Smart Advisor. Ask me anything about how this app facilitates jewelry shop operations, purchase invoices, live White-Label personalization, or the 25% Visitor Sales Commission.`,
      source: 'system-ready',
    },
  ]);

  // Live Interactive Business Personalization Studio State (شخصی‌سازی زنده برای هر کسب‌وکار)
  const [customGalleryName, setCustomGalleryName] = useState(rates.galleryName);
  const [customGalleryPhone, setCustomGalleryPhone] = useState(rates.galleryPhone);
  const [customGalleryInsta, setCustomGalleryInsta] = useState(rates.galleryInstagram);
  const [customProfitPct, setCustomProfitPct] = useState(rates.defaultProfitPercent);
  const [liveRebrandApplied, setLiveRebrandApplied] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  // Official Purchase Invoice Generator State (صورت خرید رسمی برنامه)
  const [buyerGalleryName, setBuyerGalleryName] = useState('گالری طلا و جواهرات سلطنتی');
  const [buyerPlan, setBuyerPlan] = useState<'WHITE_LABEL' | 'TIER_4' | 'TIER_3' | 'TIER_2'>(
    'WHITE_LABEL'
  );
  const [copiedInvoice, setCopiedInvoice] = useState(false);

  // Visitor 25% Direct Sales Commission Calculator State (دعوت از ویزیتورها با پورسانت ۲۵٪)
  const [visitorMonthlySubSales, setVisitorMonthlySubSales] = useState<number>(12);
  const [selectedSubPriceToman, setSelectedSubPriceToman] = useState<number>(6500000);
  const [visitorWhiteLabelSales, setVisitorWhiteLabelSales] = useState<number>(4);
  const [visitorName, setVisitorName] = useState('ویزیتور و نماینده رسمی فروش');
  const [targetShopName, setTargetShopName] = useState('گالری طلا و نقره فردوس');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitorRegistered, setVisitorRegistered] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);

  const isLight = themeMode === 'light';

  const quickQuestions = isRtl
    ? [
        'این برنامه چه تسهیلی در کار طلافروشی و نقره‌فروشی انجام می‌دهد؟',
        'صورت خرید رسمی برنامه و شرایط شخصی‌سازی اختصاصی (White-Label) چیست؟',
        'شرایط دعوت از ویزیتورها و دریافت ۲۵٪ پورسانت نقدی از هر فروش چگونه است؟',
        'فرمول دقیق مالیات و سود اتحادیه طلا و حباب سکه امروز چقدر است؟',
      ]
    : [
        'How does this app facilitate daily jewelry & silverware shop operations?',
        'What is the official purchase invoice & White-Label personalization price?',
        'How does the 25% direct Visitor Sales Commission program work?',
        'Explain the Iran Gold Union making charge & VAT formula',
      ];

  const handleAskAi = async (customQuestion?: string) => {
    const q = (customQuestion ?? aiPrompt).trim();
    if (!q) return;
    setAiPrompt('');
    setAiMessages((prev) => [...prev, { role: 'user', text: q }]);
    setAiLoading(true);

    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: q, lang: isRtl ? 'fa' : 'en' }),
      });
      const data = await res.json();
      setAiMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.reply || 'پاسخ آماده شد.',
          source: data.source,
        },
      ]);
    } catch {
      setAiMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: isRtl
            ? `بر اساس نرخ لحظه‌ای تابلو (${rates.gram18kToman.toLocaleString('en-US')} تومان)، این سامانه در ۱ ثانیه قیمت تک‌فروشی و بنکداری را محاسبه کرده و ویزیتورها از هر فروش ۲۵٪ پورسانت نقدی دریافت می‌کنند.`
            : `Based on live board rate (${rates.gram18kToman.toLocaleString('en-US')} Toman), this platform calculates retail & B2B prices in 1 second and pays visitors 25% commission per sale.`,
          source: 'offline-fallback',
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // Apply Live Rebranding across the entire application immediately
  const handleApplyLivePersonalization = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateRates) {
      onUpdateRates({
        galleryName: customGalleryName,
        galleryPhone: customGalleryPhone,
        galleryInstagram: customGalleryInsta,
        defaultProfitPercent: customProfitPct,
      });
    }
    try {
      localStorage.setItem(
        'talayar_custom_brand',
        JSON.stringify({
          galleryName: customGalleryName,
          galleryPhone: customGalleryPhone,
          galleryInstagram: customGalleryInsta,
          defaultProfitPercent: customProfitPct,
        })
      );
    } catch {}
    setLiveRebrandApplied(true);
    setTimeout(() => setLiveRebrandApplied(false), 3500);
  };

  const handleCopyPersonalizedUrl = async () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams({
      brand: customGalleryName,
      phone: customGalleryPhone,
      insta: customGalleryInsta,
    });
    const fullUrl = `${baseUrl}?${params.toString()}`;
    await navigator.clipboard.writeText(fullUrl);
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 3000);
  };

  // 8 Key Ways TalaYar Facilitates Jewelry & Silverware Shop Operations
  const facilitationBenefits = [
    {
      titleFa: '۱. حذف ۱۰۰٪ خطای انسانی و استرس در نوسانات شدید قیمت',
      titleEn: '1. Zero Calculation Error During Rapid Spot Fluctuations',
      descFa:
        'در لحظاتی که انس و مظنه ثانیه‌ای تغییر می‌کند، طلافروش تنها با وارد کردن وزن و اجرت، در ۱ ثانیه قیمت دقیق قانونی اتحادیه (سود ۷٪ + مالیات ۱۰٪ فقط روی سود و اجرت) را بدون ماشین‌حساب دستی به مشتری اعلام می‌کند.',
      descEn:
        'Instantly computes exact union-compliant retail price (weight, making charge, profit, VAT on fee only) in 1 second.',
    },
    {
      titleFa: '۲. اعتمادسازی فوری برای مشتری با تابلوی تلویزیون (TV Mode)',
      titleEn: '2. Instant Customer Trust via Showroom TV Board',
      descFa:
        'با نمایش تابلوی دیجیتال زنده روی تلویزیون مغازه و ارسال ریزفاکتور رسمی در واتساپ، شک و چانه‌زنی غیرمنطقی مشتری از بین رفته و نرخ تبدیل بازدیدکننده به خریدار ۲ برابر می‌شود.',
      descEn:
        'Turns any showroom TV into a luxury live gold & coin board while sending transparent WhatsApp invoices.',
    },
    {
      titleFa: '۳. تفکیک هوشمند تک‌فروشی از بنکداری (طلا به طلا و ساچمه به ظرف)',
      titleEn: '3. Simultaneous Retail & B2B Gold-for-Gold Settlement',
      descFa:
        'طلافروش و نقره‌فروش در یک نگاه هم قیمت نقدی مشتری و هم فرمول تسویه وزنی کارگاه (طلا به طلا یا ساچمه ۹۹۹ به ظرف نقره) را می‌بیند تا حاشیه سود خالص مغازه حفظ شود.',
      descEn:
        'Displays both customer retail price and B2B workshop fine metal settlement weight side-by-side.',
    },
    {
      titleFa: '۴. تسهیل ۳ ثانیه‌ای تعویض طلای کهنه/شکسته با طلای نو',
      titleEn: '4. 3-Second Scrap Gold Trade-In & Difference Invoice',
      descFa:
        'وزن نگین و فنر را کسر کرده، عیار آزمایشگاه را به ۷۵۰ استاندارد تبدیل می‌کند، ارزش طلای کهنه مشتری را از سرویس طلای نو کم کرده و مابه‌التفاوت دقیق را چاپ و واتساپ می‌کند.',
      descEn:
        'Automatically deducts stone weight, normalizes karat purity, and computes net trade-in payable.',
    },
    {
      titleFa: '۵. بی‌نیازی از طراح گرافیست با استوری‌ساز ۱-کلیکی HD',
      titleEn: '5. 1-Click 1080x1920 HD Instagram Story Generator',
      descFa:
        'هر روز صبح بدون هزینه گرافیست، پوستر «تابلوی نرخ روز گالری» و «پوستر قیمت لحظه‌ای محصولات ویترین» را با لوگوی گالری خودتان دانلود و استوری کنید.',
      descEn:
        'Generates luxury vertical 1080x1920 daily rate posters and product stories in 1 click.',
    },
    {
      titleFa: '۶. صدور شناسنامه دیجیتال اصالت QR Code (وفادارسازی مشتری)',
      titleEn: '6. Digital QR Authenticity & Loyalty Passport',
      descFa:
        'صدور کارت ضمانت دیجیتال با QR Code اختصاصی که مشتری با اسکن آن، ارزش به‌روز طلای خریداری‌شده خود را می‌بیند و برای هر خرید بعدی به گالری شما برمی‌گردد.',
      descEn:
        'Issues verifiable QR digital certificates that show live asset appreciation and bring customers back.',
    },
    {
      titleFa: '۷. فروش آسان به توریست‌ها و مشتریان بین‌المللی به ۸ زبان',
      titleEn: '7. Global Tourist Sales in 8 Languages & Multi-Currency',
      descFa:
        'سوییچ ۱-کلیکی به زبان‌های فارسی، انگلیسی، عربی، کُردی، ترکی، آذری، ارمنی و اسپانیایی با ارزهای تومان، دلار، درهم دبی و یورو.',
      descEn:
        'Serve Arabic, Kurdish, Turkish, Azerbaijani, Armenian, Spanish, Persian, and English buyers seamlessly.',
    },
    {
      titleFa: '۸. شخصی‌سازی ۱۰۰٪ اختصاصی برای هر گالری یا شغل مرتبط',
      titleEn: '8. Complete Live White-Label Personalization for Any Business',
      descFa:
        'هر گالری طلا، نقره‌سرا، بنکدار یا سکهفروش می‌تواند کل این سامانه و اپلیکیشن اندروید (APK/AAB) را با نام، لوگو و تلفن اختصاصی خودش داشته باشد.',
      descEn:
        'Any jewelry shop, silver atelier, or wholesaler can rebrand the entire web & Android app under their own name.',
    },
  ];

  // Official Purchase Invoice Text (صورت خرید رسمی برنامه)
  const planDetailsMap = {
    WHITE_LABEL: {
      nameFa: 'نسخه اختصاصی کامل و مادام‌العمر با برند و لوگوی گالری شما (White-Label + APK/AAB اختصاصی)',
      nameEn: 'Lifetime Custom White-Label App (Web + iOS PWA + Signed Android APK/AAB)',
      priceToman: 29000000,
      priceUsd: 490,
      periodFa: 'مالکیت دائمی + تحویل ۲۴ ساعته',
    },
    TIER_4: {
      nameFa: 'اشتراک سطح ۴: بنکداران، کارگاه‌ها و گالری‌های VIP',
      nameEn: 'Level 4 VIP Wholesale & Multi-Branch Subscription',
      priceToman: 12000000,
      priceUsd: 189,
      periodFa: 'اشتراک ماهانه (با پشتیبانی اختصاصی)',
    },
    TIER_3: {
      nameFa: 'اشتراک سطح ۳: گالری طلا، سکه و نقره‌سرای حرفه‌ای',
      nameEn: 'Level 3 Pro Showroom & Silverware Subscription',
      priceToman: 6500000,
      priceUsd: 99,
      periodFa: 'اشتراک ماهانه',
    },
    TIER_2: {
      nameFa: 'اشتراک سطح ۲: ویترین استاندارد طلافروشی',
      nameEn: 'Level 2 Standard Jewelry Shop Subscription',
      priceToman: 3800000,
      priceUsd: 59,
      periodFa: 'اشتراک ماهانه',
    },
  };

  const currentPlan = planDetailsMap[buyerPlan];

  const purchaseInvoiceText = isRtl
    ? `🧾 *صورت خرید رسمی سامانه هوشمند طلایار جهانی (AurumMate VIP)*\n` +
      `🏛️ خریدار محترم: *${buyerGalleryName}*\n` +
      `📦 پکیج انتخابی: *${currentPlan.nameFa}*\n` +
      `⏱️ نوع مجوز: ${currentPlan.periodFa}\n` +
      `💰 *مبلغ قابل پرداخت:* ${currentPlan.priceToman.toLocaleString('en-US')} تومان (معادل $${currentPlan.priceUsd})\n` +
      `────────────────────\n` +
      `✅ *اقلام تحویلی در این صورت خرید:*\n` +
      `۱. شخصی‌سازی کامل نام، لوگو، تلفن و اینستاگرام گالری روی کل برنامه\n` +
      `۲. فایل نصبی اندروید امضاشده (APK کافه‌بازار/مایکت و AAB گوگل‌پلی) + وب‌اپلیکیشن آیفون (PWA)\n` +
      `۳. تابلوی زنده تلویزیون مغازه + ماشین‌حساب طلا و ظروف نقره + استوری‌ساز HD + شناسنامه QR\n` +
      `۴. پشتیبانی از ۸ زبان (فارسی، انگلیسی، عربی، کُردی، ترکی، آذری، ارمنی و اسپانیایی)`
    : `🧾 *Official Purchase Invoice — TalaYar Global (AurumMate VIP)*\n` +
      `🏛️ Buyer Gallery: *${buyerGalleryName}*\n` +
      `📦 Selected Package: *${currentPlan.nameEn}*\n` +
      `💰 *Total Payable:* $${currentPlan.priceUsd} (${currentPlan.priceToman.toLocaleString('en-US')} Toman)\n` +
      `• Includes Full Rebranding, Signed Android APK/AAB, iOS PWA, TV Mode, Silverware Studio & 8 Languages.`;

  const handleCopyInvoice = async () => {
    await navigator.clipboard.writeText(purchaseInvoiceText);
    setCopiedInvoice(true);
    setTimeout(() => setCopiedInvoice(false), 2500);
  };

  // Visitor 25% Direct Sales Commission Calculations (دعوت از ویزیتورها با پورسانت ۲۵٪ از فروش)
  const COMMISSION_RATE = 0.25; // 25% Direct Commission
  const visitorSubCommissionToman = Math.round(
    visitorMonthlySubSales * selectedSubPriceToman * COMMISSION_RATE
  );
  const visitorWhiteLabelCommissionToman = Math.round(
    visitorWhiteLabelSales * 29000000 * COMMISSION_RATE
  ); // 7,250,000 Toman per White-Label sale!
  const totalVisitorMonthlyCommission =
    visitorSubCommissionToman + visitorWhiteLabelCommissionToman;

  const visitorPitchText = isRtl
    ? `🤝 *پیشنهاد ویژه راه‌اندازی سامانه اختصاصی طلا و نقره (White-Label)*\n` +
      `🏛️ تقدیم به مدیریت محترم: *${targetShopName}*\n` +
      `👤 مشاور و نماینده فروش: ${visitorName}\n` +
      `────────────────────\n` +
      `✨ *این برنامه چه تسهیلی در کار طلافروشی و نقره‌سرای شما ایجاد می‌کند؟*\n` +
      `۱. محاسبه ۱ ثانیه‌ای فرمول اتحادیه (وزن، اجرت، سود و مالیات) و حذف کامل خطای دستی در زمان نوسان نرخ\n` +
      `۲. نمایش همزمان قیمت تک‌فروشی مشتری و تسویه بنکداری (طلا به طلا و ساچمه نقره ۹۹۹ به ظرف)\n` +
      `۳. تابلوی تمام‌صفحه تلویزیون مغازه (TV Mode) + ماشین‌حساب ۳ ثانیه‌ای تعویض طلای کهنه با نو\n` +
      `۴. استوری‌ساز ۱ کلیکی HD اینستاگرام + صدور شناسنامه دیجیتال اصالت QR Code با نام گالری شما\n` +
      `۵. شخصی‌سازی ۱۰۰٪ با نام، لوگو و پکیج اندروید (APK/AAB) و آیفون اختصاصی گالری شما به ۸ زبان زنده دنیا`
    : `🤝 *Personalized Jewelry & Silverware App Proposal*\n` +
      `🏛️ Prepared for: *${targetShopName}*\n` +
      `👤 Official Sales Representative: ${visitorName}\n` +
      `• 1-second retail & B2B gold/silverware calculation, Showroom TV Mode, 3-second Gold Trade-In, 1-Click HD Story Maker, and Full Custom White-Label Branding in 8 Languages.`;

  const handleCopyPitch = async () => {
    await navigator.clipboard.writeText(visitorPitchText);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2500);
  };

  return (
    <div className="space-y-12" id="ai-vip">
      {/* Part 1: AI Gold, Silverware & Jewelry Assistant (/api/ai-assistant) */}
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
                ? '۰۵. دستیار هوشمند طلا، جواهر و ظروف نقره (/api/ai-assistant با اتوماسیون امن سرور و موتور آفلاین)'
                : '05. Smart AI Gold, Jewelry & Silverware Advisor (Server Vault + Offline Expert Engine)'}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mt-1">
              {isRtl
                ? 'مشاوره تخصصی تسهیلات طلافروشی، فرمول اتحادیه، ظروف نقره، صورت خرید و پورسانت ۲۵٪ ویزیتورها'
                : '24/7 Intelligent Calculation, Silverware Craft, Purchase Guide & 25% Visitor Advisor'}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          <div className="lg:col-span-4 space-y-3">
            <div className="text-sm font-bold text-amber-500 mb-2">
              {isRtl
                ? 'سوالات پرتکرار طلافروشان و ویزیتورها (کلیک کنید):'
                : '1-Click Expert Prompts:'}
            </div>
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleAskAi(q)}
                className={`w-full text-right p-3.5 rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 hover:border-amber-500 text-slate-800'
                    : 'bg-slate-950/80 border-slate-800 hover:border-amber-400 text-slate-200'
                }`}
              >
                {q}
              </button>
            ))}
          </div>

          <div
            className={`lg:col-span-8 rounded-2xl border p-5 flex flex-col justify-between min-h-[380px] ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}
          >
            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {aiMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl text-sm md:text-base leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-amber-500 text-slate-950 font-bold ml-auto max-w-[85%]'
                      : isLight
                      ? 'bg-white border border-slate-200 text-slate-800 mr-auto max-w-[92%]'
                      : 'bg-slate-900 border border-slate-800 text-slate-100 mr-auto max-w-[92%]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold opacity-75">
                      {m.role === 'user'
                        ? isRtl
                          ? 'پرسش شما'
                          : 'You'
                        : isRtl
                        ? 'دستیار هوشمند طلایار جهانی'
                        : 'TalaYar AI Advisor'}
                    </span>
                    {m.role === 'assistant' && (
                      <button
                        onClick={() => onSpeak(m.text)}
                        className="inline-flex items-center gap-1 text-xs text-amber-500 hover:underline cursor-pointer"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>{isRtl ? 'قرائت صوتی' : 'Speak'}</span>
                      </button>
                    )}
                  </div>
                  {m.text}
                </div>
              ))}
              {aiLoading && (
                <div className="text-sm text-amber-500 font-semibold animate-pulse">
                  {isRtl
                    ? 'در حال تحلیل و محاسبه بر اساس نرخ لحظه‌ای تابلو...'
                    : 'Calculating live market response...'}
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskAi();
              }}
              className="mt-4 pt-4 border-t border-amber-500/20 flex gap-3"
            >
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder={
                  isRtl
                    ? 'سوال خود درباره تسهیلات برنامه، صورت خرید یا پورسانت ۲۵٪ ویزیتورها را بنویسید...'
                    : 'Ask about jewelry shop facilitation, purchase invoice, or 25% visitor commission...'
                }
                className={`flex-1 px-4 py-3 rounded-xl border text-base ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-900'
                    : 'bg-slate-900 border-slate-700 text-white'
                }`}
              />
              <button
                type="submit"
                disabled={aiLoading}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>{isRtl ? 'ارسال' : 'Ask'}</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Part 2: How TalaYar Facilitates Jewelry & Silverware Shop Operations (این برنامه چه تسهیلی در کار طلافروشی انجام می‌دهد؟) */}
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
                ? '۰۶-الف. یادآوری مهم: این برنامه چه تسهیلی در کار روزانه طلافروشی، نقره‌سرا و بنکداری ایجاد می‌کند؟'
                : '06-A. Operational Transformation: How TalaYar Facilitates Daily Jewelry & Silverware Business'}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mt-1">
              {isRtl
                ? '۸ تحول و تسهیل کلیدی که سرعت فروش، دقت حسابداری و اعتماد مشتری طلافروش را دوچندان می‌کند'
                : '8 Key Operational Advantages That Double Showroom Speed, Accuracy & Buyer Trust'}
            </h2>
          </div>

          <button
            onClick={() =>
              onSpeak(
                isRtl
                  ? 'این برنامه هشت تسهیل بزرگ در کار طلافروشی ایجاد می‌کند: اول، حذف کامل خطای محاسبه در زمان نوسان نرخ طلا. دوم، تابلوی تلویزیون مغازه برای جلب اعتماد فوری مشتری. سوم، نمایش همزمان قیمت تک‌فروشی و تسویه طلا به طلای بنکداری. چهارم، محاسبه سه ثانیه‌ای تعویض طلای کهنه با نو. پنجم، استوری‌ساز یک کلیکی اینستاگرام. ششم، صدور شناسنامه دیجیتال اصالت کیوآر کد. هفتم، پشتیبانی از هشت زبان زنده دنیا و هشتم، قابلیت شخصی‌سازی کامل به نام هر گالری.'
                  : 'This application provides 8 major operational benefits for jewelers: 1-second union pricing, showroom TV board, simultaneous retail and B2B settlement, 3-second scrap gold trade-in, 1-click HD story maker, QR authenticity certificates, 8 languages support, and instant White-Label personalization.'
              )
            }
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-500 font-bold text-xs cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            <span>{isRtl ? 'قرائت صوتی مزایای برنامه برای طلافروش' : 'Read Benefits Aloud'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {facilitationBenefits.map((b, i) => (
            <div
              key={i}
              className={`p-5 rounded-2xl border flex flex-col justify-between ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/90 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 text-amber-500 font-bold text-sm mb-2">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <h3>{isRtl ? b.titleFa : b.titleEn}</h3>
                </div>
                <p className="text-xs leading-relaxed opacity-85">
                  {isRtl ? b.descFa : b.descEn}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Competitive Edge Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-amber-500/20">
          {COMPETITOR_ANALYSIS.map((item, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border p-6 flex flex-col justify-between ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/90 border-slate-800'
              }`}
            >
              <div>
                <div className="text-xs font-bold text-amber-500 mb-1">
                  {isRtl ? item.categoryFa : item.categoryEn}
                </div>
                <h3 className="text-lg font-bold mb-4">
                  {isRtl ? item.competitorsFa : item.competitorsEn}
                </h3>

                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 mb-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-500 mb-1">
                    <ShieldAlert className="w-4 h-4" />
                    <span>{isRtl ? 'نقطه ضعف رقبا:' : 'Competitor Weakness:'}</span>
                  </div>
                  <p className="text-xs md:text-sm leading-relaxed opacity-90">
                    {isRtl ? item.weaknessFa : item.weaknessEn}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 mb-1">
                  <Lightbulb className="w-4 h-4" />
                  <span>
                    {isRtl
                      ? 'برتری خلاقانه طلایار جهانی:'
                      : 'TalaYar Global Superpower:'}
                  </span>
                </div>
                <p className="text-xs md:text-sm leading-relaxed font-medium">
                  {isRtl ? item.ourSuperpowerFa : item.ourSuperpowerEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Part 3: Live Interactive Business Personalization Studio (شخصی‌سازی زنده برنامه برای هر گالری یا کسب‌وکار) */}
      <section
        id="live-personalization"
        className={`rounded-3xl border-2 border-amber-500 p-6 md:p-10 transition-colors ${
          isLight
            ? 'bg-amber-50/40 text-slate-900 shadow-sm'
            : 'bg-slate-900/90 text-slate-100'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-amber-500/20">
          <div>
            <span className="text-xs font-semibold text-amber-500 tracking-wide">
              {isRtl
                ? '۰۶-ب. موتور شخصی‌سازی زنده و ۱-کلیکی (اگر هر کسب‌وکاری خواست این برنامه برایش شخصی‌سازی شود)'
                : '06-B. Live 1-Click White-Label Personalization Engine for Any Business or Gallery'}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mt-1">
              {isRtl
                ? 'شخصی‌سازی آنی کل برنامه (هدر، تابلوی تلویزیون، استوری‌ساز و شناسنامه QR) به نام گالری مشتری در ۱ ثانیه!'
                : 'Rebrand the Entire App (TV Board, Story Maker, QR Certs & Invoices) for Any Client in 1 Second!'}
            </h2>
          </div>
        </div>

        <form onSubmit={handleApplyLivePersonalization} className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div>
            <label className="block text-xs font-bold mb-1.5">
              {isRtl
                ? 'نام گالری طلا / نقره‌سرا / بنکداری مشتری:'
                : 'Custom Gallery / Business Name:'}
            </label>
            <input
              type="text"
              required
              value={customGalleryName}
              onChange={(e) => setCustomGalleryName(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border font-bold text-sm ${
                isLight ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-700 text-amber-400'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">
              {isRtl ? 'شماره تماس و واتساپ اختصاصی گالری:' : 'Custom Gallery Phone / WhatsApp:'}
            </label>
            <input
              type="tel"
              required
              value={customGalleryPhone}
              onChange={(e) => setCustomGalleryPhone(e.target.value)}
              dir="ltr"
              className={`w-full px-4 py-3 rounded-xl border font-tabular font-bold text-sm ${
                isLight ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-700 text-white'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">
              {isRtl ? 'آیدی اینستاگرام اختصاصی کسب‌وکار:' : 'Custom Instagram Handle:'}
            </label>
            <input
              type="text"
              required
              value={customGalleryInsta}
              onChange={(e) => setCustomGalleryInsta(e.target.value)}
              dir="ltr"
              className={`w-full px-4 py-3 rounded-xl border font-tabular font-bold text-sm ${
                isLight ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-700 text-white'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">
              {isRtl ? 'سود پیش‌فرض گالری (%):' : 'Default Shop Margin (%):'}
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="30"
              value={customProfitPct}
              onChange={(e) => setCustomProfitPct(Number(e.target.value))}
              className={`w-full px-4 py-3 rounded-xl border font-tabular font-bold text-sm ${
                isLight ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-700 text-emerald-400'
              }`}
            />
          </div>

          <div className="md:col-span-4 flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm cursor-pointer transition-colors"
              >
                <Wand2 className="w-5 h-5" />
                <span>
                  {isRtl
                    ? 'اعمال فوری شخصی‌سازی روی کل برنامه (تغییر آنی نام تابلوی تلویزیون، استوری و فاکتور)'
                    : 'Apply Instant Rebranding Across Entire App Now'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleCopyPersonalizedUrl}
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm cursor-pointer transition-colors"
              >
                {copiedShareLink ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
                <span>
                  {copiedShareLink
                    ? isRtl
                      ? 'لینک اختصاصی با نام این کسب‌وکار کپی شد!'
                      : 'Personalized Link Copied!'
                    : isRtl
                    ? 'کپی لینک اختصاصی شخصی‌سازی‌شده برای ارسال به صاحب گالری'
                    : 'Copy Personalized App Link for This Client'}
                </span>
              </button>
            </div>

            {liveRebrandApplied && (
              <div className="px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-500 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isRtl
                    ? `✨ کل برنامه با موفقیت به نام «${customGalleryName}» شخصی‌سازی شد!`
                    : `✨ Entire platform is now personalized for "${customGalleryName}"!`}
                </span>
              </div>
            )}
          </div>
        </form>
      </section>

      {/* Part 4: Official Purchase Invoice & Visitor 25% Commission Invitation (صورت خرید رسمی برنامه + دعوت از ویزیتورها با پورسانت ۲۵٪) */}
      <section
        id="monetization-reseller"
        className={`rounded-3xl border p-6 md:p-10 transition-colors ${
          isLight
            ? 'bg-white border-slate-200 shadow-sm text-slate-900'
            : 'bg-slate-900/70 border-slate-800 text-slate-100'
        }`}
      >
        <div className="pb-6 border-b border-amber-500/20">
          <span className="text-xs font-semibold text-amber-500 tracking-wide">
            {isRtl
              ? '۰۷. صورت خرید رسمی برنامه + دعوت از ویزیتورها و بازاریابان سراسر ایران و جهان با ۲۵٪ پورسانت نقدی از هر فروش'
              : '07. Official App Purchase Invoice + Visitor & Marketer Invitation (25% Direct Sales Commission)'}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mt-1">
            {isRtl
              ? 'تعرفه شفاف خرید برنامه (اشتراکی و اختصاصی White-Label) + باشگاه ویزیتورها با پورسانت ۲۵٪ نقدی'
              : 'Transparent Purchase Plans & 25% Direct Sales Commission for Visitors'}
          </h2>
        </div>

        {/* 5 VIP Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-8">
          {VIP_TIERS.map((tier) => (
            <div
              key={tier.level}
              className={`rounded-2xl border p-5 flex flex-col justify-between ${
                tier.highlighted
                  ? 'border-2 border-amber-500 bg-amber-500/10'
                  : isLight
                  ? 'bg-slate-50 border-slate-200'
                  : 'bg-slate-950/90 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-500">LEVEL {tier.level}</span>
                  {tier.highlighted && <Crown className="w-5 h-5 text-amber-500" />}
                </div>
                <h3 className="text-base font-bold">
                  {isRtl ? tier.titleFa : tier.titleEn}
                </h3>
                <div className="text-lg font-bold text-emerald-500 font-tabular my-3">
                  {marketMode === 'IR' ? tier.monthlyToman : tier.monthlyGlobalUsd}
                </div>
                <p className="text-xs opacity-75 mb-4">
                  {isRtl ? tier.audienceFa : tier.audienceEn}
                </p>
                <ul className="space-y-2 text-xs">
                  {(isRtl ? tier.featuresFa : tier.featuresEn).map((feat, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={`https://wa.me/${rates.galleryPhone.replace(/^0/, '98').replace(/\D/g, '')}?text=${encodeURIComponent(
                  `سلام، متقاضی خرید و فعال‌سازی ${tier.titleFa} در سامانه طلایار جهانی VIP هستم.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-6 w-full py-2.5 px-3 rounded-xl text-center font-bold text-xs block transition-colors ${
                  tier.highlighted
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    : 'bg-emerald-600 text-white hover:bg-emerald-500'
                }`}
              >
                {isRtl ? 'خرید و فعال‌سازی آنی' : 'Purchase & Activate'}
              </a>
            </div>
          ))}
        </div>

        {/* Official Purchase Invoice Box & 25% Visitor Invitation Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
          {/* Left: Official Purchase Invoice Generator (صورت خرید رسمی برنامه) */}
          <div
            className={`lg:col-span-6 rounded-2xl border p-6 space-y-4 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}
          >
            <div className="flex items-center gap-2 text-lg font-bold text-amber-500">
              <FileText className="w-5 h-5" />
              <h3>
                {isRtl
                  ? 'صدور «صورت خرید رسمی برنامه» (اشتراک یا نسخه شخصی‌سازی‌شده دائم)'
                  : 'Official App Purchase Invoice & Order Generator'}
              </h3>
            </div>
            <p className="text-xs opacity-85 leading-relaxed">
              {isRtl
                ? 'طلافروشان، نقره‌فروشان و بنکداران محترم می‌توانند نوع پکیج مورد نظر و نام گالری خود را انتخاب کرده و «صورت خرید رسمی» را دریافت و از طریق واتساپ سفارش دهند:'
                : 'Select your preferred package and gallery name to generate an official purchase invoice:'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1">
                  {isRtl ? 'نام گالری یا کسب‌وکار خریدار:' : 'Buyer Gallery Name:'}
                </label>
                <input
                  type="text"
                  value={buyerGalleryName}
                  onChange={(e) => setBuyerGalleryName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  {isRtl ? 'انتخاب نوع خرید برنامه:' : 'Select Purchase Plan:'}
                </label>
                <select
                  value={buyerPlan}
                  onChange={(e) =>
                    setBuyerPlan(
                      e.target.value as 'WHITE_LABEL' | 'TIER_4' | 'TIER_3' | 'TIER_2'
                    )
                  }
                  className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold text-amber-500 ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                  }`}
                >
                  <option value="WHITE_LABEL">
                    نسخه شخصی‌سازی‌شده دائم با برند شما (۲۹ میلیون تومان / $490)
                  </option>
                  <option value="TIER_4">اشتراک سطح ۴ بنکداری VIP (۱۲ میلیون / ماه)</option>
                  <option value="TIER_3">اشتراک سطح ۳ گالری و نقره‌سرا (۶.۵ میلیون / ماه)</option>
                  <option value="TIER_2">اشتراک سطح ۲ استاندارد (۳.۸ میلیون / ماه)</option>
                </select>
              </div>
            </div>

            <pre
              className={`p-3.5 rounded-xl border text-xs whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-700'
                  : 'bg-slate-900 border-slate-800 text-slate-200'
              }`}
            >
              {purchaseInvoiceText}
            </pre>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handleCopyInvoice}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl border border-amber-500 text-amber-500 font-bold text-xs cursor-pointer"
              >
                {copiedInvoice ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>
                  {copiedInvoice
                    ? isRtl
                      ? 'صورت خرید کپی شد!'
                      : 'Invoice Copied!'
                    : isRtl
                    ? 'کپی متن صورت خرید رسمی'
                    : 'Copy Official Purchase Invoice'}
                </span>
              </button>

              <a
                href={`https://wa.me/${rates.galleryPhone.replace(/^0/, '98').replace(/\D/g, '')}?text=${encodeURIComponent(
                  purchaseInvoiceText
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isRtl ? 'ارسال صورت خرید به واتساپ فروش' : 'Send Purchase Order on WhatsApp'}
                </span>
              </a>
            </div>
          </div>

          {/* Right: Official Visitor Invitation & 25% Direct Sales Commission Studio (دعوت از ویزیتورها با ۲۵٪ پورسانت از فروش) */}
          <div
            className={`lg:col-span-6 rounded-2xl border-2 border-emerald-500/60 p-6 space-y-4 ${
              isLight ? 'bg-emerald-50/30' : 'bg-slate-950'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-lg font-bold text-emerald-500">
                <Users className="w-5 h-5" />
                <h3>
                  {isRtl
                    ? 'فراخوان دعوت از ویزیتورها و بازاریابان (پورسانت ۲۵٪ نقدی از هر فروش!)'
                    : 'Official Visitor Invitation — Earn 25% Cash Commission on Every Sale!'}
                </h3>
              </div>
              <span className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs font-tabular">
                25% COMMISSION
              </span>
            </div>

            <p className="text-xs opacity-90 leading-relaxed">
              {isRtl
                ? 'از تمامی ویزیتورها، بازاریابان حضوری بازار طلا و نقره و مشاوران فروش دعوت می‌کنیم این برنامه را به طلافروشان، نقره‌فروشان و بنکداران معرفی کرده و بفروشند و بلافاصله ۲۵٪ از کل مبلغ هر فروش (مثلاً ۷,۲۵۰,۰۰۰ تومان نقد به ازای هر فروش نسخه شخصی‌سازی‌شده White-Label!) دریافت نمایند:'
                : 'We invite sales visitors and marketers worldwide to sell this platform (subscriptions or custom White-Label apps) to jewelers and silver shops and receive an instant 25% commission on every sale!'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1">
                  {isRtl ? 'فروش اشتراک در ماه:' : 'Monthly Sub Sales:'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={visitorMonthlySubSales}
                  onChange={(e) => setVisitorMonthlySubSales(Math.max(0, Number(e.target.value)))}
                  className={`w-full px-3.5 py-2 rounded-xl border font-tabular font-bold ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  {isRtl ? 'میانگین پلن اشتراک:' : 'Avg Sub Tier:'}
                </label>
                <select
                  value={selectedSubPriceToman}
                  onChange={(e) => setSelectedSubPriceToman(Number(e.target.value))}
                  className={`w-full px-3 py-2 rounded-xl border font-semibold text-xs ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                  }`}
                >
                  <option value={3800000}>سطح ۲ (۳.۸ میلیون)</option>
                  <option value={6500000}>سطح ۳ (۶.۵ میلیون)</option>
                  <option value={12000000}>سطح ۴ (۱۲ میلیون)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  {isRtl ? 'فروش اختصاصی (۲۹ میلیونی):' : 'White-Label Sales:'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={visitorWhiteLabelSales}
                  onChange={(e) => setVisitorWhiteLabelSales(Math.max(0, Number(e.target.value)))}
                  className={`w-full px-3.5 py-2 rounded-xl border font-tabular font-bold text-amber-500 ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                  }`}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span>
                  {isRtl ? 'پورسانت ۲۵٪ شما از فروش اشتراک‌ها:' : '25% Commission on Subscriptions:'}
                </span>
                <span className="font-tabular font-bold">
                  {visitorSubCommissionToman.toLocaleString('en-US')} تومان
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span>
                  {isRtl
                    ? 'پورسانت ۲۵٪ شما از فروش نسخه اختصاصی (۷,۲۵۰,۰۰۰ تومان در هر فروش):'
                    : '25% Commission on White-Label Sales:'}
                </span>
                <span className="font-tabular font-bold text-amber-500">
                  {visitorWhiteLabelCommissionToman.toLocaleString('en-US')} تومان
                </span>
              </div>
              <div className="pt-2 border-t border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold block">
                    {isRtl
                      ? 'درآمد خالص ماهانه ویزیتور (بر مبنای ۲۵٪ از فروش):'
                      : 'Total Monthly Visitor Commission (25%):'}
                  </span>
                  <span className="text-2xl font-bold text-emerald-500 font-tabular">
                    {totalVisitorMonthlyCommission.toLocaleString('en-US')} تومان
                  </span>
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-500" />
              </div>
            </div>

            {/* Visitor Personalized Client Pitch & Registration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <input
                type="text"
                placeholder={isRtl ? 'نام ویزیتور / بازاریاب' : 'Visitor Name'}
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                className={`w-full px-3.5 py-2 rounded-xl border text-xs font-semibold ${
                  isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                }`}
              />
              <input
                type="text"
                placeholder={isRtl ? 'نام گالری مشتری هدف' : 'Target Shop Name'}
                value={targetShopName}
                onChange={(e) => setTargetShopName(e.target.value)}
                className={`w-full px-3.5 py-2 rounded-xl border text-xs font-semibold ${
                  isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                }`}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCopyPitch}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-amber-500/50 text-amber-500 font-bold text-xs cursor-pointer"
              >
                {copiedPitch ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>
                  {copiedPitch
                    ? isRtl
                      ? 'متن پرزنت و معرفی به طلافروش کپی شد!'
                      : 'Visitor Pitch Copied!'
                    : isRtl
                    ? 'کپی متن معرفی تسهیلات برنامه برای ارسال به طلافروش'
                    : 'Copy Visitor Sales Pitch for Jewelers'}
                </span>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setVisitorRegistered(true);
              }}
              className="flex flex-wrap sm:flex-nowrap gap-2 pt-2 border-t border-emerald-500/20"
            >
              <input
                type="tel"
                required
                placeholder={
                  isRtl
                    ? 'شماره موبایل ویزیتور جهت دریافت کد نمایندگی ۲۵٪'
                    : 'Visitor Phone for 25% Partner ID'
                }
                value={visitorPhone}
                onChange={(e) => setVisitorPhone(e.target.value)}
                className={`flex-1 px-3.5 py-2.5 rounded-xl border font-tabular text-xs ${
                  isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                }`}
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer whitespace-nowrap"
              >
                {isRtl ? 'ثبت‌نام ویزیتور (۲۵٪ پورسانت)' : 'Join Visitor Club (25%)'}
              </button>
            </form>

            {visitorRegistered && (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-400 text-xs font-bold">
                {isRtl
                  ? `✅ کد نمایندگی فروش ۲۵٪ برای «${visitorName}» (${visitorPhone}) صادر و فعال گردید.`
                  : `✅ 25% Visitor Sales ID activated for ${visitorName} (${visitorPhone}).`}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
