require("dotenv").config();
const sql = require("mssql");

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_NAME,
  options: {
    encrypt: process.env.DB_ENCRYPT === "true" || true,
    trustServerCertificate: true,
  },
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
};

const normalize = (v) => {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  if (s.length === 0) return null;
  return typeof s.normalize === "function" ? s.normalize("NFC") : s;
};

async function main() {
  console.log("Connecting to DB...");
  const pool = await sql.connect(config);
  try {
    const res = await pool
      .request()
      .query(`SELECT region_id, region_name_en, region_name_am FROM regions`);
    const regions = res.recordset;
    console.log(`Found ${regions.length} regions`);

    for (const r of regions) {
      const id = r.region_id;
      const en = r.region_name_en;
      const am = r.region_name_am;
      const nEn = normalize(en);
      const nAm = normalize(am);

      const updates = {};
      if (nEn !== en) updates.nameEnglish = nEn;
      if (nAm !== am) updates.nameAmharic = nAm;
      if (Object.keys(updates).length === 0) continue;

      // Check conflicts
      if (nEn) {
        const conflict = await pool
          .request()
          .input("en", sql.NVarChar(4000), nEn)
          .input("id", sql.Int, id)
          .query(
            "SELECT TOP 1 region_id FROM regions WHERE region_name_en = @en AND region_id <> @id",
          );
        if (conflict.recordset.length > 0) {
          console.error(
            `SKIP id=${id}: normalized English "${nEn}" conflicts with id=${conflict.recordset[0].region_id}`,
          );
          continue;
        }
      }
      if (nAm) {
        const conflict = await pool
          .request()
          .input("am", sql.NVarChar(4000), nAm)
          .input("id", sql.Int, id)
          .query(
            "SELECT TOP 1 region_id FROM regions WHERE region_name_am = @am AND region_id <> @id",
          );
        if (conflict.recordset.length > 0) {
          console.error(
            `SKIP id=${id}: normalized Amharic "${nAm}" conflicts with id=${conflict.recordset[0].region_id}`,
          );
          continue;
        }
      }

      // Apply update
      const req = pool.request().input("id", sql.Int, id);
      const sets = [];
      if (nEn !== en) {
        req.input("en", sql.NVarChar(4000), nEn);
        sets.push("region_name_en = @en");
      }
      if (nAm !== am) {
        req.input("am", sql.NVarChar(4000), nAm);
        sets.push("region_name_am = @am");
      }
      const sqlUpd = `UPDATE regions SET ${sets.join(", ")} WHERE region_id = @id`;
      console.log(`Updating id=${id} -> ${JSON.stringify(updates)}`);
      await req.query(sqlUpd);
    }

    console.log("Normalization complete");
  } finally {
    await pool.close();
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exitCode = 1;
});
