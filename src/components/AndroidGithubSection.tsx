import React, { useEffect, useState } from 'react';
import {
  Smartphone,
  GitBranch,
  FolderCode,
  UploadCloud,
  Copy,
  Check,
  Download,
  ShieldCheck,
  Award,
  Lock,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { AndroidFileItem, Language } from '../types/gold';
import { isRtlLanguage } from '../utils/i18n';

interface AndroidGithubSectionProps {
  lang: Language;
  themeMode: 'light' | 'dark';
  onTriggerPWAInstall: () => void;
}

interface AutomationStatus {
  zeroTouchMode: boolean;
  apiVaultStatus: string;
  geminiStatus: string;
  githubStatus: string;
  androidGradleStatus: {
    gradleVersion: string;
    compileSdk: number;
    targetSdk: number;
    signingScheme: string;
    keyAlias: string;
    outputs: string[];
  };
}

export const AndroidGithubSection: React.FC<AndroidGithubSectionProps> = ({
  lang,
  themeMode,
  onTriggerPWAInstall,
}) => {
  const [androidFiles, setAndroidFiles] = useState<AndroidFileItem[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string>(
    '/android/android-release-workflow.yml'
  );
  const [copiedFile, setCopiedFile] = useState(false);
  const [autoStatus, setAutoStatus] = useState<AutomationStatus | null>(null);

  // Zero-Touch Automated GitHub Push & Signed Release State
  const [ghToken, setGhToken] = useState('');
  const [ghOwner, setGhOwner] = useState('talayar-global-vip');
  const [ghRepo, setGhRepo] = useState('talayar-global-vip');
  const [ghBranch, setGhBranch] = useState('main');
  const [autoCreateRelease, setAutoCreateRelease] = useState(true);
  const [releaseTag, setReleaseTag] = useState('v1.2.0-VIP-Signed');
  const [pushLoading, setPushLoading] = useState(false);
  const [pushLogs, setPushLogs] = useState<string[]>([]);
  const [pushError, setPushError] = useState<string | null>(null);
  const [releaseUrl, setReleaseUrl] = useState<string>('');

  const isLight = themeMode === 'light';
  const isRtl = isRtlLanguage(lang);

  useEffect(() => {
    fetch('/api/android-files')
      .then((r) => r.json())
      .then((data) => {
        if (data?.files) {
          setAndroidFiles(data.files);
        }
      })
      .catch(() => {});

    fetch('/api/security/automation-status')
      .then((r) => r.json())
      .then((data) => {
        if (data?.ok) setAutoStatus(data);
      })
      .catch(() => {});
  }, []);

  const currentFile =
    androidFiles.find((f) => f.path === selectedFilePath) || androidFiles[0] || null;

  const handleCopyFileContent = async () => {
    if (!currentFile) return;
    await navigator.clipboard.writeText(currentFile.content);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  const handleDownloadFile = () => {
    if (!currentFile) return;
    const blob = new Blob([currentFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.path.split('/').pop() || 'file.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDirectPush = async (e: React.FormEvent) => {
    e.preventDefault();
    setPushLoading(true);
    setPushError(null);
    setReleaseUrl('');
    setPushLogs([
      isRtl
        ? '🔒 در حال اجرای اتوماسیون ۱۰۰٪ خودکار سمت سرور (بدون نیاز به دخالت دستی): بررسی کلیدهای API، فایل‌های Gradle 8.5 و امضای RSA-2048 ریلیز گیت‌هاب...'
        : '🔒 Running Zero-Touch Server API Vault & Signed Release Automation...',
    ]);

    try {
      const res = await fetch('/api/github/direct-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: ghToken,
          owner: ghOwner,
          repo: ghRepo,
          branch: ghBranch,
          autoCreateRelease,
          releaseTag,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setPushError(data.error || 'خطا در ارسال به گیت‌هاب');
        if (data.logs) setPushLogs(data.logs);
      } else {
        setPushLogs(data.logs || ['✅ اتوماسیون پوش و امضای ریلیز گیت‌هاب با موفقیت انجام شد!']);
        if (data.releaseUrl) setReleaseUrl(data.releaseUrl);
      }
    } catch (err: unknown) {
      setPushError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setPushLoading(false);
    }
  };

  return (
    <section
      id="android-github"
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
              ? '۰۴. اتوماسیون ۱۰۰٪ امن کلیدهای API + فایل‌های Gradle ساخت و امضای خودکار APK و AAB + ریلیز امضاشده گیت‌هاب'
              : '04. Zero-Touch API Key Vault + Gradle 8.5 Signed APK / AAB & Automated GitHub Release'}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mt-1">
            {isRtl
              ? 'آماده انتشار مستقیم در گوگل‌پلی (AAB)، کافه‌بازار و مایکت (APK) با امضای خودکار RSA-2048 بدون دخالت دستی'
              : 'Ready for Google Play (Signed AAB), CafeBazaar & Myket (Signed APK) with Zero Manual Steps'}
          </h2>
        </div>

        <button
          onClick={onTriggerPWAInstall}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm cursor-pointer transition-colors"
        >
          <Smartphone className="w-5 h-5" />
          <span>
            {isRtl
              ? '📲 نصب آنی روی آیفون و اندروید (PWA)'
              : '📲 Instant Install on iOS & Android (PWA)'}
          </span>
        </button>
      </div>

      {/* Zero-Touch Server API Key & Android Signing Security Banner */}
      <div
        className={`mt-6 p-5 rounded-2xl border grid grid-cols-1 md:grid-cols-3 gap-4 ${
          isLight
            ? 'bg-emerald-50/70 border-emerald-200 text-slate-900'
            : 'bg-emerald-950/25 border-emerald-500/30 text-slate-100'
        }`}
      >
        <div className="flex items-start gap-3">
          <KeyRound className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-amber-500">
              {isRtl
                ? '۱. اتوماسیون ۱۰۰٪ امن کلیدهای API در سرور'
                : '1. Zero-Touch Server-Side API Vault'}
            </div>
            <p className="text-xs opacity-85 mt-1 leading-relaxed">
              {autoStatus?.geminiStatus ||
                (isRtl
                  ? 'مدیریت خودکار کلیدها در سمت سرور بدون نیاز به ورود دستی توسط کاربر.'
                  : 'Server-side vault manages API keys automatically without manual user input.')}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-emerald-500">
              {isRtl
                ? '۲. امضای خودکار دیجیتال APK و AAB (RSA-2048)'
                : '2. Cryptographic V1+V2 APK & AAB Signing'}
            </div>
            <p className="text-xs opacity-85 mt-1 leading-relaxed">
              {isRtl
                ? 'تولید خودکار release-key.jks و امضای همزمان V1 Jar + V2 Full APK + AAB Bundle در Gradle 8.5.'
                : 'Auto-generates release-key.jks with V1 + V2 + AAB signing in Gradle 8.5.'}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-amber-500">
              {isRtl
                ? '۳. آماده انتشار در مارکت‌های اندروید ایران و جهان'
                : '3. Ready for Google Play, CafeBazaar & Myket'}
            </div>
            <p className="text-xs opacity-85 mt-1 leading-relaxed font-tabular">
              TalaYar-Global-VIP-v1.2.0-signed.apk &amp; .aab (SDK 34)
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        {/* Left: /android File Explorer */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-bold text-lg">
              <FolderCode className="w-5 h-5 text-amber-500" />
              <span>
                {isRtl
                  ? 'فایل‌های کامل گرادل اندروید (/android — Gradle 8.5 امضاشده برای APK و AAB)'
                  : 'Complete Signed Android Gradle 8.5 Project (/android for APK & AAB)'}
              </span>
            </div>
            <span className="text-xs font-tabular text-emerald-500 font-semibold">
              Package: com.talayar.global · V1+V2+AAB Signed
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {androidFiles.map((f) => (
              <button
                key={f.path}
                onClick={() => setSelectedFilePath(f.path)}
                className={`px-3 py-1.5 rounded-lg text-xs font-tabular font-semibold border transition-colors cursor-pointer ${
                  selectedFilePath === f.path
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : isLight
                    ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {f.path.replace('/android/', '')}
              </button>
            ))}
          </div>

          {currentFile && (
            <div
              className={`rounded-2xl border overflow-hidden ${
                isLight ? 'bg-slate-900 text-slate-100 border-slate-300' : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90">
                <span className="font-tabular text-xs text-amber-400 font-semibold">
                  {currentFile.path} ({currentFile.size} bytes)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyFileContent}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer"
                  >
                    {copiedFile ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">کپی شد</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>کپی کد</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownloadFile}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>دانلود فایل</span>
                  </button>
                </div>
              </div>
              <pre className="p-4 text-xs font-tabular overflow-x-auto max-h-96 leading-relaxed text-slate-200" dir="ltr">
                {currentFile.content}
              </pre>
            </div>
          )}
        </div>

        {/* Right: Zero-Touch Direct GitHub Push & Auto-Signed Release Engine */}
        <div
          className={`lg:col-span-5 rounded-2xl border p-6 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/90 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2.5 text-lg font-bold text-amber-500 mb-2">
            <GitBranch className="w-5 h-5" />
            <h3>
              {isRtl
                ? 'اتوماسیون ۱-کلیکی ساخت و امضای ریلیز گیت‌هاب (بدون دخالت دستی)'
                : '1-Click Zero-Touch Signed GitHub Release Automation'}
            </h3>
          </div>
          <p className="text-xs opacity-85 leading-relaxed mb-4">
            {isRtl
              ? 'بدون نیاز به اجرای هیچ دستور دستی: سرور به صورت خودکار فایل ورک‌فلو (.github/workflows/android-release.yml) و پروژه Gradle 8.5 را بسته‌بندی کرده، امضای دیجیتال RSA-2048 را روی APK و AAB اعمال می‌کند و ریلیز رسمی گیت‌هاب را ثبت می‌نماید.'
              : 'Zero manual commands required: Automatically bundles .github/workflows/android-release.yml, applies RSA-2048 signing to both APK and AAB, and publishes a signed GitHub Release.'}
          </p>

          <form onSubmit={handleDirectPush} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold mb-1 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                <span>
                  {isRtl
                    ? 'توکن گیت‌هاب (اختیاری — خواندن خودکار از گاوصندوق امن سرور):'
                    : 'GitHub PAT (Optional — Auto-read from Server Vault):'}
                </span>
              </label>
              <input
                type="password"
                placeholder={
                  isRtl
                    ? 'خالی بگذارید تا از اتوماسیون خودکار سرور استفاده شود'
                    : 'Leave blank to use Zero-Touch Server Automation'
                }
                value={ghToken}
                onChange={(e) => setGhToken(e.target.value)}
                dir="ltr"
                className={`w-full px-4 py-2.5 rounded-xl border font-tabular text-xs ${
                  isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1">
                  {isRtl ? 'نام کاربری / سازمان (Owner)' : 'GitHub Owner'}
                </label>
                <input
                  type="text"
                  value={ghOwner}
                  onChange={(e) => setGhOwner(e.target.value)}
                  dir="ltr"
                  className={`w-full px-4 py-2.5 rounded-xl border font-tabular text-sm ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  {isRtl ? 'نام مخزن (ساخت خودکار)' : 'Repository Name'}
                </label>
                <input
                  type="text"
                  value={ghRepo}
                  onChange={(e) => setGhRepo(e.target.value)}
                  dir="ltr"
                  className={`w-full px-4 py-2.5 rounded-xl border font-tabular text-sm ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1">
                  {isRtl ? 'شاخه (Branch)' : 'Target Branch'}
                </label>
                <input
                  type="text"
                  value={ghBranch}
                  onChange={(e) => setGhBranch(e.target.value)}
                  dir="ltr"
                  className={`w-full px-4 py-2.5 rounded-xl border font-tabular text-sm ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  {isRtl ? 'تگ ریلیز امضاشده (Signed Tag)' : 'Signed Release Tag'}
                </label>
                <input
                  type="text"
                  value={releaseTag}
                  onChange={(e) => setReleaseTag(e.target.value)}
                  dir="ltr"
                  className={`w-full px-4 py-2.5 rounded-xl border font-tabular text-sm ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <span className="text-xs font-bold">
                {isRtl
                  ? 'امضای خودکار Keystore و انتشار ریلیز رسمی APK + AAB:'
                  : 'Auto-Sign Keystore & Publish Official APK + AAB Release:'}
              </span>
              <input
                type="checkbox"
                checked={autoCreateRelease}
                onChange={(e) => setAutoCreateRelease(e.target.checked)}
                className="w-5 h-5 accent-emerald-500 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={pushLoading}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm md:text-base transition-colors cursor-pointer"
            >
              <UploadCloud className="w-5 h-5" />
              <span>
                {pushLoading
                  ? isRtl
                    ? 'در حال اجرای اتوماسیون و امضای ریلیز...'
                    : 'Running Zero-Touch Signed Release...'
                  : isRtl
                  ? 'اجرای اتوماسیون ۱۰۰٪ خودکار (ساخت Gradle + امضای APK/AAB و ریلیز)'
                  : 'Run 1-Click Zero-Touch Gradle Build & Signed Release'}
              </span>
            </button>
          </form>

          {pushError && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 text-xs">
              {pushError}
            </div>
          )}

          {releaseUrl && (
            <a
              href={releaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-400 text-xs font-bold flex items-center justify-between"
            >
              <span>🏆 مشاهده ریلیز امضاشده در گیت‌هاب</span>
              <Award className="w-4 h-4" />
            </a>
          )}

          {pushLogs.length > 0 && (
            <div className="mt-4 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs space-y-1.5 max-h-48 overflow-y-auto leading-relaxed">
              {pushLogs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
