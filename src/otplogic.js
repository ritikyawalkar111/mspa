import dotenv from "dotenv";
import nodemailer from "nodemailer";

console.log("1️⃣ Starting mail service...");

dotenv.config();
console.log("2️⃣ dotenv loaded");

console.log("3️⃣ MAIL_USER:", process.env.MAIL_USER);
console.log("4️⃣ MAIL_PASS:", process.env.MAIL_PASS ? "Loaded ✅" : "Missing ❌");

console.log("5️⃣ Creating transporter...");

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  family: 4,
});

console.log("6️⃣ Transporter created");

// OTP generator
export const generateOtp = () => {
  console.log("7️⃣ Generating OTP...");
  const otp = Math.floor(100000 + Math.random() * 900000);
  console.log("8️⃣ OTP Generated:", otp);
  return otp;
};

// Send OTP email
export const sendOtpMail = async (email, otp) => {
  console.log("9️⃣ sendOtpMail called");
  console.log("🔟 Email:", email);
  console.log("11️⃣ OTP:", otp);

  console.log("12️⃣ Checking env variables again...");
  console.log("MAIL_USER:", process.env.MAIL_USER);
  console.log("MAIL_PASS:", process.env.MAIL_PASS ? "Loaded ✅" : "Missing ❌");

  try {
    console.log("13️⃣ Preparing email message...");

    const mailOptions = {
      from: `"MSPA" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Email Verification OTP",
      html: `
        <h2>Your OTP Code</h2>
        <p>Use the following OTP to verify your email:</p>
        <h3>${otp}</h3>
        <p>This OTP is valid for 10 minutes.</p>
      `,
    };

    console.log("14️⃣ Sending mail...");
    const result = await transporter.sendMail(mailOptions);

    console.log("15️⃣ Mail sent successfully ✅");
    console.log("16️⃣ Message ID:", result.messageId);

    return true;
  } catch (error) {
    console.error("❌ 17️⃣ Error sending OTP email:");
    console.error(error);
    return false;
  }
};

// Send invitation email
export const sendInvitation = async (emails, link) => {
  console.log("18️⃣ sendInvitation called");
  console.log("19️⃣ Emails:", emails);
  console.log("20️⃣ Link:", link);

  try {
    console.log("21️⃣ Preparing invitation email...");

    const mailOptions = {
      from: `"Truth & Dare Game" <${process.env.MAIL_USER}>`,
      bcc: emails,
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
    };

    console.log("22️⃣ Sending invitation email...");

    const result = await transporter.sendMail(mailOptions);

    console.log("23️⃣ Invitation email sent successfully ✅");
    console.log("24️⃣ Message ID:", result.messageId);

    return true;
  } catch (e) {
    console.error("❌ 25️⃣ Error sending invitation email:");
    console.error(e);
    return false;
  }
};import dotenv from "dotenv";
import nodemailer from "nodemailer";

console.log("1️⃣ Starting mail service...");

dotenv.config();
console.log("2️⃣ dotenv loaded");

console.log("3️⃣ MAIL_USER:", process.env.MAIL_USER);
console.log("4️⃣ MAIL_PASS:", process.env.MAIL_PASS ? "Loaded ✅" : "Missing ❌");

console.log("5️⃣ Creating transporter...");

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  family: 4,
});

console.log("6️⃣ Transporter created");

// OTP generator
export const generateOtp = () => {
  console.log("7️⃣ Generating OTP...");
  const otp = Math.floor(100000 + Math.random() * 900000);
  console.log("8️⃣ OTP Generated:", otp);
  return otp;
};

// Send OTP email
export const sendOtpMail = async (email, otp) => {
  console.log("9️⃣ sendOtpMail called");
  console.log("🔟 Email:", email);
  console.log("11️⃣ OTP:", otp);

  console.log("12️⃣ Checking env variables again...");
  console.log("MAIL_USER:", process.env.MAIL_USER);
  console.log("MAIL_PASS:", process.env.MAIL_PASS ? "Loaded ✅" : "Missing ❌");

  try {
    console.log("13️⃣ Preparing email message...");

    const mailOptions = {
      from: `"MSPA" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Email Verification OTP",
      html: `
        <h2>Your OTP Code</h2>
        <p>Use the following OTP to verify your email:</p>
        <h3>${otp}</h3>
        <p>This OTP is valid for 10 minutes.</p>
      `,
    };

    console.log("14️⃣ Sending mail...");
    const result = await transporter.sendMail(mailOptions);

    console.log("15️⃣ Mail sent successfully ✅");
    console.log("16️⃣ Message ID:", result.messageId);

    return true;
  } catch (error) {
    console.error("❌ 17️⃣ Error sending OTP email:");
    console.error(error);
    return false;
  }
};

// Send invitation email
export const sendInvitation = async (emails, link) => {
  console.log("18️⃣ sendInvitation called");
  console.log("19️⃣ Emails:", emails);
  console.log("20️⃣ Link:", link);

  try {
    console.log("21️⃣ Preparing invitation email...");

    const mailOptions = {
      from: `"Truth & Dare Game" <${process.env.MAIL_USER}>`,
      bcc: emails,
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
    };

    console.log("22️⃣ Sending invitation email...");

    const result = await transporter.sendMail(mailOptions);

    console.log("23️⃣ Invitation email sent successfully ✅");
    console.log("24️⃣ Message ID:", result.messageId);

    return true;
  } catch (e) {
    console.error("❌ 25️⃣ Error sending invitation email:");
    console.error(e);
    return false;
  }
};import dotenv from "dotenv";
import nodemailer from "nodemailer";

console.log("1️⃣ Starting mail service...");

dotenv.config();
console.log("2️⃣ dotenv loaded");

console.log("3️⃣ MAIL_USER:", process.env.MAIL_USER);
console.log("4️⃣ MAIL_PASS:", process.env.MAIL_PASS ? "Loaded ✅" : "Missing ❌");

console.log("5️⃣ Creating transporter...");

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  family: 4,
});

console.log("6️⃣ Transporter created");

// OTP generator
export const generateOtp = () => {
  console.log("7️⃣ Generating OTP...");
  const otp = Math.floor(100000 + Math.random() * 900000);
  console.log("8️⃣ OTP Generated:", otp);
  return otp;
};

// Send OTP email
export const sendOtpMail = async (email, otp) => {
  console.log("9️⃣ sendOtpMail called");
  console.log("🔟 Email:", email);
  console.log("11️⃣ OTP:", otp);

  console.log("12️⃣ Checking env variables again...");
  console.log("MAIL_USER:", process.env.MAIL_USER);
  console.log("MAIL_PASS:", process.env.MAIL_PASS ? "Loaded ✅" : "Missing ❌");

  try {
    console.log("13️⃣ Preparing email message...");

    const mailOptions = {
      from: `"MSPA" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Email Verification OTP",
      html: `
        <h2>Your OTP Code</h2>
        <p>Use the following OTP to verify your email:</p>
        <h3>${otp}</h3>
        <p>This OTP is valid for 10 minutes.</p>
      `,
    };

    console.log("14️⃣ Sending mail...");
    const result = await transporter.sendMail(mailOptions);

    console.log("15️⃣ Mail sent successfully ✅");
    console.log("16️⃣ Message ID:", result.messageId);

    return true;
  } catch (error) {
    console.error("❌ 17️⃣ Error sending OTP email:");
    console.error(error);
    return false;
  }
};

// Send invitation email
export const sendInvitation = async (emails, link) => {
  console.log("18️⃣ sendInvitation called");
  console.log("19️⃣ Emails:", emails);
  console.log("20️⃣ Link:", link);

  try {
    console.log("21️⃣ Preparing invitation email...");

    const mailOptions = {
      from: `"Truth & Dare Game" <${process.env.MAIL_USER}>`,
      bcc: emails,
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
    };

    console.log("22️⃣ Sending invitation email...");

    const result = await transporter.sendMail(mailOptions);

    console.log("23️⃣ Invitation email sent successfully ✅");
    console.log("24️⃣ Message ID:", result.messageId);

    return true;
  } catch (e) {
    console.error("❌ 25️⃣ Error sending invitation email:");
    console.error(e);
    return false;
  }
};
