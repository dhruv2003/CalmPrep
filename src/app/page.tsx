'use client';

import { useAuth } from '@/components/AuthProvider';
import { useLanguage } from '@/components/LanguageProvider';
import { signInWithGoogle } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { useState, useEffect } from 'react';
import { AlertCircle, Brain, HeartPulse, LockKeyhole, Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const { user, isDemoMode, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !loading) {
      router.push('/check-in');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-xl">Loading...</div>;
  }

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      router.push('/onboarding');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to sign in. Please check your Firebase Authentication settings in the console to ensure Google sign-in is enabled.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#dff5ff]">
      <Image
        src="/background_minfulness.jpeg"
        alt=""
        fill
        priority
        className="object-cover opacity-35"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-[#f6f1ff]/75 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f6f1ff] to-transparent pointer-events-none" />

      <Navigation />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 md:p-8 flex flex-col lg:flex-row items-stretch justify-center gap-6 lg:gap-8 z-10 relative">
        
        {/* Left Side: Copy & Login */}
        <section className="flex-1 flex w-full">
          <div className="neo-card w-full bg-white/95 border-4 p-5 sm:p-7 md:p-8 shadow-[8px_8px_0_0_#141414] flex flex-col justify-between gap-8">
            <div className="flex flex-col gap-7">
              <div className="flex items-center justify-between gap-4">
                <div className="inline-flex items-center gap-3">
                  <div className="bg-[#7c5cff] text-white p-3 rounded-full border-4 border-[#141414] shadow-[3px_3px_0_0_#141414]">
                    <Brain size={34} />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-wide text-[#7c5cff]">{t.appTitle}</p>
                    <p className="text-sm font-bold opacity-70">{t.tagline}</p>
                  </div>
                </div>
                <div className="hidden sm:block relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-[#141414] bg-[#b8f7d4] shadow-[4px_4px_0_0_#141414]">
                  <Image
                    src="/calm_mascot.png"
                    alt="CalmPrep mascot"
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              </div>

              <div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[0.95] text-[#141414] max-w-xl">
                  {t.heroHeadline}
                </h1>
                <p className="mt-5 text-lg md:text-xl font-bold leading-relaxed max-w-lg text-[#242424]">
                  {t.heroBody}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: HeartPulse, label: t.heroFeatureOne, color: 'bg-[#b8f7d4]' },
                  { icon: Sparkles, label: t.heroFeatureTwo, color: 'bg-[#ffe66d]' },
                  { icon: LockKeyhole, label: t.heroFeatureThree, color: 'bg-[#9ddcff]' },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className={`${color} border-3 border-[#141414] rounded-lg px-3 py-3 font-black flex items-center gap-2 shadow-[3px_3px_0_0_#141414]`}>
                    <Icon size={18} className="shrink-0" />
                    <span className="text-sm leading-tight">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {isDemoMode && (
                <div className="bg-[#9ddcff] border-3 border-[#141414] rounded-lg px-4 py-3 font-black shadow-[3px_3px_0_0_#141414]">
                  {t.demoMode}
                </div>
              )}

              {error && (
                <div className="bg-[#ff6b6b] text-white p-4 border-4 border-[#141414] font-bold flex items-start gap-3 text-left rounded-lg">
                  <AlertCircle size={24} className="shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <button 
                onClick={handleLogin}
                className="w-full text-lg sm:text-xl py-4 px-5 font-black border-4 border-[#141414] rounded-lg shadow-[5px_5px_0_0_#141414] flex items-center justify-center gap-3 bg-[#ffe66d] hover:bg-[#b8f7d4] transition-all text-[#141414] active:translate-y-1 active:shadow-[1px_1px_0_0_#141414]"
              >
                <span className="grid h-10 w-10 place-items-center bg-white rounded-full border-3 border-[#141414] text-2xl font-black">G</span>
                {t.login}
              </button>
            </div>
          </div>
        </section>

        {/* Right Side: Motion Companion */}
        <section className="flex-1 w-full min-h-[360px] lg:min-h-0">
          <div className="relative h-full min-h-[360px] overflow-hidden rounded-xl border-4 border-[#141414] bg-[#7c5cff] shadow-[8px_8px_0_0_#141414]">
            <video
              className="absolute inset-0 h-full w-full object-cover opacity-70"
              src="/abstract_background_video.mp4"
              autoPlay
              muted
              loop
              playsInline
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-[#7c5cff]/20" />
            <div className="absolute left-4 right-4 top-4 flex justify-between gap-3">
              <div className="rounded-full border-3 border-[#141414] bg-[#ffe66d] px-4 py-2 text-sm font-black shadow-[3px_3px_0_0_#141414]">
                breathe
              </div>
              <div className="rounded-full border-3 border-[#141414] bg-[#b8f7d4] px-4 py-2 text-sm font-black shadow-[3px_3px_0_0_#141414]">
                reset
              </div>
            </div>
            <div className="absolute inset-0 grid place-items-center p-8">
              <div className="relative w-full max-w-md aspect-[16/11] rounded-2xl border-4 border-[#141414] bg-white/75 shadow-[8px_8px_0_0_#141414] overflow-hidden">
                <Image
                  src="/cloud_thingy.gif"
                  alt="Friendly floating cloud companion"
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="(max-width: 1024px) 90vw, 42vw"
                />
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 rounded-xl border-4 border-[#141414] bg-white/95 p-4 shadow-[4px_4px_0_0_#141414]">
              <p className="text-2xl font-black leading-none">Breathe. Focus. Continue.</p>
              <p className="mt-2 font-bold opacity-75">A small pause before the next study sprint.</p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
