import { db } from "../db.js";
import sendMail from "./send-mail.js";
import sendMailSupport from "./send-mail-support.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Excel from "exceljs";

export const getUsers = (req, res) => {
   
  const uid = req.params.id; // Obtener el uid de los parámetros de la solicitud
  const q = "SELECT * FROM users WHERE id = ?";

  db.query(q, [uid], (err, data) => {
    if (err) return res.status(500).json(err);

    return res.status(200).json(data);
  });
};

export const getAfiliadosExcel = (req, res) => {
  //PUEDO HACER QUE SI REQ.PARAMS ALL ES IGUAL A TRUE ME DESCARGUE TODAS LAS IDS Y NO PASARLAS DESDE EL FRONT
  const { ids } = req.body; // Suponiendo que userIds es una lista de IDs separada por algún carácter, como una coma (ej. "1,2,3")
  console.log(ids);
  const idsArray = ids.map(Number); // Convertir la cadena de IDs en un array de números

  const query = `
    SELECT * FROM afiliados
    WHERE idafiliados IN (?)
  `;
  db.query(query, [idsArray], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    const afiliados = results;

    // Aquí deberías tener la información de los usuarios y puedes proceder a exportarla a Excel

    // Código para exportar a Excel (ejemplo utilizando una librería como exceljs)

    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("Afiliados");

    // Agregar encabezados de columnas
    const columns = Object.keys(afiliados[0]);
    worksheet.addRow(columns);

    // Agregar datos de usuarios
    afiliados.forEach((afiliado) => {
      const rowData = columns.map((column) => afiliado[column]);
      worksheet.addRow(rowData);
    });

    // Enviar el archivo Excel al cliente
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=afiliados.xlsx");
    return workbook.xlsx
      .write(res)
      .then(() => {
        res.end();
      })
      .catch((err) => {
        console.log(err);
        return res
          .status(500)
          .json({ error: "Error al escribir el archivo Excel" });
      });
  });
};


export const getUsersExcel = (req, res) => {
  //PUEDO HACER QUE SI REQ.PARAMS ALL ES IGUAL A TRUE ME DESCARGUE TODAS LAS IDS Y NO PASARLAS DESDE EL FRONT
  
  const { ids } = req.params; // Suponiendo que userIds es una lista de IDs separada por algún carácter, como una coma (ej. "1,2,3")
  console.log(ids);
  const idsArray = ids.split(",").map(Number); // Convertir la cadena de IDs en un array de números

  const query = `
    SELECT * FROM users
    WHERE id IN (?)
  `;
  db.query(query, [idsArray], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    const users = results;

    // Aquí deberías tener la información de los usuarios y puedes proceder a exportarla a Excel

    // Código para exportar a Excel (ejemplo utilizando una librería como exceljs)

    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("Usuarios");

    // Agregar encabezados de columnas
    const columns = Object.keys(users[0]);
    worksheet.addRow(columns);

    // Agregar datos de usuarios
    users.forEach((user) => {
      const rowData = columns.map((column) => user[column]);
      worksheet.addRow(rowData);
    });

    // Enviar el archivo Excel al cliente
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=usuarios.xlsx");
    return workbook.xlsx
      .write(res)
      .then(() => {
        res.end();
      })
      .catch((err) => {
        console.log(err);
        return res
          .status(500)
          .json({ error: "Error al escribir el archivo Excel" });
      });
  });
};



export const getAllUsers = (req, res) => {
  const token = req.cookies.access_token;
  console.log(token);
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "SELECT * FROM users";
    db.query(q, (err, data) => {
      if (err) return res.status(500).json(err);
      
      return res.status(200).json(data);
    });
  });
};






export const updateUsers = (req, res) => {
  const uid = req.body.id;
  const password = req.body.password;
  const repeat_password = req.body.repeat_password;

  if (password === repeat_password) {
    if (password) {
      // Si se proporciona una nueva contraseña, generamos un hash
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);
      const updateUser = {
        email: req.body.email,
        provincia: req.body.provincia,
        ciudad: req.body.ciudad,
        domicilio: req.body.domicilio,
        tel: req.body.tel,
        password: hash,
      };

      const q =
        "UPDATE users SET email = ?, tel = ?, domicilio = ?, provincia = ?, ciudad = ?, password = ? WHERE id = ?";
      db.query(
        q,
        [
          updateUser.email,
          updateUser.tel,
          updateUser.domicilio,
          updateUser.provincia,
          updateUser.ciudad,
          updateUser.password,
          uid,
        ],
        (err, data) => {
          if (err) return res.status(500).json(err);

          return res.status(200).json(data);
        }
      );
    } else {
      // Si no se proporciona una nueva contraseña, excluimos el campo de contraseña de la actualización
      const updateUser = {
        email: req.body.email,
        provincia: req.body.provincia,
        ciudad: req.body.ciudad,
        domicilio: req.body.domicilio,
        tel: req.body.tel,
      };

      const q =
        "UPDATE users SET email = ?, tel = ?, domicilio = ?, provincia = ?, ciudad = ? WHERE id = ?";
      db.query(
        q,
        [
          updateUser.email,
          updateUser.tel,
          updateUser.domicilio,
          updateUser.provincia,
          updateUser.ciudad,
          uid,
        ],
        (err, data) => {
          if (err) return res.status(500).json(err);

          return res.status(200).json(data);
        }
      );
    }
  } else {
    return res.status(409).json("Las contraseñas no coinciden.");
  }
};


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
  // const token = req.cookies.access_token;
  const dni = req.params.dni;

  
  // if (!token) return res.status(401).json("No autenticado");

  // jwt.verify(token, "jwtkey", (err, userInfo) => {
  //   if (err) return res.status(403).json("Su sesión ha expirado");

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
  // });
};

export const getAfiliado = (req, res) => {
  // const token = req.cookies.access_token;
  // console.log(token);
  // if (!token) return res.status(401).json("Not authenticated!");

  // jwt.verify(token, "jwtkey", (err, userInfo) => {
  //   if (err) return res.status(403).json("Token is not valid!");

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
        afiliados.dni_img_frente AS afiliado_dni_img_frente,         -- Nueva columna para la ruta de la imagen DNI
        afiliados.dni_img_dorso AS afiliado_dni_img_dorso, 
        afiliados.recibo_sueldo AS afiliado_recibo_sueldo, -- Nueva columna para la ruta del recibo de sueldo
        afiliados.provincia AS afiliado_provincia,
        afiliados.ciudad AS afiliado_ciudad,
CONCAT(
  '[',
  GROUP_CONCAT(
    JSON_OBJECT(
      'name', familiares.name,
      'dni', familiares.dni,
      'fecha_de_nacimiento', familiares.fecha_de_nacimiento,
      'tel', familiares.tel,
      'categoria', familiares.categoria,
      'id', familiares.idfamiliares,
      'dni_img_frente', familiares.dni_img_frente,
      'dni_img_dorso', familiares.dni_img_dorso,
      'dni_img', IFNULL(familiares.dni_img, 'null'),
      'libreta_img', IFNULL(familiares.libreta_img, 'null')
    )
  ),
  ']'
) AS familiares_data
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
      console.log(results[0].familiares_data)
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
        provincia: results[0].afiliado_provincia,
        ciudad: results[0].afiliado_ciudad,
        datos_empleador: results[0].afiliado_datos_empleador
          ? JSON.parse(results[0].afiliado_datos_empleador)
          : null,

        dni_img_frente: results[0].afiliado_dni_img_frente
          ? results[0].afiliado_dni_img_frente
          : null,
        dni_img_dorso: results[0].afiliado_dni_img_dorso
          ? results[0].afiliado_dni_img_dorso
          : null,

        recibo_sueldo: results[0].afiliado_recibo_sueldo
          ? JSON.parse(results[0].afiliado_recibo_sueldo)
          : null,

        familiares: results[0].familiares_data
          ? JSON.parse(results[0].familiares_data).map((familiar) => ({
              name: familiar.name || "",
              dni: familiar.dni || "",
              fecha_de_nacimiento: familiar.fecha_de_nacimiento || "",
              tel: familiar.tel || "",
              categoria: familiar.categoria || "",
              id: familiar.id || "",
              libreta_img: familiar.libreta_img
                ? JSON.parse(familiar.libreta_img)
                : [],
              dni_img: familiar.dni_img ? JSON.parse(familiar.dni_img) : [],
              dni_img_frente: familiar.dni_img_frente
                ? familiar.dni_img_frente
                : [],
              dni_img_dorso: familiar.dni_img_dorso
                ? familiar.dni_img_dorso
                : [],
            }))
          : [],
      };

      return res.status(200).json(afiliadoData);
    });
  // });
};

export const deleteAfiliado = (req, res) => {
  const idafiliados = req.params.id; // Obtener el idafiliados de los parámetros de la solicitud

  const query = `
    DELETE FROM afiliados
    WHERE idafiliados = ?
  `;
  db.query(query, [idafiliados], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    return res.status(200).json({ message: "Afiliado eliminado exitosamente" });
  });
};



export const registerAfiliate = (req, res) => {
  const {
    funcion,
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
      console.log("llega esta funcion", funcion)
      if (funcion) {
        const updateQuery = `
          UPDATE afiliados
          SET
            name = ?,
            fecha_de_nacimiento = ?,
            tel = ?,
            nacionalidad = ?,
            provincia = ?,
            ciudad = ?,
            sexo = ?,
            estado_civil = ?,
            cuit = ?,
            domicilio = ?,
            correo = ?,
            datos_empleador = ?
          WHERE dni = ?
        `;

        const updateValues = [
          name,
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
          dni,
        ];

        db.query(updateQuery, updateValues, (updateErr, updateResults) => {
          if (updateErr) {
            console.log(updateErr);
            return res.status(500).json({ error: "Error en el servidor" });
          }

          return res.json({ message: "Afiliado actualizado exitosamente" });
        });
      } else {
        return res
          .status(400)
          .json({ error: "Ya existe un afiliado con este DNI" });
      }
    } else {
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
    }
  });
};




export const registerFamiliar = (req, res) => {
  // const token = req.cookies.access_token;

  // if (!token) return res.status(401).json("Not authenticated!");

  // jwt.verify(token, "jwtkey", (err, userInfo) => {
  //   if (err) return res.status(403).json("Token is not valid!");
 
    const {
    name,
    dni,
    tel,
    libreta_img,
    fecha_de_nacimiento,
    categoria,
    numero_libreta,
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

  // Verificar si ya existe un afiliado con el mismo DNI
  const checkDNIQuery = `
    SELECT dni
    FROM familiares
    WHERE dni = ?
  `;
  db.query(checkDNIQuery, [dni, id_afiliado], (err, dniResults) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error en el servidor" });
    }
    if (dniResults.length > 0) {
      return res
        .status(400)
        .json({ error: "Ya existe un familiar con este DNI registrado." });
    }

    // Si no existe, realizar la inserción del familiar
    const insertQuery = `
      INSERT INTO familiares (name, dni, tel, fecha_de_nacimiento, categoria, numero_libreta, id_afiliado)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
      insertQuery,
      [
        name,
        dni,
        tel,
        fecha_de_nacimiento,
        categoria,
        numero_libreta,
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

  // });
};


export const beneficiosOtorgados = (req, res) => {
  
  const q = `
    SELECT tipo, MONTH(fecha_otorgamiento) AS month, COUNT(tipo) AS cantidad
    FROM beneficios_otorgados    
    GROUP BY tipo, month
  `;

  db.query(q, (error, results) => {
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
  const fecha_aprobacion = new Date(); // Obtén la fecha actual
  const emailUser = [req.body.email];
  const contentUser = `<h1>¡Hola ${req.body.username}, tu solicitud de registro ha sido aprobada!</h1> <p>Nuestro equipo revisó tu solicitud y cumple con las normas y requerimientos necesarios para su aprobación. ¡BIENVENIDO!</p>`;
  const subjectUser = "ESTADO DE SOLICITUD UATRE BENEFICIOS";

  const selectQuery = "SELECT * FROM users WHERE username = ?";
  const updateQuery =
    "UPDATE users SET status = 'Aprobado', fecha_aprobacion = ? WHERE username = ?";

  // Primero, verifica si el usuario existe y aún no está aprobado
  db.query(selectQuery, [username], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0)
      return res.status(404).json("No se encontró usuario con ese nombre");

    const user = data[0];
    if (user.status === "Aprobado") {
      return res.status(409).json("El usuario ya está aprobado."); // El usuario ya está aprobado
    }

    // Si el usuario aún no está aprobado, actualiza el campo 'status' a 'Aprobado' y establece la fecha de aprobación
    db.query(updateQuery, [fecha_aprobacion, username], (err, result) => {
      if (err) return res.status(500).json(err);

      // Verifica si se afectaron filas con la consulta de actualización
      if (result.affectedRows === 0) {
        return res.status(404).json("Usuario no encontrado"); // Puede que no se haya encontrado al usuario en la base de datos
      }

      // Si el campo 'status' se actualiza correctamente a 'Aprobado'
      sendMailSupport(emailUser, subjectUser, contentUser);
      return res.status(200).json("El usuario ha sido aprobado.");
    });
  });
};

export const declineUser = (req, res) => {
  const username = req.body.username;
  const emailUser = [req.body.email];

  const contentUser = `<h1>¡Hola ${req.body.username}, tu solicitud de registro ha sido RECHAZADA!</h1> <p>Nuestro equipo revisó tu solicitud y NO cumple con las normas y requerimientos necesarios para su aprobación. Por cualquier duda o consulta, contactarse a traves de cualquier medio oficial disponible.</p>`;
  const subjectUser = "ESTADO DE SOLICITUD UATRE BENEFICIOS";

  const selectQuery = "SELECT * FROM users WHERE username = ?";
  const updateQuery =
    "UPDATE users SET status = 'Rechazado' WHERE username = ?";

  // First, check if the user exists and is not already approved
  db.query(selectQuery, [username], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0)
      return res.status(404).json("No se encontró usuario con ese nombre");

    const user = data[0];
    // if (user.status === "Aprobado") {
    //   return res.status(409).json("El usuario ya está aprobado."); // User is already approved
    // }

    // If the user is not already approved, update the 'approved' field to true
    db.query(updateQuery, [username], (err, result) => {
      if (err) return res.status(500).json(err);

      // Check if any rows were affected by the update query
      if (result.affectedRows === 0) {
        return res.status(404).json("Usuario no encontrado"); // User may not have been found in the database
      }

      // If the 'approved' field is successfully updated to true
      sendMailSupport(emailUser, subjectUser, contentUser);
      return res.status(200).json("El usuario ha sido rechazado.");
    });
  });
}





export const soporte = (req, res) => {
  console.log(req.body);
  const {email, name, dni, seguimiento, type, benefit, message} = req.body;
  
  const emailAdmin = ["soporte@beneficiosuatre.com.ar"];
  const contentAdmin = `<h1>¡Se ha registrado una nueva consulta! </h1> <p><strong>DATOS DEL FORMULARIO:</strong>
    <br/> EMAIL: ${email} <br/>
    NOMBRE: ${name} <br/>
    DNI: ${dni} <br/>
    N° SEGUIMIENTO DEL BENEFICIO: ${seguimiento} <br/>
    TIPO DE CONSULTA: ${type} <br/>
    BENEFICIO: ${benefit} <br/>
    MENSAJE: ${message} <br/>    
    </p>`;
  const subjectAdmin = "NUEVA CONSULTA en UATRE BENEFICIOS";

  const contentUser = `<h1>¡Hola ${name}, tu mensaje ha sido recibido por nuestro equipo y estamos trabajando para responderte lo antes posible!</h1> <p>Te pido por favor aguardes la misma. Muchas gracias por contactarte.</p>`;
  const subjectUser = "ESTADO DE TU CONSULTA";

  try {
    // Intenta enviar correos electrónicos
    sendMailSupport(emailAdmin, subjectAdmin, contentAdmin);
    sendMailSupport(email, subjectUser, contentUser);

    return res.status(200).json("La consulta ha sido enviada con éxito.");
  } catch (error) {
    // Si hay un error al enviar correos electrónicos, responde con un error
    return res.status(500).json("Hubo un error al enviar la consulta.");
  }
};


export const deleteUser = (req, res) => {
  const username = req.body.username;
 
  
  const emailUser = [req.body.email];
  const contentUser = `<h1>¡Hola ${req.body.username}, tu usuario ha sido eliminado de nuestro sistema!</h1> <p>Nuestro equipo reviso tu solicitud y no cumple con las normas y requerimentos necesarios.</p>`;
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
      return res.status(200).json("El usuario ha sido eliminado.");
    });
    sendMailSupport(emailUser, subjectUser, contentUser);
  });
};




// Call the function passing the afiliado_id for which you want to get the cónyuge details



//TODO
