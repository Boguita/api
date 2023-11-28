import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendMail  from "./send-mail.js";
import sendMailSuppport from "./send-mail-support.js";


export const register = (req, res) => {
  const emailAdmin = ["soporte@beneficiosuatre.com.ar"];
  const contentAdmin = `<h1>¡Se ha registrado un usuario con el nombre: ${req.body.nombre}!</h1> <p>DATOS DEL USUARIO:  email: ${req.body.email}</p>`;
  const subjectAdmin = "Nuevo registro en UATRE BENEFICIOS";

  const emailUser = req.body.email;
  const contentUser = `<h1>¡Hola, ${req.body.nombre}, te has registrado correctamente email: ${req.body.email}!</h1> <p>Nuestro equipo revisará tu solicitud y te llegará una confirmación en el caso de que tu cuenta haya sido aprobada.</p>`;
  const subjectUser = "BIENVENIDO A UATRE BENEFICIOS";

  if (!req.body.email || !req.body.nombre || !req.body.dni || !req.body.nacionalidad || !req.body.sexo || !req.body.cuit || !req.body.provincia || !req.body.delegacion || !req.body.seccional || !req.body.domicilio || !req.body.tel || !req.body.password || !req.body.repeat_password) {
    return res.status(409).json("Completa todos los campos requeridos.");
  } else {
    // CHECK EXISTING USER
    const query = "SELECT * FROM users WHERE email = ?";

    db.query(query, [req.body.email], (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.length) return res.status(409).json("El usuario ya existe.");

      // Hash the password and create a user
      if (req.body.password === req.body.repeat_password) {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);

        // Consulta para obtener el nombre de la seccional basándose en el ID
const seccionalQuery =
  "SELECT nombre, direccion FROM seccionales WHERE idseccionales = ?";

        db.query(seccionalQuery, [req.body.seccional], (err, data) => {
          if (err) return res.status(500).json(err);

          // Verifica si se encontró la seccional en la base de datos
           if (data.length) {
             const seccionalNombre = data[0].nombre;
             const direccionNombre = data[0].direccion;
        

             const newUser = {
               username: req.body.nombre,
               email: req.body.email,
               nacionalidad: req.body.nacionalidad,
               sexo: req.body.sexo,
               dni: req.body.dni,
               cuit: req.body.cuit,
               provincia: req.body.provincia,
               delegacion: req.body.delegacion,
               domicilio: req.body.domicilio,
               seccional_id: req.body.seccional,
               seccional: seccionalNombre, // Asigna el nombre de la seccional al usuario
               tel: req.body.tel,
               direccion: direccionNombre,
               password: hash,
               status: "Pendiente",
             };

             const q = "INSERT INTO users SET ?";

             db.query(q, newUser, (err, data) => {
               if (err) return res.status(500).json(err);

               sendMailSuppport(emailAdmin, subjectAdmin, contentAdmin);
               sendMailSuppport(emailUser, subjectUser, contentUser);

               return res
                 .status(200)
                 .json(
                   "El usuario ha sido creado y está pendiente de aprobación."
                 );
             });
           } else {
             return res.status(404).json("Seccional no encontrada");
           }
        });
      } else {
        return res.status(409).json("Las contraseñas no coinciden.");
      }
    });
  }
};


// export const registerAdmin = (req, res) => {

//   if(!req.body.username, !req.body.email, !req.body.password, !req.body.area) {
//     return res.status(409).json("Complete all the required fields")
//   } else {
//   //CHECK EXISTING USER
//   const q = "SELECT * FROM employee WHERE email = ? OR username = ?";

//   db.query(q, [req.body.email, req.body.username,], (err, data) => {
//     if (err) return res.status(500).json(err);
//     if (data.length) return res.status(409).json("User already exists!");

//     //Hash the password and create a user
//     const salt = bcrypt.genSaltSync(10);
//     const hash = bcrypt.hashSync(req.body.password, salt);

//     const q =
//       "INSERT INTO employee(`username`,`email`,`area`,`password`) VALUES (?)";
//     const values = [req.body.username, req.body.email, req.body.area, hash];

//     db.query(q, [values], (err, data) => {
//       if (err) return res.status(500).json(err);
//       return res.status(200).json("User has been created.");
//     });
//   });
// };
// }

export const login = (req, res) => {
   if(!req.body.email, !req.body.password) {
    return res.status(409).json("Completa todos los campos requeridos.");
  } else {
  //CHECK USER

  const q = "SELECT * FROM users WHERE email = ?";

  db.query(q, [req.body.email], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("El usuario y/o la contraseña son incorrectos");

    //Check password
    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      data[0].password
    );

    if (!isPasswordCorrect)
      return res.status(400).json("El usuario y/o la contraseña son incorrectos");

    if (data[0].status === "Pendiente" || data[0].status === "Rechazado")
      return res.status(401).json("Tu cuenta aún no se encuentra habilitada.");

    const token = jwt.sign({ id: data[0].id }, "jwtkey");
    const { password, ...other } = data[0];
    
    
    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      })
      .status(200)
      .json(other);
        
  });
};
};


export const loginAdmin = (req, res) => {
  if(!req.body.email, !req.body.password) {
    return res.status(409).json("Completa todos los campos requeridos")
  } else {
    //CHECK USER

  const adm = "SELECT * FROM employee WHERE email = ?";

  db.query(adm, [req.body.email], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("El usuario y/o la contraseña son incorrectos");

    //Check password
    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      data[0].password
    );

    if (!isPasswordCorrect)
      return res
        .status(400)
        .json("El usuario y/o la contraseña son incorrectos");

    const token = jwt.sign({ id: data[0].id }, "jwtkey");
    const { password, ...other } = data[0];

    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      })
      .status(200)
      .json(other);
  });
};
}

export const passwordForgot = (req, res) => {
  const email = req.body.email;
  console.log(email)
  
  if(!req.body.email) return res.status(409).json("Completa todos los campos requeridos.");

  const q = "SELECT * FROM users WHERE email = ?";
  db.query(q, email, (err, data) => {
    if (err) return res.status(500).json(err);
    console.log(data)
    if (data.length === 0) return res.status(404).json("No se encontró usuario con ese email");

    const secret = data[0].password + "-" + data[0].username;
    console.log(secret)
    const payload = jwt.sign({ id: data[0].id }, secret, {expiresIn: "15m"});
    console.log("Payload:", payload)
    const link = `${data[0].id}/${payload}`;

    
    const subject = "Recuperar contraseña";
    const content = `<h1>¡Hola, ${data[0].username}!</h1> <p>Para recuperar tu contraseña, haz click en el siguiente enlace: <a href="https://fancy-caramel-9e3c4d.netlify.app/reset-password/${link}">Recuperar contraseña</a></p>`;

    sendMailSuppport(email, subject, content);
    return res.status(200).json("Email sent!");
  });
};

export const resetPassword = (req, res) => {
  const { id, token } = req.params;
  const { password, repeat_password } = req.body;

  if (!password || !repeat_password) return res.status(409).json("Completa todos los campos requeridos.");
  if (password !== repeat_password) return res.status(409).json("Las contraseñas no coinciden.");

   const q = "SELECT * FROM users WHERE id = ?";
  db.query(q, [id], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0)
      return res.status(404).json("No se encontró usuario con ese email");

    const secret = data[0].password + "-" + data[0].username;
    try {
      const verify = jwt.verify(token, secret);
    } catch (err) {
      return res.status(401).json("Token inválido.");
    }

    // jwt.verify(token, "jwtkey", (err, decoded) => {
    //   if (err) return res.status(401).json("Token inválido.");

    bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
      if (hashErr)
        return res.status(500).json("Error al hashear la contraseña.");

      const q = "UPDATE users SET password = ? WHERE id = ?";
      db.query(q, [hashedPassword, id], (updateErr, updateResult) => {
        if (updateErr)
          return res.status(500).json("Error al actualizar la contraseña.");
        if (updateResult.affectedRows === 0)
          return res.status(404).json("No se encontró usuario con ese id.");

        return res.status(200).json("Contraseña actualizada con éxito.");
      });
    });
  });
  // });
};
export const logout = (req, res) => {
  res.clearCookie("access_token",{
    sameSite:"none",
    secure:true
  }).status(200).json("User has been logged out.")
};
