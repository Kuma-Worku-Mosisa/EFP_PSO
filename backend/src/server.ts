// filepath: src/server.ts
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import sql from "mssql";
import cors from "cors";
import path from "path";

// 1. Import Routes
import userRoutes from "./modules/user/user.routes";
import locationRoutes from "./modules/location/location.routes";
import applicationRoutes from "./modules/application/application.routes"; // Linked to your new module
import formalRequestRoutes from "./modules/formalRequest/formalRequest.routes";

const app = express();

// 2. Middleware
app.use(cors());
// Increased limit for large multi-step form payloads and document metadata
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded files as static assets
// Files stored in: uploads/{organizationName}/{role}/{filename}
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// 3. Database Configuration for SQL Server
const dbConfig = {
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_NAME || "EFP_PSO",
  user: process.env.DB_USER || "erpuser",
  password: process.env.DB_PASSWORD || "1234",
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
app.use("/api/applications", applicationRoutes); // Now active
app.use("/api/formal-requests", formalRequestRoutes);

// 6. Health Check / Root Route
app.get("/", (req, res) => {
  res.status(200).json({ message: "EFP PSO ERP Backend is running" });
});

// 7. Error Handling Middleware (Catches unhandled errors across the app)
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

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`-----------------------------------------------`);
  console.log(` Backend running on http://localhost:${port}`);
  console.log(
    ` Endpoints: /api/users, /api/location, /api/applications, /api/formal-requests`,
  );
  console.log(`-----------------------------------------------`);
});
