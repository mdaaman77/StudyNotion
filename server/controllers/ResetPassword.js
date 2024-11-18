const Validator = require("email-validator");
const User = require("../models/User");
const mailSender = require("../utils/MailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
//resetPassword generate link through token and send into mail via sendMailer function in utils folder

exports.resetPasswordToken = async (req, res) => {
  try {
    //fetch email form body
    const { email } = req.body;
    //check if email is valid
    if (!email ) {
      return res.status(400).json({ message: "Enter valid email" });
    }

    //check email in DB
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: `User not registered with ${email}` });
    }

    //generate token for user
   
    const token = crypto.randomBytes(20).toString("hex");
    console.log("token generate for reset pss");

    const updateUser = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        expireToken: Date.now() + 5 * 60 * 1000,
      },
      { new: true }
    );

    //generate link of UI for send in email

    const Url = `http://localhost:3000/update-password/${token}`;

    //send url to mail using mailsender

    const sendMail = await mailSender(
      email,
      "Click here for RESET YOUR PASSWORD",
      Url
    );
    console.log(sendMail);

    res.json({
      success: true,
      message:
        "Email Sent Successfully, Please Check Your Email to Continue Further",
        
    });
  } catch (error) {
    return res.json({
      error: error.message,
      success: false,
      message: `Some Error in Sending the Reset Message`,
    });
  }
  // console.log(error);
};

//save new Password in DB

exports.resetPassword = async (req, res) => {
  try {
    //fetch data form req body as we know we can get only password and new password but our frontend will send token from url so  we can find the
    //user using token and then we can update the password of that user
    const { password, confirmPassword,token } = req.body;
    


    if (password != confirmPassword) {
      return res.json({
        success: false,
        message: "Password and Confirm Password does not match",
      });
    }


      //get user from db using token
       
       
      const userDetails = await User.findOne({token : token });


      //no entry of user in DB

      if (!userDetails) {
        console.log("User not found with same token");
        return res.status(401).json({
          success: false,
          message: "Invalid User",
        
        });
        

      }

      //check token time expires
      if (userDetails.expireToken < Date.now()) {
        console.log("Link expires , generate link again");
        return res.status(400).json({

          success: false,
          message: "Link Expire , Reset Password Again",
          
        });
        
      }

      //hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      //update in db
      await User.findOneAndUpdate(
        { token: token },
        { password: hashedPassword },
        { new: true }
      );

      res.json({
        success: true,
        message: `Password Reset Successfull`,
      });
    
  } catch (e) {
    console.log("error",e);
    return res.json({
      
      success: false,
      message: `Some Error in Updating the Password`,
    });
  }
}
