"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: any;
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h1 style={{ color: '#B78860' }}>Fatal Error</h1>
          <p>A critical layout error occurred.</p>
          <pre style={{ color: 'red', textAlign: 'left', background: '#fee', padding: '20px', borderRadius: '10px' }}>
            {error && typeof error === 'object' && error.message ? error.message : String(error)}
          </pre>
          <button 
            onClick={() => reset()}
            style={{ padding: '10px 20px', background: '#B78860', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', marginTop: '20px' }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
