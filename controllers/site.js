const clearImage = require("../helpers/helper").clearImage;
const sendEmail = require("../helpers/helper").sendEmail;
const Talent = require("../models/Talent");
const Article = require("../models/Article");
const Order = require("../models/Order");
const Category = require("../models/Category");
const User = require("../models/User");
const Bookmark = require("../models/Bookmark");
const path = require("path");
const stripe = require("stripe")(process.env.STRIPE_S_KEY);
const bcrypt = require("bcrypt");

exports.getHomeData = async (req, res, next) => {
    try {
        const newTalents = await Talent.find({ status: 2, normalPrice: { $gt: 0 } })
            .sort({ createdAt: "desc" })
            .select("name normalPrice nickName profileImage categoryId")
            .populate("categoryId")
            .limit(5)
            .exec();
        const categories = await Category.find();
        const articles = await Article.find().sort({ createdAt: "desc" }).limit(4);

        return res.status(200).json({
            newTalents,
            categories,
            articles,
        });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};
exports.getPaymentIntent = async (req, res, next) => {
    const talentId = req.query.talentId;
    const type = req.query.type;

    try {
        const talent = await Talent.findById(talentId);
        const price = type === "normal" ? talent.normalPrice : talent.marketingPrice;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: price * 100,
            currency: "usd",
            payment_method_types: ["card"],
        });
        return res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};
exports.bookVideo = async (req, res, next) => {
    const type = req.body.type;
    const email = req.body.email;
    const videoOwner = req.body.videoOwner;
    const name = req.body.name;
    const from = req.body.from;
    const to = req.body.to;
    const occasion = req.body.occasion;
    const instructions = req.body.instructions;
    const companyName = req.body.companyName;
    const isPublicOnProfile = req.body.isPublicOnProfile;
    const paymentWay = "Stripe"; // TODO: Shoud not be static
    const userId = req.userId;
    const talentId = req.body.talentId;
    const paymentId = req.body.paymentId;
    let price;

    try {
        const talent = await Talent.findById(talentId);
        price = type === "Normal" ? talent.normalPrice : talent.marketingPrice;

        const order = new Order();
        order.type = type;
        order.email = email;
        order.videoOwner = videoOwner;
        order.name = name;
        order.from = from;
        order.to = to;
        order.occasion = occasion;
        order.instructions = instructions;
        order.companyName = companyName;
        order.isPublicOnProfile = isPublicOnProfile;
        order.paymentWay = paymentWay;
        order.userId = userId;
        order.talentId = talentId;
        order.price = price;
        order.paymentId = paymentId;
        await order.save();

        // increase talent requests
        talent.pendingRequestsCount += 1;
        talent.requestsCount += 1;
        await talent.save();

        // Send email
        await sendEmail({
            name: "Dzicace",
            from: "dzicace@info.com",
            to: email,
            subject: "New Request",
            html: `<p style="font-family:sans-serif"> You have a new ${type} request. Please check your panel to view more about the request </p>`,
        });

        return res.status(201).json({ message: "" });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};
exports.getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error("Can not found!");
            error.statusCode = 404;
            throw error;
        }
        return res.status(200).json(user);
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};
exports.updateUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error("Can not found!");
            error.statusCode = 404;
            throw error;
        }
        user.fullName = req.body.name;
        user.email = req.body.email;
        user.phoneNumber = req.body.phoneNumber;
        if (req.file?.path) user.profileImage = req.file.path;
        if (req.body.password) user.password = await bcrypt.hash(req.body.password, 12);
        await user.save();

        return res.status(201).json({ message: "" });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};
exports.getPendingOrders = async (req, res, next) => {
    const userId = req.userId;
    const limit = +req.query.limit || 1;
    const skip = +req.query.skip || 0;
    let orders, totalItems;
    try {
        totalItems = await Order.find({
            $or: [{ status: 1 }, { status: 2 }],
            userId,
        }).countDocuments();
        orders = await Order.find({ $or: [{ status: 1 }, { status: 2 }], userId })
            .populate("talentId")
            .skip(skip)
            .limit(limit);

        return res.status(200).json({ totalItems, orders });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
exports.getCompletedOrders = async (req, res, next) => {
    const userId = req.userId;
    const limit = +req.query.limit || 1;
    const skip = +req.query.skip || 0;
    let orders, totalItems;
    try {
        totalItems = await Order.find({
            $or: [{ status: 3 }, { status: 4 }],
            userId,
        }).countDocuments();
        orders = await Order.find({ $or: [{ status: 3 }, { status: 4 }], userId })
            .populate("talentId", "name")
            .skip(skip)
            .limit(limit);

        return res.status(200).json({ totalItems, orders });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
exports.acceptPendingOrder = async (req, res, next) => {
    const orderId = req.params.orderId;
    try {
        const order = await Order.findById(orderId);
        if (order.userId == req.userId) {
            order.status = 4;
            await order.save();

            // increase talent's balance
            const talent = await Talent.findById(order.talentId);
            talent.balance += (order.price * (100 - talent.comission)) / 100;
            talent.totalEarnedAmount += (order.price * (100 - talent.comission)) / 100;
            talent.pendingRequestsCount -= 1;
            await talent.save();

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
exports.rejectPendingOrder = async (req, res, next) => {
    const orderId = req.params.orderId;
    try {
        const order = await Order.findById(orderId);
        if (order.userId == req.userId) {
            order.status = 2;
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
exports.downloadVideo = async (req, res, next) => {
    const orderId = req.params.orderId;
    try {
        const order = await Order.findById(orderId);
        if (order.userId == req.userId) {
            res.download(`${path.join(__dirname, "..")}/${order.video}`);
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
exports.copyVideoLink = async (req, res, next) => {
    const orderId = req.params.orderId;
    try {
        const order = await Order.findById(orderId);
        return res.status(200).json(`http://dzicace.herokuapp.com/${order.video}`);
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
exports.submitReview = async (req, res, next) => {
    const orderId = req.params.orderId;
    const content = req.body.content;
    const rating = req.body.rating;
    try {
        const order = await Order.findById(orderId);
        if ((order.userId == req.userId) & !order.comment?.content) {
            order.comment.content = content;
            order.comment.rating = rating;
            await order.save();

            // change talent's rating
            const talent = await Talent.findById(order.talentId);
            let totalRatings = 0;
            const allOrders = await Order.find({ talentId: talent._id, status: 4 });
            allOrders.forEach((o) => {
                totalRatings += o.comment.rating;
            });
            const newRating = Math.round(totalRatings / talent.requestsCount);
            talent.rating = newRating;
            await talent.save();

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
exports.getArticles = async (req, res, next) => {
    const limit = +req.query.limit || 1;
    const skip = +req.query.skip || 0;
    try {
        const totalItems = await Article.find().countDocuments();
        const articles = await Article.find().skip(skip).limit(limit);
        return res.status(200).json({ articles, totalItems });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};
exports.getSingleArticle = async (req, res, next) => {
    const articleId = req.params.articleId;
    try {
        const article = await Article.findById(articleId);
        if (!article) {
            const error = new Error("Can not found!");
            error.statusCode = 404;
            throw error;
        }
        return res.status(200).json(article);
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};

exports.getBookmarks = async (req, res, next) => {
    const userId = req.userId;
    const skip = +req.query.skip || 0;
    const limit = +req.query.limit || 0;
    try {
        const totalItems = await Bookmark.find({ userId }).countDocuments();
        const bookmarks = await Bookmark.find({ userId })
            .sort({ createdAt: "desc" })
            .skip(skip)
            .limit(limit)
            .populate("talentId", "name");
        return res.status(200).json({ bookmarks, totalItems });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};
exports.getIsBookmarked = async (req, res, next) => {
    const userId = req.userId;
    const talentId = req.params.talentId;
    try {
        const bookmark = await Bookmark.findOne({ userId, talentId });
        if (!bookmark) {
            return res.status(200).json({ status: false });
        }
        return res.status(200).json({ status: true });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};
exports.patchBookmark = async (req, res, next) => {
    const userId = req.userId;
    const talentId = req.params.talentId;
    try {
        const bookmark = new Bookmark();
        bookmark.userId = userId;
        bookmark.talentId = talentId;
        await bookmark.save();

        return res.status(201).json({ message: "" });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};
exports.deleteBookmark = async (req, res, next) => {
    const userId = req.userId;
    const talentId = req.params.talentId;
    try {
        await Bookmark.findOneAndDelete({ talentId, userId });

        return res.status(201).json({ message: "" });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};
