const express = require("express");
const app = express();

//import routes
const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const courseRoutes = require("./routes/Course");
const paymentRoutes = require("./routes/Payment");
const contactRoutes = require("./routes/ContactUs");

//install parser
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv").config();
const fileUpload = require("express-fileupload");
const cors = require("cors");

//connect DB
const DB = require("./config/database");
DB.connect((err) => {
  console.log(err);
});

//connect cloudinary
const cloudinary = require("./config/cloudinary");
cloudinary.cloundinary();

//use middlwares
app.use(express.json());
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/temp",
  })
);
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

//mounting routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/contact", contactRoutes);

//default routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to my API" });
});

//live server

const PORT = process.env.PORT_NO || 4000;

app.listen(PORT, () => {
  console.log("live server on at port ", `${PORT}`);
});
