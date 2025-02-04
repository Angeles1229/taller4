import express from "express";
import bcrypt from "bcrypt"; 
import jwt from "jsonwebtoken"; 
import { LaboratoristaModel } from "../models/ADNModels.js"; 
import { SECRET_KEY } from "../config.js"; 

const router = express.Router();

// 🔹 Registro de laboratoristas
router.post("/register", async (req, res) => {
  console.log("🔍 Datos recibidos en /register:", req.body);

  const { nombre, apellido, email, password, telefono } = req.body;

  if (!nombre || !apellido || !email || !password) {
    return res.status(400).json({ message: "Faltan campos obligatorios", data: req.body });
  }

  try {
    const existingLaboratorista = await LaboratoristaModel.findOne({ where: { email } });
    if (existingLaboratorista) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newLaboratorista = await LaboratoristaModel.create({
      nombre,
      apellido,
      email,
      password: hashedPassword,
      telefono,
    });

    // ✅ Generar token después del registro
    const token = jwt.sign(
      { id: newLaboratorista.id, email: newLaboratorista.email },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "Laboratorista registrado con éxito",
      token, // ✅ Enviar token
      laboratorista: {
        id: newLaboratorista.id,
        nombre: newLaboratorista.nombre,
        apellido: newLaboratorista.apellido,
        email: newLaboratorista.email,
      },
    });
  } catch (error) {
    console.error("Error al registrar laboratorista:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// 🔹 Inicio de sesión de laboratoristas
router.post("/login", async (req, res) => {
  console.log("🔍 Datos recibidos en /login:", req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  try {
    // Buscar el laboratorista por email
    const laboratorista = await LaboratoristaModel.findOne({ where: { email } });

    if (!laboratorista) {
      return res.status(404).json({ message: "El correo no está registrado" });
    }

    // Comparar contraseñas correctamente
    const isMatch = await bcrypt.compare(password, laboratorista.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // ✅ Generar token JWT con `laboratorista_id`
    const token = jwt.sign(
      { id: laboratorista.id, email: laboratorista.email },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(200).json({ 
      message: "Inicio de sesión exitoso", 
      token, // ✅ Enviar token
      id: laboratorista.id, // ✅ Enviar laboratorista_id
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.get("/perfil", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    console.log("🔍 Token recibido en /perfil:", token);

    if (!token) return res.status(401).json({ message: "No autorizado" });

    const decoded = jwt.verify(token, SECRET_KEY);
    console.log("✅ Token decodificado:", decoded);

    const laboratorista = await LaboratoristaModel.findByPk(decoded.id, {
      attributes: ["nombre", "apellido"]
    });

    if (!laboratorista) {
      console.log("❌ No se encontró el laboratorista con ID:", decoded.id);
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    console.log("✅ Perfil encontrado:", laboratorista);
    res.json({ nombre: laboratorista.nombre, apellido: laboratorista.apellido });
  } catch (error) {
    console.error("❌ Error en /perfil:", error);
    res.status(500).json({ message: "Error al obtener el perfil" });
  }
});




export default router;
