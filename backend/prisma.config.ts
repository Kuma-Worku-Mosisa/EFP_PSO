// filepath: prisma/prisma.config.ts
import { defineConfig } from "prisma/config";

export default defineConfig({
  datasource: {
    // Hardcode it here for the PULL process
    url: "sqlserver://localhost:1433;database=EFP_PSO;user=erpuser;password=1234;trustServerCertificate=true",
  },
});
