import React, { useEffect, useRef, useState } from 'react';
import QRCodeStyling, {
  type DrawType,
  type DotType,
  type CornerSquareType,
  type Options
} from 'qr-code-styling';
import { HexColorPicker } from "react-colorful";
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
  Sparkles,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { registerPlugin, Capacitor } from '@capacitor/core';

// Register the native bridge once
const NativeExport = registerPlugin<any>('ExportPlugin');

const App: React.FC = () => {
  const [url, setUrl] = useState('https://maps.app.goo.gl/example');
  
  // SOTA Selection States
  const [dotsType, setDotsType] = useState<DotType>('rounded');
  const [cornersType, setCornersType] = useState<CornerSquareType>('extra-rounded');
  
  // Colors
  const [primaryColor, setPrimaryColor] = useState('#8b5cf6'); // Neon Purple
  const [secondaryColor, setSecondaryColor] = useState('#3b82f6'); // Electric Blue
  const [isGradient, setIsGradient] = useState(true);
  const [isTransparent, setIsTransparent] = useState(false);
  const [activeColorPicker, setActiveColorPicker] = useState<'primary' | 'secondary' | null>(null);
  
  // Overlays
  const [centerText, setCenterText] = useState('📍');
  const [logoFile, setLogoFile] = useState<string | null>(null);
  const [clearCenter, setClearCenter] = useState(true);
  const [colorizeCenter, setColorizeCenter] = useState(true); // New mask state
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const qrRef = useRef<HTMLDivElement>(null);
  
  // Create a state to hold the current instance
  const [qrCode, setQrCode] = useState<QRCodeStyling | null>(null);

  const centerTextToDataUrl = (text: string, isGrad: boolean, c1: string, c2: string, colorize: boolean) => {
    if (!text) return undefined;
    const canvas = document.createElement('canvas');
    canvas.width = 400; // High-res canvas for crisp text
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Auto-scale font size
      let fontSize = 300;
      ctx.font = `900 ${fontSize}px Inter, sans-serif`;
      let textMetrics = ctx.measureText(text);
      
      // Scale down until it fits within the 360px safe zone
      while (textMetrics.width > 360 && fontSize > 20) {
        fontSize -= 10;
        ctx.font = `900 ${fontSize}px Inter, sans-serif`;
        textMetrics = ctx.measureText(text);
      }

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Draw initial text or emoji
      ctx.fillStyle = c1;
      ctx.fillText(text, 200, 200 + (fontSize * 0.05));
      
      // If colorize is enabled, apply a source-in composite mask
      if (colorize) {
        ctx.globalCompositeOperation = 'source-in';
        
        if (isGrad) {
          const gradient = ctx.createLinearGradient(0, 0, 400, 400);
          gradient.addColorStop(0, c1);
          gradient.addColorStop(1, c2);
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = c1;
        }
        
        // Fill the entire canvas, which only paints where the emoji/text already exists
        ctx.fillRect(0, 0, 400, 400);
        ctx.globalCompositeOperation = 'source-over'; // Reset
      }
      
      return canvas.toDataURL();
    }
    return undefined;
  };

  useEffect(() => {
    const options: Options = {
      width: 1000,
      height: 1000,
      margin: 20,
      type: 'svg' as DrawType,
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
      backgroundOptions: {
        color: isTransparent ? 'rgba(0, 0, 0, 0)' : '#ffffff',
      },
      image: logoFile || centerTextToDataUrl(centerText, isGradient, primaryColor, secondaryColor, colorizeCenter),
      imageOptions: {
        crossOrigin: 'anonymous',
        hideBackgroundDots: clearCenter,
        imageSize: 0.4,
        margin: 10
      }
    };

    // Completely destroy and recreate the instance to fix canvas caching bugs
    const newQrCode = new QRCodeStyling(options);
    setQrCode(newQrCode);

    if (qrRef.current) {
      qrRef.current.innerHTML = '';
      newQrCode.append(qrRef.current);
    }
  }, [url, dotsType, cornersType, primaryColor, secondaryColor, isGradient, isTransparent, centerText, logoFile, clearCenter, colorizeCenter]);

  const handleExport = async (extension: 'png' | 'svg') => {
    if (!qrCode) return;
    console.log('handleExport called', extension);
    try {
      const blob = await qrCode.getRawData(extension);
      if (!blob) {
        console.error('Failed to generate QR data');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;

        if (Capacitor.isNativePlatform()) {
          try {
            console.log('Calling NativeExport.saveImage');
            await NativeExport.saveImage({
              base64: base64Data,
              name: `qr-pro-${Date.now()}.${extension}`
            });
            setNotification({
              message: extension === 'svg' ? 'Vector SVG saved to Downloads!' : 'Success! Image saved to Gallery.',
              type: 'success'
            });
          } catch (e: any) {
            console.error('Native Save Error', e);
            setNotification({ message: 'Save Failed: ' + (e.message || 'Unknown error'), type: 'error' });
          }
        } else {
          qrCode.download({ name: 'qr-pro', extension });
        }
      };
      reader.readAsDataURL(blob);
    } catch (error: any) {
      console.error('Export logic failed', error);
      setNotification({ message: 'Export failed: ' + (error.message || 'Unknown error'), type: 'error' });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setLogoFile(reader.result as string);
        setCenterText('');
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <>
      <div className="aurora-bg" />
      
      {/* Themed Notification Modal */}
      {notification && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setNotification(null)}
        >
          <div
            className="bg-[#0d0d12] border border-white/10 p-8 rounded-[32px] shadow-2xl flex flex-col items-center gap-6 animate-in zoom-in-95 duration-300 w-full max-w-sm text-center"
            onClick={e => e.stopPropagation()}
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${notification.type === 'success' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
              {notification.type === 'success' ? <CheckCircle className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
            </div>

            <div>
              <h3 className="text-white font-black text-xl mb-2">
                {notification.type === 'success' ? 'Export Complete' : 'Export Failed'}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                {notification.message}
              </p>
            </div>

            <button
              className="w-full bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/90 active:scale-95 transition-all mt-2"
              onClick={() => setNotification(null)}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Advanced Color Picker Modal */}
      {activeColorPicker && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200" 
          onClick={() => setActiveColorPicker(null)}
        >
          <div 
            className="bg-[#0d0d12] border border-white/10 p-6 sm:p-8 rounded-[32px] shadow-2xl flex flex-col items-center gap-6 animate-in zoom-in-95 duration-200 w-full max-w-sm" 
            onClick={e => e.stopPropagation()}
          >
            <div className="w-full flex justify-between items-center mb-2">
              <h3 className="text-white font-black tracking-widest uppercase text-xs sm:text-sm">
                {activeColorPicker === 'primary' ? 'Primary Tone' : 'Secondary Tone'}
              </h3>
              <button onClick={() => setActiveColorPicker(null)} className="text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <HexColorPicker 
              color={activeColorPicker === 'primary' ? primaryColor : secondaryColor} 
              onChange={activeColorPicker === 'primary' ? setPrimaryColor : setSecondaryColor} 
            />
            
            <div className="w-full space-y-3 mt-2">
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest text-center">Premium Presets</div>
              <div className="flex flex-wrap gap-3 justify-center">
                {['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#1e1e2e', '#ffffff'].map(c => (
                  <button 
                    key={c} 
                    className="w-8 h-8 rounded-full border border-white/20 shadow-lg transition-transform hover:scale-110 active:scale-95" 
                    style={{backgroundColor: c}} 
                    onClick={() => activeColorPicker === 'primary' ? setPrimaryColor(c) : setSecondaryColor(c)} 
                  />
                ))}
              </div>
            </div>

            <button 
              className="w-full bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest mt-2 hover:bg-white/90 active:scale-95 transition-all"
              onClick={() => setActiveColorPicker(null)}
            >
              Apply Color
            </button>
          </div>
        </div>
      )}

      <div className="min-h-screen p-4 md:p-8 flex justify-center">
        <div className="w-full max-w-[1400px] grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* Bento Box Controls */}
          <div className="xl:col-span-7 flex flex-col gap-6 order-1 xl:order-1">
            
            {/* Header */}
            <header className="mb-2 md:mb-4 pl-2 text-center xl:text-left">
              <div className="inline-flex items-center justify-center xl:justify-start gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-[#8b5cf6] mb-4 uppercase tracking-[0.2em]">
                <Wand2 className="w-3 h-3" /> KaiGamwTaQR
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-0">
                  <div className="flex items-center gap-2 text-white/80">
                    <Layers className="w-4 h-4 text-[#10b981]" />
                    <span className="text-xs font-bold uppercase tracking-widest">Centerpiece</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <span className="text-[10px] font-bold text-white/40 group-hover:text-white/80 transition-colors uppercase tracking-wider">Isolate</span>
                      <div className="relative inline-flex items-center">
                        <input type="checkbox" checked={clearCenter} onChange={(e) => setClearCenter(e.target.checked)} className="sr-only peer" />
                        <div className="w-8 h-4 bg-[#16161d] rounded-full border border-white/10 peer-checked:bg-[#10b981] peer-checked:border-[#10b981] transition-colors duration-300" />
                        <div className="absolute left-0 top-0 w-4 h-4 bg-white rounded-full scale-[0.65] transition-transform duration-300 peer-checked:translate-x-4 shadow-sm" />
                      </div>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <span className="text-[10px] font-bold text-white/40 group-hover:text-white/80 transition-colors uppercase tracking-wider">Colorize</span>
                      <div className="relative inline-flex items-center">
                        <input type="checkbox" checked={colorizeCenter} onChange={(e) => setColorizeCenter(e.target.checked)} className="sr-only peer" />
                        <div className="w-8 h-4 bg-[#16161d] rounded-full border border-white/10 peer-checked:bg-[#10b981] peer-checked:border-[#10b981] transition-colors duration-300" />
                        <div className="absolute left-0 top-0 w-4 h-4 bg-white rounded-full scale-[0.65] transition-transform duration-300 peer-checked:translate-x-4 shadow-sm" />
                      </div>
                    </label>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="relative">
                    <input 
                      type="text" 
                      value={centerText} 
                      onChange={(e) => { setCenterText(e.target.value); setLogoFile(null); }}
                      className="sota-input text-center text-lg font-black tracking-wide"
                      placeholder="Type Text or Emoji..."
                    />
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-0">
                  <div className="flex items-center gap-2 text-white/80">
                    <Palette className="w-4 h-4 text-[#f59e0b]" />
                    <span className="text-xs font-bold uppercase tracking-widest">Color Engine</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <span className="text-[10px] font-bold text-white/40 group-hover:text-white/80 transition-colors uppercase tracking-wider">Transparent</span>
                      <div className="relative inline-flex items-center">
                        <input type="checkbox" checked={isTransparent} onChange={(e) => setIsTransparent(e.target.checked)} className="sr-only peer" />
                        <div className="w-8 h-4 bg-[#16161d] rounded-full border border-white/10 peer-checked:bg-[#f59e0b] peer-checked:border-[#f59e0b] transition-colors duration-300" />
                        <div className="absolute left-0 top-0 w-4 h-4 bg-white rounded-full scale-[0.65] transition-transform duration-300 peer-checked:translate-x-4 shadow-sm" />
                      </div>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <span className="text-[10px] font-bold text-white/40 group-hover:text-white/80 transition-colors uppercase tracking-wider">Gradient</span>
                      <div className="relative inline-flex items-center">
                        <input type="checkbox" checked={isGradient} onChange={(e) => setIsGradient(e.target.checked)} className="sr-only peer" />
                        <div className="w-8 h-4 bg-[#16161d] rounded-full border border-white/10 peer-checked:bg-[#f59e0b] peer-checked:border-[#f59e0b] transition-colors duration-300" />
                        <div className="absolute left-0 top-0 w-4 h-4 bg-white rounded-full scale-[0.65] transition-transform duration-300 peer-checked:translate-x-4 shadow-sm" />
                      </div>
                    </label>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div 
                    onClick={() => setActiveColorPicker('primary')}
                    className="flex items-center gap-4 bg-[#16161d] border border-white/[0.05] hover:border-white/20 p-3 rounded-2xl cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <div 
                      className="w-10 h-10 rounded-xl shadow-inner shrink-0" 
                      style={{ backgroundColor: primaryColor }}
                    />
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest truncate">Primary Tone</div>
                      <div className="text-xs font-mono font-medium text-white/80 uppercase truncate">{primaryColor}</div>
                    </div>
                  </div>

                  <div 
                    onClick={() => isGradient && setActiveColorPicker('secondary')}
                    className={`flex items-center gap-4 bg-[#16161d] border border-white/[0.05] hover:border-white/20 p-3 rounded-2xl transition-all duration-300 ${isGradient ? 'opacity-100 cursor-pointer active:scale-[0.98]' : 'opacity-30 grayscale pointer-events-none'}`}
                  >
                    <div 
                      className="w-10 h-10 rounded-xl shadow-inner shrink-0"
                      style={{ backgroundColor: secondaryColor }}
                    />
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest truncate">Secondary Tone</div>
                      <div className="text-xs font-mono font-medium text-white/80 uppercase truncate">{secondaryColor}</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Preview Stage (Sticky) */}
          <div className="xl:col-span-5 order-2 xl:sticky top-4 xl:top-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
            <div className="relative group perspective-1000">
              
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#8b5cf6] via-transparent to-[#3b82f6] rounded-[32px] sm:rounded-[48px] blur-xl sm:blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
              
              <div className="relative bg-[#0d0d12]/80 backdrop-blur-3xl border border-white/10 p-2 sm:p-3 rounded-[32px] sm:rounded-[40px] shadow-2xl flex flex-col">
                
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Live Canvas</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hidden sm:block">1000x1000 PX</span>
                </div>

                <div className="p-4 sm:p-8 md:p-12 flex items-center justify-center">
                  <div className={`relative w-full max-w-[350px] aspect-square rounded-2xl md:rounded-3xl p-4 sm:p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_16px_32px_-8px_rgba(0,0,0,0.5)] transform transition-transform duration-700 hover:scale-[1.03] overflow-hidden flex items-center justify-center ${isTransparent ? 'bg-checkerboard' : 'bg-white'}`}>
                    <div id="qr-container" ref={qrRef} className="w-full h-full flex items-center justify-center" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 pt-0">
                  <button 
                    onClick={() => handleExport('png')}
                    className="bg-white hover:bg-white/90 text-black py-3 sm:py-4 rounded-[20px] sm:rounded-3xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" /> PNG Export
                  </button>
                  <button 
                    onClick={() => handleExport('svg')}
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
