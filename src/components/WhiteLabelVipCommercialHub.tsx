import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Calculator,
  CheckCircle2,
  Send,
  Copy,
  Printer,
  Lock,
  Sparkles,
  TrendingUp,
  Award,
  Briefcase,
  Building2,
  FileText,
  CreditCard,
  Users,
  AlertTriangle,
  RefreshCw,
  Share2,
  CheckSquare,
  Clock,
  HelpCircle,
  MapPin,
} from 'lucide-react';
import { Language, MarketMode, MarketRatesState } from '../types/gold';
import { isRtlLanguage } from '../utils/i18n';
import {
  WhiteLabelTenantConfig,
  buildTenantShareUrl,
  listSavedTenants,
  loadTenantBySlug,
  toTenantSlug,
} from '../utils/tenantStorage';

interface WhiteLabelVipCommercialHubProps {
  tenant: WhiteLabelTenantConfig;
  onUpdateTenant: (next: WhiteLabelTenantConfig) => void;
  rates: MarketRatesState;
  marketMode: MarketMode;
  lang: Language;
  themeMode: 'light' | 'dark';
  onSpeak: (text: string) => void;
}

interface SayadCheckScheduleRow {
  checkNumber: number;
  serialCode: string;
  dueDateShamsi: string;
  amountToman: number;
}

interface AmbassadorSaleRecord {
  id: string;
  galleryName: string;
  city: string;
  packageTitle: string;
  totalContractToman: number;
  cashDownPaymentToman: number;
  visitorCommission25Toman: number;
  visitorRef: string;
  shebaNumber: string;
  settlementStatus: 'PAID_INSTANT_SHEBA' | 'CLEARING_DOWNPAYMENT';
  createdAtShamsi: string;
}

const SHAMSI_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

const INITIAL_AMBASSADOR_LEDGER: AmbassadorSaleRecord[] = [
  {
    id: 'SALE-901',
    galleryName: 'گالری جواهرات زمرد چیذر',
    city: 'تهران',
    packageTitle: 'لایسنس تجاری پایه طلایار (۴۸ میلیون تومان)',
    totalContractToman: 48_000_000,
    cashDownPaymentToman: 12_000_000,
    visitorCommission25Toman: 12_000_000,
    visitorRef: 'VIP-104',
    shebaNumber: 'IR820120000000009876543210',
    settlementStatus: 'PAID_INSTANT_SHEBA',
    createdAtShamsi: '۱۴۰۵/۰۷/۰۴ - ۱۱:۲۰',
  },
  {
    id: 'SALE-902',
    galleryName: 'سرای نقره و مس قلم‌زنی عالی‌قاپو',
    city: 'اصفهان',
    packageTitle: 'لایسنس VIP دوگانه طلا و نقره + اپ اختصاصی (۹۶ میلیون تومان)',
    totalContractToman: 96_000_000,
    cashDownPaymentToman: 24_000_000,
    visitorCommission25Toman: 24_000_000,
    visitorRef: 'VIP-104',
    shebaNumber: 'IR820120000000009876543210',
    settlementStatus: 'PAID_INSTANT_SHEBA',
    createdAtShamsi: '۱۴۰۵/۰۷/۰۵ - ۱۷:۴۵',
  },
  {
    id: 'SALE-903',
    galleryName: 'بنکداری طلا و شمش آب‌شده اتحاد',
    city: 'مشهد',
    packageTitle: 'بسته تبلیغات ویژه بنکداران طلا و نقره (۱۲ میلیون تومان)',
    totalContractToman: 12_000_000,
    cashDownPaymentToman: 12_000_000,
    visitorCommission25Toman: 3_000_000,
    visitorRef: 'VIP-104',
    shebaNumber: 'IR820120000000009876543210',
    settlementStatus: 'PAID_INSTANT_SHEBA',
    createdAtShamsi: '۱۴۰۵/۰۷/۰۶ - ۱۳:۱۰',
  },
];

export const WhiteLabelVipCommercialHub: React.FC<WhiteLabelVipCommercialHubProps> = ({
  tenant,
  onUpdateTenant,
  rates,
  lang,
  themeMode,
  onSpeak,
}) => {
  const isRtl = isRtlLanguage(lang);
  const isLight = themeMode === 'light';

  // --- 1. Isolated White-Label Tenant Form State ---
  const [draftName, setDraftName] = useState(tenant.businessName);
  const [draftManager, setDraftManager] = useState(tenant.managerName);
  const [draftCity, setDraftCity] = useState(tenant.city);
  const [draftPhone, setDraftPhone] = useState(tenant.phone);
  const [draftSlogan, setDraftSlogan] = useState(tenant.slogan);
  const [draftMultiplier, setDraftMultiplier] = useState<number>(tenant.priceMultiplier || 1.0);
  const [draftRef, setDraftRef] = useState(tenant.visitorRefCode || 'VIP-104');
  const [copiedUrlToast, setCopiedUrlToast] = useState(false);
  const [savedTenantsList, setSavedTenantsList] = useState(() => listSavedTenants());

  // --- 2. Live 0.1s Customer Table Calculator + Sayad Check + Inflation Lock + Split ---
  const [selectedPreset, setSelectedPreset] = useState<string>('سرویس کامل طلای عروس ۱۸ عیار (تراش ایتالیایی)');
  const [itemMetalType, setItemMetalType] = useState<'GOLD_18K' | 'GOLD_21K' | 'GOLD_24K' | 'SILVER_925'>('GOLD_18K');
  const [itemWeightGrams, setItemWeightGrams] = useState<number>(28.5);
  const [makingChargePct, setMakingChargePct] = useState<number>(14);
  const [profitPct, setProfitPct] = useState<number>(rates.defaultProfitPercent || 7);
  const [taxPct, setTaxPct] = useState<number>(rates.defaultTaxPercent || 10);
  const [gemOrPackagingFeeToman, setGemOrPackagingFeeToman] = useState<number>(1_200_000);
  const [customerName, setCustomerName] = useState<string>('جناب آقای مهندس رادمان و خانواده محترم');
  const [customerMobile, setCustomerMobile] = useState<string>('09121112233');

  // Installment & Purple Sayad Check State
  const [downPaymentPct, setDownPaymentPct] = useState<number>(30);
  const [checkCount, setCheckCount] = useState<number>(6);
  const [sayadIdInput, setSayadIdInput] = useState<string>('4102983746510928');
  const [sayadColorStatus, setSayadColorStatus] = useState<'WHITE' | 'YELLOW' | 'ORANGE' | 'RED'>('WHITE');

  // Inflation-Shield Gold Rate Lock State
  const [isRateLocked, setIsRateLocked] = useState<boolean>(true);
  const [lockedTimestamp, setLockedTimestamp] = useState<string>('۱۴۰۵/۰۷/۰۶ - ساعت ۱۴:۳۰ (مظنه و گرم ۱۸ عیار قفل شد)');
  const [lockedGuaranteeCode, setLockedGuaranteeCode] = useState<string>('INF-SHIELD-750-9941');

  // Cost Split Slider (e.g., Bride vs Groom Family or B2B Partners)
  const [partyASplitPct, setPartyASplitPct] = useState<number>(60);
  const [partyALabel, setPartyALabel] = useState<string>('سهم طرف اول (خانواده داماد / شریک اول)');
  const [partyBLabel, setPartyBLabel] = useState<string>('سهم طرف دوم (خانواده عروس / شریک دوم)');

  // --- 3. ROI Calculator State (#deliverables) ---
  const [roiExtraInvoicesPerMonth, setRoiExtraInvoicesPerMonth] = useState<number>(2);
  const [roiAvgWeightGrams, setRoiAvgWeightGrams] = useState<number>(22);
  const [roiMarginAndOjratPct, setRoiMarginAndOjratPct] = useState<number>(15);
  const [selectedRoiLicenseCost, setSelectedRoiLicenseCost] = useState<number>(48_000_000);

  // --- 4. Visitor 60-Second Checklist & Objection Copy State ---
  const [visitorChecklist, setVisitorChecklist] = useState<Record<string, boolean>>({
    step1: true,
    step2: true,
    step3: false,
    step4: false,
    step5: false,
  });
  const [copiedObjectionIndex, setCopiedObjectionIndex] = useState<number | null>(null);

  // --- 5. Ambassador Financial Hub & 25% Instant Sheba Commission State ---
  const [ambassadorSheba, setAmbassadorSheba] = useState<string>('IR820120000000009876543210');
  const [ambassadorCode, setAmbassadorCode] = useState<string>(tenant.visitorRefCode || 'VIP-104');
  const [newSaleGalleryName, setNewSaleGalleryName] = useState<string>('');
  const [newSaleCity, setNewSaleCity] = useState<string>('تهران');
  const [newSalePlan, setNewSalePlan] = useState<'BASE_48M' | 'VIP_96M' | 'AD_12M'>('BASE_48M');
  const [ambassadorSales, setAmbassadorSales] = useState<AmbassadorSaleRecord[]>(INITIAL_AMBASSADOR_LEDGER);

  // Apply White-Label Tenant Update in 0.1s & Sync URL
  const handleApplyTenantCustomization = () => {
    const updated: WhiteLabelTenantConfig = {
      ...tenant,
      slug: toTenantSlug(draftName),
      businessName: draftName.trim() || tenant.businessName,
      managerName: draftManager.trim() || tenant.managerName,
      city: draftCity.trim() || tenant.city,
      phone: draftPhone.trim() || tenant.phone,
      slogan: draftSlogan.trim() || tenant.slogan,
      priceMultiplier: Number(draftMultiplier) || 1.0,
      visitorRefCode: draftRef.trim() || 'VIP-104',
      updatedAt: new Date().toISOString(),
    };
    onUpdateTenant(updated);
    setSavedTenantsList(listSavedTenants());

    // Update browser address bar cleanly without reload so visitor can show URL skinning
    if (typeof window !== 'undefined') {
      const nextUrl = buildTenantShareUrl(updated);
      window.history.replaceState({}, '', nextUrl);
    }
  };

  const handleSwitchSavedTenant = (slug: string) => {
    const loaded = loadTenantBySlug(slug);
    if (loaded) {
      setDraftName(loaded.businessName);
      setDraftManager(loaded.managerName);
      setDraftCity(loaded.city);
      setDraftPhone(loaded.phone);
      setDraftSlogan(loaded.slogan);
      setDraftMultiplier(loaded.priceMultiplier);
      setDraftRef(loaded.visitorRefCode);
      onUpdateTenant(loaded);
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', buildTenantShareUrl(loaded));
      }
    }
  };

  const handleCopyTenantShareLink = () => {
    const link = buildTenantShareUrl({
      ...tenant,
      businessName: draftName,
      managerName: draftManager,
      city: draftCity,
      phone: draftPhone,
      slogan: draftSlogan,
      priceMultiplier: draftMultiplier,
      visitorRefCode: draftRef,
    });
    navigator.clipboard?.writeText(link);
    setCopiedUrlToast(true);
    setTimeout(() => setCopiedUrlToast(false), 2500);
  };

  // --- Live 0.1s Gold & Silver Calculation Engine ---
  const tableCalculation = useMemo(() => {
    const multiplier = tenant.priceMultiplier || 1.0;
    let baseUnitGramToman = rates.gram18kToman;
    let karatLabel = 'طلای ۱۸ عیار (۷۵۰ استاندارد اتحادیه)';

    if (itemMetalType === 'GOLD_21K') {
      baseUnitGramToman = rates.gram21kToman;
      karatLabel = 'طلای ۲۱ عیار (۸۷۵ عربی/کویتی)';
    } else if (itemMetalType === 'GOLD_24K') {
      baseUnitGramToman = rates.gram24kToman;
      karatLabel = 'شمش/طلای ۲۴ عیار خالص (۹۹۹.۹)';
    } else if (itemMetalType === 'SILVER_925') {
      baseUnitGramToman = rates.silver925GramToman;
      karatLabel = 'نقره استرلینگ ۹۲۵ و قلم‌زنی اصفهان';
    }

    const effectiveGramRate = Math.round(baseUnitGramToman * multiplier);
    const rawGoldPrice = Math.round(itemWeightGrams * effectiveGramRate);
    const makingChargeAmount = Math.round(rawGoldPrice * (makingChargePct / 100));
    const profitAmount = Math.round((rawGoldPrice + makingChargeAmount) * (profitPct / 100));
    // Iran Union Law: VAT (Tax) only applies to (Making Charge + Seller Profit), NOT raw gold!
    const taxAmount = Math.round((makingChargeAmount + profitAmount) * (taxPct / 100));
    const totalInvoiceToman =
      rawGoldPrice + makingChargeAmount + profitAmount + taxAmount + gemOrPackagingFeeToman;

    const cashDownPaymentToman = Math.round((totalInvoiceToman * downPaymentPct) / 100);
    const remainingInstallmentToman = Math.max(0, totalInvoiceToman - cashDownPaymentToman);
    const eachCheckAmountToman =
      checkCount > 0 ? Math.round(remainingInstallmentToman / checkCount) : 0;

    // Generate Shamsi Due Date Schedule
    const checksSchedule: SayadCheckScheduleRow[] = [];
    for (let i = 1; i <= checkCount; i++) {
      const monthIdx = (6 + i) % 12; // Starting around Mehr/Aban 1405
      const year = 1405 + Math.floor((6 + i) / 12);
      const serialSuffix = String(1040 + i * 7);
      checksSchedule.push({
        checkNumber: i,
        serialCode: `${sayadIdInput.slice(0, 8)}-${serialSuffix}`,
        dueDateShamsi: `۱۵ ${SHAMSI_MONTHS[monthIdx]} ${year}`,
        amountToman:
          i === checkCount
            ? remainingInstallmentToman - eachCheckAmountToman * (checkCount - 1)
            : eachCheckAmountToman,
      });
    }

    const partyAShareToman = Math.round((totalInvoiceToman * partyASplitPct) / 100);
    const partyBShareToman = totalInvoiceToman - partyAShareToman;

    return {
      karatLabel,
      effectiveGramRate,
      rawGoldPrice,
      makingChargeAmount,
      profitAmount,
      taxAmount,
      totalInvoiceToman,
      cashDownPaymentToman,
      remainingInstallmentToman,
      eachCheckAmountToman,
      checksSchedule,
      partyAShareToman,
      partyBShareToman,
    };
  }, [
    tenant.priceMultiplier,
    rates,
    itemMetalType,
    itemWeightGrams,
    makingChargePct,
    profitPct,
    taxPct,
    gemOrPackagingFeeToman,
    downPaymentPct,
    checkCount,
    sayadIdInput,
    partyASplitPct,
  ]);

  const sayadStatusMeta = useMemo(() => {
    switch (sayadColorStatus) {
      case 'WHITE':
        return {
          title: 'وضعیت سفید (بدون چک برگشتی و خوش‌حساب ممتاز)',
          creditScore: '۸۴۵ از ۹۰۰ (رتبه A+ بانک مرکزی)',
          badgeClass: 'bg-emerald-500/15 border-emerald-500 text-emerald-500',
          desc: 'صادرکننده چک فاقد هرگونه سابقه چک برگشتی در سامانه صیاد بانک مرکزی است. مجاز به تقسیط تا ۱۲ فقره چک صیادی بنفش.',
        };
      case 'YELLOW':
        return {
          title: 'وضعیت زرد (۱ فقره چک برگشتی یا حداکثر ۵۰ میلیون تعهد معوق)',
          creditScore: '۶۲۰ از ۹۰۰ (رتبه B - نیازمند ۴۰٪ پیش‌پرداخت)',
          badgeClass: 'bg-amber-500/15 border-amber-500 text-amber-500',
          desc: 'پیشنهاد سامانه به طلافروش: دریافت حداقل ۴۰٪ پیش‌پرداخت نقدی و حداکثر ۴ فقره چک صیادی با ضامن معتبر.',
        };
      case 'ORANGE':
        return {
          title: 'وضعیت نارنجی (۲ تا ۴ فقره چک برگشتی)',
          creditScore: '۴۱۰ از ۹۰۰ (ریسک بالا - نیازمند ضامن کاسب)',
          badgeClass: 'bg-orange-500/15 border-orange-500 text-orange-500',
          desc: 'هشدار ریسک: تحویل طلا فقط پس از پاس شدن چک‌ها یا دریافت چک صیادی سفید از ضامن درجه یک.',
        };
      case 'RED':
        return {
          title: 'وضعیت قرمز (بیش از ۱۰ فقره چک برگشتی / مسدود در سامانه صیاد)',
          creditScore: '۱۸۰ از ۹۰۰ (ممنوع‌المعامله چکی)',
          badgeClass: 'bg-rose-500/15 border-rose-500 text-rose-500',
          desc: 'عدم تایید: پذیرش چک از این شناسه صیادی اکیداً توصیه نمی‌شود. تسویه فقط به‌صورت نقدی یا کارت‌خوان/شبا.',
        };
    }
  }, [sayadColorStatus]);

  // Build Official Gold-Stamped WhatsApp Proforma Invoice Text
  const buildWhatsAppProformaText = () => {
    const lines = [
      `✨ *پیش‌فاکتور رسمی طلاکوب — ${tenant.businessName}* ✨`,
      `👤 مدیریت: ${tenant.managerName} | 📍 ${tenant.city}`,
      `📞 تماس و واتساپ گالری: ${tenant.phone}`,
      `────────────────────`,
      `💎 *مشخصات قطعه طلا / نقره:* ${selectedPreset}`,
      `⚖️ عیار و متریال: ${tableCalculation.karatLabel}`,
      `⚖️ وزن خالص: ${itemWeightGrams} گرم`,
      `📈 نرخ هر گرم پایه (با ضریب گالری): ${tableCalculation.effectiveGramRate.toLocaleString('en-US')} تومان`,
      `💰 ارزش طلا/نقره خام: ${tableCalculation.rawGoldPrice.toLocaleString('en-US')} تومان`,
      `🛠️ اجرت ساخت (${makingChargePct}٪): ${tableCalculation.makingChargeAmount.toLocaleString('en-US')} تومان`,
      `📊 سود قانونی اتحادیه (${profitPct}٪): ${tableCalculation.profitAmount.toLocaleString('en-US')} تومان`,
      `🏛️ مالیات بر ارزش افزوده (${taxPct}٪ صرفاً روی اجرت و سود): ${tableCalculation.taxAmount.toLocaleString('en-US')} تومان`,
      `🎁 جعبه مخمل سلطنتی و شناسنامه: ${gemOrPackagingFeeToman.toLocaleString('en-US')} تومان`,
      `────────────────────`,
      `✅ *مبلغ کل قابل پرداخت:* *${tableCalculation.totalInvoiceToman.toLocaleString('en-US')} تومان*`,
      `💵 *پیش‌پرداخت نقدی (${downPaymentPct}٪):* ${tableCalculation.cashDownPaymentToman.toLocaleString('en-US')} تومان`,
      `🟣 *الباقی طی ${checkCount} فقره چک صیادی بنفش:* هر فقره *${tableCalculation.eachCheckAmountToman.toLocaleString('en-US')} تومان*`,
      `🏦 *گواهی استعلام صیادی بانک مرکزی:* شناسه ${sayadIdInput} — ${sayadStatusMeta.title}`,
      isRateLocked
        ? `🔒 *ضمانت قفل قیمت ضدتورم طلا (Inflation-Shield):* فعال با کد ${lockedGuaranteeCode} (${lockedTimestamp})`
        : `⚠️ قفل قیمت ضدتورم: غیرفعال (به نرخ روز تحویل)`,
      `⚖️ *تسهیم شفاف هزینه:* ${partyALabel} (${partyASplitPct}٪): ${tableCalculation.partyAShareToman.toLocaleString('en-US')} تومان | ${partyBLabel} (${100 - partyASplitPct}٪): ${tableCalculation.partyBShareToman.toLocaleString('en-US')} تومان`,
      `────────────────────`,
      `🔖 کد رهگیری سفیر سامانه: ${tenant.visitorRefCode}`,
    ];
    return lines.join('\n');
  };

  const handleSendWhatsAppInvoice = (targetPhone?: string) => {
    const rawPhone = (targetPhone || customerMobile || tenant.phone).replace(/[^0-9]/g, '');
    const normalizedPhone = rawPhone.startsWith('0') ? `98${rawPhone.slice(1)}` : rawPhone;
    const url = `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(buildWhatsAppProformaText())}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // --- ROI Calculation (#deliverables) ---
  const roiMetrics = useMemo(() => {
    const avgInvoiceValueToman = Math.round(roiAvgWeightGrams * rates.gram18kToman * 1.22);
    const netProfitPerInvoiceToman = Math.round(
      roiAvgWeightGrams * rates.gram18kToman * (roiMarginAndOjratPct / 100)
    );
    const monthlyExtraNetProfitToman = netProfitPerInvoiceToman * roiExtraInvoicesPerMonth;
    const annualExtraNetProfitToman = monthlyExtraNetProfitToman * 12;
    const paybackDays =
      monthlyExtraNetProfitToman > 0
        ? Math.max(3, Math.round((selectedRoiLicenseCost / monthlyExtraNetProfitToman) * 30))
        : 30;
    const annualRoiMultiple = (annualExtraNetProfitToman / selectedRoiLicenseCost).toFixed(1);

    return {
      avgInvoiceValueToman,
      netProfitPerInvoiceToman,
      monthlyExtraNetProfitToman,
      annualExtraNetProfitToman,
      paybackDays,
      annualRoiMultiple,
    };
  }, [roiExtraInvoicesPerMonth, roiAvgWeightGrams, roiMarginAndOjratPct, rates.gram18kToman, selectedRoiLicenseCost]);

  // --- Register New Ambassador License Sale (25% Instant Commission) ---
  const handleRegisterAmbassadorSale = () => {
    const gallery = newSaleGalleryName.trim() || tenant.businessName;
    let total = 48_000_000;
    let cashDown = 12_000_000;
    let commission = 12_000_000;
    let title = 'لایسنس تجاری پایه طلایار (۴۸ میلیون تومان - اقساطی صیادی)';

    if (newSalePlan === 'VIP_96M') {
      total = 96_000_000;
      cashDown = 24_000_000;
      commission = 24_000_000;
      title = 'لایسنس VIP دوگانه طلا و نقره + اپ اختصاصی (۹۶ میلیون تومان)';
    } else if (newSalePlan === 'AD_12M') {
      total = 12_000_000;
      cashDown = 12_000_000;
      commission = 3_000_000;
      title = 'بسته تبلیغات سالانه بنکداران طلا و نقره (۱۲ میلیون تومان)';
    }

    const record: AmbassadorSaleRecord = {
      id: `SALE-${Math.floor(1000 + Math.random() * 9000)}`,
      galleryName: gallery,
      city: newSaleCity,
      packageTitle: title,
      totalContractToman: total,
      cashDownPaymentToman: cashDown,
      visitorCommission25Toman: commission,
      visitorRef: ambassadorCode,
      shebaNumber: ambassadorSheba,
      settlementStatus: 'PAID_INSTANT_SHEBA',
      createdAtShamsi: '۱۴۰۵/۰۷/۰۶ - ثبت آنی',
    };

    setAmbassadorSales((prev) => [record, ...prev]);
    setNewSaleGalleryName('');
  };

  const totalAmbassadorCommission = useMemo(
    () => ambassadorSales.reduce((acc, item) => acc + item.visitorCommission25Toman, 0),
    [ambassadorSales]
  );

  // Build Official VIP Invitation Letter Text
  const invitationLetterText = useMemo(() => {
    return [
      `بسمه تعالی`,
      `📜 دعوت‌نامه رسمی تجهیز به سامانه هوشمند وایت‌لیبل طلایار جهانی (VIP)`,
      `محضر مبارک جناب آقای / سرکار خانم: ${tenant.managerName}`,
      `مدیریت محترم: ${tenant.businessName} (${tenant.city})`,
      ``,
      `با سلام و احترام؛`,
      `در راستای تحول دیجیتال صنف طلا، جواهر، سکه، شمش و نقره و حذف کامل خطاهای محاسباتی کاغذ و ماشین‌حساب سنتی سر میز مشتری، بدین‌وسیله سهمیه اختصاصی تجهیز گالری حضرتعالی به «نسخه اختصاصی وایت‌لیبل طلایار با نام و برند ${tenant.businessName}» فعال گردیده است.`,
      ``,
      `💎 مزایای اختصاصی فعال‌شده برای آن مجموعه محترم:`,
      `۱. تابلوی زنده مظنه، انس، طلای ۱۸/۲۱/۲۴ عیار و نقره ۹۲۵ (با کارکرد ۱۰۰٪ آفلاین بدون اینترنت)`,
      `۲. ماشین‌حساب ۰.۱ ثانیه‌ای اجرت، سود اتحادیه و مالیات + صدور پیش‌فاکتور طلاکوب واتساپی با نام ${tenant.businessName}`,
      `۳. موتور تقسیط چک صیادی بنفش + استعلام وضعیت رنگ صیادی و قفل قیمت ضدتورم طلا`,
      `۴. صدور شناسنامه دیجیتال QR اصالت طلا و نقره و استوری‌ساز ۱-کلیکی کالکشن اینستاگرام`,
      `۵. شرایط ویژه پرداخت بدون ریسک: تنها ۱۲ میلیون تومان پیش‌پرداخت + ۲ فقره چک صیادی ۱۸ میلیون تومانی با ضمانت بازگشت ۱۰۰٪ وجه و چک‌ها در صورت عدم افزایش فروش در ماه اول.`,
      ``,
      `کد رهگیری سفیر اعزامی: ${tenant.visitorRefCode} | تلفن هماهنگی: ${tenant.phone}`,
    ].join('\n');
  }, [tenant]);

  return (
    <div className="space-y-12">
      {/* =====================================================================
          SECTION 1: ISOLATED WHITE-LABEL TENANT & 10-SECOND TABLET PREVIEW BAR
          ===================================================================== */}
      <section
        id="tenant-architecture"
        className={`rounded-3xl border p-6 md:p-8 transition-colors ${
          isLight
            ? 'bg-white border-amber-500/40 shadow-sm'
            : 'bg-slate-900/95 border-amber-500/30 shadow-xl'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-amber-500/20">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-500">
              <Building2 className="w-4 h-4" />
              <span>
                {isRtl
                  ? 'معماری ایزوله وایت‌لیبل و پیش‌نمایش ۱۰ ثانیه‌ای روی تبلت ویزیتور (Isolated Multi-Tenant Skin)'
                  : 'Isolated White-Label Tenant & 10-Second Visitor Tablet Preview'}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black mt-1">
              {isRtl
                ? `پوسته اختصاصی فعال: ${tenant.businessName} (${tenant.city})`
                : `Active Tenant Skin: ${tenant.businessName} (${tenant.city})`}
            </h2>
            <p className="text-xs md:text-sm opacity-80 mt-1">
              {isRtl
                ? `شناسه دیتابیس ایزوله (Slug): talayar_isolated_tenant_data_${tenant.slug} — هیچ طلافروشی اطلاعات یا ضرایب قیمت گالری رقیب را نمی‌بیند.`
                : `Isolated Storage Key: talayar_isolated_tenant_data_${tenant.slug} — 100% isolated per jewelry gallery.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() =>
                onSpeak(
                  `پوسته اختصاصی وایت لیبل برای ${tenant.businessName} به مدیریت ${tenant.managerName} در شهر ${tenant.city} فعال است.`
                )
              }
              className="px-3.5 py-2 rounded-xl border border-amber-500/40 text-amber-500 text-xs font-bold hover:bg-amber-500/10 cursor-pointer"
            >
              🔊 {isRtl ? 'روخوانی صوتی برند' : 'Speak Brand'}
            </button>
            <button
              onClick={handleCopyTenantShareLink}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>
                {copiedUrlToast
                  ? isRtl
                    ? '✅ لینک اختصاصی با پارامتر URL کپی شد!'
                    : '✅ Custom URL Copied!'
                  : isRtl
                  ? 'کپی لینک اختصاصی (?tenant=...&manager=...)'
                  : 'Copy Custom Tenant URL'}
              </span>
            </button>
          </div>
        </div>

        {/* 10-Second Live Customization Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 mt-6">
          <div>
            <label className="block text-xs font-bold mb-1 opacity-85">
              {isRtl ? '۱. نام گالری طلا / نقره (?tenant=)' : '1. Gallery Name (?tenant=)'}
            </label>
            <input
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="مثلاً: گالری طلا و جواهر مظفریان"
              className={`w-full px-3 py-2 rounded-xl border text-xs font-bold ${
                isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1 opacity-85">
              {isRtl ? '۲. نام مدیر گالری (?manager=)' : '2. Manager Name (?manager=)'}
            </label>
            <input
              type="text"
              value={draftManager}
              onChange={(e) => setDraftManager(e.target.value)}
              placeholder="مثلاً: حاج علی مظفریان"
              className={`w-full px-3 py-2 rounded-xl border text-xs font-bold ${
                isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1 opacity-85">
              {isRtl ? '۳. شهر / بازار (?city=)' : '3. City / Bazaar (?city=)'}
            </label>
            <input
              type="text"
              value={draftCity}
              onChange={(e) => setDraftCity(e.target.value)}
              placeholder="مثلاً: تهران - بازار بزرگ"
              className={`w-full px-3 py-2 rounded-xl border text-xs font-bold ${
                isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1 opacity-85">
              {isRtl ? '۴. شماره واتساپ (?phone=)' : '4. WhatsApp Phone (?phone=)'}
            </label>
            <input
              type="text"
              value={draftPhone}
              onChange={(e) => setDraftPhone(e.target.value)}
              placeholder="0912..."
              className={`w-full px-3 py-2 rounded-xl border text-xs font-bold font-tabular ${
                isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1 opacity-85">
              {isRtl ? '۵. ضریب قیمت تابلو (?multiplier=)' : '5. Price Multiplier'}
            </label>
            <input
              type="number"
              step="0.01"
              min="0.85"
              max="1.25"
              value={draftMultiplier}
              onChange={(e) => setDraftMultiplier(Number(e.target.value))}
              className={`w-full px-3 py-2 rounded-xl border text-xs font-bold font-tabular ${
                isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1 opacity-85">
              {isRtl ? '۶. کد سفیر ویزیتور (?ref=)' : '6. Visitor Code (?ref=)'}
            </label>
            <input
              type="text"
              value={draftRef}
              onChange={(e) => setDraftRef(e.target.value)}
              placeholder="VIP-104"
              className={`w-full px-3 py-2 rounded-xl border text-xs font-bold font-tabular ${
                isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'
              }`}
            />
          </div>
        </div>

        <div className="mt-3.5 grid grid-cols-1 md:grid-cols-4 gap-3.5 items-end">
          <div className="md:col-span-3">
            <label className="block text-xs font-bold mb-1 opacity-85">
              {isRtl ? 'شعار اختصاصی گالری در سربرگ و پیش‌فاکتور طلاکوب:' : 'Custom Gallery Slogan:'}
            </label>
            <input
              type="text"
              value={draftSlogan}
              onChange={(e) => setDraftSlogan(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold ${
                isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'
              }`}
            />
          </div>

          <button
            onClick={handleApplyTenantCustomization}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs md:text-sm cursor-pointer transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>
              {isRtl
                ? 'اعمال آنی در کل برنامه (۱۰ ثانیه)'
                : 'Apply Instant White-Label Skin'}
            </span>
          </button>
        </div>

        {/* Saved Isolated Tenants Switcher on Visitor Tablet */}
        {savedTenantsList.length > 0 && (
          <div className="mt-4 pt-4 border-t border-amber-500/20 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold opacity-75">
              {isRtl
                ? '🗂️ گالری‌های ذخیره‌شده ایزوله روی این تبلت (جابجایی ۱-کلیکی بدون تداخل اطلاعات):'
                : '🗂️ Isolated Saved Galleries on Tablet:'}
            </span>
            {savedTenantsList.map((item) => (
              <button
                key={item.slug}
                onClick={() => handleSwitchSavedTenant(item.slug)}
                className={`px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer transition-colors ${
                  item.slug === tenant.slug
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : isLight
                    ? 'bg-slate-100 border-slate-300 text-slate-700 hover:border-amber-500'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-amber-500'
                }`}
              >
                {item.businessName} ({item.city})
              </button>
            ))}
          </div>
        )}

        {/* 4 Security Locks: Visitor Temporary Demo vs Permanent Commercial License */}
        <div
          className={`mt-6 p-5 rounded-2xl border ${
            isLight
              ? 'bg-amber-50/70 border-amber-300'
              : 'bg-slate-950/90 border-amber-500/30'
          }`}
        >
          <div className="flex items-center gap-2 font-black text-sm text-amber-500 mb-3">
            <Lock className="w-4 h-4" />
            <span>
              {isRtl
                ? '۴ قفل امنیتی تفاوت «نسخه دموی موقت ویزیتور» با «لایسنس تجاری دائمی طلافروش» (چرا مشتری نمی‌تواند از لینک دمو رایگان استفاده دائمی کند؟)'
                : '4 Security Locks: Temporary Visitor Demo vs. Permanent Commercial Jeweler License'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs leading-relaxed">
            <div className="p-3.5 rounded-xl border border-amber-500/20 bg-black/5">
              <div className="font-bold text-amber-500 mb-1">
                🔒 ۱. واترمارک فروش و تبلیغات در نسخه دمو
              </div>
              <p className="opacity-85">
                در نسخه دموی ویزیتور، بنرهای فروش لایسنس، راهنمای بازاریابان و تبلیغات سایر همکاران صنف نمایش داده می‌شود که در نسخه تجاری خریداری‌شده ۱۰۰٪ حذف می‌گردد.
              </p>
            </div>
            <div className="p-3.5 rounded-xl border border-amber-500/20 bg-black/5">
              <div className="font-bold text-amber-500 mb-1">
                🔒 ۲. قفل بودن نرخ پایه و کاتالوگ در سرور
              </div>
              <p className="opacity-85">
                در نسخه دمو تغییرات فقط روی مرورگر همان دستگاه است؛ اما در نسخه تجاری، پنل ادمین اختصاصی روی سرور ابری با رمز عبور مدیر گالری برای تمام گوشی‌های مشتریان فعال می‌شود.
              </p>
            </div>
            <div className="p-3.5 rounded-xl border border-amber-500/20 bg-black/5">
              <div className="font-bold text-amber-500 mb-1">
                🔒 ۳. حک شدن کد سفیر ویزیتور (?ref={tenant.visitorRefCode})
              </div>
              <p className="opacity-85">
                در پایین تمام پیش‌فاکتورهای واتساپی و دعوت‌نامه‌های نسخه دمو، کد رهگیری سفیر ({tenant.visitorRefCode}) و نشان «نسخه پیش‌نمایش آزمایشی» درج شده است.
              </p>
            </div>
            <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <div className="font-bold text-emerald-500 mb-1">
                🔓 ۴. تحویل نسخه خالص و ایزوله پس از تسویه
              </div>
              <p className="opacity-85">
                بلافاصله پس از پرداخت پیش‌پرداخت (۱۲ میلیون تومان)، دامنه اختصاصی، APK اندروید و PWA خالص بدون هیچ‌گونه نامی از ویزیتور تحویل مدیر گالری می‌گردد.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 2: 0.1s CUSTOMER TABLE CALCULATOR + PURPLE SAYAD CHECK + INFLATION LOCK
          ===================================================================== */}
      <section
        id="table-calculator"
        className={`rounded-3xl border p-6 md:p-8 transition-colors ${
          isLight
            ? 'bg-white border-slate-200 shadow-sm'
            : 'bg-slate-900/95 border-slate-800 shadow-xl'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-amber-500/20">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-500">
              <Calculator className="w-4 h-4" />
              <span>
                {isRtl
                  ? 'ماشین‌حساب ۰.۱ ثانیه‌ای سر میز مشتری + تقسیط چک صیادی بنفش + قفل ضدتورم طلا'
                  : '0.1s Customer Table Calculator + Purple Sayad Check Installments + Inflation Lock'}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black mt-1">
              {isRtl
                ? `میز فروش دیجیتال و صدور پیش‌فاکتور طلاکوب — ${tenant.businessName}`
                : `Digital Sales Desk & Gold-Stamped Proforma — ${tenant.businessName}`}
            </h2>
            <p className="text-xs md:text-sm opacity-80 mt-1">
              {isRtl
                ? 'حذف کامل ماشین‌حساب دستی و کاغذبازی سنتی سر میز فروش؛ محاسبه آنی وزن، عیار، اجرت، سود، مالیات و تقسیط صیادی.'
                : 'Eliminate paper and manual calculators at the sales counter with instant 0.1s pricing and Sayad check scheduling.'}
            </p>
          </div>

          {/* Quick Gold & Silver Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              {
                label: 'سرویس عروس طلا ۱۸ عیار (۲۸.۵ گرم)',
                metal: 'GOLD_18K' as const,
                w: 28.5,
                ojrat: 16,
              },
              {
                label: 'ست ۶ عددی النگوی آینه‌ای ۲۱ عیار (۳۶ گرم)',
                metal: 'GOLD_21K' as const,
                w: 36,
                ojrat: 11,
              },
              {
                label: 'شمش ۲۴ عیار سوئیسی پلمپ (۱۰ گرم)',
                metal: 'GOLD_24K' as const,
                w: 10,
                ojrat: 3.5,
              },
              {
                label: 'سرویس چای‌خوری نقره ۹۲۵ قلم‌زنی (۸۵۰ گرم)',
                metal: 'SILVER_925' as const,
                w: 850,
                ojrat: 24,
              },
            ].map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setSelectedPreset(p.label);
                  setItemMetalType(p.metal);
                  setItemWeightGrams(p.w);
                  setMakingChargePct(p.ojrat);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
                  selectedPreset === p.label
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : isLight
                    ? 'bg-slate-100 border-slate-300 text-slate-800 hover:border-amber-500'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-amber-500'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Left 7 Columns: Live Inputs, Sayad Check Inquiry, Inflation Shield & Cost Split */}
          <div className="lg:col-span-7 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-bold mb-1">
                  {isRtl ? 'نوع فلز و عیار استاندارد:' : 'Metal & Karat:'}
                </label>
                <select
                  value={itemMetalType}
                  onChange={(e) => setItemMetalType(e.target.value as any)}
                  className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold ${
                    isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'
                  }`}
                >
                  <option value="GOLD_18K">طلای ۱۸ عیار (۷۵۰ اتحادیه)</option>
                  <option value="GOLD_21K">طلای ۲۱ عیار (۸۷۵ عربی/مفتولی)</option>
                  <option value="GOLD_24K">شمش/طلای ۲۴ عیار خالص (۹۹۹.۹)</option>
                  <option value="SILVER_925">نقره ۹۲۵ استرلینگ / ظروف قلم‌زنی</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  {isRtl ? 'وزن خالص ترازو (گرم):' : 'Net Weight (Grams):'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  value={itemWeightGrams}
                  onChange={(e) => setItemWeightGrams(Math.max(0.1, Number(e.target.value)))}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm font-black font-tabular ${
                    isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  {isRtl ? 'اجرت ساخت کارگاه (%):' : 'Making Charge (%):'}
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="60"
                  value={makingChargePct}
                  onChange={(e) => setMakingChargePct(Math.max(0, Number(e.target.value)))}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm font-black font-tabular ${
                    isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  {isRtl ? 'سود قانونی طلافروش (%):' : 'Jeweler Profit (%):'}
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="20"
                  value={profitPct}
                  onChange={(e) => setProfitPct(Math.max(0, Number(e.target.value)))}
                  className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold font-tabular ${
                    isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  {isRtl ? 'مالیات ارزش افزوده (صرفاً اجرت+سود %):' : 'VAT on Profit+Ojrat (%):'}
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="15"
                  value={taxPct}
                  onChange={(e) => setTaxPct(Math.max(0, Number(e.target.value)))}
                  className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold font-tabular ${
                    isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  {isRtl ? 'گوهر/جعبه سلطنتی و شناسنامه (تومان):' : 'Gem/Box & Cert Fee (Toman):'}
                </label>
                <input
                  type="number"
                  step="100000"
                  min="0"
                  value={gemOrPackagingFeeToman}
                  onChange={(e) => setGemOrPackagingFeeToman(Math.max(0, Number(e.target.value)))}
                  className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold font-tabular ${
                    isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'
                  }`}
                />
              </div>
            </div>

            {/* Purple Sayad Check Installment Controls */}
            <div
              className={`p-4 rounded-2xl border ${
                isLight ? 'bg-purple-50/60 border-purple-300' : 'bg-purple-950/20 border-purple-500/30'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 font-bold text-sm text-purple-400">
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {isRtl
                      ? '🟣 موتور تقسیط چک صیادی بنفش + استعلام زنده بانک مرکزی'
                      : '🟣 Purple Sayad Check Installment & Central Bank Inquiry'}
                  </span>
                </div>
                <span className="text-xs font-bold font-tabular">
                  پیش‌پرداخت نقدی: {downPaymentPct}٪ ({tableCalculation.cashDownPaymentToman.toLocaleString('en-US')} تومان)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">
                    {isRtl
                      ? `درصد پیش‌پرداخت نقدی (${downPaymentPct}٪):`
                      : `Cash Down Payment (${downPaymentPct}%):`}
                  </label>
                  <input
                    type="range"
                    min={20}
                    max={70}
                    step={5}
                    value={downPaymentPct}
                    onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">
                    {isRtl
                      ? `تعداد فقره چک صیادی بنفش (${checkCount} ماهه):`
                      : `Number of Purple Sayad Checks (${checkCount}):`}
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[3, 4, 6, 9, 12].map((cnt) => (
                      <button
                        key={cnt}
                        onClick={() => setCheckCount(cnt)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                          checkCount === cnt
                            ? 'bg-purple-600 text-white border-purple-500'
                            : isLight
                            ? 'bg-white border-slate-300 text-slate-800'
                            : 'bg-slate-950 border-slate-800 text-slate-300'
                        }`}
                      >
                        {cnt} چک
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Central Bank Sayad Color Status Simulator */}
              <div className="mt-4 pt-4 border-t border-purple-500/20">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <label className="text-xs font-bold">
                    {isRtl
                      ? 'شناسه ۱۶ رقمی چک صیادی بنفش جهت استعلام وضعیت رنگ بانک مرکزی:'
                      : '16-Digit Sayad Check ID for Central Bank Inquiry:'}
                  </label>
                  <div className="flex items-center gap-1.5">
                    {(
                      [
                        { id: 'WHITE', label: '⚪ سفید' },
                        { id: 'YELLOW', label: '🟡 زرد' },
                        { id: 'ORANGE', label: '🟠 نارنجی' },
                        { id: 'RED', label: '🔴 قرمز' },
                      ] as const
                    ).map((st) => (
                      <button
                        key={st.id}
                        onClick={() => setSayadColorStatus(st.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                          sayadColorStatus === st.id
                            ? 'bg-amber-500 text-slate-950 border-amber-500'
                            : isLight
                            ? 'bg-white border-slate-300'
                            : 'bg-slate-900 border-slate-700'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    maxLength={16}
                    value={sayadIdInput}
                    onChange={(e) => setSayadIdInput(e.target.value)}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold font-tabular flex-1 ${
                      isLight ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-800'
                    }`}
                  />
                  <div className={`px-3.5 py-2 rounded-xl border text-xs font-bold ${sayadStatusMeta.badgeClass}`}>
                    {sayadStatusMeta.title} — امتیاز: {sayadStatusMeta.creditScore}
                  </div>
                </div>
                <p className="text-xs opacity-80 mt-1.5">{sayadStatusMeta.desc}</p>
              </div>
            </div>

            {/* Inflation-Shield Guarantee + Cost Split Slider */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Inflation-Shield Guarantee Button */}
              <div
                className={`p-4 rounded-2xl border flex flex-col justify-between ${
                  isRateLocked
                    ? 'bg-emerald-500/10 border-emerald-500/40'
                    : isLight
                    ? 'bg-slate-50 border-slate-300'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-500 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      {isRtl
                        ? 'قفل ضمانت قیمت ضدتورم طلا (Inflation-Shield)'
                        : 'Inflation-Shield Gold Rate Lock'}
                    </span>
                    <span className="text-xs font-tabular font-bold opacity-75">
                      {lockedGuaranteeCode}
                    </span>
                  </div>
                  <p className="text-xs opacity-85 mt-1.5 leading-relaxed">
                    {isRtl
                      ? 'با فعال‌سازی این قفل، نرخ هر گرم طلای ۱۸ عیار از لحظه واریز بیعانه تا روز تحویل نهایی سفارش ساخت، در برابر هرگونه جهش انس و دلار ۱۰۰٪ ثابت و تضمین می‌شود.'
                      : 'Locks the live 18K gram gold price from deposit time until workshop delivery.'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const nextState = !isRateLocked;
                    setIsRateLocked(nextState);
                    if (nextState) {
                      setLockedTimestamp(
                        `ثبت در نرخ ${tableCalculation.effectiveGramRate.toLocaleString('en-US')} تومان`
                      );
                      setLockedGuaranteeCode(`INF-750-${Math.floor(1000 + Math.random() * 9000)}`);
                    }
                  }}
                  className={`mt-3 w-full py-2.5 px-3 rounded-xl font-bold text-xs cursor-pointer transition-colors ${
                    isRateLocked
                      ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                      : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                  }`}
                >
                  {isRateLocked
                    ? '🔒 گواهی قفل نرخ ضدتورم فعال است (کلیک برای تغییر)'
                    : '🔓 فعال‌سازی قفل ضمانت قیمت ضدتورم طلا'}
                </button>
              </div>

              {/* Transparent Cost Split Slider */}
              <div
                className={`p-4 rounded-2xl border flex flex-col justify-between ${
                  isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-amber-500">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      {isRtl
                        ? 'تسهیم و تقسیم شفاف هزینه (خانواده عروس و داماد / شرکا)'
                        : 'Transparent Cost Split Slider'}
                    </span>
                    <span className="font-tabular">
                      {partyASplitPct}٪ / {100 - partyASplitPct}٪
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={partyASplitPct}
                    onChange={(e) => setPartyASplitPct(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer mt-2"
                  />
                </div>

                <div className="space-y-1.5 text-xs font-tabular mt-2">
                  <div className="flex justify-between">
                    <span className="opacity-80">{partyALabel} ({partyASplitPct}٪):</span>
                    <strong className="text-amber-500">
                      {tableCalculation.partyAShareToman.toLocaleString('en-US')} تومان
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-80">{partyBLabel} ({100 - partyASplitPct}٪):</span>
                    <strong className="text-emerald-500">
                      {tableCalculation.partyBShareToman.toLocaleString('en-US')} تومان
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Live Gold-Stamped Proforma Invoice & Check Schedule Table */}
          <div
            className={`lg:col-span-5 rounded-2xl border-2 border-amber-500/50 p-5 flex flex-col justify-between ${
              isLight ? 'bg-amber-50/40' : 'bg-slate-950'
            }`}
          >
            <div>
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                <div>
                  <div className="text-xs font-bold text-amber-500">
                    پیش‌فاکتور رسمی طلاکوب (محاسبه در ۰.۱ ثانیه)
                  </div>
                  <div className="font-black text-base mt-0.5">{tenant.businessName}</div>
                  <div className="text-xs opacity-75">
                    مدیریت: {tenant.managerName} | {tenant.city}
                  </div>
                </div>
                <div className="text-left font-tabular text-xs">
                  <div className="font-bold text-emerald-500">کد سفیر: {tenant.visitorRefCode}</div>
                  <div className="opacity-70">{tenant.phone}</div>
                </div>
              </div>

              {/* Customer Name & Phone Input for Invoice */}
              <div className="grid grid-cols-2 gap-2 my-3">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="نام خریدار محترم"
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-800'
                  }`}
                />
                <input
                  type="text"
                  value={customerMobile}
                  onChange={(e) => setCustomerMobile(e.target.value)}
                  placeholder="موبایل واتساپ خریدار"
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold font-tabular ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-800'
                  }`}
                />
              </div>

              {/* Breakdown Rows */}
              <div className="space-y-1.5 text-xs font-tabular border-b border-amber-500/20 pb-3">
                <div className="flex justify-between">
                  <span className="opacity-75">قطعه انتخابی:</span>
                  <span className="font-bold">{selectedPreset}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">وزن و عیار:</span>
                  <span className="font-bold">
                    {itemWeightGrams} گرم — {tableCalculation.karatLabel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">نرخ پایه هر گرم (با ضریب گالری):</span>
                  <span className="font-bold">
                    {tableCalculation.effectiveGramRate.toLocaleString('en-US')} تومان
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">ارزش طلا/نقره خام:</span>
                  <span className="font-bold">
                    {tableCalculation.rawGoldPrice.toLocaleString('en-US')} تومان
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">اجرت ساخت ({makingChargePct}٪):</span>
                  <span className="font-bold">
                    {tableCalculation.makingChargeAmount.toLocaleString('en-US')} تومان
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">سود قانونی اتحادیه ({profitPct}٪):</span>
                  <span className="font-bold">
                    {tableCalculation.profitAmount.toLocaleString('en-US')} تومان
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">مالیات بر ارزش افزوده ({taxPct}٪ اجرت+سود):</span>
                  <span className="font-bold">
                    {tableCalculation.taxAmount.toLocaleString('en-US')} تومان
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-amber-500/20 text-sm font-black text-amber-500">
                  <span>جمع کل فاکتور رسمی:</span>
                  <span>{tableCalculation.totalInvoiceToman.toLocaleString('en-US')} تومان</span>
                </div>
                <div className="flex justify-between text-emerald-500 font-bold">
                  <span>پیش‌پرداخت نقدی ({downPaymentPct}٪):</span>
                  <span>{tableCalculation.cashDownPaymentToman.toLocaleString('en-US')} تومان</span>
                </div>
              </div>

              {/* Purple Sayad Check Due Dates Table */}
              <div className="mt-3">
                <div className="text-xs font-bold mb-1.5 text-purple-400">
                  جدول سررسید {checkCount} فقره چک صیادی بنفش (الباقی:{' '}
                  {tableCalculation.remainingInstallmentToman.toLocaleString('en-US')} تومان):
                </div>
                <div className="max-h-36 overflow-y-auto rounded-xl border border-purple-500/20 text-xs font-tabular">
                  <table className="w-full text-right">
                    <thead className="bg-purple-500/10 text-purple-400">
                      <tr>
                        <th className="py-1.5 px-2">#</th>
                        <th className="py-1.5 px-2">شناسه صیادی</th>
                        <th className="py-1.5 px-2">سررسید شمسی</th>
                        <th className="py-1.5 px-2">مبلغ چک (تومان)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableCalculation.checksSchedule.map((row) => (
                        <tr key={row.checkNumber} className="border-t border-purple-500/10">
                          <td className="py-1 px-2 font-bold">{row.checkNumber}</td>
                          <td className="py-1 px-2 opacity-80">{row.serialCode}</td>
                          <td className="py-1 px-2">{row.dueDateShamsi}</td>
                          <td className="py-1 px-2 font-bold text-amber-500">
                            {row.amountToman.toLocaleString('en-US')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 1-Click WhatsApp & Print Actions */}
            <div className="mt-4 pt-3 border-t border-amber-500/20 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => handleSendWhatsAppInvoice(customerMobile)}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>ارسال ۱-کلیکی به واتساپ مشتری</span>
                </button>
                <button
                  onClick={() => handleSendWhatsAppInvoice(tenant.phone)}
                  className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>شلیک فاکتور به واتساپ مدیر گالری</span>
                </button>
              </div>
              <button
                onClick={() => window.print()}
                className="w-full py-2 rounded-xl border border-amber-500/40 text-amber-500 hover:bg-amber-500/10 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>چاپ رسمی پیش‌فاکتور طلاکوب با مهر گالری و گواهی صیادی</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 3: DELIVERABLES & LIVE ROI CALCULATOR (#deliverables)
          ===================================================================== */}
      <section
        id="deliverables"
        className={`rounded-3xl border p-6 md:p-8 transition-colors ${
          isLight
            ? 'bg-white border-slate-200 shadow-sm'
            : 'bg-slate-900/95 border-slate-800 shadow-xl'
        }`}
      >
        <div className="pb-6 border-b border-amber-500/20">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-500">
            <Award className="w-4 h-4" />
            <span>
              {isRtl
                ? 'بخش سوم (#deliverables) — بازگشت سرمایه تضمینی ویژه صاحبان گالری طلا، سکه و نقره'
                : 'Section 3 (#deliverables) — Guaranteed ROI & Deliverables for Gold & Silver Gallery Owners'}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black mt-1">
            {isRtl
              ? 'صاحبان صنف طلا و نقره در صورت خرید برنامه دقیقاً چه چیزی به دست می‌آورند؟'
              : 'What Exactly Do Gold & Silver Gallery Owners Receive Upon Purchasing the License?'}
          </h2>
        </div>

        {/* Live Interactive ROI Calculator */}
        <div
          className={`mt-6 p-6 rounded-2xl border-2 border-emerald-500/40 ${
            isLight ? 'bg-emerald-50/50' : 'bg-emerald-950/15'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-base md:text-lg font-black text-emerald-500 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                <span>
                  ماشین‌حساب زنده بازگشت سرمایه (ROI Calculator) — چرا فقط ۱ تا ۲ فاکتور اضافه کل هزینه سالانه را برمی‌گرداند؟
                </span>
              </h3>
              <p className="text-xs opacity-80 mt-0.5">
                اسلایدرها را تغییر دهید تا مدیر گالری به چشم ببیند سود خالص تنها ۲ سرویس طلا یا نقره در ماه چند برابر کل لایسنس برنامه است:
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedRoiLicenseCost(48_000_000)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                  selectedRoiLicenseCost === 48_000_000
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'border-slate-500/40 opacity-75'
                }`}
              >
                لایسنس پایه (۴۸ میلیون)
              </button>
              <button
                onClick={() => setSelectedRoiLicenseCost(96_000_000)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                  selectedRoiLicenseCost === 96_000_000
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : 'border-slate-500/40 opacity-75'
                }`}
              >
                لایسنس VIP کامل (۹۶ میلیون)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold mb-1">
                تعداد فاکتور اضافه در ماه (با استوری‌ساز و فروش چکی صیادی):{' '}
                <strong className="text-emerald-500 font-tabular">{roiExtraInvoicesPerMonth} فاکتور در ماه</strong>
              </label>
              <input
                type="range"
                min={1}
                max={15}
                step={1}
                value={roiExtraInvoicesPerMonth}
                onChange={(e) => setRoiExtraInvoicesPerMonth(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">
                میانگین وزن هر فاکتور سرویس طلا / شمش:{' '}
                <strong className="text-emerald-500 font-tabular">{roiAvgWeightGrams} گرم</strong>
              </label>
              <input
                type="range"
                min={5}
                max={80}
                step={1}
                value={roiAvgWeightGrams}
                onChange={(e) => setRoiAvgWeightGrams(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">
                مجموع سود طلافروش + سهم اجرت گالری:{' '}
                <strong className="text-emerald-500 font-tabular">{roiMarginAndOjratPct}٪</strong>
              </label>
              <input
                type="range"
                min={7}
                max={28}
                step={1}
                value={roiMarginAndOjratPct}
                onChange={(e) => setRoiMarginAndOjratPct(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5 font-tabular">
            <div className="p-4 rounded-xl bg-black/10 border border-emerald-500/20">
              <div className="text-xs opacity-75">سود خالص هر ۱ فاکتور اضافه:</div>
              <div className="text-lg font-black text-amber-500 mt-1">
                {roiMetrics.netProfitPerInvoiceToman.toLocaleString('en-US')} تومان
              </div>
            </div>
            <div className="p-4 rounded-xl bg-black/10 border border-emerald-500/20">
              <div className="text-xs opacity-75">سود خالص اضافه ماهانه گالری:</div>
              <div className="text-lg font-black text-emerald-500 mt-1">
                {roiMetrics.monthlyExtraNetProfitToman.toLocaleString('en-US')} تومان
              </div>
            </div>
            <div className="p-4 rounded-xl bg-black/10 border border-emerald-500/20">
              <div className="text-xs opacity-75">سود خالص اضافه یک‌ساله گالری:</div>
              <div className="text-lg font-black text-emerald-400 mt-1">
                {roiMetrics.annualExtraNetProfitToman.toLocaleString('en-US')} تومان
              </div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500">
              <div className="text-xs font-bold">ضریب بازگشت سرمایه سالانه:</div>
              <div className="text-lg font-black text-emerald-400 mt-1">
                {roiMetrics.annualRoiMultiple} برابر کل هزینه لایسنس (تسویه در {roiMetrics.paybackDays} روز)
              </div>
            </div>
          </div>
        </div>

        {/* 8 Tangible Deliverable Cards with Rial/Toman Valuation */}
        <div className="mt-8">
          <h3 className="text-base font-black mb-4 text-amber-500">
            📦 ۸ ماژول و دستاورد ملموس تحویلی به گالری طلا و نقره (به ارزش واقعی ۳۴۰ میلیون تومان):
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                num: '۰۱',
                title: 'تابلوی زنده مظنه، انس، سکه و نقره + حالت تلویزیون (TV Mode)',
                val: 'ارزش مجزا: ۴۵ میلیون تومان',
                desc: 'نمایش تمام‌صفحه روی تلویزیون مغازه با برند گالری و کارکرد ۱۰۰٪ آفلاین با کش سرویس‌ورکر.',
              },
              {
                num: '۰۲',
                title: 'ماشین‌حساب ۰.۱ ثانیه‌ای اجرت، سود ۷٪ و مالیات ۱۰٪ + فاکتور طلاکوب واتساپی',
                val: 'ارزش مجزا: ۵۰ میلیون تومان',
                desc: 'حذف کامل خطای محاسباتی شاگرد مغازه و ارسال آنی پیش‌فاکتور رسمی با عیار و وزن دقیق به واتساپ مشتری.',
              },
              {
                num: '۰۳',
                title: 'موتور تقسیط چک صیادی بنفش + استعلام رنگ صیادی و قفل بیعانه طلا',
                val: 'ارزش مجزا: ۴۵ میلیون تومان',
                desc: 'محاسبه اقساط ۳ تا ۱۲ ماهه با سررسید شمسی، استعلام خوش‌حسابی و قفل ضدتورم نرخ طلا.',
              },
              {
                num: '۰۴',
                title: 'سیستم صدور شناسنامه دیجیتال QR اصالت طلا، جواهر و ظروف نقره',
                val: 'ارزش مجزا: ۴۰ میلیون تومان',
                desc: 'صدور کارت گارانتی و شناسنامه عیار با بارکد QR قابل اسکن توسط دوربین موبایل مشتری.',
              },
              {
                num: '۰۵',
                title: 'ماشین‌حساب تخصصی تعویض طلای کهنه و شکسته با کسر عیار آزمایشگاه',
                val: 'ارزش مجزا: ۳۵ میلیون تومان',
                desc: 'محاسبه دقیق مابه‌التفاوت طلای کهنه مشتری با سرویس طلای نو بدون ۱ ریال اختلاف حساب.',
              },
              {
                num: '۰۶',
                title: 'استودیو ۱-کلیکی ساخت استوری فول‌اچ‌دی اینستاگرام کالکشن جدید',
                val: 'ارزش مجزا: ۴۰ میلیون تومان',
                desc: 'تولید تصویر استوری ۱۰۸۰×۱۹۲۰ با قیمت روز، وزن، اجرت و لوگوی گالری بدون نیاز به ادمین گرافیست.',
              },
              {
                num: '۰۷',
                title: 'استودیو اختصاصی نقره ۹۲۵، ظروف قلم‌زنی و هاب تبلیغات بنکداران',
                val: 'ارزش مجزا: ۳۵ میلیون تومان',
                desc: 'پوشش کامل ظروف نقره اصفهان، شمش نقره ساچمه و دیوار آگهی‌های تجاری همکاران صنف.',
              },
              {
                num: '۰۸',
                title: 'اپلیکیشن موبایل دوگانه (PWA آیفون/اندروید + سورس نیتیو Kotlin APK)',
                val: 'ارزش مجزا: ۵۰ میلیون تومان',
                desc: 'نصب آنی روی گوشی مشتریان VIP گالری بدون نیاز به فیلترشکن یا اپ‌استور.',
              },
            ].map((card) => (
              <div
                key={card.num}
                className={`p-4 rounded-2xl border flex flex-col justify-between ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-2">
                    <span className="text-amber-500 font-tabular">ماژول {card.num}</span>
                    <span className="text-emerald-500 font-tabular">{card.val}</span>
                  </div>
                  <h4 className="font-bold text-sm leading-snug">{card.title}</h4>
                  <p className="text-xs opacity-80 mt-2 leading-relaxed">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table: Traditional Gold Shop vs TalaYar Smart Gallery */}
        <div className="mt-8 overflow-x-auto">
          <h3 className="text-base font-black mb-3">
            ⚖️ جدول مقایسه «طلافروشی سنتی با کاغذ و ماشین‌حساب» در برابر «گالری مجهز به سامانه هوشمند طلایار»:
          </h3>
          <table className="w-full text-xs md:text-sm border-collapse rounded-2xl overflow-hidden">
            <thead>
              <tr className="bg-amber-500 text-slate-950 font-black">
                <th className="p-3 text-right">شاخص عملیاتی در طلافروشی و نقره‌فروشی</th>
                <th className="p-3 text-right">روش سنتی (کاغذ، تخته و ماشین‌حساب دستی)</th>
                <th className="p-3 text-right">گالری مجهز به سامانه هوشمند طلایار VIP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              <tr>
                <td className="p-3 font-bold">اعلام قیمت سرویس طلا سر میز مشتری</td>
                <td className="p-3 text-rose-400">۲ تا ۳ دقیقه ضرب و تقسیم دستی با احتمال خطای شاگرد</td>
                <td className="p-3 text-emerald-500 font-bold">در ۰.۱ ثانیه با تفکیک شفاف خام، اجرت، سود و مالیات</td>
              </tr>
              <tr>
                <td className="p-3 font-bold">مشتریانی که می‌گویند «برم دورامو بزنم برگردم»</td>
                <td className="p-3 text-rose-400">برگه‌ای دست‌نویس بدون نام که ۸۰٪ مشتریان فراموش می‌کنند</td>
                <td className="p-3 text-emerald-500 font-bold">ارسال آنی پیش‌فاکتور طلاکوب با عکس، وزن و قفل بیعانه به واتساپ مشتری</td>
              </tr>
              <tr>
                <td className="p-3 font-bold">فروش اقساطی سرویس عروس و شمش</td>
                <td className="p-3 text-rose-400">ترس از چک برگشتی و محاسبه دستی سررسیدها</td>
                <td className="p-3 text-emerald-500 font-bold">استعلام آنی رنگ چک صیادی بانک مرکزی + جدول خودکار اقساط</td>
              </tr>
              <tr>
                <td className="p-3 font-bold">اعتمادسازی برای اصالت عیار طلا و نقره</td>
                <td className="p-3 text-rose-400">فاکتور کاغذی که با شستشو یا گم شدن از بین می‌رود</td>
                <td className="p-3 text-emerald-500 font-bold">شناسنامه دیجیتال دائمی با بارکد QR و دفترچه پس‌انداز طلا</td>
              </tr>
              <tr>
                <td className="p-3 font-bold">تولید محتوای قیمت روز برای اینستاگرام</td>
                <td className="p-3 text-rose-400">نیاز به گرافیست و زمان‌بر بودن تغییر قیمت هر قطعه</td>
                <td className="p-3 text-emerald-500 font-bold">ساخت ۱-کلیکی استوری HD با قیمت لحظه‌ای و لوگوی گالری</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* =====================================================================
          SECTION 4: VISITOR PLAYBOOK & 3-PART GOLDEN FORMULA (#visitor-playbook & #golden-formula)
          ===================================================================== */}
      <section
        id="visitor-playbook"
        className={`rounded-3xl border p-6 md:p-8 transition-colors ${
          isLight
            ? 'bg-white border-amber-500/40 shadow-sm'
            : 'bg-slate-900/95 border-amber-500/30 shadow-xl'
        }`}
      >
        <div id="golden-formula" className="pb-6 border-b border-amber-500/20">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-500">
            <Briefcase className="w-4 h-4" />
            <span>
              {isRtl
                ? 'بخش چهارم (#visitor-playbook & #golden-formula) — راهنمای عملی ویزیتورها و فرمول طلایی فروش قطعی'
                : 'Section 4 (#visitor-playbook & #golden-formula) — Visitor Playbook & 3-Part Golden Sales Formula'}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black mt-1">
            {isRtl
              ? 'راهکار گام‌به‌گام ویزیتورها پشت درِ طلافروشی + فرمول طلایی ۳گانه فروش قطعی از هفته اول'
              : 'Step-by-Step Visitor Playbook & 3-Part Golden Formula for Guaranteed First-Week Sales'}
            </h2>
        </div>

        {/* 60-Second Pre-Entry Checklist outside the Gold Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          <div
            className={`lg:col-span-5 p-5 rounded-2xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-sm md:text-base text-amber-500 flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                <span>چک‌لیست ۶۰ ثانیه‌ای ویزیتور پشت درِ گالری طلا (قبل از ورود)</span>
              </h3>
              <span className="text-xs font-bold font-tabular text-emerald-500">
                {Object.values(visitorChecklist).filter(Boolean).length} از ۵ انجام شد
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                {
                  key: 'step1',
                  text: '۱. از روی تابلوی سردر مغازه، نام دقیق گالری طلا/نقره و نام مدیر را در نوار وایت‌لیبل بالای تبلت وارد کردم.',
                },
                {
                  key: 'step2',
                  text: '۲. شماره موبایل/واتساپ روی کارت ویزیت یا تابلوی گالری را در فیلد تلفن وارد کردم.',
                },
                {
                  key: 'step3',
                  text: '۳. روشنایی صفحه تبلت را روی ۱۰۰٪ گذاشتم و تم مشکی-طلایی سلطنتی (Royal Dark) را فعال کردم.',
                },
                {
                  key: 'step4',
                  text: '۴. در ماشین‌حساب سر میز مشتری، یک سرویس عروس ۲۸.۵ گرمی آماده گذاشتم تا در ۱۰ ثانیه فاکتور صادر کنم.',
                },
                {
                  key: 'step5',
                  text: '۵. کد سفیر خودم (?ref=' + tenant.visitorRefCode + ') و شماره شبا را در هاب مالی چک کردم.',
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                    visitorChecklist[item.key]
                      ? 'bg-emerald-500/10 border-emerald-500/40'
                      : 'border-slate-700/40 opacity-80'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!visitorChecklist[item.key]}
                    onChange={() =>
                      setVisitorChecklist((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                    }
                    className="mt-0.5 accent-emerald-500"
                  />
                  <span className="leading-relaxed font-semibold">{item.text}</span>
                </label>
              ))}
            </div>
          </div>

          {/* The 3-Part Golden Formula for Guaranteed Sales */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="font-black text-base text-amber-500 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>آموزش «فرمول طلایی ۳گانه فروش قطعی از هفته اول» ویژه صنف طلا و نقره:</span>
            </h3>

            <div className="space-y-3 text-xs md:text-sm leading-relaxed">
              <div
                className={`p-4 rounded-2xl border-r-4 border-r-amber-500 border ${
                  isLight ? 'bg-amber-50/50 border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="font-black text-amber-500 mb-1">
                  🥇 اصل اول (پشت درِ گالری طلا — ثانیه صفر): اثر مالکیت روانی (Endowment Effect)
                </div>
                <p className="opacity-90">
                  هرگز با یک برنامه عمومی وارد طلافروشی نشوید! ۳۰ ثانیه قبل از ورود، نام گالری (مثلاً{' '}
                  <strong>{tenant.businessName}</strong>) را در نوار بالای تبلت وارد کنید. وقتی تبلت را روی پیشخوان شیشه‌ای طلافروش می‌گذارید و در ثانیه اول نام برند خودش را بالای تابلوی مظنه زنده می‌بیند، گارد دفاعی‌اش فوراً می‌شکند.
                </p>
              </div>

              <div
                className={`p-4 rounded-2xl border-r-4 border-r-emerald-500 border ${
                  isLight ? 'bg-emerald-50/50 border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="font-black text-emerald-500 mb-1">
                  🥈 اصل دوم (دقیقه ۲ جلسه): شلیک پیش‌فاکتور طلاکوب به واتساپ گوشی خودِ مدیر گالری!
                </div>
                <p className="opacity-90">
                  به‌جای توضیح طولانی، بگویید: «حاج‌آقا، فرض کنید مشتری یک سرویس ۲۸ گرمی با اجرت ۱۴٪ می‌خواهد و ۳۰٪ نقد می‌دهد و الباقی را ۶ فقره چک صیادی بنفش می‌دهد». در ۳۰ ثانیه دکمه{' '}
                  <strong>«شلیک فاکتور به واتساپ مدیر گالری»</strong> را بزنید. شنیدن صدای پیامک واتساپ روی گوشی خودش و دیدن فاکتور طلاکوب با نام خودش = <strong>لحظه قطعی تصمیم خرید!</strong>
                </p>
              </div>

              <div
                className={`p-4 rounded-2xl border-r-4 border-r-purple-500 border ${
                  isLight ? 'bg-purple-50/50 border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="font-black text-purple-400 mb-1">
                  🥉 اصل سوم (دقیقه ۸ جلسه — شکستن مقاومت مالی): پیشنهاد اقساطی بدون ریسک با چک صیادی
                </div>
                <p className="opacity-90">
                  قیمت لایسنس پایه <strong>۴۸ میلیون تومان</strong> (و نسخه VIP دوگانه طلا و نقره <strong>۹۶ میلیون تومان</strong>) است. اما برای بستن قرارداد در همان جلسه بگویید:
                  <br />
                  <strong className="text-amber-400">
                    «فقط ۱۲ میلیون تومان پیش‌پرداخت نقدی (که درجا کل ۲۵٪ پورسانت نقدی شما یعنی ۱۲ میلیون تومان را همان لحظه تسویه می‌کند!) + ۲ فقره چک صیادی ۱۸ میلیون تومانی برای ماه‌های آینده، همراه با بند کتبی ضمانت عودت چک‌ها در صورت عدم افزایش فروش در ۳۰ روز اول!»
                  </strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Step 10-Minute Meeting Pitch Timeline */}
        <div className="mt-8 pt-6 border-t border-amber-500/20">
          <h3 className="font-black text-base mb-4 flex items-center gap-2 text-amber-500">
            <Clock className="w-5 h-5" />
            <span>راهنمای ۳ مرحله‌ای اولویت معرفی قابلیت‌ها در جلسه ۱۰ دقیقه‌ای (جلوگیری از گیج شدن طلافروش سنتی):</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed">
            <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5">
              <div className="font-black text-amber-500 text-sm mb-1.5">
                ⏱️ گام اول (دقیقه ۱ تا ۳): فقط ۳ قابلیت ویترینی
              </div>
              <p className="opacity-85">
                برای اینکه مدیر سنتی طلافروشی گیج نشود، در ۳ دقیقه اول فقط ۱) <strong>نام گالری خودش بالای تابلوی مظنه</strong>، ۲) <strong>ماشین‌حساب ۰.۱ ثانیه‌ای وزن و اجرت</strong> و ۳) <strong>ارسال پیش‌فاکتور طلاکوب به واتساپ خودش</strong> را نشان دهید.
              </p>
            </div>
            <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5">
              <div className="font-black text-emerald-500 text-sm mb-1.5">
                ⏱️ گام دوم (دقیقه ۳ تا ۶): قابلیت‌های مالی و چک صیادی
              </div>
              <p className="opacity-85">
                حالا که توجهش جلب شد، <strong>استعلام رنگ چک صیادی بنفش</strong>، <strong>قفل ضمانت قیمت ضدتورم طلا برای سفارش‌های ساخت</strong>، <strong>تعویض طلای کهنه</strong> و <strong>استوری‌ساز ۱-کلیکی اینستاگرام</strong> برای پر کردن ساعت‌های خلوت صبح مغازه را نشان دهید.
              </p>
            </div>
            <div className="p-4 rounded-2xl border border-purple-500/30 bg-purple-500/5">
              <div className="font-black text-purple-400 text-sm mb-1.5">
                ⏱️ گام سوم (دقیقه ۷ تا ۱۰): ماشین‌حساب ROI و بستن قرارداد
              </div>
              <p className="opacity-85">
                اسلایدر <strong>بازگشت سرمایه (ROI)</strong> را تکان دهید تا ببیند سود فقط ۱ سرویس عروس در ماه کل هزینه برنامه را برمی‌گرداند؛ سپس پیشنهاد <strong>۱۲ میلیون نقد + ۲ چک ۱۸ میلیونی صیادی</strong> را مطرح و فروش را ثبت کنید.
              </p>
            </div>
          </div>
        </div>

        {/* Objection Handling Bank (5 Ready Answers with 1-Click Copy) + Market Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8 pt-6 border-t border-amber-500/20">
          <div className="lg:col-span-7 space-y-3">
            <h3 className="font-black text-sm md:text-base text-amber-500 flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              <span>بانک پاسخ‌های آماده و کپی ۱-کلیکی به ۵ بهانه رایج مدیران طلافروشی و نقره‌فروشی:</span>
            </h3>

            {[
              {
                q: '۱. «ما ۳۰ ساله با همین ماشین‌حساب کاسیو روی میز و فاکتور کاغذی کار می‌کنیم!»',
                a: 'حاج‌آقا کاملاً درسته، اعتبار ۳۰ ساله شما ستون مغازه‌ست؛ اما مشتری جوان امروز وقتی می‌گه «برم دورامو بزنم»، کاغذ رو گم می‌کنه. این سیستم در ۳ ثانیه پیش‌فاکتور طلاکوب با نام گالری شما و عکس طلا رو می‌فرسته رو واتساپش و با قفل بیعانه همون‌جا خرید رو قطعی می‌کنه.',
              },
              {
                q: '۲. «۴۸ میلیون تومان برای نرم‌افزار زیاده، بذار با شرکا مشورت کنم.»',
                a: 'قربان کل ۴۸ میلیون رو الان پرداخت نمی‌کنید! فقط ۱۲ میلیون تومان پیش‌پرداخته (معادل اجرت فروش فقط یک سرویس طلای ۲۵ گرمی) و الباقی ۲ فقره چک صیادی ۱۸ میلیونی برای ماه‌های بعده؛ تازه اگر در ۳۰ روز اول فروشتون بیشتر نشد، چک‌ها عودت داده می‌شه.',
              },
              {
                q: '۳. «موقع قطعی اینترنت یا نوسان شدید بازار، برنامه از کار نمی‌افته؟»',
                a: 'اصلاً! طلایار مجهز به کش سرویس‌ورکر (Offline-First) هست؛ حتی اگر اینترنت کل بازار قطع بشه، با آخرین نرخ ذخیره شده و تنظیم دستی سر میز ۱۰۰٪ آفلاین کار می‌کنه.',
              },
              {
                q: '۴. «نکنه اطلاعات قیمت‌ها یا فاکتورهای مشتریان من دست طلافروشی بغل‌دستی بیفته؟»',
                a: 'به هیچ وجه! معماری برنامه کاملاً ایزوله (Multi-Tenant Isolated) است و دیتای هر گالری با شناسه اختصاصی خودش قفل می‌شه و هیچ ارتباطی با سایر گالری‌ها نداره.',
              },
              {
                q: '۵. «من وقت ندارم هر روز عکس طلاها رو ادیت کنم و بذارم استوری اینستاگرام.»',
                a: 'دقیقاً به همین خاطر استوری‌ساز ۱-کلیکی رو گذاشتیم! بدون نیاز به فتوشاپ یا ادمین ۳۰ میلیونی در ماه، با ۱ کلیک عکس طلا با نرخ لحظه‌ای تابلو و لوگوی گالری شما آماده انتشار در استوری می‌شه.',
              },
            ].map((obj, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2 font-bold text-amber-500 mb-1">
                  <span>{obj.q}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(obj.a);
                      setCopiedObjectionIndex(idx);
                      setTimeout(() => setCopiedObjectionIndex(null), 2000);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-500 hover:bg-amber-500 hover:text-slate-950 font-bold shrink-0 cursor-pointer"
                  >
                    {copiedObjectionIndex === idx ? '✅ کپی شد' : 'کپی پاسخ'}
                  </button>
                </div>
                <p className="opacity-85">{obj.a}</p>
              </div>
            ))}
          </div>

          {/* Active Union Units Statistics in Tehran & Provinces */}
          <div
            className={`lg:col-span-5 p-5 rounded-2xl border flex flex-col justify-between ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}
          >
            <div>
              <h3 className="font-black text-sm md:text-base text-emerald-500 flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4" />
                <span>آمار واحدهای صنفی فعال طلا، جواهر، سکه و نقره (پتانسیل بازار ویزیتورها):</span>
              </h3>
              <p className="text-xs opacity-80 mb-3 leading-relaxed">
                طبق آمار اتحادیه‌های طلا، جواهر، نقره و سکه کشور، بیش از <strong>۲۸٬۵۰۰ واحد صنفی مجوزدار</strong> در ایران فعال هستند که کمتر از ۴٪ آن‌ها دارای سامانه وایت‌لیبل اختصاصی و استوری‌ساز خودکار هستند:
              </p>

              <div className="space-y-2 text-xs font-tabular">
                {[
                  { region: 'تهران (بازار بزرگ، سبزه میدان، کریم‌خان، میرداماد، صادقیه، تجریش)', count: '۶٬۴۰۰+ گالری و بنکداری' },
                  { region: 'اصفهان (چهارباغ، میدان نقش‌جهان، بازار هنر، قطب نقره قلم‌زنی)', count: '۳٬۸۰۰+ گالری و کارگاه' },
                  { region: 'مشهد (خیابان امام رضا، بازار رضا، زیست‌خاور، قطب نقره و جواهر)', count: '۳٬۲۰۰+ واحد صنفی' },
                  { region: 'تبریز (بازار امیر، بازار مظفریه، قطب طلا و نقره ترک)', count: '۲٬۴۰۰+ واحد صنفی' },
                  { region: 'شیراز، اهواز، کرج، یزد، قم، رشت و سایر کلان‌شهرها', count: '۱۲٬۷۰۰+ واحد صنفی فعال' },
                ].map((row, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5"
                  >
                    <span className="font-semibold">{row.region}</span>
                    <strong className="text-emerald-500 shrink-0">{row.count}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs leading-relaxed">
              <strong className="text-amber-500 block mb-1">
                💡 هدف‌گذاری درآمد ماهانه ۱ ویزیتور حرفه‌ای:
              </strong>
              فروش فقط <strong>۴ لایسنس پایه در ماه</strong> (یعنی هفته‌ای ۱ گالری طلا از بین ۲۸٬۵۰۰ گالری) ={' '}
              <strong className="text-emerald-500 font-tabular">۴۸٬۰۰۰٬۰۰۰ تومان پورسانت نقدی شبا در ماه!</strong>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 5: AMBASSADOR FINANCIAL HUB, VIP INVITATION LETTER & 25% SHEBA LEDGER (#invitation-letter)
          ===================================================================== */}
      <section
        id="invitation-letter"
        className={`rounded-3xl border p-6 md:p-8 transition-colors ${
          isLight
            ? 'bg-white border-amber-500/40 shadow-sm'
            : 'bg-slate-900/95 border-amber-500/30 shadow-xl'
        }`}
      >
        <div className="pb-6 border-b border-amber-500/20">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-500">
            <FileText className="w-4 h-4" />
            <span>
              {isRtl
                ? 'بخش پنجم (#invitation-letter) — دعوت‌نامه رسمی طلاکوب VIP و هاب مالی ۲۵٪ پورسانت نقدی شبا'
                : 'Section 5 (#invitation-letter) — Official VIP Gold-Stamped Invitation Letter & 25% Sheba Commission Hub'}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black mt-1">
            {isRtl
              ? 'تولید خودکار دعوت‌نامه رسمی مدیر گالری + جدول زنده تسویه ۲۵٪ پورسانت شبا (۱۲ تا ۲۴ میلیون در هر فروش)'
              : 'Auto-Generated Official Gallery Invitation Letter + Live 25% Sheba Commission Ledger'}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Left 5 Columns: Official Gold-Stamped VIP Invitation Letter */}
          <div
            className={`lg:col-span-5 rounded-2xl border-2 border-amber-500/60 p-5 flex flex-col justify-between ${
              isLight ? 'bg-amber-50/40' : 'bg-slate-950'
            }`}
          >
            <div>
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-3 mb-3">
                <span className="text-xs font-black text-amber-500">
                  📜 دعوت‌نامه رسمی طلاکوب VIP (آماده چاپ و واتساپ)
                </span>
                <span className="text-xs font-tabular opacity-75">کد سفیر: {tenant.visitorRefCode}</span>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed opacity-90">
                {invitationLetterText}
              </pre>
            </div>

            <div className="mt-4 pt-3 border-t border-amber-500/20 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => {
                  const rawPhone = tenant.phone.replace(/[^0-9]/g, '');
                  const norm = rawPhone.startsWith('0') ? `98${rawPhone.slice(1)}` : rawPhone;
                  window.open(
                    `https://wa.me/${norm}?text=${encodeURIComponent(invitationLetterText)}`,
                    '_blank',
                    'noopener,noreferrer'
                  );
                }}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>ارسال دعوت‌نامه به واتساپ مدیر</span>
              </button>
              <button
                onClick={() => window.print()}
                className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>چاپ دعوت‌نامه طلاکوب A4</span>
              </button>
            </div>
          </div>

          {/* Right 7 Columns: Ambassador Sheba Input & Live 25% Commission Ledger */}
          <div className="lg:col-span-7 space-y-4">
            <div
              className={`p-5 rounded-2xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h3 className="font-black text-sm md:text-base text-emerald-500">
                  💳 ثبت شماره شبا سفیر و ثبت ۱-کلیکی فروش لایسنس (۲۵٪ پورسانت آنی از پیش‌پرداخت)
                </h3>
                <span className="text-xs font-bold font-tabular text-amber-500">
                  مجموع پورسانت تسویه‌شده شما: {totalAmbassadorCommission.toLocaleString('en-US')} تومان
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold mb-1">
                    شماره شبا ۲۴ رقمی سفیر جهت واریز آنی ۲۵٪ پورسانت (IR...):
                  </label>
                  <input
                    type="text"
                    value={ambassadorSheba}
                    onChange={(e) => setAmbassadorSheba(e.target.value)}
                    placeholder="IR820120000000009876543210"
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-bold font-tabular ${
                      isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">کد اختصاصی سفیر (?ref=):</label>
                  <input
                    type="text"
                    value={ambassadorCode}
                    onChange={(e) => setAmbassadorCode(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-bold font-tabular ${
                      isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3 items-end">
                <div>
                  <label className="block text-xs font-bold mb-1">نام گالری خریدار:</label>
                  <input
                    type="text"
                    value={newSaleGalleryName}
                    onChange={(e) => setNewSaleGalleryName(e.target.value)}
                    placeholder={tenant.businessName}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-bold ${
                      isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">شهر:</label>
                  <input
                    type="text"
                    value={newSaleCity}
                    onChange={(e) => setNewSaleCity(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-bold ${
                      isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">نوع لایسنس / پکیج:</label>
                  <select
                    value={newSalePlan}
                    onChange={(e) => setNewSalePlan(e.target.value as any)}
                    className={`w-full px-2.5 py-2 rounded-xl border text-xs font-bold ${
                      isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                    }`}
                  >
                    <option value="BASE_48M">لایسنس پایه ۴۸M (پورسانت: ۱۲ میلیون)</option>
                    <option value="VIP_96M">لایسنس VIP کامل ۹۶M (پورسانت: ۲۴ میلیون)</option>
                    <option value="AD_12M">بسته تبلیغات ۱۲M (پورسانت: ۳ میلیون)</option>
                  </select>
                </div>
                <button
                  onClick={handleRegisterAmbassadorSale}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer transition-colors"
                >
                  + ثبت ۱-کلیکی فروش و تسویه شبا
                </button>
              </div>
            </div>

            {/* Live Commission Settlement Table */}
            <div className="overflow-x-auto rounded-2xl border border-amber-500/20">
              <table className="w-full text-xs font-tabular text-right">
                <thead className="bg-amber-500/15 text-amber-500 font-bold">
                  <tr>
                    <th className="p-2.5">شناسه</th>
                    <th className="p-2.5">گالری طلا / نقره</th>
                    <th className="p-2.5">مبلغ قرارداد</th>
                    <th className="p-2.5">پیش‌پرداخت نقدی</th>
                    <th className="p-2.5">پورسانت ۲۵٪ سفیر</th>
                    <th className="p-2.5">وضعیت شبا</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {ambassadorSales.map((sale) => (
                    <tr key={sale.id}>
                      <td className="p-2.5 font-bold">{sale.id}</td>
                      <td className="p-2.5">
                        <div className="font-bold">{sale.galleryName}</div>
                        <div className="opacity-70">
                          {sale.city} · {sale.packageTitle}
                        </div>
                      </td>
                      <td className="p-2.5">{sale.totalContractToman.toLocaleString('en-US')}</td>
                      <td className="p-2.5">{sale.cashDownPaymentToman.toLocaleString('en-US')}</td>
                      <td className="p-2.5 font-black text-emerald-500">
                        {sale.visitorCommission25Toman.toLocaleString('en-US')} تومان
                      </td>
                      <td className="p-2.5">
                        <span className="text-emerald-500 font-bold">
                          ✅ تسویه آنی پایا/ساتنا ({sale.shebaNumber.slice(0, 8)}...)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
