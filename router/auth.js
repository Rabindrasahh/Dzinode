const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.js");
const auth = require("../middlewares/auth");

router.post("/login", authController.postLogin);
router.post("/signup/user", authController.postUserSignup);
router.post("/password-reset-request", authController.requestPasswordReset);
router.post("/password-reset", authController.resetPassword);
router.get("/get-user-role", auth, authController.getUserRole);

module.exports = router;
