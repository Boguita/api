import { db } from "../db.js";
import sendMail from "./send-mail.js";
import jwt from "jsonwebtoken";



export const getUsers = (req, res) => {
  const uid = req.params.id; // Obtener el uid de los parámetros de la solicitud
  const q = "SELECT * FROM users WHERE id = ?";

  db.query(q, [uid], (err, data) => {
    if (err) return res.status(500).json(err);

    return res.status(200).json(data);
  });
};

export const updateUsers = (req, res) => {
  const uid = req.params.id; // Obtener el uid de los parámetros de la solicitud
  const {seccional, email, tel, domicilio} = req.body;
  const q = "UPDATE users SET seccional = ?, email = ?, tel = ?, domicilio = ? WHERE id = ?";

  db.query(q, [seccional, email, tel, domicilio, uid], (err, data) => {
    if (err) return res.status(500).json(err);

    return res.status(200).json(data);
  });
}

export const getAllAfiliados = (req, res) => {
  const token = req.cookies.access_token;
  console.log(token);
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "SELECT * FROM afiliados";
    db.query(q, (err, data) => {
      if (err) return res.status(500).json(err);

      return res.status(200).json(data);
    });
  });
};

export const comprobarAfiliados = (req, res) => {
  const token = req.cookies.access_token;
  const dni = req.params.dni;

  
  if (!token) return res.status(401).json("No autenticado");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("Su sesión ha expirado");

    const q = "SELECT * FROM afiliados WHERE afiliados.dni = ?";
    db.query(q, [dni], (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json(err);
      }

      

      if (data.length > 0) {
        return res
          .status(200)
          .json({ message: "Ya existe un afiliado con ese DNI" });
      } else {
        return res
          .status(204)
          .json({ message: "No existe un afiliado con ese DNI" });
      }
    });
  });
};

export const getAfiliado = (req, res) => {
  const token = req.cookies.access_token;
  console.log(token);
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const dni = req.params.dni; // Obtener el DNI de los parámetros de la solicitud
    const query = `
      SELECT
        afiliados.idafiliados,
        afiliados.name AS afiliado_name,
        afiliados.dni AS afiliado_dni,
        afiliados.fecha_de_nacimiento AS afiliado_fecha_de_nacimiento,
        afiliados.tel AS afiliado_tel,
        afiliados.nacionalidad AS afiliado_nacionalidad,
        afiliados.sexo AS afiliado_sexo,
        afiliados.estado_civil AS afiliado_estado_civil,
        afiliados.cuit AS afiliado_cuit,
        afiliados.domicilio AS afiliado_domicilio,
        afiliados.correo AS afiliado_correo,
        afiliados.datos_empleador AS afiliado_datos_empleador, -- Nueva columna para los datos del empleador
        afiliados.dni_img AS afiliado_dni_img,         -- Nueva columna para la ruta de la imagen DNI
        afiliados.recibo_sueldo AS afiliado_recibo_sueldo, -- Nueva columna para la ruta del recibo de sueldo
        CONCAT('[', GROUP_CONCAT(
          CONCAT(
            '{"name":"', familiares.name, '","dni":"', familiares.dni, '", "fecha_de_nacimiento":"', familiares.fecha_de_nacimiento, '", "tel":"', familiares.tel, '", "categoria":"', familiares.categoria, '", "id":"', familiares.idfamiliares,'"}'
          )
        ), ']') AS familiares_data
      FROM
        afiliados
      LEFT JOIN
        familiares ON afiliados.idafiliados = familiares.id_afiliado
      WHERE
        afiliados.dni = ? 
      GROUP BY afiliados.idafiliados
    `;

    db.query(query, [dni], (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Error en el servidor" });
      }

      if (results.length === 0) {
        return res
          .status(404)
          .json({ message: "No se encontró ningún afiliado con ese DNI" });
      }
      console.log(results)
      const afiliadoData = {
        idafiliados: results[0].idafiliados,
        name: results[0].afiliado_name,
        dni: results[0].afiliado_dni,
        fecha_de_nacimiento: results[0].afiliado_fecha_de_nacimiento,
        tel: results[0].afiliado_tel,
        nacionalidad: results[0].afiliado_nacionalidad,
        sexo: results[0].afiliado_sexo,
        estado_civil: results[0].afiliado_estado_civil,
        cuit: results[0].afiliado_cuit,
        domicilio: results[0].afiliado_domicilio,
        correo: results[0].afiliado_correo,
        datos_empleador: JSON.parse(results[0].afiliado_datos_empleador), // Convertir el array JSON de datos del empleador
        dni_img: JSON.parse(results[0].afiliado_dni_img), // Convertir el array JSON de rutas de imagen
        recibo_sueldo: JSON.parse(results[0].afiliado_recibo_sueldo), // Convertir el array JSON de rutas de recibo
        familiares: JSON.parse(results[0].familiares_data),
      };

      return res.status(200).json(afiliadoData);
    });
  });
};



export const registerAfiliate = (req, res) => {
  const token = req.cookies.access_token;
  console.log(token);
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const {
      name,
      dni,
      fecha_de_nacimiento,
      tel,
      nacionalidad,
      provincia,
      ciudad,
      sexo,
      estado_civil,
      cuit,
      domicilio,
      correo,
      datos_empleador,
    } = req.body;

    const datosEmpleadorString = JSON.stringify(datos_empleador);

    // Verificar si ya existe un afiliado con el mismo DNI
    const checkDNIQuery = `
      SELECT dni
      FROM afiliados
      WHERE dni = ?
    `;
    db.query(checkDNIQuery, [dni], (err, dniResults) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Error en el servidor" });
      }
      if (dniResults.length > 0) {
        return res
          .status(400)
          .json({ error: "Ya existe un afiliado con este DNI" });
      }

      // Si no existe, realizar la inserción
      const insertQuery = `
        INSERT INTO afiliados (name, dni, fecha_de_nacimiento, tel, nacionalidad, provincia, ciudad, sexo, estado_civil, cuit, domicilio, correo, datos_empleador)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      db.query(
        insertQuery,
        [
          name,
          dni,
          fecha_de_nacimiento,
          tel,
          nacionalidad,
          provincia,
          ciudad,
          sexo,
          estado_civil,
          cuit,
          domicilio,
          correo,
          datosEmpleadorString,
        ],
        (err, results) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ error: "Error en el servidor" });
          }
          console.log("Query result:", results);
          const idafiliados = results.insertId;

          return res.json({
            message: "Afiliado registrado exitosamente",
          });
        }
      );
    });
  });
};

export const registerFamiliar = (req, res) => {
  const token = req.cookies.access_token;

  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");
 
    console.log(req.body);
    const {
      name,
      dni,
      dni_img,
      tel,
      libreta_img,
      fecha_de_nacimiento,
      categoria,
      id_afiliado,
    } = req.body;

    // Validar que los campos no estén vacíos o nulos
    if (
      !name ||
      !dni ||
      !tel ||
      !fecha_de_nacimiento ||
      !categoria ||
      !id_afiliado
    ) {
      return res.status(400).json({ error: "Campos incompletos" });
    }

    const insertQuery = `
      INSERT INTO familiares (name, dni, dni_img, tel, libreta_img, fecha_de_nacimiento, categoria, id_afiliado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
      insertQuery,
      [
        name,
        dni,
        dni_img,
        tel,
        libreta_img,
        fecha_de_nacimiento,
        categoria,
        id_afiliado,
      ],
      (err, results) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Error en el servidor" });
        }
        console.log("Query result:", results);
        const idfamiliares = results.insertId;

        return res.json({
          message: "Familiar registrado exitosamente",
          familiar_id: idfamiliares,
        });
      }
    );
  });
};


export const beneficiosOtorgados = (req, res) => {
  const user = req.params.user;
  const q = `
    SELECT tipo, MONTH(fecha_otorgamiento) AS month, COUNT(tipo) AS cantidad
    FROM beneficios_otorgados
    WHERE usuario_otorgante = ?
    GROUP BY tipo, month
  `;

  db.query(q, [user], (error, results) => {
    if (error) {
      console.error("Error:", error);
      res
        .status(500)
        .json({ message: "Error al obtener los beneficios otorgados." });
    } else {
      const beneficiosPorTipoYMes = {};
      results.forEach((beneficio) => {
        const tipo = beneficio.tipo.replace(/-/g, " ").toUpperCase(); // Transformación aquí
        const month = beneficio.month;
        const cantidad = beneficio.cantidad;

        if (!beneficiosPorTipoYMes[tipo]) {
          beneficiosPorTipoYMes[tipo] = {};
        }

        beneficiosPorTipoYMes[tipo][month] = cantidad;
      });
      res.json(beneficiosPorTipoYMes);
    }
  });
};








// export const getFamiliares = (req, res) => {
//   const idafiliados = req.params.id; // Obtener el idafiliados de los parámetros de la solicitud

//   const query = `
//     SELECT
//       afiliados.*,
//       familiares.*
//     FROM
//       afiliados
//     LEFT JOIN
//       familiares ON afiliados.idafiliados = familiares.id_afiliado
//     WHERE
//       afiliados.idafiliados = ?
//   `;

//   db.query(query, [idafiliados], (err, results) => {
//     if (err) {
//       console.log(err);
//       return res.status(500).json({ error: "Error en el servidor" });
//     }

//     return res.status(200).json(results);
//   });
// };



export const approveUser = (req, res) => {
  const username = req.body.username;
  const emailUser = [req.body.email];
  const contentUser = `<h1>¡Hola ${req.body.username}, tu solicitud de registro ha sido aprobada!</h1> <p>Nuestro equipo revisó tu solicitud y cumple con las normas y requerimientos necesarios para su aprobación. ¡BIENVENIDO!</p>`;
  const subjectUser = "ESTADO DE SOLICITUD UATRE BENEFICIOS";

  const selectQuery = "SELECT * FROM users WHERE username = ?";
  const updateQuery = "UPDATE users SET approved = true WHERE username = ?";

  // First, check if the user exists and is not already approved
  db.query(selectQuery, [username], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0)
      return res.status(404).json("No se encontró usuario con ese nombre");

    const user = data[0];
    if (user.approved) {
      return res.status(409).json("El usuario ya está aprobado."); // User is already approved
    }

    // If the user is not already approved, update the 'approved' field to true
    db.query(updateQuery, [username], (err, result) => {
      if (err) return res.status(500).json(err);

      // Check if any rows were affected by the update query
      if (result.affectedRows === 0) {
        return res.status(404).json("User not found!"); // User may not have been found in the database
      }

      // If the 'approved' field is successfully updated to true
      sendMail(emailUser, subjectUser, contentUser);
      return res.status(200).json("El usuario ha sido aprobado.");
    });
  });
};

export const deleteUser = (req, res) => {
  const username = req.body.username;
  
  const emailUser = [req.body.email];
  const contentUser = `<h1>¡Hola ${req.body.username}, tu solicitud de registro ha sido rechazada!</h1> <p>Nuestro equipo reviso tu solicitud y no cumple con las normas y requerimentos necesarios para su aprobación.</p>`;
  const subjectUser = "ESTADO DE SOLICITUD UATRE BENEFICIOS";

  const selectQuery = "SELECT * FROM users WHERE username = ?";
  const deleteQuery = "DELETE FROM users WHERE username = ?";

  // First, check if the user exists
  db.query(selectQuery, [username], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("No se encontró usuario con ese nombre");

    // If the user exists, delete it
    db.query(deleteQuery, [username], (err, result) => {
      if (err) return res.status(500).json(err);

      // Check if any rows were affected by the delete query
      if (result.affectedRows === 0) {
        return res.status(404).json("No se encontró usuario con ese nombre"); // User may not have been found in the database
      }

      // If the user is successfully deleted
      return res.status(200).json("El usuario ha sido rechazado.");
    });
    sendMail(emailUser, subjectUser, contentUser);
  });
};




// Call the function passing the afiliado_id for which you want to get the cónyuge details



//TODO
