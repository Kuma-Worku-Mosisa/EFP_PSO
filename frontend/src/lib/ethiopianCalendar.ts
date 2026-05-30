/** Format dates for inspection PDFs (Gregorian or Ethiopian calendar). */
export function formatInspectionPdfDate(
  value?: string | null,
  options?: { ethiopian?: boolean; includeTime?: boolean },
): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  const includeTime = options?.includeTime !== false;

  if (options?.ethiopian) {
    const ethiopicCalendars = ["ethiopic", "ethioaa"] as const;
    for (const calendar of ethiopicCalendars) {
      try {
        const formatter = new Intl.DateTimeFormat("am-ET", {
          calendar,
          year: "numeric",
          month: "long",
          day: "numeric",
          ...(includeTime
            ? { hour: "2-digit", minute: "2-digit", hour12: true }
            : {}),
        });
        const formatted = formatter.format(date);
        if (formatted && !/^invalid/i.test(formatted)) {
          return formatted;
        }
      } catch {
        // try next calendar id
      }
    }

    return formatEthiopianDateFallback(date, includeTime);
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}

const ETHIOPIAN_MONTHS = [
  "መስከረም",
  "ጥቅምት",
  "ኅዳር",
  "ታኅሣሥ",
  "ጥር",
  "የካቲት",
  "መጋቢት",
  "ሚያዝያ",
  "ግንቦት",
  "ሰኔ",
  "ሐምሌ",
  "ነሐሴ",
  "ጳጉሜን",
];

const ETHIOPIAN_EPOCH = 1723856;

function gregorianToJdn(year: number, month: number, day: number): number {
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

function jdnToEthiopian(jdn: number): {
  year: number;
  month: number;
  day: number;
} {
  const offset = jdn - ETHIOPIAN_EPOCH;
  const r = offset % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);
  const year =
    4 * Math.floor(offset / 1461) +
    Math.floor(r / 365) -
    Math.floor(r / 1460);
  const month = Math.floor(n / 30) + 1;
  const day = (n % 30) + 1;
  return { year, month, day };
}

/** Gregorian → Ethiopian display when Intl ethiopic calendar is unavailable. */
function formatEthiopianDateFallback(date: Date, includeTime: boolean): string {
  const jdn = gregorianToJdn(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );
  const { year, month, day } = jdnToEthiopian(jdn);
  const monthName = ETHIOPIAN_MONTHS[month - 1] ?? String(month);

  let result = `${monthName} ${day}, ${year} ዓ.ም.`;

  if (includeTime) {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const hour12 = hours % 12 || 12;
    const ampm = hours < 12 ? "ጠዋት" : "ማታ";
    result += ` · ${hour12}:${minutes} ${ampm}`;
  }

  return result;
}
