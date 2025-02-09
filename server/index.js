const express = require("express");
const app = express();

//import routes
const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const courseRoutes = require("./routes/Course");
const paymentRoutes = require("./routes/Payment");
const contactRoutes = require("./routes/ContactUs");
const path =require("path");
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

const _diranme = path.resolve();
//use middlwares
app.use(express.json());
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/temp",
  })
);


const whitelist = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN : "*";
  // ? JSON.parse(process.env.CORS_ORIGIN)
  

app.use(cors({
    origin: whitelist,
    credentials: true, 
    maxAge: 14400
}));

// app.use(
//   cors({
//     origin: "http://localhost:3000",
//     credentials: true,
//   })
// );

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


// app.use(express.static(path.join(_diranme, "/frontend/dist")));
// app.get("*", (req, res) => {
//   res.sendFile(path.resolve(_diranme, "frontend", "dist", "index.html"));
// }
// )
//live server

const PORT = process.env.PORT_NO || 4000;

app.listen(PORT, () => {
  console.log("live server on at port ", `${PORT}`);
});
