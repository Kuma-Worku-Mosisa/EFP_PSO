import { useState, useRef, useEffect } from "react";
import { Clock, Check, X } from "lucide-react";

interface EthiopianTimePickerProps {
  value: string;
  onChange: (time24: string) => void;
  className?: string;
  useEthiopian: boolean;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function toEthiopianTime(h24: number, min: number): { hour: number; minute: number; isDay: boolean } {
  const h = (h24 + 24) % 24;
  let ethHour = (h - 6 + 24) % 12;
  if (ethHour === 0) ethHour = 12;
  const isDay = h >= 6 && h < 18;
  return { hour: ethHour, minute: min, isDay };
}

function toLocalHour24(ethHour: number, isDay: boolean): number {
  if (isDay) {
    return (ethHour === 12 ? 18 : ethHour + 6);
  }
  return (ethHour === 12 ? 6 : (ethHour + 18) % 24);
}

function parseTime24(value: string): { h: number; m: number } | null {
  if (!value) return null;
  const m = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = parseInt(m[1]);
  const min = parseInt(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return { h, m: min };
}

export default function EthiopianTimePicker({
  value,
  onChange,
  className = "",
  useEthiopian,
}: EthiopianTimePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [pendingTime, setPendingTime] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const prevValueRef = useRef(value);
  const nativeTimeRef = useRef<HTMLInputElement>(null);

  const parsed = parseTime24(value);
  const eth = parsed ? toEthiopianTime(parsed.h, parsed.m) : { hour: 12, minute: 0, isDay: true };

  const [tempHour, setTempHour] = useState(eth.hour);
  const [tempMinute, setTempMinute] = useState(eth.minute);
  const [tempIsDay, setTempIsDay] = useState(eth.isDay);

  useEffect(() => {
    if (useEthiopian) {
      setTempHour(eth.hour);
      setTempMinute(eth.minute);
      setTempIsDay(eth.isDay);
    }
  }, [useEthiopian, value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowPicker(false);
        setPendingTime("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const commitEthTime = (hour: number, minute: number, isDay: boolean) => {
    const h24 = toLocalHour24(hour, isDay);
    onChange(`${pad(h24)}:${pad(minute)}`);
  };

  if (!useEthiopian) {
    return (
      <div className="relative" ref={wrapperRef}>
        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          ref={nativeTimeRef}
          type="time"
          value={value}
          onChange={(e) => {
            prevValueRef.current = value;
            setPendingTime(e.target.value);
            setShowPicker(true);
          }}
          onClick={() => nativeTimeRef.current?.showPicker?.()}
          className={`${className} cursor-pointer focus:outline-none focus:ring-0`}
        />
        {showPicker && pendingTime && (
          <div className="absolute top-full mt-1 left-0 bg-white rounded-xl border border-gray-200 shadow-lg z-30 p-3 w-64 flex items-center justify-end gap-2">
            <span className="text-xs text-gray-500 mr-auto">{pendingTime}</span>
            <button
              type="button"
              onClick={() => {
                onChange(prevValueRef.current);
                setShowPicker(false);
                setPendingTime("");
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onChange(pendingTime);
                setShowPicker(false);
                setPendingTime("");
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Confirm
            </button>
          </div>
        )}
      </div>
    );
  }

  const ethDisplay = `${eth.hour}:${pad(eth.minute)} ${eth.isDay ? "ቀን" : "ሌሊት"}`;

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          readOnly
          value={ethDisplay}
          onClick={() => {
            setTempHour(eth.hour);
            setTempMinute(eth.minute);
            setTempIsDay(eth.isDay);
            setShowPicker(true);
          }}
          placeholder="ሰዓት ይምረጡ..."
          className={`${className} pl-10 cursor-pointer`}
        />
        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
      {showPicker && (
        <div className="absolute top-full mt-1 left-0 bg-white rounded-xl border border-gray-200 shadow-lg z-30 p-4 w-72">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-gray-500 block mb-1 text-center">ሰዓት</label>
              <select
                value={tempHour}
                onChange={(e) => setTempHour(parseInt(e.target.value))}
                className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-center"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
            <span className="text-sm font-bold mt-5">:</span>
            <div className="flex-1">
              <label className="text-[10px] font-bold text-gray-500 block mb-1 text-center">ደቂቃ</label>
              <select
                value={pad(tempMinute)}
                onChange={(e) => setTempMinute(parseInt(e.target.value))}
                className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-center"
              >
                {Array.from({ length: 60 }, (_, i) => pad(i)).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-bold text-gray-500 block mb-1 text-center">ጊዜ</label>
              <select
                value={tempIsDay ? "ቀን" : "ሌሊት"}
                onChange={(e) => setTempIsDay(e.target.value === "ቀን")}
                className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-center"
              >
                <option value="ቀን">ቀን</option>
                <option value="ሌሊት">ሌሊት</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <div className="text-[10px] text-gray-400">
              አሁን: {ethDisplay}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowPicker(false)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                ሰርዝ
              </button>
              <button
                type="button"
                onClick={() => {
                  commitEthTime(tempHour, tempMinute, tempIsDay);
                  setShowPicker(false);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                አረጋግጥ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
