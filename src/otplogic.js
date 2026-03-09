import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// verify connection when server starts
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP connection failed:", error);
  } else {
    console.log("SMTP server ready");
  }
});

// generate 6 digit OTP
export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

// send OTP mail
export const sendOtpMail = async (email, otp) => {
  try {
    const info = await transporter.sendMail({
      from: `"MSPA" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Email Verification OTP",
      html: `
        <div style="font-family: Arial">
          <h2>Your OTP Code</h2>
          <p>Use this OTP to verify your email:</p>
          <h1>${otp}</h1>
          <p>This OTP is valid for 10 minutes.</p>
        </div>
      `,
    });

    console.log("Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

// send invitation mail
export const sendInvitation = async (emails, link) => {
  try {
    const info = await transporter.sendMail({
      from: `"Truth & Dare Game" <${process.env.MAIL_USER}>`,
      bcc: emails,
      subject: "🎉 You're Invited! Join the Truth & Dare Game",
      html: `
        <div style="font-family: Arial; padding: 20px">
          <h2>You've been invited to play Truth & Dare! 🎲</h2>
          <p>Click the button below to join the room:</p>
          <a href="${link}" 
             style="padding:10px 20px;background:#007bff;color:white;text-decoration:none;border-radius:5px">
             Join Game
          </a>
        </div>
      `,
    });

    console.log("Invitation sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Invite email error:", error);
    return false;
  }
};
