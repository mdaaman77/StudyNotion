const cloundinary = require("cloudinary").v2;
require("dotenv").config();

exports.cloundinary = async ()=>{
    try{
         
        cloundinary.config({
            cloud_name: process.env.CLOUD_NAME,
            api_key: process.env.API_KEY,
            api_secret: process.env.API_SECRET,
        })
        console.log("Cloudinary connected Successfully");
        }
    catch(e){
        console.log("error on config cloudiary");
        console.log(e);


    }
}
