import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
});

transporter.verify((err, success) => {
  if (err) {
    console.error("SMTP Verify Failed:", err);
  } else {
    console.log("SMTP Connected Successfully");
  }
});

export async function sendOtpMail(email: string, otp: number) {
  try {
    console.log("Sending mail...");
    console.log("MAIL_USER:", process.env.MAIL_USER);
    console.log(
      "MAIL_PASS:",
      process.env.MAIL_PASS ? "Loaded" : "Missing"
    );

    const info = await transporter.sendMail({
      from: `"MSPA" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Email Verification OTP",
      html: `
        <h2>Your OTP Code</h2>
        <h1>${otp}</h1>
        <p>This OTP is valid for 10 minutes.</p>
      `,
    });

    console.log("Message Sent:", info.messageId);
    return true;
  } catch (err) {
    console.error("Mail Error:", err);
    return false;
  }
}
