'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Brain, CheckCircle2, Languages, Mail, ShieldCheck, UserCircle } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/components/AuthProvider';
import { useLanguage } from '@/components/LanguageProvider';

export default function ProfilePage() {
  const { user, profile, loading, isDemoMode } = useAuth();
  const { language, t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && !isDemoMode) {
      router.push('/');
    }
  }, [isDemoMode, loading, router, user]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-xl">{t.loadingProfile}</div>;
  }

  if (!user && !isDemoMode) {
    return null;
  }

  const displayName = profile?.name || user?.displayName || t.demoStudentName;
  const email = profile?.email || user?.email || 'demo@student.com';
  const guardianEmail = profile?.guardianEmail || t.notAddedYet;
  const guardianEnabled = Boolean(profile?.guardianConsentEnabled);

  return (
    <div className="min-h-screen bg-[#f6f1ff]">
      <Navigation />
      <main className="max-w-6xl mx-auto px-4 py-8 md:p-8 flex flex-col gap-6">
        <section className="relative overflow-hidden rounded-xl border-4 border-[#141414] bg-[#9ddcff] shadow-[8px_8px_0_0_#141414]">
          <Image
            src="/background_minfulness.jpeg"
            alt=""
            fill
            className="object-cover opacity-25"
            sizes="100vw"
          />
          <div className="relative p-5 md:p-8 flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-[#141414] bg-white shadow-[5px_5px_0_0_#141414]">
                {user?.photoURL ? (
                  <Image src={user.photoURL} alt={displayName} fill className="object-cover" sizes="96px" />
                ) : (
                  <Image src="/calm_mascot.png" alt="CalmPrep mascot" fill className="object-cover" sizes="96px" />
                )}
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-[#7c5cff]">{t.profile}</p>
                <h1 className="text-3xl md:text-5xl font-black leading-tight">{t.profileTitle}</h1>
                <p className="mt-2 max-w-2xl text-lg font-bold opacity-80">{t.profileSubtitle}</p>
              </div>
            </div>
            <Link href="/check-in" className="neo-btn-primary bg-[#ffe66d] text-[#141414] text-center">
              {t.startCheckIn}
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
          <div className="neo-card bg-white border-4 shadow-[6px_6px_0_0_#141414]">
            <h2 className="text-2xl font-black mb-5 flex items-center gap-2">
              <UserCircle /> {t.studentAccount}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ProfileField label={t.nameLabel} value={displayName} icon={<Brain size={20} />} color="bg-[#b8f7d4]" />
              <ProfileField label={t.emailLabel} value={email} icon={<Mail size={20} />} color="bg-[#ffe66d]" />
              <ProfileField label={t.languageLabel} value={language.toUpperCase()} icon={<Languages size={20} />} color="bg-[#9ddcff]" />
              <ProfileField
                label={t.modeLabel}
                value={isDemoMode ? t.demoAccount : t.firebaseAccount}
                icon={<CheckCircle2 size={20} />}
                color="bg-[#f6f1ff]"
              />
            </div>
          </div>

          <div className="neo-card bg-[#7c5cff] text-white border-4 shadow-[6px_6px_0_0_#141414]">
            <h2 className="text-2xl font-black mb-5 flex items-center gap-2">
              <ShieldCheck /> {t.safetySetup}
            </h2>
            <div className="rounded-lg border-3 border-[#141414] bg-white text-[#141414] p-4 shadow-[4px_4px_0_0_#141414]">
              <p className="text-sm font-black uppercase tracking-wide opacity-70">{t.trustedGuardian}</p>
              <p className="mt-1 text-lg font-black break-words">{guardianEmail}</p>
            </div>
            <div className="mt-4 rounded-lg border-3 border-[#141414] bg-[#ffe66d] text-[#141414] p-4 shadow-[4px_4px_0_0_#141414]">
              <p className="text-sm font-black uppercase tracking-wide opacity-70">{t.safetyAlerts}</p>
              <p className="mt-1 text-lg font-black">{guardianEnabled ? t.enabledWithConsent : t.notEnabled}</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/check-in" className="neo-card bg-[#b8f7d4] border-4 font-black hover:bg-[#ffe66d] transition-colors">
            {t.dailyCheckIn}
          </Link>
          <Link href="/report" className="neo-card bg-[#ffe66d] border-4 font-black hover:bg-[#9ddcff] transition-colors">
            {t.latestInsight}
          </Link>
          <Link href="/onboarding" className="neo-card bg-white border-4 font-black hover:bg-[#b8f7d4] transition-colors">
            {t.updateSafetySetup}
          </Link>
        </section>
      </main>
    </div>
  );
}

function ProfileField({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  color: string;
}) {
  return (
    <div className={`${color} rounded-lg border-3 border-[#141414] p-4 shadow-[4px_4px_0_0_#141414]`}>
      <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wide opacity-70">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-lg font-black break-words">{value}</p>
    </div>
  );
}
