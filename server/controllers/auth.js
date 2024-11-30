const OTPGenerator = require("otp-generator");
const OTP = require("../models/OTP");
const User = require("../models/User");
const Validator = require("email-validator");
const Profile = require("../models/Profile");
const jwt = require("jsonwebtoken");
const cookie = require("js-cookie");
const bcrypt = require("bcrypt");
const bcryptjs = require("bcryptjs");
const {crypto}= require("crypto");
require("dotenv").config();
const {passwordUpdated} = require("../Template/PasswordUpdate");
const mailSender = require("../utils/MailSender");

//Generating OTP and adding to database
exports.sendOTP = async (req, res) => {
  try {
    //fetch email from req
    const { email } = req.body;

    //check email is non empty and valid or not
    if (!email 
      // || !Validator.validate(email)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid Email",
      });
    }

    //check user is already registered
    const user = await User.findOne({ email });
    console.log("user alreay exist for sign up", user);;
    if (user) {
      return res.status(401).json({
        success: false,
        message: "User already Existed",
      });
    }

    var otp = OTPGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    const result = await OTP.findOne({ otp: otp });
    console.log("Result is Generate OTP Func");
    console.log("OTP", otp);
    console.log("Result", result);
    while (result) {
      otp = OTPGenerator.generate(6, {
        upperCaseAlphabets: false,
      });
    }
    const otpPayload = { email, otp };
    const otpBody = await OTP.create(otpPayload);
    console.log("OTP Body", otpBody);


    res.status(200).json({
      success: true,
      message: `OTP Sent Successfully`,
      otp,
    });

    //generate OTP
    // let otp = OTPGenerator.generate(6, {
    //   upperCaseAlphabets: false,
    //   specialChars: false,
    //   lowerCaseAlphabets: false,
    // });
    // //check otp already in database for unique
    // let result = await OTP.find({ opt: otp });

    // //reCreate OTP while we don't get unique OTP
    // while (result) {
    //   otp = OTPGenerator.generate(6, {
    //     upperCaseAlphabets: false,
    //     specialChars: false,
    //     lowerCaseAlphabets: false,
    //   });
    //   result = await OTP.find({ opt: otp });
    // }

    // //create entry in DB
    // ///before it pre middleware send mail

    // // let payload = { email, otp };
    // const OTPDB = await OTP.create({email:email,opt:otp});

    // console.log("Your email and otp in DB", OTPDB);

    // res.status(200).json({
    //   success: true,
    //   message: "OTP Done in DB",
    // });
    
  } catch (e) {
    console.log("Error in OTP", e);
    console.error(e);
    // throw e;
    return res.status(500).json({
      success: false,
      message: `ERROR on sending OTP`,
    });
  }
};

//for SignUp of User

exports.signUp = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).send({
        success: false,
        message: "All Fields are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and Confirm Password do not match. Please try again.",
      });
    }
 

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(200).json({
        success: true,
        message: "User already exists. Please sign in to continue.",
      });
    }

    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    console.log("your otp db response",response);
    if (!response.length) {
      return res.status(400).json({
        success: false,
        message: "The OTP is not valid",
      });
    } else if (otp !== response[0].otp) {
      return res.status(400).json({
        success: false,
        message: "The OTP is not valid",
      });
    }

   
    
    const hashedPassword = await  bcrypt.hash(password, 10);
    console.log("hashed password",hashedPassword);

    // let approved = "";
    // approved === "Instructor" ? (approved = false) : (approved = true);

    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });
    

    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType: accountType,
      // approved: approved,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/9.x/initials/svg?seed=${firstName+lastName}`,
    });

    return res.status(200).json({
      success: true,
      user,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again.",
    });
  }
};


//Login

exports.login = async (req, res) => {
  try {
    //fetch data
    const { email, password } = req.body;

    console.log("email and password Login", { email, password });

    if (!email || !password) {
      console.log("Login data not proper");
      return res.status(400).json({
        success: false,
        message: "Enter data Properly",
      });
      
    }

    //check pass and email or check user exist
    const user = await User.findOne({ email }).populate("additionalDetails");
    if (!user) {
      console.log("user not signup");
      return res.status(400).json({
        success: false,
        message: "User not SignUp , SignUp First",
      });
    
    }

    //if user exist check pss and generate jwt token

    const match = await bcrypt.compare(password, user.password);
    console.log("password match on log in",match);

    let payload = {
      id: user._id,
      email: user.email,
      role: user.accountType,
    };
    if (match) {
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: 24*60*60,
      });
      user.token = token;
      user.password = undefined;

      // Set cookie for token and return success response
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: `User Login Success`,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: `Password is incorrect`,
      });
    }

    console.log("Login Succesfully");
  } catch (e) {
    console.log("Error in login", e);
    return res.status(500).json({
      success: false,
      message: "not login caught error",
    });
   
  }
};


exports.changePassword = async (req, res) => {
  try {
    const userDetails = await User.findById(req.user.id);
    console.log("user details", userDetails);

    const { oldPassword, newPassword } = req.body;

    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    );
    console.log("is password match", isPasswordMatch);
    if (!isPasswordMatch) {
      return res.status(401)
      .json({ success: false, message: "The password is incorrect" });
      
    }

    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true }
    );

    try {
      const emailResponse = await mailSender(
        updatedUserDetails.email,
        "Password for your account has been updated",
        passwordUpdated(
          updatedUserDetails.email,
          `Password update
          d successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
        )
      );
      console.log("Email sent successfully:", emailResponse.response);
    } catch (error) {
      console.error("Error occurred while sending email:", error);
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email",
        error: error.message,
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Error occurred while updating password:", error);
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password",
      error: error.message,
    });
  }
};

