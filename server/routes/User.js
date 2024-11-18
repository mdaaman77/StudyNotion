


// const {
//   resetPasswordToken,
//   resetPassword,
// } = require("../Controller/ResetPassword");







// router.post("/reset-password-token", resetPasswordToken);

// router.post("/reset-password", resetPassword);





const express= require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");

const {signUp,login,sendOTP,changePassword} = require("../controllers/auth");
const { resetPasswordToken, resetPassword } = require("../controllers/ResetPassword");

router.post("/sendotp",sendOTP);
router.post("/SignUp",signUp);
router.post("/login",login);
router.post("/changePassword",auth,changePassword);
router.post("/reset-password-token", resetPasswordToken);
router.post("/reset-password", resetPassword);


module.exports = router;