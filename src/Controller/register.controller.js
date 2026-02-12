import { sendOtpMail, generateOtp } from "../otplogic.js";
import { saveOTP, getOTP, removeOTP, updateOtp } from "../otpStore.js";
// import { admin, db, auth } from "../firebase/index";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
// import { deleteFile } from "../routes/deleteFile";
dotenv.config();
import z from "zod";


const secret = process.env.JWT_SECRET
// Ensure .env loads here

// =======================
// ✅ Send OTP Controller
// =======================
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000
};
const emailSchema = z.string().email();
export const sendOtp = async (req, res) => {
  try {
    console.log("entered");
    const { email } = req.body;

    // Validate email
    const suc = emailSchema.safeParse(email);
    if (!suc.success) {
      return res.status(404).json({ msg: "Give a valid email" });
    }

    if (!email) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    console.log("what happem")
    // Check if user already exists
    try {
      const userRecord = await User.findOne({ email: email });
      if (userRecord) {
        // console.log("error in deleting file");
        return res.status(409).json({ message: "User already registered" });
      }

    } catch (err) {
      // If error.code === 'auth/user-not-found', proceed to OTP

      return res.status(500).json({ message: "Failed to check user" });

    }

    // Generate OTP
    const otp = generateOtp();
    console.log(otp)
    // Save OTP and send mail
    await saveOTP(email, String(otp));
    await sendOtpMail(email, otp);
    console.log("otp sent")
    return res.status(200).json({ message: "OTP sent successfully" });

  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};


export const resendOtp = async (req, res) => {
  try {
    const email = req.body.email;
    if (!email) {
      return res.status(400).json({ message: 'Provide email and OTP' });
    }

    const otp = generateOtp();
    const generated = updateOtp(email, String(otp));
    console.log(generated);
    if (!generated) {
      return res.status(500).json({
        msg: "otp cant be resend"
      })
    }

    console.log(` ${email}  ${otp}`)
    await sendOtpMail(email, otp);
    return res.json(200).json({
      msg: "otp sent successfully"
    })
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      msg: e
    })
  }
}
// ==========================
// ✅ Verify OTP & Create User
// ==========================
export const Register_verifyOtp = async (req, res) => {
  try {
    const { name, email, password, role, otp: userOtp } = req.body;
    if (!email || !userOtp) {
      return res.status(400).json({ message: 'Provide email and OTP' });
    }
    // if (role === 'teacher' && !subject) {
    //   return res.status(400).json({ message: "provide subject as well" })
    // }
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const record = getOTP(email);
    console.log("Stored OTP Record:", record);

    if (!record) {
      return res.status(404).json({ message: "No OTP record found" });
    }

    const { otp, expiresAt } = record;

    if (Date.now() > expiresAt) {
      // deleteFile(publicId);
      removeOTP(email);
      return res.status(410).json({ message: "OTP expired" });
    }

    if (String(otp) !== String(userOtp)) {
      return res.status(401).json({ message: "Invalid OTP" });
    }
    removeOTP(email); // Clear OTP after success
    user = new User({ name, email, password, role });
    // await user.save();/


    const payload = { id: user.id };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', {
      expiresIn: '15m'
    });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret', {
      expiresIn: '90d'
    });

    user.refreshToken = refreshToken;
    await user.save();


    res.cookie('token', accessToken, cookieOptions);

    return res.status(201).json({
      message: 'User registered successfully',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,

        role: user.role,
        // teacherCode: user.teacherCode,
        // enrolledTeachers: user.enrolledTeachers
      }
    });
  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

