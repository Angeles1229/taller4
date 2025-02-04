import { Sequelize } from "sequelize";


const db = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite", 
  logging: false, 
});


db.authenticate()
  .then(() => {
    console.log("Conexión establecida con SQLite.");
  })
  .catch((err) => {
    console.error("Error al conectar a la base de datos:", err);
  });

export default db;
