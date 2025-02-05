import { Router } from "express";
import {
    getPaciente,  
    getPacientes,
    createPaciente,
    updatePaciente,
    deletePaciente
} from "../controllers/pacienteController.js";

const router = Router();


router.get("/", getPacientes); 
router.get("/:id", getPaciente); 
router.post("/", createPaciente); 
router.put("/:id", updatePaciente); 
router.delete("/:id", deletePaciente); 

export default router;
