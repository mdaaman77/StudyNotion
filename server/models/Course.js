const mongoose = require("mongoose");
const User = require("./User");
const Category = require("./Category");
const Section = require("./Section");



const courseSchema = new mongoose.Schema({
  CourseName: {
    type: String,
  },
  courseDescription: {
    type: String,
    trim: true,
    required: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  whatYouWillLearn: {
    type: String,
    trim: true,
  },
  courseContent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
    },
  ],
  ratingAndReview: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RayingAndReview",
  },
  price: {
    type: Number,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  tags:{
    type:[String],
    required:true
  },
  studentsEnrolled: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, 
    },
  ],
});

module.exports = mongoose.model("Course", courseSchema);
