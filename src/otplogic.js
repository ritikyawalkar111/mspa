import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Mail transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  family: 4,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
});

// Generate a random 6-digit OTP
export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

// Send OTP email
export const sendOtpMail = async (email, otp) => {
  console.log("MAIL_PASS:", process.env.MAIL_PASS);

  try {
    await transporter.sendMail({
      from: `"MSPA" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Email Verification OTP",
      html: `
        <div style="font-family: Arial, sans-serif; padding:20px;">
          <h2>Your OTP Code</h2>
          <p>Use the following OTP to verify your email:</p>
          <h1 style="letter-spacing:3px;">${otp}</h1>
          <p>This OTP is valid for 10 minutes.</p>
        </div>
      `,
    });

    console.log("OTP email sent successfully");
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return false;
  }
};

// Send game invitation email
export const sendInvitation = async (emails, link) => {
  try {
    await transporter.sendMail({
      from: `"Truth & Dare Game" <${process.env.MAIL_USER}>`,
      bcc: emails, // send to multiple users privately
      subject: "🎉 You're Invited! Join the Truth & Dare Game",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 16px; background: #f9f9f9; border-radius: 8px;">
          <h2 style="color: #333;">You've been invited to play Truth & Dare! 🎲</h2>
          
          <p style="font-size: 16px;">
            Click the link below to join the game room:
          </p>

          <a href="${link}" 
             target="_blank" 
             style="display: inline-block; margin-top: 12px; padding: 12px 22px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
             Join Game
          </a>

          <p style="margin-top: 20px; color: #777;">
            Have fun and play fair! 🎉
          </p>
        </div>
      `,
    });

    console.log("Invitation email sent");
    return true;
  } catch (error) {
    console.error("Error sending invitation:", error);
    return false;
  }
};
