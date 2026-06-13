'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useLanguage } from '@/components/LanguageProvider';
import { Navigation } from '@/components/Navigation';
import { CheckIn } from '@/lib/types';
import { getCheckIns } from '@/lib/firebase/firestore';
import { ShieldAlert, Heart, Brain, Sparkles, Activity } from 'lucide-react';
import Image from 'next/image';

export default function Report() {
  const { user, isDemoMode } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [checkIn, setCheckIn] = useState<CheckIn | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestCheckIn = async () => {
      if (isDemoMode) {
        const local = localStorage.getItem('demo_last_checkin');
        if (local) setCheckIn(JSON.parse(local));
      } else if (user) {
        const checkIns = await getCheckIns(user.uid);
        if (checkIns.length > 0) {
          setCheckIn(checkIns[0]); // newest first
        }
      }
      setLoading(false);
    };
    fetchLatestCheckIn();
  }, [user, isDemoMode]);

  if (loading) return <div className="p-8 text-xl font-bold">Loading insights...</div>;
  
  if (!checkIn || !checkIn.result) {
    return (
      <>
        <Navigation />
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">No recent check-in found</h1>
          <button onClick={() => router.push('/check-in')} className="neo-btn-primary">Go to Check-in</button>
        </div>
      </>
    );
  }

  const res = checkIn.result;
  const isUrgent = res.riskLevel === 'urgent';
  const isHigh = res.riskLevel === 'high';

  return (
    <>
      <Navigation />
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 pb-24 flex flex-col gap-8">
        
        {/* Safety Support Card */}
        {res.crisisSupportRequired && (
          <div className="neo-card bg-danger text-white border-white border-4 shadow-[8px_8px_0_0_#141414] animate-pulse">
            <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
              <ShieldAlert size={36} /> {t.crisisCardTitle}
            </h2>
            <p className="text-xl font-bold mb-4">{t.crisisCardText}</p>
            {res.guardianAlertRecommended && (
              <div className="bg-white text-ink p-4 font-bold border-2 border-ink rounded flex flex-col sm:flex-row justify-between items-center gap-4">
                <span>Guardian alert prepared.</span>
                <button className="neo-btn-secondary py-2 px-4 bg-warning whitespace-nowrap">
                  {t.notifyGuardian}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Insights Column */}
          <div className="flex-2 flex flex-col gap-8 w-full md:w-2/3">
            
            <div className="neo-card bg-surface">
              <h1 className="text-4xl font-black mb-4">Your Wellness Insight</h1>
              <p className="text-xl font-bold mb-4 p-4 bg-background border-2 border-border rounded-lg">
                &ldquo;{res.summary}&rdquo;
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-accent font-bold border-2 border-border rounded-full text-sm">
                  Mood: {res.moodLabel}
                </span>
                <span className={`px-3 py-1 font-bold border-2 border-border rounded-full text-sm ${isUrgent ? 'bg-danger text-white' : isHigh ? 'bg-warning' : 'bg-secondary'}`}>
                  Risk: {res.riskLevel.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="neo-card bg-secondary">
              <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
                <Activity /> {t.stressTriggers} & {t.emotionalPatterns}
              </h2>
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="font-bold text-lg mb-2">{t.stressTriggers}:</h3>
                  <ul className="list-disc pl-6 font-medium">
                    {res.stressTriggers.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">{t.emotionalPatterns}:</h3>
                  <ul className="list-disc pl-6 font-medium">
                    {res.emotionalPatterns.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
              </div>
            </div>

            <div className="neo-card bg-primary text-white">
              <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
                <Sparkles /> {t.personalizedCoping}
              </h2>
              <div className="flex flex-col gap-6">
                {res.copingStrategies.map((strategy, i) => (
                  <div key={i} className="bg-white text-ink p-4 rounded-lg border-2 border-border">
                    <h3 className="font-black text-xl mb-1">{strategy.title} ({strategy.durationMinutes} min)</h3>
                    <p className="font-bold text-sm text-gray-700 mb-3">{strategy.whyItHelps}</p>
                    <ol className="list-decimal pl-5 font-medium">
                      {strategy.steps.map((step, j) => <li key={j} className="mb-1">{step}</li>)}
                    </ol>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar Column */}
          <div className="flex-1 flex flex-col gap-8 w-full md:w-1/3">
            
            <div className="neo-card bg-calm-blue">
              <h2 className="text-xl font-black mb-3 flex items-center gap-2">
                <Brain /> {t.adaptiveMindfulness}
              </h2>
              <h3 className="font-bold text-lg mb-2">{res.mindfulnessExercise.title}</h3>
              <p className="font-medium text-sm mb-3">Duration: {res.mindfulnessExercise.durationMinutes} mins</p>
              {res.mindfulnessExercise.breathingPattern && (
                <p className="font-bold mb-3 px-2 py-1 bg-white border-2 border-border rounded inline-block">
                  Pattern: {res.mindfulnessExercise.breathingPattern}
                </p>
              )}
              <ul className="list-disc pl-5 font-medium text-sm">
                {res.mindfulnessExercise.steps.map((step, j) => <li key={j}>{step}</li>)}
              </ul>
            </div>

            <div className="neo-card bg-accent relative overflow-hidden pt-12 mt-12">
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32">
                <Image src="/calm_mascot.png" alt="Friendly mascot" fill className="object-contain drop-shadow-[4px_4px_0_var(--color-border)]" />
              </div>
              <h2 className="text-xl font-black mb-3 text-center">{t.empatheticCompanion}</h2>
              <p className="font-bold text-lg italic mb-4 text-center">&ldquo;{res.companionResponse.message}&rdquo;</p>
              <div className="bg-white p-3 border-2 border-border rounded font-medium">
                <span className="font-bold block mb-1">Follow up:</span>
                {res.companionResponse.followUpQuestion}
              </div>
            </div>

            <div className="neo-card bg-white">
              <h2 className="text-xl font-black mb-3 flex items-center gap-2 text-primary">
                <Heart /> {t.motivationalEncouragement}
              </h2>
              <p className="font-bold">{res.motivationalEncouragement}</p>
            </div>

            <div className="text-sm font-bold opacity-70 p-4 border-2 border-dashed border-border rounded-lg text-center">
              Safety Note: {res.safetyNote}
            </div>

          </div>
        </div>

      </main>
    </>
  );
}
