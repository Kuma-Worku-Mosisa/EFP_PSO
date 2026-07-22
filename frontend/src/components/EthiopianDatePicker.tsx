import { useState, useEffect, useRef } from "react";
import { Calendar, Check, X } from "lucide-react";

const ethMonthsAm = [
  "መስከረም",
  "ጥቅምት",
  "ህዳር",
  "ታህሳስ",
  "ጥር",
  "የካቲት",
  "መጋቢት",
  "ሚያዚያ",
  "ግንቦት",
  "ሰኔ",
  "ሐምሌ",
  "ነሀሴ",
  "ጳጉሜን",
];

const JDN_EPOCH = 1724221;

function gregorianToJDN(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
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
  return (
    JDN_EPOCH +
    365 * (year - 1) +
    Math.floor(year / 4) +
    30 * (month - 1) +
    day -
    1
  );
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
  const currentEthYear = new Date().getFullYear() - 8;
  const [showPicker, setShowPicker] = useState(false);
  const [ethYear, setEthYear] = useState(currentEthYear);
  const [ethMonth, setEthMonth] = useState(1);
  const [ethDay, setEthDay] = useState(1);
  const [tempYear, setTempYear] = useState(currentEthYear);
  const [tempMonth, setTempMonth] = useState(1);
  const [tempDay, setTempDay] = useState(1);
  const [pendingDate, setPendingDate] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const prevValueRef = useRef(value);
  const [localDate, setLocalDate] = useState(value);
  const nativeDateRef = useRef<HTMLInputElement>(null);

  const openNativeDatePicker = () => {
    if (nativeDateRef.current) {
      if (typeof nativeDateRef.current.showPicker === "function") {
        nativeDateRef.current.showPicker();
      } else {
        nativeDateRef.current.click();
      }
    }
  };

  useEffect(() => {
    if (!useEthiopian && !showPicker) setLocalDate(value);
  }, [value, useEthiopian, showPicker]);

  useEffect(() => {
    if (useEthiopian && value) {
      const parts = value.split("-");
      if (parts.length === 3) {
        const gy = parseInt(parts[0]),
          gm = parseInt(parts[1]),
          gd = parseInt(parts[2]);
        const eth = gregorianToEthiopian(gy, gm, gd);
        setEthYear(eth.year);
        setEthMonth(eth.month);
        setEthDay(eth.day);
      }
    }
  }, [useEthiopian, value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setShowPicker(false);
        setPendingDate("");
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
  };

  if (!useEthiopian) {
    return (
      <div className="relative" ref={wrapperRef}>
        <input
          ref={nativeDateRef}
          type="date"
          value={localDate}
          onChange={(e) => {
            prevValueRef.current = localDate;
            setPendingDate(e.target.value);
            setShowPicker(true);
          }}
          onClick={() => nativeDateRef.current?.showPicker?.()}
          className={`${className} cursor-pointer`}
        />
        {showPicker && pendingDate && (
          <div className="absolute top-full mt-1 left-0 bg-white rounded-xl border border-gray-200 shadow-lg z-30 p-3 w-64 flex items-center justify-end gap-2">
            <span className="text-xs text-gray-500 mr-auto">{pendingDate}</span>
            <button
              type="button"
              onClick={() => {
                setLocalDate(prevValueRef.current);
                setShowPicker(false);
                setPendingDate("");
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onChange(pendingDate);
                setLocalDate(pendingDate);
                setShowPicker(false);
                setPendingDate("");
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

  const yearOptions: number[] = [];
  for (let i = currentEthYear; i <= currentEthYear + 5; i++) {
    yearOptions.push(i);
  }
  const isLeap = (tempYear + 1) % 4 === 0;
  const maxDays = tempMonth <= 12 ? 30 : isLeap ? 6 : 5;
  const todayEth = gregorianToEthiopian(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    new Date().getDate(),
  );

  return (
    <div className="relative" ref={wrapperRef}>
      <div
        className="flex items-center rounded-lg border border-slate-300 bg-white hover:border-[#003366]/50 transition-all shadow-sm focus-within:ring-2 focus-within:ring-[#003366]/30 focus-within:border-[#003366]"
        onClick={() => setShowPicker(!showPicker)}
      >
        <input
          type="text"
          readOnly
          value={
            value ? `${ethDay} ${ethMonthsAm[ethMonth - 1]} ${ethYear}` : ""
          }
          placeholder={placeholder}
          className="flex-1 min-w-0 border-0 outline-none p-2.5 text-sm bg-transparent cursor-pointer"
        />
        <div className="flex items-center justify-center w-10 h-full pr-1 shrink-0 cursor-pointer">
          <Calendar className="w-4 h-4 text-gray-400" />
        </div>
      </div>
      {showPicker && (
        <div className="absolute top-full mt-1 left-0 bg-white rounded-xl border border-gray-200 shadow-lg z-30 p-4 w-72">
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div>
              <label className="text-[10px] font-bold text-gray-500 block mb-1">
                ቀን
              </label>
              <select
                value={tempDay}
                onChange={(e) => setTempDay(parseInt(e.target.value))}
                className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
              >
                {Array.from({ length: maxDays }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 block mb-1">
                ወር
              </label>
              <select
                value={tempMonth}
                onChange={(e) => setTempMonth(parseInt(e.target.value))}
                className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
              >
                {ethMonthsAm.map((name, i) => (
                  <option key={i + 1} value={i + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 block mb-1">
                ዓመት
              </label>
              <select
                value={tempYear}
                onChange={(e) => setTempYear(parseInt(e.target.value))}
                className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <div className="text-[10px] text-gray-400">
              ዛሬ: {todayEth.day} {ethMonthsAm[todayEth.month - 1]}{" "}
              {todayEth.year}
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
                  commitEthDate(tempYear, tempMonth, tempDay);
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
