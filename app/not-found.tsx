import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-serif font-semibold text-champagne mb-4">404</h1>
        <h2 className="text-2xl font-serif text-charcoalBrown mb-4">Page Not Found</h2>
        <p className="text-stoneGray mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full bg-champagne px-8 py-3 font-semibold text-charcoalBrown hover:bg-champagne/90 transition-all shadow-jewel"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
