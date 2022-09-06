const {hashSync,genSaltSync,compareSync} = require("bcrypt");
const crypto = require('crypto');
const nodemailer = require("nodemailer");
const {supplierCount} = require("./user.service");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const {
    getUserByEmail,
    getUser,
    getLoginToken,
    getCompanyByID,
    getAdminActiveCompany,
    getUserCategories,
    getCompanies,
    getCategories,
    getCategoriesForDashboard,
    getCategoriesForUserCreation,
    getSuppliers,
    getUsers,
    getExpenses,
    getAttachables,
    disableAllCompany,
    activateCompany,
    getLastSyncedActivity
} = require("./user.service");
const { sign } = require("jsonwebtoken");


module.exports = {
    defaultFun: async (req, res) => {
        return res.json({
            status: "200",
            message: "Api is working"
        });
    },
    login: async (req, res) => {
        try {
            const body = req.body;
            const getUserData = await getUserByEmail(body.email);

            if (getUserData) {
                getUserData.password = getUserData.password.replace(/^\$2y(.+)$/i, '$2a$1');
                const result = compareSync(body.password, getUserData.password);

                if (result) {
                    getUserData.password = undefined;
                    const getCompany = await getCompanyByID(getUserData.company_id);

                    const json_token = sign({result: getUserData}, process.env.JWT_KEY);
                    return res.json({
                        status: 200,
                        message: "login successfully",
                        token: json_token,
                        data: getUserData,
                        company_data: getCompany[0]
                    });

                } else {
                    return res.json({
                        status: 500,
                        message: "Invalid email or password"
                    });
                }
            } else {

                return res.json({
                    status: 500,
                    message: "Email do not exist."
                });
            }

        } catch (e) {
            console.log("error", e);
            return res.json({
                status: 500,
                message: "Something went wrong."
            });
        }
    },
    auth_login: async (req, res) => {
        try {
            const body = req.body;
            console.log("auth_login body", body);
            const user = await getUserByEmail(body.email);
            console.log("user while login",user);
            const user_token = user.token;
            if (user) {
                if (user[0].token === body.token) {
                    const getCompany = await getAdminActiveCompany(user[0].id);

                    user[0].password = undefined;
                    console.log("auth login user results:", user[0]);
                    const json_token = sign({
                        result: user[0]
                    }, process.env.JWT_KEY);

                    return res.json({
                        status: 200,
                        message: "login successfully",
                        token: json_token,
                        data: user[0],
                        type: "xero",
                        company_data: getCompany[0]
                    });
                } else {
                    return res.json({
                        status: 500,
                        message: "Token expired."
                    });
                }
            } else {
                return res.json({
                    status: 500,
                    message: "User do not exist."
                });
            }
        } catch (e) {
            return res.json({
                status: 500,
                message: "Something Went Wrong."
            });
        }
    },
    getRoles: async (req, res) => {
        try {
            const result = await getUserRoles();
            return res.status(200).json({
                status: 200,
                roles: result
            });
        } catch (e) {
            return res.json({
                status: 500,
                message: "Something Went Wrong."
            });
        }
    },
    getLoginToken: async (req, res) => {
        try {
            const email = req.params.email;
            const record = await getLoginToken(email);
            return res.json({
                success: 1,
                data: record
            });
        } catch (e) {
            return res.json({
                status: 500,
                message: "Error :" + e.message,
            });
        }
    },
    getUserCategories: async (req, res) => {
        try {
            const id = req.params.id;
            const record = await getUserCategories(id);
            return res.json({
                success: 1,
                data: record
            });
        } catch (e) {
            return res.json({
                status: 500,
                message: "Error :" + e.message,
            });
        }
    },
    getCompanies: async (req, res) => {
        try {
            const user_id = req.params.user_id;
            console.log("user_id", user_id);
            const companies = await getCompanies(user_id);
            console.log("companies", companies);

            return res.json({
                status: 200,
                message: "Companies",
                data: companies
            });
        } catch (e) {
            return res.json({
                status: 500,
                message: "Error :" + e.message,
            });
        }
    },
    getCategories: async (req, res) => {
        try {
            const company_id = req.params.company_id;
            console.log("company_id", company_id);
            const categories = await getCategories(company_id);
            console.log("categories", categories);

            return res.json({
                status: 200,
                message: "Categories",
                data: categories
            });
        } catch (e) {
            return res.json({
                status: 500,
                message: "Error :" + e.message,
            });
        }
    },
    getCategoriesForDashboard: async (req, res) => {
        try {
            const company_id = req.params.company_id;
            console.log("company_id", company_id);
            const categories = await getCategoriesForDashboard(company_id);
            console.log("categories", categories);

            return res.json({
                status: 200,
                message: "Categories",
                data: categories
            });
        } catch (e) {
            return res.json({
                status: 500,
                message: "Error :" + e.message,
            });
        }
    },
    getCategoriesForUserCreation: async (req, res) => {
        try {
            const company_id = req.params.company_id;
            console.log("company_id", company_id);
            const categories = await getCategoriesForUserCreation(company_id);
            console.log("categories", categories);

            return res.json({
                status: 200,
                message: "Categories",
                data: categories
            });
        } catch (e) {
            return res.json({
                status: 500,
                message: "Error :" + e.message,
            });
        }
    },
    getSuppliers: async (req, res) => {
        try {
            const company_id = req.params.company_id;
            console.log("company_id", company_id);
            const suppliers = await getSuppliers(company_id);
            console.log("suppliers", suppliers);

            return res.json({
                status: 200,
                message: "Suppliers",
                data: suppliers
            });
        } catch (e) {
            return res.json({
                status: 500,
                message: "Error :" + e.message,
            });
        }
    },
    getUsers: async (req, res) => {
        try {
            const company_id = req.params.company_id;
            console.log("company_id", company_id);
            const users = await getUsers(company_id);
            console.log("users", users);

            return res.json({
                status: 200,
                message: "Users",
                data: users
            });
        } catch (e) {
            return res.json({
                status: 500,
                message: "Error :" + e.message,
            });
        }
    },
    getExpenses: async (req, res) => {
        try {
            const company_id = req.params.company_id;
            const company_type = req.params.company_type;
            console.log("company_id", company_id);
            console.log("company_type", company_type);
            let expenses = null;
            if (company_type === "xero") {
                expenses = await getExpenses(company_id);
                console.log("expenses", expenses);
            } else {
                expenses = await getExpenses(company_id);
                console.log("expenses", expenses);
            }

            return res.json({
                status: 200,
                message: "Expenses",
                data: expenses
            });
        } catch (e) {
            return res.json({
                status: 500,
                message: "Error :" + e.message,
            });
        }
    },
    getAttachables: async (req, res) => {
        try {
            const company_id = req.params.company_id;
            const attachables = await getAttachables(company_id);
            console.log("attachables", attachables);
            return res.json({
                status: 200,
                message: "Attachables",
                data: attachables
            });
        } catch (e) {
            return res.json({
                status: 500,
                message: "Error :" + e.message,
            });
        }
    },
    activateCompany: async (req, res) => {
        try {
            const company_id = req.params.company_id;
            const user_id = req.params.user_id;

            const company = await getCompanyByID(company_id);

            const disableAllCompanyResult = await disableAllCompany(user_id);
            const activateCompanyResult = await activateCompany(company_id);

            console.log("companydata", company[0]);
            return res.json({
                status: 200,
                message: `${company[0].company_name} is activated`,
                company_data: company[0]
            })
        } catch (e) {
            return res.json({
                status: 500,
                message: "Error :" + e.message,
            });
        }
    },
    getLastSyncedActivity: async (req, res) => {
        try {
            const company_id = req.params.company_id;
            const type = req.params.type;

            const lastSyncData = await getLastSyncedActivity(company_id, type);
            return res.json({
                status: 200,
                data: lastSyncData[0],
            })
        } catch (e) {
            return res.json({
                status: 500,
                message: "Error :" + e.message,
            });
        }
    }
};