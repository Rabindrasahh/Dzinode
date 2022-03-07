const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
        },
        phoneNumber: {
            type: Number,
            required: false,
            default: null,
        },
        password: {
            type: String,
            required: true,
        },
        fullName: {
            type: String,
            required: true,
        },
        profileImage: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
