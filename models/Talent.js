const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const talentSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        phoneNumber: {
            type: String,
            required: false,
            default: null,
        },
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: false,
            default: null,
        },
        comission: {
            type: Number,
            required: true,
            default: 25,
        },
        description: {
            type: String,
            required: true,
        },
        agencyName: {
            type: String,
            required: false,
        },
        nickName: { type: String, required: true },
        followers: {
            type: Number,
            required: false,
            default: null,
        },
        socialNetwork: {
            type: String,
            required: true,
        },
        socialNetworkLink: {
            type: String,
            required: true,
        },
        profileImage: {
            type: String,
            default: "",
        },
        introVideo: {
            type: String,
            default: null,
        },
        status: {
            type: Number,
            default: 1, // 0=inactive, 1=pending, 2=active
        },
        balance: {
            // current balance
            type: Number,
            default: 0,
        },
        totalEarnedAmount: {
            // total earned amount
            type: Number,
            default: 0,
        },
        totalPaidAmount: {
            // total paid amount
            type: Number,
            default: 0,
        },
        totalPendingAmount: {
            // total pending amount to be paid
            type: Number,
            default: 0,
        },
        rating: {
            type: Number,
            default: 0,
        },
        normalPrice: {
            type: Number,
            default: null,
        },
        marketingPrice: {
            type: Number,
            default: null,
        },
        requestsCount: {
            type: Number,
            default: 0,
        },
        pendingRequestsCount: {
            type: Number,
            default: 0,
        },
        categoryId: {
            type: Schema.Types.ObjectId,
            required: false,
            ref: "Category",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Talent", talentSchema);
