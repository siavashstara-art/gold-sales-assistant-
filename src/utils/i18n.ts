import { Language } from '../types/gold';

export const LANGUAGES_LIST: Array<{
  code: Language;
  label: string;
  dir: 'rtl' | 'ltr';
  speechLang: string;
}> = [
  { code: 'fa', label: '🇮🇷 فارسی', dir: 'rtl', speechLang: 'fa-IR' },
  { code: 'en', label: '🇬🇧 English', dir: 'ltr', speechLang: 'en-US' },
  { code: 'ar', label: '🇦🇪 العربية', dir: 'rtl', speechLang: 'ar-SA' },
  { code: 'ku', label: '☀️ کوردی', dir: 'rtl', speechLang: 'ar-IQ' },
  { code: 'tr', label: '🇹🇷 Türkçe', dir: 'ltr', speechLang: 'tr-TR' },
  { code: 'az', label: '🇦🇿 آذری (Azərbaycanca)', dir: 'ltr', speechLang: 'tr-TR' },
  { code: 'hy', label: '🇦🇲 ارمنی (Հայերեն)', dir: 'ltr', speechLang: 'hy-AM' },
  { code: 'es', label: '🇪🇸 Español', dir: 'ltr', speechLang: 'es-ES' },
];

export function isRtlLanguage(lang: Language): boolean {
  return lang === 'fa' || lang === 'ar' || lang === 'ku';
}

export function getLocalizedHeroStrings(lang: Language) {
  switch (lang) {
    case 'ar':
      return {
        brand: 'طلايار العالمي | AurumMate VIP',
        subtitle: 'منظومة الإبداع | مدينة نيوميتافيرسيتي العالمية | منصة FBNM',
        heroTitle: 'المنصة الذكية لتسعير الذهب والمجوهرات والفضيات والأونصة العالمية لحظياً',
        heroDesc:
          'مصمم لتجار الذهب والفضة في إيران، دبي، العراق، تركيا، أذربيجان، أرمينيا، أوروبا وكندا. يدعم تسعير الجرام والمصنعية، الفضيات المنقوشة، استبدال الذهب المستعمل، والوصول الشامل لذوي الاحتياجات الخاصة وفرط الحركة ADHD.',
        navShowcase: 'المعرض والتسعير',
        navSilverAds: 'الفضيات والإعلانات',
        navTradeIn: 'استبدال الذهب',
        navQr: 'شهادة QR للذهب',
        navStory: 'صانع الستوري HD',
        navMonetize: 'شراء البرنامج والوكلاء (25%)',
      };
    case 'ku':
      return {
        brand: 'تەڵایاری جیهانی | AurumMate VIP',
        subtitle: 'ئیکۆسیستەمی ئافراندن | شاری نوێی نیۆمێتاڤێرسیتی جیهان | ستەیجی FBNM',
        heroTitle: 'سیستەمی زیرەکی زێڕنگەری، زیوسازی، بنکداری و نرخی چرکەیی زێڕ و زیو و سکە',
        heroDesc:
          'تایبەت بە زێڕنگەران و زیوفرۆشان لە ئێران، هەولێر، سلێمانی، دوبەی، تورکیا و ئەوروپا. بە تایبەتمەندی دەستڕاگەیشتنی تایبەت بۆ کەمئەندامان و دۆخی تەرکیزی ADHD و پاداشتی ٢٥٪ بۆ فرۆشیاران.',
        navShowcase: 'ڤیترین و نرخاندن',
        navSilverAds: 'بەشی زیو و ڕێکلام',
        navTradeIn: 'گۆڕینەوەی زێڕی کۆن',
        navQr: 'ناسنامەی QR',
        navStory: 'ستۆری ساز HD',
        navMonetize: 'کڕینی بەرنامە و نوێنەران (٢٥٪)',
      };
    case 'tr':
      return {
        brand: 'TalaYar Global | AurumMate VIP',
        subtitle: 'Yaratılış Ekosistemi | Yeni Metaversity Dünya Şehri | FBNM Sahnesi',
        heroTitle: 'Canlı Altın, Gümüş İşlemeciliği, Toptan Kuyumculuk ve Anlık Fiyatlandırma Sistemi',
        heroDesc:
          'Kapalıçarşı, İran, Dubai, Bakü, Avrupa ve Kanada kuyumcuları ve gümüş ustaları için tasarlandı. İşçilik hesabı, eski altın takası, gümüş reyonu, %25 satış temsilcisi komisyonu ve ADHD erişilebilirlik modu.',
        navShowcase: 'Vitrin ve Fiyat',
        navSilverAds: 'Gümüş ve İlanlar',
        navTradeIn: 'Altın Takas',
        navQr: 'QR Sertifika',
        navStory: 'HD Hikaye Üretici',
        navMonetize: 'Satın Al & %25 Bayilik',
      };
    case 'az':
      return {
        brand: 'QızılYar Qlobal | AurumMate VIP',
        subtitle: 'Yaradılış Ekosistemi | Yeni Metaversity Dünya Şəhəri | FBNM Səhnəsi',
        heroTitle: 'Canlı Qızıl Vitrini, Gümüş Qablar, Topdansatış və Anlıq Qiymət Hesablama Sistemi',
        heroDesc:
          'Təbriz, Ərdəbil, Urmiya, Zəncan, Bakı, Tehran və Dubay qızıl-gümüş tacirləri üçün 8 dildə hazırlanmışdır. Zərgərlik işçilik hesabı, köhnə qızıl mübadiləsi, 84/90/925 əyarlı gümüş qablar və vizitorlar üçün 25% nağd satış komissiyası.',
        navShowcase: 'Vitrin və Qiymət',
        navSilverAds: 'Gümüş Qablar və Elanlar',
        navTradeIn: 'Köhnə Qızıl Mübadiləsi',
        navQr: 'QR Pasport',
        navStory: 'HD Hekayə Yaradıcı',
        navMonetize: 'Alış Форması və 25% Komissiya',
      };
    case 'hy':
      return {
        brand: 'TalaYar Global | AurumMate VIP (ՈսկեՅար)',
        subtitle: 'Արարման Էկոհամակարգ | Նոր Մետավերսիթի Համաշխարհային Քաղաք | FBNM Հարթակ',
        heroTitle: 'Ոսկերչության, Արծաթագործության, Մեծածախ Առևտրի և Ակնթարթային Գնագոյացման Հելացի Համակարգ',
        heroDesc:
          'Նախագծված է Թեհրանի, Սպահանի (Նոր Ջուղա), Երևանի, Դուբայի և Եվրոպայի ոսկերիչների ու արծաթագործ վարպետների համար: Ներառում է 18K-24K ոսկու և 840-999 արծաթի հաշվիչ, հին ոսկու փոխանակում, հաշմանդամություն ունեցող անձանց և ADHD հասանելիություն և 25% միջնորդավճար վաճառքի ներկայացուցիչների համար:',
        navShowcase: 'Ցուցափեղկ և Գներ',
        navSilverAds: 'Արծաթագործություն և Գովազդ',
        navTradeIn: 'Հին Ոսկու Փոխանակում',
        navQr: 'QR Վկայական',
        navStory: 'HD Սթորի Ստեղծող',
        navMonetize: 'Գնման Պայմաններ և 25% Միջնորդավճար',
      };
    case 'es':
      return {
        brand: 'TalaYar Global | AurumMate VIP',
        subtitle: 'Ecosistema de Creación | Nueva Ciudad Metaversity Mundial | Escenario FBNM',
        heroTitle: 'Plataforma Inteligente de Joyería, Platería Artesanal y Cotización de Oro en Vivo',
        heroDesc:
          'Diseñado en 8 idiomas para joyeros, mayoristas y plateros en todo el mundo. Cambio instantáneo de divisas (USD, EUR, AED), cálculo de hechura, platería fina, comisión del 25% para vendedores y modo enfoque TDAH.',
        navShowcase: 'Vitrina y Precios',
        navSilverAds: 'Platería y Anuncios',
        navTradeIn: 'Canje de Oro',
        navQr: 'Pasaporte QR',
        navStory: 'Creador Story HD',
        navMonetize: 'Compra y 25% Afiliados',
      };
    case 'en':
      return {
        brand: 'AurumMate | TalaYar Global VIP',
        subtitle: 'Creation Ecosystem | New Metaversity World | FBNM Stage',
        heroTitle: 'Smart Live Gold Showcase, Silverware Craft, B2B Wholesale & Real-Time Pricing Engine',
        heroDesc:
          'Engineered in 8 languages (Persian, English, Arabic, Kurdish, Turkish, Azerbaijani, Armenian, Spanish) for jewelers and silver artisans worldwide. Includes 25% direct Visitor Sales Commission, Zero-Touch Signed APK/AAB Release, and WCAG AAA + ADHD Focus Mode.',
        navShowcase: 'Showcase & Pricing',
        navSilverAds: 'Silverware & Ads Hub',
        navTradeIn: 'Gold Trade-In',
        navQr: 'QR Gold Passport',
        navStory: 'HD Story Maker',
        navMonetize: 'Purchase & 25% Visitor Club',
      };
    default:
      return {
        brand: 'طلایار جهانی | TalaYar (AurumMate) VIP',
        subtitle: 'اکوسیستم آفرینش | شهر جدید نیومتاورسیتی جهان | توان استیج FBNM',
        heroTitle:
          'طلایار جهانی | سامانه هوشمند ویترین زنده، نقره‌سرا، بنکداری و محاسبه‌گر لحظه‌ای طلا، جواهر، ظروف نقره و سکه ایران و جهان',
        heroDesc:
          'طراحی‌شده به ۸ زبان زنده دنیا (فارسی، انگلیسی، عربی، کُردی، ترکی استانبولی، آذری، ارمنی و اسپانیایی) برای تسهیل ۱۰۰٪ کار طلافروشان و نقره‌فروشان؛ همراه با صورت خرید شفاف، دعوت از ویزیتورها با پورسانت ۲۵٪ نقدی، اتوماسیون امن کلیدهای API و خروجی امضاشده اندروید (APK/AAB).',
        navShowcase: 'ویترین طلا و نقره',
        navSilverAds: 'ظروف نقره و تبلیغات',
        navTradeIn: 'تعویض طلای کهنه',
        navQr: 'شناسنامه QR اصالت',
        navStory: 'استوری‌ساز HD',
        navMonetize: 'صورت خرید و ویزیتورها (۲۵٪)',
      };
  }
}
