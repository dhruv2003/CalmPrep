'use client';

import { useAuth } from './AuthProvider';
import { useLanguage } from './LanguageProvider';
import { signOut } from '@/lib/firebase/auth';
import { Language } from '@/lib/i18n';
import Link from 'next/link';
import { ClipboardCheck, LogOut, UserCircle } from 'lucide-react';

import { useRouter } from 'next/navigation';

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

export const Navigation = () => {
  const { user, isDemoMode } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();

  const handleSignOut = async () => {
    if (!isDemoMode) {
      await signOut();
    }
    router.push('/');
  };

  const showAppLinks = Boolean(user || isDemoMode);

  return (
    <nav className="p-4 border-b-4 border-[#141414] bg-[#ffffff]/95 backdrop-blur flex justify-between items-center sticky top-0 z-20">
      <Link href="/" className="text-xl font-black tracking-tight flex items-center gap-2 neo-hover">
        <span className="text-2xl">🧠</span> {t.appTitle}
      </Link>
      
      <div className="flex items-center gap-2 sm:gap-4">
        {showAppLinks && (
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/check-in"
              className="flex items-center gap-2 font-black px-3 py-2 border-2 border-[#141414] rounded-lg bg-[#b8f7d4] shadow-[2px_2px_0_0_#141414] hover:bg-[#ffe66d] transition-colors"
            >
              <ClipboardCheck size={18} />
              <span>Check-in</span>
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
            aria-label="Sign out"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        )}
      </div>
    </nav>
  );
};
