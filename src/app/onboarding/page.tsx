'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { saveUserProfile } from '@/lib/firebase/firestore';
import { Navigation } from '@/components/Navigation';

export default function Onboarding() {
  const { user } = useAuth();
  const router = useRouter();
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianConsentEnabled, setGuardianConsentEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await saveUserProfile(user.uid, {
        name: user.displayName || 'Student',
        email: user.email || '',
        guardianEmail,
        guardianConsentEnabled,
        preferredLanguage: 'en',
      });
      router.push('/check-in');
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      <main className="flex-1 max-w-2xl w-full mx-auto p-6 flex flex-col justify-center">
        <h1 className="text-4xl font-black mb-6">Safety First 🛡️</h1>
        <p className="text-xl font-bold mb-8">
          We want to make sure you are supported. You can optionally add a trusted guardian&apos;s email.
          If our AI detects urgent signs of burnout or crisis, we can alert them to check on you.
        </p>

        <form onSubmit={handleSubmit} className="neo-card flex flex-col gap-6">
          <div>
            <label htmlFor="guardianEmail" className="block font-bold mb-2">Trusted Guardian Email (Optional)</label>
            <input 
              type="email" 
              id="guardianEmail"
              className="neo-input" 
              placeholder="parent@example.com"
              value={guardianEmail}
              onChange={(e) => setGuardianEmail(e.target.value)}
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              className="w-6 h-6 border-3 border-border rounded accent-primary"
              checked={guardianConsentEnabled}
              onChange={(e) => setGuardianConsentEnabled(e.target.checked)}
            />
            <span className="font-bold">I consent to sending safety alerts to this email if I show signs of severe crisis.</span>
          </label>

          <button 
            type="submit" 
            disabled={loading}
            className="neo-btn-primary mt-4 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Continue to Check-in'}
          </button>
        </form>
      </main>
    </>
  );
}
