export interface WhiteLabelTenantConfig {
  slug: string;
  businessName: string;
  managerName: string;
  city: string;
  phone: string;
  instagram: string;
  slogan: string;
  priceMultiplier: number; // e.g., 1.00 default, 1.02 (+2% gallery premium), 0.98 (-2% wholesale discount)
  visitorRefCode: string;
  licenseStatus: 'DEMO_VISITOR' | 'COMMERCIAL_PRO' | 'COMMERCIAL_VIP';
  updatedAt: string;
}

const TENANT_INDEX_KEY = 'talayar_isolated_tenants_index_v1';
const ACTIVE_TENANT_SLUG_KEY = 'talayar_active_tenant_slug_v1';

export function toTenantSlug(name: string): string {
  const cleaned = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\u0600-\u06FFa-z0-9\-]/g, '');
  return cleaned || 'default-gold-gallery';
}

export const DEFAULT_TENANT_CONFIG: WhiteLabelTenantConfig = {
  slug: 'royal-talayar-tehran',
  businessName: 'گالری طلا و جواهرات سلطنتی طلایار',
  managerName: 'حاج محمد طهرانی',
  city: 'تهران - بازار بزرگ',
  phone: '09120000000',
  instagram: '@TalaYar.Global.VIP',
  slogan: 'اصالت طلای ۱۸ عیار، شمش سوئیسی و نقره قلم‌زنی با فاکتور رسمی اتحادیه',
  priceMultiplier: 1.0,
  visitorRefCode: 'VIP-104',
  licenseStatus: 'DEMO_VISITOR',
  updatedAt: new Date().toISOString(),
};

export function getTenantStorageKey(slug: string): string {
  return `talayar_isolated_tenant_data_${slug}`;
}

export function loadTenantBySlug(slug: string): WhiteLabelTenantConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(getTenantStorageKey(slug));
    if (!raw) return null;
    return JSON.parse(raw) as WhiteLabelTenantConfig;
  } catch {
    return null;
  }
}

export function saveIsolatedTenant(config: WhiteLabelTenantConfig): WhiteLabelTenantConfig {
  const normalizedSlug = toTenantSlug(config.slug || config.businessName);
  const next: WhiteLabelTenantConfig = {
    ...config,
    slug: normalizedSlug,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(getTenantStorageKey(normalizedSlug), JSON.stringify(next));
      localStorage.setItem(ACTIVE_TENANT_SLUG_KEY, normalizedSlug);

      // Update tenant directory list (stores only slugs & names for quick visitor switching on tablet)
      const listRaw = localStorage.getItem(TENANT_INDEX_KEY);
      const list: Array<{ slug: string; businessName: string; city: string }> = listRaw
        ? JSON.parse(listRaw)
        : [];
      const filtered = list.filter((item) => item.slug !== normalizedSlug);
      filtered.unshift({
        slug: normalizedSlug,
        businessName: next.businessName,
        city: next.city,
      });
      localStorage.setItem(TENANT_INDEX_KEY, JSON.stringify(filtered.slice(0, 15)));
    } catch {
      // Ignore quota errors
    }
  }
  return next;
}

export function listSavedTenants(): Array<{ slug: string; businessName: string; city: string }> {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TENANT_INDEX_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function resolveInitialTenantFromUrlOrStorage(): WhiteLabelTenantConfig {
  if (typeof window === 'undefined') return DEFAULT_TENANT_CONFIG;

  const params = new URLSearchParams(window.location.search);
  const urlTenant = params.get('tenant') || params.get('brand');
  const urlManager = params.get('manager');
  const urlCity = params.get('city');
  const urlPhone = params.get('phone');
  const urlInsta = params.get('insta');
  const urlSlogan = params.get('slogan');
  const urlRef = params.get('ref');
  const urlMult = params.get('multiplier');

  if (urlTenant) {
    const slug = toTenantSlug(urlTenant);
    const existing = loadTenantBySlug(slug);
    const base = existing || {
      ...DEFAULT_TENANT_CONFIG,
      slug,
      businessName: urlTenant,
    };

    const merged: WhiteLabelTenantConfig = {
      ...base,
      businessName: urlTenant,
      managerName: urlManager || base.managerName,
      city: urlCity || base.city,
      phone: urlPhone || base.phone,
      instagram: urlInsta || base.instagram,
      slogan: urlSlogan || base.slogan,
      visitorRefCode: urlRef || base.visitorRefCode,
      priceMultiplier:
        urlMult && !Number.isNaN(Number(urlMult)) ? Number(urlMult) : base.priceMultiplier,
      updatedAt: new Date().toISOString(),
    };
    return saveIsolatedTenant(merged);
  }

  // Otherwise load active tenant slug from localStorage
  try {
    const activeSlug = localStorage.getItem(ACTIVE_TENANT_SLUG_KEY);
    if (activeSlug) {
      const existing = loadTenantBySlug(activeSlug);
      if (existing) {
        if (urlRef) existing.visitorRefCode = urlRef;
        return existing;
      }
    }
  } catch {}

  return saveIsolatedTenant(DEFAULT_TENANT_CONFIG);
}

export function buildTenantShareUrl(config: WhiteLabelTenantConfig): string {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set('tenant', config.businessName);
  if (config.managerName) url.searchParams.set('manager', config.managerName);
  if (config.city) url.searchParams.set('city', config.city);
  if (config.phone) url.searchParams.set('phone', config.phone);
  if (config.visitorRefCode) url.searchParams.set('ref', config.visitorRefCode);
  if (config.priceMultiplier !== 1) {
    url.searchParams.set('multiplier', String(config.priceMultiplier));
  }
  return url.toString();
}
