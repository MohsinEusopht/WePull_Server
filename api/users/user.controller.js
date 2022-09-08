const {hashSync,genSaltSync,compareSync} = require("bcrypt");
const crypto = require('crypto');
const nodeMailer = require("nodemailer");
const {supplierCount} = require("./user.service");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
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
    getCategoriesForUserDashboard,
    getUserAssignedCategoriesByUserID,
    getSuppliers,
    getUsers,
    getUserAssignedCategories,
    getExpenses,
    getExpensesByCategoryID,
    getUserExpenses,
    getAttachables,
    disableAllCompany,
    activateCompany,
    getLastSyncedActivity,
    checkUserEmail,
    createUser,
    createUserRole,
    setTokenForFirstTimeLogin,
    storeSubscription,
    deleteUserRelationsByUserId,
    deleteUserByID,
    deleteUserSubscription,
    checkSetupAccount,
    updateAccountInformation,
    getUserById,
    deactivate,
    getSubscription,
    updateStatusOfSubscription,
    activate
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
                getUserData[0].password = getUserData[0].password.replace(/^\$2y(.+)$/i, '$2a$1');
                const result = compareSync(body.password, getUserData[0].password);

                if (result) {
                    getUserData[0].password = undefined;
                    const getCompany = await getCompanyByID(getUserData[0].company_id);

                    const json_token = sign({result: getUserData[0]}, process.env.JWT_KEY);
                    return res.json({
                        status: 200,
                        message: "login successfully",
                        token: json_token,
                        data: getUserData[0],
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
    getCategoriesForUserDashboard: async (req, res) => {
        try {
            const company_id = req.params.company_id;
            const user_id = req.params.user_id;
            console.log("company_id", company_id);
            console.log("user_id", user_id);
            const categories = await getCategoriesForUserDashboard(company_id, user_id);
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
    getUserAssignedCategoriesByUserID: async (req, res) => {
        try {
            const company_id = req.params.company_id;
            const user_id = req.params.user_id;
            console.log("company_id", company_id);
            console.log("user_id", user_id);
            const categories = await getUserAssignedCategoriesByUserID(company_id, user_id);
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
    getUserAssignedCategories: async (req, res) => {
        try {
            const company_id = req.params.company_id;
            console.log("company_id", company_id);
            const categories = await getUserAssignedCategories(company_id);
            console.log("assigned categories", categories);

            return res.json({
                status: 200,
                message: "Assigned Categories",
                data: categories
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
    getUserExpenses: async (req, res) => {
        try {
            const company_id = req.params.company_id;
            console.log("company_id", company_id);
            let expenses = await getUserExpenses(company_id);
            console.log("expenses", expenses);
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
    getExpensesByCategoryID: async (req, res) => {
        try {
            const company_id = req.params.company_id;
            const category_id = req.params.category_id;
            console.log("company_id", company_id);
            console.log("category_id", category_id);

            const categories = await getExpensesByCategoryID(company_id, category_id);
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
    },
    createUser: async (req, res) => {
        try {
            const body = req.body;
            const checkUserResult = await checkUserEmail(body.email);
            if(checkUserResult[0].user_count === 0) {
                const createUserResult = await createUser(body.email,body.role_id,body.company_id,body.category_ids,body.created_by,body.user_type);
                let user_id = createUserResult.insertId;
                for (let category of body.category_ids.split(',')){
                    console.log("category",category);
                    const createUserRoleResult = await createUserRole(user_id, body.company_id, category, body.role_id, body.created_by);
                }

                return res.json({
                    status: 200,
                    message: "User created, will be redirect to success or fail route",
                    user_id: user_id,
                    email: body.email
                });
            }
            else {
                return res.json({
                    status: 400,
                    message: 'User email already exist',
                });
            }
        } catch (e) {
            return res.json({
                status: 500,
                message: "Error :" + e.message,
            });
        }
    },
    userCreationSuccess: async (req, res) => {
        try {
            const company_id = req.params.company_id;
            const user_id = req.params.user_id;
            const email = req.params.email;
            const selected_plan = req.params.selected_plan;

            const token = crypto.randomBytes(48).toString('hex');
            console.log("token for user", token);
            const result = setTokenForFirstTimeLogin(user_id, token);

            let amount = selected_plan==="monthly"?999:9588;

            const customers = await stripe.customers.list();
            console.log('customers',customers.data);
            await customers.data.map(async (customer) => {
                if(customer.email === email) {
                    console.log("customer is", customer);
                    const subscriptions = await stripe.subscriptions.list();
                    await subscriptions.data.map(async (subscription) => {
                        if(customer.id === subscription.customer) {
                            console.log("subscription id",subscription.id);
                            const createSubscriptionResult = await storeSubscription(user_id, company_id, customer.id,subscription.id, amount, selected_plan);
                            console.log("subscription created",createSubscriptionResult.insertId);
                        }
                    });
                }
            });

            let setup_account_url = process.env.APP_URL+"setup/account/"+email+"/"+token;
            let html = "<html><head></head><body style='background-color: #eaeaea;padding-top: 30px;padding-bottom: 30px'><div style='width: 50%;margin-left:auto;margin-right:auto;margin-top: 30px;margin-bottom: 30px;margin-top:20px;border-radius: 5px;background-color: white;height: 100%;padding-bottom: 30px;overflow: hidden'><div style='background-color: white;padding-top: 20px;padding-bottom: 20px;width: 100%;text-align: center'><img src='https://wepull.netlify.app/finalLogo.png' width='100px' style='margin: auto'/></div><hr/><h1 style='text-align: center'>You are invited!</h1><p style='padding-left: 10px;padding-right: 10px'>Hi,<br/><br/>You are invited to join WePull. Click on the button below to set a password for your account.<br/><br/><a href='"+setup_account_url+"' style='text-decoration: none;width: 100%'><button style='border-radius: 5px;background-color: #1a2956;color:white;border: none;margin-left: auto;margin-right: auto;padding:10px;cursor: pointer'>Accept Invitation</button></a><br/><br/>Our team is always here to help. If you have any questions or need further assistance, contact us via email at support@wepull.io</p></div></body></html>"
            let transporter = nodeMailer.createTransport({
                host: "smtp.mail.yahoo.com",
                port: 465,
                auth: {
                    user: "mohsinjaved414@yahoo.com",
                    pass: "exvnhtussrqkmqcr"
                },
                debug: true, // show debug output
                logger: true
            });
            let mailOptions = {
                from: 'WePull Support <mohsinjaved414@yahoo.com>',
                to: email,
                subject: 'WePull Account Creation',
                html: html
            };
            await transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.log("err",err)
                    return res.json({
                        "status": "200",
                        "message": "User created successfully, Email Failed"
                    });
                } else {
                    return res.json({
                        status: 200,
                        message: "User created successfully",
                        user_id: user_id,
                    });
                }
            });
        } catch (e) {
            return res.json({
                status: 500,
                message: "Error :" + e.message,
            });
        }
    },
    userCreationFailed: async (req, res) => {
        try {
            const user_id = req.params.user_id;
            console.log("user failed", user_id)

            const deleteUserRelationsByUserIdResponse = await deleteUserRelationsByUserId(user_id);
            const deleteUserByIdResponse = await deleteUserByID(user_id);

            return res.json({
                status: 200,
                message: 'User deleted',
            });
        } catch (e) {
            return res.json({
                status: 500,
                message: "Error :" + e.message,
            });
        }
    },
    checkSetupAccount: async (req, res) => {
        try {
            const email = req.params.email;
            const token = req.params.token;
            const record = await checkSetupAccount(token, email);
            console.log("checkSetupAccount",record);
            return res.json({
                success: 1,
                data: record[0].count
            });
        } catch (e) {
            return res.json({
                status: 500,
                message: "Error :" + e.message,
            });
        }
    },
    updateAccountInformation: async (req, res) => {
        try {
            const body = req.body;
            console.log("stup",body);
            const salt = genSaltSync(10);
            let encrypted_password = hashSync(body.password, salt);
            const updateSetupAccountResult = await updateAccountInformation(body.email,body.first_name,body.last_name, body.contact, encrypted_password);

            return res.json({
                status: 200,
                message: "Account setup completed! We're redirecting you to login page to login your account.",
            });
        } catch (e) {
            return res.json({
                status: 500,
                message: "Error :" + e.message,
            });
        }
    },
    deactivate: async(req, res) => {
        try {
            const id = req.params.id;
            const user = await deactivate(id);

            const getSubscriptionResult = await getSubscription(id);

            const subscription = await stripe.subscriptions.update(
                getSubscriptionResult[0].subscription_id,
                {pause_collection: {behavior: 'void'}}
            );

            const updateStatusOfSubscriptionResult = await updateStatusOfSubscription('paused', id);

            console.log("subscription pause",subscription);

            return res.json({
                status: 200,
                message: "User deactivated successfully"
            });
        } catch (e) {
            return res.status(404).json({
                status: 500,
                message: "Error :" + e.message,
            });
        }
    },
    activate: async(req, res) => {
        try {
            const id = req.params.id;
            const user = await activate(id);

            const getSubscriptionResult = await getSubscription(id);

            const subscription = await stripe.subscriptions.update(
                getSubscriptionResult[0].subscription_id,
                {
                    pause_collection: '',
                }
            );

            const updateStatusOfSubscriptionResult = await updateStatusOfSubscription('active', id);

            console.log("subscription activated",subscription);

            return res.json({
                status: 200,
                message: "User activated successfully"
            });
        } catch (e) {
            return res.status(404).json({
                status: 500,
                message: "Error :" + e.message,
            });
        }
    },
    hardDeleteUser: async(req, res) => {
        try {
            const id = req.params.id;
            const getSubscriptionResult = await getSubscription(id);

            console.log("getSubscriptionResult",getSubscriptionResult[0].subscription_id);
            const deleted = await stripe.subscriptions.del(
                getSubscriptionResult[0].subscription_id
            );

            console.log("subscription deleted",deleted);

            const deleteUserRelationsResult = await deleteUserRelationsByUserId(id);
            const hardDeleteUserResult = await deleteUserByID(id);
            const deleteUserSubscriptionResult = await deleteUserSubscription(id);

            return res.json({
                status: 200,
                message: "User deleted successfully"
            });
        } catch (e) {
            return res.status(404).json({
                status: 500,
                message: "Error :" + e.message,
            });
        }
    }
};