const express = require("express");
const cors = require("cors");
const sql = require("mssql");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  user: process.env.DB_USER || "sa",
  password: process.env.DB_PASSWORD || "YourStrong!Passw0rd",
  server: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "MACS_DEMO",
  port: parseInt(process.env.DB_PORT || "1433"),
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "macs-backend",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/solicitudes", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT id, paciente, tipo_nutricion, centro_medico, prioridad, observacion, fecha_creacion
      FROM solicitudes
      ORDER BY fecha_creacion DESC
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error("Error consultando solicitudes:", error);
    res.status(500).json({ error: "Error consultando solicitudes" });
  }
});

app.post("/api/solicitudes", async (req, res) => {
  const { paciente, tipo_nutricion, centro_medico, prioridad, observacion } = req.body;

  if (!paciente || !tipo_nutricion || !centro_medico || !prioridad) {
    return res.status(400).json({
      error: "Los campos paciente, tipo_nutricion, centro_medico y prioridad son obligatorios"
    });
  }

  try {
    const pool = await sql.connect(dbConfig);

    await pool.request()
      .input("paciente", sql.NVarChar, paciente)
      .input("tipo_nutricion", sql.NVarChar, tipo_nutricion)
      .input("centro_medico", sql.NVarChar, centro_medico)
      .input("prioridad", sql.NVarChar, prioridad)
      .input("observacion", sql.NVarChar, observacion || "")
      .query(`
        INSERT INTO solicitudes 
        (paciente, tipo_nutricion, centro_medico, prioridad, observacion)
        VALUES 
        (@paciente, @tipo_nutricion, @centro_medico, @prioridad, @observacion)
      `);

    res.status(201).json({
      message: "Solicitud registrada correctamente"
    });
  } catch (error) {
    console.error("Error registrando solicitud:", error);
    res.status(500).json({ error: "Error registrando solicitud" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`MACS backend ejecutándose en puerto ${PORT}`);
});
