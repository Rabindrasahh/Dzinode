const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema(
    {
        type: {
            type: String,
            required: true, // Marketing, Normal
        },
        email: {
            type: String,
            required: true, // delivery email
        },
        videoOwner: {
            type: String,
            required: false, // Me, Someone
        },
        name: {
            type: String,
            required: false, // Name => when videoOwner is Me
        },
        from: {
            type: String,
            required: false, // From => when videoOwner is Someone
        },
        to: {
            type: String,
            required: false, // To => when videoOwner is Someone
        },
        occasion: {
            type: String,
            required: false,
        },
        instructions: {
            type: String,
            required: true,
        },
        companyName: {
            type: String,
            required: false, // When video type is marketing
        },
        isPublicOnProfile: {
            type: Boolean,
            default: false,
        },
        video: {
            type: String,
            default: null,
        },
        price: {
            type: Number,
            required: true,
        },
        paymentWay: {
            type: String,
            required: true,
        },
        paymentId: {
            type: String,
            required: false,
        },
        comment: {
            content: {
                type: String,
                required: false,
            },
            rating: {
                type: Number,
                required: false,
            },
        },
        status: {
            type: Number,
            default: 1, // deadline end:-1, Rejected:0, Waiting for accept:1, Processing:2, waiting for user accept:3, Completed:4
        },
        talentId: {
            type: Schema.Types.ObjectId,
            ref: "Talent",
            required: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        acceptTime: {
            type: Date,
            required: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
