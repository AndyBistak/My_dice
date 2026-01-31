import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { DiceCube } from './components/DiceCube';

export interface Theme {
  name: string;
  bg: string;
  dot: string;
  border: string;
}

interface Palette {
  name: string;
  face: string;
  dot: string;
}

const palettes: Palette[] = [
  { name: 'Panda', face: '#ffffff', dot: '#0f172a' },
  { name: 'Slate', face: '#334155', dot: '#f8fafc' },
  { name: 'Midnight', face: '#0f172a', dot: '#38bdf8' },
  { name: 'Ruby', face: '#e11d48', dot: '#ffffff' },
  { name: 'Lava', face: '#18181b', dot: '#f43f5e' },
  { name: 'Solar', face: '#f59e0b', dot: '#451a03' },
  { name: 'Emerald', face: '#10b981', dot: '#064e3b' },
  { name: 'Sapphire', face: '#2563eb', dot: '#bfdbfe' },
  { name: 'Amethyst', face: '#8b5cf6', dot: '#f5f3ff' },
  { name: 'Flamingo', face: '#ec4899', dot: '#ffffff' },
  { name: 'Cyber', face: '#000000', dot: '#22c55e' },
  { name: 'Cream', face: '#fef3c7', dot: '#92400e' },
];

const App: React.FC = () => {
  const [diceCount, setDiceCount] = useState<number>(1);
  const [values, setValues] = useState<number[]>([1]);
  const [activePalette, setActivePalette] = useState<Palette>(palettes[0]);
  const [isRolling, setIsRolling] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDeployInfo, setShowDeployInfo] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [history, setHistory] = useState<number[][]>([]);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  
  const isRollingRef = useRef(false);
  const diceCountRef = useRef(1);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then(() => setInstallPrompt(null));
    }
  };

  useEffect(() => {
    isRollingRef.current = isRolling;
  }, [isRolling]);

  useEffect(() => {
    diceCountRef.current = diceCount;
  }, [diceCount]);

  const currentTheme = useMemo<Theme>(() => ({
    name: activePalette.name,
    bg: activePalette.face,
    dot: activePalette.dot,
    border: activePalette.face === '#ffffff' ? '#e2e8f0' : 'rgba(0,0,0,0.1)'
  }), [activePalette]);

  const roll = useCallback(() => {
    if (isRollingRef.current || showSettings || showPrivacy) return;
    
    setIsRolling(true);
    if (navigator.vibrate) {
      try { navigator.vibrate(40); } catch (e) {}
    }

    setTimeout(() => {
      const newValues = Array.from({ length: diceCountRef.current }, () => Math.floor(Math.random() * 6) + 1);
      setValues(newValues);
      setIsRolling(false);
      setHistory(prev => [newValues, ...prev].slice(0, 24));
      if (navigator.vibrate) {
        try { navigator.vibrate([20, 10, 20]); } catch (e) {}
      }
    }, 600);
  }, [showSettings, showPrivacy]);

  // Shake detection
  useEffect(() => {
    let lastX: number | null = null, lastY: number | null = null, lastZ: number | null = null;
    let threshold = 15;

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;
      if (lastX !== null && lastY !== null && lastZ !== null) {
        const deltaX = Math.abs(lastX - acc.x), deltaY = Math.abs(lastY - acc.y), deltaZ = Math.abs(lastZ - acc.z);
        if (((deltaX > threshold && deltaY > threshold) || (deltaX > threshold && deltaZ > threshold) || (deltaY > threshold && deltaZ > threshold)) && !isRollingRef.current && !showSettings && !showPrivacy) {
          roll();
        }
      }
      lastX = acc.x; lastY = acc.y; lastZ = acc.z;
    };

    const requestPermission = async () => {
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceMotionEvent as any).requestPermission();
          if (permission === 'granted') window.addEventListener('devicemotion', handleMotion);
        } catch (e) {}
      } else {
        window.addEventListener('devicemotion', handleMotion);
      }
    };
    requestPermission();
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [roll, showSettings, showPrivacy]);

  const changeDiceCount = (count: number) => {
    if (isRolling) return;
    setDiceCount(count);
    setValues(Array.from({ length: count }, () => 1));
  };

  const total = values.reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col items-center justify-between h-screen w-full select-none pt-4 pb-4 sm:pt-6 sm:pb-8 landscape:pt-2 landscape:pb-2 touch-none relative overflow-hidden" onClick={roll}>
      
      {/* Settings Button */}
      <button 
        onClick={(e) => { e.stopPropagation(); setShowSettings(true); }}
        className="absolute left-4 top-4 z-30 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors btn-tap"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
      </button>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in" onClick={() => setShowSettings(false)}>
          <div className="bg-zinc-900/90 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-sm flex flex-col gap-6" onClick={(e) => e.stopPropagation()}>
            {showDeployInfo ? (
              <div className="flex flex-col gap-4">
                <h3 className="text-white font-black text-center uppercase tracking-widest text-xs">Submission Roadmap</h3>
                <div className="space-y-4 text-[10px] text-zinc-400">
                  <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <p className="mb-2 text-white font-bold">1. Deployment Hub</p>
                    <p>Go to <span className="text-indigo-400">pwabuilder.com</span></p>
                    <p>Enter your hosted URL: <code className="text-[8px] bg-zinc-800 px-1 rounded">https://your-app.vercel.app</code></p>
                  </div>
                  <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <p className="mb-2 text-white font-bold">2. Android Pack (AAB)</p>
                    <p>Use Package: <code className="text-[8px]">com.simpledice.3d.roller</code></p>
                    <p>Generate the Android App Bundle for Google Play.</p>
                  </div>
                  <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <p className="mb-2 text-white font-bold">3. Apple Pack (IPA)</p>
                    <p>Download the iOS package and upload via Transporter on a Mac.</p>
                  </div>
                </div>
                <button onClick={() => setShowDeployInfo(false)} className="text-zinc-500 font-bold uppercase text-[9px] mt-2">Back</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-4 gap-4">
                  {palettes.map((p) => (
                    <button key={p.name} onClick={() => setActivePalette(p)} className="flex flex-col items-center gap-1">
                      <div style={{ backgroundColor: p.face }} className={`w-10 h-10 rounded-full border-2 transition-all ${activePalette.name === p.name ? 'border-white scale-110' : 'border-transparent opacity-40'}`} />
                      <span className="text-[8px] font-bold text-zinc-500">{p.name}</span>
                    </button>
                  ))}
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  <button onClick={() => setShowDeployInfo(true)} className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-[9px] font-black uppercase tracking-widest">Store Submission Info</button>
                  <button onClick={() => setShowPrivacy(true)} className="w-full py-3 rounded-2xl text-zinc-500 text-[9px] font-bold uppercase tracking-widest">Privacy Policy</button>
                </div>
                <button onClick={() => setShowSettings(false)} className="w-full bg-white text-black font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest">Close</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-[60] bg-black p-6 flex flex-col" onClick={() => setShowPrivacy(false)}>
          <div className="flex-1 overflow-y-auto no-scrollbar py-12 px-4 max-w-lg mx-auto" onClick={e => e.stopPropagation()}>
            <h1 className="text-2xl font-black mb-8">Privacy Policy</h1>
            <div className="space-y-6 text-zinc-400 text-sm leading-relaxed">
              <section>
                <h2 className="text-white font-bold mb-2">1. Data Collection</h2>
                <p>3D Pro Dice Roller is a "Privacy-First" utility. We do not collect, store, or transmit any personal data, usage statistics, or device identifiers to external servers.</p>
              </section>
              <section>
                <h2 className="text-white font-bold mb-2">2. Device Permissions</h2>
                <p>We use local device motion sensors (accelerometer) only to detect "shaking" for rolling dice. This data never leaves your device.</p>
              </section>
              <section>
                <h2 className="text-white font-bold mb-2">3. Storage</h2>
                <p>Settings and roll history are stored locally on your device using browser caching. We do not use cookies or tracking pixels.</p>
              </section>
              <section>
                <h2 className="text-white font-bold mb-2">4. Third Parties</h2>
                <p>This app does not contain advertising or third-party analytics SDKs.</p>
              </section>
            </div>
            <button onClick={() => setShowPrivacy(false)} className="mt-12 w-full bg-zinc-800 py-4 rounded-2xl font-bold">Back to App</button>
          </div>
        </div>
      )}

      {/* UI Elements */}
      <div className="flex-shrink-0 flex flex-col items-center gap-4 z-20 w-full px-6">
        {installPrompt && (
          <button onClick={handleInstall} className="mb-2 bg-indigo-600 text-white text-[9px] font-black tracking-widest uppercase px-6 py-2 rounded-full animate-bounce">
            Add to Home Screen
          </button>
        )}
        <div className="flex gap-1 bg-white/5 p-1 rounded-2xl border border-white/10" onClick={e => e.stopPropagation()}>
          {[1, 2, 3, 4, 5, 6].map(n => (
            <button key={n} onClick={() => changeDiceCount(n)} className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${diceCount === n ? 'bg-white text-black' : 'text-zinc-500'}`}>{n}</button>
          ))}
        </div>
        <div className="text-zinc-500 font-bold tracking-[0.3em] uppercase text-[9px] opacity-70">
          {isRolling ? 'Rolling...' : 'Tap or Shake to roll'}
        </div>
      </div>

      <div className="flex-1 w-full flex items-center justify-center px-4 overflow-visible relative">
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-[400px]">
          {values.map((v, i) => (
            <DiceCube key={i} value={v} isRolling={isRolling} theme={currentTheme} />
          ))}
        </div>
      </div>

      <div className="flex-shrink-0 flex flex-col items-center w-full gap-4 pb-8">
        <div className="h-20 flex flex-col items-center justify-center">
          {!isRolling && (
            <div className="animate-in fade-in slide-in-from-bottom-2 flex flex-col items-center">
              <span className="text-6xl font-black text-white/50">{total}</span>
              {diceCount > 1 && <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Total Sum</span>}
            </div>
          )}
        </div>
        
        {/* Restored Detailed History UI */}
        {history.length > 0 && (
          <div 
            className="flex gap-2 px-6 overflow-x-auto max-w-full justify-start sm:justify-center no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {history.slice(0, 12).map((rollSet, i) => (
              <div 
                key={i} 
                className="bg-white/5 border border-white/5 rounded-xl p-2 flex flex-col items-center justify-center min-w-[42px] transition-all duration-700 flex-shrink-0"
                style={{ opacity: Math.max(0.1, 1 - (i * 0.15)) }}
              >
                <div className="flex flex-wrap gap-0.5 justify-center max-w-[35px]">
                  {rollSet.map((v, idx) => (
                    <span key={idx} className="text-[7px] font-bold text-zinc-600">{v}</span>
                  ))}
                </div>
                <div className="text-[9px] font-black text-white/30 border-t border-white/5 mt-1 pt-1 w-full text-center">
                  {rollSet.reduce((a, b) => a + b, 0)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;