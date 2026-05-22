const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const normalize = (v) => {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  if (s.length === 0) return null;
  return typeof s.normalize === "function" ? s.normalize("NFC") : s;
};

async function main() {
  console.log("Fetching regions...");
  const regions = await prisma.region.findMany();
  console.log(`Found ${regions.length} regions`);

  // Build lookup for amharic and english normalized values
  const amMap = new Map();
  const enMap = new Map();

  for (const r of regions) {
    const nAm = normalize(r.nameAmharic);
    const nEn = normalize(r.nameEnglish);
    if (nAm) {
      if (amMap.has(nAm)) {
        console.warn(
          `EXISTING CONFLICT (initial scan): normalized Amharic "${nAm}" appears for ids ${amMap.get(nAm)} and ${r.id}`,
        );
      } else amMap.set(nAm, r.id);
    }
    if (nEn) {
      if (enMap.has(nEn)) {
        console.warn(
          `EXISTING CONFLICT (initial scan): normalized English "${nEn}" appears for ids ${enMap.get(nEn)} and ${r.id}`,
        );
      } else enMap.set(nEn, r.id);
    }
  }

  // Apply normalization updates where safe
  for (const r of regions) {
    const nAm = normalize(r.nameAmharic);
    const nEn = normalize(r.nameEnglish);
    const updates = {};
    if (nAm !== r.nameAmharic) updates.nameAmharic = nAm;
    if (nEn !== r.nameEnglish) updates.nameEnglish = nEn;

    if (Object.keys(updates).length === 0) continue;

    // Check for conflicts BEFORE updating
    if (updates.nameAmharic) {
      const existing = await prisma.region.findFirst({
        where: { nameAmharic: updates.nameAmharic },
      });
      if (existing && existing.id !== r.id) {
        console.error(
          `SKIP update id=${r.id}: normalized nameAmharic "${updates.nameAmharic}" conflicts with id=${existing.id}`,
        );
        continue;
      }
    }
    if (updates.nameEnglish) {
      const existing = await prisma.region.findFirst({
        where: { nameEnglish: updates.nameEnglish },
      });
      if (existing && existing.id !== r.id) {
        console.error(
          `SKIP update id=${r.id}: normalized nameEnglish "${updates.nameEnglish}" conflicts with id=${existing.id}`,
        );
        continue;
      }
    }

    console.log(`Updating region id=${r.id} ->`, updates);
    await prisma.region.update({ where: { id: r.id }, data: updates });
  }

  console.log("Normalization complete.");
}

main()
  .catch((e) => {
    console.error("Fatal error", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
