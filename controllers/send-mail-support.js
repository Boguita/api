import nodemailer from "nodemailer";
const { SMTP_MAIL_SUPPORT, SMTP_PASSWORD_SUPPORT } = process.env;

console.log(SMTP_MAIL_SUPPORT, SMTP_PASSWORD_SUPPORT);
const sendMailSuppport = async (email, mailSubject, content) => {
  
  try {
    
    const transport = nodemailer.createTransport({
      host: "smtp.ionos.com",
      port: 587,
      secure: false, // En el puerto 587, secure debe ser false
      auth: {
        user: SMTP_MAIL_SUPPORT,
        pass: SMTP_PASSWORD_SUPPORT,
      },
    });

    const mailOptions = {
      from: `SOPORTE UATRE BENEFICIOS <${SMTP_MAIL_SUPPORT}>`,
      to: email,
      subject: mailSubject,
      html: content,
    };

    transport.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error.message);
      } else {
        console.log("Email enviado", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

export default sendMailSuppport;
