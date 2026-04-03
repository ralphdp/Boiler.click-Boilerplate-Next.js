import Link from 'next/link';
import '@/theme/globals.css';
import { getGlobalOverrides } from '@/core/actions/branding';
import { ACTIVE_THEME } from '@/theme/config';

export default async function NotFound() {
  const overrides = await getGlobalOverrides();
  const activeAccentColor = overrides?.primaryColor || ACTIVE_THEME.primaryColor;

  const hexToRgb = (hex?: string) => {
      if (!hex) return "191, 93, 249";
      let h = hex.replace(/^#/, '');
      if (h.length === 3) h = h.split('').map(x => x + x).join('');
      const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);
      return result
          ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
          : "191, 93, 249"; // Fallback to literal Vanguard #bf5df9
  };

  return (
    <html lang="en" style={{
        '--accent': activeAccentColor,
        '--accent-rgb': hexToRgb(activeAccentColor)
    } as React.CSSProperties}>
      <body className="antialiased">
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white font-space-grotesk relative overflow-hidden">
            {/* SCANLINE EFFECT overlay */}
            <div className="absolute inset-x-0 inset-y-0 pointer-events-none z-[5] opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" aria-hidden="true" />
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--accent)]/5 rounded-full blur-[150px] -z-10" />

            <div className="relative z-10 flex flex-col items-center text-center space-y-8 p-6">
                <div className="text-[150px] leading-none font-black italic text-[var(--accent)]/80 tracking-tighter drop-shadow-[0_0_50px_rgba(var(--accent-rgb),0.3)]">
                    404
                </div>
                
                <div className="space-y-4 max-w-lg">
                    <h1 className="text-3xl font-black uppercase tracking-widest text-white m-0">
                        Routing Entropy Detected
                    </h1>
                    <p className="text-[#888888] font-serif text-lg leading-relaxed">
                        The requested logic path is a physical dead end. The packet was dropped to preserve systemic unity.
                    </p>
                </div>

                <div className="pt-8">
                    <Link 
                        href="/en"
                        className="px-10 py-5 border-[1.5px] border-[var(--accent)] text-[var(--accent)] font-black uppercase tracking-widest text-xs hover:bg-[var(--accent)] hover:text-black transition-all inline-block rounded-none bg-black/40 backdrop-blur-md shadow-[0_0_30px_rgba(var(--accent-rgb),0.1)]"
                    >
                        Return to Substrate
                    </Link>
                </div>

                <div className="mt-12 flex gap-4 mt-8 opacity-40">
                    <div className="w-2 h-2 bg-white rounded-none animate-pulse" />
                    <div className="w-2 h-2 bg-white rounded-none animate-pulse delay-75" />
                    <div className="w-2 h-2 bg-[var(--accent)] rounded-none animate-pulse delay-150" />
                </div>
            </div>
        </div>
      </body>
    </html>
  );
}
