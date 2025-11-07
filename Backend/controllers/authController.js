import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { sendEmail } from '../utils/sendEmail.js';
import { generateOtpTemplate } from '../utils/generateOtpTemplate.js';

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
// ✅ SEND OTP TO LOGGED IN USER EMAIL
export async function forgotPassword(req, res) {
  const { email } = req.body; // ✅ no token needed
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'User not found' });

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpires = Date.now() + 5 * 60 * 1000;
  await user.save();

  // await sendEmail(email, 'Password Reset OTP', `<p>Your OTP is: <strong>${otp}</strong></p>`);
  // await sendEmail(email, 'Password Reset OTP - KachaBazar', generateOtpTemplate(otp,user.name));
  await sendEmail(user.email, 'Password Reset OTP - KachaBazar', otp, user.name);
  res.json({ message: 'OTP sent', otp: otp });
}


// ✅ VERIFY OTP (JWT used to get email)
export async function verifyOtp(req, res) {
  // const email = req.user.email;
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  res.json({ message: 'OTP verified' });
}

// ✅ RESET PASSWORD (JWT based)
export async function resetPassword(req, res) {
  // const email = req.user.email;
  const { email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);
  await User.findOneAndUpdate(
    { email },
    { password: hashed, otp: null, otpExpires: null }
  );

  res.json({ message: 'Password reset successful' });
}

// ✅ RESEND OTP
export async function resendOtp(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'User not found' });

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpires = Date.now() + 5 * 60 * 1000;
  await user.save();

  // await sendEmail(email, 'Password Reset OTP', `<p>Your new OTP is: <strong>${otp}</strong></p>`);
  // await sendEmail(email, 'Password Reset OTP - KachaBazar', generateOtpTemplate(otp,user.name));
  await sendEmail(user.email, 'Password Reset OTP - KachaBazar', otp, user.name);

  res.json({ message: 'OTP resent' });
}


// REGISTER API
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'User already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });

  const token = generateToken(user._id);
  // res.cookie('token', token, { httpOnly: true });
  res.status(201).json({ message: "Registered successfully", user, token });
};


//  LOGIN API

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.password) return res.status(400).json({ message: 'Email not found' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Password does not match' });

  const token = generateToken(user._id, user.email);
  // res.cookie('token', token, { httpOnly: true });
    res.cookie("token", token, {
  httpOnly: true,
    secure: true, // render = https
    sameSite: "none", // frontend & backend are different domains
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
});
 user.token = token;
   await user.save();
  res.status(200).json({
    message: 'Login successful',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      token: user.token, // 👈 sent to client as well
    },
 
  });
  
};


//  LOGOUT API
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true, // keep true if using HTTPS (Render)
    sameSite: "None", // same as you used while setting cookie
    path: "/", // global cookie path
  });

  res.status(200).json({ message: "Logged out successfully" });
};

// export const getCurrentUser = async (req, res) => {

//   const token = req.cookies.token;
//   if (!token) return res.status(401).json({ message: 'Unauthorized' });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.id).select('-password');
//     res.cookie('token', token, { httpOnly: true });
//     res.status(200).json({
//       message: 'Login successful',
//       user: {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         token:user.token,
//         role: user.role, // if exists
//       },
//       token,
//     });
//   } catch {
//     res.status(401).json({ message: 'Invalid token' });
//   }
// };

export const getCurrentUser = async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User fetched successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Google Callback
export const googleCallback = async (req, res) => {
  const user = req.user;
  const token = generateToken(user._id);
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'None',
    maxAge: 7 * 24 * 60 * 60 * 1000,// 7 days
    //  domain: '192.168.1.34'
  });
  res.redirect(`${process.env.CLIENT_URL}`);



};


// get all users

export const getAllUsers = async (req, res) => {
  try {

    const getAllusers = await User.find({}, "name email _id role");
    res.json({
      message: "All user data found sucessfully",
      success: true,
      error: false,
      users: getAllusers
    })

  } catch (error) {
    res.status(500).json({
      message: "failed to fetch user",
      success: true,
      error: false
    })
  }
}
