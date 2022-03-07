const Admin = require("../models/Admin");
module.exports = async (req, res, next) => {
    try {
        const admin = await Admin.findById(req.userId);
        if (!admin) {
            const err = new Error("Not Authenticated!");
            err.statusCode = 401;
            throw err;
        }
        next();
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};
