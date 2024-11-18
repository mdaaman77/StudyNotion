
const express = require("express");
const router = express.Router();



const {createCategory,showAllCategories,categoryPageDetails} = require("../controllers/Category");
const {createSubSection,deleteSubSection,updateSubSection} = require("../controllers/SubSection");
const {createSection,deleteSection,updateSection} = require("../controllers/Section");
const {getCourseDetails,getAllCourses,createCourse,getInstructorCourses,getFullCourseDetails,deleteCourse,editCourse} = require("../controllers/Course");
const {updateCourseProgress} = require("../controllers/CourseProgress");
const {createRatingDetails,getAllRatingDetails,getAvgRating}= require("../controllers/RatingAndReviews");
const {auth,isInstructor,isStudent,isAdmin} = require("../middlewares/auth");





//router call for Section
router.post("/addSection",auth,isInstructor,createSection);
router.post("/updateSection",auth,isInstructor,updateSection);
router.delete("/deleteSection",auth,isInstructor,deleteSection);


//router call for subSection
router.post("/addSubSection",auth,isInstructor,createSubSection);
router.delete("/deleteSubSection",auth,isInstructor,deleteSubSection);
router.post("/updateSubSection",auth,isInstructor,updateSubSection);

//router call for courses
router.post("/createCourse",auth,isInstructor,createCourse);
router.get("/getInstructorCourses",auth,isInstructor,getInstructorCourses);;
router.get("/getAllCourses",getAllCourses);
router.get("/getCourseDetails", getCourseDetails);
router.post("/getFullCourseDetails", auth, getFullCourseDetails);
router.delete("/deleteCourse",auth,isInstructor, deleteCourse);
router.post("/editCourse",auth,isInstructor,editCourse);


//router call for courseProgress
router.post("/updateCourseProgress",auth,isStudent,updateCourseProgress);


//router call category
router.post("/createCategory",auth,isAdmin,createCategory);
router.get("/showAllCategories", showAllCategories);
router.post("/getCategoryPageDetails", categoryPageDetails);

//router call for rating and review
router.post("/createRating", auth, isStudent, createRatingDetails);
router.get("/getAverageRating", getAvgRating);
router.get("/getReviews", getAllRatingDetails);

module.exports = router;