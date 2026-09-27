import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import zlib from 'zlib';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to generate valid solid/gold-accented PNG buffers for PWA icons if missing
function createRoyalGoldPng(width: number, height: number, isMaskable = false): Buffer {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function crc32(buf: Buffer): number {
    let c = 0xffffffff;
    for (let n = 0; n < buf.length; n++) {
      c ^= buf[n];
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type: string, data: Buffer): Buffer {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const combined = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(combined), 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const rowSize = width * 4 + 1;
  const rawData = Buffer.alloc(rowSize * height);
  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.min(width, height) * (isMaskable ? 0.34 : 0.4);

  for (let y = 0; y < height; y++) {
    const rowStart = y * rowSize;
    rawData[rowStart] = 0; // filter type 0
    for (let x = 0; x < width; x++) {
      const px = rowStart + 1 + x * 4;
      const dx = Math.abs(x - cx);
      const dy = Math.abs(y - cy);
      const diamondDist = dx + dy;

      if (diamondDist < maxR && diamondDist > maxR * 0.72) {
        // 24K Gold diamond border (#FBBF24)
        rawData[px] = 251;
        rawData[px + 1] = 191;
        rawData[px + 2] = 36;
        rawData[px + 3] = 255;
      } else if (diamondDist <= maxR * 0.32) {
        // Emerald center gem (#10B981)
        rawData[px] = 16;
        rawData[px + 1] = 185;
        rawData[px + 2] = 129;
        rawData[px + 3] = 255;
      } else {
        // Royal Slate-950 background (#020617)
        rawData[px] = 2;
        rawData[px + 1] = 6;
        rawData[px + 2] = 23;
        rawData[px + 3] = 255;
      }
    }
  }

  const idatData = zlib.deflateSync(rawData);
  const iend = Buffer.alloc(0);

  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idatData),
    makeChunk('IEND', iend),
  ]);
}

function ensurePwaIcons() {
  const publicDir = path.resolve(__dirname, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const icons: Array<{ name: string; size: number; maskable?: boolean }> = [
    { name: 'pwa-192x192.png', size: 192 },
    { name: 'pwa-512x512.png', size: 512 },
    { name: 'pwa-maskable-512x512.png', size: 512, maskable: true },
    { name: 'apple-touch-icon.png', size: 180 },
  ];
  for (const icon of icons) {
    const filePath = path.join(publicDir, icon.name);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, createRoyalGoldPng(icon.size, icon.size, icon.maskable));
    }
  }
}

ensurePwaIcons();

export interface MarketRatesState {
  // Iran Market (Toman)
  gram18kToman: number;
  gram21kToman: number;
  gram24kToman: number;
  mithqalToman: number;
  coinEmamiToman: number;
  coinBaharToman: number;
  coinHalfToman: number;
  coinQuarterToman: number;
  coinGeramiToman: number;
  silver925GramToman: number;
  // Global Market
  ounceUsd: number;
  silverOunceUsd: number;
  usdToToman: number;
  aedToToman: number;
  eurToToman: number;
  usdToAed: number;
  usdToEur: number;
  // Jeweler Custom Board Adjustments
  boardSpreadPercent: number; // Buy/Sell spread
  defaultProfitPercent: number; // Iran union default 7%
  defaultTaxPercent: number; // Iran union VAT on profit+ojrat (default 10%)
  usedGoldDeductionPercent: number; // Deduction for buying scrap/used gold (default 1.5%)
  galleryName: string;
  galleryPhone: string;
  galleryInstagram: string;
  updatedAt: string;
}

let marketRates: MarketRatesState = {
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
  ounceUsd: 2942.50,
  silverOunceUsd: 33.40,
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

function recalculateDerivedRates(partial: Partial<MarketRatesState>): MarketRatesState {
  const next = { ...marketRates, ...partial };
  // If gram18kToman was updated directly without 21k/24k/mithqal:
  if (partial.gram18kToman !== undefined) {
    next.gram21kToman = Math.round((next.gram18kToman * 21) / 18);
    next.gram24kToman = Math.round((next.gram18kToman * 24) / 18);
    next.mithqalToman = Math.round(next.gram18kToman * 4.3318);
  }
  next.updatedAt = new Date().toISOString();
  marketRates = next;
  return marketRates;
}

// Offline Intelligent Gold & Jewelry Expert Fallback
function buildOfflineExpertResponse(prompt: string, lang: 'fa' | 'en', rates: MarketRatesState): string {
  const q = prompt.toLowerCase();
  const g18 = rates.gram18kToman.toLocaleString('en-US');
  const g24 = rates.gram24kToman.toLocaleString('en-US');
  const oz = rates.ounceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 });
  const coin = rates.coinEmamiToman.toLocaleString('en-US');

  if (lang === 'en') {
    if (q.includes('formula') || q.includes('making') || q.includes('calculate') || q.includes('price')) {
      return `**TalaYar Global Pricing Formula Analysis:**\n\n• **Live Spot Reference:** XAU/USD is **$${oz}/oz** | 18K (750) in Iran Market is **${g18} Toman/g**.\n• **Retail Customer Formula:**\n  \`Total = Weight × KaratRate × (1 + MakingCharge%) × (1 + Profit% [${rates.defaultProfitPercent}%]) + Tax [${rates.defaultTaxPercent}% on Profit + Making Charge]\`\n• **Wholesale (B2B Gold-for-Gold):**\n  \`Settlement Gold Weight = Net Weight × (1 + Workshop Making Charge %)\` settled directly in 750/18K fine gold or equivalent cash.`;
    }
    if (q.includes('trade') || q.includes('scrap') || q.includes('old') || q.includes('used')) {
      return `**Gold Trade-In (Scrap vs New) Guidance:**\n\n• **Used Gold Buyback Rate:** Calculated at **${(100 - rates.usedGoldDeductionPercent).toFixed(1)}%** of the live 18K board rate (**${Math.round(rates.gram18kToman * (1 - rates.usedGoldDeductionPercent / 100)).toLocaleString('en-US')} Toman/g**) with zero making charge or tax.\n• **Tip for Jewelers:** Always verify assay purity (750 vs 735/740 non-standard hallmarks) and deduct stones/springs weight before finalizing the trade-in receipt.`;
    }
    return `**TalaYar Global VIP Smart Advisor (Live Market Context):**\n\n• **Global Spot Gold (XAU):** $${oz} | **24K Pure:** $${((rates.ounceUsd / 31.1034768)).toFixed(2)}/g\n• **Iran 18K (750) Gram:** ${g18} Toman | **Emami Coin:** ${coin} Toman\n• **Recommendation:** For low-margin investment, Swiss 24K Bullion and low-making-chargeheavy Cartier chains preserve maximum intrinsic value. For showroom margin, Italian filigree bridal sets and 21K mirror bangles yield optimal retail turnover.`;
  }

  if (q.includes('فرمول') || q.includes('اجرت') || q.includes('محاسبه') || q.includes('مالیات') || q.includes('سود')) {
    return `💎 **تحلیل تخصصی فرمول اتحادیه طلا و جواهر (طلایار جهانی):**\n\n۱. **نرخ پایه لحظه‌ای تابلو:**\n• هر گرم طلای ۱۸ عیار (۷۵۰): **${g18} تومان**\n• هر گرم طلای ۲۴ عیار خالص: **${g24} تومان**\n• انس جهانی (XAU/USD): **$${oz}**\n\n۲. **فرمول قانونی تک‌فروشی به مشتری:**\n• قیمت پایه طلا = وزن × نرخ گرم ۱۸ عیار\n• اجرت ساخت = قیمت پایه × درصد اجرت\n• سود طلافروش (${rates.defaultProfitPercent}٪) = (قیمت پایه + اجرت ساخت) × ${rates.defaultProfitPercent}٪\n• مالیات بر ارزش افزوده (${rates.defaultTaxPercent}٪) = **صرفاً روی مجموع (اجرت ساخت + سود طلافروش)** محاسبه می‌شود (طبق قانون جدید اصل طلا معاف از مالیات است).\n\n۳. **فرمول عمده بنکداری / کیفی (طلا به طلا):**\n• وزن تسویه همکار = وزن خالص × (۱ + درصد اجرت کارگاه).`;
  }

  if (q.includes('کهنه') || q.includes('تعویض') || q.includes('شکسته') || q.includes('کارکرده') || q.includes('دست دوم')) {
    const buybackRate = Math.round(rates.gram18kToman * (1 - rates.usedGoldDeductionPercent / 100)).toLocaleString('en-US');
    return `⚖️ **راهنمای تخصصی خرید و تعویض طلای کهنه / شکسته:**\n\n• **نرخ خرید طلای متفرقه/کهنه امروز:** با کسر **${rates.usedGoldDeductionPercent}٪** از نرخ تابلو، معادل **${buybackRate} تومان** به ازای هر گرم طلای ۷۵۰ می‌باشد.\n• **نکات فنی طلافروش در تعویض:**\n  ۱. وزن نگین‌های اتمی، فنر قفل (که از فولاد است) و چسب را حتماً پیش از توزین کسر نمایید.\n  ۲. در صورتی که عیار ری‌گیری شده کمتر از ۷۵۰ (مثلاً ۷۴۰ یا ۷۳۵) باشد، فرمول تبدیل عیار: \`(وزن × عیار آزمایشگاه) ÷ ۷۵۰\` اعمال گردد.\n  ۳. در تب **«تعویض طلای کهنه»** می‌توانید رسید رسمی مابه‌التفاوت را با ۱ کلیک به واتساپ مشتری ارسال کنید.`;
  }

  if (q.includes('سکه') || q.includes('حباب') || q.includes('شمش') || q.includes('سرمایه')) {
    const intrinsicCoin = Math.round(8.133 * 0.9 * rates.gram24kToman);
    const bubble = Math.max(0, rates.coinEmamiToman - intrinsicCoin);
    const bubblePct = ((bubble / rates.coinEmamiToman) * 100).toFixed(1);
    return `🪙 **تحلیل لحظه‌ای حباب سکه و مقایسه با شمش و طلای آب‌شده:**\n\n• **نرخ روز سکه امامی:** ${coin} تومان\n• **ارزش ذاتی طلای سکه:** ${intrinsicCoin.toLocaleString('en-US')} تومان (بر مبنای ۸.۱۳۳ گرم با عیار ۹۰۰)\n• **حباب فعلی سکه:** حدود **${bubble.toLocaleString('en-US')} تومان (${bubblePct}٪)**\n• **پیشنهاد هوشمند:** برای سرمایه‌گذاری بدون حباب، خرید شمش ۲۴ عیار سوئیسی (۹۹۹.۹) یا طلای کم‌اجرت زنجیر کارتیه و النگوی دامله ریسک حباب را به صفر می‌رساند.`;
  }

  return `✨ **پاسخ هوشمند دستیار طلایار جهانی (بر مبنای نرخ زنده تابلو):**\n\n• **گرم ۱۸ عیار (۷۵۰):** ${g18} تومان | **مثقال ۱۷ عیار:** ${rates.mithqalToman.toLocaleString('en-US')} تومان\n• **انس جهانی طلا (XAU):** $${oz} | **سکه تمام امامی:** ${coin} تومان\n• **راهنمایی سریع:**\n  - جهت محاسبه آنی قیمت تک‌فروشی و عمده بنکداری، از بخش **«ویترین و قیمت‌گذاری زنده»** استفاده کنید.\n  - برای محاسبه طلای کارکرده مشتری و ارسال فاکتور واتساپ، به بخش **«تعویض طلای کهنه»** بروید.\n  - برای خروجی اینستاگرام گالری، از **«استوری‌ساز ۱ کلیکی HD»** استفاده نمایید.`;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // 1. Live Rates API
  app.get('/api/rates', (_req, res) => {
    res.json(marketRates);
  });

  app.post('/api/rates', (req, res) => {
    const updated = recalculateDerivedRates(req.body || {});
    res.json(updated);
  });

  // 1.5 Digital Gold QR Certificates API (شناسنامه دیجیتال اصالت طلا)
  const issuedCertificates: Array<{
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
  }> = [
    {
      certId: 'TY-CERT-2026-8941',
      customerName: 'سرکار خانم الهه رادمهر',
      customerPhone: '09121112233',
      productNameFa: 'سرویس کامل عروس تراش الماس ایتالیایی رویال',
      productNameEn: 'Royal Italian Diamond-Cut Full Bridal Gold Set',
      productCode: 'TY-BR-101',
      weightGrams: 42.65,
      karat: 18,
      makingChargePercent: 16.5,
      purchaseUnitRateToman: 5950000,
      purchaseTotalToman: 319400000,
      galleryName: marketRates.galleryName,
      issuedAt: '1405/06/15',
    },
  ];

  app.get('/api/certificates', (_req, res) => {
    res.json({ certificates: issuedCertificates });
  });

  app.post('/api/certificates', (req, res) => {
    const body = req.body || {};
    const newCert = {
      certId: body.certId || `TY-CERT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: body.customerName || 'مشتری گرامی گالری',
      customerPhone: body.customerPhone || '',
      productNameFa: body.productNameFa || 'مصنوع طلا و جواهر',
      productNameEn: body.productNameEn || 'Fine Gold Jewelry',
      productCode: body.productCode || 'TY-100',
      weightGrams: Number(body.weightGrams) || 10,
      karat: Number(body.karat) || 18,
      makingChargePercent: Number(body.makingChargePercent) || 12,
      purchaseUnitRateToman: Number(body.purchaseUnitRateToman) || marketRates.gram18kToman,
      purchaseTotalToman: Number(body.purchaseTotalToman) || 0,
      galleryName: body.galleryName || marketRates.galleryName,
      issuedAt: body.issuedAt || new Date().toLocaleDateString('fa-IR'),
    };
    issuedCertificates.unshift(newCert);
    res.json({ ok: true, certificate: newCert, certificates: issuedCertificates });
  });

  app.post('/api/rates/tick', (_req, res) => {
    // Subtle realistic market fluctuation (+/- 0.15%)
    const delta = 1 + (Math.random() - 0.48) * 0.0025;
    const new18k = Math.round((marketRates.gram18kToman * delta) / 1000) * 1000;
    const newOunce = Number((marketRates.ounceUsd * delta).toFixed(2));
    const newCoin = Math.round((marketRates.coinEmamiToman * delta) / 50000) * 50000;
    const updated = recalculateDerivedRates({
      gram18kToman: new18k,
      ounceUsd: newOunce,
      coinEmamiToman: newCoin,
    });
    res.json(updated);
  });

  // 2. AI Gold & Jewelry Assistant API (Server-side Gemini API + Automatic Offline Fallback)
  app.post('/api/ai-assistant', async (req, res) => {
    const { prompt, lang = 'fa' } = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 10) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const systemInstruction =
          lang === 'en'
            ? `You are the TalaYar Global VIP Smart Gold & Jewelry Advisor (part of Creation Ecosystem | New Metaversity World | FBNM Stage). Current live board rates: 18K Gram = ${marketRates.gram18kToman} Toman, 24K Gram = ${marketRates.gram24kToman} Toman, Global Spot Ounce XAU = $${marketRates.ounceUsd}, Emami Coin = ${marketRates.coinEmamiToman} Toman, USD = ${marketRates.usdToToman} Toman, AED = ${marketRates.aedToToman} Toman. Provide concise, mathematically accurate answers for jewelers and customers regarding Iran Gold Union rules (7% seller profit, 10% VAT on profit+making charge only), B2B wholesale gold-for-gold settlement, Dubai 21K/22K/24K pricing, coin bubble analysis, and scrap gold trade-in.`
            : `تو دستیار فوق‌تخصصی «طلایار جهانی | TalaYar Global VIP» (اکوسیستم آفرینش | شهر جدید نیومتاورسیتی جهان | توان استیج FBNM) هستی. نرخ‌های لحظه‌ای تابلو: هر گرم طلای ۱۸ عیار = ${marketRates.gram18kToman} تومان، طلای ۲۴ عیار = ${marketRates.gram24kToman} تومان، مثقال = ${marketRates.mithqalToman} تومان، انس جهانی = $${marketRates.ounceUsd}، سکه امامی = ${marketRates.coinEmamiToman} تومان. پاسخ‌های دقیق، کوتاه، محترمانه و کاملاً محاسباتی بر اساس فرمول اتحادیه طلا و جواهر ایران (سود طلافروش ${marketRates.defaultProfitPercent}٪، مالیات ${marketRates.defaultTaxPercent}٪ فقط روی سود و اجرت)، بنکداری طلا به طلا، تشخیص عیار، حباب سکه و تعویض طلای کهنه ارائه بده.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.4,
          },
        });

        if (response.text) {
          res.json({
            reply: response.text,
            source: 'gemini-live',
            ratesSnapshot: {
              gram18kToman: marketRates.gram18kToman,
              ounceUsd: marketRates.ounceUsd,
            },
          });
          return;
        }
      } catch (_err) {
        // Gracefully fall back to the built-in offline expert engine
      }
    }

    // Automatic Offline Expert Responder
    const fallbackReply = buildOfflineExpertResponse(prompt, lang === 'en' ? 'en' : 'fa', marketRates);
    res.json({
      reply: fallbackReply,
      source: 'offline-expert-engine',
      ratesSnapshot: {
        gram18kToman: marketRates.gram18kToman,
        ounceUsd: marketRates.ounceUsd,
      },
    });
  });

  // 3. Inspect /android files API
  app.get('/api/android-files', (_req, res) => {
    const androidDir = path.resolve(__dirname, 'android');
    const files: Array<{ path: string; size: number; content: string }> = [];

    function walk(dir: string) {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
        } else {
          const relPath = path.relative(__dirname, fullPath).replace(/\\/g, '/');
          const content = fs.readFileSync(fullPath, 'utf-8');
          files.push({
            path: `/${relPath}`,
            size: Buffer.byteLength(content, 'utf-8'),
            content,
          });
        }
      }
    }

    walk(androidDir);
    res.json({
      package: 'com.talayar.global',
      gradleVersion: '8.5',
      workflowPath: '/android/android-release-workflow.yml',
      files,
    });
  });

  // 4. Direct GitHub Push Engine (/api/github/direct-push)
  // Pushes project files + /android (and keeps workflow in /android/android-release-workflow.yml so tokens without workflow scope never get 403 Denied!)
  app.post('/api/github/direct-push', async (req, res) => {
    const { token, owner, repo, branch = 'main', commitMessage = 'Deploy TalaYar Global VIP Full-Stack + Android Gradle 8.5' } = req.body || {};

    if (!token || !owner || !repo) {
      res.status(400).json({
        ok: false,
        error: 'لطفاً توکن گیت‌هاب (PAT)، نام کاربری (Owner) و نام مخزن (Repo) را وارد کنید.',
      });
      return;
    }

    const ignoredDirs = new Set(['node_modules', 'dist', '.git', '.github']);
    const collectedFiles: Array<{ relPath: string; base64: string }> = [];

    function collectWorkspaceFiles(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (ignoredDirs.has(entry.name)) continue;
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          collectWorkspaceFiles(fullPath);
        } else {
          const relPath = path.relative(__dirname, fullPath).replace(/\\/g, '/');
          const buf = fs.readFileSync(fullPath);
          collectedFiles.push({
            relPath,
            base64: buf.toString('base64'),
          });
        }
      }
    }

    try {
      collectWorkspaceFiles(__dirname);

      const headers: Record<string, string> = {
        Authorization: `Bearer ${token.trim()}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'TalaYar-Global-VIP-DirectPush',
      };

      const logs: string[] = [];
      logs.push(`🔍 بررسی دسترسی به مخزن ${owner}/${repo}...`);

      const repoCheck = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
      if (!repoCheck.ok) {
        const errText = await repoCheck.text();
        res.status(repoCheck.status).json({
          ok: false,
          error: `خطا در دسترسی به مخزن (${repoCheck.status}): لطفاً صحت نام مخزن و دسترسی توکن را بررسی کنید.`,
          details: errText,
          logs,
        });
        return;
      }

      logs.push(`✅ اتصال به مخزن ${owner}/${repo} برقرار شد. تعداد فایل‌های آماده ارسال: ${collectedFiles.length} فایل (بدون پوشه .github جهت جلوگیری از خطای Denied).`);

      // Push key files or create Git tree
      let pushedCount = 0;
      for (const file of collectedFiles) {
        // Check if file exists to get sha
        const fileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURI(file.relPath)}?ref=${encodeURIComponent(branch)}`;
        const existingRes = await fetch(fileUrl, { headers });
        let sha: string | undefined;
        if (existingRes.ok) {
          const existingJson = (await existingRes.json()) as { sha?: string };
          sha = existingJson.sha;
        }

        const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeURI(file.relPath)}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            message: commitMessage,
            content: file.base64,
            branch,
            ...(sha ? { sha } : {}),
          }),
        });

        if (putRes.ok) {
          pushedCount++;
        } else {
          const errBody = await putRes.text();
          logs.push(`⚠️ هشدار در ارسال ${file.relPath}: ${putRes.status} - ${errBody.slice(0, 120)}`);
        }
      }

      logs.push(`🎉 عملیات پوش مستقیم با موفقیت به پایان رسید! (${pushedCount} از ${collectedFiles.length} فایل در شاخه ${branch} ثبت شد).`);
      logs.push(`📦 فایل ورک‌فلو اندروید در مسیر /android/android-release-workflow.yml قرار دارد.`);

      res.json({
        ok: true,
        pushedCount,
        totalFiles: collectedFiles.length,
        repoUrl: `https://github.com/${owner}/${repo}/tree/${branch}`,
        logs,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      res.status(500).json({
        ok: false,
        error: `خطای ارتباط با گیت‌هاب: ${msg}`,
      });
    }
  });

  // Mount Vite in dev or static dist in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TalaYar Global VIP Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
