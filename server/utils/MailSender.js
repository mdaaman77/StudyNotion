const nodemailer = require("nodemailer");

const mailSender= async (email,title,body)=>{
    try{
             
let  transporter = nodemailer.createTransport({
    host:process.env.MAIL_HOST,
    auth:{
        user:process.env.MAIL_USER,
        pass:process.env.MAIL_PASS,

    }

}) 


let info = transporter.sendMail({
    from:"StudyNotion || Marketing Team",
    to:`${email}`,
    subject:`${title}`,
    html:`${body}`,
})
console.log(info);
return info;

    }catch(e){
        console.log(e.message);
        console.error(e);
        pr
    }
}

module.exports = mailSender;