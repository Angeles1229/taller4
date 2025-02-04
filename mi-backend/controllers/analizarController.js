import { AnalisisADNModel, EnfermedadModel } from "../models/ADNModels.js";
import fs from "fs";
import csv from "csv-parser";
import multer from "multer";

// Middleware para manejar la subida de archivos
const upload = multer({ dest: "uploads/" });

const analizarADN = async (req, res) => {
  try {
    const { paciente_id } = req.body;
    const archivo = req.file?.path;

    if (!archivo) {
      return res.status(400).json({ error: "No se proporcionó un archivo válido." });
    }

    // Crear el análisis en la base de datos
    const nuevoAnalisis = await AnalisisADNModel.create({
      paciente_id,
      nombre_archivo: archivo,
    });

    // Variables para almacenar datos
    const mutacionesDetectadas = new Set();
    const genesDetectados = new Set();
    const nucleotidosDetectados = new Set();
    const secuenciaADN = [];

    fs.createReadStream(archivo)
      .pipe(csv())
      .on("data", (row) => {
        try {
          if (!row.posicion || !row.gen || !row.nucleotido || !row.mutacion) {
            console.warn("⚠️ Fila inválida en el CSV, se omite:", row);
            return;
          }

          const gen = row.gen.trim();
          const mutacion = row.mutacion.trim().toLowerCase(); // Normaliza a minúsculas
          const nucleotido = row.nucleotido.trim();
          const posicion = Number(row.posicion);

          if (!isNaN(posicion)) {
            const tieneMutacion = mutacion === "sí"; // Solo marcará true si es exactamente "Sí"
            
            secuenciaADN.push({
              gen,
              mutacion: tieneMutacion,
              nucleotido,
              posicion,
              tipo_mutacion: row.tipo_mutacion || "Desconocido",
              efecto: row.efecto || "Desconocido",
            });

            if (tieneMutacion) {
              mutacionesDetectadas.add(mutacion);
              genesDetectados.add(gen);
            }
            
            nucleotidosDetectados.add(nucleotido);
          }
        } catch (err) {
          console.error("⚠️ Error procesando fila del CSV:", err);
        }
      })
      .on("end", async () => {
        try {
          console.log("✅ Secuencia de ADN procesada correctamente.");

          // Obtener todas las enfermedades de la BD
          const enfermedades = await EnfermedadModel.findAll();
          let enfermedadesDetectadas = [];

          for (let enfermedad of enfermedades) {
            const genesEnfermedad = enfermedad.mutaciones_asociadas
              ? enfermedad.mutaciones_asociadas.split(/,\s*/).map(m => m.trim().toUpperCase())
              : [];

            const genesArchivo = [...genesDetectados].map(gen => gen.trim().toUpperCase());

            const coincidencias = genesArchivo.filter(gen => genesEnfermedad.includes(gen));

            if (coincidencias.length > 0) {
              enfermedadesDetectadas.push(enfermedad.nombre);
            }
          }

          const resultadoEnfermedades = enfermedadesDetectadas.length > 0
            ? enfermedadesDetectadas.join(", ")
            : "Sin coincidencias";

          // Guardar el resultado en la BD
          await AnalisisADNModel.update(
            { enfermedad_detectada: resultadoEnfermedades },
            { where: { id: nuevoAnalisis.id } }
          );

          console.log(`✅ Enfermedades detectadas: ${resultadoEnfermedades}`);

          // Eliminar archivo CSV después del procesamiento
          fs.unlink(archivo, (err) => {
            if (err) {
              console.error("⚠️ Error al eliminar archivo:", err);
            } else {
              console.log("🗑️ Archivo eliminado correctamente.");
            }
          });

          // Enviar la respuesta
          res.json({
            mensaje: "Análisis completado",
            enfermedad_detectada: resultadoEnfermedades,
            mutaciones_detectadas: [...mutacionesDetectadas],
            nucleotidos_detectados: [...nucleotidosDetectados],
            secuenciaADN,
          });

        } catch (error) {
          console.error("❌ Error al procesar enfermedades:", error);
          res.status(500).json({ error: "Error en el análisis de ADN" });
        }
      })
      .on("error", (err) => {
        console.error("❌ Error al leer el archivo CSV:", err);
        res.status(500).json({ error: "Error al procesar el archivo CSV" });
      });

  } catch (error) {
    console.error("❌ Error general en el análisis de ADN:", error);
    res.status(500).json({ error: "Error en el análisis de ADN" });
  }
};

export { analizarADN, upload };