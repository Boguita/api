import { db } from "../db.js";
import jwt from "jsonwebtoken";
import excel from "exceljs";

export const getBeneficiosByDni = (req, res) => {
  const dni = req.params.dni;
  console.log(dni);
  const query = `
    SELECT
      beneficios_otorgados.id,
      beneficios_otorgados.tipo,
      beneficios_otorgados.detalles,
      beneficios_otorgados.estado,
      beneficios_otorgados.constancia_img,
      beneficios_otorgados.fecha_entrega,
      kit_escolar.mochila,
      kit_escolar.guardapolvo,
      kit_escolar.utiles,
      kit_maternal.cantidad,      
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



export const getStockEscolarExcel = (req, res) => {
  const query = `
    SELECT *
    FROM kit_escolar_stock
    INNER JOIN seccionales ON kit_escolar_stock.idStock = seccionales.idseccionales
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error en el servidor"});
    }

    // Crear un nuevo libro de Excel
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet("Stock Escolar");

    // Definir las columnas en el archivo Excel con estilo
    const headerRow = worksheet.addRow([
      "ID",
      "Provincia",
      "Delegación",
      "Seccional",
      "Dirección",
      "Mochila",
      "T.6",
      "T.8",
      "T.10",
      "T.12",
      "T.14",
      "T.16",
      "T.18",
      "ÚT.J",
      "ÚT.P",
      "ÚT.S",      
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
        index === 8 ||
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
        row.idStock,
        row.provincia,
        row.delegacion,
        row.nombre,
        row.direccion,
        row.mochila,
        row.talle6,
        row.talle8,
        row.talle10,
        row.talle12,
        row.talle14,
        row.talle16,
        row.talle18,
        row.utiles_Jardín,
        row.utiles_Primario,
        row.utiles_Secundario,
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

      if (
        index === 1 ||
        index === 2 ||
        index === 3 ||
        index === 4 ||
        index === 5 ||
        index === 6 ||
        index === 7 ||
        index === 8 ||
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

    // Configurar la respuesta HTTP para descargar el archivo Excel
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=stock_escolar.xlsx"
    );

    // Enviar el archivo Excel como respuesta
    workbook.xlsx.write(res).then(() => {
      res.end();
    });
  });
};



export const getSeccionalesExcel = (req, res) => {
  const query = `
    SELECT
      seccionales.idseccionales,
      seccionales.nombre,
      seccionales.provincia,
      seccionales.delegacion,
      seccionales.direccion
    FROM
      seccionales
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error en el servidor"});
    }

    // Crear un nuevo libro de Excel
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet("Seccionales");

    // Definir las columnas en el archivo Excel con estilo
    const headerRow = worksheet.addRow([
      "ID",
      "Nombre",
      "Provincia",
      "Delegación",
      "Dirección",
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

      if (index === 1 || index === 2 || index === 3 || index === 4) {
        // Cambia 0 y 2 a los índices de las columnas que deseas ajustar
        worksheet.getColumn(index + 1).width = 20; // Cambia 20 al ancho deseado
      } // Cambia 10 al ancho deseado
    });

    // Agregar los datos a las filas del archivo Excel con estilo
    results.forEach((row) => {
      worksheet.addRow([
        row.idseccionales,
        row.nombre,
        row.provincia,
        row.delegacion,
        row.direccion,
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

      if (index === 1 || index === 2 || index === 3 || index === 4) {
        // Cambia 0 y 2 a los índices de las columnas que deseas ajustar
        worksheet.getColumn(index + 1).width = 20; // Cambia 20 al ancho deseado
      } // Cambia 10 al ancho deseado
    });

    // Configurar la respuesta HTTP para descargar el archivo Excel
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=seccionales.xlsx"
    );

    // Enviar el archivo Excel como respuesta
    workbook.xlsx.write(res).then(() => {
      res.end();
    });
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



export const getKitMaternalExcelIds = (req, res) => {
  //PUEDO HACER QUE SI REQ.PARAMS ALL ES IGUAL A TRUE ME DESCARGUE TODAS LAS IDS Y NO PASARLAS DESDE EL FRONT

  const { ids } = req.params; // Suponiendo que userIds es una lista de IDs separada por algún carácter, como una coma (ej. "1,2,3")
  console.log(ids);
  const idsArray = ids.split(",").map(Number); // Convertir la cadena de IDs en un array de números

  const query = `
    SELECT
      beneficios_otorgados.id,
      beneficios_otorgados.tipo,
      beneficios_otorgados.detalles,
      beneficios_otorgados.provincia,
      beneficios_otorgados.delegacion,
      beneficios_otorgados.seccional,
      beneficios_otorgados.direccion,
      beneficios_otorgados.estado,
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
      beneficios_otorgados.id IN (?)
  `;

  db.query(query, [idsArray], (err, results) => {

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
      "Afiliado",
      "DNI Afiliado",      
      "Nombre del Familiar",
      "DNI del Familiar",
      "Teléfono del Familiar",
      "Categoría del Familiar",
      "Semanas Gest.",
      "Fecha de Parto",
      "Cantidad Hijos",
      "Certificado",
      "Provincia",
      "Delegación",
      "Seccional",
      "Dirección Seccional",
      "Fecha de Solicitud",
      "Estado",
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
        index === 8 ||
        index === 9 ||
        index === 10 ||
        index === 11 ||
        index === 12 ||
        index === 13 ||
        index === 14 ||
        index === 15 ||
        index === 16 ||
        index === 17 ||
        index === 18
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
        row.afiliado_name,
        row.afiliado_dni,
        row.familiar_name,
        row.familiar_dni,
        row.familiar_tel,
        row.familiar_categoria,
        row.semanas,
        row.fecha_de_parto,
        row.cantidad,
        "https://back.beneficiosuatre.com.ar/" + row.certificado,
        row.provincia,
        row.delegacion,
        row.seccional,
        row.direccion,
        row.fecha_otorgamiento,
        row.estado,
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
    }
      
      );

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
    }

    );
  }
  );
}





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
      beneficios_otorgados.direccion,
      beneficios_otorgados.seccional,
      beneficios_otorgados.delegacion,
      beneficios_otorgados.provincia,
      beneficios_otorgados.estado,
      beneficios_otorgados.usuario_otorgante,
      beneficios_otorgados.plazo,
      beneficios_otorgados.constancia_img,
      beneficios_otorgados.fecha_envio,
      beneficios_otorgados.fecha_entrega,
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
      beneficios_otorgados.delegacion,
      beneficios_otorgados.provincia,
      beneficios_otorgados.direccion,
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

export const deleteBeneficio = (req, res) => {
  const { beneficio_id } = req.params;

  const query = `
    DELETE FROM beneficios_otorgados
    WHERE id = ?
  `;
  db.query(query, [beneficio_id], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error al eliminar el beneficio" });
    }

    return res.status(200).json({ message: "Beneficio eliminado" });
  }
  );
};



export const updateEstadoBeneficio = (req, res) => {
  const beneficioId = req.params.beneficio_id;
  const estado = req.body.estado;
  const fechaEnvio = req.body.fecha_envio;
  const fechaEntrega = req.body.fecha_entrega;
  

  const query = `
    UPDATE beneficios_otorgados
    SET estado = ?, fecha_envio = IFNULL(?, fecha_envio), fecha_entrega = IFNULL(?, fecha_entrega)
    WHERE id = ?
  `;
  db.query(query, [estado, fechaEnvio, fechaEntrega, beneficioId], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    return res.status(200).json({ message: "Estado actualizado", ids: [beneficioId] });
  });
};


export const createSeccional = (req, res) => {
  const { nombre, provincia, delegacion, direccion} = req.body;

  // Iniciar una transacción
  db.beginTransaction((err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error al iniciar la transacción" });
    }

    // Consulta para insertar la nueva seccional en seccionales
    const seccionalQuery = `
      INSERT INTO seccionales (nombre, provincia, delegacion, direccion)
      VALUES (?, ?, ?, ?)
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
    db.query(seccionalQuery, [nombre, provincia, delegacion, direccion], (err, results) => {
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

export const editSeccional = (req, res) => {
  const { id } = req.params;
  const { nombre, provincia, delegacion, direccion } = req.body;

  // Verifica si los campos del cuerpo de la solicitud no están vacíos antes de realizar la actualización
  if (
    nombre === "" &&
    provincia === "" &&
    delegacion === "" &&
    direccion === ""
  ) {
    return res
      .status(400)
      .json({ error: "No se proporcionaron datos para la actualización" });
  }

  // Construye la parte SET de la consulta SQL basada en los campos proporcionados en el cuerpo de la solicitud
  const setClause = Object.entries({ nombre, provincia, delegacion, direccion })
    .filter(([key, value]) => value !== "")
    .map(([key, value]) => `${key} = ?`)
    .join(", ");

  // Construye la consulta SQL completa
  const query = `
    UPDATE seccionales
    SET ${setClause}
    WHERE idseccionales = ?
  `;

  // Crea un array con los valores que se deben actualizar
  const values = Object.values({
    nombre,
    provincia,
    delegacion,
    direccion,
  }).filter((value) => value !== "");
  values.push(id);

  db.query(query, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error al editar la seccional" });
    }

    return res.status(200).json({ message: "Seccional editada" });
  });
};



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
        beneficios_otorgados.estado,
        beneficios_otorgados.plazo,
        beneficios_otorgados.usuario_otorgante,
        beneficios_otorgados.constancia_img,
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

export const getStockEscolar = (req, res) => {
  const query = `
    SELECT *
    FROM kit_escolar_stock
    INNER JOIN seccionales ON kit_escolar_stock.idStock = seccionales.idseccionales
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ error: "Error al obtener el stock de kit escolar" });
    }

    return res.status(200).json(results);
  });
};

export const getStockEscolarEnviado = (req, res) => {
  const query = `
    SELECT *
    FROM enviados
    INNER JOIN seccionales ON enviados.idseccionales = seccionales.idseccionales
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ error: "Error al obtener el stock de kit escolar" });
    }

    return res.status(200).json(results);
  });
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

      const idseccionales = req.params.seccionales
        .split(",")
        .map((id) => parseInt(id.trim()));

      const {
        guardapolvo,
        talle6,
        talle8,
        talle10,
        talle12,
        talle14,
        talle16,
        talle18,
        utiles_Jardín,
        utiles_Primario,
        utiles_Secundario,
        mochila,
        funcion,
      } = req.body;
      const guardapolvoNum = parseFloat(guardapolvo);
      const utilesJardinNum = parseFloat(utiles_Jardín);
      const utilesPrimarioNum = parseFloat(utiles_Primario);
      const utilesSecundarioNum = parseFloat(utiles_Secundario);
      const mochilaNum = parseFloat(mochila);

      if (funcion === "sumar") {
        const idPlaceholders = idseccionales.map(() => "?").join(",");
        const query = `
        UPDATE kit_escolar_stock
        SET talle6 = COALESCE(talle6, 0) + ?,
            talle8 = COALESCE(talle8, 0) + ?,
            talle10 = COALESCE(talle10, 0) + ?,
            talle12 = COALESCE(talle12, 0) + ?,
            talle14 = COALESCE(talle14, 0) + ?,
            talle16 = COALESCE(talle16, 0) + ?,
            talle18 = COALESCE(talle18, 0) + ?,
            utiles_Jardín = COALESCE(utiles_Jardín, 0) + ?, 
            utiles_Primario = COALESCE(utiles_Primario, 0) + ?,
            utiles_Secundario = COALESCE(utiles_Secundario, 0) + ?,
            mochila = COALESCE(mochila, 0) + ?
        WHERE idStock IN (${idPlaceholders})
      `;

        db.query(
          query,
          [
            talle6,
            talle8,
            talle10,
            talle12,
            talle14,
            talle16,
            talle18,
            utilesJardinNum,
            utilesPrimarioNum,
            utilesSecundarioNum,
            mochilaNum,
            ...idseccionales,
          ],
          (err, results) => {
            if (err) {
              console.log(err);
              return res
                .status(500)
                .json({ error: "Error al actualizar el stock" });
            }

            // Iterar sobre todas las IDs de seccionales y realizar la inserción en la tabla "enviados"
            idseccionales.forEach((idseccional) => {
              const envioQuery = `
              INSERT INTO enviados (idseccionales, mochila, utiles_Jardín, utiles_Primario, utiles_Secundario,  
                talle6, talle8, talle10, talle12, talle14, talle16, talle18)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

              const envioValues = [
                idseccional,
                mochilaNum,
                utilesJardinNum,
                utilesPrimarioNum,
                utilesSecundarioNum,
                talle6,
                talle8,
                talle10,
                talle12,
                talle14,
                talle16,
                talle18,
              ];

              db.query(envioQuery, envioValues, (envioErr, envioResults) => {
                if (envioErr) {
                  console.log(envioErr);
                  return res
                    .status(500)
                    .json({ error: "Error al registrar el envío" });
                }
                console.log(envioResults);
              });
            });

            // Enviar respuesta después de completar todas las inserciones
            
          }
        )
      } else if (funcion === "restar") {
        const idPlaceholders = idseccionales.map(() => "?").join(",");
        const query = `
        UPDATE kit_escolar_stock
        SET talle6 = COALESCE(talle6, 0) - ?,
            talle8 = COALESCE(talle8, 0) - ?,
            talle10 = COALESCE(talle10, 0) - ?,
            talle12 = COALESCE(talle12, 0) - ?,
            talle14 = COALESCE(talle14, 0) - ?,
            talle16 = COALESCE(talle16, 0) - ?,
            talle18 = COALESCE(talle18, 0) - ?,
            utiles_Jardín = COALESCE(utiles_Jardín, 0) - ?, 
            utiles_Primario = COALESCE(utiles_Primario, 0) - ?,
            utiles_Secundario = COALESCE(utiles_Secundario, 0) - ?,
            mochila = COALESCE(mochila, 0) - ?
        WHERE idStock IN (${idPlaceholders})
      `;

        db.query(
          query,
          [
            talle6,
            talle8,
            talle10,
            talle12,
            talle14,
            talle16,
            talle18,
            utilesJardinNum,
            utilesPrimarioNum,
            utilesSecundarioNum,
            mochilaNum,
            ...idseccionales,
          ],
          (err, results) => {
            if (err) {
              console.log(err);
              return res
                .status(500)
                .json({ error: "Error al actualizar el stock" });
            }
         

            // Enviar respuesta después de completar todas las inserciones
           
          }
        );
        };
         return res
           .status(200)
           .json({ message: "Stock actualizado y envíos registrados" });
      }
    )};







  

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

        let utilesColumns = utiles.reduce((acc, util) => {
          // Agrupa los utiles y cuenta cuántas veces aparece en el array, luego resta esa cantidad del stock
          const count = utiles.filter((u) => u === util).length;
          acc.push(`${util} = COALESCE(${util}, 0) - ${count}`);
          return acc;
        } , [])
        .join(", ");

      const query = `
      UPDATE kit_escolar_stock
      SET ${talleColumns.length > 0 ? talleColumns + "," : ""} 
      ${utilesColumns.length > 0 ? utilesColumns + "," : ""} 
      mochila = COALESCE(mochila, 0) - ?
      WHERE idStock IN (?)
    `;

      db.query(
        query,
        [mochilaNum, ...idseccionales],
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








function sendSuccessResponse(res, insertedIds) {
  res.status(200).json({
    ids: insertedIds,
    message: "Beneficios otorgados exitosamente",
  });
}

function sendError(res, errorMessage) {
  console.error(errorMessage);
  res.status(500).json({ error: errorMessage });
}

function rollbackAndSendError(res, errorMessage) {
  db.rollback(() => {
    sendError(res, errorMessage);
  });
}


// ESTE CAMBIO SE PODRIA PROBAR
// export const otorgarBeneficio = (req, res) => {
//   const token = req.cookies.access_token;
//   if (!token) {
//     return res.status(401).json("No autenticado");
//   }

//   jwt.verify(token, "jwtkey", (err, userInfo) => {
//     if (err) {
//       return res.status(403).json("Token no válido");
//     }

//     const beneficiosData = req.body;
//     const beneficiosKeys = Object.keys(beneficiosData);

//     db.beginTransaction((err) => {
//       if (err) {
//         console.log(err);
//         return sendError(res, "Error en el servidor");
//       }
//       const insertedIds = [];

//       function insertBeneficio(index) {
//         if (index >= beneficiosKeys.length) {
//           db.commit((err) => {
//             if (err) {
//               rollbackAndSendError(res, "Error en el servidor");
//             } else {
//               sendSuccessResponse(res, insertedIds);
//             }
//           });
//           return;
//         }

//         const beneficioKey = beneficiosKeys[index];
//         console.log("beneficiosData completo:", beneficiosData);
//         const beneficio = beneficiosData[beneficioKey];
//         console.log("Beneficio completo", beneficio);

//         const {
//           usuario_otorgante,
//           seccional_id,
//           tipo,
//           afiliado_id,
//           familiar_id,
//           detalles,
//           provincia,
//           seccional,
//           delegacion,
//           direccion,
//           estado,
//         } = beneficio;

//         const usuarioOtorgante = usuario_otorgante;
//         const añoActual = new Date().getFullYear();
//         // Comprobación para Kit Maternal
//         if (tipo === "Kit maternal") {
//           const checkBeneficioQuery = `
//           SELECT COUNT(*) AS count
//           FROM
//             beneficios_otorgados 
//           WHERE
//             afiliado_id = ?
//             AND tipo = 'Kit maternal'
//             AND estado = 'Entregado'
//             AND YEAR(fecha_otorgamiento) = ?`;

//           db.query(
//             checkBeneficioQuery,
//             [beneficio.afiliado_id, añoActual],
//             function (err, results) {
//               if (err) {
//                 db.rollback(function () {
//                   console.log(err);
//                   return res
//                     .status(500)
//                     .json({ error: "Error en el servidor" });
//                 });
//               }

//               console.log(results);

//               const count = results[0].count;

//               if (count > 0) {
//                 return res.status(400).json({
//                   error:
//                     "No se puede otorgar el beneficio. Ya se otorgó uno en los últimos 12 meses.",
//                 });
//               }

//               // Si la comprobación pasa, proceder a insertar en beneficios_otorgados
//               const beneficioOtorgado = {
//                 tipo,
//                 afiliado_id,
//                 familiar_id,
//                 detalles,
//                 provincia,
//                 seccional,
//                 delegacion,
//                 direccion,
//                 usuario_otorgante: usuarioOtorgante,
//                 estado,
//               };

//               const insertQuery = "INSERT INTO beneficios_otorgados SET ?";
//               db.query(
//                 insertQuery,
//                 beneficioOtorgado,
//                 function (err, insertResult) {
//                   if (err) {
//                     db.rollback(function () {
//                       console.log(err);
//                       return res
//                         .status(500)
//                         .json({ error: "Error en el servidor" });
//                     });
//                   }

//                   if (insertResult && insertResult.insertId) {
//                     insertedIds.push(insertResult.insertId);

//                     const kitMaternalInfo = {
//                       beneficio_otorgado_id: insertResult.insertId,
//                       semanas: beneficio.semanas,
//                       cantidad: beneficio.cantidad,
//                       fecha_de_parto: beneficio.fecha_de_parto,
//                       certificado: beneficio.certificado,
//                     };

//                     const insertKitMaternalQuery =
//                       "INSERT INTO kit_maternal SET ?";
//                     db.query(
//                       insertKitMaternalQuery,
//                       kitMaternalInfo,
//                       function (err) {
//                         if (err) {
//                           db.rollback(function () {
//                             console.log(err);
//                             return res
//                               .status(500)
//                               .json({ error: "Error en el servidor" });
//                           });
//                         }

//                         return insertBeneficio(index + 1);
//                       }
//                     );
//                   } else {
//                     db.rollback(function () {
//                       return res
//                         .status(500)
//                         .json({ error: "Error en el servidor" });
//                     });
//                   }
//                 }
//               );
//             }
//           );
//         } else {
//           // Si no es Kit Maternal, proceder a insertar en beneficios_otorgados
//           const beneficioOtorgado = {
//             tipo,
//             afiliado_id,
//             familiar_id,
//             detalles,
//             provincia,
//             seccional,
//             delegacion,
//             direccion,
//             usuario_otorgante: usuarioOtorgante,
//             estado,
//           };

//           const insertQuery = "INSERT INTO beneficios_otorgados SET ?";
//           db.query(
//             insertQuery,
//             beneficioOtorgado,
//             function (err, insertResult) {
//               if (err) {
//                 db.rollback(function () {
//                   console.log(err);
//                   return res
//                     .status(500)
//                     .json({ error: "Error en el servidor" });
//                 });
//               }

//               if (insertResult && insertResult.insertId) {
//                 insertedIds.push(insertResult.insertId);

//                 // Insertar en la tabla específica de acuerdo al tipo de beneficio
//                 if (tipo === "Kit escolar") {
//                   const kitEscolarInfo = {
//                     beneficio_otorgado_id: insertResult.insertId,
//                     mochila: beneficio.mochila,
//                     guardapolvo: beneficio.guardapolvo,
//                     guardapolvo_confirm: beneficio.guardapolvo_confirm,
//                     utiles: beneficio.utiles,
//                     año_escolar: beneficio.año_escolar,
//                   };

//                   const insertKitEscolarQuery = "INSERT INTO kit_escolar SET ?";
//                   db.query(
//                     insertKitEscolarQuery,
//                     kitEscolarInfo,
//                     function (err) {
//                       if (err) {
//                         db.rollback(function () {
//                           console.log(err);
//                           return res
//                             .status(500)
//                             .json({ error: "Error en el servidor" });
//                         });
//                       }

//                       return insertBeneficio(index + 1);
//                     }
//                   );
//                 } else if (tipo === "Luna de miel") {
//                   const lunaDeMielInfo = {
//                     beneficio_otorgado_id: insertResult.insertId,
//                     numero_libreta: beneficio.numero_libreta,
//                   };

//                   const insertLunaDeMielQuery =
//                     "INSERT INTO luna_de_miel SET ?";
//                   db.query(
//                     insertLunaDeMielQuery,
//                     lunaDeMielInfo,
//                     function (err) {
//                       if (err) {
//                         db.rollback(function () {
//                           console.log(err);
//                           return res
//                             .status(500)
//                             .json({ error: "Error en el servidor" });
//                         });
//                       }

//                       return insertBeneficio(index + 1);
//                     }
//                   );
//                 } else {
//                   db.rollback(function () {
//                     return res
//                       .status(400)
//                       .json({ error: "Tipo de beneficio desconocido" });
//                   });
//                 }
//               } else {
//                 db.rollback(function () {
//                   return res
//                     .status(500)
//                     .json({ error: "Error en el servidor" });
//                 });
//               }
//             }
//           );
//         }
//       }

//       return insertBeneficio(0);
//     });
//   });
// };

export const otorgarBeneficio = (req, res) => {
  // const token = req.cookies.access_token;
  // if (!token) {
  //   return res.status(401).json("No autenticado");
  // }

  // jwt.verify(token, "jwtkey", (err, userInfo) => {
  //   if (err) {
  //     return res.status(403).json("Token no válido");
  //   }

    const beneficiosData = req.body;
    const beneficiosKeys = Object.keys(beneficiosData);

  db.beginTransaction((err) => {
    if (err) {
      console.log(err);
      return sendError(res, "Error en el servidor");
    }
    const insertedIds = [];

    function insertBeneficio(index) {
      if (index >= beneficiosKeys.length) {
        db.commit((err) => {
          if (err) {
            rollbackAndSendError(res, "Error en el servidor");
          } else {
            sendSuccessResponse(res, insertedIds);
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
        usuario_otorgante_id,
        seccional_id,
        tipo,
        afiliado_id,
        familiar_id,
        detalles,
        provincia,
        seccional,
        delegacion,
        direccion,
        estado,
      } = beneficio;

      const usuarioOtorgante = usuario_otorgante;
      const usuarioOtorganteId = usuario_otorgante_id;
      const añoActual = new Date().getFullYear();
      // Comprobación para Kit Maternal
      if (tipo === "Kit maternal") {
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
                return res.status(500).json({ error: "Error en el servidor" });
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
              provincia,
              seccional,
              delegacion,
              direccion,
              usuario_otorgante: usuarioOtorgante,
              usuario_otorgante_id: usuarioOtorganteId,
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

                      return insertBeneficio(index + 1);
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
          provincia,
          seccional,
          delegacion,
          direccion,
          usuario_otorgante: usuarioOtorgante,
          usuario_otorgante_id: usuarioOtorganteId,
          estado,
        };

        const insertQuery = "INSERT INTO beneficios_otorgados SET ?";
        db.query(insertQuery, beneficioOtorgado, function (err, insertResult) {
          if (err) {
            db.rollback(function () {
              console.log(err);
              return res.status(500).json({ error: "Error en el servidor" });
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
              db.query(insertKitEscolarQuery, kitEscolarInfo, function (err) {
                if (err) {
                  db.rollback(function () {
                    console.log(err);
                    return res
                      .status(500)
                      .json({ error: "Error en el servidor" });
                  });
                }

                return insertBeneficio(index + 1);
              });
            } else if (tipo === "Luna de miel") {
              const lunaDeMielInfo = {
                beneficio_otorgado_id: insertResult.insertId,
                numero_libreta: beneficio.numero_libreta,
              };

              const insertLunaDeMielQuery = "INSERT INTO luna_de_miel SET ?";
              db.query(insertLunaDeMielQuery, lunaDeMielInfo, function (err) {
                if (err) {
                  db.rollback(function () {
                    console.log(err);
                    return res
                      .status(500)
                      .json({ error: "Error en el servidor" });
                  });
                }
              });

              return insertBeneficio(index + 1);
            } else {
              db.rollback(function () {
                return res
                  .status(400)
                  .json({ error: "Tipo de beneficio desconocido" });
              });
            }
          } else {
            db.rollback(function () {
              return res.status(500).json({ error: "Error en el servidor" });
            });
          }
        });
      }
    }

    return insertBeneficio(0);
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

export const getBeneficiosById = (req, res) => {
    const id = req.params.id;
    const q = 
       "SELECT * FROM beneficios_otorgados WHERE usuario_otorgante_id = ?"
    db.query(q, [id], (err, data) => {
      if (err) return res.status(500).send(err);

      return res.status(200).json(data);
    });
  
}
