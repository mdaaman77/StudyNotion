const Section = require("../models/Section");
const Course = require("../models/Course");

//create section in DB
exports.createSection = async (req, res) => {
  try {
    //fetch data
    const { sectionName, courseID } = req.body;

    //validate data
    if (!sectionName || !courseID) {
      return res.status(400).json({
        success: false,
        message: "Missing required Properties",
      });
    }

    //create entry in Section DB
    const sectionDetails = await Section.create({
      sectionName: sectionName,
    });

    //update section in course DB
    const updateCourseDetails = await Course.findByIdAndUpdate(
      { _id: courseID },
      {
        $push: {
          courseContent: sectionDetails._id,
        },
      }
      ,{new:true}
    )
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    //return response
    res.status(200).json({
      success: true,
      course: updateCourseDetails,
      message: "Section created Successfully",
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

//update section

exports.updateSection = async (req, res) => {
  try {
    //fetch data
    const { sectionName, sectionID, courseID } = req.body;

    //vaidate
    if (!sectionName || !sectionID || !courseID) {
      return (
        res.status(400),
        json({
          success: false,
          message: "Please fill all the fields",
        })
      );
    }
    //update in db
    const updateSection = await Section.findByIdAndUpdate(
      sectionID,
      { $set: { sectionName: sectionName } },
      { new: true }
    );

    //send  course detail in res from db also
    const course = await Course.findById(courseID)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    console.log(course);
    res.status(200).json({
      success: true,
      message: updateSection,
      data: course,
    });
  } catch (e) {
    console.error("Error updating section:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

//delete section

exports.deleteSection = async (req, res) => {
  try {
    const { sectionID } = req.body;

    //check valid
    if (!sectionID) {
      return res.status(400).json({
        success: false,
        message: "sectionID not found",
      });
    }

    //delete from db
    const deletedSection = await Section.findByIdAndDelete(sectionID,{new:true});                               
    console.log("deleted section",deletedSection);
    res.status(200).json({
      success: true,
      message: "Section Deleted Successfully",
      section: deletedSection,
    });
  } catch (e) {
    console.log("Error deleting section:", e);
   return res.status(500).json({
      success: false,
      message: "error in deleting section",
     
    });
  }
};
