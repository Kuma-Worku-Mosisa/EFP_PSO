import dotenv from "dotenv";
dotenv.config();
import express from "express";
import sql from "mssql";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Config for SQL Server Authentication using environment variables
const dbConfig = {
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_NAME || "EFP_PSO",
  user: process.env.DB_USER ,
  password: process.env.DB_PASSWORD || "",
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

app.get("/api/employees", async (req, res) => {
  try {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request().query("SELECT * FROM Employees");
    res.json(result.recordset);
  } catch (err) {
    const error = err as Error;
    console.error("Database Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(` Backend running on http://localhost:${port}`);
});
