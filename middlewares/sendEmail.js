import nodeMailer from "nodemailer"

export const sendEmail = async(options) => {
    const transporter = nodeMailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "8adee397193fd5",
          pass: "0e1b74d7c27865"
        }
      });
    ;

    const mailOptions = {
        from : process.env.SMPT_MAIL, 
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    await transporter.sendMail(mailOptions)
}

