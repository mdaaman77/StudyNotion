const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User= require("../models/Course");
require("dotenv").config();
const {mailSender} = require("../utils/MailSender");




const {courseEnrollmentEmail}= require("../Template/CourseEnrollment");
const {paymentSuccessEmail} = require("../Template/PaymentSuccessMail");
const CourseProgress = require("../models/CourseProgress");

exports.createOrderPayment = async (req,res)=>{
    try{
          //fetch data courseID and userID
          const {courseID,userID} = req.body;

          //validate courseID
          if(!courseID){
            return res.status(400).json({
                success:false, 
                message:"Course ID is required"});
          }

          //check in db
          const course = await Course.findOne({id:courseID});
          if(!course){
            return res.status(400).json({
                success:false,
                message:"course not Found"
            })
          }

         //check if user already paid
       

         if(course.studentsEnrolled == userID){
            return res.status(400).json({
                success:false,
                message:"You have already enrolled in this course"
            })

         }

         //create order
         const amount = course.price;
         const currency = "INR";
         const notes = {courseID:courseID,
            userID:userID};
      const reciept = Math.random(Date.now()).toString();
      const options = {
        amount,
        currency,
        receipt:reciept,
        notes
      }


      //order for course
      try {
        const order = await instance.orders.create(options);
        console.log(order);
      }
      catch(e){
        console.log(e);
        return res.status(400).json({
            success:false,
            message:"failed to create ordere by razorpay"
        })
      }

      return res.status(200).json({
        success:true,
        message:"order created Successfully",
        courseName:course.CourseName,
        courseDescription : course.courseDescription,
        courseID:courseID,
        orderID:order.id,
        orderAmount:order.amount,
        currency : order.currency,
        order
      }
      )



          
    }catch(e){
        res
        .status(500)
        .json({ success: false, message: "Could not initiate order." });
    }
}


//verify payment Authroized step 

exports.verifyPayment = async (req,res)=>{
  try{
    //get signature webhook of razorpay
    const signature = req.header["x-razorpay-signature"];

    const secretKey = crypto.createHmac("sha256",process.env.WEBHOOK_SECRET);
    secretKey.update(JSON.stringify(req.body))
    .digest("hex");
    if(signature == secretKey){
      console.log("payment verified");
      console.log("secrete key encrypted", secretKey);
      

      //fetch userID and courseID from notes
      const notes = req.body.payload.entity.notes;
      //push course in user schema
      const userDetails = await User.findByIdAndUpdate({_id:notes.userID},{
        $push:{courses:notes.courseID}},
        {new:true},
      )
      .populate("courses")
      .exec();
      
      if(!userDetails){
        return res.status(404).json({success:false,message:"User not found"})
      }
      console.log("userDetails after updating course", userDetails);
     
      //push student in course schema
      const courseDetails = await Course.findByIdAndUpdate({_id:notes.courseID},
        {
          $push:{studentsEnrolled:userID},

        },
        {new:true}

      ).populate("studentEnrolled").exec();

      

if(!courseDetails){
  return res.status(404).json({success:false,message:"Course not found"})
}

console.log("course deatails after updating studnet",courseDetails
)
;


//send mail 
/*


*/

return res.status(200).json({
  success:true,
  message:"Payment Verify successfull"
})

    }
  }catch(e){
    console.log("error in payment verify",e)
    return res.status(400).json({
      success:false,
      message:"something went wrong while verify payment",
      error:e.message
    });


  }
}


exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body;

  const userId = req.user.id;

  if (!orderId || !paymentId || !amount || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all the details" });
  }

  try {
    const enrolledStudent = await User.findById(userId);

    await mailSender(
      enrolledStudent.email,
      `Payment Received`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    );
  } catch (error) {
    console.log("error in sending mail", error);
    return res
      .status(400)
      .json({ success: false, message: "Could not send email" });
  }
};

// const enrollStudents = async (courses, userId, res) => {
//   if (!courses || !userId) {
//     return res
//       .status(400)
//       .json({
//         success: false,
//         message: "Please Provide Course ID and User ID",
//       });
//   }

//   for (const courseId of courses) {
//     try {
//       const enrolledCourse = await Course.findOneAndUpdate(
//         { _id: courseId },
//         { $push: { studentsEnroled: userId } },
//         { new: true }
//       );

//       if (!enrolledCourse) {
//         return res
//           .status(500)
//           .json({ success: false, error: "Course not found" });
//       }
//       console.log("Updated course: ", enrolledCourse);

//       const courseProgress = await CourseProgress.create({
//         courseID: courseId,
//         userId: userId,
//         completedVideos: [],
//       });

//       const enrolledStudent = await User.findByIdAndUpdate(
//         userId,
//         {
//           $push: {
//             courses: courseId,
//             courseProgress: courseProgress._id,
//           },
//         },
//         { new: true }
//       );

//       console.log("Enrolled student: ", enrolledStudent);

//       const emailResponse = await mailSender(
//         enrolledStudent.email,
//         `Successfully Enrolled into ${enrolledCourse.courseName}`,
//         courseEnrollmentEmail(
//           enrolledCourse.courseName,
//           `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
//         )
//       );

//       console.log("Email sent successfully: ", emailResponse.response);
//     } catch (error) {
//       console.log(error);
//       return res.status(400).json({ success: false, error: error.message });
//     }
//   }
// };
