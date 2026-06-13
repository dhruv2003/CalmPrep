export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f1ff]">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-[#141414] border-t-[#7c5cff] animate-spin shadow-[4px_4px_0_0_#141414]" />
        </div>
        <p className="text-xl font-black text-[#141414] animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
