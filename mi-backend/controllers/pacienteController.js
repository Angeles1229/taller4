import { PacienteModel, LaboratoristaModel } from "../models/ADNModels.js";

// 🔹 Obtener pacientes del laboratorista autenticado
export const getPacientes = async (req, res) => {
  try {
    console.log("📥 Headers recibidos en getPacientes:", req.headers);

    const laboratoristaID = parseInt(req.headers["laboratorista_id"]);

    if (!laboratoristaID || isNaN(laboratoristaID)) {
      console.error("❌ ID del laboratorista no válido o faltante:", laboratoristaID);
      return res.status(400).json({ message: "ID del laboratorista no válido o faltante." });
    }

    const pacientes = await PacienteModel.findAll({
      where: { laboratorista_id: laboratoristaID },
    });

    console.log("✅ Pacientes obtenidos:", pacientes);
    res.json(pacientes);
  } catch (error) {
    console.error("❌ Error en getPacientes:", error);
    res.status(500).json({ message: "Error al obtener los pacientes", error });
  }
};


// 🔹 Obtener un paciente por ID (validando que pertenezca al laboratorista)
// 🔹 Obtener un paciente por ID con validación extra
export const getPaciente = async (req, res) => {
  const { id } = req.params;
  const laboratoristaID = parseInt(req.headers["laboratorista_id"]); 

  // 🔍 Validar si el ID del paciente y el laboratorista son correctos
  if (!id || isNaN(id)) {
      return res.status(400).json({ message: "❌ ID del paciente no válido." });
  }

  if (!laboratoristaID || isNaN(laboratoristaID)) {
      return res.status(400).json({ message: "❌ ID del laboratorista no válido." });
  }

  try {
      const paciente = await PacienteModel.findOne({
          where: { id, laboratorista_id: laboratoristaID },
      });

      if (!paciente) {
          return res.status(404).json({ message: "❌ Paciente no encontrado o no autorizado." });
      }

      res.json(paciente);
  } catch (error) {
      console.error("❌ Error en getPaciente:", error);
      res.status(500).json({ message: "Error interno al obtener el paciente.", error });
  }
};

// 🔹 Crear un nuevo paciente asegurando que pertenece al laboratorista autenticado
export const createPaciente = async (req, res) => {
  try {
    console.log("📩 Datos recibidos en createPaciente:", req.body);

    const { nombre, apellido, edad, genero, laboratorista_id } = req.body;
    const laboratoristaID = parseInt(laboratorista_id); // ⬅ Ahora lo toma del body

    // 1️⃣ *Validar datos obligatorios*
    if (!nombre || !apellido || !edad || !genero || !laboratoristaID) {
      console.error("❌ Faltan datos obligatorios:", { nombre, apellido, edad, genero, laboratoristaID });
      return res.status(400).json({ message: "Faltan datos obligatorios." });
    }

    // 2️⃣ *Verificar si el laboratorista existe*
    const laboratorista = await LaboratoristaModel.findByPk(laboratoristaID);
    if (!laboratorista) {
      console.error("❌ Laboratorista no encontrado:", laboratoristaID);
      return res.status(404).json({ message: "Laboratorista no encontrado." });
    }

    // 3️⃣ *Crear el paciente*
    const paciente = await PacienteModel.create({
      nombre,
      apellido,
      edad,
      genero,
      laboratorista_id: laboratoristaID,
    });

    console.log("✅ Paciente creado con éxito:", paciente);
    res.status(201).json(paciente);
  } catch (error) {
    console.error("❌ Error al crear el paciente:", error);
    res.status(500).json({ message: "Error interno del servidor", error });
  }
};


// 🔹 Actualizar un paciente (solo si pertenece al laboratorista autenticado)
export const updatePaciente = async (req, res) => {
  try {
      const { id } = req.params;
      const { nombre, apellido, edad, genero } = req.body;

      console.log("Datos recibidos para actualizar:", req.body);

      // Verificar si el paciente existe antes de actualizar
      const paciente = await PacienteModel.findByPk(id);
      if (!paciente) {
          return res.status(404).json({ message: "Paciente no encontrado" });
      }

      // Validar que los datos requeridos están presentes
      if (!nombre || !apellido || !edad || !genero) {
          return res.status(400).json({ message: "Todos los campos son obligatorios" });
      }

      // Actualizar el paciente
      await paciente.update({ nombre, apellido, edad, genero });

      res.json({ message: "Paciente actualizado correctamente", paciente });
  } catch (error) {
      console.error("Error en updatePaciente:", error);
      res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};


// 🔹 Eliminar un paciente (solo si pertenece al laboratorista autenticado)
export const deletePaciente = async (req, res) => {
  const { id } = req.params;
  const laboratoristaID = parseInt(req.headers["laboratorista_id"]); 

  console.log("📥 Headers recibidos en deletePaciente:", req.headers);

  if (!laboratoristaID || isNaN(laboratoristaID)) {
    console.error("❌ ID del laboratorista no válido:", laboratoristaID);
    return res.status(400).json({ message: "❌ ID del laboratorista no válido." });
  }

  try {
    const paciente = await PacienteModel.findOne({
      where: { id, laboratorista_id: laboratoristaID },
    });

    if (!paciente) {
      return res.status(404).json({ message: "❌ Paciente no encontrado o no autorizado." });
    }

    await paciente.destroy();
    console.log(`✅ Paciente con ID: ${id} eliminado correctamente.`);

    res.json({ message: "Paciente eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar el paciente:", error);
    res.status(500).json({ message: "Error interno del servidor", error });
  }
};

