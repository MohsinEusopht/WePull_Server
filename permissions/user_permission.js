const jwt = require("jsonwebtoken");
const { getUserPermissions } = require("./user_permission.service");
module.exports = {
    validateUserPermission: (req, res, next) => {
        let token = req.get("authorization");
        if (token) {
            // Remove Bearer from string
            token = token.slice(7);
            console.log("Auth Token", token);
            jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
                if (err) {
                    return res.status(401).json({
                        status: 500,
                        message: "Invalid Token..."
                    });
                } else {
                    req.user = decoded;
                    getUserPermissions(req.user.result.id, (err, results) => {
                        if (err) {
                            return res.json({
                                status: 500,
                                message: err
                            });
                        }
                        if (!results) {
                            return res.json({
                                status: 500,
                                message: "Result is " + results
                            });
                        }
                        console.log("results",results);
                    }).then((r) => {
                        next();
                    }).catch((e) => {
                        return res.json({
                            status: 500,
                            message: e
                        });
                    });
                }
            });
        } else {
            return res.json({
                status: 401,
                message: "Access Denied! Unauthorized User"
            });
        }
    }
};