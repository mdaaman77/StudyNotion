const Category = require("../models/Category");

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

//create category by admin
exports.createCategory = async (req, res) => {
    try {
        //fetch data
      const { name, description } = req.body;
      //validate
      if (!name) {
        return res
          .status(400)
          .json({ success: false, message: "All fields are required" });
      }
      //create category

      const CategorysDetails = await Category.create({
        name: name,
        description: description,
      });


      console.log(CategorysDetails);

      //return res
      return res.status(200).json({
        success: true,
        message: "Category Created Successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: true,
        message: error.message,
      });
    }
  };


//show all catgory 
  exports.showAllCategories = async (req, res) => {
    try {
        //find all category 
      const allCategories = await Category.find().populate("courses");
    //   const categoriesWithPublishedCourses = allCategories.filter((category) =>
    //     category.courses.some((course) => course.status === "Published")
    //   );

      res.status(200).json({
        success: true,
        data: allCategories,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
}


//categry page details

exports.categoryPageDetails = async (req, res) => {
    try {
        //fetch data 
      const { categoryId } = req.body;
               //get course of that category
      const selectedCategory = await Category.findById(categoryId)
        .populate({
          path: "courses",
          // match: { status: "Published" },
          // populate: "ratingAndReviews",
        })
        .exec();
        console.log("select category details",selectedCategory);
        
               //if category not exist
      if (!selectedCategory) {
        console.log("Category not found.");
        return res
          .status(404)
          .json({ success: false, message: "Category not found" });
      }
  
      //if no course is published on that category
      if (selectedCategory.courses.length == 0) {
        console.log("No courses found for the selected category.");
        return res.status(200).json({
          success: true,
          message: "No courses found for the selected category.",
        });
      }
          
      //random course except category selected
      const categoriesExceptSelected = await Category.find({
        _id: { $ne: categoryId },
      });
      let differentCategory = await Category.findOne(
        categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
          ._id
      )
        .populate({
          path: "courses",
          match: { status: "Published" },
        })
        .exec();
      console.log();



           //top selling course 
      const allCategories = await Category.find()
        .populate({
          path: "courses",
          match: { status: "Published" },
        })
        .exec();
      const allCourses = allCategories.flatMap((category) => category.courses);
      const mostSellingCourses = allCourses
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 10);
  

        //return response
      res.status(200).json({
        success: true,
        data: {
          selectedCategory,
          differentCategory,
          mostSellingCourses,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  };



  