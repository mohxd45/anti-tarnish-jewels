export default function ThemePage() {
  return (
    <div className="space-y-8 max-w-4xl animate-fade-in pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-gold tracking-wide">Theme Settings</h1>
          <p className="text-sm text-cream/55 mt-1">Website styles, fonts, and colors.</p>
        </div>
      </div>

      <div className="rounded-[2rem] border border-gold/15 bg-white/[0.03] p-10 shadow-jewel text-center mt-10">
        <h2 className="text-xl font-serif font-semibold text-rose mb-4">Theme Editing Disabled</h2>
        <p className="text-cream/80 max-w-lg mx-auto">
          The website theme is fixed in code for brand consistency as the "Soft Pink Girly Luxury" theme. 
          Admin theme editing is disabled to protect the frontend aesthetic.
        </p>
      </div>
    </div>
  );
}
