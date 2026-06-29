import { useRef, useState, useEffect, useCallback } from "react";
import { Fingerprint, Trash2, CheckCircle2, MousePointer2 } from "lucide-react";

interface SignaturePadProps {
  value: string;
  onChange: (dataUrl: string) => void;
  label?: string;
  placeholder?: string;
}

export default function SignaturePad({ value, onChange, label, placeholder }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const getPos = (e: MouseEvent | TouchEvent, rect: DOMRect) => {
    if ("touches" in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (isConfirmed) return;
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const pos = getPos(e.nativeEvent as any, rect);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }, [isConfirmed]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (isConfirmed) return;
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const pos = getPos(e.nativeEvent as any, rect);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#003366";
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setHasDrawn(true);
  }, [isDrawing, isConfirmed]);

  const endDraw = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setIsConfirmed(false);
    onChange("");
  };

  const confirmSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsConfirmed(true);
    onChange(canvas.toDataURL("image/png"));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (value && value.startsWith("data:image")) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        setHasDrawn(true);
        setIsConfirmed(true);
      };
      img.src = value;
    }
  }, [value]);

  return (
    <div>
      {label && (
        <div className="flex items-center gap-2 mb-2">
          <Fingerprint className="w-4 h-4 text-gray-400" />
          <span className="text-[11px] uppercase tracking-[0.15em] font-bold text-[#003366]">
            {label}
          </span>
        </div>
      )}
      <div className={`relative border-2 rounded-xl overflow-hidden bg-white transition-colors ${
        isConfirmed
          ? "border-green-400 bg-green-50/30"
          : "border-dashed border-gray-200 hover:border-[#003366]/30"
      }`}>
        <canvas
          ref={canvasRef}
          width={500}
          height={120}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
          className="w-full h-[120px] cursor-crosshair touch-none"
        />
        {!hasDrawn && !value && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <div className="flex flex-col items-center gap-1">
              <MousePointer2 className="w-5 h-5 text-gray-300" />
              <span className="text-gray-400 text-xs font-medium">
                {placeholder || "Use left click / touch and drag to sign"}
              </span>
            </div>
          </div>
        )}
        {isConfirmed && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Verified
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 mt-1.5">
        {hasDrawn && !isConfirmed && (
          <>
            <button
              type="button"
              onClick={confirmSignature}
              className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 hover:text-green-700 transition-colors bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg border border-green-200"
            >
              <CheckCircle2 className="w-3 h-3" />
              Confirm Signature
            </button>
            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
          </>
        )}
        {isConfirmed && (
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Re-sign
          </button>
        )}
      </div>
    </div>
  );
}
