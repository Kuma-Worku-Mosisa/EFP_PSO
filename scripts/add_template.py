filepath = 'frontend/src/pages/fieldReviewer/InspectionReviewForm.tsx'
content = open(filepath, 'r', encoding='utf-8').read()

# ── 1. Remove the Regenerate PDF button block ─────────────────────────────────
old_regen = """                      {/* Regenerate with selected language */}
                      <button
                        type="button"
                        onClick={handleConfirmFinalReport}
                        disabled={!isLeadInspector || reportGenerating}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#C5A022] text-[#003366] font-bold hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {reportGenerating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                        {reportGenerating
                          ? (isAm ? "PDF \u1260\u1218\u134d\u1320\u122d \u120b\u12ed..." : "Regenerating...")
                          : (isAm ? "\u12a5\u1295\u12f0\u1308\u1293 \u134d\u1320\u122d" : "Regenerate PDF")}
                      </button>"""

if old_regen in content:
    content = content.replace(old_regen, '')
    print("Regen button: REMOVED")
else:
    print("Regen button: not found (may already be removed)")

# ── 2. Fix View PDF icon (FileText -> Eye) and Download PDF icon ──────────────
old_view = """                        <FileText className="w-4 h-4" />
                        {isAm ? "PDF \u12ed\u1218\u120d\u12a8\u1271" : "View PDF"}"""
new_view = """                        <Eye className="w-4 h-4" />
                        {isAm ? "PDF \u12ed\u1218\u120d\u12a8\u1271" : "View PDF"}"""
if old_view in content:
    content = content.replace(old_view, new_view)
    print("View icon: FIXED")

old_dl = """                        <UploadCloud className="w-4 h-4 rotate-180" />
                        {isAm ? "PDF \u12eb\u12c8\u122d\u12f1" : "Download PDF"}"""
new_dl = """                        <Download className="w-4 h-4" />
                        {isAm ? "PDF \u12eb\u12c8\u122d\u12f1" : "Download PDF"}"""
if old_dl in content:
    content = content.replace(old_dl, new_dl)
    print("Download icon: FIXED")

# ── 3. Add hidden PDF template + pdfTemplateRef just before closing </div> ────
# Find the last </div>\n  );\n}; pattern which closes the return
old_closing = """export default InspectionReviewForm;"""

# Build the hidden template HTML
template = """
// ─── Hidden PDF Template (rendered by html2canvas) ───────────────────────────
const PdfTemplate: React.FC<{
  inspection: InspectionDetail;
  lang: "en" | "am";
  currentUser: any;
  leadCommittee: any;
  resolveUrl: (u?: string | null) => string;
}> = ({ inspection, lang, currentUser, leadCommittee, resolveUrl }) => {
  const L = lang === "am";
  const s = (v?: string | number | boolean | null) =>
    v === null || v === undefined || v === "" ? "-" : String(v);
  const org = inspection.application?.organization;
  const addr = org?.address;
  const appUser = inspection.application?.user;

  const region = addr?.kebele?.woreda?.zone?.region?.nameEnglish || addr?.kebele?.woreda?.zone?.region?.nameAmharic || "-";
  const zone   = addr?.kebele?.woreda?.zone?.nameEnglish || addr?.kebele?.woreda?.zone?.nameAmharic || "-";
  const woreda = addr?.kebele?.woreda?.nameEnglish || addr?.kebele?.woreda?.nameAmharic || "-";
  const kebele = addr?.kebele?.nameEnglish || addr?.kebele?.nameAmharic || "-";

  const committeeRows = (() => {
    const rows: Array<{ id: number; name: string; role: string; sigUrl?: string | null; signedAt?: string | null }> = [];
    if (inspection.leadInspector) {
      rows.push({
        id: inspection.leadInspector.id,
        name: leadCommittee?.expertName || inspection.leadInspector.fullName || inspection.leadInspector.username || (L ? "\\u12cb\\u1293 \\u1270\\u1241\\u1323\\u122a" : "Lead Inspector"),
        role: leadCommittee?.expertRole || (L ? "\\u12cb\\u1293 \\u1270\\u1241\\u1323\\u122a" : "Lead Inspector"),
        sigUrl: leadCommittee?.signatureUrl ?? null,
        signedAt: leadCommittee?.signedAt ?? null,
      });
    }
    for (const m of inspection.committeeMembers || []) {
      if (m.userId && m.userId === inspection.leadInspector?.id) continue;
      rows.push({ id: m.id, name: m.expertName || (L ? "\\u12e8\\u12ae\\u121c\\u1274 \\u12a0\\u1263\\u120d" : "Committee Member"), role: m.expertRole || (L ? "\\u12e8\\u12ae\\u121c\\u1274 \\u12a0\\u1263\\u120d" : "Committee Member"), sigUrl: m.signatureUrl ?? null, signedAt: m.signedAt ?? null });
    }
    return rows;
  })();

  const fmt = (v?: string) => {
    if (!v) return "-";
    const d = new Date(v);
    if (isNaN(d.getTime())) return v;
    return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(d);
  };

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 600, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, color: "#111827", fontWeight: 400 }}>{value}</div>
    </div>
  );

  const TwoCol = ({ left, right }: { left: React.ReactNode; right: React.ReactNode }) => (
    <div style={{ display: "flex", gap: 24, marginBottom: 4 }}>
      <div style={{ flex: 1 }}>{left}</div>
      <div style={{ flex: 1 }}>{right}</div>
    </div>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <div style={{ background: "#003366", borderRadius: 6, padding: "7px 14px", marginBottom: 14, marginTop: 8 }}>
      <span style={{ color: "#FFD700", fontWeight: 700, fontSize: 13 }}>{title}</span>
    </div>
  );

  const LongText = ({ title, text }: { title: string; text: string }) => (
    <div style={{ marginBottom: 16 }}>
      <SectionHeader title={title} />
      <div style={{ background: "#f8fafc", border: "1px solid #dce8f0", borderRadius: 6, padding: "12px 14px", borderLeft: "4px solid #003366", fontSize: 12, color: "#1f2937", lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {text || "-"}
      </div>
    </div>
  );

  const checks = [
    { label: L ? "\\u1266\\u1273 \\u1275\\u12ad\\u12a8\\u129b \\u1290\\u12cd" : "Location Valid", ok: Boolean(inspection.isLocationValid) },
    { label: L ? "\\u1218\\u1230\\u1228\\u1270 \\u120d\\u121b\\u1275 \\u1275\\u12ad\\u12a8\\u129b \\u1290\\u12cd" : "Infrastructure Valid", ok: Boolean(inspection.isInfrastructureValid) },
    { label: L ? "\\u235d\\u120d\\u1320\\u1293 \\u1275\\u12ad\\u12a8\\u129b \\u1290\\u12cd" : "Training Valid", ok: Boolean(inspection.isTrainingValid) },
  ];

  return (
    <div style={{ fontFamily: "'Noto Sans Ethiopic', 'Noto Sans', Arial, sans-serif", width: 794, background: "#fff", padding: 0 }}>
      {/* Cover header */}
      <div style={{ background: "#001F3F", padding: "28px 32px 20px", borderBottom: "3px solid #FFD700" }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#FFD700", marginBottom: 6 }}>
          {L ? "\\u12e8\\u121d\\u122d\\u1218\\u122b \\u12e8\\u1218\\u1328\\u1228\\u123b \\u122a\\u1356\\u122d\\u1275" : "Inspection Final Report"}
        </div>
        <div style={{ fontSize: 11, color: "#c8d8ea" }}>
          {org?.nameEnglish || org?.nameAmharic || `Inspection #${inspection.id}`}
          {"  |  "}{L ? "\\u121d\\u122d\\u1218\\u122b" : "Inspection"} #{inspection.id}
          {"  |  "}{fmt(inspection.scheduledDate)}
        </div>
      </div>

      <div style={{ padding: "20px 32px 32px" }}>
        {/* Applicant */}
        <SectionHeader title={L ? "\\u12e8\\u12a0\\u1218\\u120d\\u12ab\\u127d \\u1218\\u1228\\u1303" : "Applicant Information"} />
        <TwoCol
          left={<><Row label={L ? "\\u1219\\u1209 \\u235d\\u121d" : "Full Name"} value={s(appUser?.fullName)} /><Row label={L ? "\\u12a2\\u121c\\u120d" : "Email"} value={s(appUser?.email)} /></>}
          right={<><Row label={L ? "\\u235d\\u120d\\u12ad" : "Phone"} value={s(appUser?.phone)} /><Row label={L ? "\\u12e8\\u121b\\u1218\\u120d\\u12a8\\u127b \\u1240\\u1295" : "Application Date"} value={fmt(inspection.application?.applicationDate)} /></>}
        />

        {/* Address */}
        <SectionHeader title={L ? "\\u12e8\\u12a0\\u12f5\\u122b\\u123b \\u12dd\\u122d\\u12dd\\u122�\\u127d" : "Address Details"} />
        <TwoCol
          left={<><Row label={L ? "\\u12ad\\u120d\\u120d" : "Region"} value={region} /><Row label={L ? "\\u12c8\\u1228\\u12f3" : "Woreda"} value={woreda} /><Row label={L ? "\\u120d\\u12e9 \\u1266\\u1273" : "Special Location"} value={s(addr?.specialLocation)} /></>}
          right={<><Row label={L ? "\\u12d6\\u1295" : "Zone"} value={zone} /><Row label={L ? "\\u1240\\u1260\\u1208" : "Kebele"} value={kebele} /><Row label={L ? "\\u12e8\\u1264\\u1275 \\u1241\\u1325\\u122d" : "House Number"} value={s(addr?.houseNumber)} /></>}
        />

        {/* Infrastructure */}
        <SectionHeader title={L ? "\\u1218\\u1230\\u1228\\u1270 \\u120d\\u121b\\u1275" : "Infrastructure"} />
        <TwoCol
          left={<><Row label={L ? "\\u1323\\u1245\\u120b\\u120b \\u1262\\u122e \\u1265\\u12db\\u1275" : "Total Office Count"} value={s(org?.numberOfOffices)} /><Row label={L ? "\\u1323\\u1245\\u120b\\u120b \\u12ae\\u121d\\u1352\\u12cd\\u1270\\u122d \\u1265\\u12db\\u1275" : "Total Computer Count"} value={s(org?.numberOfComputers)} /></>}
          right={<><Row label={L ? "\\u1323\\u1245\\u120b\\u120b \\u1270\\u123d\\u12ab\\u122d\\u12ab\\u122a \\u1265\\u12db\\u1275" : "Total Vehicle Count"} value={s(org?.numberOfVehicles)} /><Row label={L ? "\\u1218\\u130b\\u12d8\\u1295" : "Storehouse"} value={org?.hasStoreHouse ? (L ? "\\u12a0\\u12c8" : "Yes") : (L ? "\\u12e8\\u1208\\u121d" : "No")} /></>}
        />

        {/* Checklist */}
        <SectionHeader title={L ? "\\u12e8\\u127c\\u12ad\\u120a\\u235d\\u1275 \\u12cd\\u1324\\u1276\\u127d" : "Checklist Results"} />
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          {checks.map((c, i) => (
            <div key={i} style={{ flex: 1, background: c.ok ? "#ecfdf5" : "#fff7ed", border: `1px solid ${c.ok ? "#6ee7b7" : "#fcd34d"}`, borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: c.ok ? "#065f46" : "#92400e", marginBottom: 4 }}>{c.label}</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: c.ok ? "#059669" : "#d97706" }}>{c.ok ? (L ? "\\u2713 \\u1270\\u1228\\u130b\\u130d\\u1327\\u120d" : "\\u2713 Confirmed") : (L ? "\\u2717 \\u12eb\\u120d\\u1270\\u1228\\u130b\\u1308\\u1320" : "\\u2717 Not Confirmed")}</div>
            </div>
          ))}
        </div>

        {/* Findings Summary */}
        <LongText title={L ? "\\u12e8\\u130d\\u129d\\u1276\\u127d \\u121b\\u1323\\u1240\\u120b\\u12eb" : "Findings Summary"} text={s(inspection.findingsSummary)} />

        {/* Expert Opinion */}
        <LongText title={L ? "\\u12e8\\u1263\\u1208\\u1219\\u12eb \\u12a0\\u235d\\u1270\\u12eb\\u12e8\\u1275" : "Expert Opinion"} text={s(inspection.expertOpinion)} />

        {/* Committee Table */}
        <SectionHeader title={L ? "\\u12e8\\u121d\\u122d\\u1218\\u122b \\u12ae\\u121c\\u1274" : "Inspection Committee"} />
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
          <thead>
            <tr style={{ background: "#003366" }}>
              {[L ? "\\u235d\\u121d" : "Name", L ? "\\u121a\\u1293" : "Role", L ? "\\u134d\\u122d\\u121b" : "Signature", L ? "\\u12e8\\u134e\\u1228\\u1219\\u1260\\u1275 \\u1240\\u1295" : "Signed At"].map((h) => (
                <th key={h} style={{ color: "#FFD700", fontWeight: 700, padding: "8px 10px", textAlign: "left", fontSize: 11 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {committeeRows.map((m, i) => (
              <tr key={m.id} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff", borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "10px", fontWeight: 700, color: "#003366", fontSize: 11 }}>{m.name}</td>
                <td style={{ padding: "10px", color: "#374151", fontSize: 11 }}>{m.role}</td>
                <td style={{ padding: "6px 10px" }}>
                  {m.sigUrl
                    ? <img src={resolveUrl(m.sigUrl)} alt="sig" style={{ maxHeight: 44, maxWidth: 110, objectFit: "contain" }} crossOrigin="anonymous" />
                    : <span style={{ color: "#9ca3af", fontStyle: "italic", fontSize: 10 }}>{L ? "\\u134d\\u122d\\u121b \\u12e8\\u1208\\u121d" : "No signature"}</span>}
                </td>
                <td style={{ padding: "10px", color: "#374151", fontSize: 10 }}>{m.signedAt ? fmt(m.signedAt) : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div style={{ marginTop: 24, paddingTop: 12, borderTop: "1px solid #e2e8f0", fontSize: 9, color: "#9ca3af" }}>
          {L ? "\\u122a\\u1356\\u122d\\u1271 \\u12e8\\u1270\\u12d8\\u130b\\u1300\\u12cd \\u1260" : "Generated by"}{" "}
          {s(currentUser?.fullName || currentUser?.username)}{"  |  "}{fmt(new Date().toISOString())}
          <br />
          {L ? "\\u12e8\\u12a2\\u1275\\u12ee\\u1335\\u12eb \\u134c\\u12f0\\u122b\\u120d \\u1356\\u120a\\u235d \\u12ae\\u121a\\u123d\\u1295 — \\u12e8\\u130d\\u120d \\u12f0\\u1215\\u1295\\u1290\\u1275 \\u12a4\\u1300\\u1295\\u235d \\u134d\\u1243\\u12f5 \\u1356\\u122d\\u1273\\u120d" : "Ethiopian Federal Police Commission — Private Security Organization Licensing Portal"}
        </div>
      </div>
    </div>
  );
};

export default InspectionReviewForm;"""

# Replace the old export default
if "export default InspectionReviewForm;" in content:
    content = content.replace("export default InspectionReviewForm;", template)
    print("Template: ADDED")
else:
    print("Template: export default not found")

open(filepath, 'w', encoding='utf-8').write(content)
print("Done. Length:", len(content))
