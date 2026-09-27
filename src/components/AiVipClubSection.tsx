import React, { useState } from 'react';
import {
  Bot,
  Send,
  Crown,
  Users,
  Award,
  CheckCircle2,
  Volume2,
  Lightbulb,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';
import { COMPETITOR_ANALYSIS, VIP_TIERS } from '../data/products';
import { Language, MarketMode, MarketRatesState } from '../types/gold';

interface AiVipClubSectionProps {
  rates: MarketRatesState;
  marketMode: MarketMode;
  lang: Language;
  themeMode: 'light' | 'dark';
  onSpeak: (text: string) => void;
}

export const AiVipClubSection: React.FC<AiVipClubSectionProps> = ({
  rates,
  marketMode,
  lang,
  themeMode,
  onSpeak,
}) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState<
    Array<{ role: 'user' | 'assistant'; text: string; source?: string }>
  >([
    {
      role: 'assistant',
      text:
        lang === 'fa'
          ? `سلام! من دستیار هوشمند «طلایار جهانی VIP» هستم. بر اساس نرخ لحظه‌ای تابلو (گرم ۱۸ عیار: ${rates.gram18kToman.toLocaleString('en-US')} تومان | انس جهانی: $${rates.ounceUsd})، هر سوالی درباره فرمول اتحادیه، اجرت بنکداری طلا به طلا، حباب سکه یا تعویض طلای کهنه دارید بپرسید.`
          : `Welcome! I am the TalaYar Global VIP Smart Advisor. Based on live spot rates (18K: ${rates.gram18kToman.toLocaleString('en-US')} Toman | Global XAU: $${rates.ounceUsd}), ask me anything about making charges, B2B gold-for-gold settlement, coin bubble analysis, or trade-ins.`,
      source: 'system-ready',
    },
  ]);

  // Visitor / Affiliate Commission Calculator State
  const [visitorMonthlySalesCount, setVisitorMonthlySalesCount] = useState<number>(12);
  const [selectedTierPriceToman, setSelectedTierPriceToman] = useState<number>(6500000);
  const [visitorPhone, setVisitorPhone] = useState('');
  const [whiteLabelBrand, setWhiteLabelBrand] = useState('');
  const [whiteLabelSubmitted, setWhiteLabelSubmitted] = useState(false);

  const isLight = themeMode === 'light';

  const quickQuestions =
    lang === 'fa'
      ? [
          'فرمول دقیق مالیات و سود اتحادیه طلا چگونه محاسبه می‌شود؟',
          'حباب فعلی سکه امامی چقدر است و شمش بهتر است یا سکه؟',
          'نحوه محاسبه طلای کهنه و کسر نگین در تعویض چیست؟',
          'فرمول تسویه بنکداری و کیفی (طلا به طلا) چگونه است؟',
        ]
      : [
          'Explain the Iran Gold Union making charge & VAT formula',
          'How do we calculate scrap gold trade-in value?',
          'How does B2B wholesale gold-for-gold settlement work?',
          'Analyze current coin bubble vs 24K Swiss bullion',
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
        body: JSON.stringify({ prompt: q, lang }),
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
          text:
            lang === 'fa'
              ? `بر اساس نرخ لحظه‌ای تابلو (${rates.gram18kToman.toLocaleString('en-US')} تومان)، فرمول تک‌فروشی شامل [وزن × نرخ گرم × (۱ + اجرت٪) × (۱ + سود ۷٪)] + ۱۰٪ مالیات بر مجموع سود و اجرت است.`
              : `Based on live board rate (${rates.gram18kToman.toLocaleString('en-US')} Toman), retail price = [Weight × Rate × (1 + Making%) × (1 + 7% Margin)] + 10% VAT on Making+Margin.`,
          source: 'offline-fallback',
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // Affiliate Commission Calculation (40% recurring commission!)
  const commissionRate = 0.4;
  const estimatedMonthlyCommission = Math.round(
    visitorMonthlySalesCount * selectedTierPriceToman * commissionRate
  );

  return (
    <div className="space-y-12" id="ai-vip">
      {/* Part 1: AI Gold & Jewelry Assistant (/api/ai-assistant) */}
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
              {lang === 'fa'
                ? '۰۵. دستیار هوشمند طلا و جواهر (/api/ai-assistant با Gemini API و پاسخگوی آفلاین خودکار)'
                : '05. Smart AI Gold & Jewelry Advisor (Gemini API + Offline Expert Engine)'}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mt-1">
              {lang === 'fa'
                ? 'مشاوره تخصصی فرمول اتحادیه، حباب سکه، بنکداری و تشخیص عیار'
                : '24/7 Intelligent Calculation, Coin Bubble & Wholesale Advisor'}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Quick Questions Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-sm font-bold text-amber-500 mb-2">
              {lang === 'fa'
                ? 'سوالات پرتکرار طلافروشان و مشتریان (کلیک کنید):'
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

          {/* Chat Conversation Box */}
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
                        ? lang === 'fa'
                          ? 'پرسش شما'
                          : 'You'
                        : lang === 'fa'
                        ? 'دستیار هوشمند طلایار جهانی'
                        : 'TalaYar AI Advisor'}
                    </span>
                    {m.role === 'assistant' && (
                      <button
                        onClick={() => onSpeak(m.text)}
                        className="inline-flex items-center gap-1 text-xs text-amber-500 hover:underline cursor-pointer"
                        title={lang === 'fa' ? 'قرائت صوتی پاسخ' : 'Read Aloud'}
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>{lang === 'fa' ? 'قرائت صوتی' : 'Speak'}</span>
                      </button>
                    )}
                  </div>
                  {m.text}
                </div>
              ))}
              {aiLoading && (
                <div className="text-sm text-amber-500 font-semibold animate-pulse">
                  {lang === 'fa'
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
                  lang === 'fa'
                    ? 'سوال خود درباره قیمت طلا، اجرت، سکه یا تعویض را بنویسید...'
                    : 'Ask about gold pricing, making charge, or trade-ins...'
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
                <span>{lang === 'fa' ? 'ارسال' : 'Ask'}</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Part 2: Competitive Edge & Creative Innovation Matrix (نقاط ضعف رقبا و نقاط قوت طلایار) */}
      <section
        className={`rounded-3xl border p-6 md:p-10 transition-colors ${
          isLight
            ? 'bg-white border-slate-200 shadow-sm text-slate-900'
            : 'bg-slate-900/70 border-slate-800 text-slate-100'
        }`}
      >
        <div className="pb-6 border-b border-amber-500/20">
          <span className="text-xs font-semibold text-emerald-500 tracking-wide">
            {lang === 'fa'
              ? '۰۶. تحلیل رقابتی بازار ایران و جهان + نوآوری‌های انحصاری (تبدیل ضعف رقبا به قدرت شما)'
              : '06. Global & Domestic Competitive Analysis — Turning Competitor Weaknesses into Your Strengths'}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mt-1">
            {lang === 'fa'
              ? 'چرا «طلایار جهانی VIP» رقبای داخلی و خارجی را پشت سر می‌گذارد؟'
              : 'Why TalaYar Global VIP Outshines Domestic & International Competitors'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {COMPETITOR_ANALYSIS.map((item, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border p-6 flex flex-col justify-between ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/90 border-slate-800'
              }`}
            >
              <div>
                <div className="text-xs font-bold text-amber-500 mb-1">
                  {lang === 'fa' ? item.categoryFa : item.categoryEn}
                </div>
                <h3 className="text-lg font-bold mb-4">
                  {lang === 'fa' ? item.competitorsFa : item.competitorsEn}
                </h3>

                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 mb-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-500 mb-1">
                    <ShieldAlert className="w-4 h-4" />
                    <span>{lang === 'fa' ? 'نقطه ضعف رقبا:' : 'Competitor Weakness:'}</span>
                  </div>
                  <p className="text-xs md:text-sm leading-relaxed opacity-90">
                    {lang === 'fa' ? item.weaknessFa : item.weaknessEn}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 mb-1">
                  <Lightbulb className="w-4 h-4" />
                  <span>
                    {lang === 'fa'
                      ? 'برتری خلاقانه طلایار جهانی:'
                      : 'TalaYar Global Superpower:'}
                  </span>
                </div>
                <p className="text-xs md:text-sm leading-relaxed font-medium">
                  {lang === 'fa' ? item.ourSuperpowerFa : item.ourSuperpowerEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Part 3: VIP Subscription Tiers (Levels 1 to 5) & Visitor/Affiliate Club */}
      <section
        className={`rounded-3xl border p-6 md:p-10 transition-colors ${
          isLight
            ? 'bg-white border-slate-200 shadow-sm text-slate-900'
            : 'bg-slate-900/70 border-slate-800 text-slate-100'
        }`}
      >
        <div className="pb-6 border-b border-amber-500/20">
          <span className="text-xs font-semibold text-amber-500 tracking-wide">
            {lang === 'fa'
              ? '۰۷. اشتراک VIP (سطوح ۱ تا ۵) + باشگاه نمایندگان فروش پورسانتی (ویزیتورها) و White-Label'
              : '07. VIP Subscription Tiers (Levels 1–5) + Affiliate Sales Club & White-Label'}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mt-1">
            {lang === 'fa'
              ? 'پکیج‌های اشتراک ویژه طلافروشان ایران و جهان + درآمدزایی ۴۰٪ ویزیتورها'
              : 'Global SaaS Licensing Tiers & 40% Commission Affiliate Club'}
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
                  {lang === 'fa' ? tier.titleFa : tier.titleEn}
                </h3>
                <div className="text-lg font-bold text-emerald-500 font-tabular my-3">
                  {marketMode === 'IR' ? tier.monthlyToman : tier.monthlyGlobalUsd}
                </div>
                <p className="text-xs opacity-75 mb-4">
                  {lang === 'fa' ? tier.audienceFa : tier.audienceEn}
                </p>
                <ul className="space-y-2 text-xs">
                  {(lang === 'fa' ? tier.featuresFa : tier.featuresEn).map((feat, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={`https://wa.me/${rates.galleryPhone.replace(/^0/, '98').replace(/\D/g, '')}?text=${encodeURIComponent(
                  `سلام، متقاضی فعال‌سازی ${tier.titleFa} در سامانه طلایار جهانی VIP هستم.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-6 w-full py-2.5 px-3 rounded-xl text-center font-bold text-xs block transition-colors ${
                  tier.highlighted
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    : 'bg-emerald-600 text-white hover:bg-emerald-500'
                }`}
              >
                {lang === 'fa' ? 'فعال‌سازی آنی اشتراک' : 'Activate VIP Tier'}
              </a>
            </div>
          ))}
        </div>

        {/* Affiliate / Visitor Club & White-Label Order */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Visitor Commission Calculator */}
          <div
            className={`rounded-2xl border p-6 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}
          >
            <div className="flex items-center gap-2 text-lg font-bold text-emerald-500 mb-2">
              <Users className="w-5 h-5" />
              <h3>
                {lang === 'fa'
                  ? 'باشگاه نمایندگان فروش و ویزیتورهای بازار طلا (۴۰٪ پورسانت نقدی)'
                  : 'Jewelry Market Sales Visitors & Affiliates Club (40% Commission)'}
              </h3>
            </div>
            <p className="text-xs opacity-80 mb-4 leading-relaxed">
              {lang === 'fa'
                ? 'ویزیتورهای حضوری بازارهای طلا و بازاریابان دیجیتال با معرفی هر طلافروشی در ایران، دبی یا ترکیه، ۴۰٪ پورسانت آنی و تمدید ماهانه دریافت می‌کنند.'
                : 'Earn 40% recurring commission for every jewelry store onboarded in Iran, Dubai, Turkey, or Europe.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold mb-1">
                  {lang === 'fa'
                    ? 'تعداد فروش ماهانه شما (تعداد گالری):'
                    : 'Monthly Galleries Onboarded:'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={visitorMonthlySalesCount}
                  onChange={(e) => setVisitorMonthlySalesCount(Math.max(1, Number(e.target.value)))}
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-tabular font-bold ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  {lang === 'fa' ? 'سطح اشتراک فروخته‌شده:' : 'Average Tier Sold:'}
                </label>
                <select
                  value={selectedTierPriceToman}
                  onChange={(e) => setSelectedTierPriceToman(Number(e.target.value))}
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-semibold text-sm ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                  }`}
                >
                  <option value={3800000}>سطح ۲ (۳,۸۰۰,۰۰۰ تومان)</option>
                  <option value={6500000}>سطح ۳ بنکداری (۶,۵۰۰,۰۰۰ تومان)</option>
                  <option value={12000000}>سطح ۴ بین‌المللی (۱۲,۰۰۰,۰۰۰ تومان)</option>
                  <option value={29000000}>سطح ۵ اختصاصی (۲۹,۰۰۰,۰۰۰ تومان)</option>
                </select>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold block">
                  {lang === 'fa'
                    ? 'درآمد پورسانت ماهانه شما (۴۰٪ خالص):'
                    : 'Your Monthly Affiliate Income (40%):'}
                </span>
                <span className="text-2xl font-bold text-emerald-500 font-tabular">
                  {estimatedMonthlyCommission.toLocaleString('en-US')} تومان
                </span>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-500" />
            </div>
          </div>

          {/* White-Label Order Form */}
          <div
            className={`rounded-2xl border p-6 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}
          >
            <div className="flex items-center gap-2 text-lg font-bold text-amber-500 mb-2">
              <Award className="w-5 h-5" />
              <h3>
                {lang === 'fa'
                  ? 'سفارش نسخه اختصاصی White-Label با نام و لوگوی گالری شما'
                  : 'Order Custom White-Label App for Your Gallery'}
              </h3>
            </div>
            <p className="text-xs opacity-80 mb-4 leading-relaxed">
              {lang === 'fa'
                ? 'تحویل نسخه اختصاصی با دامنه، لوگو و اپلیکیشن اندروید و iOS به نام گالری شما ظرف ۲۴ ساعت توسط تیم فنی اکوسیستم آفرینش (توان استیج FBNM).'
                : 'Get this entire platform customized with your jewelry brand logo, domain, and Play Store package within 24 hours.'}
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setWhiteLabelSubmitted(true);
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder={lang === 'fa' ? 'نام گالری / برند طلا و جواهر' : 'Your Jewelry Brand Name'}
                  value={whiteLabelBrand}
                  onChange={(e) => setWhiteLabelBrand(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                  }`}
                />
                <input
                  type="tel"
                  required
                  placeholder={lang === 'fa' ? 'شماره موبایل / واتساپ' : 'WhatsApp / Mobile Number'}
                  value={visitorPhone}
                  onChange={(e) => setVisitorPhone(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-tabular text-sm ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm cursor-pointer transition-colors"
              >
                {lang === 'fa'
                  ? 'ثبت درخواست نسخه اختصاصی White-Label و نمایندگی فروش'
                  : 'Submit White-Label & Partnership Request'}
              </button>

              {whiteLabelSubmitted && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-bold">
                  {lang === 'fa'
                    ? `✅ درخواست نسخه اختصاصی برای برند «${whiteLabelBrand}» ثبت شد. همکاران ما در واحد VIP با شماره ${visitorPhone} تماس خواهند گرفت.`
                    : `✅ Request registered for "${whiteLabelBrand}". Our VIP team will contact ${visitorPhone}.`}
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};
