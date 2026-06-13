'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useLanguage } from '@/components/LanguageProvider';
import { Navigation } from '@/components/Navigation';
import { CheckInInput, checkInSchema } from '@/lib/validation';
import { saveCheckIn } from '@/lib/firebase/firestore';
import { getMockWellnessResponse } from '@/lib/mock-wellness';
import { EnergyLevel, ExamType, GeminiWellnessResponse, Mood } from '@/lib/types';
import { Mic, MicOff } from 'lucide-react';

type SpeechRecognitionResultEvent = {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
};

type BrowserSpeechRecognition = {
  lang: string;
  interimResults: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  start: () => void;
};

type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

const examTypes: ExamType[] = ['Board Exams', 'NEET', 'JEE', 'CUET', 'CAT', 'GATE', 'UPSC', 'Other'];
const moods: Mood[] = ['calm', 'okay', 'anxious', 'overwhelmed', 'low', 'confident'];
const energyLevels: EnergyLevel[] = ['low', 'medium', 'high'];

export default function CheckIn() {
  const { user, isDemoMode } = useAuth();
  const { language, t } = useLanguage();
  const router = useRouter();

  const [formData, setFormData] = useState<Partial<CheckInInput>>({
    examType: 'NEET',
    mood: 'okay',
    stressLevel: 5,
    sleepHours: 7,
    studyHours: 6,
    energyLevel: 'medium',
    biggestPressure: '',
    journalText: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Voice input state
  const [isRecording, setIsRecording] = useState(false);

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as Window & { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(t.voiceUnavailable);
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'en' ? 'en-US' : (language === 'hi' ? 'hi-IN' : 'mr-IN');
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setFormData(prev => ({ 
        ...prev, 
        journalText: prev.journalText ? prev.journalText + ' ' + transcript : transcript 
      }));
    };
    
    recognition.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fullData = { ...formData, language } as CheckInInput;
    const validated = checkInSchema.safeParse(fullData);

    if (!validated.success) {
      setError(validated.error.issues[0].message);
      setLoading(false);
      return;
    }

    try {
      let result: GeminiWellnessResponse;
      
      const apiKeyMissing = isDemoMode; 
      
      if (apiKeyMissing) {
        // Fallback to mock data immediately
        result = getMockWellnessResponse();
        // Artificial delay
        await new Promise(r => setTimeout(r, 1500));
      } else {
        const response = await fetch('/api/wellness-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validated.data)
        });
        
        if (!response.ok) {
          const errRes = await response.json();
          // if Gemini fails, let's fallback to mock as well or show error
          console.warn("API failed, using mock data", errRes);
          result = getMockWellnessResponse();
        } else {
          result = await response.json();
        }
      }

      const finalCheckIn = {
        ...validated.data,
        result,
        riskLevel: result.riskLevel,
        crisisSupportRequired: result.crisisSupportRequired,
        createdAt: new Date().toISOString(),
      };

      if (user && !isDemoMode) {
        await saveCheckIn(user.uid, finalCheckIn);
      } else if (isDemoMode) {
         // In demo mode, store in localStorage so the report page can read it
         localStorage.setItem('demo_last_checkin', JSON.stringify(finalCheckIn));
      }

      router.push('/report');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 md:p-6 pb-24">
        <h1 className="text-4xl font-black mb-2">{t.checkInTitle}</h1>
        <p className="text-xl font-bold mb-8 opacity-80">{t.journalTitle}</p>

        {error && (
          <div className="bg-danger text-white p-4 font-bold rounded neo-border neo-shadow-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Quick Stats Card */}
          <div className="neo-card bg-calm-blue flex flex-col gap-6">
            <h2 className="text-2xl font-black">Quick Stats</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold mb-2">{t.examType}</label>
                <select 
                  className="neo-input"
                  value={formData.examType}
                  onChange={e => setFormData({...formData, examType: e.target.value as ExamType})}
                >
                  {examTypes.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-2">{t.mood}</label>
                <select 
                  className="neo-input"
                  value={formData.mood}
                  onChange={e => setFormData({...formData, mood: e.target.value as Mood})}
                >
                  {moods.map(opt => (
                    <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-2">{t.stressLevel}: {formData.stressLevel}</label>
                <input 
                  type="range" min="1" max="10" 
                  className="w-full accent-primary"
                  value={formData.stressLevel}
                  onChange={e => setFormData({...formData, stressLevel: Number(e.target.value)})}
                />
              </div>

              <div>
                <label className="block font-bold mb-2">{t.energyLevel}</label>
                <select 
                  className="neo-input"
                  value={formData.energyLevel}
                  onChange={e => setFormData({...formData, energyLevel: e.target.value as EnergyLevel})}
                >
                  {energyLevels.map(opt => (
                    <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-2">{t.sleepHours}</label>
                <input 
                  type="number" min="0" max="24"
                  className="neo-input"
                  value={formData.sleepHours}
                  onChange={e => setFormData({...formData, sleepHours: Number(e.target.value)})}
                />
              </div>

              <div>
                <label className="block font-bold mb-2">{t.studyHours}</label>
                <input 
                  type="number" min="0" max="24"
                  className="neo-input"
                  value={formData.studyHours}
                  onChange={e => setFormData({...formData, studyHours: Number(e.target.value)})}
                />
              </div>
            </div>
          </div>

          {/* Journal Card */}
          <div className="neo-card bg-accent flex flex-col gap-6">
            <div>
              <label className="block font-bold text-xl mb-2">{t.biggestPressure}</label>
              <input 
                type="text"
                className="neo-input text-lg"
                placeholder="E.g., mock test scores, parental expectations..."
                value={formData.biggestPressure}
                onChange={e => setFormData({...formData, biggestPressure: e.target.value})}
              />
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="block font-bold text-xl">{t.journalTitle}</label>
                <button 
                  type="button" 
                  onClick={handleVoiceInput}
                  className={`p-2 rounded-full border-2 border-border neo-hover ${isRecording ? 'bg-danger text-white' : 'bg-white'}`}
                  aria-label="Voice Input"
                >
                  {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
              </div>
              <textarea 
                className="neo-input h-48 text-lg resize-none"
                placeholder={t.journalPlaceholder}
                value={formData.journalText}
                onChange={e => setFormData({...formData, journalText: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="neo-btn-primary text-xl py-4 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-pulse">Analyzing...</span>
            ) : (
              <>✨ {t.analyzeBtn}</>
            )}
          </button>
        </form>
      </main>
    </>
  );
}
