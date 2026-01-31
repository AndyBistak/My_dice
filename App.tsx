
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
  const [history, setHistory] = useState<number[][]>([]);
  
  const isRollingRef = useRef(false);
  const diceCountRef = useRef(1);

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
    if (isRollingRef.current || showSettings) return;
    
    setIsRolling(true);
    if (navigator.vibrate) {
      try {
        navigator.vibrate(40);
      } catch (e) {}
    }

    setTimeout(() => {
      const newValues = Array.from({ length: diceCountRef.current }, () => Math.floor(Math.random() * 6) + 1);
      setValues(newValues);
      setIsRolling(false);
      setHistory(prev => [newValues, ...prev].slice(0, 24));
      if (navigator.vibrate) {
        try {
          navigator.vibrate([20, 10, 20]);
        } catch (e) {}
      }
    }, 600);
  }, [showSettings]);

  // Shake detection
  useEffect(() => {
    let lastX: number | null = null;
    let lastY: number | null = null;
    let lastZ: number | null = null;
    let threshold = 15;

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

      if (lastX !== null && lastY !== null && lastZ !== null) {
        const deltaX = Math.abs(lastX - acc.x);
        const deltaY = Math.abs(lastY - acc.y);
        const deltaZ = Math.abs(lastZ - acc.z);

        if (((deltaX > threshold && deltaY > threshold) || 
             (deltaX > threshold && deltaZ > threshold) || 
             (deltaY > threshold && deltaZ > threshold)) && !isRollingRef.current && !showSettings) {
          roll();
        }
      }

      lastX = acc.x;
      lastY = acc.y;
      lastZ = acc.z;
    };

    const requestPermission = async () => {
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceMotionEvent as any).requestPermission();
          if (permission === 'granted') {
            window.addEventListener('devicemotion', handleMotion);
          }
        } catch (e) {}
      } else {
        window.addEventListener('devicemotion', handleMotion);
      }
    };

    requestPermission();
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [roll, showSettings]);

  const changeDiceCount = (count: number) => {
    if (isRolling) return;
    setDiceCount(count);
    setValues(Array.from({ length: count }, () => 1));
  };

  const total = values.reduce((a, b) => a + b, 0);

  return (
    <div 
      className="flex flex-col items-center justify-between h-screen w-full select-none pt-4 pb-4 sm:pt-6 sm:pb-8 touch-none relative overflow-hidden" 
      onClick={roll}
    >
      {/* Settings Button - Top Left Corner */}
      <button 
        onClick={(e) => { e.stopPropagation(); setShowSettings(true); }}
        className="absolute left-4 top-4 sm:left-6 sm:top-6 z-30 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors btn-tap"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
        </svg>
      </button>

      {/* Settings Panel Overlay */}
      {showSettings && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300"
          onClick={(e) => { e.stopPropagation(); setShowSettings(false); }}
        >
          <div 
            className="bg-zinc-900/90 border border-white/10 p-8 rounded-[3rem] w-full max-sm:w-[90vw] max-w-sm flex flex-col items-center gap-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-6 w-full">
              <div className="text-zinc-500 font-black tracking-[0.3em] uppercase text-[11px]">
                Choose Palette
              </div>
              <div className="grid grid-cols-4 gap-5">
                {palettes.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => setActivePalette(p)}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div
                      style={{ backgroundColor: p.face }}
                      className={`
                        w-12 h-12 max-sm:w-10 max-sm:h-10 rounded-full border-2 transition-all btn-tap flex items-center justify-center relative
                        ${activePalette.name === p.name ? 'border-white scale-110 shadow-lg shadow-white/20' : 'border-transparent opacity-60 group-hover:opacity-100'}
                      `}
                    >
                      <div className="flex gap-0.5">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.dot }} />
                        ))}
                      </div>
                    </div>
                    <span className={`text-[8px] font-bold tracking-wider uppercase transition-colors ${activePalette.name === p.name ? 'text-white' : 'text-zinc-600'}`}>
                      {p.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => setShowSettings(false)}
              className="w-full bg-white text-black font-black uppercase text-[10px] tracking-[0.2em] py-4 rounded-3xl btn-tap mt-2"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Top Header Section */}
      <div 
        className="flex-shrink-0 flex flex-col items-center gap-3 sm:gap-4 z-20 w-full px-6"
      >
        {/* Dice Count Selection */}
        <div 
          className="flex flex-col items-center gap-4 bg-white/5 p-1.5 px-2 rounded-2xl border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                onClick={() => changeDiceCount(n)}
                className={`
                  w-9 h-9 sm:w-11 sm:h-10 rounded-xl text-sm font-bold transition-all btn-tap flex items-center justify-center
                  ${diceCount === n 
                    ? 'bg-white text-black shadow-lg shadow-white/10' 
                    : 'text-zinc-500 hover:text-zinc-300'
                  }
                `}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-center w-full min-h-[30px]">
          <div className="text-zinc-500 font-bold tracking-[0.3em] uppercase text-[9px] sm:text-[10px] opacity-70">
            {isRolling ? 'Rolling...' : 'Tap to roll'}
          </div>
        </div>
      </div>

      {/* Central Dice Display Area */}
      <div className="flex-1 w-full flex items-center justify-center px-4 min-h-0 overflow-visible relative">
        {/* Container with flex-wrap and max-width ensures exactly 3 dice per row */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-[calc(var(--dice-size)*3+40px)] overflow-visible">
          {values.map((v, i) => {
            return (
              <div 
                key={i} 
                className="animate-in fade-in zoom-in duration-300 flex items-center justify-center flex-shrink-0"
              >
                <DiceCube value={v} isRolling={isRolling} theme={currentTheme} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Result & History Section */}
      <div className="flex-shrink-0 flex flex-col items-center w-full gap-4 sm:gap-6 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent pt-4 pb-4 sm:pb-8">
        
        {/* Result Indicator */}
        <div className="flex flex-col items-center justify-center h-16 sm:h-24">
          {!isRolling ? (
            <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="text-5xl sm:text-7xl font-black text-white/40 pointer-events-none leading-none tracking-tighter">
                {total}
              </div>
              {diceCount > 1 && (
                <div className="text-[8px] sm:text-[9px] text-zinc-600 font-extrabold tracking-[0.4em] uppercase mt-1">
                  Total Sum
                </div>
              )}
            </div>
          ) : (
            <div className="w-1 h-1 bg-white/10 rounded-full animate-pulse" />
          )}
        </div>

        {/* History & Footer */}
        <div className="flex flex-col items-center gap-4 w-full">
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
          <div className="flex flex-col items-center gap-1">
            <div className="text-[8px] text-zinc-800 font-bold tracking-[0.3em] uppercase">
              Shake to roll enabled
            </div>
            <div className="text-[7px] text-zinc-900 font-bold tracking-[0.2em] uppercase">
              {activePalette.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
