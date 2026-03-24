import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();

// import { saveOTP, getOTP, removeOTP } from './otpStore'; // Assume these are also in TS

// Setup mail transporter
let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, // non-SSL port
  secure: false, // upgrade later with STARTTLS
  auth: {
    user: "kryzen424@gmail.com",
    pass: "weekmvzdcpbfywgw",
  },
  tls: {
    rejectUnauthorized: false,
  },
  family: 4, // force IPv4
});

// Generate a random 3-digit OTP
export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

// Send OTP email
export const sendOtpMail = async (email, otp) => {
  console.log("Pass:", process.env.MAIL_PASS ? "Loaded" : "Missing");
  onsole.log(process.env.MAIL_PASS, MAIL_USER);
  try {
    await transporter.sendMail({
      from: `"MSPA <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Email Verification OTP",
      html: `
        <h2>Your OTP Code</h2>
        <p>Use the following OTP to verify your email:</p>
        <h3>${otp}</h3>
        <p>This OTP is valid for 10 minutes.</p>
      `,
    });
    console.log("sent");
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

export const sendInvitation = async (emails, link) => {
  try {
    await transporter.sendMail({
      from: `"Truth & Dare Game" <${process.env.MAIL_USER}>`,
      bcc: emails, // send to multiple users privately
      subject: "🎉 You're Invited! Join the Truth & Dare Game",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 16px; background: #f9f9f9; border-radius: 8px;">
          <h2 style="color: #333;">You've been invited to play Truth & Dare! 🎲</h2>
          <p style="font-size: 16px;">Click the link below to join the game room:</p>
          <a href="${link}" target="_blank" style="display: inline-block; margin-top: 12px; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
            Join Game
          </a>
          <p style="margin-top: 20px; color: #777;">Have fun and play fair! 🎉</p>
        </div>
      `,
    });
    return true;
  } catch (e) {
    console.error("Error sending invite:", e);
    return false;
  }
};
