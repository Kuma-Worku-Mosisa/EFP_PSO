export type LocalizedLocationRow = {
  id: number;
  name?: string;
  nameEnglish?: string;
  nameAmharic?: string;
  regionId?: number | null;
  zoneId?: number | null;
  woredaId?: number | null;
};

export type LanguageCode = "en" | "am";

const getLocalizedLocationName = (
  row:
    | Pick<LocalizedLocationRow, "name" | "nameEnglish" | "nameAmharic">
    | null
    | undefined,
  language: LanguageCode,
) => {
  if (!row) return "";

  return language === "am"
    ? row.nameAmharic || row.name || row.nameEnglish || ""
    : row.nameEnglish || row.name || row.nameAmharic || "";
};

export const mapLocalizedLocationRows = <T extends LocalizedLocationRow>(
  rows: T[] | null | undefined,
  language: LanguageCode,
) =>
  (rows || []).map((row) => ({
    ...row,
    nameEnglish: row.nameEnglish || row.name || String(row.id),
    nameAmharic: row.nameAmharic || row.name || String(row.id),
    name: getLocalizedLocationName(row, language) || String(row.id),
    regionId: row.regionId ?? (row as any).region_id ?? null,
    zoneId: row.zoneId ?? (row as any).zone_id ?? null,
    woredaId: row.woredaId ?? (row as any).woreda_id ?? null,
  }));
