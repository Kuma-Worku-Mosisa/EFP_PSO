// filepath: src/server.ts
import dotenv from "dotenv";
import express from "express";
import sql from "mssql";
import cors from "cors";
import path from "path";

// Force load the configuration matrix
dotenv.config();

// 1. Import Routes
import userRoutes from "./modules/user/user.routes";
import locationRoutes from "./modules/location/location.routes";
import applicationRoutes from "./modules/application/application.routes";
import formalRequestRoutes from "./modules/formalRequest/formalRequest.routes";
import positionRoutes from "./modules/position/position.routes";
import certificationRoutes from "./modules/certification/certification.routes";
import settingsRoutes from "./modules/settings/system-settings.routes";
import adminRoutes from "./modules/admin/audit.routes";
import agreementRouter from "./modules/agreement/agreement.routes";
import faqRoutes from "./modules/faqs/faq.routes";
import inspectionRoutes from "./modules/inspection/inspection.routes";
import renewalRoutes from "./modules/renewal/renewal.routes";
import paymentRouter from "./modules/payment/payment.routes";
import efpPositionRoutes from "./modules/efpPosition/efpPosition.routes";
// 🔔 NOTIFICATION MODULE IMPORTS: Added the routes and the background automation loop
import notificationRoutes from "./modules/notification/notification.routes";
import { runNotificationCronWorker } from "./modules/notification/notification.worker";
import organizationRoutes from "./modules/organization/organization.routes";
import employeeRoutes from "./modules/employee/employee.routes";
import transferRoutes from "./modules/transfers/transfers.routes";

const app = express();

// 2. Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded files as static assets
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// 3. Database Configuration for SQL Server
const requiredEnvVars = ["DB_SERVER", "DB_NAME", "DB_USER", "DB_PASSWORD"];
const missingVars = requiredEnvVars.filter((v) => !process.env[v]);

if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVars.join(", ")}`,
  );
}

const dbConfig = {
  server: process.env.DB_SERVER!,
  database: process.env.DB_NAME!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

// 4. Raw SQL Endpoints (Keeping your existing employee test route)
app.get("/api/employees", async (req, res) => {
  try {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request().query("SELECT * FROM users");
    res.json(result.recordset);
  } catch (err) {
    const error = err as Error;
    console.error("Database Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 5. Modular API Routes
app.use("/api/location", locationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/formal-requests", formalRequestRoutes);
app.use("/api/positions", positionRoutes);
app.use("/api/efp-positions", efpPositionRoutes);
app.use("/api/certifications", certificationRoutes);
app.use("/api/system-settings", settingsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/agreements", agreementRouter);
app.use("/api/inspections", inspectionRoutes);
app.use("/api/renewals", renewalRoutes);
app.use("/api", faqRoutes);
app.use("/api/payments", paymentRouter);
// 🔔 MOUNT NOTIFICATION API ENDPOINTS: Exposed for dashboard feed requests
app.use("/api/notifications", notificationRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/transfers", transferRoutes);

// 6. Health Check / Root Route
app.get("/", (req, res) => {
  res.status(200).json({ message: "EFP PSO ERP Backend is running" });
});

// Legacy QR path: redirect simple /verify/:serial to the API mounted verification route
app.get("/verify/:serial", (req, res) => {
  const raw = Array.isArray(req.params.serial)
    ? req.params.serial[0]
    : req.params.serial;
  const serial = raw.includes("/")
    ? raw.replace(/\/$/, "").split("/").pop()
    : raw;
  return res.redirect(
    302,
    `/api/certifications/verify/${encodeURIComponent(serial)}`,
  );
});

// 7. Error Handling Middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err.stack);
    res.status(500).json({
      error: "Internal Server Error",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Something went wrong",
    });
  },
);

// 🚀 INITIALIZE BACKGROUND AUTOMATION: Start the daily midnight lookahead engine
runNotificationCronWorker();

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`-----------------------------------------------`);
  console.log(` Backend running on http://localhost:${port}`);
  console.log(` Status: Daily Certificate Expiry Cron Worker Online`);
  console.log(
    ` Endpoints Ready: /api/users, /api/certifications, /api/notifications, /api/organizations`,
  );
  console.log(`-----------------------------------------------`);
});
