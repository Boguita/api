import multer from "multer";
import { db } from "../db.js";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Directorio donde se guardarán las imágenes (crea la carpeta "uploads" en tu proyecto)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const originalName = file.originalname;
    const fileExtension = originalName.split(".").pop(); // Obtener la extensión del nombre de archivo original
    cb(null, file.fieldname + "-" + uniqueSuffix + "." + fileExtension); // Define el nombre del archivo con su extensión original
  }
});

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // Establecer un límite de 50 megabytes (ajustar según tus necesidades)
  },
  fileFilter: function (req, file, cb) {
    // Verificar si el tipo de archivo es el permitido (por ejemplo, solo permitir imágenes)
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype === "application/pdf"
    ) {
      console.log("File type OK", file.mimetype);
      cb(null, true); // Permitir el archivo
    } else {
      cb(new Error("Tipo de archivo no permitido"), false);
    }
  },
});

export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Error relacionado con multer (por ejemplo, tamaño de archivo excedido)
    console.error("Multer Error:", err.message);
    return res.status(400).json({ error: "Error al subir el archivo" });
  } else if (err) {
    // Otros errores
    console.error("Errasor:", err.message);
    return res.status(500).json({ error: err.message });
  }
  next(); // Pasar al siguiente middleware/ruta
};

export const uploadCertificado = (req, res) => {
  const idsString = req.body.id; // Array de IDs
  const certificado = req.files.map((file) => file.path);
  console.log("ID DEL FRONT", idsString); //
  console.log("CERTIFICADO", certificado);


  const idsArray = idsString.split(",").map((id) => parseInt(id.trim(), 10));
  console.log("IDS ARRAY", idsArray);
  // Usar el método map para iterar sobre cada ID y realizar la actualización en la base de datos
  idsArray.forEach((id) => {
    const query = `UPDATE kit_maternal SET certificado = ? WHERE beneficio_otorgado_id = ?`;
    const values = [certificado, id];

    db.query(query, values, (err, results) => {
      if (err) {
        console.log(err);
        // No detengas la ejecución en caso de error, continúa con las actualizaciones restantes
      } else {
        console.log("Query result:", results);
      }
    });
  });

  return res.json({
    message: "Certificado cargado exitosamente",
  });
};

export const uploadDniFamiliar = (req, res) => {
  const id = req.body.dni;

  // Acceder a los archivos del frente y el dorso del DNI
  const dni_img_frente = req.files["dni_img_frente"];
  const dni_img_dorso = req.files["dni_img_dorso"];

  // Verificar si los archivos existen
  if (!dni_img_frente || !dni_img_dorso) {
    return res.status(400).json({ error: "Debes subir ambos lados del DNI" });
  }

  // Aquí puedes realizar la lógica para guardar las rutas en la base de datos
  // Por ejemplo, si estás utilizando MySQL, podrías hacer una consulta SQL para actualizar el campo "dni_img" con las rutas de las imágenes

  const query = `
    UPDATE familiares
    SET dni_img_frente = ?,
        dni_img_dorso = ?
    WHERE dni = ?
  `;

  const values = [dni_img_frente[0].path, dni_img_dorso[0].path, id];

  db.query(query, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error en el servidor" });
    }
    console.log("Query result:", results);
    return res.json({
      message: "Imágenes de DNI cargadas exitosamente",
    });
  });
};



export const uploadLibreta = (req, res) => {
  const id = req.body.dni;
  const libreta_img = req.files.map((file) => file.path);

  // Aquí puedes realizar la lógica para guardar las rutas en la base de datos
  // Por ejemplo, si estás utilizando MySQL, podrías hacer una consulta SQL para actualizar el campo "dni_img" con las rutas de las imágenes
  const query = `
    UPDATE familiares
    SET libreta_img = ?
    WHERE dni = ?
  `;
  const values = [JSON.stringify(libreta_img), id];

  db.query(query, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error en el servidor" });
    }
    console.log("Query result:", results);
    return res.json({
      message: "Imágenes de libreta cargadas exitosamente",
    });
  });
};




export const uploadConstancia = (req, res) => {
 const idsString = req.body.id;// Array de IDs
  const constancia = req.file.path;

const idsArray = idsString.split(",").map((id) => parseInt(id.trim(), 10));

  // Usar el método map para iterar sobre cada ID y realizar la actualización en la base de datos
  idsArray.forEach((id) => {
    const query = `UPDATE beneficios_otorgados SET constancia_img = ? WHERE id = ?`;
    const values = [constancia, id];

    db.query(query, values, (err, results) => {
      if (err) {
        console.log(err);
        // No detengas la ejecución en caso de error, continúa con las actualizaciones restantes
      } else {
        console.log("Query result:", results);
      }
    });
  });

  return res.json({
    message: "Constancias cargadas exitosamente",
  });
};

export const uploadDni = (req, res) => {
  const dni = req.body.dni;
  
  const dni_img_frente = req.files["dni_img_frente"];
  const dni_img_dorso = req.files["dni_img_dorso"];

  // Verificar si los archivos existen
  if (!dni_img_frente || !dni_img_dorso) {
    return res.status(400).json({ error: "Debes subir ambos lados del DNI" });
  }
  

  // Aquí puedes realizar la lógica para guardar las rutas en la base de datos
  // Por ejemplo, si estás utilizando MySQL, podrías hacer una consulta SQL para actualizar el campo "dni_img" con las rutas de las imágenes
  const query = `
    UPDATE afiliados
    SET dni_img_frente = ?,
        dni_img_dorso = ?
    WHERE dni = ?
  `;

  const values = [dni_img_frente[0].path, dni_img_dorso[0].path, dni];
  db.query(query, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error en el servidor" });
    }
    console.log("Query result:", results);
    return res.json({
      message: "Imágenes del DNI cargadas exitosamente",
    });
  });
};


export const uploadDdjj = (req, res) => {
  const dni = req.body.dni;
  const ddjj = req.files.map((file) => file.path);

  // Aquí puedes realizar la lógica para guardar las rutas en la base de datos
  // Por ejemplo, si estás utilizando MySQL, podrías hacer una consulta SQL para actualizar el campo "dni_img" con las rutas de las imágenes
  const query = `
    UPDATE afiliados
    SET ddjj = ?
    WHERE dni = ?
  `;
  const values = [JSON.stringify(ddjj), dni];

  db.query(query, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error en el servidor" });
    }
    console.log("Query result:", results);
    return res.json({
      message: "Imágenes de la DDJJ cargadas exitosamente",
    });
  });
};

export const uploadRecibo = (req, res) => {
  const dni = req.body.dni;
  const recibo_sueldo = req.files.map((file) => file.path);
  console.log(recibo_sueldo);

  const query = `
    SELECT recibo_sueldo, old_recibo
    FROM afiliados
    WHERE dni = ?
  `;

  db.query(query, [dni], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    const existingReciboSueldo = JSON.parse(results[0].recibo_sueldo || "[]");
    const existingOldRecibo = JSON.parse(results[0].old_recibo || "[]");

    // Si recibo_sueldo está vacío, simplemente actualiza el campo
    if (existingReciboSueldo.length === 0) {
      const updateQuery = `
        UPDATE afiliados
        SET recibo_sueldo = ?
        WHERE dni = ?
      `;

      const updateValues = [JSON.stringify(recibo_sueldo), dni];

      db.query(updateQuery, updateValues, (updateErr, updateResults) => {
        if (updateErr) {
          console.log(updateErr);
          return res.status(500).json({ error: "Error en el servidor" });
        }

        console.log("Query result (recibo_sueldo):", updateResults);

        return res.json({
          message: "Imágenes del recibo de sueldo cargadas exitosamente",
        });
      });
    } else {
      // Mover las rutas antiguas a old_recibo
      const newOldRecibo = existingOldRecibo.concat(existingReciboSueldo);

      // Actualizar recibo_sueldo con las nuevas rutas
      const updateQuery = `
        UPDATE afiliados
        SET recibo_sueldo = ?
        WHERE dni = ?
      `;

      const updateValues = [JSON.stringify(recibo_sueldo), dni];

      db.query(updateQuery, updateValues, (updateErr, updateResults) => {
        if (updateErr) {
          console.log(updateErr);
          return res.status(500).json({ error: "Error en el servidor" });
        }

        // Actualizar old_recibo con las rutas antiguas
        const oldReciboQuery = `
          UPDATE afiliados
          SET old_recibo = ?
          WHERE dni = ?
        `;

        const oldReciboValues = [JSON.stringify(newOldRecibo), dni];

        db.query(
          oldReciboQuery,
          oldReciboValues,
          (oldReciboErr, oldReciboResults) => {
            if (oldReciboErr) {
              console.log(oldReciboErr);
              return res.status(500).json({ error: "Error en el servidor" });
            }

            console.log("Query result (recibo_sueldo):", updateResults);
            console.log("Query result (old_recibo):", oldReciboResults);

            return res.json({
              message: "Imágenes del recibo de sueldo cargadas exitosamente",
            });
          }
        );
      });
    }
  });
};

// export const uploadImages = (req, res) => {
//   const imageTypes = ["dni_img", "recibo_sueldo"];
//   const imagesToSave = [];
//   const dni = req.body.dni;
  

//   // Verificar si el campo imageType se envió en la solicitud
//   if (!req.body.imageType) {
//     return res
//       .status(400)
//       .json({ error: "Campo imageType faltante en la solicitud" });
//   }

//   // Verificar si el valor de imageType es válido (si es un array, verificar cada elemento)
//   if (Array.isArray(req.body.imageType)) {
//     for (const type of req.body.imageType) {
//       if (!imageTypes.includes(type)) {
//         return res
//           .status(400)
//           .json({ error: "Valor inválido para el campo imageType" });
//       }
//     }
//   } else {
//     if (!imageTypes.includes(req.body.imageType)) {
//       return res
//         .status(400)
//         .json({ error: "Valor inválido para el campo imageType" });
//     }
//   }
// console.log(req.files.images)
//   // Obtener las imágenes del campo images
//   if (req.files && req.files.images) {
//     const imageArray = Array.isArray(req.files.images)
//       ? req.files.images
//       : [req.files.images];

//     imageArray.forEach((image) => {
//       const imagePath = image.path;
//       const imageTypeKey = req.body.imageType; // Concatenamos "_img" para formar el nombre del campo en la base de datos
//       imagesToSave.push({ type: req.body.imageType, path: imagePath });
//     });
//   }
//   console.log(imagesToSave)
//   // Convertir el array imagesToSave en una cadena JSON
//   const dni_img = JSON.stringify(
//     imagesToSave
//       .filter((image) => image.type === "dni_img")
//       .map((image) => image.path)
//   );
//   console.log(dni_img)
//   const recibo_sueldo = JSON.stringify(
//     imagesToSave
//       .filter((image) => image.type === "recibo_sueldo")
//       .map((image) => image.path)
//   );
//   console.log(recibo_sueldo);

//   const query = `
//     UPDATE afiliados
//     SET dni_img = ?,
//     recibo_sueldo = ?
//     WHERE dni = ?
//   `;
//   const values = [dni_img, recibo_sueldo, dni];

//   db.query(query, values, (err, results) => {
//     if (err) {
//       console.log(err);
//       return res.status(500).json({ error: "Error en el servidor" });
//     }
//     console.log("Query result:", results);
//     return res.json({
//       message: "Imágenes cargadas exitosamente",
//     });
//   });
// };


export const getImagesByDni = (req, res) => {
  const dni = req.params.dni;
  const query = "SELECT dni_img, recibo_sueldo FROM afiliados WHERE dni = ?";
  db.query(query, [dni], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    // Comprobar si se encontró un registro con el DNI dado
    if (results.length === 0) {
      return res
        .status(404)
        .json({ error: "No se encontró el afiliado con el DNI dado" });
    }

    // Obtener la ruta de la imagen del campo dni_img del primer resultado (asumiendo que el DNI es único)
    const dniImagePath = results[0].dni_img;

    // Obtener la ruta de la imagen del campo recibo_sueldo del primer resultado
    const reciboSueldoImagePath = results[0].recibo_sueldo;

    return res.status(200).json({ dniImagePath, reciboSueldoImagePath });
  });
};


// const imageTypes = ["dni_img", "recibo_sueldo"];

// const imagesToSave = [];
// const dni = req.body.dni; // O req.query.dni si estás enviando los datos en la URL

// imageTypes.forEach((imageType) => {
//   console.log("entro", imageType);
//   if (req.files && req.files[imageType]) {
//     const imagePath = req.files[imageType][0].path;

//     imagesToSave.push({ type: imageType, path: imagePath });
//   }
// });

// // Convertir el array imagesToSave en una cadena JSON
// const dni_img = JSON.stringify(
//   imagesToSave
//     .filter((image) => image.type === "dni_img")
//     .map((image) => image.path)
// );
// const recibo_sueldo = JSON.stringify(
//   imagesToSave
//     .filter((image) => image.type === "recibo_sueldo")
//     .map((image) => image.path)
// );

// const query = `
//     UPDATE afiliados
//     SET dni_img = ?,
//     recibo_sueldo = ?
//     WHERE dni = ?
//   `;

// const values = [dni_img, recibo_sueldo, dni];

// console.log("Images to save:", imagesToSave);
// console.log("Query values:", values);

// db.query(query, values, (err, results) => {
//   if (err) {
//     console.log(err);
//     return res.status(500).json({ error: "Error en el servidor" });
//   }
//   console.log("Query result:", results);

//   return res.json({
//     message: "Imágenes cargadas exitosamente",
//   });
// });