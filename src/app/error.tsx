'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f1ff] p-6">
      <div className="neo-card bg-white max-w-lg w-full text-center flex flex-col items-center gap-6">
        <div className="bg-[#ff6b6b] text-white p-4 rounded-full border-4 border-[#141414] shadow-[4px_4px_0_0_#141414]">
          <AlertTriangle size={40} />
        </div>
        <h1 className="text-3xl font-black text-[#141414]">Something went wrong</h1>
        <p className="text-lg font-bold text-gray-600">
          An unexpected error occurred. Don&apos;t worry — your data is safe.
        </p>
        {error.digest && (
          <p className="text-sm font-mono bg-[#f6f1ff] px-3 py-1 rounded border-2 border-[#141414]">
            Error ID: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="neo-btn-primary flex items-center gap-2"
        >
          <RefreshCw size={20} />
          Try again
        </button>
      </div>
    </div>
  );
}
