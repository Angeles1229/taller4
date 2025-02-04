import { Router } from "express";
import {
    getPaciente,  // 🔹 Importamos la función getPaciente
    getPacientes,
    createPaciente,
    updatePaciente,
    deletePaciente
} from "../controllers/pacienteController.js";

const router = Router();

// 🔹 Rutas de Pacientes
router.get("/", getPacientes); // Obtener todos los pacientes
router.get("/:id", getPaciente); // 🔹 Obtener un paciente por su ID (corregido ✅)
router.post("/", createPaciente); // Crear un paciente
router.put("/:id", updatePaciente); // Actualizar paciente
router.delete("/:id", deletePaciente); // Eliminar paciente

export default router;
