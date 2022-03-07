const Talent = require("../models/Talent");
const Transaction = require("../models/Transaction");

exports.newTransaction = async (req, res, next) => {
    const talentId = req.userId;
    const amount = +req.body.amount;
    const paymentWay = req.body.paymentWay;
    const email = req.body.email;
    const bankName = req.body.bankName;
    const bankAccountNumber = req.body.bankAccountNumber;

    try {
        // change talent balance info
        const talent = await Talent.findById(talentId);
        if (talent.balance < amount) {
            throw new Error("Your balance is less than " + amount);
        }
        talent.balance -= amount;
        talent.totalPendingAmount += amount;
        await talent.save();

        const tr = new Transaction();
        tr.talentId = talentId;
        tr.amount = amount;
        tr.paymentWay = paymentWay;
        tr.email = email;
        tr.bankName = bankName;
        tr.bankAccountNumber = bankAccountNumber;
        await tr.save();

        return res.status(201).json({ message: "" });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};
exports.getTalentTransactions = async (req, res, next) => {
    const talentId = req.userId;
    const skip = +req.query.skip || 0;
    const limit = +req.query.limit || 0;

    try {
        const totalItems = await Transaction.find({ talentId }).countDocuments();
        const transactions = await Transaction.find({ talentId })
            .sort({ createdAt: "desc" })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({ totalItems, transactions });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};
exports.getAllTransactions = async (req, res, next) => {
    const skip = +req.query.skip || 0;
    const limit = +req.query.limit || 0;
    let status = req.query.status;
    if (status === "rejected") status = 0;
    if (status === "pending") status = 1;
    if (status === "completed") status = 2;
    let totalItems, transactions;

    try {
        if (status !== undefined) {
            totalItems = await Transaction.find({ status }).countDocuments();
            transactions = await Transaction.find({ status })
                .sort({ createdAt: "desc" })
                .skip(skip)
                .limit(limit)
                .populate("talentId", "name");
        } else {
            totalItems = await Transaction.find().countDocuments();
            transactions = await Transaction.find()
                .sort({ createdAt: "desc" })
                .skip(skip)
                .limit(limit)
                .populate("talentId", "name");
        }

        return res.status(200).json({ totalItems, transactions });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};
exports.editTransaction = async (req, res, next) => {
    const trId = req.params.transactionId;
    let status = +req.query.status;

    try {
        const tr = await Transaction.findById(trId);
        const talent = await Talent.findById(tr.talentId);
        if (!tr) {
            throw new Error("The transaction doesn't exist!");
        }
        if (!talent) {
            throw new Error("The talent doesn't exist!");
        }
        tr.status = status;
        if (status === 2) {
            talent.totalPendingAmount -= tr.amount;
            talent.totalPaidAmount += tr.amount;
        }
        if (status === 0) {
            talent.totalPendingAmount += tr.amount;
            talent.balance += tr.amount;
        }

        await talent.save();
        await tr.save();

        return res.status(201).json({ message: "" });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};
