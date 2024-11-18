
const express = require("express");
const router = express.Router();
const {createOrderPayment,verifyPayment,sendPaymentSuccessEmail} = require("../controllers/Payments");

const {auth,isStudent}= require("../middlewares/auth");

router.post("/capturePayment",auth,isStudent,createOrderPayment);
router.post("/verifyPayment",auth,isStudent,verifyPayment);
router.post("/sendPaymentSuccessEmail",auth,isStudent,sendPaymentSuccessEmail);

module.exports = router;

