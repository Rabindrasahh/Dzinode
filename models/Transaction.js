const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = new Schema(
    {
        talentId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Talent",
        },
        amount: {
            type: Number,
            required: true,
        },
        paymentWay: {
            type: String,
            required: true, // Paypal, Bank transfer
        },
        email: {
            type: String,
            required: false, // for Paypal payment
        },
        bankName: {
            type: String,
            required: false, /// for Bank transfer payment
        },
        bankAccountNumber: {
            type: String,
            required: false, /// for Bank transfer payment
        },
        status: {
            type: Number,
            default: 1, // 0:rejected, 1:pending, 2:completed
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
