'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useLanguage } from '@/components/LanguageProvider';
import { Navigation } from '@/components/Navigation';
import { CheckIn, UserProfile } from '@/lib/types';
import { getCheckIns } from '@/lib/firebase/firestore';
import { ShieldAlert, Lightbulb, TrendingUp, Download, Sparkles, BookOpen, AlertCircle, HeartPulse, Shield as ShieldIcon } from 'lucide-react';
import { AlertTriangle, Activity, BrainCircuit, ChevronDown, ChevronUp } from 'lucide-react';
import { calculateBurnoutRadar, BurnoutRadar } from '@/lib/burnout';
import { createGuardianAlert, getUserProfile } from '@/lib/firebase/firestore';
import { buildGuardianAlert, isValidGuardianEmail } from '@/lib/guardian-alerts';

function getDemoCheckInHistory(latest: CheckIn): CheckIn[] {
  return [
    {
      ...latest,
      stressLevel: Math.max(1, latest.stressLevel - 2),
      sleepHours: Math.min(9, latest.sleepHours + 1.5),
      studyHours: Math.max(1, latest.studyHours - 1),
      riskLevel: 'low',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      ...latest,
      stressLevel: Math.max(1, latest.stressLevel - 1),
      sleepHours: Math.min(9, latest.sleepHours + 0.5),
      studyHours: latest.studyHours,
      riskLevel: 'moderate',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    latest,
  ];
}

export default function Report() {
  const { user, isDemoMode } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [checkIn, setCheckIn] = useState<CheckIn | null>(null);
  const [burnoutRadar, setBurnoutRadar] = useState<BurnoutRadar | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isPanicModeOpen, setIsPanicModeOpen] = useState(false);
  const [guardianStatus, setGuardianStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestCheckIn = async () => {
      if (isDemoMode) {
        const local = localStorage.getItem('demo_last_checkin');
        if (local) {
          const parsed = JSON.parse(local);
          const history = getDemoCheckInHistory(parsed);
          setCheckIn(parsed);
          setBurnoutRadar(calculateBurnoutRadar(history));
        }
      } else if (user) {
        const [history, userProfile] = await Promise.all([
          getCheckIns(user.uid),
          getUserProfile(user.uid),
        ]);
        setProfile(userProfile);
        if (history.length > 0) {
          setCheckIn(history[0]);
          setBurnoutRadar(calculateBurnoutRadar(history));
        }
      }
      setLoading(false);
    };
    fetchLatestCheckIn();
  }, [user, isDemoMode]);

  const handleNotifyGuardian = async () => {
    if (!checkIn) return;

    try {
      if (isDemoMode) {
        setGuardianStatus(t.guardianPreparedStatus);
        return;
      }

      if (!user || !profile) return;

      const alert = buildGuardianAlert({
        userId: user.uid,
        profile,
        checkIn,
      });

      await createGuardianAlert(alert);
      setGuardianStatus(t.guardianPreparedStatus);
    } catch (e) {
      console.error(e);
      setGuardianStatus(t.guardianUnavailableLabel);
    }
  };

  if (loading) return <div className="p-8 text-xl font-bold flex justify-center items-center h-screen">{t.loadingInsights}</div>;
  
  if (!checkIn || !checkIn.result) {
    return (
      <>
        <Navigation />
        <div className="p-8 text-center mt-20">
          <h1 className="text-3xl font-black mb-6">{t.noRecentCheckIn}</h1>
          <button onClick={() => router.push('/check-in')} className="neo-btn-primary">{t.goToCheckIn}</button>
        </div>
      </>
    );
  }

  const res = checkIn.result;
  const hasGuardianConsent = Boolean(profile?.guardianConsentEnabled && isValidGuardianEmail(profile.guardianEmail));
  const isHighRisk = res.riskLevel === 'high' || res.riskLevel === 'urgent';
  const canNotifyGuardian = isDemoMode ? isHighRisk : isHighRisk && hasGuardianConsent;

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f1ff]">
      <Navigation />
      
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 md:p-8 flex flex-col gap-8 pb-24">
        
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-4 border-[#141414] pb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-[#141414] mb-2 tracking-tight">{t.wellnessReportTitle}</h1>
            <p className="text-lg font-bold text-gray-700">{t.reportSubtitle}</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-white border-4 border-[#141414] text-[#141414] font-black rounded-lg shadow-[4px_4px_0_0_#141414] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#141414] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_#141414] transition-all">
            <Download size={20} />
            {t.exportPdf}
          </button>
        </section>

        {res.crisisSupportRequired && (
          <div className="neo-card bg-[#ff6b6b] text-white border-4 border-[#141414] shadow-[8px_8px_0_0_#141414] animate-pulse">
            <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
              <ShieldAlert size={36} /> {t.crisisCardTitle}
            </h2>
            <p className="text-xl font-bold mb-4">{t.crisisCardText}</p>
            {res.guardianAlertRecommended && canNotifyGuardian && (
              <div className="bg-white text-[#141414] p-4 font-bold border-4 border-[#141414] rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
                <span>{guardianStatus || t.guardianAlertPrepared}</span>
                <button 
                  onClick={handleNotifyGuardian}
                  disabled={Boolean(guardianStatus)}
                  className="px-6 py-3 bg-[#ffb703] border-4 border-[#141414] font-black rounded-lg shadow-[4px_4px_0_0_#141414] whitespace-nowrap disabled:opacity-50"
                >
                  {guardianStatus ? t.guardianNotifiedLabel : t.notifyGuardian}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          
          <div className="lg:col-span-8 bg-[#7c5cff] border-4 border-[#141414] rounded-2xl p-6 md:p-8 shadow-[8px_8px_0_0_#141414] flex flex-col justify-between">
            <div className="flex items-start gap-6 mb-8">
              <div className="w-16 h-16 rounded-full border-4 border-[#141414] bg-white flex items-center justify-center shrink-0">
                <BrainCircuit size={32} className="text-[#7c5cff]" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white mb-3">{t.companionNoteTitle}</h2>
                <p className="text-xl font-bold text-white leading-relaxed">
                  &ldquo;{res.companionResponse?.message || res.summary}&rdquo;
                </p>
                {res.companionResponse?.followUpQuestion && (
                  <div className="mt-4 inline-block bg-white/20 text-white font-bold px-4 py-2 rounded-lg border-2 border-white/40">
                    {t.followUpLabel}: {res.companionResponse.followUpQuestion}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-[#ffe66d] border-4 border-[#141414] rounded-2xl p-6 shadow-[8px_8px_0_0_#141414] flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white border-l-4 border-b-4 border-[#141414] rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
            <Lightbulb size={48} className="text-[#141414] mb-6" />
            <h3 className="text-2xl font-black text-[#141414] mb-4">{t.dailyInsight}</h3>
            <p className="text-lg font-bold text-[#141414]">
              &ldquo;{res.motivationalEncouragement}&rdquo;
            </p>
          </div>

          <div className="lg:col-span-6 bg-white border-4 border-[#141414] rounded-2xl shadow-[8px_8px_0_0_#141414] overflow-hidden flex flex-col">
            <div className="p-6 border-b-4 border-[#141414] bg-[#f6f3f2] flex items-center justify-between">
              <h2 className="text-2xl font-black text-[#141414] flex items-center gap-3">
                <AlertTriangle className="text-[#ff6b6b]" size={28} />
                {t.identifiedTriggers}
              </h2>
            </div>
            <div className="p-6 flex flex-col gap-4">
              {res.stressTriggers?.map((trigger, i) => (
                <div key={i} className="border-4 border-[#141414] rounded-xl p-4 bg-white flex items-center justify-between shadow-[4px_4px_0_0_#141414]">
                  <span className="text-lg font-bold text-[#141414]">{trigger}</span>
                  <span className="bg-[#ffdad6] text-[#93000a] border-2 border-[#141414] px-3 py-1 rounded-full text-sm font-black whitespace-nowrap">{t.attention}</span>
                </div>
              ))}
              {(!res.stressTriggers || res.stressTriggers.length === 0) && (
                <p className="font-bold text-gray-500">{t.noMajorTriggers}</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 bg-white border-4 border-[#141414] rounded-2xl shadow-[8px_8px_0_0_#141414] overflow-hidden flex flex-col">
            <div className="p-6 border-b-4 border-[#141414] bg-[#b8f7d4] flex items-center justify-between">
              <h2 className="text-2xl font-black text-[#141414] flex items-center gap-3">
                <Activity size={28} />
                {t.emotionalPatterns}
              </h2>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                {res.emotionalPatterns?.map((pattern, i) => (
                  <div key={i} className="bg-white border-4 border-[#141414] rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-[4px_4px_0_0_#141414] col-span-2 sm:col-span-1">
                    <span className="text-lg font-bold text-[#141414]">{pattern}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t-4 border-dashed border-[#141414] pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-700">{t.overallTrajectory}</span>
                  <div className="flex items-center gap-1 text-[#2e694e] font-black">
                    <TrendingUp size={20} />
                    {res.riskLevel === 'urgent' ? t.needsSupport : res.riskLevel === 'high' ? t.highStress : t.managingWell}
                  </div>
                </div>
                <div className="w-full h-6 border-4 border-[#141414] bg-[#e5e2e1] rounded-full overflow-hidden flex">
                  <div className={`border-r-4 border-[#141414] ${res.riskLevel === 'urgent' ? 'bg-[#ff6b6b] w-[90%]' : res.riskLevel === 'high' ? 'bg-[#ffb703] w-[70%]' : 'bg-[#b8f7d4] w-[40%]'}`}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white border-4 border-[#141414] rounded-2xl shadow-[8px_8px_0_0_#141414] flex flex-col overflow-hidden">
            <div className="p-6 border-b-4 border-[#141414] bg-[#f0edec]">
              <h2 className="text-2xl font-black text-[#141414]">{t.personalizedActionPlan}</h2>
              <p className="font-bold text-gray-600">{t.basedOnCurrentPatterns}</p>
            </div>
            <ul className="flex flex-col">
              {res.copingStrategies?.map((strategy, i) => (
                <li key={i} className={`p-6 flex gap-4 items-start hover:bg-[#f6f3f2] transition-colors ${i !== res.copingStrategies.length - 1 ? 'border-b-4 border-[#141414]' : ''}`}>
                  <div className="w-10 h-10 rounded-lg border-4 border-[#141414] bg-[#ffe66d] flex items-center justify-center shrink-0 shadow-[2px_2px_0_0_#141414] font-black text-lg">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#141414]">{strategy.title} <span className="text-sm bg-white border-2 border-[#141414] px-2 py-1 rounded ml-2">{strategy.durationMinutes}{t.minuteShort}</span></h3>
                    <p className="font-bold text-gray-700 mt-2 leading-relaxed">{strategy.whyItHelps}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-5 bg-[#9ddcff] border-4 border-[#141414] rounded-2xl p-6 md:p-8 shadow-[8px_8px_0_0_#141414] flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#141414] text-[#9ddcff] border-2 border-[#141414] px-3 py-1 rounded-full font-bold text-sm mb-6 shadow-[2px_2px_0_0_#141414]">
                <Sparkles size={16} />
                {t.aiGeneratedForYou}
              </div>
              <h2 className="text-3xl font-black text-[#141414] mb-3 relative z-10">{res.mindfulnessExercise?.title}</h2>
              <p className="font-bold text-[#141414] opacity-80 mb-8 relative z-10 text-lg">
                {res.mindfulnessExercise?.durationMinutes} {t.mindfulnessSessionSuffix}
                {res.mindfulnessExercise?.breathingPattern && ` ${t.patternLabel}: ${res.mindfulnessExercise.breathingPattern}`}
              </p>
            </div>
            
            <ol className="bg-white border-4 border-[#141414] rounded-xl p-6 shadow-[4px_4px_0_0_#141414] relative z-10 flex flex-col gap-3 font-bold">
              {res.mindfulnessExercise?.steps?.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="font-black">{index + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="lg:col-span-12 bg-white border-4 border-[#141414] rounded-2xl shadow-[8px_8px_0_0_#141414] flex flex-col overflow-hidden">
            <div className="p-6 bg-[#ffb703] border-b-4 border-[#141414] flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle size={32} className="text-[#141414]" />
                <h2 className="text-2xl font-black text-[#141414] text-left">{t.examPanicModeTitle}</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsPanicModeOpen(!isPanicModeOpen)}
                aria-expanded={isPanicModeOpen}
                className="inline-flex items-center justify-center gap-2 rounded-lg border-4 border-[#141414] bg-white px-5 py-3 font-black text-[#141414] shadow-[4px_4px_0_0_#141414] transition-all hover:bg-[#b8f7d4] focus:outline-none focus:ring-4 focus:ring-[#7c5cff]"
              >
                {t.panicButtonLabel}
              {isPanicModeOpen ? <ChevronUp size={28} /> : <ChevronDown size={28} />}
              </button>
            </div>
            
            {isPanicModeOpen && (
              <div aria-live="polite" className="p-6 md:p-8 bg-white grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1 md:col-span-3 mb-2">
                  <p className="text-xl font-bold bg-[#f6f1ff] p-4 rounded-xl border-4 border-[#141414] inline-block">
                    &ldquo;{res.panicModePlan.companionMessage}&rdquo;
                  </p>
                </div>
                
                <div className="bg-[#b8f7d4] border-4 border-[#141414] p-6 rounded-xl flex flex-col shadow-[4px_4px_0_0_#141414]">
                  <h3 className="font-black text-xl mb-4 border-b-2 border-[#141414] pb-2 text-[#141414]">1. {t.panicStepBreathe}</h3>
                  <p className="mb-3 font-black">{t.panicBreathingReset}</p>
                  <ul className="flex flex-col gap-2 font-bold text-gray-800">
                    {res.panicModePlan.steps.map((step) => <li key={step}>- {step}</li>)}
                  </ul>
                </div>

                <div className="bg-[#9ddcff] border-4 border-[#141414] p-6 rounded-xl flex flex-col shadow-[4px_4px_0_0_#141414]">
                  <h3 className="font-black text-xl mb-4 border-b-2 border-[#141414] pb-2 text-[#141414]">2. {t.panicStepGround}</h3>
                  <p className="mb-3 font-black">{t.panicGroundingReset}</p>
                  <p className="font-bold text-gray-800 flex-1">
                    {res.panicModePlan.groundingPrompt}
                  </p>
                </div>

                <div className="bg-[#ffe66d] border-4 border-[#141414] p-6 rounded-xl flex flex-col shadow-[4px_4px_0_0_#141414]">
                  <h3 className="font-black text-xl mb-4 border-b-2 border-[#141414] pb-2 text-[#141414]">3. {t.panicStepNextAction}</h3>
                  <p className="font-bold text-gray-800 flex-1">
                    {res.panicModePlan.nextTinyAction}
                  </p>
                </div>

                {canNotifyGuardian && (
                  <button
                    type="button"
                    onClick={handleNotifyGuardian}
                    disabled={Boolean(guardianStatus)}
                    className="col-span-1 md:col-span-3 rounded-lg border-4 border-[#141414] bg-white px-5 py-3 font-black text-[#141414] shadow-[4px_4px_0_0_#141414] transition-all hover:bg-[#b8f7d4] disabled:opacity-60"
                  >
                    {guardianStatus ? t.guardianNotifiedLabel : t.notifyGuardian}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-8 bg-white border-4 border-[#141414] rounded-2xl shadow-[8px_8px_0_0_#141414] flex flex-col overflow-hidden">
            <div className="p-6 border-b-4 border-[#141414] bg-[#f6f3f2] flex items-center justify-between">
              <h2 className="text-2xl font-black text-[#141414] flex items-center gap-3">
                <BookOpen size={28} className="text-[#7c5cff]" />
                {t.studyRecoveryPlanTitle}
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-4 border-[#141414] p-4 rounded-xl shadow-[4px_4px_0_0_#141414]">
                <h3 className="font-black text-gray-500 mb-2">{t.recoveryNext30Minutes}</h3>
                <p className="font-bold text-lg text-[#141414]">{res.studyRecoveryPlan.next30Minutes}</p>
              </div>
              <div className="border-4 border-[#141414] p-4 rounded-xl shadow-[4px_4px_0_0_#141414]">
                <h3 className="font-black text-gray-500 mb-2">{t.recoveryTonight}</h3>
                <p className="font-bold text-lg text-[#141414]">{res.studyRecoveryPlan.tonight}</p>
              </div>
              <div className="border-4 border-[#141414] p-4 rounded-xl shadow-[4px_4px_0_0_#141414]">
                <h3 className="font-black text-gray-500 mb-2">{t.recoveryTomorrowMorning}</h3>
                <p className="font-bold text-lg text-[#141414]">{res.studyRecoveryPlan.tomorrowMorning}</p>
              </div>
              <div className="border-4 border-[#141414] p-4 rounded-xl shadow-[4px_4px_0_0_#141414] bg-[#ffdad6]">
                <h3 className="font-black text-[#93000a] mb-2">{t.recoveryWhatToAvoid}</h3>
                <p className="font-bold text-lg text-[#141414]">{res.studyRecoveryPlan.whatToAvoid}</p>
              </div>
              <div className="border-4 border-[#141414] p-4 rounded-xl shadow-[4px_4px_0_0_#141414] md:col-span-2 bg-[#b8f7d4]">
                <h3 className="font-black text-[#141414] mb-2">{t.recoveryAskForHelpWith}</h3>
                <p className="font-bold text-lg text-[#141414]">{res.studyRecoveryPlan.askForHelpWith}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6 md:gap-8">
            
            <div className="bg-white border-4 border-[#141414] rounded-2xl shadow-[8px_8px_0_0_#141414] overflow-hidden flex-1">
              <div className="p-5 border-b-4 border-[#141414] bg-[#e5e2e1]">
                <h2 className="text-xl font-black flex items-center gap-2 text-[#141414]">
                  <ShieldIcon size={24} />
                  {t.parentSafeSummaryTitle}
                </h2>
              </div>
              <div className="p-5 flex flex-col gap-4">
                <p className="font-bold text-gray-700 text-sm leading-relaxed">
                  {res.guardianSafeSummary}
                </p>
                {canNotifyGuardian && (
                  <button 
                    onClick={handleNotifyGuardian}
                    disabled={Boolean(guardianStatus)}
                    className="w-full py-2 bg-white border-4 border-[#141414] rounded-lg font-black shadow-[2px_2px_0_0_#141414] hover:bg-[#b8f7d4] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_#141414] transition-all disabled:opacity-50 text-[#141414] text-sm"
                  >
                    {guardianStatus ? t.guardianNotifiedLabel : t.notifyGuardian}
                  </button>
                )}
                {guardianStatus && <p className="font-bold text-sm">{guardianStatus}</p>}
              </div>
            </div>

          </div>

          <div className="lg:col-span-12 bg-white border-4 border-[#141414] rounded-2xl shadow-[8px_8px_0_0_#141414] overflow-hidden">
            <div className="p-5 border-b-4 border-[#141414] bg-[#141414] text-white">
              <h2 className="text-2xl font-black flex items-center gap-2">
                <HeartPulse size={28} className="text-[#ff6b6b]" />
                {t.burnoutRadarTitle}
              </h2>
            </div>
            <div className="p-5 flex flex-col gap-4">
              {!burnoutRadar ? (
                <p className="font-bold text-gray-500">{t.burnoutNeedMoreData}</p>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-3 py-1 font-black rounded-full border-2 border-[#141414] ${burnoutRadar.status === 'high' ? 'bg-[#ff6b6b] text-white' : burnoutRadar.status === 'rising' ? 'bg-[#ffb703]' : burnoutRadar.status === 'watch' ? 'bg-[#ffe66d]' : 'bg-[#b8f7d4]'}`}>
                      {t.burnoutStatus}: {burnoutRadar.status}
                    </span>
                    <TrendChip label={t.stressTrendLabel} value={burnoutRadar.stressTrend} />
                    <TrendChip label={t.sleepTrendLabel} value={burnoutRadar.sleepTrend} />
                    <TrendChip label={t.studyHoursTrendLabel} value={burnoutRadar.studyHoursTrend} />
                    <TrendChip label={t.moodTrendLabel} value={burnoutRadar.moodTrend} />
                    <TrendChip label={t.riskTrendLabel} value={burnoutRadar.riskTrend} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl border-4 border-[#141414] bg-[#f6f1ff] p-4 shadow-[4px_4px_0_0_#141414]">
                      <h3 className="font-black mb-2">{t.whyThisMatters}</h3>
                      <p className="font-bold">{burnoutRadar.explanation}</p>
                    </div>
                    <div className="rounded-xl border-4 border-[#141414] bg-[#b8f7d4] p-4 shadow-[4px_4px_0_0_#141414]">
                      <h3 className="font-black mb-2">{t.onePreventionStep}</h3>
                      <p className="font-bold">{burnoutRadar.preventionStep}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}

function TrendChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full border-2 border-[#141414] bg-white px-3 py-1 text-sm font-black shadow-[2px_2px_0_0_#141414]">
      {label}: {value}
    </span>
  );
}
