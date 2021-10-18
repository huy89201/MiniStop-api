const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const token = req.header("token");
    if(!token) res.status(401).send("Access Denied");

    try {
        const verified = jwt.verify(token,process.env.SECRET_TOKEN);
        req.user = verified;
        next();
    } catch (error) {
        res.status(401).send("Ivalid token not found");
    }
}

module.exports = verifyToken;