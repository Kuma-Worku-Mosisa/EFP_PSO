import { useState, useEffect, useRef } from "react";
import { Calendar } from "lucide-react";

const ethMonthsAm = [
  "መስከረም", "ጥቅምት", "ህዳር", "ታህሳስ", "ጥር", "የካቲት",
  "መጋቢት", "ሚያዚያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሀሴ", "ጳጉሜን",
];

const JDN_EPOCH = 1723856;

function gregorianToJDN(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function gregorianToEthiopian(year: number, month: number, day: number) {
  const jdn = gregorianToJDN(year, month, day);
  const yearEC = Math.floor((4 * (jdn - JDN_EPOCH) + 3) / 1461);
  const remaining = jdn - (365 * yearEC + Math.floor(yearEC / 4) + JDN_EPOCH);
  const monthEC = Math.floor(remaining / 30) + 1;
  const dayEC = Math.floor(remaining) - 30 * (monthEC - 1) + 1;
  return { year: yearEC + 1, month: monthEC, day: dayEC };
}

function ethiopianToJDN(year: number, month: number, day: number): number {
  return JDN_EPOCH + 365 * (year - 1) + Math.floor(year / 4) + 30 * (month - 1) + day - 1;
}

function ethiopianToGregorian(year: number, month: number, day: number): Date {
  const jdn = ethiopianToJDN(year, month, day);
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const gYear = 100 * b + d - 4800 + Math.floor(m / 10);
  const gMonth = m + 3 - 12 * Math.floor(m / 10);
  const gDay = e - Math.floor((153 * m + 2) / 5) + 1;
  return new Date(gYear, gMonth - 1, gDay);
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function getEthDisplay(isoDate: string): string {
  if (!isoDate) return "";
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  const gy = parseInt(parts[0]), gm = parseInt(parts[1]), gd = parseInt(parts[2]);
  const eth = gregorianToEthiopian(gy, gm, gd);
  return `${eth.day} ${ethMonthsAm[eth.month - 1]} ${eth.year}`;
}

function parseEthInput(text: string): { year: number; month: number; day: number } | null {
  const trimmed = text.trim();
  const tokens = trimmed.split(/\s+/);
  if (tokens.length !== 3) return null;
  const day = parseInt(tokens[0]);
  if (isNaN(day) || day < 1) return null;
  const monthIdx = ethMonthsAm.findIndex((m) => m.startsWith(tokens[1]));
  if (monthIdx === -1) return null;
  const year = parseInt(tokens[2]);
  if (isNaN(year) || year < 1900) return null;
  const maxDays = monthIdx < 12 ? 30 : ((year + 1) % 4 === 0 ? 6 : 5);
  if (day > maxDays) return null;
  return { year, month: monthIdx + 1, day };
}

interface EthiopianDatePickerProps {
  value: string;
  onChange: (isoDate: string) => void;
  className?: string;
  placeholder?: string;
  useEthiopian: boolean;
}

export default function EthiopianDatePicker({
  value,
  onChange,
  className = "",
  placeholder = "Select date...",
  useEthiopian,
}: EthiopianDatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [ethYear, setEthYear] = useState(2010);
  const [ethMonth, setEthMonth] = useState(1);
  const [ethDay, setEthDay] = useState(1);
  const [textInput, setTextInput] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const currentEthYear = new Date().getFullYear() - 8;

  useEffect(() => {
    if (useEthiopian && value) {
      const display = getEthDisplay(value);
      setTextInput(display);
      const parts = value.split("-");
      if (parts.length === 3) {
        const gy = parseInt(parts[0]), gm = parseInt(parts[1]), gd = parseInt(parts[2]);
        const eth = gregorianToEthiopian(gy, gm, gd);
        setEthYear(eth.year);
        setEthMonth(eth.month);
        setEthDay(eth.day);
      }
    } else if (!useEthiopian) {
      setTextInput("");
    }
  }, [useEthiopian, value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const commitEthDate = (y: number, m: number, d: number) => {
    const greg = ethiopianToGregorian(y, m, d);
    const iso = `${greg.getFullYear()}-${pad(greg.getMonth() + 1)}-${pad(greg.getDate())}`;
    onChange(iso);
    setEthYear(y);
    setEthMonth(m);
    setEthDay(d);
    setTextInput(`${d} ${ethMonthsAm[m - 1]} ${y}`);
  };

  const handleTextChange = (newText: string) => {
    const filtered = newText.replace(/[^0-9\/\u1200-\u137F\u1380-\u139F\u2D80-\u2DDF\uAB00-\uAB2F\s]/g, "");
    setTextInput(filtered);
    const parsed = parseEthInput(filtered);
    if (parsed) {
      commitEthDate(parsed.year, parsed.month, parsed.day);
    }
  };

  if (!useEthiopian) {
    return (
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={className}
        />
      </div>
    );
  }

  const yearOptions: number[] = [];
  for (let i = 1900; i <= currentEthYear; i++) {
    yearOptions.push(i);
  }

  const isLeap = (ethYear + 1) % 4 === 0;
  const maxDays = ethMonth <= 12 ? 30 : (isLeap ? 6 : 5);

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <Calendar
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 cursor-pointer"
          onClick={() => setShowPicker(!showPicker)}
        />
        <input
          type="text"
          value={textInput}
          onChange={(e) => handleTextChange(e.target.value)}
          onFocus={() => setShowPicker(true)}
          placeholder={placeholder}
          className={className}
        />
      </div>
      {showPicker && (
        <div className="absolute top-full mt-1 left-0 bg-white rounded-xl border border-gray-200 shadow-lg z-30 p-4 w-72">
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div>
              <label className="text-[10px] font-bold text-gray-500 block mb-1">ቀን</label>
              <select
                value={ethDay}
                onChange={(e) => {
                  const d = parseInt(e.target.value);
                  commitEthDate(ethYear, ethMonth, d);
                }}
                className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
              >
                {Array.from({ length: maxDays }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 block mb-1">ወር</label>
              <select
                value={ethMonth}
                onChange={(e) => {
                  const m = parseInt(e.target.value);
                  commitEthDate(ethYear, m, ethDay);
                }}
                className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
              >
                {ethMonthsAm.map((name, i) => (
                  <option key={i + 1} value={i + 1}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 block mb-1">ዓመት</label>
              <select
                value={ethYear}
                onChange={(e) => {
                  const y = parseInt(e.target.value);
                  commitEthDate(y, ethMonth, ethDay);
                }}
                className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
