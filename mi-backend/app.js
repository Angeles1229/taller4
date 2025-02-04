import express from "express";
import db from "./database/db.js";
import cors from "cors";
import { PORT } from "./config.js";

import pacientesRoutes from "./routes/pacientes.routes.js";
import laboratoristaRoutes from "./routes/laboratorista.routes.js";
import analizarRoutes from "./routes/analizar.routes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta para verificar que el servidor funciona
app.get("/", (req, res) => {
    res.json({ message: "🚀 Servidor corriendo correctamente" });
});

// Rutas principales
app.use("/api/analisis", analizarRoutes);
app.use("/api/pacientes", pacientesRoutes);
app.use("/api/laboratoristas", laboratoristaRoutes);

// Mostrar rutas activas en consola
console.log("🔹 Rutas activas en el servidor:");
app._router.stack.forEach((middleware) => {
    if (middleware.route) {
        console.log(`➡️  ${Object.keys(middleware.route.methods)[0].toUpperCase()} ${middleware.route.path}`);
    } else if (middleware.name === "router") {
        middleware.handle.stack.forEach((handler) => {
            if (handler.route) {
                console.log(`➡️  ${Object.keys(handler.route.methods)[0].toUpperCase()} ${handler.route.path}`);
            }
        });
    }
});

// Conexión a la base de datos
(async () => {
    try {
        await db.authenticate();
        console.log("✅ Conexión a la base de datos establecida.");
        await db.sync(); // Sin { force: true }, solo sincroniza sin borrar datos
    } catch (error) {
        console.error("❌ No se pudo conectar a la base de datos:", error);
    }
})();

// Iniciar el servidor
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto ${PORT}`));