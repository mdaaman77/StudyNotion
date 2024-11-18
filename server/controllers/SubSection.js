const subSection = require("../models/SubSection");
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const { uploadFileOnCloudinary } = require("../utils/fileUpload");


//create subSection 

exports.createSubSection =  async (req,res)=>{
    try{
    //fetch data
    const {title,timeDuration,description,sectionID} = req.body;
    //fetch video 
    const videoFile = req.files.courseVideo;
    //validate
    if(!title || !timeDuration || !description ){
        return res.status(400).json({
            success:false,
            message:"All Fields are Mandatory"
        })

    }

    //upload video into cloudinay
    const responseVideo = await uploadFileOnCloudinary(videoFile,process.env.FOLDER_NAME);
console.log("response after posting video on cloudinary",responseVideo);

    //create subSection
    const subSection = await SubSection.create({
        title:title,
        timeDuration:`${responseVideo.duration}`,
        description:description,
        videoUrl:responseVideo.secure_url,
    })

    //update subSection ID on Section 
    const updateSection = await Section.findByIdAndUpdate(sectionID,
        {$push:{subSection:subSection._id}},
        {new:true})
        .populate("subSection")
        .exec();
        

                                    

    console.log("subSection is ", subSection);
    console.log("Section is ",updateSection);



    //send response 
    res.status(200).json({
        success:true,
        message:"subSection created SUCCESSFULLY",
        updateSection:updateSection,


    })
}

    catch(e){
        console.error("Error creating new sub-section:", error);
        return res.status(500).json({
          success: false,
          message: "Internal server error",
          error: error.message,
        });
        
    }
}




//update SubSection 


exports.updateSubSection = async (req,res)=>{
    try {
    //fetch data from req body
    const {sectionID, subSectionID, title, description} = req.body;

    //get data from DB
    const subSectionDetails = await SubSection.findById(   subSectionID);

    if(!subSectionDetails){
        return res.status(400).json({
            success:false,
            message:"SubSection not Found"
        }
        );
    }

    console.log("subSection has to update", subSectionDetails);


    //check if title has changed 
    if (title != undefined){
        subSectionDetails.title = title;
    }
    //check if description has changed
    if(description != undefined){
        subSectionDetails.description =  description;
    }

    //check if video if changed 
    if(req.files && req.files.courseVideo != undefined){
        const fileVideo = req.files.courseVideo;
        //upload on cloundinary
        const uploadResponse = await uploadFileOnCloudinary(fileVideo.tempFilePath, process.env.FOLDER_NAME);
        console.log("update SubSection video response", uploadResponse)
        //update video url in DB
        subSectionDetails.videoUrl=uploadResponse.secure_url;
        subSectionDetails.timeDuration=`${uploadResponse.timeDuration}`;

         
    }

    //save info in DB
    await subSection.save();


    //get new updated details from DB and send to res so user can see updated data

    const updatedSubSection = await Section.findById(sectionID).populate("subSection");
    console.log("updated subsection section",updatedSubSection);

    //sent response
    res.status(200).json({
        success:true,
        message:"Section updated Successfully",
        data:updatedSubSection,
    }
    )
}
    catch(e){
        console.error(error);
       return res.status(500).json({
      success: false,
      message: "An error occurred while updating the section",
    });
    }
}


//deleted subSection 

exports.deleteSubSection = async (req,res)=>{
    try {
    //fetch sectionID and subSectionID
    const {sectionID,subSectionID} = req.body;

    //validate subSection
    const subSectionDetails = await SubSection.findById(subSectionID);
    

     //delete from DB
     await Section.findByIdAndUpdate(
        { _id: subSectionID },
        {
          $pull: {
            subSection: subSectionID,
          },
        }
      );
      const subSection = await SubSection.findByIdAndDelete({
        _id: subSectionID,
      });
      if (!subSection) {
        return res
          .status(404)
          .json({ success: false, message: "SubSection not found" });
      }



      return res.json({
        success: true,
        message: "SubSection deleted successfully",
        data: updatedSection,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while deleting the SubSection",
      });
    }
}
