import nodemailer from "nodemailer";
import { text } from "stream/consumers";
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: "kumaranish0750@gmail.com",
      pass: "rzyb rtgj qkod dofe",
    },
  });

  export const sendEmail = async(email:string, subject: string, message: string) => {
    try{
        const info = await transporter.sendMail({
            from: "kumaranish0750@gmail.com", // sender address
            to: email , // recipient
            subject: subject ,
            text:"great going", // plain text body
            html: `<b>${message}</b>`, // HTML body
          });
      
          console.log("Message sent: %s", info.messageId);
          return info.messageId;
        
    }catch(error){
        console.error("Error sending email:", error);
        throw new Error("Email sending failed");
    }
  }
  