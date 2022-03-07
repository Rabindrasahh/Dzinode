const Talent = require("../models/Talent");
const Order = require("../models/Order");
const Category = require("../models/Category");
const { sendEmail } = require("../helpers/helper");

exports.postTalentJoin = async (req, res, next) => {
    const email = req.body.email;
    const name = req.body.name;
    const nickName = req.body.nickName;
    const followers = req.body.followers;
    const socialNetwork = req.body.socialNetwork;
    const socialNetworkLink = req.body.socialNetworkLink;
    const phoneNumber = req.body.phoneNumber;
    const description = req.body.description;

    try {
        let talent = await Talent.findOne({ email });
        if (talent) {
            const error = new Error("You submitted a request in the past!");
            error.statusCode = 401;
            throw error;
        }
        talent = new Talent();
        talent.name = name;
        talent.email = email;
        talent.followers = followers;
        talent.nickName = nickName;
        talent.socialNetwork = socialNetwork;
        talent.socialNetworkLink = socialNetworkLink;
        talent.phoneNumber = phoneNumber;
        talent.description = description;
        await talent.save();

        return res.status(201).json({ message: "" });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
exports.getTalent = async (req, res, next) => {
    const talentId = req.params.talentId;
    try {
        const talent = await Talent.findById(talentId)
            .select([
                "bookedVideos",
                "normalPrice",
                "categoryId",
                "description",
                "introVideo",
                "marketingPrice",
                "name",
                "nickName",
                "status",
                "rating",
            ])
            .populate("categoryId");
        const comments = await Order.find({ talentId: talentId, status: 4 })
            .populate("userId", "fullName")
            .select("comment");
        if (!talent || talent.status !== 2) {
            const error = new Error("Can not find this talent");
            error.statusCode = 404;
            throw error;
        }

        return res.status(200).json({ talent, comments });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
exports.getAllTalents = async (req, res, next) => {
    const limit = +req.query.limit || 1;
    const skip = +req.query.skip || 0;
    try {
        const totalItems = await Talent.find({
            status: 2,
            normalPrice: { $gt: 0 },
        }).countDocuments();
        const talents = await Talent.find({ status: 2, normalPrice: { $gt: 0 } })
            .populate("categoryId")
            .select(["normalPrice", "categoryId", "name", "status"])
            .skip(skip)
            .limit(limit);
        const categories = await Category.find();

        return res.status(200).json({ talents, categories, totalItems });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
exports.searchTalents = async (req, res, next) => {
    const query = req.query.query;
    try {
        const regexp = new RegExp("^" + query, "i");
        const talents = await Talent.find({ status: 2, name: regexp }).populate("categoryId");
        const categories = await Category.find();

        return res.status(200).json({ talents, categories });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
exports.searchTalentsByCategory = async (req, res, next) => {
    const category = req.query.category;
    let talents;
    try {
        const ca = await Category.findOne({ name: category });
        talents = await Talent.find({ status: 2, categoryId: ca._id }).populate("categoryId");
        const categories = await Category.find();

        return res.status(200).json({ talents, categories });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
exports.getTalentItself = async (req, res, next) => {
    const talentId = req.userId;
    try {
        const talent = await Talent.findById(talentId);
        if (!talent || talent.status === 0) {
            const error = new Error("Your account was deactivated");
            error.statusCode = 404;
            throw error;
        }

        return res.status(200).json(talent);
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
exports.putUpdateTalentItself = async (req, res, next) => {
    const name = req.body.name;
    const nickName = req.body.nickName;
    const followers = req.body.followers;
    const socialNetwork = req.body.socialNetwork;
    const description = req.body.description;
    const normalPrice = req.body.normalPrice;
    const marketingPrice = req.body.marketingPrice;
    const phoneNumber = req.body.phoneNumber;
    const agencyName = req.body.agencyName;
    const socialNetworkLink = req.body.socialNetworkLink;

    try {
        let talent = await Talent.findById(req.userId);
        if (!talent || talent.status === 0) {
            const error = new Error("Your account was deactivated");
            error.statusCode = 404;
            throw error;
        }

        talent.name = name;
        talent.followers = followers;
        talent.nickName = nickName;
        talent.phoneNumber = phoneNumber;
        talent.socialNetwork = socialNetwork;
        talent.socialNetworkLink = socialNetworkLink;
        talent.agencyName = agencyName;
        talent.description = description;
        talent.normalPrice = normalPrice;
        talent.marketingPrice = marketingPrice;
        talent.profileImage = req.file?.path;
        await talent.save();

        return res.status(201).json({ message: "" });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
exports.putUpdateIntroVideo = async (req, res, next) => {
    try {
        let talent = await Talent.findById(req.userId);
        if (!talent || talent.status === 0) {
            const error = new Error("Your account was deactivated");
            error.statusCode = 404;
            throw error;
        }

        if (req.file?.path) talent.introVideo = req.file.path;
        await talent.save();

        return res.status(201).json({ message: "" });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
exports.getPendingRequests = async (req, res, next) => {
    const talentId = req.userId;
    const limit = +req.query.limit || 1;
    const skip = +req.query.skip || 0;
    let requests, totalItems;
    try {
        totalItems = await Order.find({
            $or: [{ status: 1 }, { status: 2 }],
            talentId,
        }).countDocuments();
        requests = await Order.find({ $or: [{ status: 1 }, { status: 2 }], talentId })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({ totalItems, requests });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
exports.getCompletedRequests = async (req, res, next) => {
    const talentId = req.userId;
    const limit = +req.query.limit || 1;
    const skip = +req.query.skip || 0;
    let requests, totalItems;
    try {
        totalItems = await Order.find({
            $or: [{ status: 3 }, { status: 4 }],
            talentId,
        }).countDocuments();
        requests = await Order.find({ $or: [{ status: 3 }, { status: 4 }], talentId })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({ totalItems, requests });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
exports.getRejectedRequests = async (req, res, next) => {
    const talentId = req.userId;
    const limit = +req.query.limit || 1;
    const skip = +req.query.skip || 0;
    let requests, totalItems;

    console.log("asfasfasf", talentId);
    try {
        totalItems = await Order.find({
            $or: [{ status: 0 }, { status: -1 }],
            talentId,
        }).countDocuments();
        requests = await Order.find({ $or: [{ status: 0 }, { status: -1 }], talentId })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({ totalItems, requests });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
exports.acceptPendingRequest = async (req, res, next) => {
    const orderId = req.params.orderId;
    try {
        const order = await Order.findById(orderId);
        if (order.talentId == req.userId) {
            order.status = 2;
            order.acceptTime = Date.now();
            await order.save();
            return res.status(201).json({ message: "" });
        } else {
            const error = new Error("Not Authenticated");
            error.statusCode = 401;
            throw error;
        }
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
exports.rejectPendingRequest = async (req, res, next) => {
    const orderId = req.params.orderId;
    try {
        const order = await Order.findById(orderId);
        if (order.talentId == req.userId) {
            order.status = 0;
            await order.save();
            return res.status(201).json({ message: "" });
        } else {
            const error = new Error("Not Authenticated");
            error.statusCode = 401;
            throw error;
        }
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
exports.uploadVideo = async (req, res, next) => {
    const orderId = req.params.orderId;
    try {
        const order = await Order.findById(orderId).populate("userId talentId");
        if (order.talentId._id == req.userId) {
            order.video = req.file.path;
            order.status = 3;
            await order.save();

            // Send email
            await sendEmail({
                name: "Dzicace",
                from: "dzicace@info.com",
                to: order.userId.email,
                subject: "Your video is ready!",
                html: `<p style="font-family:sans-serif"> ${order.talentId.name} uploaded your ordered video. Please check your panel to see the video ;)   </p>`,
            });

            return res.status(201).json({ message: "" });
        } else {
            const error = new Error("Not Authenticated");
            error.statusCode = 401;
            throw error;
        }
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
exports.getMyReviews = async (req, res, next) => {
    const talentId = req.userId;
    const skip = +req.query.skip || 0;
    const limit = +req.query.limit || 0;
    try {
        const totalItems = await Order.find({ talentId, status: 4 }).countDocuments();
        const reviews = await Order.find({ talentId, status: 4 }, "comment")
            .populate("userId", "fullName")
            .skip(skip)
            .limit(limit);

        return res.status(200).json({ reviews, totalItems });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
exports.getMyVideos = async (req, res, next) => {
    const talentId = req.userId;
    const skip = +req.query.skip || 0;
    const limit = +req.query.limit || 0;
    try {
        const totalItems = await Order.find({
            talentId,
            status: 4,
            isPublicOnProfile: true,
        }).countDocuments();
        const videos = await Order.find(
            { talentId, status: 4, isPublicOnProfile: true },
            "video type"
        )
            .populate("userId", "fullName")
            .skip(skip)
            .limit(limit);

        return res.status(200).json({ videos, totalItems });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
