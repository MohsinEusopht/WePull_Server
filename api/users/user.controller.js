const {hashSync,genSaltSync,compareSync} = require("bcrypt");
const crypto = require('crypto');
const nodeMailer = require("nodemailer");
const {supplierCount} = require("./user.service");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const {subject, template} = require('../assets/mailConfig');
const moment = require('moment');
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
    activate,
    getSubscriptionByUserID,
    updateUser,
    updateUserProfile,
    deleteAllUserRelation,
    changeUserPassword,
    insertForgotPasswordToken,
    updateForgotPasswordToken,
    checkForgotPasswordTokenWithToken,
    checkForgotPasswordToken,
    removeForgotPasswordToken,
    checkSubscription,
    updateSubscription,
    updateUserPlan
} = require("./user.service");
const { sign } = require("jsonwebtoken");

async function sendEmail(email, first_name, href) {
    try {
        console.log("sending email to", email);
        let transporter = await nodeMailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // use SSL
            auth: {
                user: "no-reply@wepull.io",
                pass: "hpnxtbitpndrxbfv"
            },
            debug: true, // show debug output
            logger: true
        });
        let html = await template("forgot_password", first_name, href);
        let mailOptions = {
            from: 'mohsinjaved414@yahoo.com',
            to: email,
            subject: subject.forgot_password,
            html: html
        }

        await transporter.sendMail(mailOptions);

        return {
            status: 200,
            message: "Email sent successfully"
        };
    }
    catch (err) {
        return {
            status: 500,
            message: err
        };
    }
}

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
            if (getUserData[0]) {
                getUserData[0].password = getUserData[0].password.replace(/^\$2y(.+)$/i, '$2a$1');
                const result = compareSync(body.password, getUserData[0].password);
                if (result) {
                    if(getUserData[0].status === 1) {
                        const getSubscription = await getSubscriptionByUserID(getUserData[0].id);
                        // const subscription = await stripe.subscriptions.retrieve(
                        //     getSubscription[0].subscription_id
                        // );
                        // console.log("user subscription",subscription.status);
                        // if(subscription.status === "active") {
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

                        // }
                        // else {
                        //     return res.json({
                        //         status: 500,
                        //         message: "User subscription expired, Please contact your company admin"
                        //     });
                        // }
                    }
                    else {
                        return res.json({
                            status: 500,
                            message: "Account has been deactivated, Please contact your company admin"
                        });
                    }
                } else {
                    return res.json({
                        status: 500,
                        message: "Invalid email or password"
                    });
                }
            } else {
                return res.json({
                    status: 500,
                    message: "Invalid email or password"
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
    forgotPassword: async (req, res) => {
        try {
            const body = req.body;
            const getUserData = await getUserByEmail(body.email);
            if (getUserData[0]) {
                const token = crypto.randomBytes(48).toString('hex');
                const checkIfForgotTokenExist = await checkForgotPasswordToken(body.email)
                if(checkIfForgotTokenExist[0].token_count === 0) {
                    const result = insertForgotPasswordToken(body.email, token);
                    console.log("insertForgotPasswordToken");
                }
                else {
                    const result = updateForgotPasswordToken(body.email, token);
                    console.log("updateForgotPasswordToken");
                }

                let href = process.env.APP_URL+"reset-password/"+body.email+"/"+token;
                await sendEmail(body.email, getUserData[0].first_name, href);

                return res.json({
                    status: 200,
                    message: "Password reset link sent successfully"
                });
            } else {
                return res.json({
                    status: 500,
                    message: "Email do not exist"
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
    checkForgotPasswordToken: async (req, res) => {
        try {
            const body = req.body;
            const getUserData = await getUserByEmail(body.email);
            if (getUserData[0]) {
                const checkIfForgotTokenExist = await checkForgotPasswordTokenWithToken(body.email, body.token)
                if(checkIfForgotTokenExist[0].token_count === 1) {
                    return res.json({
                        status: 200,
                        message: "Password reset link is valid"
                    });
                }
                else {
                    return res.json({
                        status: 500,
                        message: "Password reset link is expired"
                    });
                }
            } else {
                return res.json({
                    status: 500,
                    message: "Email do not exist"
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
    resetUserPassword: async (req, res) => {
        const body = req.body;
        console.log("body",body);
        const getUserData = await getUserByEmail(body.email);
        if (getUserData[0]) {
            const salt = genSaltSync(10);
            let encrypted_password = hashSync(body.password, salt);
            const changePasswordResult = await changeUserPassword(getUserData[0].id,encrypted_password);
            const removeToken = await removeForgotPasswordToken(body.email);
            console.log("password reset", changePasswordResult);
            return res.json({
                status: 200,
                message: "Password reset successfully, please login your account with your new password",
            });
        }
        else {
            return res.json({
                status: 500,
                message: "User do not exist",
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
            // console.log("company_id", company_id);
            const categories = await getCategories(company_id);
            // console.log("categories", categories);

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
            // console.log("company_id", company_id);
            const categories = await getCategoriesForDashboard(company_id);
            // console.log("categories", categories);

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
            // console.log("company_id", company_id);
            const categories = await getCategoriesForUserCreation(company_id);
            // console.log("categories", categories);

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
            // console.log("categories", categories);

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
            // console.log("categories", categories);

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
            // console.log("categories", categories);

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
    updateUser: async (req, res) => {
        try {
            const body = req.body;
            console.log("body",body);
            const updateUsersResult = await updateUser(body.user_id,body.category_ids.toString());
            console.log("user updated", updateUsersResult);
            const deleteAllUserRelationResult = await deleteAllUserRelation(body.user_id, body.company_id);
            for (let category of body.category_ids.split(',')){
                console.log("category",category);
                const createUserRoleResult = await createUserRole(body.user_id, body.company_id, category, body.role_id, body.created_by);
            }

            return res.json({
                status: 200,
                message: "User updated successfully"
            });
        } catch (e) {
            return res.json({
                status: 500,
                message: "Error :" + e.message,
            });
        }
    },
    updateUserProfile: async (req, res) => {
        try {
            const body = req.body;
            console.log("body",body);
            const updateUsersResult = await updateUserProfile(body.user_id,body.first_name, body.last_name);
            console.log("user updated", updateUsersResult);
            const user = await getUserById(body.user_id);
            user[0].password = undefined;
            return res.json({
                status: 200,
                message: "Profile updated successfully",
                user: user[0]
            });
        } catch (e) {
            return res.json({
                status: 500,
                message: "Error :" + e.message,
            });
        }
    },
    changeUserPassword: async (req, res) => {
        try {
            const body = req.body;
            console.log("body",body);
            const getUserData = await getUserById(body.user_id);
            if (getUserData[0]) {
                getUserData[0].password = getUserData[0].password.replace(/^\$2y(.+)$/i, '$2a$1');
                const result = compareSync(body.current_password, getUserData[0].password);
                if (result) {
                    const salt = genSaltSync(10);
                    let encrypted_password = hashSync(body.password, salt);
                    const changePasswordResult = await changeUserPassword(body.user_id,encrypted_password);
                    console.log("password changed", changePasswordResult);
                    return res.json({
                        status: 200,
                        message: "Password changed successfully",
                    });
                }
                else {
                    return res.json({
                        status: 500,
                        message: "Current password do not match",
                    });
                }
            }
            else {
                return res.json({
                    status: 500,
                    message: "User do not exist",
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
            const {company_id, user_id, email, selected_plan, customer_id, subscription_id, quantity} = req.body;

            console.log("userCreationSuccess body", req.body);
            const token = crypto.randomBytes(48).toString('hex');

            const result = await setTokenForFirstTimeLogin(user_id, token);
            console.log("result",result)
            const updateUserPlanResult = await updateUserPlan(user_id, selected_plan);
            console.log("updateUserPlanResult",updateUserPlanResult)

            let amount = selected_plan==="monthly"?999:9588;
            const checkSubscriptionResponse = await checkSubscription(customer_id, subscription_id, company_id);
            console.log("checkSubscriptionResponse",checkSubscriptionResponse);
            if(checkSubscriptionResponse[0].subscription_count === 0) {
                const createSubscriptionResult = await storeSubscription(company_id, customer_id, subscription_id, amount, selected_plan, quantity);
                console.log("subscription created",createSubscriptionResult.insertId);
            }
            else {
                const updateSubscriptionResult = await updateSubscription(company_id, customer_id, subscription_id, quantity);
                console.log("subscription updated",updateSubscriptionResult);
            }


            let setup_account_url = process.env.APP_URL+"setup/account/"+email+"/"+token;
            let html = "<html><head></head><body style='background-color: #eaeaea;padding-top: 30px;padding-bottom: 30px'><div style='width: 50%;margin-left:auto;margin-right:auto;margin-top: 30px;margin-bottom: 30px;margin-top:20px;border-radius: 5px;background-color: white;height: 100%;padding-bottom: 30px;overflow: hidden'><div style='background-color: white;padding-top: 20px;padding-bottom: 20px;width: 100%;text-align: center'><img src='https://wepull.netlify.app/finalLogo.png' width='100px' style='margin: auto'/></div><hr/><h1 style='text-align: center'>You are invited!</h1><p style='padding-left: 10px;padding-right: 10px'>Hi,<br/><br/>You are invited to join WePull. Click on the button below to set a password for your account.<br/><br/><a href='"+setup_account_url+"' style='text-decoration: none;width: 100%'><button style='border-radius: 5px;background-color: #1a2956;color:white;border: none;margin-left: auto;margin-right: auto;padding:10px;cursor: pointer'>Accept Invitation</button></a><br/><br/>Our team is always here to help. If you have any questions or need further assistance, contact us via email at support@wepull.io</p></div></body></html>"
            let transporter = nodeMailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true, // use SSL
                auth: {
                    user: "no-reply@wepull.io",
                    pass: "hpnxtbitpndrxbfv"
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
            console.log("error while success", e)
            return res.json({
                status: 500,
                message: "Error :" + e.message,
            });
        }
    },
    // userCreationSuccess: async (req, res) => {
    //     try {
    //         const company_id = req.params.company_id;
    //         const user_id = req.params.user_id;
    //         const email = req.params.email;
    //         const selected_plan = req.params.selected_plan;
    //
    //         const token = crypto.randomBytes(48).toString('hex');
    //         console.log("token for user", token);
    //         const result = setTokenForFirstTimeLogin(user_id, token);
    //
    //         let amount = selected_plan==="monthly"?999:9588;
    //
    //         const customers = await stripe.customers.list();
    //         console.log('customers',customers.data);
    //         await customers.data.map(async (customer) => {
    //             if(customer.email === email) {
    //                 console.log("customer is", customer);
    //                 const subscriptions = await stripe.subscriptions.list();
    //                 await subscriptions.data.map(async (subscription) => {
    //                     if(customer.id === subscription.customer) {
    //                         console.log("subscription id",subscription.id);
    //                         const createSubscriptionResult = await storeSubscription(user_id, company_id, customer.id,subscription.id, amount, selected_plan);
    //                         console.log("subscription created",createSubscriptionResult.insertId);
    //                     }
    //                 });
    //             }
    //         });
    //
    //         let setup_account_url = process.env.APP_URL+"setup/account/"+email+"/"+token;
    //         let html = "<html><head></head><body style='background-color: #eaeaea;padding-top: 30px;padding-bottom: 30px'><div style='width: 50%;margin-left:auto;margin-right:auto;margin-top: 30px;margin-bottom: 30px;margin-top:20px;border-radius: 5px;background-color: white;height: 100%;padding-bottom: 30px;overflow: hidden'><div style='background-color: white;padding-top: 20px;padding-bottom: 20px;width: 100%;text-align: center'><img src='https://wepull.netlify.app/finalLogo.png' width='100px' style='margin: auto'/></div><hr/><h1 style='text-align: center'>You are invited!</h1><p style='padding-left: 10px;padding-right: 10px'>Hi,<br/><br/>You are invited to join WePull. Click on the button below to set a password for your account.<br/><br/><a href='"+setup_account_url+"' style='text-decoration: none;width: 100%'><button style='border-radius: 5px;background-color: #1a2956;color:white;border: none;margin-left: auto;margin-right: auto;padding:10px;cursor: pointer'>Accept Invitation</button></a><br/><br/>Our team is always here to help. If you have any questions or need further assistance, contact us via email at support@wepull.io</p></div></body></html>"
    //         let transporter = nodeMailer.createTransport({
    //             host: "smtp.mail.yahoo.com",
    //             port: 465,
    //             auth: {
    //                 user: "mohsinjaved414@yahoo.com",
    //                 pass: "exvnhtussrqkmqcr"
    //             },
    //             debug: true, // show debug output
    //             logger: true
    //         });
    //         let mailOptions = {
    //             from: 'WePull Support <mohsinjaved414@yahoo.com>',
    //             to: email,
    //             subject: 'WePull Account Creation',
    //             html: html
    //         };
    //         await transporter.sendMail(mailOptions, (err, info) => {
    //             if (err) {
    //                 console.log("err",err)
    //                 return res.json({
    //                     "status": "200",
    //                     "message": "User created successfully, Email Failed"
    //                 });
    //             } else {
    //                 return res.json({
    //                     status: 200,
    //                     message: "User created successfully",
    //                     user_id: user_id,
    //                 });
    //             }
    //         });
    //     } catch (e) {
    //         return res.json({
    //             status: 500,
    //             message: "Error :" + e.message,
    //         });
    //     }
    // },
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
            const company_id = req.params.company_id;
            const plan = req.params.plan;

            const user = await deactivate(id);

            const getSubscriptionResult = await getSubscription(company_id, plan);
            let quantity = parseInt(getSubscriptionResult[0].quantity) - 1;
            console.log("new quantity",quantity);
            console.log("getSubscriptionResult",getSubscriptionResult[0].subscription_id);
            const updateSubscriptionQuantity = await stripe.subscriptions.update(getSubscriptionResult[0].subscription_id, {
                quantity: quantity
            });

            const updateSubscriptionResult = await updateSubscription(company_id, getSubscriptionResult[0].customer_id, getSubscriptionResult[0].subscription_id, quantity);
            console.log("subscription updated",updateSubscriptionResult);

            return res.json({
                status: 200,
                message: "User deactivated successfully"
            });
        } catch (e) {
            return res.json({
                status: 500,
                message: "Error :" + e.message,
            });
        }
    },
    activate: async(req, res) => {
        try {
            const id = req.params.id;
            const user = await activate(id);
            const company_id = req.params.company_id;
            const plan = req.params.plan;

            const getSubscriptionResult = await getSubscription(company_id, plan);
            let quantity = +parseInt(getSubscriptionResult[0].quantity) + +1;
            console.log("new quantity",quantity);
            console.log("getSubscriptionResult",getSubscriptionResult[0].subscription_id);
            const updateSubscriptionQuantity = await stripe.subscriptions.update(getSubscriptionResult[0].subscription_id, {
                quantity: quantity
            });

            const updateSubscriptionResult = await updateSubscription(company_id, getSubscriptionResult[0].customer_id, getSubscriptionResult[0].subscription_id, quantity);
            console.log("subscription updated",updateSubscriptionResult);

            return res.json({
                status: 200,
                message: "User activated successfully"
            });
        } catch (e) {
            return res.json({
                status: 500,
                message: "Error :" + e.message,
            });
        }
    },
    hardDeleteUser: async(req, res) => {
        try {
            const id = req.params.id;
            const company_id = req.params.company_id;
            const plan = req.params.plan;

            const getSubscriptionResult = await getSubscription(company_id, plan);
            let quantity = parseInt(getSubscriptionResult[0].quantity) - 1;
            console.log("new quantity",quantity);
            console.log("getSubscriptionResult",getSubscriptionResult[0].subscription_id);
            const updateSubscriptionQuantity = await stripe.subscriptions.update(getSubscriptionResult[0].subscription_id, {
                    quantity: quantity
            });

            const updateSubscriptionResult = await updateSubscription(company_id, getSubscriptionResult[0].customer_id, getSubscriptionResult[0].subscription_id, quantity);
            console.log("subscription updated",updateSubscriptionResult);

            const deleteUserRelationsResult = await deleteUserRelationsByUserId(id);
            const hardDeleteUserResult = await deleteUserByID(id);
            // const deleteUserSubscriptionResult = await deleteUserSubscription(id);

            return res.json({
                status: 200,
                message: "User deleted successfully"
            });
        } catch (e) {
            return res.json({
                status: 500,
                message: "Error :" + e.message,
            });
        }
    },
    getUserByUserID: async (req, res) => {
        try {
            const user_id = req.params.user_id;
            const user = await getUserById(user_id);
            const subscription = await getSubscriptionByUserID(user_id);

            // user[0].password = undefined;
            console.log("getUserByUserID",user[0]);

            return res.json({
                status: 200,
                user: user[0].email,
                subscription: subscription[0].package_duration
            })
        } catch (e) {
            return res.status(404).json({
                status: 500,
                message: "Error :" + e.message,
            });
        }
    },
    subscribe: async (req, res) => {
        try {
            const {email, payment_method, plan} = req.body;

            const date = new Date();
            const nextMonthFirstDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
            const nextMonth = moment(nextMonthFirstDate).unix();
            console.log("nextMonthFirstDate",nextMonth)

            let price_id = "";
            if(plan === "monthly") {
                price_id = 'price_1LXMCYA94Y1iT6R5fFNpuQgw';
            }
            else {
                price_id = 'price_1LYTahA94Y1iT6R5NHXTQg8w';
            }

            console.log("selected plan is ",plan);

            //Check if customer created or not
            let isCustomerCreated = false;
            let customer;
            const customers = await stripe.customers.list();
            await customers.data.map((el) => {
                if(el.email === email) {
                    isCustomerCreated = true;
                    customer = el;
                }
                else {
                    isCustomerCreated = false;
                }
            });

            console.log("isCustomerCreated",isCustomerCreated);

            if(!isCustomerCreated) {
                customer = await stripe.customers.create({
                    payment_method: payment_method,
                    email: email,
                    invoice_settings: {
                        default_payment_method: payment_method,
                    },
                });
            }
            console.log("customer",customer);
            console.log("customer id", customer.id);


            let isSubscriptionCreated = false;
            let subscription;


            subscription = await stripe.subscriptions.create({
                customer: customer.id,
                items: [{ price: price_id }],
                billing_cycle_anchor: nextMonth,
                expand: ['latest_invoice.payment_intent']
            });

            if(subscription) {
                console.log("subscription",subscription);
                const status = subscription.latest_invoice.payment_intent.status;
                const client_secret = subscription.latest_invoice.payment_intent.client_secret;
                res.json({'client_secret': client_secret, 'status': status});
            }
        }
        catch (e) {
            return res.json({
                status:500,
                message: e
            })
        }
    },
    subscribeCompany: async (req, res) => {
        try {
            //email = admin email
            const {email, payment_method, plan} = req.body;

            //create date to take payment on next month 1st day
            const date = new Date();
            const nextMonthFirstDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
            const nextMonth = moment(nextMonthFirstDate).unix();
            console.log("nextMonthFirstDate",nextMonth)

            //set price id of selected plan
            let price_id = "";
            if(plan === "monthly") {
                price_id = 'price_1LXMCYA94Y1iT6R5fFNpuQgw';
            }
            else {
                price_id = 'price_1LYTahA94Y1iT6R5NHXTQg8w';
            }

            //Check if customer created or not
            let isCustomerCreated = false;
            let customer;
            const customers = await stripe.customers.list();

            for (let i=0;i<customers.data.length;i++) {
                console.log("el.email",customers.data[i].email,"=== email",email)
                if(customers.data[i].email === email) {
                    console.log("customer exist");
                    isCustomerCreated = true;
                    //if customer already exist el = customer object
                    customer = customers.data[i];
                    break;
                }
                else {
                    console.log("customer not exist");
                    isCustomerCreated = false;
                }
            }

            console.log("isCustomerCreated",isCustomerCreated);
            if(!isCustomerCreated) {
                //create customer by admin email
                customer = await stripe.customers.create({
                    payment_method: payment_method,
                    email: email,
                    invoice_settings: {
                        default_payment_method: payment_method,
                    },
                });
            }

            console.log("email is ",email)
            console.log("selected plan is ",plan);
            console.log("selected plan price_id is ",price_id);
            console.log("customer is ",customer);

            let isSubscriptionCreated = false;
            let subscriptionResponse;
            let subscriptionStatus = "";

            const subscriptions = await stripe.subscriptions.list();
            for(let i=0;i<subscriptions.data.length;i++) {
                if (customer.id === subscriptions.data[i].customer) {
                    console.log("customer do exist in subscription")
                    //Check if any subscription created by admin email
                    if(subscriptions.data[i].items.data[0].price.id === price_id) {
                        subscriptionResponse = subscriptions.data[i];
                        subscriptionStatus = "customer price exist";
                        break;
                    }
                    else {
                        subscriptionStatus = "customer exist but price do not exist";
                        break;
                    }
                }
                else{
                    console.log("customer do not exist in subscription")
                    subscriptionStatus = "customer subscription do not exist";
                }
            }

            let subscriptionData;
            if(subscriptionStatus === "customer price exist") {
                console.log("final subscriptionStatus",subscriptionStatus);
                console.log("subscription", subscriptionResponse);
                console.log("subscriptions of customer ",customer.id);
                console.log("subscription exist for" ,plan);
                console.log("updating subscription quantity");
                //add quantity of plan
                let quantity =  +parseInt(subscriptionResponse.quantity) + +1;
                console.log("subscription",subscriptionResponse.id,"new quantity",quantity);
                //update quantity of subscription
                subscriptionData = await stripe.subscriptions.update(subscriptionResponse.id, {
                    quantity: quantity,
                    expand: ['latest_invoice.payment_intent']
                });
            }
            else if (subscriptionStatus === "customer exist but price do not exist") {
                console.log("final subscriptionStatus",subscriptionStatus);
                console.log("creating a subscription for" ,plan);
                subscriptionData = await stripe.subscriptions.create({
                    customer: customer.id,
                    items: [{ price: price_id }],
                    billing_cycle_anchor: nextMonth,
                    expand: ['latest_invoice.payment_intent']
                });
            }
            else if(subscriptionStatus === "customer subscription do not exist") {
                console.log("final subscriptionStatus",subscriptionStatus);
                console.log("creating a subscription for" ,plan);
                subscriptionData = await stripe.subscriptions.create({
                    customer: customer.id,
                    items: [{ price: price_id }],
                    billing_cycle_anchor: nextMonth,
                    expand: ['latest_invoice.payment_intent']
                });
            }


            // //iff subscription success
            if(subscriptionData) {
                console.log("subscription",subscriptionData);
                const status = subscriptionData.latest_invoice.payment_intent.status;
                const client_secret = subscriptionData.latest_invoice.payment_intent.client_secret;
                console.log({
                    'client_secret': client_secret,
                    'status': status,
                    'customer_id': customer.id,
                    'subscription_id': subscriptionData.id,
                    'quantity': subscriptionData.quantity
                });
                return res.json({
                    'client_secret': client_secret,
                    'status': status,
                    'customer_id': customer.id,
                    'subscription_id': subscriptionData.id,
                    'quantity': subscriptionData.quantity
                });
            }
            else{
                //error
                return res.json({
                    status:500,
                    message: "Something went wrong while creating subscription"
                })
            }
        }
        catch (e) {
            return res.json({
                status:500,
                message: "Went wrong"
            })
        }
    },
};