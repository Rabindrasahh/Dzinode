const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    if (!req.get("Authorization")) {
        const err = new Error("Not Authenticated!");
        err.statusCode = 401;
        throw err;
    }
    const token = req.get("Authorization").split(" ")[1];
    if (!token) {
        const err = new Error("Not Authenticated!");
        err.statusCode = 401;
        throw err;
    }
    let decodedToken;

    try {
        decodedToken = jwt.verify(token, process.env.JWT_KEY);
    } catch (err) {
        err.statusCode = 500;
        throw err;
    }
    if (!decodedToken) throw new Error("Not Authenticated.");
    req.userId = decodedToken.userId;
    next();
};
