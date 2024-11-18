const mongoose = require("mongoose");
const mailSender = require("../utils/MailSender");

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 5,
  },
});

async function sendVerificationMail(email, otp) {
  try {
    let mailResponse = await mailSender(email, "This is your OTP ", otp);
    console.log("OTP succesfully sent ", mailResponse);
  } catch (e) {
    console.log("ERROR on sending OTP mail", error);
    throw error;
  }
}

OTPSchema.pre("save", async function (next) {
  await sendVerificationMail(this.email, this.otp);
  next();
});

module.exports = mongoose.model("OTP", OTPSchema);
