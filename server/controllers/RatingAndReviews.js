const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const User = require("../models/User");


//create rating and review 
exports.createRatingDetails = async (req,res)=>{
    try{
        //fetch courseID and userID
        const {courseID,rating,review} = req.body;
        const userID = req.userID;

        //validate couseID 
        if(!courseID ){
            return res.status(400).json({message:"Course ID is required"});
        }
        if(!rating || !review){
            return res.status(400).json({message:"Rating and Review are required"});
        }


        //find user
        const userDetails= await User. findById(userID);
        if(!userDetails){
            return res.status(400).json({message:"User not found"});
        }
        //check user enrolled or not 

        
        /* const courseDetails = await Course.findOne({
             _id: courseId,
             studentsEnroled: { $elemMatch: { $eq: userId } },
          }); */
      
        if(!userDetails.courses.includes(courseID)){
             return res.status(400).json({success:false,message:"user not enrolled in course"})
        }

        //if user already review in course
        const existingUserRating = await RatingAndReviews.findById({_id:userID});
        if(existingUserRating){
            return res.status(400).json({success:false,message:"User already reviewed this course"})
        }

        //create rating and review 
        const ratingDetails = new RatingAndReviews.create({
            user:userID,
            rating,
            review,
            course:courseID,
        });

        //update rating id in course
        const courseDetails = await Course.findByIdAndUpdate(courseID,{
            $push:{ratingAndReview:ratingDetails._id}},
            {new:true},
        ).populate("ratingAndReview").exec();
             if(!courseDetails){
                return res.status(400).json({message:"Course not found"});
             }
             console.log("user Rating and Reivew ",ratingDetails);
             console.log("course Rating and Reivew ",courseDetails);
             
 
             //return res
              return res.status(200).json({
                success:true,
                message:"Rating and Review added successfully",
              })




    }catch(e){
console.log("error on rating",e);
        res.status(500).json({
            success: false,
            message: "error found in creating rating and review",
            error: error.message,
          });

    }
}



//getAvg Rating 

exports.getAvgRating = async (req,res)=>{
    try{
        //fetch courseID
        const {courseID}= req.body;
        if(!courseID){
            return res.status(400).json({message:"Course ID is required"});
        }
        //fetch course details
            //avgRatingDetails return array
       const avgRatingDetails= await RatingAndReview.aggregate([

        {
            $match: {course:new mongoose.Types.objectID(courseID)},
           
        },{
            $
            
            
            
            
            
            :{
                _id:null,
                averageRating:{$avg:"$rating"}
            }
        }
       ]);

          //check length of avgRatingDetails
          if(avgRatingDetails.length == 0){
            //it is also a success case
            return res.status(200).
            json({
                success:true,
                message:"No ratings found for this course"})
          }
           
          console.log("avgRatingDetails responose ",avgRatingDetails);
          //return avgRatingDetails
          return res.status(200).json({
            success:true,
            message:"avg rating done",
            data:avgRatingDetails.averageRating,

          }
          )






    }catch(e){
        console.log("error on getting avg rating",e);
        res.status(500).json({
            success: false,
            message: error.message,
            
          });


    }
}


//get all rating
//extra


exports.getAllRatingDetails= async (req,res)=>{
    try{

     const allRatingDetails = await RatingAndReview.find({})
                                                             .sort({rating:"desc"})
                                                               .populate({path:"user",select:"firstName lastName email image"})
                                                                 .populate({
                                                                    path:"course",
                                                                    select:"courseName"
                                                                 }).exec();
     console.log("allRatingDetails ",allRatingDetails);
     if(allRatingDetails.length == 0){
        return res.status(200).json({
            success:true,
            message:"No rating yet",

        })


     }

      res.status(200).json({
        success:true,
        message:"No rating yet",
        data:allRatingDetails,
      })
        
    }catch(e){
        console.log("error on getting all rating",e);
        res.status(500).json({
            success: false,
            message: error.message,
            
          });

    }
}


//get rating of particular course 

exports.allRatingOfCourse=async (req,res)=>{
    try{
        //fetch data
        const {courseID} = req.body;
        //validate in DB
        const course = await Course.findById(courseID);
        if(!course){
            return res.status(404).json({
                success:false,
                message:"Course not found",
            })
        }
 
        //fetch rating of course
        const allRating = await course.populate({
            path: "ratingAndReview",
            populate: [
                { path: "user" },
                { path: "course" }
            ]
        }).exec();

        console.log("all rating of particular course", allRating);
        if(!allRating){
            return res.status(200).json({
                success:false,
                message:"no rating yet on this course"
            })
        }

        return res.status(200).json({
            success:true,
            message:"all rating of this course" `${course.CourseName}`,
            data:allRating
        })
        


    }catch(e){
        console.log("error on getting  rating of particular course",e);
        res.status(500).json({
            success: false,
            message: error.message,
            
          });

    }
}