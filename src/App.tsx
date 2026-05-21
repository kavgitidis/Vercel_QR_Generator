import React, { useEffect, useRef, useState, useMemo } from 'react';
import QRCodeStyling, {
  type DrawType,
  type DotType,
  type CornerSquareType,
  type Options
} from 'qr-code-styling';
import { 
  Download, 
  MapPin, 
  Layers, 
  Palette,
  Grid,
  Maximize,
  Image as ImageIcon,
  Wand2,
  Circle,
  Square,
  Sparkles
} from 'lucide-react';

const App: React.FC = () => {
  const [url, setUrl] = useState('https://maps.app.goo.gl/example');
  
  // SOTA Selection States
  const [dotsType, setDotsType] = useState<DotType>('rounded');
  const [cornersType, setCornersType] = useState<CornerSquareType>('extra-rounded');
  
  // Colors
  const [primaryColor, setPrimaryColor] = useState('#8b5cf6'); // Neon Purple
  const [secondaryColor, setSecondaryColor] = useState('#3b82f6'); // Electric Blue
  const [isGradient, setIsGradient] = useState(true);
  
  // Overlays
  const [emoji, setEmoji] = useState('📍');
  const [logoFile, setLogoFile] = useState<string | null>(null);
  const [clearCenter, setClearCenter] = useState(true);

  const qrRef = useRef<HTMLDivElement>(null);
  
  const qrCode = useMemo(() => new QRCodeStyling({
    width: 1000,
    height: 1000,
    margin: 20,
    type: 'svg' as DrawType,
    imageOptions: {
      crossOrigin: 'anonymous',
      margin: 15,
      imageSize: 0.4,
      hideBackgroundDots: true
    }
  }), []);

  const emojiToDataUrl = (emoji: string) => {
    if (!emoji) return undefined;
    const canvas = document.createElement('canvas');
    canvas.width = 250;
    canvas.height = 250;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.font = '180px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emoji, 125, 135);
      return canvas.toDataURL();
    }
    return undefined;
  };

  useEffect(() => {
    const options: Partial<Options> = {
      data: url || ' ',
      dotsOptions: {
        type: dotsType,
        color: isGradient ? undefined : primaryColor,
        gradient: isGradient ? {
          type: 'linear',
          rotation: 45,
          colorStops: [
            { offset: 0, color: primaryColor },
            { offset: 1, color: secondaryColor }
          ]
        } : undefined
      },
      cornersSquareOptions: {
        type: cornersType,
        color: primaryColor
      },
      image: logoFile || emojiToDataUrl(emoji),
      imageOptions: {
        hideBackgroundDots: clearCenter,
        imageSize: 0.4,
        margin: 10
      }
    };

    qrCode.update(options);
    if (qrRef.current) {
      qrRef.current.innerHTML = '';
      qrCode.append(qrRef.current);
    }
  }, [url, dotsType, cornersType, primaryColor, secondaryColor, isGradient, emoji, logoFile, clearCenter, qrCode]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setLogoFile(reader.result as string);
        setEmoji('');
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <>
      <div className="aurora-bg" />
      
      <div className="min-h-screen p-4 md:p-8 flex justify-center">
        <div className="w-full max-w-[1400px] grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Bento Box Controls (Mobile Order: 2) */}
          <div className="xl:col-span-7 flex flex-col gap-6 order-2 xl:order-1">
            
            {/* Header */}
            <header className="mb-2 md:mb-4 pl-2 text-center xl:text-left">
              <div className="inline-flex items-center justify-center xl:justify-start gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-[#8b5cf6] mb-4 uppercase tracking-[0.2em]">
                <Wand2 className="w-3 h-3" /> QR Pro Studio
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
                Generate <span className="text-white/40 block sm:inline">Excellence.</span>
              </h1>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              
              {/* BENTO: Source */}
              <div className="bento-card md:col-span-2">
                <div className="flex items-center gap-2 mb-4 text-white/80">
                  <MapPin className="w-4 h-4 text-[#8b5cf6]" />
                  <span className="text-xs font-bold uppercase tracking-widest">Destination</span>
                </div>
                <input 
                  type="text" 
                  value={url} 
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://maps.app.goo.gl/..."
                  className="sota-input"
                />
              </div>

              {/* BENTO: Matrix Style */}
              <div className="bento-card md:col-span-2">
                <div className="flex items-center gap-2 mb-4 text-white/80">
                  <Grid className="w-4 h-4 text-[#3b82f6]" />
                  <span className="text-xs font-bold uppercase tracking-widest">Matrix Architecture</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  <button onClick={() => setDotsType('square')} className={`sota-btn ${dotsType === 'square' ? 'sota-btn-active' : 'sota-btn-inactive'}`}>
                    <Square className="w-3 h-3 sm:w-4 sm:h-4" /> Sharp
                  </button>
                  <button onClick={() => setDotsType('rounded')} className={`sota-btn ${dotsType === 'rounded' ? 'sota-btn-active' : 'sota-btn-inactive'}`}>
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-md border-2 border-current" /> Modern
                  </button>
                  <button onClick={() => setDotsType('dots')} className={`sota-btn ${dotsType === 'dots' ? 'sota-btn-active' : 'sota-btn-inactive'}`}>
                    <Circle className="w-3 h-3 sm:w-4 sm:h-4" /> Dots
                  </button>
                  <button onClick={() => setDotsType('classy')} className={`sota-btn ${dotsType === 'classy' ? 'sota-btn-active' : 'sota-btn-inactive'}`}>
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" /> Classy
                  </button>
                </div>
              </div>

              {/* BENTO: Anchor Style */}
              <div className="bento-card">
                <div className="flex items-center gap-2 mb-4 text-white/80">
                  <Maximize className="w-4 h-4 text-[#ec4899]" />
                  <span className="text-xs font-bold uppercase tracking-widest">Anchors</span>
                </div>
                <div className="flex flex-col gap-2 sm:gap-3">
                  <button onClick={() => setCornersType('square')} className={`sota-btn ${cornersType === 'square' ? 'sota-btn-active' : 'sota-btn-inactive'}`}>
                    Rigid Square
                  </button>
                  <button onClick={() => setCornersType('extra-rounded')} className={`sota-btn ${cornersType === 'extra-rounded' ? 'sota-btn-active' : 'sota-btn-inactive'}`}>
                    Smooth Corner
                  </button>
                  <button onClick={() => setCornersType('dot')} className={`sota-btn ${cornersType === 'dot' ? 'sota-btn-active' : 'sota-btn-inactive'}`}>
                    Circular Dot
                  </button>
                </div>
              </div>

              {/* BENTO: Overlays */}
              <div className="bento-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-white/80">
                    <Layers className="w-4 h-4 text-[#10b981]" />
                    <span className="text-xs font-bold uppercase tracking-widest">Centerpiece</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <span className="text-[10px] font-bold text-white/40 group-hover:text-white/80 transition-colors uppercase tracking-wider hidden sm:block">Isolate</span>
                    <div className="relative">
                      <input type="checkbox" checked={clearCenter} onChange={(e) => setClearCenter(e.target.checked)} className="sr-only peer" />
                      <div className="w-8 h-4 bg-[#16161d] rounded-full border border-white/5 peer-checked:bg-[#10b981] peer-checked:border-[#10b981] transition-all">
                        <div className="w-4 h-4 bg-white rounded-full scale-75 shadow-sm absolute top-0 left-0 peer-checked:translate-x-4 transition-transform" />
                      </div>
                    </div>
                  </label>
                </div>
                
                <div className="space-y-3">
                  <div className="relative">
                    <input 
                      type="text" 
                      value={emoji} 
                      onChange={(e) => { setEmoji(e.target.value); setLogoFile(null); }}
                      className="sota-input pr-12 text-lg"
                      placeholder="Type Emoji 📍"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/30 uppercase tracking-widest">Emoji</div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-4 py-2">
                    <span className="h-px bg-white/5 flex-1" />
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">OR</span>
                    <span className="h-px bg-white/5 flex-1" />
                  </div>

                  <label className="w-full sota-btn sota-btn-inactive cursor-pointer hover:bg-white/5 group border border-dashed border-white/10 hover:border-white/20">
                    <ImageIcon className="w-4 h-4 text-white/40 group-hover:text-white/80 transition-colors" /> 
                    <span className="truncate">Upload Brand Logo</span>
                    <input type="file" className="hidden" onChange={handleLogoUpload} accept="image/*" />
                  </label>
                </div>
              </div>

              {/* BENTO: Color Engine */}
              <div className="bento-card md:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-white/80">
                    <Palette className="w-4 h-4 text-[#f59e0b]" />
                    <span className="text-xs font-bold uppercase tracking-widest">Color Engine</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <span className="text-[10px] font-bold text-white/40 group-hover:text-white/80 transition-colors uppercase tracking-wider hidden sm:block">Enable Gradient</span>
                    <div className="relative">
                      <input type="checkbox" checked={isGradient} onChange={(e) => setIsGradient(e.target.checked)} className="sr-only peer" />
                      <div className="w-8 h-4 bg-[#16161d] rounded-full border border-white/5 peer-checked:bg-[#f59e0b] peer-checked:border-[#f59e0b] transition-all">
                        <div className="w-4 h-4 bg-white rounded-full scale-75 shadow-sm absolute top-0 left-0 peer-checked:translate-x-4 transition-transform" />
                      </div>
                    </div>
                  </label>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-4 bg-[#16161d] border border-white/[0.05] p-3 rounded-2xl">
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-inner shrink-0">
                      <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="absolute inset-[-10px] cursor-pointer scale-150" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest truncate">Primary</div>
                      <div className="text-xs font-mono font-medium text-white/80 uppercase truncate">{primaryColor}</div>
                    </div>
                  </div>

                  <div className={`flex items-center gap-4 bg-[#16161d] border border-white/[0.05] p-3 rounded-2xl transition-all duration-300 ${isGradient ? 'opacity-100' : 'opacity-30 grayscale pointer-events-none'}`}>
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-inner shrink-0">
                      <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="absolute inset-[-10px] cursor-pointer scale-150" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest truncate">Secondary</div>
                      <div className="text-xs font-mono font-medium text-white/80 uppercase truncate">{secondaryColor}</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT: Preview Stage (Sticky) (Mobile Order: 1) */}
          <div className="xl:col-span-5 order-1 xl:order-2 xl:sticky top-4 xl:top-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
            <div className="relative group perspective-1000">
              
              {/* Massive SOTA Glow */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#8b5cf6] via-transparent to-[#3b82f6] rounded-[32px] sm:rounded-[48px] blur-xl sm:blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
              
              <div className="relative bg-[#0d0d12]/80 backdrop-blur-3xl border border-white/10 p-2 sm:p-3 rounded-[32px] sm:rounded-[40px] shadow-2xl flex flex-col">
                
                {/* Status Bar */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Live Canvas</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hidden sm:block">1000x1000 PX</span>
                </div>

                {/* QR Stage */}
                <div className="p-4 sm:p-8 md:p-12 flex items-center justify-center">
                  <div className="relative w-full max-w-[350px] aspect-square bg-white rounded-2xl md:rounded-3xl p-4 sm:p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_16px_32px_-8px_rgba(0,0,0,0.5)] transform transition-transform duration-700 hover:scale-[1.03] overflow-hidden flex items-center justify-center">
                    <div id="qr-container" ref={qrRef} className="w-full h-full flex items-center justify-center" />
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 pt-0">
                  <button 
                    onClick={() => qrCode.download({ name: 'qr-pro', extension: 'png' })}
                    className="bg-white hover:bg-white/90 text-black py-3 sm:py-4 rounded-[20px] sm:rounded-3xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" /> PNG Export
                  </button>
                  <button 
                    onClick={() => qrCode.download({ name: 'qr-pro', extension: 'svg' })}
                    className="bg-[#16161d] hover:bg-white/10 border border-white/5 text-white py-3 sm:py-4 rounded-[20px] sm:rounded-3xl font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Download className="w-3 h-3 sm:w-4 sm:h-4 text-white/50" /> Vector SVG
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default App;
