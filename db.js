
import mysql from "mysql2";

import dotenv from "dotenv";
dotenv.config();

const { HOST, USER, PASSWORD, DATABASE } = process.env;
console.log(HOST, USER, PASSWORD, DATABASE)


export const db = mysql.createConnection({
  host: HOST,
  user: USER,
  password: PASSWORD,
  database: DATABASE,
});

db.connect((err) => {
  if (err) {
    console.error("Error al conectar a la base de datos:", err.message);
    return;
  }
  console.log("Conexión exitosa a la base de datos!");
});

// Ahora la conexión está establecida y puedes realizar tus consultas y operaciones con la base de datos a través de "db".