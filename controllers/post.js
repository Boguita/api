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

export const getLunaDeMiel = (req, res) =>
{
  const query = `
    SELECT
      beneficios_otorgados.id,
      beneficios_otorgados.tipo,
      beneficios_otorgados.detalles,
      beneficios_otorgados.estado,
      beneficios_otorgados.usuario_otorgante,
      beneficios_otorgados.constancia_img,
      luna_de_miel.numero_libreta,     
      beneficios_otorgados.fecha_otorgamiento,
      beneficios_otorgados.afiliado_id,
      beneficios_otorgados.familiar_id,
      familiares.name AS familiar_name,
      familiares.dni AS familiar_dni,
      familiares.tel AS familiar_tel,
      familiares.categoria AS familiar_categoria,
      familiares.libreta_img,
      afiliados.name AS afiliado_name,
      afiliados.dni AS afiliado_dni,
      afiliados.tel AS afiliado_tel,
      afiliados.correo AS afiliado_correo
    FROM
      beneficios_otorgados
    LEFT JOIN
      familiares ON beneficios_otorgados.familiar_id = familiares.idfamiliares
    LEFT JOIN
      afiliados ON beneficios_otorgados.afiliado_id = afiliados.idafiliados
    LEFT JOIN
      luna_de_miel ON beneficios_otorgados.id = luna_de_miel.beneficio_otorgado_id
    WHERE
      beneficios_otorgados.tipo = 'Luna de miel'
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error en el servidor" });
    }
    return res.status(200).json(results);
  });
};

export const getKitMaternal = (req, res) => {
  const query = `
    SELECT
      beneficios_otorgados.id,
      beneficios_otorgados.tipo,
      beneficios_otorgados.detalles,
      beneficios_otorgados.seccional,
      beneficios_otorgados.estado,
      beneficios_otorgados.usuario_otorgante,
      beneficios_otorgados.plazo,
      beneficios_otorgados.constancia_img,
      kit_maternal.semanas,
      kit_maternal.fecha_de_parto,
      kit_maternal.cantidad,
      kit_maternal.certificado,     
      beneficios_otorgados.fecha_otorgamiento,
      beneficios_otorgados.afiliado_id,
      beneficios_otorgados.familiar_id,
      familiares.name AS familiar_name,
      familiares.dni AS familiar_dni,
      familiares.tel AS familiar_tel,
      familiares.categoria AS familiar_categoria,
      familiares.libreta_img,
      afiliados.name AS afiliado_name,
      afiliados.dni AS afiliado_dni,
      afiliados.tel AS afiliado_tel,
      afiliados.correo AS afiliado_correo
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
    return res.status(200).json(results);
  });
};


export const getKitEscolar = (req, res) => {
  const query = `
    SELECT
      beneficios_otorgados.id,
      beneficios_otorgados.tipo,
      beneficios_otorgados.detalles,
      beneficios_otorgados.seccional,
      beneficios_otorgados.estado,
      beneficios_otorgados.usuario_otorgante,  
      beneficios_otorgados.constancia_img,
      kit_escolar.año_escolar,
      kit_escolar.utiles,
      kit_escolar.mochila,      
      kit_escolar.guardapolvo,
      kit_escolar.guardapolvo_confirm,     
      beneficios_otorgados.fecha_otorgamiento,
      beneficios_otorgados.afiliado_id,
      beneficios_otorgados.familiar_id,
      familiares.name AS familiar_name,
      familiares.dni AS familiar_dni,
      familiares.tel AS familiar_tel,
      familiares.categoria AS familiar_categoria,
      familiares.dni_img_frente,
      familiares.dni_img_dorso,
      afiliados.name AS afiliado_name,
      afiliados.dni AS afiliado_dni,
      afiliados.tel AS afiliado_tel,
      afiliados.correo AS afiliado_correo
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
    return res.status(200).json(results);
  });
};


export const comprobarBeneficioKitMaternal = (req, res) => {
  const familiarId = req.params.familiar_id;
 

  const query = `
    SELECT *
    FROM beneficios_otorgados
    WHERE familiar_id = ?
      AND tipo = 'Kit maternal'
      AND (estado = 'Pendiente' OR estado = 'Enviado')
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


export const createSeccional = (req, res) => {
  const { nombre, provincia, ciudad } = req.body;

  // Iniciar una transacción
  db.beginTransaction((err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error al iniciar la transacción" });
    }

    // Consulta para insertar la nueva seccional en seccionales
    const seccionalQuery = `
      INSERT INTO seccionales (nombre, provincia, ciudad)
      VALUES (?, ?, ?)
    `;

    // Consulta para establecer el stock inicial en 0 en kit_escolar_stock
    const escolarStockQuery = `
      INSERT INTO kit_escolar_stock (idStock, seccional)
      VALUES (LAST_INSERT_ID(), ?)
    `;

    // Consulta para establecer el stock inicial en 0 en kit_maternal_stock
    const maternalStockQuery = `
      INSERT INTO kit_maternal_stock (idStock, seccional)
      VALUES (LAST_INSERT_ID(), ?)
    `;

    // Ejecutar la consulta de la seccional
    db.query(seccionalQuery, [nombre, provincia, ciudad], (err, results) => {
      if (err) {
        // Si hay un error, hacer rollback de la transacción
        return db.rollback(() => {
          console.log(err);
          return res.status(500).json({ error: "Error al crear la seccional" });
        });
      }

      // Ejecutar la consulta para establecer el stock inicial en kit_escolar_stock
      db.query(escolarStockQuery, nombre, (err, stockResults) => {
        if (err) {
          // Si hay un error, hacer rollback de la transacción
          return db.rollback(() => {
            console.log(err);
            return res
              .status(500)
              .json({
                error:
                  "Error al actualizar el stock de la seccional (kit escolar)",
              });
          });
        }

        // Ejecutar la consulta para establecer el stock inicial en kit_maternal_stock
        db.query(maternalStockQuery, nombre, (err, stockResults) => {
          if (err) {
            // Si hay un error, hacer rollback de la transacción
            return db.rollback(() => {
              console.log(err);
              return res
                .status(500)
                .json({
                  error:
                    "Error al actualizar el stock de la seccional (kit maternal)",
                });
            });
          }

          // Si todas las consultas son exitosas, hacer commit de la transacción
          db.commit((err) => {
            if (err) {
              // Si hay un error, hacer rollback de la transacción
              return db.rollback(() => {
                console.log(err);
                return res
                  .status(500)
                  .json({ error: "Error al completar la transacción" });
              });
            }

            // Enviar respuesta exitosa si la transacción se completa con éxito
            return res
              .status(200)
              .json({
                message:
                  "Seccional creada y stock inicializado en kit_escolar_stock y kit_maternal_stock",
              });
          });
        });
      });
    });
  });
};



export const deleteSeccional = (req,res) => {
  const { id } = req.params;

  const query = `
    DELETE FROM seccionales
    WHERE idseccionales = ?
  `;
  db.query(query, [id], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error al eliminar la seccional" });
    }

    return res.status(200).json({ message: "Seccional eliminada" });
  });
}

export const getSeccionales = (req, res) => {

  const query = `
    SELECT *
    FROM
    seccionales 
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error al obtener seccionales" });
    }

    return res.status(200).json(results);
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

export const comprobarStockMaternal = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("No autenticado");
  jwt.verify(token, "jwtkey", (err, userInfo) => {
     if (err) {
       return res.status(403).json("Token no válido");
     }
    // const { seccional, cantidad } = req.body;
    const seccional = req.params.seccional;

    console.log(seccional)

     const query = `
      SELECT seccionales.*, kit_maternal_stock.*
      FROM seccionales
      LEFT JOIN kit_maternal_stock ON seccionales.idseccionales = kit_maternal_stock.idStock
      WHERE seccionales.idseccionales = ?
    `;

    db.query(query, [seccional], (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Error en el servidor" });
      }

      const stockMaternal = results[0];

      if (stockMaternal <= 0) {
        return res.status(200).json({ stock: 0 });
      }

      return res.status(200).json({ stockMaternal });


    });
  });
}

export const stockMaternalProvincia = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("No autenticado");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) {
      return res.status(403).json("Token no válido");
    }
    const provincia = req.params.provincia; // Obtener el nombre de la provincia desde los parámetros

    const query = `
      SELECT kit_maternal_stock.*
      FROM kit_maternal_stock
      INNER JOIN seccionales ON kit_maternal_stock.idStock = seccionales.idseccionales
      WHERE seccionales.provincia = ?
    `;

    db.query(query, [provincia], (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Error en el servidor" });
      }

      const stocks = results;
      if (!stocks || stocks.length === 0) {
        return res.status(404).json({
          error:
            "No se encontraron registros de stock para la provincia especificada",
        });
      }

      // Calcular sumas de cada tipo de stock
      const sumas = {
        cantidad: 0,    
      };

      stocks.forEach((stock) => {
        Object.keys(sumas).forEach((key) => {
          if (stock[key]) {
            sumas[key] += stock[key];
          }
        });
      });

      return res.status(200).json({ sumas });
    });
  });
};

export const comprobarStockEscolar = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("No autenticado");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) {
      return res.status(403).json("Token no válido");
    }

    const seccionalId = req.params.seccional; // Obtener el ID de la seccional desde los parámetros

    const query = `
      SELECT seccionales.*, kit_escolar_stock.*
      FROM seccionales
      LEFT JOIN kit_escolar_stock ON seccionales.idseccionales = kit_escolar_stock.idStock
      WHERE seccionales.idseccionales = ?
    `;

    db.query(query, [seccionalId], (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Error en el servidor" });
      }

      const seccional = results[0]; // Suponiendo que solo esperas un resultado, toma el primer elemento del array

      if (!seccional) {
        return res.status(404).json({ error: "Seccional no encontrada" });
      }

      return res.status(200).json({ seccional });
    });
  });
};

export const stockEscolarProvincia = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("No autenticado");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) {
      return res.status(403).json("Token no válido");
    }
    const provincia = req.params.provincia; // Obtener el nombre de la provincia desde los parámetros

    const query = `
      SELECT kit_escolar_stock.*
      FROM kit_escolar_stock
      INNER JOIN seccionales ON kit_escolar_stock.idStock = seccionales.idseccionales
      WHERE seccionales.provincia = ?
    `;

    db.query(query, [provincia], (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Error en el servidor" });
      }

      const stocks = results;
      if (!stocks || stocks.length === 0) {
        return res
          .status(404)
          .json({
            error:
              "No se encontraron registros de stock para la provincia especificada",
          });
      }

      // Calcular sumas de cada tipo de stock
      const sumas = {       
        mochila: 0,
        utiles: 0,
        talle6: 0,
        talle8: 0,
        talle10: 0,
        talle12: 0,
        talle14: 0,
        talle16: 0,
        talle18: 0,
      };

      stocks.forEach((stock) => {
        Object.keys(sumas).forEach((key) => {
          if (stock[key]) {
            sumas[key] += stock[key];
          }
        });
      });

      return res.status(200).json({ sumas });
    });
  });
};

export const editStockMaternal = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("No autenticado");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) {
      return res.status(403).json("Token no válido");
    }

    // Obtiene los IDs de seccionales del parámetro de la ruta
    const idseccionales = req.params.seccionales
      .split(",")
      .map((id) => parseInt(id.trim()));

      console.log("esta es la id",idseccionales)

    const { funcion, cantidad } = req.body;

    console.log(cantidad, funcion)

    if(funcion === "sumar"){
      const query = `
      UPDATE kit_maternal_stock
      SET cantidad = COALESCE(cantidad, 0) + ?
      WHERE idStock IN (?)
    `;
    db.query(query, [cantidad, [...idseccionales]], (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Error al actualizar el stock" });
      }
      console.log(results);
      return res.status(200).json({ message: "Stock actualizado" });
    });
  } else if(funcion === "restar"){
    const query = `
      UPDATE kit_maternal_stock
      SET cantidad = COALESCE(cantidad, 0) - ?
      WHERE idStock IN (?)
    `;
    db.query(query, [cantidad, [...idseccionales]], (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Error al actualizar el stock" });
      }
      console.log(results);
      return res.status(200).json({ message: "Stock actualizado" });
    });
  }
  });
};





export const editStockEscolar = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("No autenticado");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) {
      return res.status(403).json("Token no válido");
    }

    // Obtiene los IDs de seccionales del parámetro de la ruta
    const idseccionales = req.params.seccionales
      .split(",")
      .map((id) => parseInt(id.trim()));

    const { guardapolvo, talles, utiles, mochila, funcion } = req.body;
    const guardapolvoNum = parseFloat(guardapolvo);
    const utilesNum = parseFloat(utiles);
    const mochilaNum = parseFloat(mochila);

   

    if(funcion === "sumar"){
       let talleColumns = talles
         .reduce((acc, talle) => {
           acc.push(`${talle} = COALESCE(${talle}, 0) + ?`);
           return acc;
         }, [])
         .join(", ");

       let talleValues = talles.map(() => guardapolvoNum);
       talleValues.push(utilesNum, mochilaNum);

       console.log("ID Seccionales:", idseccionales);
       console.log("Talle Columns:", talleColumns);
       console.log("Talle Values:", talleValues);
    const query = `
      UPDATE kit_escolar_stock
      SET ${talleColumns}, utiles = COALESCE(utiles, 0) + ?, mochila = COALESCE(mochila, 0) + ?
      WHERE idStock IN (?)
    `;

    db.query(query, [...talleValues, ...idseccionales], (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Error al actualizar el stock" });
      }
      console.log(results);
      return res.status(200).json({ message: "Stock actualizado" });
    });
  }  else if(funcion === "restar"){
     let talleColumns = talles
       .reduce((acc, talle) => {
         acc.push(`${talle} = COALESCE(${talle}, 0) - ?`);
         return acc;
       }, [])
       .join(", ");

     let talleValues = talles.map(() => guardapolvoNum);
     talleValues.push(utilesNum, mochilaNum);

     console.log("ID Seccionales:", idseccionales);
     console.log("Talle Columns:", talleColumns);
     console.log("Talle Values:", talleValues);
    const query = `
      UPDATE kit_escolar_stock
      SET ${talleColumns}, utiles = COALESCE(utiles, 0) - ?, mochila = COALESCE(mochila, 0) - ?
      WHERE idStock IN (?)
    `;

    db.query(query, [...talleValues, ...idseccionales], (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Error al actualizar el stock" });
      }
      console.log(results);
      return res.status(200).json({ message: "Stock actualizado" });
    });
  }
  });
  };

  export const editStockEscolarIndividual = (req, res) => {
    const token = req.cookies.access_token;
    if (!token) return res.status(401).json("No autenticado");

    jwt.verify(token, "jwtkey", (err, userInfo) => {
      if (err) {
        return res.status(403).json("Token no válido");
      }

      const idseccionales = req.params.seccionales
        .split(",")
        .map((id) => parseInt(id.trim()));
      const { talles, utiles, mochila } = req.body;
      const utilesNum = parseFloat(utiles);
      const mochilaNum = parseFloat(mochila);

      // Construye la consulta SQL para actualizar los talles de guardapolvo individualmente
      let talleColumns = talles
        .reduce((acc, talle) => {
          // Agrupa los talles y cuenta cuántas veces aparece en el array, luego resta esa cantidad del stock
          const count = talles.filter((t) => t === talle).length;
          acc.push(`${talle} = COALESCE(${talle}, 0) - ${count}`);
          return acc;
        }, [])
        .join(", ");

      const query = `
      UPDATE kit_escolar_stock
      SET ${talleColumns.length > 0 ? talleColumns + "," : ""} utiles = COALESCE(utiles, 0) - ?,
      mochila = COALESCE(mochila, 0) - ?
      WHERE idStock IN (?)
    `;

      db.query(
        query,
        [utilesNum, mochilaNum, ...idseccionales],
        (err, results) => {
          if (err) {
            console.log(err);
            return res
              .status(500)
              .json({ error: "Error al actualizar el stock" });
          }
          console.log(results);
          return res.status(200).json({ message: "Stock actualizado" });
        }
      );
    });
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
                    res.status(500).json({ error: "Error en el servidor" });
                  });
                } else {
                  res.status(200).json({
                    ids: insertedIds,
                    message: "Beneficios otorgados exitosamente",
                  });
                }
              });
              return;
            }

            const beneficioKey = beneficiosKeys[index];
            console.log("beneficiosData completo:", beneficiosData);
            const beneficio = beneficiosData[beneficioKey];
            console.log("Beneficio completo", beneficio);

            const {
              usuario_otorgante,
              seccional_id,
              tipo,
              afiliado_id,
              familiar_id,
              detalles,
              seccional,
              estado,
            } = beneficio;

            const usuarioOtorgante = usuario_otorgante;
            const añoActual = new Date().getFullYear();
            // Comprobación para Kit Maternal
            if (tipo === "Kit maternal") {
              const fechaParto = new Date(beneficio.fecha_de_parto);

              const checkBeneficioQuery = `
    SELECT COUNT(*) AS count
    FROM
      beneficios_otorgados 
    WHERE
      afiliado_id = ?
      AND tipo = 'Kit maternal'
      AND estado = 'Entregado'
      AND YEAR(fecha_otorgamiento) = ?`;

              db.query(
                checkBeneficioQuery,
                [beneficio.afiliado_id, añoActual],
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
                    seccional,
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
                seccional,
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

                      const insertKitEscolarQuery =
                        "INSERT INTO kit_escolar SET ?";
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
                        }
                      );

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
