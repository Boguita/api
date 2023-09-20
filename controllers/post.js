import { db } from "../db.js";
import jwt from "jsonwebtoken";
import excel from "exceljs";

export const getBeneficiosByDni = (req, res) => {
  const dni = req.params.dni;

  const query = `
    SELECT
      beneficios_otorgados.id,
      beneficios_otorgados.tipo,
      beneficios_otorgados.detalles,
      beneficios_otorgados.estado,
      kit_escolar.mochila,
      kit_escolar.guardapolvo,
      kit_escolar.utiles,      
      beneficios_otorgados.fecha_otorgamiento,
      beneficios_otorgados.afiliado_id,
      beneficios_otorgados.familiar_id,
      familiares.name AS familiar_name,
      familiares.dni AS familiar_dni,
      familiares.tel AS familiar_tel,
      familiares.categoria AS familiar_categoria
    FROM
      beneficios_otorgados
    LEFT JOIN
      familiares ON beneficios_otorgados.familiar_id = familiares.idfamiliares
    LEFT JOIN
      afiliados ON beneficios_otorgados.afiliado_id = afiliados.idafiliados
    LEFT JOIN
      kit_escolar ON beneficios_otorgados.id = kit_escolar.beneficio_otorgado_id
    LEFT JOIN
      kit_maternal ON beneficios_otorgados.id = kit_maternal.beneficio_otorgado_id
    LEFT JOIN
      luna_de_miel ON beneficios_otorgados.id = luna_de_miel.beneficio_otorgado_id
    WHERE
      afiliados.dni = ? 
  `;

  db.query(query, [dni], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    return res.status(200).json(results);
  });
};

export const getKitLunadeMielExcel = (req, res) => {
  const query = `
    SELECT
      beneficios_otorgados.id,
      beneficios_otorgados.tipo,
      beneficios_otorgados.detalles,
      beneficios_otorgados.estado,
      luna_de_miel.numero_libreta,           
      beneficios_otorgados.fecha_otorgamiento,
      beneficios_otorgados.afiliado_id,
      beneficios_otorgados.familiar_id,
      familiares.name AS familiar_name,
      familiares.dni AS familiar_dni,
      familiares.tel AS familiar_tel,
      familiares.categoria AS familiar_categoria,
      afiliados.name AS afiliado_name,
      afiliados.dni AS afiliado_dni
    FROM
      beneficios_otorgados
    LEFT JOIN
      familiares ON beneficios_otorgados.familiar_id = familiares.idfamiliares
    LEFT JOIN
      afiliados ON beneficios_otorgados.afiliado_id = afiliados.idafiliados
    LEFT JOIN
      kit_maternal ON beneficios_otorgados.id = kit_maternal.beneficio_otorgado_id
    WHERE
      beneficios_otorgados.tipo = 'Kit maternal'
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    // Crear un nuevo libro de Excel
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet("Kit Maternal");

    // Definir las columnas en el archivo Excel con estilo
    const headerRow = worksheet.addRow([
      "ID",
      "Tipo",
      "Detalles",
      "Estado",
      "Semanas",
      "Fecha de Parto",
      "Cantidad",
      "Fecha de Otorgamiento",
      "Afiliado ID",
      "Afiliado",
      "DNI Afiliado",
      "Familiar ID",
      "Nombre del Familiar",
      "DNI del Familiar",
      "Teléfono del Familiar",
      "Categoría del Familiar",
    ]);

    // Aplicar estilo a la fila de encabezado
    headerRow.eachCell((cell, index) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF23A1D8" },
      };
      cell.font = {
        bold: true, // Texto en negrita
      };
      cell.alignment = {
        vertical: "middle", // Alineación vertical centrada
        horizontal: "center", // Alineación horizontal centrada
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };

      if (
        index === 1 ||
        index === 2 ||
        index === 3 ||
        index === 4 ||
        index === 5 ||
        index === 6 ||
        index === 7 ||
        index === 9 ||
        index === 10 ||
        index === 11 ||
        index === 12 ||
        index === 13 ||
        index === 14 ||
        index === 15
      ) {
        // Cambia 0 y 2 a los índices de las columnas que deseas ajustar
        worksheet.getColumn(index + 1).width = 20; // Cambia 20 al ancho deseado
      } // Cambia 10 al ancho deseado
    });

    // Agregar los datos a las filas del archivo Excel con estilo
    results.forEach((row) => {
      worksheet.addRow([
        row.id,
        row.tipo,
        row.detalles,
        row.estado,
        row.semanas,
        row.fecha_de_parto,
        row.cantidad,
        row.fecha_otorgamiento,
        row.afiliado_id,
        row.afiliado_name,
        row.afiliado_dni,
        row.familiar_id,
        row.familiar_name,
        row.familiar_dni,
        row.familiar_tel,
        row.familiar_categoria,
      ]);
    });

    function getExcelAlpha(num) {
      let alpha = "";
      while (num > 0) {
        const remainder = (num - 1) % 26;
        alpha = String.fromCharCode(65 + remainder) + alpha;
        num = Math.floor((num - 1) / 26);
      }
      return alpha;
    }

    // Aplicar bordes internos a la tabla de datos
    const numDataRows = results.length;
    const numColumns = headerRow.actualCellCount;
    const lastDataRow = worksheet.getRow(numDataRows + 1);

    for (let i = 1; i <= numColumns; i++) {
      for (let j = 2; j <= numDataRows + 1; j++) {
        worksheet.getCell(`${getExcelAlpha(i)}${j}`).border = {
          top: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
          bottom: { style: "thin" },
        };
      }
    }

    // Aplicar bordes exteriores a la tabla de datos
    for (let i = 1; i <= numColumns; i++) {
      worksheet.getCell(`${getExcelAlpha(i)}1`).border = {
        top: { style: "thin" }, // Bordes superiores de las columnas de encabezado
        bottom: { style: "thin" }, // Bordes inferiores de las columnas de datos
        left: { style: "thin" }, // Borde izquierdo de la columna
        right: { style: "thin" }, // Borde derecho de la columna
      };
    }

    lastDataRow.eachCell((cell, index) => {
      cell.border = {
        bottom: { style: "thin" }, // Bordes inferiores de la última fila de datos
        left: { style: "thin" }, // Borde izquierdo de la última fila de datos
        right: { style: "thin" }, // Borde derecho de la última fila de datos
      };
    });

    // Configurar la respuesta HTTP para descargar el archivo Excel
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=kit_escolar.xlsx"
    );

    // Enviar el archivo Excel como respuesta
    workbook.xlsx.write(res).then(() => {
      res.end();
    });
  });
};


export const getKitMaternalExcel = (req, res) => {
  const query = `
    SELECT
      beneficios_otorgados.id,
      beneficios_otorgados.tipo,
      beneficios_otorgados.detalles,
      beneficios_otorgados.estado,
      kit_maternal.semanas,
      kit_maternal.fecha_de_parto,
      kit_maternal.cantidad,      
      beneficios_otorgados.fecha_otorgamiento,
      beneficios_otorgados.afiliado_id,
      beneficios_otorgados.familiar_id,
      familiares.name AS familiar_name,
      familiares.dni AS familiar_dni,
      familiares.tel AS familiar_tel,
      familiares.categoria AS familiar_categoria,
      afiliados.name AS afiliado_name,
      afiliados.dni AS afiliado_dni
    FROM
      beneficios_otorgados
    LEFT JOIN
      familiares ON beneficios_otorgados.familiar_id = familiares.idfamiliares
    LEFT JOIN
      afiliados ON beneficios_otorgados.afiliado_id = afiliados.idafiliados
    LEFT JOIN
      kit_maternal ON beneficios_otorgados.id = kit_maternal.beneficio_otorgado_id
    WHERE
      beneficios_otorgados.tipo = 'Kit maternal'
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    // Crear un nuevo libro de Excel
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet("Kit Maternal");

    // Definir las columnas en el archivo Excel con estilo
    const headerRow = worksheet.addRow([
      "ID",
      "Tipo",
      "Detalles",
      "Estado",
      "Semanas",
      "Fecha de Parto",
      "Cantidad",
      "Fecha de Otorgamiento",
      "Afiliado ID",
      "Afiliado",
      "DNI Afiliado",
      "Familiar ID",
      "Nombre del Familiar",
      "DNI del Familiar",
      "Teléfono del Familiar",
      "Categoría del Familiar",
    ]);

    // Aplicar estilo a la fila de encabezado
    headerRow.eachCell((cell, index) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF23A1D8" },
      };
      cell.font = {
        bold: true, // Texto en negrita
      };
      cell.alignment = {
        vertical: "middle", // Alineación vertical centrada
        horizontal: "center", // Alineación horizontal centrada
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };

      if (
        index === 1 ||
        index === 2 ||
        index === 3 ||
        index === 4 ||
        index === 5 ||
        index === 6 ||
        index === 7 ||
        index === 9 ||
        index === 10 ||
        index === 11 ||
        index === 12 ||
        index === 13 ||
        index === 14 ||
        index === 15
      ) {
        // Cambia 0 y 2 a los índices de las columnas que deseas ajustar
        worksheet.getColumn(index + 1).width = 20; // Cambia 20 al ancho deseado
      } // Cambia 10 al ancho deseado
    });

    // Agregar los datos a las filas del archivo Excel con estilo
    results.forEach((row) => {
      worksheet.addRow([
        row.id,
        row.tipo,
        row.detalles,
        row.estado,
        row.semanas,
        row.fecha_de_parto,
        row.cantidad,
        row.fecha_otorgamiento,
        row.afiliado_id,
        row.afiliado_name,
        row.afiliado_dni,
        row.familiar_id,
        row.familiar_name,
        row.familiar_dni,
        row.familiar_tel,
        row.familiar_categoria,
      ]);
    });

    function getExcelAlpha(num) {
      let alpha = "";
      while (num > 0) {
        const remainder = (num - 1) % 26;
        alpha = String.fromCharCode(65 + remainder) + alpha;
        num = Math.floor((num - 1) / 26);
      }
      return alpha;
    }

    // Aplicar bordes internos a la tabla de datos
    const numDataRows = results.length;
    const numColumns = headerRow.actualCellCount;
    const lastDataRow = worksheet.getRow(numDataRows + 1);

    for (let i = 1; i <= numColumns; i++) {
      for (let j = 2; j <= numDataRows + 1; j++) {
        worksheet.getCell(`${getExcelAlpha(i)}${j}`).border = {
          top: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
          bottom: { style: "thin" },
        };
      }
    }

    // Aplicar bordes exteriores a la tabla de datos
    for (let i = 1; i <= numColumns; i++) {
      worksheet.getCell(`${getExcelAlpha(i)}1`).border = {
        top: { style: "thin" }, // Bordes superiores de las columnas de encabezado
        bottom: { style: "thin" }, // Bordes inferiores de las columnas de datos
        left: { style: "thin" }, // Borde izquierdo de la columna
        right: { style: "thin" }, // Borde derecho de la columna
      };
    }

    lastDataRow.eachCell((cell, index) => {
      cell.border = {
        bottom: { style: "thin" }, // Bordes inferiores de la última fila de datos
        left: { style: "thin" }, // Borde izquierdo de la última fila de datos
        right: { style: "thin" }, // Borde derecho de la última fila de datos
      };
    });

    // Configurar la respuesta HTTP para descargar el archivo Excel
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=kit_escolar.xlsx"
    );

    // Enviar el archivo Excel como respuesta
    workbook.xlsx.write(res).then(() => {
      res.end();
    });
  });
};




export const getKitEscolarExcel = (req, res) => {
  const query = `
    SELECT
      beneficios_otorgados.id,
      beneficios_otorgados.tipo,
      beneficios_otorgados.detalles,
      beneficios_otorgados.estado,
      kit_escolar.mochila,
      kit_escolar.guardapolvo,
      kit_escolar.utiles,      
      beneficios_otorgados.fecha_otorgamiento,
      beneficios_otorgados.afiliado_id,
      beneficios_otorgados.familiar_id,
      familiares.name AS familiar_name,
      familiares.dni AS familiar_dni,
      familiares.tel AS familiar_tel,
      familiares.categoria AS familiar_categoria,
      afiliados.name AS afiliado_name,
      afiliados.dni AS afiliado_dni
    FROM
      beneficios_otorgados
    LEFT JOIN
      familiares ON beneficios_otorgados.familiar_id = familiares.idfamiliares
    LEFT JOIN
      afiliados ON beneficios_otorgados.afiliado_id = afiliados.idafiliados
    LEFT JOIN
      kit_escolar ON beneficios_otorgados.id = kit_escolar.beneficio_otorgado_id
    WHERE
      beneficios_otorgados.tipo = 'Kit escolar'
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    // Crear un nuevo libro de Excel
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet("Kit Escolar");

    // Definir las columnas en el archivo Excel con estilo
    const headerRow = worksheet.addRow([
      "ID",
      "Tipo",
      "Detalles",
      "Estado",
      "Mochila",
      "Guardapolvo",
      "Útiles",
      "Fecha de Otorgamiento",
      "Afiliado ID",
      "Afiliado",
      "DNI Afiliado",
      "Familiar ID",
      "Nombre del Familiar",
      "DNI del Familiar",
      "Teléfono del Familiar",
      "Categoría del Familiar",
    ]);

    // Aplicar estilo a la fila de encabezado
    headerRow.eachCell((cell, index) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF23A1D8" },
      };
      cell.font = {
        bold: true, // Texto en negrita
      };
      cell.alignment = {
        vertical: "middle", // Alineación vertical centrada
        horizontal: "center", // Alineación horizontal centrada
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };

      if (
        index === 1 ||
        index === 2 ||
        index === 3 ||
        index === 4 ||
        index === 5 ||
        index === 6 ||
        index === 7 ||
        index === 9 ||
        index === 10 ||
        index === 11 ||
        index === 12 ||
        index === 13 ||
        index === 14 ||
        index === 15
      ) {
        // Cambia 0 y 2 a los índices de las columnas que deseas ajustar
        worksheet.getColumn(index + 1).width = 20; // Cambia 20 al ancho deseado
      } // Cambia 10 al ancho deseado
    });

    // Agregar los datos a las filas del archivo Excel con estilo
    results.forEach((row) => {
      worksheet.addRow([
        row.id,
        row.tipo,
        row.detalles,
        row.estado,
        row.mochila,
        row.guardapolvo,
        row.utiles,
        row.fecha_otorgamiento,
        row.afiliado_id,
        row.afiliado_name,
        row.afiliado_dni,
        row.familiar_id,
        row.familiar_name,
        row.familiar_dni,
        row.familiar_tel,
        row.familiar_categoria,
      ]);
    });

    function getExcelAlpha(num) {
      let alpha = "";
      while (num > 0) {
        const remainder = (num - 1) % 26;
        alpha = String.fromCharCode(65 + remainder) + alpha;
        num = Math.floor((num - 1) / 26);
      }
      return alpha;
    }

    // Aplicar bordes internos a la tabla de datos
    const numDataRows = results.length;
    const numColumns = headerRow.actualCellCount;
    const lastDataRow = worksheet.getRow(numDataRows + 1);

    for (let i = 1; i <= numColumns; i++) {
      for (let j = 2; j <= numDataRows + 1; j++) {
        worksheet.getCell(`${getExcelAlpha(i)}${j}`).border = {
          top: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
          bottom: { style: "thin" },
        };
      }
    }

    // Aplicar bordes exteriores a la tabla de datos
    for (let i = 1; i <= numColumns; i++) {
      worksheet.getCell(`${getExcelAlpha(i)}1`).border = {
        top: { style: "thin" }, // Bordes superiores de las columnas de encabezado
        bottom: { style: "thin" }, // Bordes inferiores de las columnas de datos
        left: { style: "thin" }, // Borde izquierdo de la columna
        right: { style: "thin" }, // Borde derecho de la columna
      };
    }

    lastDataRow.eachCell((cell, index) => {
      cell.border = {
        bottom: { style: "thin" }, // Bordes inferiores de la última fila de datos
        left: { style: "thin" }, // Borde izquierdo de la última fila de datos
        right: { style: "thin" }, // Borde derecho de la última fila de datos
      };
    });

    // Configurar la respuesta HTTP para descargar el archivo Excel
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=kit_escolar.xlsx"
    );

    // Enviar el archivo Excel como respuesta
    workbook.xlsx.write(res).then(() => {
      res.end();
    });
  });
};


export const comprobarBeneficioKitMaternal = (req, res) => {
  const familiarId = req.params.familiar_id;
 

  const query = `
    SELECT *
    FROM beneficios_otorgados
    WHERE familiar_id = ?
      AND tipo = 'Kit maternal'
      AND estado = 'Pendiente'
  `;

  db.query(query, [familiarId], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    if (results.length === 0) {
      return res.status(200).json([]);
    }

    const estadoBeneficio = results;

    // if (estadoBeneficio === "Pendiente") {
    //   return res.status(200).json({ estado: "Pendiente" });
    // } else if (estadoBeneficio === "Entregado") {
    //   return res.status(200).json({ estado: "Entregado" });
    // } else if (estadoBeneficio === "Rechazado") {
    //   return res.status(200).json({ estado: "Rechazado" });
    // } else if (estadoBeneficio === "Aprobado") {
    //   return res.status(200).json({ estado: "Aprobado" });
    // }

    return res.status(200).json(estadoBeneficio);
  });
};

export const updateEstadoBeneficio = (req, res) => {
  const beneficioId = req.params.beneficio_id;
  const estado = req.body.estado;
  

  const query = `
    UPDATE beneficios_otorgados
    SET estado = ?
    WHERE id = ?
  `;
  db.query(query, [estado, beneficioId], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    return res.status(200).json({ message: "Estado actualizado", ids: [beneficioId] });
  });
};



export const comprobarBeneficios = (req, res) => {
  // const token = req.cookies.access_token;
  // if (!token) return res.status(401).json("No autenticado");

  // jwt.verify(token, "jwtkey", (err, userInfo) => {
  //   if (err) return res.status(403).json("Token no válido");

    const familiarIds = req.params.familiar_ids.split(",").map(Number); // Cambiamos a req.query para obtener los parámetros de consulta
    console.log(familiarIds);
    const query = `
      SELECT
        beneficios_otorgados.id,
        beneficios_otorgados.tipo,
        beneficios_otorgados.detalles,
        kit_escolar.año_escolar,
        kit_escolar.mochila,
        kit_escolar.guardapolvo,
        kit_escolar.guardapolvo_confirm,
        kit_escolar.utiles,
        beneficios_otorgados.fecha_otorgamiento,
        beneficios_otorgados.afiliado_id,
        beneficios_otorgados.familiar_id,
        familiares.name AS familiar_name,
        familiares.dni AS familiar_dni,
        familiares.tel AS familiar_tel,
        familiares.categoria AS familiar_categoria
      FROM
        beneficios_otorgados
      LEFT JOIN
        familiares ON beneficios_otorgados.familiar_id = familiares.idfamiliares
      LEFT JOIN
        afiliados ON beneficios_otorgados.afiliado_id = afiliados.idafiliados
      LEFT JOIN
        kit_escolar ON beneficios_otorgados.id = kit_escolar.beneficio_otorgado_id
      WHERE
        beneficios_otorgados.familiar_id IN (${familiarIds}) -- Cambiamos '=' por 'IN'
        AND beneficios_otorgados.tipo = 'Kit escolar'
        AND YEAR(beneficios_otorgados.fecha_otorgamiento) = YEAR(NOW()) -- Filtrar por año actual
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Error en el servidor" });
      }

      return res.status(200).json(results);
    });
  // });
};


export const otorgarBeneficio = (req, res) => {
  // // const token = req.cookies.access_token;
  // // if (!token) {
  // //   return res.status(401).json("No autenticado");
  // // }

  // jwt.verify(token, "jwtkey", (err, userInfo) => {
  //   if (err) {
  //     return res.status(403).json("Token no válido");
  //   }

    const beneficiosData = req.body;
    const beneficiosKeys = Object.keys(beneficiosData);

    db.beginTransaction(function (err) {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Error en el servidor" });
      }

      const insertedIds = [];

      function insertBeneficio(index) {
        if (index >= beneficiosKeys.length) {
          db.commit(function (err) {
            if (err) {
              db.rollback(function () {
                console.log(err);
                return res.status(500).json({ error: "Error en el servidor" });
              });
            }

            return res.status(200).json({
              ids: insertedIds,
              message: "Beneficios otorgados exitosamente",
            });
          });
          return;
        }

        const beneficioKey = beneficiosKeys[index];
        const beneficio = beneficiosData[beneficioKey];
        console.log(beneficio);

        const {
          tipo,
          afiliado_id,
          familiar_id,
          detalles,
          usuario_otorgante,
          estado,
        } = beneficio;

        const usuarioOtorgante = usuario_otorgante;
        const añoActual = new Date().getFullYear();
        // Comprobación para Kit Maternal
        if (tipo === "Kit maternal") {
          console.log(beneficio.fecha_de_parto);
          const fechaParto = new Date(beneficio.fecha_de_parto);
          console.log(fechaParto);

          const checkBeneficioQuery = `
    SELECT COUNT(*) AS count
    FROM
      beneficios_otorgados 
    WHERE
      afiliado_id = ?
      AND tipo = 'Kit maternal'
      AND YEAR(fecha_otorgamiento) = ?`;

          db.query(
            checkBeneficioQuery,
            [ beneficio.afiliado_id, añoActual],
            function (err, results) {
              if (err) {
                db.rollback(function () {
                  console.log(err);
                  return res
                    .status(500)
                    .json({ error: "Error en el servidor" });
                });
              }

              console.log(results);

              const count = results[0].count;

              if (count > 0) {
                return res.status(400).json({
                  error:
                    "No se puede otorgar el beneficio. Ya se otorgó uno en los últimos 12 meses.",
                });
              }

              // Si la comprobación pasa, proceder a insertar en beneficios_otorgados
              const beneficioOtorgado = {
                tipo,
                afiliado_id,
                familiar_id,
                detalles,
                usuario_otorgante: usuarioOtorgante,
                estado,
              };

              // Calcular la diferencia en meses entre la fecha actual y la fecha de parto
              const hoy = new Date();
              const diferenciaMeses =
                fechaParto.getMonth() -
                hoy.getMonth() +
                12 * (fechaParto.getFullYear() - hoy.getFullYear());

              // Si quedan 3 o menos meses para el parto, establecer plazo en "Urgente," de lo contrario, en "Normal"
              if (diferenciaMeses <= 3) {
                beneficioOtorgado.plazo = "Urgente";
              } else {
                beneficioOtorgado.plazo = "Normal";
              }

              const insertQuery = "INSERT INTO beneficios_otorgados SET ?";
              db.query(
                insertQuery,
                beneficioOtorgado,
                function (err, insertResult) {
                  if (err) {
                    db.rollback(function () {
                      console.log(err);
                      return res
                        .status(500)
                        .json({ error: "Error en el servidor" });
                    });
                  }

                  if (insertResult && insertResult.insertId) {
                    insertedIds.push(insertResult.insertId);

                    const kitMaternalInfo = {
                      beneficio_otorgado_id: insertResult.insertId,
                      semanas: beneficio.semanas,
                      cantidad: beneficio.cantidad,
                      fecha_de_parto: beneficio.fecha_de_parto,
                      certificado: beneficio.certificado,
                    };

                    const insertKitMaternalQuery =
                      "INSERT INTO kit_maternal SET ?";
                    db.query(
                      insertKitMaternalQuery,
                      kitMaternalInfo,
                      function (err) {
                        if (err) {
                          db.rollback(function () {
                            console.log(err);
                            return res
                              .status(500)
                              .json({ error: "Error en el servidor" });
                          });
                        }

                        insertBeneficio(index + 1);
                      }
                    );
                  } else {
                    db.rollback(function () {
                      return res
                        .status(500)
                        .json({ error: "Error en el servidor" });
                    });
                  }
                }
              );
            }
          );
        } else {
          // Si no es Kit Maternal, proceder a insertar en beneficios_otorgados
          const beneficioOtorgado = {
            tipo,
            afiliado_id,
            familiar_id,
            detalles,
            usuario_otorgante: usuarioOtorgante,
            estado,
          };

          const insertQuery = "INSERT INTO beneficios_otorgados SET ?";
          db.query(
            insertQuery,
            beneficioOtorgado,
            function (err, insertResult) {
              if (err) {
                db.rollback(function () {
                  console.log(err);
                  return res
                    .status(500)
                    .json({ error: "Error en el servidor" });
                });
              }

              if (insertResult && insertResult.insertId) {
                insertedIds.push(insertResult.insertId);

                // Insertar en la tabla específica de acuerdo al tipo de beneficio
                if (tipo === "Kit escolar") {
                  const kitEscolarInfo = {
                    beneficio_otorgado_id: insertResult.insertId,
                    mochila: beneficio.mochila,
                    guardapolvo: beneficio.guardapolvo,
                    guardapolvo_confirm: beneficio.guardapolvo_confirm,
                    utiles: beneficio.utiles,
                    año_escolar: beneficio.año_escolar,
                  };

                  const insertKitEscolarQuery = "INSERT INTO kit_escolar SET ?";
                  db.query(
                    insertKitEscolarQuery,
                    kitEscolarInfo,
                    function (err) {
                      if (err) {
                        db.rollback(function () {
                          console.log(err);
                          return res
                            .status(500)
                            .json({ error: "Error en el servidor" });
                        });
                      }

                      insertBeneficio(index + 1);
                    }
                  );
                } else if (tipo === "Luna de miel") {
                  const lunaDeMielInfo = {
                    beneficio_otorgado_id: insertResult.insertId,
                    numero_libreta: beneficio.numero_libreta,
                  };


                  const insertLunaDeMielQuery =
                    "INSERT INTO luna_de_miel SET ?";
                  db.query(
                    insertLunaDeMielQuery,
                    lunaDeMielInfo,
                    function (err) {
                      if (err) {
                        db.rollback(function () {
                          console.log(err);
                          return res
                            .status(500)
                            .json({ error: "Error en el servidor" });
                        });
                      }
                    });
                 


                  insertBeneficio(index + 1);
                } else {
                  db.rollback(function () {
                    return res
                      .status(400)
                      .json({ error: "Tipo de beneficio desconocido" });
                  });
                }
              } else {
                db.rollback(function () {
                  return res
                    .status(500)
                    .json({ error: "Error en el servidor" });
                });
              }
            }
          );
        }
      }

      insertBeneficio(0);
    });
  // });
};





export const getAll = (req, res) => {
  const q = req.query.cat
    ? "SELECT * FROM tickets WHERE cat=?"
    : "SELECT * FROM tickets";

  db.query(q, [req.query.cat], (err, data) => {
    if (err) return res.status(500).send(err);

    return res.status(200).json(data);
  });
};

export const getBeneficios = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = 
       "SELECT * FROM beneficios_otorgados"
    db.query(q, (err, data) => {
      if (err) return res.status(500).send(err);

      return res.status(200).json(data);
    });
  });
};
export const getPost = (req, res) => {
  const q =
    "SELECT p.id, `username`, `title`, `desc`,  `cat`,`date` FROM users u JOIN tickets p ON u.id = p.uid WHERE p.id = ? ";
// p.img, u.img AS userImg,
  db.query(q, [req.params.id], (err, data) => {
    if (err) return res.status(500).json(err);

    return res.status(200).json(data[0]);
  });
};

export const addPost = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q =
      "INSERT INTO tickets(`title`, `desc`, `cat`, `date`,`uid`) VALUES (?)";

    const values = [
      req.body.title,
      req.body.desc,      
      req.body.cat,
      req.body.date,
      userInfo.id,
    ];

    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.json("Post has been created.");
    });
  });
};

export const deletePost = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const postId = req.params.id;
    const q = "DELETE FROM tickets WHERE `id` = ? AND `uid` = ?";

    db.query(q, [postId, userInfo.id], (err, data) => {
      if (err) return res.status(403).json("You can delete only your post!");

      return res.json("Post has been deleted!");
    });
  });
};

export const updatePost = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const postId = req.params.id;
    const q =
      "UPDATE tickets SET `title`=?,`desc`=?,`cat`=? WHERE `id` = ? AND `uid` = ?";

    const values = [req.body.title, req.body.desc, req.body.cat];

    db.query(q, [...values, postId, userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.json("Post has been updated.");
    });
  });
};


