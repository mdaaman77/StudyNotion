const {contactUsEmail}  = require("../Template/ContactForm");
const MailSender = require("../utils/MailSender");


exports.contactUsController = async (req, res) => {

    //fetch data
    const { email, firstName, lastName, message, phoneNo, countryCode } =
      req.body;
    console.log(req.body);
    //send email to user
    try {
      await MailSender(
        email,
        "Your Data send successfully",
        contactUsEmail(email, firstName, lastName, message, phoneNo, countryCode)

      );
          
      await MailSender(
        process.env.MAIL_USER,
        "This student want to contact Us",
        contactUsEmail(email, firstName, lastName, message, phoneNo, countryCode)

      );


      return res.json({
        success: true,
        message: "Email send successfully",
      });
    } catch (error) {
      console.error(error);
      return res.json({
        success: false,
        message: "Something went wrong...",
      });
    }
  };