import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// ===== CHECK ENV VARIABLES =====
console.log("MAIL_USER:", process.env.MAIL_USER ? "Loaded" : "Missing");
console.log("MAIL_PASS:", process.env.MAIL_PASS ? "Loaded" : "Missing");

// ===== CREATE TRANSPORTER =====
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  family: 4, // force IPv4 (important for Render)
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 15000,
  debug: true,
  logger: true,
});

// ===== VERIFY SMTP CONNECTION =====
transporter.verify(function (error, success) {
  if (error) {
    console.error("SMTP connection failed:", error);
  } else {
    console.log("SMTP server is ready to send emails");
  }
});

// ===== GENERATE OTP =====
export const generateOtp = (): number => {
  return Math.floor(100000 + Math.random() * 900000);
};

// ===== SEND OTP EMAIL =====
export const sendOtpMail = async (email: string, otp: number): Promise<boolean> => {
  console.log("Sending OTP to:", email);
  console.log("OTP:", otp);

  try {
    const info = await transporter.sendMail({
      from: `"Truth & Dare" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Email Verification OTP",
      html: `
        <div style="font-family: Arial; padding:20px">
          <h2>Your OTP Code</h2>
          <p>Use the following OTP to verify your email:</p>
          <h1>${otp}</h1>
          <p>This OTP is valid for 10 minutes.</p>
        </div>
      `,
    });

    console.log("Email sent successfully");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);

    return true;
  } catch (error) {
    console.error("Error sending OTP email:");
    console.error(error);
    return false;
  }
};
