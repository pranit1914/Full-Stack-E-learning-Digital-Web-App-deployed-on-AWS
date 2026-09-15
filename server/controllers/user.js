//import { User } from "../models/User.js";
import {User} from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {sendMail} from "../middlewares/sendMail.js";
import { TryCatch } from "../middlewares/TryCatch.js";
import crypto from "crypto";
import { getMediaUrl, uploadToS3 } from "../utils/s3.js";

const userWithMediaUrls = async (user) => {
  const value = user.toObject();
  value.profilePic = await getMediaUrl(value.profilePic);
  value.certificates = await Promise.all(
    value.certificates.map(async (certificate) => ({
      ...certificate,
      file: await getMediaUrl(certificate.file),
    })),
  );
  return value;
};

// register logic
export const register = TryCatch(async(req,res)=>{
  const { email, name, password } = req.body;

    let user = await User.findOne({ email });

    if(user)
      return res.status(400).json({
        message: "User Already exists",
      });

    const hashPassword = await bcrypt.hash(password, 10);

    user= {
      name,
      email,
      password: hashPassword,
    };

    const otp = Math.floor(100000 + Math.random() * 900000); // 6 digit OTP

    const activationToken = jwt.sign(
      {
        user,
        otp,
      },
      process.env.Activation_Secret,
      {
        expiresIn: "5m",
      }
    );

    // ✅ FIXED
    const data = {
      name,
      otp,
    };

    await sendMail(email, "E-learning OTP", data);

    res.status(200).json({
      message: "OTP sent to your email, Please check",
      activationToken,
    });
})

export const verifyUser = TryCatch(async (req, res) => {
  const { otp, activationToken } = req.body;

  if (!otp || !activationToken) {
    return res.status(400).json({
      message: "OTP and Token required",
    });
  }

  let verify;

  try {
    verify = jwt.verify(
      activationToken,
      process.env.Activation_Secret
    );
  } catch (error) {
    return res.status(400).json({
      message: "OTP Expired or Invalid Token",
    });
  }

  if (verify.otp !== Number(otp)) {
    return res.status(400).json({
      message: "Wrong OTP",
    });
  }

  const existingUser = await User.findOne({
    email: verify.user.email,
  });

  if (existingUser) {
    return res.status(400).json({
      message: "User already registered",
    });
  }

  await User.create({
    name: verify.user.name,
    email: verify.user.email,
    password: verify.user.password,
  });

  res.json({
    message: "User Registered Successfully",
  });
});

//login user
export const longinUser=TryCatch(async(req,res)=>{
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user)
    return res.status(400).json({
      message: "No User with this email",
    });

    //match the passwoed
   const mathPassword=await bcrypt.compare(password,user.password);

   if (!mathPassword)
    return res.status(400).json({
      message: "wrong Password",
    });

    const token = jwt.sign({ _id: user._id }, process.env.Jwt_Sec, {
    expiresIn: "15d",
  });

  res.json({
    message: `Welcome back ${user.name}`,
    token,
    user: await userWithMediaUrls(user),
  });

});

export const myProfile=TryCatch(async(req,res)=>{
  const user=await User.findById(req.user._id);

  res.json({ user: await userWithMediaUrls(user) });
})

export const forgotPassword = TryCatch(async (req, res) => {
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const message = "If an account exists for this email, a password reset link has been sent.";
  const user = await User.findOne({ email });

  if (!user) return res.json({ message });

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  await sendMail(email, "Reset your E-learning password", {
    name: user.name,
    resetUrl: `${frontendUrl}/reset-password/${resetToken}`,
  });
  res.json({ message });
});

export const resetPassword = TryCatch(async (req, res) => {
  const tokenHash = crypto.createHash("sha256").update(req.params.token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: tokenHash,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ message: "Reset link is invalid or expired" });
  const { password } = req.body;
  if (typeof password !== "string" || password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  res.json({ message: "Password reset successfully. Please log in." });
});

export const updateProfile = TryCatch(async (req, res) => {
  const { about, experience, certificateName } = req.body;
  const user = await User.findById(req.user._id);

  if (typeof about === "string") user.about = about.slice(0, 1000);
  if (typeof experience === "string") user.experience = experience.slice(0, 1000);
  if (req.files?.profilePic?.[0]) {
    user.profilePic = await uploadToS3(req.files.profilePic[0], "users/profile-pictures");
  }
  if (req.files?.certificate?.[0]) {
    user.certificates.push({
      name: (certificateName || req.files.certificate[0].originalname).slice(0, 120),
      file: await uploadToS3(req.files.certificate[0], "users/certificates"),
    });
  }

  await user.save();
  res.json({ message: "Profile updated", user: await userWithMediaUrls(user) });
});