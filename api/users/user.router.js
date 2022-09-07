const router = require("express").Router();
const { validateUserPermission } = require("../../permissions/user_permission");
const { validateAdminPermission } = require("../../permissions/admin_permission");
const {
    defaultFun,
    login,
    auth_login,
    getRoles,
    getLoginToken,
    getUserCategories,
    getExpenses,
    getExpensesByCategoryID,
    getAttachables,
    getCompanies,
    getCategories,
    getCategoriesForDashboard,
    getCategoriesForUserCreation,
    getSuppliers,
    getUsers,
    activateCompany,
    getLastSyncedActivity,
    createUser,
    userCreationSuccess,
    userCreationFailed,
    checkSetupAccount
} = require("./user.controller");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const moment = require('moment');

router.get("/", defaultFun);

//Login
router.post("/login", login);

//Xero , QB login
router.post("/auth_login", auth_login);

//Get user login token
router.get("/getLoginToken/:email", getLoginToken);

//Get all roles from database
router.get("/getRoles", validateAdminPermission, getRoles);

router.get("/getUserCategories/:id", validateUserPermission, getUserCategories);

//Get company for companies page
router.get("/getCompanies/:user_id", validateAdminPermission, getCompanies);

//Get categories for category page
router.get("/getCategories/:company_id", validateAdminPermission, getCategories);
router.get("/getCategoriesForDashboard/:company_id", validateAdminPermission, getCategoriesForDashboard);
router.get("/getCategoriesForUserCreation/:company_id", validateAdminPermission, getCategoriesForUserCreation);


//Get suppliers for supplier page
router.get("/getSuppliers/:company_id", validateAdminPermission, getSuppliers);

//Get users for user page
router.get("/getUsers/:company_id", validateAdminPermission, getUsers);

//Get expenses for expense page
router.get('/getExpenses/:company_type/:company_id', getExpenses)

router.get('/getExpensesByCategoryID/:company_id/:category_id', getExpensesByCategoryID);

router.get('/getAttachables/:company_id', getAttachables);

//activate company
router.get('/company/activate/:company_id/:user_id', validateAdminPermission, activateCompany);

//getLastSyncedActivity
router.get('/getLastSyncedActivity/:company_id/:type', getLastSyncedActivity);

router.post('/subscribe', validateAdminPermission, async (req, res) => {
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

        const customer = await stripe.customers.create({
            payment_method: payment_method,
            email: email,
            invoice_settings: {
                default_payment_method: payment_method,
            },
        });

        console.log("customer created", customer.id);

        const subscription = await stripe.subscriptions.create({
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

})

router.post("/createUser",validateAdminPermission, createUser);
router.get("/user/creation/success/:user_id/:email", validateAdminPermission, userCreationSuccess);
router.get("/user/creation/failed/:user_id", validateAdminPermission, userCreationFailed);
router.get("/checkSetupAccount/:email/:token", checkSetupAccount);

module.exports = router;