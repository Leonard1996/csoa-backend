require("dotenv").config();
const nodemailer = require("nodemailer");
export class Mailer {
  public transporter: any;
  constructor() {
    // console.log(process.env.EMAIL_HOST, process.env.EMAIL_PORT, process.env.EMAIL_SECURE, process.env.EMAIL_USERNAME, process.env.EMAIL_PASSWORD, process.env.EMAIL_REJECT_UNAUTHORIZED)
    this.transporter = nodemailer.createTransport({
      // host: process.env.EMAIL_HOST,
      // port: process.env.EMAIL_PORT,
      // secure: process.env.EMAIL_SECURE,
      // auth: {
      //   user: process.env.EMAIL_USERNAME,
      //   pass: process.env.EMAIL_PASSWORD,
      // },
      // tls: {
      //   rejectUnauthorized: process.env.EMAIL_REJECT_UNAUTHORIZED,
      // },
      host: "smtp.mailtrap.io",
      port: 587,
      secure: false,
      auth: {
        user: "f8cec2f3d3c55c",
        pass: "3ea58b5f998668"
      },
      tls: { rejectUnauthorized: false }
    });

  }

  public async sendMail(emailTo: String, subject: String, bodyHtml: String) {
    let mailOptions = {
      from: '"CSOA" <' + process.env.EMAIL_USERNAME + ">", // sender address
      to: emailTo, // list of receivers
      subject, // Subject line
      html: bodyHtml,
    };

    return new Promise((resolve, reject) => {
      this.transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          resolve(info);
        }
      });
    });
  }
}
