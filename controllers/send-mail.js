import nodemailer from 'nodemailer';
const {SMTP_MAIL, SMTP_PASSWORD} = process.env;
console.log(SMTP_MAIL, SMTP_PASSWORD)

const sendMail = async (email, mailSubject, content) => {

  try {
    const transport = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth:{
        user: SMTP_MAIL,
        pass: SMTP_PASSWORD
      }
    });

    const mailOptions = {
        from: `UATRE BENEFICIOS <${SMTP_MAIL}>`,
        to: email,
        subject: mailSubject,
        html: content
    }

    transport.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error.message);
      } else {
        console.log('Email enviado', info.response);
      }
    });

  } catch (error) {
    console.log(error.message);
  }
};

export default sendMail;