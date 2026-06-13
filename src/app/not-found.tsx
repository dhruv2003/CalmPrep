import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f1ff] p-6">
      <div className="neo-card bg-white max-w-lg w-full text-center flex flex-col items-center gap-6">
        <div className="bg-[#ffe66d] text-[#141414] p-4 rounded-full border-4 border-[#141414] shadow-[4px_4px_0_0_#141414]">
          <Search size={40} />
        </div>
        <h1 className="text-6xl font-black text-[#7c5cff]">404</h1>
        <h2 className="text-2xl font-black text-[#141414]">Page not found</h2>
        <p className="text-lg font-bold text-gray-600">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="neo-btn-primary flex items-center gap-2"
        >
          <Home size={20} />
          Back to home
        </Link>
      </div>
    </div>
  );
}
