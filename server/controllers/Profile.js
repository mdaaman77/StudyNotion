const Course = require("../models/Course");
const Profile = require("../models/Profile");
const User= require("../models/User");
const {uploadFileOnCloudinary} = require("../utils/fileUpload");


//getEnrolledCourses



//update Profile because we already create it when we were signing up 


exports.updateProfile = async (req,res)=>{
    try {
    //fetch userID and data
    const userID  = req.user.id;
    const {
        firstName = "",
        lastName = "",
        dateOfBirth = "",
        about = "",
        contactNumber = "",
        gender = "",
      } = req.body;

      const user = await User.findById(userID);
      console.log("update profile of this user ",user);
      const profile = await Profile.findById({_id:user.additionalDetails});
      console.log("update profile of this profile id ",profile);
      //update user 
      user.firstName = firstName;
      user.lastName=lastName;
      await user.save();

      //updatae profile
      profile.dateOfBirth=dateOfBirth;
      profile.about=about;
      profile.contactNumber=contactNumber;
      profile.gender=gender;
      await profile.save();

      //send updated user details
      const updatedUser= await User.findById(userID).populate("additionalDetails").exec();
      console.log("updated user profile",updatedUser)
      return res.json({
        success: true,
        message: "Profile updated successfully",
        updatedUser,
      });

           
    

}catch(e){
    console.log(e);
    return res.status(500).json({
      success: false,
      message: e.message,
    });
}
}


 
//delete account 

exports.deleteUserAccount = async (req,res)=>{
try{
    //fetch userID
    const userID = req.user.id;
    
    //search user 
    const userDetails= await User.findById(userID);
    if(!userDetails){
        return res.status(404).json({
            success:false,
            message:"User not found"
        })
    }


    //delete profile 
    await Profile.findByIdAndDelete({
        _id: new mongoose.Types.ObjectId(User.additionalDetails),
      });

    //remove all enrolled cousrse from student course enrolled 
    for(const courseID of User.courseID){
        await Course.findByIdAndUpdate({courseID},
            {
                $pull:{ studentsEnroled: id },

            },{new : true}

        )

    }


    //remove from user
    await User.findByIdAndDelete({ _id: id });
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
}
    catch(e){
        console.log(error);
        res
          .status(500)
          .json({ success: false, message: "User Cannot be deleted successfully" });
      
    }
}


//get all user details

exports.getAllDetails = async (req,res)=>{
    try{
          //fetch data
          const userID= req.user.id;

          const userDetails = await User.findById(userID).populate("additionalDetails").exec();
          console.log("user presonal details", userDetails);
        
          res.status(200).json({
            success:true,
            message:"User all Personal details ",
            userDetails,
          })
    }
    catch(e){
        console.error(e);
        res.status(400).json({
            success:false,
            message:"something went wrong fetch user personal details"
             ,
             error:e.message,
             
        })


    }
} 


//update pp 
exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture;
      const userId = req.user.id;
      console.log("display picture this "+`${displayPicture}`+" on this user id "+`${userId}`);
      const image = await uploadFileOnCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      );
      console.log("image details ",image);
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      );
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      });
    } catch (error) {
        console.log(error);
      return res.status(500).json({
        success: false,
        message: "error on updating image",
      });
    }
  };



  //instructor dashboard

  exports.instructorDashboard = async (req, res) => {
    try {
      const courseDetails = await Course.find({ instructor: req.user.id });
  
      const courseData = courseDetails.map((course) => {
        const totalStudentsEnrolled = Course.studentsEnroled.length;
        const totalAmountGenerated = totalStudentsEnrolled * course.price;
  
        const courseDataWithStats = {
          _id: course._id,
          courseName: course.courseName,
          courseDescription: course.courseDescription,
  
          totalStudentsEnrolled,
          totalAmountGenerated,
        };
  
        return courseDataWithStats;
      });
  
      res.status(200).json({ courses: courseData });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error" });
    }
  };