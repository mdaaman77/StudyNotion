const Category = require("../models/Category");
const Course = require("../models/Course");
const User = require("../models/User");
const CourseProgress = require("../models/CourseProgress");
const { uploadFileOnCloudinary } = require("../utils/fileUpload");
const {convertSecondsToDuration} = require("../utils/secToDuration");
const Section = require("../models/Section");
const SubSection= require("../models/SubSection");
require("dotenv").config();

//deleteCourse
//editCourse

//create course by an instructor in Db

exports.createCourse = async (req, res) => {
  try {
    //fetch data
    const {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      tag,
      category,
      // status,
      instructions: _instructions,
    } = req.body;

    //fetch thumbnail
    const thumbnail = req.files.thumbnailImage;

    //validate data
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag ||
      !category ||
      // !status ||
      !_instructions
    ) {
      return res.status(401).json({
        success: false,
        message: "All Fields Are Mandetory",
      });
    }

    //find the instructor user_id
    const instructorID = req.user.id;
    const instructorDetails = await User.findById(instructorID, {
      accountType: "Instructor",
    });
    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found",
      });
    }

    //check the given category is valid or not for testing purpose only
    const categoryDetails = await Category.findById(category);
    console.log("category Details" ,categoryDetails);
    if (!(categoryDetails)) {
      return res.status(404).json({
        success: false,
        message: "Enter valid category",
      });
    }

    //check thumbnail type
    const fileType = ["jpeg","png","jpg","webp"];

    console.log(thumbnail);
    let fetchFileType = (thumbnail.name.split(".")[1]).toLowerCase();
    console.log(fetchFileType);
    if (!fileType.includes(fetchFileType)) {
      return res.status(401).json({
        success: false,

        message: "Invalid Image Type",
      });
    }

    //upload image in cloundinary
    const thumbnailImage = await uploadFileOnCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    //create entry in Db
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn: whatYouWillLearn,
      price,
      tags:tag,
      category: categoryDetails._id,
      thumbnail: thumbnailImage.secure_url,
      // status: status,
      _instructions,
    });

    //push course in instructor in DB

    const updateInstructorDetails = await User.findByIdAndUpdate(
      { _id: instructorID },
      {
        $push: { courses: newCourse._id },
      },
      { new: true }
    );

    //push entry in category

    //const updatecategory = await Category.findByIdAndUpdate({ _id: category },{$push:{courses:newCourse._id}},{new:true}).populate("courses");
    const updatecategory= await Category.findByIdAndUpdate(
      { _id: category },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    );
    console.log("course created Successfully but not Publish yet and updated category ",updatecategory);

    res.status(200).json({
      success: true,
      data: newCourse,
      message: "Course Created Successfully",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Failed to create course",
      error: e.message,
    });
  }
};

//show all courses
exports.getAllCourses = async (req, res) => {
  try {
    //get all course
    const allCourses = await Course.find(
      {},
      {
        courseName: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReviews: true,
        studentsEnrolled: true,
      }
    )
      .populate("instructor")
      .exec();

    return res.status(200).json({
      success: true,
      data: allCourses,
    });
  } catch (e) {
    console.log(error);
    return res.status(404).json({
      success: false,
      message: `Can't Fetch Course Data`,
      error: error.message,
    });
  }
};

//show every details of course by courseID including course duration

exports.getCourseDetails = async (req, res) => {
 
    

  try {
    //fetch couserID
    const { courseID } = req.body;
    //verify
    console.log("courseID",courseID)
    if (!courseID) {
      return res.status(400).json({
        success: false,
        message: "courseID not found",
      });
    }

    //get details
   
    const courseDetails = await Course.findOne({
      _id: courseID,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      //.populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
          select: "-videoUrl",
        },
      })
      .exec();

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseID}`,
      });
    }

        //get duration
        let totalDurationInSeconds = 0;
        courseDetails.courseContent.forEach((content)=>{
          content.subSection.forEach((subSection)=>{
            const timeDurationInSeconds = parseInt(subSection.timeDuration);
            totalDurationInSeconds += timeDurationInSeconds;
          })
        })

        const totalDuration =  convertSecondsToDuration(totalDurationInSeconds);
 
        console.log("totalDuration of a course", totalDuration);
        console.log("course details",courseDetails);

        return res.status(200).json({
          success: true,
          data: {
            courseDetails,
            totalDuration,
          },
        });
  
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: "course details not found ,some error",
      error: e.message,
    });
  }
};

//get all courses of insturctor 
exports.getInstructorCourses = async (req, res) => {
  try {
    const userID = req.user.id;

    if (!userID) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const instructorAllCourse = await User.findById({ _id: userID })
      .select("courses")
      .populate("courses")
      .exec();
    if (!instructorAllCourse.length == 0) {
      return res.status(200).json({
        success: true,
        message: "no course publish yet by Instructor",
      });
    }
    console.log("instructor all course", instructorAllCourse);

    return res.status(200).json({
      success: true,
      message: "course Details fetch successfully",
      instructorAllCourse,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: "course details not found ,some error",
      error: e.message,
    });
  }
};

//get full course including course completed
exports.getFullCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      //.populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "Section",
          populate: {
            path:"subSection",
          }
        },
      })
      .exec();

    let courseProgressCount = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    });

    console.log("courseProgressCount : ", courseProgressCount);

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      });
    }

    let totalDurationInSeconds = 0;
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration);
        totalDurationInSeconds += timeDurationInSeconds;
      });
    });

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
        completedVideos: courseProgressCount?.completedVideos
          ? courseProgressCount?.completedVideos
          : [],
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


//edit course have to check
exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const updates = req.body;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (req.files) {
      console.log("thumbnail update");
      const thumbnail = req.files.thumbnailImage;
      const thumbnailImage = await uploadFileOnCloudinary(
        thumbnail,
        process.env.FOLDER_NAME,
      );
      course.thumbnail = thumbnailImage.secure_url;
    }

    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        if (key === "tag" || key === "instructions") {
          course[key] = JSON.parse(updates[key]);
        } else {
          course[key] = updates[key];
        }
      }
    }

    await course.save();

    const updatedCourse = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    res.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

//delete course
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const studentsEnrolled = course.studentsEnrolled;
    for (const studentId of studentsEnrolled) {
      await User.findByIdAndUpdate(studentId, {
        $pull: { courses: courseId },
      });
    }

    const courseSections = course.courseContent;
    for (const sectionId of courseSections) {
      const section = await Section.findById(sectionId);
      if (section) {
        const subSections = section.subSection;
        for (const subSectionId of subSections) {
          await SubSection.findByIdAndDelete(subSectionId);
        }
      }

      await Section.findByIdAndDelete(sectionId);
    }

    await Course.findByIdAndDelete(courseId);

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};