const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Talent = require("../models/Talent");
const bcrypt = require("bcrypt");
const Admin = require("../models/Admin");
const Token = require("../models/Token");
const crypto = require("crypto");
const { sendEmail } = require("../helpers/helper");

exports.postLogin = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            user = await Talent.findOne({ email });

            if (!user) {
                user = await Admin.findOne({ email });

                if (!user) {
                    const error = new Error("User not exists!");
                    error.statusCode = 401;
                    throw error;
                }
            }
        }
        const isEqual = await bcrypt.compare(password, user.password);

        if (!isEqual) {
            const error = new Error("Email/Password is incorrect");
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign({ email, userId: user._id.toString() }, process.env.JWT_KEY, {
            expiresIn: "7d",
        });
        return res.status(201).json({
            message: "User Logged in Successfully!",
            token,
            userId: user._id.toString(),
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.postUserSignup = async (req, res, next) => {
    const fullName = req.body.fullName;
    const email = req.body.email;
    const password = req.body.password;

    try {
        const user = await User.findOne({ email });
        if (user) {
            const error = new Error("User already exists!");
            error.statusCode = 401;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User();
        newUser.email = email;
        newUser.password = hashedPassword;
        newUser.fullName = fullName;
        const savedUser = await newUser.save();

        const token = jwt.sign({ email, userId: savedUser._id.toString() }, process.env.JWT_KEY, {
            expiresIn: "7d",
        });
        return res.status(201).json({
            message: "User Created Successfully!",
            token,
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getUserRole = async (req, res, next) => {
    const userId = req.userId;
    let role = "";

    try {
        let user = await User.findById(userId);
        role = "user";
        if (!user) {
            user = await Talent.findById(userId);
            role = "talent";

            if (!user) {
                user = await Admin.findById(userId);
                role = "admin";

                if (!user) {
                    const error = new Error("User doesn't exist");
                    error.statusCode = 401;
                    throw error;
                }
            }
        }

        return res.status(200).json(role);
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.requestPasswordReset = async (req, res, next) => {
    try {
        const email = req.body.email;
        const clientURL = "https://dzicace.netlify.app";
        const user = await User.findOne({ email });

        if (!user) throw new Error("User does not exist");
        let token = await Token.findOne({ userId: user._id });
        if (token) await token.deleteOne();
        let resetToken = crypto.randomBytes(32).toString("hex");
        const hash = await bcrypt.hash(resetToken, 12);

        await new Token({
            userId: user._id,
            token: hash,
            createdAt: Date.now(),
        }).save();

        const link = `${clientURL}/reset-password?token=${resetToken}&id=${user._id}`;
        await sendEmail({
            name: "Dzicace",
            from: "dzicace@info.com",
            to: email,
            subject: "Password Reset",
            html: `<p style="font-family:sans-serif"> Here is the link to reset your password: ${link} </p>`,
        });

        return res.status(201).json({ message: "" });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.resetPassword = async (req, res, next) => {
    try {
        const userId = req.body.userId;
        const token = req.body.token;
        const password = req.body.password;
        console.log(req.body);
        let passwordResetToken = await Token.findOne({ userId });
        if (!passwordResetToken) {
            throw new Error("Invalid or expired password reset token");
        }
        const isValid = await bcrypt.compare(token, passwordResetToken.token);
        if (!isValid) {
            throw new Error("Invalid or expired password reset token");
        }

        const hash = await bcrypt.hash(password, 12);
        await User.updateOne({ _id: userId }, { $set: { password: hash } }, { new: true });
        await passwordResetToken.deleteOne();

        return res.status(201).json({ message: "" });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
