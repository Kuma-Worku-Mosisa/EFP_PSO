import dotenv from "dotenv";
dotenv.config();
import express from "express";
import sql from "mssql";
import cors from "cors";
import userRoutes from "./modules/user/user.routes";
import locationRoutes from "./modules/location/location.routes";



const app = express();
app.use(cors());
app.use(express.json());

// Config for SQL Server Authentication using environment variables
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



// app.get("/api/region", async (req, res) => {
//   try {
//     let pool = await sql.connect(dbConfig);
//     let result = await pool.request().query("SELECT * FROM regions");
//     res.json(result.recordset);
//   } catch (err) {
//     const error = err as Error;
//     console.error("Database Error:", error.message);
//     res.status(500).json({ error: error.message });
//   }
// });




// This will make your URL: http://localhost:5000/api/location/regions
app.use("/api/location", locationRoutes);

app.use("/api/users", userRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(` Backend running on http://localhost:${port}`);
});

