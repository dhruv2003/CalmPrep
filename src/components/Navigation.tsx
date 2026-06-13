'use client';

import { useAuth } from './AuthProvider';
import { useLanguage } from './LanguageProvider';
import { signOut } from '@/lib/firebase/auth';
import { Language } from '@/lib/i18n';
import Link from 'next/link';
import { ClipboardCheck, Home, LogOut, UserCircle } from 'lucide-react';

import { usePathname, useRouter } from 'next/navigation';

function LangButton({
  lang,
  label,
  language,
  setLanguage,
}: {
  lang: Language;
  label: string;
  language: Language;
  setLanguage: (lang: Language) => void;
}) {
  return (
    <button
      onClick={() => setLanguage(lang)}
      className={`px-3 py-1.5 text-sm font-black rounded-md transition-all
        ${language === lang 
          ? 'bg-[#ffe66d] text-[#141414] shadow-[2px_2px_0_0_#141414]' 
          : 'bg-white text-[#141414] hover:bg-[#b8f7d4]'}
      `}
    >
      {label}
    </button>
  );
}

function MobileNavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof Home;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg border-2 border-[#141414] px-2 py-2 text-xs font-black shadow-[2px_2px_0_0_#141414] transition-colors ${
        active ? 'bg-[#ffe66d]' : 'bg-white hover:bg-[#b8f7d4]'
      }`}
    >
      <Icon size={20} />
      <span className="leading-none">{label}</span>
    </Link>
  );
}

export const Navigation = () => {
  const { user, isDemoMode } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    if (!isDemoMode) {
      await signOut();
    }
    router.push('/');
  };

  const showAppLinks = Boolean(user || isDemoMode);

  return (
    <nav className="sticky top-0 z-20 border-b-4 border-[#141414] bg-[#ffffff]/95 p-3 backdrop-blur sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="flex min-w-0 items-center gap-2 text-xl font-black tracking-tight neo-hover">
          <span className="text-2xl">🧠</span>
          <span className="truncate">{t.appTitle}</span>
        </Link>
        
        <div className="flex items-center gap-2 sm:gap-4">
          {showAppLinks && (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/check-in"
                className="flex items-center gap-2 font-black px-3 py-2 border-2 border-[#141414] rounded-lg bg-[#b8f7d4] shadow-[2px_2px_0_0_#141414] hover:bg-[#ffe66d] transition-colors"
              >
                <ClipboardCheck size={18} />
                <span>{t.checkInNav}</span>
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-2 font-black px-3 py-2 border-2 border-[#141414] rounded-lg bg-white shadow-[2px_2px_0_0_#141414] hover:bg-[#9ddcff] transition-colors"
              >
                <UserCircle size={18} />
                <span>{t.profile}</span>
              </Link>
            </div>
          )}

          <div className="hidden sm:inline-flex items-center bg-white border-2 border-[#141414] p-1 rounded-lg gap-1 shadow-[2px_2px_0_0_#141414]">
            <LangButton lang="en" label="EN" language={language} setLanguage={setLanguage} />
            <LangButton lang="hi" label="हिन्दी" language={language} setLanguage={setLanguage} />
            <LangButton lang="mr" label="मराठी" language={language} setLanguage={setLanguage} />
          </div>
          
          {user && (
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-2 font-bold px-3 py-2 border-2 border-border rounded bg-danger text-white neo-hover"
              aria-label={t.signOut}
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">{t.logout}</span>
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1 rounded-lg border-2 border-[#141414] bg-white p-1 shadow-[2px_2px_0_0_#141414] sm:hidden">
        <LangButton lang="en" label="EN" language={language} setLanguage={setLanguage} />
        <LangButton lang="hi" label="हिन्दी" language={language} setLanguage={setLanguage} />
        <LangButton lang="mr" label="मराठी" language={language} setLanguage={setLanguage} />
      </div>

      {showAppLinks && (
        <div aria-label={t.primaryMobileNavigation} className="mt-3 grid grid-cols-3 gap-2 md:hidden">
          <MobileNavLink href="/" label={t.home} icon={Home} active={pathname === '/'} />
          <MobileNavLink href="/check-in" label={t.checkInNav} icon={ClipboardCheck} active={pathname === '/check-in'} />
          <MobileNavLink href="/profile" label={t.profile} icon={UserCircle} active={pathname === '/profile'} />
        </div>
      )}
    </nav>
  );
};
