import express from "express";
import { analizarADN, upload } from "../controllers/analizarController.js";
import { AnalisisADNModel } from "../models/ADNModels.js";

const router = express.Router();


router.post("/subir-adn", upload.single("archivo"), analizarADN);


router.get("/analisis", async (req, res) => {
  try {
    console.log("Obteniendo análisis de ADN...");

    const analisis = await AnalisisADNModel.findAll();

    if (analisis.length === 0) {
      console.log("No se encontraron análisis.");
    } else {
      console.log("Datos obtenidos:", analisis);
    }

    res.json(analisis);
  } catch (error) {
    console.error("Error al obtener los análisis de ADN:", error);
    res.status(500).json({ error: "Error al obtener los datos" });
  }
});

export default router;
