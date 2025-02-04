import db from "../database/db.js";
import { DataTypes } from "sequelize";

// Modelo Laboratorista
const LaboratoristaModel = db.define('Laboratoristas', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    apellido: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(100), unique: true, allowNull: false },
    password: { type: DataTypes.STRING(255), allowNull: false },
    telefono: { type: DataTypes.STRING(15), allowNull: true }
}, {
    tableName: 'Laboratoristas',
    timestamps: false
});

// Modelo Pacientes 
const PacienteModel = db.define('pacientes', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true }, 
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    apellido: { type: DataTypes.STRING(100), allowNull: false },
    edad: { type: DataTypes.INTEGER, allowNull: false },
    genero: { type: DataTypes.ENUM('M', 'F', 'Otro'), allowNull: false },
    laboratorista_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: LaboratoristaModel,
            key: 'id',
        }
    }
});

// Modelo Análisis de ADN
const AnalisisADNModel = db.define('analisis_adn', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true }, // ✅ Agregado
    paciente_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: PacienteModel,
            key: 'id',
        }
    },
    nombre_archivo: { type: DataTypes.STRING(255), allowNull: false },
    fecha_subida: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    enfermedad_detectada: { type: DataTypes.STRING(100), allowNull: true }, 
    relevancia_clinica: { type: DataTypes.TEXT, allowNull: true }
});

// Modelo Enfermedades
const EnfermedadModel = db.define('enfermedades', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true }, // ✅ Agregado
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    descripcion: { type: DataTypes.TEXT, allowNull: false },
    mutaciones_asociadas: { type: DataTypes.TEXT, allowNull: false }
});

// Definir relaciones
LaboratoristaModel.hasMany(PacienteModel, { foreignKey: "laboratorista_id" });
PacienteModel.belongsTo(LaboratoristaModel, { foreignKey: "laboratorista_id" });

PacienteModel.hasMany(AnalisisADNModel, { foreignKey: "paciente_id" });
AnalisisADNModel.belongsTo(PacienteModel, { foreignKey: "paciente_id" });

// 🔹 Sincronizar base de datos sin perder datos
db.sync() // ✅ Eliminado `{ force: true }` para evitar que se borren los datos en cada reinicio
  .then(() => console.log("✅ Base de datos sincronizada correctamente."))
  .catch((err) => console.error("❌ Error al sincronizar la base de datos:", err));

export { LaboratoristaModel, PacienteModel, AnalisisADNModel, EnfermedadModel };
