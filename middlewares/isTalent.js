const Talent = require("../models/Talent");
module.exports = async (req, res, next) => {
    try {
        const talent = await Talent.findById(req.userId);
        if (!talent) {
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
