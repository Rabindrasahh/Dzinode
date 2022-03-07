const Order = require("../models/Order");
const Category = require("../models/Category");
const randomstring = require("randomstring");
const path = require("path");
const Article = require("../models/Article");
const User = require("../models/User");
const { sendEmail, clearImage } = require("../helpers/helper");
const Admin = require("../models/Admin");
const Talent = require("../models/Talent");
const Setting = require("../models/Setting");
const Transaction = require("../models/Transaction");
const bcrypt = require("bcrypt");

// CATEGORIES
exports.getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find();

        return res.status(200).json({ categories });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};
exports.postCategory = async (req, res, next) => {
    const name = req.body.name;
    try {
        const category = new Category();
        category.name = name;
        category.image = req.file.path;
        await category.save();

        return res.status(201).json({ message: "" });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};
exports.deleteCategory = async (req, res, next) => {
    const categoryId = req.params.categoryId;
    try {
        const category = await Category.findById(categoryId);
        if (category.image) deleteImage(category.image);
        if (!category) {
            throw new Error("Can not find this Category!");
        }
        await category.remove();

        return res.status(200).json({ message: "" });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};
exports.putCategory = async (req, res, next) => {
    const categoryId = req.params.categoryId;
    const name = req.body.name;
    try {
        const category = await Category.findById(categoryId);
        if (!category) {
            throw new Error("Can not find this Category!");
        }
        category.name = name;
        if (req.file?.path) category.image = req.file.path;
        await category.save();

        return res.status(201).json({ message: "" });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};

// TALENTS
exports.getTalentAllInfo = async (req, res, next) => {
    const talentId = req.params.talentId;
    try {
        const talent = await Talent.findById(talentId);
        const transactions = await Transaction.find({ talentId });
        const orders = await Order.find({ talentId }).populate("userId");

        return res.status(200).json({ talent, transactions, orders });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};
exports.addTalent = async (req, res, next) => {
    const categoryId = req.body.category;
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
        talent.categoryId = categoryId;
        talent.name = name;
        talent.email = email;
        talent.followers = followers;
        talent.nickName = nickName;
        talent.socialNetwork = socialNetwork;
        talent.socialNetworkLink = socialNetworkLink;
        talent.phoneNumber = phoneNumber;
        talent.description = description;
        talent.status = 2;
        talent.password = await bcrypt.hash(req.body.password, 12);
        await talent.save();

        return res.status(201).json({ message: "" });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
exports.getPendingTalents = async (req, res, next) => {
    const limit = +req.query.limit || 1;
    const skip = +req.query.skip || 0;
    let talents, totalItems;
    try {
        totalItems = await Talent.find({ status: 1 }).countDocuments();
        talents = await Talent.find({ status: 1 }).skip(skip).limit(limit);

        return res.status(200).json({ talents, totalItems });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};
exports.getAcceptedTalents = async (req, res, next) => {
    const limit = +req.query.limit || 1;
    const skip = +req.query.skip || 0;
    let talents, totalItems;
    try {
        totalItems = await Talent.find({ status: 2 }).countDocuments();
        talents = await Talent.find({ status: 2 }).populate("categoryId").skip(skip).limit(limit);

        return res.status(200).json({ talents, totalItems });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};
exports.deleteTalent = async (req, res, next) => {
    const talentId = req.params.talentId;
    try {
        const talent = await Talent.findById(talentId);
        if (!talent) {
            throw new Error("Can not find this user!");
        }
        await talent.remove();

        return res.status(200).json({ message: "" });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};
exports.acceptTalent = async (req, res, next) => {
    const talentId = req.params.talentId;
    const categoryId = req.body.categoryId;
    const comission = req.body.comission;
    try {
        const talent = await Talent.findById(talentId);
        if (!talent) {
            throw new Error("Can not find this user!");
        }
        const password = randomstring.generate(10);
        const hashedPassword = await bcrypt.hash(password, 12);
        talent.status = 2;
        talent.categoryId = categoryId;
        talent.comission = comission;
        talent.description = "description"; // TODO: CLEAR THAT
        talent.password = hashedPassword;
        await talent.save();

        // Send email
        await sendEmail({
            name: "Dzicace",
            from: "dzicace@info.com",
            to: talent.email,
            subject: "Your request was accepted",
            html: `<p style="font-family:sans-serif"> Your accouunt was accepted. here is your password to login: ${password} </p>`,
        });

        return res.status(201).json({ message: "" });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};
exports.editTalent = async (req, res, next) => {
    const talentId = req.params.talentId;
    const categoryId = req.body.categoryId;
    const followers = req.body.followers;
    const comission = req.body.comission;
    try {
        const talent = await Talent.findById(talentId);
        if (!talent) {
            throw new Error("Can not find this user!");
        }
        talent.followers = followers;
        talent.comission = comission;
        talent.categoryId = categoryId;
        await talent.save();

        return res.status(201).json({ message: "" });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};
exports.searchTalent = async (req, res, next) => {
    const query = req.query.query;
    try {
        const regexp = new RegExp("^" + query, "i");
        const talents = await Talent.find({ name: regexp }).populate("categoryId");
        if (!talents) {
            throw new Error("Can not find this user!");
        }

        return res.status(200).json({ talents });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};

//====================================================
// ORDERS
//====================================================

exports.downloadVideo = async (req, res, next) => {
    const orderId = req.params.orderId;
    try {
        const order = await Order.findById(orderId);
        res.download(`${path.join(__dirname, "..")}/${order.video}`);
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
exports.getAllRequests = async (req, res, next) => {
    const limit = +req.query.limit || 1;
    const skip = +req.query.skip || 0;
    try {
        const totalItems = await Order.find().countDocuments();
        const requests = await Order.find()
            .sort({ createdAt: "desc" })
            .populate("talentId userId")
            .skip(skip)
            .limit(limit);
        // const categories = await Category.find();

        return res.status(200).json({ requests, totalItems });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};
exports.searchRequests = async (req, res, next) => {
    const orderId = req.query.query;
    try {
        const totalItems = await Order.findById(orderId).countDocuments();
        const requests = await Order.findById(orderId).populate("talentId userId").toArray();

        return res.status(200).json({ requests, totalItems });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        // next(err);
    }
};
exports.filterRequests = async (req, res, next) => {
    const status = +req.query.status;
    const limit = +req.query.limit || 1;
    const skip = +req.query.skip || 0;
    try {
        const totalItems = await Order.find({ status }).countDocuments();
        const requests = await Order.find({ status })
            .sort({ createdAt: "desc" })
            .populate("talentId userId")
            .skip(skip)
            .limit(limit);
        // const categories = await Category.find();

        return res.status(200).json({ requests, totalItems });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        // next(err);
    }
};
exports.editRequest = async (req, res, next) => {
    const orderId = req.params.requestId;

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            const error = new Error("Can not found");
            error.statusCode = 401;
            throw error;
        }
        order.status = req.body.status;
        order.instructions = req.body.instructions;
        await order.save();

        return res.status(201).json({ message: "" });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};

//====================================================
// ARTICLES
//====================================================
exports.getArticles = async (req, res, next) => {
    const limit = +req.query.limit || 1;
    const skip = +req.query.skip || 0;

    try {
        const totalItems = await Article.find().countDocuments();
        const articles = await Article.find().sort({ createdAt: "desc" }).skip(skip).limit(limit);

        return res.status(200).json({ articles, totalItems });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};
exports.addArticle = async (req, res, next) => {
    let image;
    if (req.file) image = req.file.path;
    else image = "";

    try {
        if (!image) throw new Error("no image selected!");

        const article = new Article();
        article.title = req.body.title;
        article.image = image;
        article.content = req.body.content;
        article.author = req.userId;
        article.seo.title = req.body.seoTitle;
        article.seo.keywords = req.body.seoKeywords?.split(",");
        await article.save();

        return res.status(201).json({ message: "" });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};
exports.deleteArticle = async (req, res, next) => {
    const articleId = req.params.articleId;
    try {
        await Article.findOneAndDelete(articleId);
        return res.status(201).json({ message: "" });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};
exports.editArticle = async (req, res, next) => {
    const articleId = req.params.articleId;
    let image;
    if (req.file) image = req.file.path;
    else image = "";

    try {
        const article = await Article.findById(articleId);
        if (!article) {
            const error = new Error("Can not found");
            error.statusCode = 401;
            throw error;
        }
        article.title = req.body.title;
        article.content = req.body.content;
        article.seo.title = req.body.seoTitle;
        article.seo.keywords = req.body.seoKeywords?.split(",");
        if (image) article.image = image;
        await article.save();

        return res.status(201).json({ message: "" });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};

//====================================================
// USERS
//====================================================

exports.getUsers = async (req, res, next) => {
    const skip = +req.query.skip || 0;
    const limit = +req.query.limit || 0;
    try {
        const totalItems = await User.find().countDocuments();
        const users = await User.find().skip(skip).limit(limit);

        return res.status(200).json({ totalItems, users });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
exports.editUser = async (req, res, next) => {
    const userId = req.params.userId;
    try {
        const user = await User.findById(userId);
        user.fullName = req.body.name;
        user.email = req.body.email;
        await user.save();

        return res.status(201).json({ message: "" });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
exports.deleteUser = async (req, res, next) => {
    const userId = req.params.userId;
    try {
        await User.findOneAndDelete(userId);
        return res.status(201).json({ message: "" });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

// MANAGE ADMINS
exports.addAdmin = async (req, res, next) => {
    try {
        const admin = new Admin();
        admin.email = req.body.email;
        admin.password = req.body.password;
        admin.name = req.body.name;

        await admin.save();
        return res.status(201).json({ message: "" });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
exports.editAdmin = async (req, res, next) => {
    const adminId = req.userId;
    try {
        const admin = await Admin.findById(adminId);
        if (req.body.email) admin.email = req.body.email;
        if (req.body.password) admin.password = await bcrypt.hash(req.body.password, 12);
        if (req.body.name) admin.name = req.body.name;
        await admin.save();

        return res.status(201).json({ message: "" });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

// SETTINGS
exports.patchGetawaySettings = async (req, res, next) => {
    try {
        const settings = await Setting.findOne({ key: "getaway" });
        await Setting.updateOne(
            { key: "getaway" },
            {
                value: {
                    public: req.body.public ? req.body.public : settings.value.public,
                    secret: req.body.secret ? req.body.secret : settings.value.secret,
                },
            },
            { upsert: true, setDefaultsOnInsert: true }
        );

        return res.status(201).json({ message: "" });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
