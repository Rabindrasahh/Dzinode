const path = require("path");
const express = require("express");
const app = express();
const multer = require("multer");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Setting = require("./models/Setting");
require("dotenv").config();

// ROUTES
const authRouter = require("./router/auth");
const siteRouter = require("./router/site");
const adminRouter = require("./router/admin");
const talentRouter = require("./router/talent");
const transactionRouter = require("./router/transaction");

// multer
const fileStorage = multer.diskStorage({
  destination(req, file, cb) {
    const fileType = file.mimetype.split("/")[0];
    if (fileType === "video") cb(null, "upload/videos");
    else cb(null, "upload/images");
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const fileFilter = (req, file, cb) => {
  // if (
  //     file.mimetype === "image/png" ||
  //     file.mimetype === "image/jpg" ||
  //     file.mimetype === "image/jpeg"
  // )
  cb(null, true);
  // else cb(null, false);
};

app.use(bodyParser.json()); // for application/json
app.use(multer({ storage: fileStorage, fileFilter }).single("image"));

// static serving
app.use(
  "/upload/images",
  express.static(path.join(__dirname, "upload", "images"))
);
app.use(
  "/upload/videos",
  express.static(path.join(__dirname, "upload", "videos"))
);

// MAKE CORS ENABLE
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); //- *=any clients
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Routes
app.use(authRouter);
app.use(siteRouter);
app.use("/admin", adminRouter);
app.use("/talent", talentRouter);
app.use("/transaction", transactionRouter);

// error handling
app.use((error, req, res, next) => {
  console.log(error);
  const statusCode = error.statusCode || 500;
  const message = error.message;
  const data = error.data;

  return res.status(statusCode).json({ message, data });
});

// mongoose
//     .connect("mongodb://127.0.0.1:27017/dzicace")
//     .then(() => {
//         app.listen(3002);

//         // get secret key
//         // Setting.findOne({ key: "getaway" }).then((res) => {
//         //     process.env.STRIPE_S_KEY = res.value?.secret;
//         // });
//     })
//     .catch((e) => {
//         console.log(e);
//     });
mongoose
  .connect("")
  .then(() => {
    app.listen(process.env.PORT || 5000);
  })
  .catch((e) => {
    console.log(e);
  });
