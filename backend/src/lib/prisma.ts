// filepath: src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaMssql } from "@prisma/adapter-mssql"; // Fixed casing
import { Connection } from "tedious"; // Fixed import

const connectionString =
  process.env.DATABASE_URL ||
     "sqlserver://localhost:1433;database=EFP_PSO;user=erpuser;password=123456;trustServerCertificate=true";
const prismaClientSingleton = () => {
  // Use the correctly cased class name
  const adapter = new PrismaMssql(connectionString);
  return new PrismaClient({ adapter });
};

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
