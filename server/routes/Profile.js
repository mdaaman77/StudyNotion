
const express = require("express");
const router = express.Router();


const { auth, isInstructor } = require("../middlewares/auth");
const {updateProfile,deleteUserAccount,getAllDetails,updateDisplayPicture,instructorDashboard } = require("../controllers/Profile");
// const { deleteModel } = require("mongoose");

router.put("/updateProfile", auth, updateProfile);
router.delete("/deleteProle",auth,deleteUserAccount)
router.get("/getUserDetails", auth, getAllDetails);
router.put("/updateDisplayPicture", auth, updateDisplayPicture);
router.get("/instructorDashboard", auth, isInstructor, instructorDashboard);

// router.get("/getEnrolledCourses", auth, getEnrolledCourses);

module.exports = router;
