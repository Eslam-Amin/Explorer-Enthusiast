const nodemailer = require("nodemailer");


// let nodemailer = nodeMailer.createTransport({
//     host: "smtp-mail.outlook.com",
//     auth: {
//         user: "ea.eslamamin@outlook.com",
//         pass: "eca just 1"
//     }
// })


const sendEmail = async options => {
    //Create a transporter
    const transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "d2697699cdd207",
            pass: "c69231edd5b898"
        }
        // host: process.env.EMAIL_HOST,
        // port: process.env.EMAIL_PORT,
        // auth: {
        //     user: process.env.EMAIL,
        //     pass: process.env.PASSWORD
        // },
        // Activate in gmail "less secure app" option
        // service: "Gmail",
        // auth: {
        //     user: process.env.EMAIL,
        //     pass: process.env.PASSWORD
        // },
        //Activate in gmail "less secure app" option
    })

    //define email options
    const mailOptions = {
        from: "Eslam Amin <eca.amino@gmail.com>",
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html:
    }

    //send the mail
    await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;