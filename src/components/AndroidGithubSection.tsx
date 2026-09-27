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
} from 'lucide-react';
import { AndroidFileItem, Language } from '../types/gold';

interface AndroidGithubSectionProps {
  lang: Language;
  themeMode: 'light' | 'dark';
  onTriggerPWAInstall: () => void;
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

  // GitHub Direct Push State
  const [ghToken, setGhToken] = useState('');
  const [ghOwner, setGhOwner] = useState('');
  const [ghRepo, setGhRepo] = useState('talayar-global-vip');
  const [ghBranch, setGhBranch] = useState('main');
  const [pushLoading, setPushLoading] = useState(false);
  const [pushLogs, setPushLogs] = useState<string[]>([]);
  const [pushError, setPushError] = useState<string | null>(null);

  const isLight = themeMode === 'light';

  useEffect(() => {
    fetch('/api/android-files')
      .then((r) => r.json())
      .then((data) => {
        if (data?.files) {
          setAndroidFiles(data.files);
        }
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
    setPushLogs([
      lang === 'fa'
        ? '⏳ در حال آماده‌سازی فایل‌های پروژه و پوشه /android...'
        : '⏳ Preparing project files and /android directory...',
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
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setPushError(data.error || 'خطا در ارسال به گیت‌هاب');
        if (data.logs) setPushLogs(data.logs);
      } else {
        setPushLogs(data.logs || ['✅ پوش مستقیم با موفقیت انجام شد!']);
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
            {lang === 'fa'
              ? '۰۴. مرکز نصب PWA + پروژه کامل اندروید (/android) و موتور پوش مستقیم به گیت‌هاب'
              : '04. Instant PWA + Native Android Project (/android) & Direct GitHub Push Engine'}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mt-1">
            {lang === 'fa'
              ? 'خروجی استاندارد APK و AAB (گوگل‌پلی، کافه‌بازار و مایکت) با پکیج com.talayar.global'
              : 'Gradle 8.5 Native Android Package (com.talayar.global) & 1-Click GitHub Push'}
          </h2>
        </div>

        <button
          onClick={onTriggerPWAInstall}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm cursor-pointer transition-colors"
        >
          <Smartphone className="w-5 h-5" />
          <span>
            {lang === 'fa'
              ? '📲 نصب آنی روی آیفون و اندروید (PWA)'
              : '📲 Instant Install on iOS & Android (PWA)'}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        {/* Left: /android File Explorer */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-bold text-lg">
              <FolderCode className="w-5 h-5 text-amber-500" />
              <span>
                {lang === 'fa'
                  ? 'فایل‌های پروژه اندروید (/android — Gradle 8.5)'
                  : 'Android Studio Project Tree (/android — Gradle 8.5)'}
              </span>
            </div>
            <span className="text-xs font-tabular text-emerald-500 font-semibold">
              Package: com.talayar.global · بدون پوشه .github در ریشه (ضد خطای Denied)
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

        {/* Right: Direct GitHub Push Engine */}
        <div
          className={`lg:col-span-5 rounded-2xl border p-6 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/90 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2.5 text-lg font-bold text-amber-500 mb-2">
            <GitBranch className="w-5 h-5" />
            <h3>
              {lang === 'fa'
                ? 'موتور پوش مستقیم به گیت‌هاب (/api/github/direct-push)'
                : 'Direct GitHub Push Engine (/api/github/direct-push)'}
            </h3>
          </div>
          <p className="text-xs opacity-80 leading-relaxed mb-5">
            {lang === 'fa'
              ? 'ارسال مستقیم کل سورس پروژه + پوشه کامل /android به مخزن گیت‌هاب شما. فایل ورک‌فلو در /android/android-release-workflow.yml قرار گرفته تا خطای Denied مربوط به پوشه .github هرگز رخ ندهد.'
              : 'Push the entire full-stack project and /android folder directly to your GitHub repository without .github permission errors.'}
          </p>

          <form onSubmit={handleDirectPush} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1">
                {lang === 'fa' ? 'توکن دسترسی گیت‌هاب (GitHub Personal Access Token)' : 'GitHub PAT Token'}
              </label>
              <input
                type="password"
                required
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={ghToken}
                onChange={(e) => setGhToken(e.target.value)}
                dir="ltr"
                className={`w-full px-4 py-2.5 rounded-xl border font-tabular text-sm ${
                  isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1">
                  {lang === 'fa' ? 'نام کاربری گیت‌هاب (Owner)' : 'GitHub Owner'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="your-username"
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
                  {lang === 'fa' ? 'نام مخزن (Repository)' : 'Repository Name'}
                </label>
                <input
                  type="text"
                  required
                  value={ghRepo}
                  onChange={(e) => setGhRepo(e.target.value)}
                  dir="ltr"
                  className={`w-full px-4 py-2.5 rounded-xl border font-tabular text-sm ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">
                {lang === 'fa' ? 'شاخه (Branch)' : 'Target Branch'}
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

            <button
              type="submit"
              disabled={pushLoading}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base transition-colors cursor-pointer"
            >
              <UploadCloud className="w-5 h-5" />
              <span>
                {pushLoading
                  ? lang === 'fa'
                    ? 'در حال ارسال مستقیم به گیت‌هاب...'
                    : 'Pushing files to GitHub...'
                  : lang === 'fa'
                  ? 'پوش مستقیم پروژه و اندروید به گیت‌هاب'
                  : 'Direct Push Project & /android to GitHub'}
              </span>
            </button>
          </form>

          {pushError && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 text-xs">
              {pushError}
            </div>
          )}

          {pushLogs.length > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs space-y-1 max-h-40 overflow-y-auto">
              {pushLogs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-amber-500/20 flex items-start gap-2.5 text-xs opacity-80">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <span>
              {lang === 'fa'
                ? 'آماده انتشار در گوگل‌پلی (AAB)، کافه‌بازار و مایکت (APK) با امضای دیجیتال Release و پشتیبانی از زبان فارسی و انگلیسی.'
                : 'Ready for Google Play Store (AAB), CafeBazaar, and Myket (APK) distribution.'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
