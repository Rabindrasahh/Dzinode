const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
const transport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "testemaildzicace@gmail.com",
    pass: "Aa123456789!",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

exports.clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => {
    console.log(err);
  });
};

exports.sendEmail = async (mailOptions) => {
  return transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    }
    if (info) {
      console.log(info);
    }
  });
};
