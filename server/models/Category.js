const mongoose = require("mongoose");
const Course = require("./Course");
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  
  //Category for this course
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  }],
});

module.exports = mongoose.model("Category", categorySchema);
