import { db } from "../db.js";
import jwt from "jsonwebtoken";


export const getBeneficiosByDni = (req, res) => {
  const dni = req.params.dni;

  const query = `
    SELECT
      beneficios_otorgados.id,
      beneficios_otorgados.tipo,
      beneficios_otorgados.detalles,
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
    WHERE
      afiliados.dni = ? 
      AND beneficios_otorgados.tipo = 'Kit escolar'
  `;

  db.query(query, [dni], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    return res.status(200).json(results);
  });
};

export const comprobarBeneficios = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("No autenticado");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token no válido");

    const familiarIds = req.params.familiar_ids.split(",").map(Number); // Cambiamos a req.query para obtener los parámetros de consulta
    console.log(familiarIds);
    const query = `
      SELECT
        beneficios_otorgados.id,
        beneficios_otorgados.tipo,
        beneficios_otorgados.detalles,
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
  });
};

export const otorgarBeneficio = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) {
    return res.status(401).json("No autenticado");
  }

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) {
      return res.status(403).json("Token no válido");
    }

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

        // Comprobación para Kit Maternal
        if (tipo === "Kit maternal") {
          console.log(beneficio.fecha_de_parto)
          const fechaParto = new Date(beneficio.fecha_de_parto);
          
          console.log(fechaParto);
         

          const checkBeneficioQuery = `
            SELECT COUNT(*) AS count
            FROM
              beneficios_otorgados 
            WHERE
              familiar_id = ?
              AND tipo = 'Kit maternal'
              AND fecha_otorgamiento >= DATE_SUB(?, INTERVAL 9 MONTH)`;

          db.query(
            checkBeneficioQuery,
            [beneficio.familiar_id, fechaParto],
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
                    "No se puede otorgar el beneficio. Ya se otorgó uno en los últimos 9 meses antes de la fecha de parto.",
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
  });
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

export const getPosts = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const uid = userInfo.id;
    const q = req.query.cat
      ? "SELECT * FROM tickets WHERE uid=? AND cat=?"
      : "SELECT * FROM tickets WHERE uid=?";

    db.query(q, [uid, req.query.cat], (err, data) => {
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


