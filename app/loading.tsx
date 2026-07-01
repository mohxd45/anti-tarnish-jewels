export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-ivory">
      <div className="relative flex flex-col items-center">
        {/* Spinner */}
        <div className="w-12 h-12 border-2 border-champagne border-t-transparent rounded-full animate-spin"></div>
        {/* Luxury text */}
        <p className="mt-6 font-serif text-champagne tracking-[0.2em] text-sm uppercase">Loading</p>
      </div>
    </div>
  );
}
