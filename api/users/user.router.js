const router = require("express").Router();
const { validateUserPermission } = require("../../permissions/user_permission");
const { validateAdminPermission } = require("../../permissions/admin_permission");
const {
    defaultFun,
    login,
    forgotPassword,
    auth_login,
    getRoles,
    getLoginToken,
    getUserCategories,
    getExpenses,
    getExpensesByCategoryID,
    getUserExpenses,
    getAttachables,
    getCompanies,
    getCategories,
    getCategoriesForDashboard,
    getCategoriesForUserCreation,
    getCategoriesForUserDashboard,
    getUserAssignedCategoriesByUserID,
    getSuppliers,
    getUsers,
    getUserAssignedCategories,
    activateCompany,
    getLastSyncedActivity,
    createUser,
    userCreationSuccess,
    userCreationFailed,
    checkSetupAccount,
    updateAccountInformation,
    deactivate,
    activate,
    hardDeleteUser,
    getUserByUserID,
    updateUser,
    updateUserProfile,
    changeUserPassword,
    subscribe,
    checkForgotPasswordToken,
    resetUserPassword
} = require("./user.controller");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const moment = require('moment');

router.get("/", defaultFun);

//Login
router.post("/login", login);

//Forgot password
router.post('/forgotPassword', forgotPassword);
router.post('/checkForgotPasswordToken', checkForgotPasswordToken);
router.post('/resetUserPassword', resetUserPassword)

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
router.get('/getCategoriesForUserDashboard/:company_id/:user_id', validateUserPermission, getCategoriesForUserDashboard);
router.get('/getUserAssignedCategoriesByUserID/:company_id/:user_id', validateUserPermission, getUserAssignedCategoriesByUserID);


//Get suppliers for supplier page
router.get("/getSuppliers/:company_id", getSuppliers);

//Get users for user page
router.get("/getUsers/:company_id", validateAdminPermission, getUsers);
router.get('/getUserAssignedCategories/:company_id', getUserAssignedCategories);
router.get("/getUserByUserID/:user_id", validateAdminPermission, getUserByUserID);


//Get expenses for expense page
router.get('/getExpenses/:company_type/:company_id', getExpenses)

router.get('/getExpensesByCategoryID/:company_id/:category_id', getExpensesByCategoryID);

router.get('/getUserExpenses/:company_id', getUserExpenses);

router.get('/getAttachables/:company_id', getAttachables);

//activate company
router.get('/company/activate/:company_id/:user_id', validateAdminPermission, activateCompany);

//getLastSyncedActivity
router.get('/getLastSyncedActivity/:company_id/:type', getLastSyncedActivity);

router.post('/subscribe', validateAdminPermission, subscribe)

router.get('/all_stripe_customers', async (req, res) => {
    const customers = await stripe.customers.list();
    return res.json(customers.data);
})

router.post("/createUser",validateAdminPermission, createUser);
router.get("/user/creation/success/:company_id/:user_id/:email/:selected_plan", validateAdminPermission, userCreationSuccess);
router.get("/user/creation/failed/:user_id", validateAdminPermission, userCreationFailed);
router.get("/checkSetupAccount/:email/:token", checkSetupAccount);
router.post("/updateAccountInformation", updateAccountInformation);
router.get('/deactivate/:id',validateAdminPermission, deactivate);
router.get('/activate/:id',validateAdminPermission, activate);
router.get('/hardDeleteUser/:id',validateAdminPermission, hardDeleteUser);
router.post('/updateUser', validateAdminPermission, updateUser);

router.post('/updateUserProfile', validateUserPermission, updateUserProfile);
router.post('/changeUserPassword', validateUserPermission, changeUserPassword)
module.exports = router;