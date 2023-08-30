import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendMail  from "./send-mail.js";


export const register = (req, res) => {
  const emailAdmin = ["heberdgomez@hotmail.com"];
  const contentAdmin = `<h1>¡Se ha registrado un usuario con el nombre: ${req.body.nombre}!</h1> <p>DATOS DEL USUARIO:  email: ${req.body.email}</p>`;
  const subjectAdmin = "Nuevo registro en UATRE BENEFICIOS";

  const emailUser = [req.body.email];
  const contentUser = `<h1>¡Hola, ${req.body.nombre}, te has registrado correctamente email: ${req.body.email}!</h1> <p>Nuestro equipo revisará tu solicitud y te llegará una confirmación en el caso de que tu cuenta haya sido aprobada.</p>`;
  const subjectUser = "BIENVENIDO A UATRE BENEFICIOS";

  if (!req.body.email || !req.body.nombre || !req.body.dni || !req.body.nacionalidad || !req.body.sexo || !req.body.cuit || !req.body.provincia || !req.body.ciudad || !req.body.domicilio || !req.body.tel || !req.body.password || !req.body.repeat_password) {
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

        const newUser = {
          username: req.body.nombre,
          email: req.body.email,
          nacionalidad: req.body.nacionalidad,
          sexo: req.body.sexo,
          dni: req.body.dni,
          cuit: req.body.cuit,
          provincia: req.body.provincia,
          ciudad: req.body.ciudad,
          domicilio: req.body.domicilio,
          tel: req.body.tel,
          password: hash,
          approved: false, // Set the 'approved' field to false for pending approval
        };

        const q = "INSERT INTO users SET ?";

        db.query(q, newUser, (err, data) => {
          if (err) return res.status(500).json(err);

          sendMail(emailAdmin, subjectAdmin, contentAdmin);
          sendMail(emailUser, subjectUser, contentUser);

          return res
            .status(200)
            .json("El usuario ha sido creado y esta pendiente de aprobación.");
        });
      } else {
        return res.status(409).json("Las contraseñas no coinciden.");
      }
    });
  }
};


export const registerAdmin = (req, res) => {

  if(!req.body.username, !req.body.email, !req.body.password, !req.body.area) {
    return res.status(409).json("Complete all the required fields")
  } else {
  //CHECK EXISTING USER
  const q = "SELECT * FROM employee WHERE email = ? OR username = ?";

  db.query(q, [req.body.email, req.body.username,], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length) return res.status(409).json("User already exists!");

    //Hash the password and create a user
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const q =
      "INSERT INTO employee(`username`,`email`,`area`,`password`) VALUES (?)";
    const values = [req.body.username, req.body.email, req.body.area, hash];

    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("User has been created.");
    });
  });
};
}

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

    if(!data[0].approved) return res.status(401).json("Tu cuenta aún no se encuentra habilitada.")

    const token = jwt.sign({ id: data[0].id }, "jwtkey");
    const { password, ...other } = data[0];
    
    
    res
      .cookie("access_token", token, {
        httpOnly: true
      })
      .status(200)
      .json(other);
        
  });
};
};

export const getCookies = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");
    return res.status(200).json(userInfo);
  });
}


export const loginAdmin = (req, res) => {
  if(!req.body.username, !req.body.password) {
    return res.status(409).json("Completa todos los campos requeridos")
  } else {
    //CHECK USER

  const adm = "SELECT * FROM employee WHERE username = ?";

  db.query(adm, [req.body.username], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("No se encontró usuario con ese nombre");

    //Check password
    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      data[0].password
    );

    if (!isPasswordCorrect)
      return res.status(400).json("Wrong username or password!");

    const token = jwt.sign({ id: data[0].id }, "jwtkey");
    const { password, ...other } = data[0];

    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json(other);
  });
};
}

export const logout = (req, res) => {
  res.clearCookie("access_token",{
    sameSite:"none",
    secure:true
  }).status(200).json("User has been logged out.")
};
